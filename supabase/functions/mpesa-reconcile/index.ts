import { createClient } from "@supabase/supabase-js";

const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

function getDarajaTimestamp(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const v: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") v[p.type] = p.value;
  return v.year + v.month + v.day + v.hour + v.minute + v.second;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ message: "Method not allowed." }, { status: 405 });
  }

  const adminSecret = Deno.env.get("QUERY_ADMIN_SECRET");
  if (!adminSecret || req.headers.get("x-admin-secret") !== adminSecret) {
    return Response.json({ message: "Forbidden." }, { status: 403 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
  const passkey = Deno.env.get("MPESA_PASSKEY");
  const shortcode = Deno.env.get("MPESA_SHORTCODE");

  if (!supabaseUrl || !serviceRoleKey || !consumerKey ||
      !consumerSecret || !passkey || !shortcode) {
    return Response.json({ message: "Not configured." }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Optional: also re-check recently failed orders for late payments.
    let lateHours = 0;
    try {
      const body = await req.json();
      lateHours = Math.min(Number(body?.lateHours) || 0, 72);
    } catch { /* no body is fine */ }

    // 1. Orders still waiting on a callback (older than 2 minutes).
    const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: pending, error: pendingError } = await supabase
      .from("orders")
      .select("id, mpesa_checkout_request_id")
      .eq("payment_method", "mpesa")
      .eq("payment_status", "unpaid")
      .eq("inventory_status", "reserved")
      .eq("mpesa_initiation_status", "initiated")
      .not("mpesa_checkout_request_id", "is", null)
      .lte("mpesa_initiated_at", cutoff)
      .limit(20);
    if (pendingError) throw new Error("Pending order lookup failed.");

    // 2. Optionally, recently failed orders (only acted on if Daraja says paid).
    let failed: { id: string; mpesa_checkout_request_id: string }[] = [];
    if (lateHours > 0) {
      const since = new Date(Date.now() - lateHours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("id, mpesa_checkout_request_id")
        .eq("payment_method", "mpesa")
        .eq("payment_status", "failed")
        .eq("mpesa_initiation_status", "initiated")
        .not("mpesa_checkout_request_id", "is", null)
        .gte("created_at", since)
        .limit(20);
      if (error) throw new Error("Failed order lookup failed.");
      failed = data ?? [];
    }

    const work = [
      ...(pending ?? []).map((o) => ({ ...o, wasFailed: false })),
      ...failed.map((o) => ({ ...o, wasFailed: true })),
    ];
    if (work.length === 0) return Response.json({ checked: 0, results: [] });

    // Daraja token
    const tokenRes = await fetch(
      `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return Response.json({ message: "Daraja auth failed." }, { status: 502 });
    }

    const results: Record<string, unknown>[] = [];

    for (const order of work) {
      const checkoutId = order.mpesa_checkout_request_id;
      try {
        const timestamp = getDarajaTimestamp();
        const password = btoa(`${shortcode}${passkey}${timestamp}`);

        const res = await fetch(
          `${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              BusinessShortCode: shortcode,
              Password: password,
              Timestamp: timestamp,
              CheckoutRequestID: checkoutId,
            }),
            signal: AbortSignal.timeout(20000),
          },
        );

        const data = await res.json().catch(() => null);
        const code = data?.ResultCode;

        // No ResultCode means Daraja has not given a final answer. Do nothing.
        if (code === undefined || code === null) {
          results.push({
            orderId: order.id,
            action: "unresolved",
            httpStatus: res.status,
            errorCode: data?.errorCode ?? null,
            errorMessage: data?.errorMessage ?? null,
          });
          continue;
        }
        if (String(code) === "0") {
          const { error } = await supabase.rpc("confirm_payment", {
            p_order_id: order.id,
            p_provider: "mpesa",
            // The query response has no receipt number. Replace it later
            // with the real receipt from the M-Pesa statement.
            p_reference: `QUERY-${checkoutId}`,
          });
          results.push({
            orderId: order.id,
            action: error ? "confirm_failed" : "confirmed",
            ...(error ? { error: error.message } : {}),
          });
        } else if (!order.wasFailed) {
          const { error } = await supabase.rpc("fail_payment", {
            p_order_id: order.id,
          });
          results.push({
            orderId: order.id,
            action: error ? "fail_error" : "failed",
            resultCode: String(code),
            ...(error ? { error: error.message } : {}),
          });
        } else {
          results.push({ orderId: order.id, action: "still_failed", resultCode: String(code) });
        }
      } catch (e) {
        results.push({
          orderId: order.id,
          action: "error",
          error: e instanceof Error ? e.message : "Unknown",
        });
      }
    }

    return Response.json({ checked: work.length, results });
  } catch (error) {
    console.error("mpesa-reconcile failed:", error instanceof Error ? error.message : "Unknown");
    return Response.json({ message: "Reconcile failed." }, { status: 500 });
  }
});