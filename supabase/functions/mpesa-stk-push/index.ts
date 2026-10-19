
import { createClient } from "@supabase/supabase-js";

// Allow requests from your frontend.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Use the sandbox environment while developing.
const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

// Convert a Kenyan mobile number to the format required by Daraja.
function formatKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  if (
    (digits.startsWith("07") || digits.startsWith("01")) &&
    digits.length === 10
  ) {
    return `254${digits.slice(1)}`;
  }

  throw new Error("Invalid Kenyan phone number format.");
}

// Generate the Daraja timestamp using Nairobi time.
function getDarajaTimestamp(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return (
    values.year +
    values.month +
    values.day +
    values.hour +
    values.minute +
    values.second
  );
}

// Update initiation status without exposing database errors to customers.
async function updateInitiationStatus(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  status: "initiated" | "failed" | "unknown",
  checkoutRequestId?: string,
) {
  const update: {
    mpesa_initiation_status: string;
    mpesa_checkout_request_id?: string;
  } = {
    mpesa_initiation_status: status,
  };

  if (checkoutRequestId) {
    update.mpesa_checkout_request_id = checkoutRequestId;
  }

  const { error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .eq("mpesa_initiation_status", "initiating");

  if (error) {
    console.error("Unable to update M-Pesa initiation status.");
    return false;
  }

  return true;
}

Deno.serve(async (req: Request) => {
  // Handle browser CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests.
  if (req.method !== "POST") {
    return Response.json(
      { success: false, message: "Method not allowed." },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // Read Supabase environment variables.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    // Read Daraja credentials from Supabase secrets.
    const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !consumerKey ||
      !consumerSecret ||
      !passkey ||
      !shortcode ||
      !callbackUrl
    ) {
      console.error("Required Supabase or Daraja secrets are missing.");

      return Response.json(
        { success: false, message: "Payment service is not configured." },
        { status: 500, headers: corsHeaders },
      );
    }

    // Create a trusted server-side Supabase client.
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read the order ID and access token from the frontend.
    const body = await req.json();
    const { orderId, accessToken } = body;

    if (
      typeof orderId !== "string" ||
      typeof accessToken !== "string" ||
      !orderId.trim() ||
      !accessToken.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Order ID and access token are required.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const cleanOrderId = orderId.trim();

    // Hash the access token using the same method as create_order().
    const tokenDigest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(accessToken.trim()),
    );

    const tokenHash = Array.from(new Uint8Array(tokenDigest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    // Verify the order access token before retrieving order details.
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("order_access_tokens")
      .select("token_hash")
      .eq("order_id", cleanOrderId)
      .maybeSingle();

    if (tokenError) {
      console.error("Order access verification lookup failed.");

      return Response.json(
        { success: false, message: "Unable to verify order access." },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!tokenRecord || tokenRecord.token_hash !== tokenHash) {
      return Response.json(
        {
          success: false,
          message: "Invalid order access credentials.",
        },
        { status: 403, headers: corsHeaders },
      );
    }

    // Retrieve the order after verifying the access token.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, total, phone, payment_method, payment_status, status, inventory_status, reservation_expires_at",
      )
      .eq("id", cleanOrderId)
      .maybeSingle();

    if (orderError) {
      console.error("Order lookup failed.");

      return Response.json(
        { success: false, message: "Unable to retrieve order." },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    // Confirm that this is an unpaid M-Pesa order.
    if (
      order.payment_method !== "mpesa" ||
      order.payment_status !== "unpaid" ||
      order.status !== "pending" ||
      order.inventory_status !== "reserved"
    ) {
      return Response.json(
        {
          success: false,
          message: "This order is not eligible for M-Pesa payment.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Confirm that the stock reservation is still active.
    if (
      !order.reservation_expires_at ||
      new Date(order.reservation_expires_at).getTime() <= Date.now()
    ) {
      return Response.json(
        {
          success: false,
          message: "The order's payment reservation has expired.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Daraja requires an integer amount in Kenyan shillings.
    const amount = Number(order.total);

    if (!Number.isSafeInteger(amount) || amount < 1) {
      return Response.json(
        {
          success: false,
          message: "The order total must be a whole number of KES.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Validate the customer's phone number before claiming the order.
    let formattedPhone: string;

    try {
      formattedPhone = formatKenyanPhone(order.phone);
    } catch {
      return Response.json(
        {
          success: false,
          message: "The order has an invalid Kenyan phone number.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Atomically claim this order before contacting Safaricom.
    const { data: claimed, error: claimError } = await supabase.rpc(
      "claim_mpesa_initiation",
      { p_order_id: order.id },
    );

    if (claimError) {
      console.error("Unable to claim M-Pesa initiation.");

      return Response.json(
        {
          success: false,
          message: "Unable to start payment. Please contact support.",
        },
        { status: 500, headers: corsHeaders },
      );
    }

    if (claimed !== true) {
      return Response.json(
        {
          success: false,
          message:
            "Payment has already been started, or this order is no longer eligible.",
        },
        { status: 409, headers: corsHeaders },
      );
    }

    // Obtain a Daraja OAuth access token.
    let accessTokenFromDaraja: string;

    try {
      const credentials = btoa(`${consumerKey}:${consumerSecret}`);

      const tokenResponse = await fetch(
        `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          signal: AbortSignal.timeout(15000),
        },
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
      
        await updateInitiationStatus(
          supabase,
          order.id,
          "failed",
        );

        console.error("Daraja OAuth request was rejected.");

        return Response.json(
          {
            success: false,
            message: "Unable to connect to the payment service.",
          },
          { status: 502, headers: corsHeaders },
        );
      }

      accessTokenFromDaraja = tokenData.access_token;
    } catch {
      // The STK request has not been sent yet.
      await updateInitiationStatus(
        supabase,
        order.id,
        "failed",
      );

      console.error("Daraja OAuth request failed.");

      return Response.json(
        {
          success: false,
          message: "Unable to connect to the payment service.",
        },
        { status: 502, headers: corsHeaders },
      );
    }

    // Generate the password required by the STK Push API.
    const timestamp = getDarajaTimestamp();

    const password = btoa(
      `${shortcode}${passkey}${timestamp}`,
    );

    // Use a short reference that does not expose the full order ID.
    const accountReference =
      `Wan${order.id.replace(/-/g, "").slice(0, 9)}`;

    // Submit the STK Push request to Daraja.
    let stkResponse: Response;

    try {
      stkResponse = await fetch(
        `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessTokenFromDaraja}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: accountReference,
            TransactionDesc: "Wanmart order",
          }),
          signal: AbortSignal.timeout(20000),
        },
      );
    } catch {
     
      await updateInitiationStatus(
        supabase,
        order.id,
        "unknown",
      );

      console.error("STK Push outcome is uncertain.");

      return Response.json(
        {
          success: false,
          status: "unknown",
          message:
            "The payment request outcome is uncertain. Do not retry yet.",
        },
        { status: 502, headers: corsHeaders },
      );
    }

    // Read the response returned by Daraja.
    let stkData: Record<string, unknown>;

    try {
      stkData = await stkResponse.json();
    } catch {
      await updateInitiationStatus(
        supabase,
        order.id,
        "unknown",
      );

      console.error("Daraja returned an unreadable STK response.");

      return Response.json(
        {
          success: false,
          status: "unknown",
          message:
            "We could not confirm the payment request outcome. Do not retry yet.",
        },
        { status: 502, headers: corsHeaders },
      );
    }

     // Log safe, non-sensitive details from Daraja's response.
    console.log("Daraja STK response:", {
      httpStatus: stkResponse.status,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription,
      customerMessage: stkData.CustomerMessage,
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
    })

    // A non-zero response code indicates that the request was rejected.
    if (
      !stkResponse.ok ||
      String(stkData.ResponseCode ?? "") !== "0"
    ) {
      const rejectionSaved = await updateInitiationStatus(
        supabase,
        order.id,
        "failed",
      );

      if (!rejectionSaved) {
        console.error("Could not record the STK rejection.");
      }

      console.error("Daraja rejected the STK Push request.", {
        httpStatus: stkResponse.status,
        responseCode: stkData.ResponseCode,
      });

      return Response.json(
        {
          success: false,
          message: "Safaricom rejected the payment request.",
        },
        { status: 502, headers: corsHeaders },
      );
    }

    // An accepted response must include a checkout request ID.
    const checkoutRequestId = stkData.CheckoutRequestID;

    if (
      typeof checkoutRequestId !== "string" ||
      !checkoutRequestId.trim()
    ) {
      await updateInitiationStatus(
        supabase,
        order.id,
        "unknown",
      );

      console.error("Accepted STK response lacked a checkout request ID.");

      return Response.json(
        {
          success: false,
          status: "unknown",
          message:
            "The request was accepted but its reference could not be saved. Contact support.",
        },
        { status: 502, headers: corsHeaders },
      );
    }

    // Save the checkout request ID so the callback can match the order.
    const saved = await updateInitiationStatus(
      supabase,
      order.id,
      "initiated",
      checkoutRequestId,
    );

    if (!saved) {
      // Daraja accepted the request, so do not retry automatically.
      console.error("Could not save the accepted checkout request ID.");

      return Response.json(
        {
          success: false,
          status: "unknown",
          message:
            "Safaricom accepted the request, but we could not save its reference. Contact support.",
        },
        { status: 500, headers: corsHeaders },
      );
    }

    // This means the prompt was accepted, not that payment is complete.
    return Response.json(
      {
        success: true,
        status: "initiated",
        message:
          "Payment prompt sent. Check your phone and follow the M-Pesa instructions.",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    // Avoid logging access tokens, passkeys, or other credentials.
    console.error(
      "M-Pesa Edge Function failed.",
      error instanceof Error ? error.message : "Unknown error.",
    );

    return Response.json(
      {
        success: false,
        message: "Unable to process the payment request.",
      },
      { status: 400, headers: corsHeaders },
    );
  }
});