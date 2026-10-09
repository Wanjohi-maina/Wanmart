
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  // Only allow POST requests.
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Read the order ID sent by the checkout.
    const { orderId } = await req.json();

    // Validate the order ID.
    if (
      typeof orderId !== "string" ||
      orderId.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ error: "A valid order ID is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the Supabase credentials from the server environment.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase server configuration is missing.");

      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create a Supabase client for server-side database access.
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Retrieve the order using its ID.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, total, phone, payment_method, payment_status, status, inventory_status, reservation_expires_at",
      )
      .eq("id", orderId.trim())
      .maybeSingle();

    // Handle database errors.
    if (orderError) {
      console.error("Order lookup failed:", orderError.message);

      return new Response(
        JSON.stringify({ error: "Could not verify the order." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Make sure the order exists.
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Only allow M-Pesa orders that are awaiting payment.
    if (
      order.payment_method !== "mpesa" ||
      order.payment_status !== "unpaid" ||
      order.status !== "pending" ||
      order.inventory_status !== "reserved"
    ) {
      return new Response(
        JSON.stringify({ error: "This order is not eligible for M-Pesa payment." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Make sure the M-Pesa reservation has not expired.
    const expiryTime = order.reservation_expires_at
      ? new Date(order.reservation_expires_at).getTime()
      : 0;

    if (!expiryTime || expiryTime <= Date.now()) {
      return new Response(
        JSON.stringify({ error: "The payment reservation has expired." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // The order is valid. We have not initiated payment yet.
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order verified and eligible for M-Pesa payment.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("STK Push request error:", error);

    return new Response(
      JSON.stringify({ error: "Invalid request." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});