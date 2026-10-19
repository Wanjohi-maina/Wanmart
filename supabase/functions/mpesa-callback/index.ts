import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { message: "Method not allowed." },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // Reject requests that don't carry the secret token in the URL.
    const expectedToken = Deno.env.get("MPESA_CALLBACK_TOKEN");
    const givenToken = new URL(req.url).searchParams.get("token");

    if (!expectedToken || givenToken !== expectedToken) {
      console.error("Callback rejected: missing or invalid token.");

      return Response.json(
        { message: "Forbidden." },
        { status: 403, headers: corsHeaders },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables.");

      return Response.json(
        { message: "Server configuration error." },
        { status: 500, headers: corsHeaders },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read the body defensively so a cut-off request cannot crash the function.
    let body: any;

    try {
      const raw = await req.text();

      console.log("Callback body received:", {
        contentLength: req.headers.get("content-length"),
        receivedLength: raw.length,
      });

      body = JSON.parse(raw);
    } catch (e) {
      console.error(
        "Callback body unreadable:",
        e instanceof Error ? e.message : "Unknown",
      );

      // Acknowledge so Safaricom does not keep retrying. The reconciler
      // resolves this order later using the STK Push Query.
      return Response.json(
        { ResultCode: 0, ResultDesc: "Callback received." },
        { headers: corsHeaders },
      );
    }

    const callback = body?.Body?.stkCallback;

    if (
      !callback ||
      typeof callback.CheckoutRequestID !== "string" ||
      typeof callback.ResultCode !== "number"
    ) {
      console.error("Invalid M-Pesa callback structure.");

      return Response.json(
        { message: "Invalid callback." },
        { status: 400, headers: corsHeaders },
      );
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDescription =
      typeof callback.ResultDesc === "string"
        ? callback.ResultDesc
        : null;

    // Create an audit record before processing the callback.
    // If logging fails, continue processing the payment safely.
    let auditId: number | null = null;

    const { data: audit, error: auditInsertError } = await supabase
      .from("mpesa_callback_logs")
      .insert({
        checkout_request_id: checkoutRequestId,
        result_code: resultCode,
        result_description: resultDescription,
        order_matched: false,
        processing_status: "received",
      })
      .select("id")
      .single();

    if (auditInsertError) {
      console.error("Could not create callback audit record:", {
        checkoutRequestId,
        message: auditInsertError.message,
      });
    } else {
      auditId = audit.id;
    }

    // Update the audit record whenever processing reaches an outcome.
    // Audit failures are logged but do not undo payment processing.
    async function updateAudit(
      status:
        | "ignored"
        | "validation_failed"
        | "processed"
        | "processing_failed",
      message: string,
      orderId?: string,
    ) {
      if (auditId === null) return;

      const { error } = await supabase
        .from("mpesa_callback_logs")
        .update({
          processing_status: status,
          processing_message: message,
          order_matched: Boolean(orderId),
          ...(orderId ? { order_id: orderId } : {}),
          processed_at: new Date().toISOString(),
        })
        .eq("id", auditId);

      if (error) {
        console.error("Could not update callback audit record:", {
          auditId,
          message: error.message,
        });
      }
    }

    // Find the order associated with this STK Push request.
    const { data: order, error: lookupError } = await supabase
      .from("orders")
      .select(
        "id, total, payment_method, payment_status, inventory_status",
      )
      .eq("mpesa_checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (lookupError) {
      console.error("Order lookup failed:", lookupError.message);

      await updateAudit(
        "processing_failed",
        "Could not look up the order.",
      );

      return Response.json(
        { message: "Could not look up order." },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!order) {
      console.error(
        "No order found for CheckoutRequestID:",
        checkoutRequestId,
      );

      await updateAudit(
        "ignored",
        "No order matched this checkout request ID.",
      );

      // Acknowledge unknown callbacks without changing an order.
      return Response.json(
        { ResultCode: 0, ResultDesc: "Callback received." },
        { headers: corsHeaders },
      );
    }

    await updateAudit(
      "received",
      "Callback matched an order.",
      order.id,
    );

    console.log("M-Pesa callback matched order:", {
      orderId: order.id,
      checkoutRequestId,
      resultCode,
      paymentStatus: order.payment_status,
      inventoryStatus: order.inventory_status,
    });

    if (order.payment_method !== "mpesa") {
      console.error("Callback matched a non-M-Pesa order:", order.id);

      await updateAudit(
        "ignored",
        "Matched order does not use M-Pesa.",
        order.id,
      );

      return Response.json(
        { ResultCode: 0, ResultDesc: "Callback received." },
        { headers: corsHeaders },
      );
    }

    // ResultCode 0 indicates a successful STK transaction.
    if (resultCode === 0) {
      const items = callback.CallbackMetadata?.Item;

      if (!Array.isArray(items)) {
        console.error(
          "Successful callback is missing payment metadata.",
        );

        await updateAudit(
          "validation_failed",
          "Successful callback is missing payment metadata.",
          order.id,
        );

        return Response.json(
          { ResultCode: 0, ResultDesc: "Callback received." },
          { headers: corsHeaders },
        );
      }

      // Find values by name rather than relying on array positions.
      const receiptItem = items.find(
        (item: { Name?: string }) =>
          item.Name === "MpesaReceiptNumber",
      );

      const amountItem = items.find(
        (item: { Name?: string }) => item.Name === "Amount",
      );

      const receipt = receiptItem?.Value;
      const amount = Number(amountItem?.Value);

      if (
        typeof receipt !== "string" ||
        receipt.trim() === "" ||
        amountItem?.Value == null ||
        !Number.isFinite(amount)
      ) {
        console.error(
          "Callback is missing a valid receipt or amount.",
        );

        await updateAudit(
          "validation_failed",
          "Callback is missing a valid receipt or amount.",
          order.id,
        );

        return Response.json(
          { ResultCode: 0, ResultDesc: "Callback received." },
          { headers: corsHeaders },
        );
      }

      // Do not confirm an order if the amount does not match.
      if (amount !== Number(order.total)) {
        console.error("M-Pesa amount mismatch:", {
          orderId: order.id,
          expectedAmount: Number(order.total),
          receivedAmount: amount,
        });

        await updateAudit(
          "validation_failed",
          "Received amount does not match the order total.",
          order.id,
        );

        return Response.json(
          { ResultCode: 0, ResultDesc: "Callback received." },
          { headers: corsHeaders },
        );
      }

      // Confirm payment through the existing SQL function.
      const { error: paymentError } = await supabase.rpc(
        "confirm_payment",
        {
          p_order_id: order.id,
          p_provider: "mpesa",
          p_reference: receipt.trim(),
        },
      );

      if (paymentError) {
        console.error("Payment confirmation failed:", {
          orderId: order.id,
          message: paymentError.message,
        });

        await updateAudit(
          "processing_failed",
          `confirm_payment failed: ${paymentError.message}`,
          order.id,
        );

        return Response.json(
          { message: "Payment processing failed." },
          { status: 500, headers: corsHeaders },
        );
      }

      await updateAudit(
        "processed",
        "Successful callback validated and payment confirmation RPC completed.",
        order.id,
      );

      // Do not log the receipt number.
      console.log("M-Pesa payment processed:", {
        orderId: order.id,
        checkoutRequestId,
      });
    } else {
      // Never let a failure callback undo an already-paid order.
      if (
        order.payment_status === "unpaid" &&
        order.inventory_status === "reserved"
      ) {
        const { error: failureError } = await supabase.rpc(
          "fail_payment",
          { p_order_id: order.id },
        );

        if (failureError) {
          console.error("Payment failure processing failed:", {
            orderId: order.id,
            message: failureError.message,
          });

          await updateAudit(
            "processing_failed",
            `fail_payment failed: ${failureError.message}`,
            order.id,
          );

          return Response.json(
            { message: "Payment processing failed." },
            { status: 500, headers: corsHeaders },
          );
        }

        await updateAudit(
          "processed",
          `Payment failed or was cancelled. Result code: ${resultCode}.`,
          order.id,
        );

        console.log("M-Pesa payment failed or was cancelled:", {
          orderId: order.id,
          resultCode,
          resultDescription,
        });
      } else {
        await updateAudit(
          "ignored",
          "Failure callback did not change the order because it was no longer awaiting payment with reserved stock.",
          order.id,
        );

        console.log("Failure callback did not change order:", {
          orderId: order.id,
          paymentStatus: order.payment_status,
          inventoryStatus: order.inventory_status,
        });
      }
    }

    return Response.json(
      { ResultCode: 0, ResultDesc: "Callback received." },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(
      "M-Pesa callback processing error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return Response.json(
      { message: "Callback processing failed." },
      { status: 500, headers: corsHeaders },
    );
  }
});