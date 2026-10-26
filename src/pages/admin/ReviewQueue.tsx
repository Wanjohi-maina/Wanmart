import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type ReviewItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  selected_color: string | null;
  selected_storage: string | null;
  selected_size: string | null;
  available: number | null;
};

type ReviewOrder = {
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  payment_resolution_status: "manual_review" | "refund_pending";
  payment_reference: string | null;
  total: number;
  currency: string;
  created_at: string;
  resolution_note: string | null;
  can_fulfil: boolean;
  items: ReviewItem[];
};

type Panel = "fulfil" | "refund" | "refunded" | "receipt" | null;

type RpcResult = PromiseLike<{ error: { message: string } | null }>;

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100";

const primaryButton =
  "w-full rounded-full bg-orange-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

const secondaryButton =
  "w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

function ConfirmRow({
  label,
  busy,
  disabled,
  onConfirm,
  onCancel,
}: {
  label: string;
  busy: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        className={primaryButton}
        disabled={busy || disabled}
        onClick={onConfirm}
      >
        {busy ? "Working..." : label}
      </button>
      <button
        type="button"
        className={secondaryButton}
        disabled={busy}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}

function ReviewCard({
  order,
  onDone,
}: {
  order: ReviewOrder;
  onDone: () => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [note, setNote] = useState("");
  const [refundRef, setRefundRef] = useState("");
  const [receipt, setReceipt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isRefundPending = order.payment_resolution_status === "refund_pending";
  const placeholder = order.payment_reference?.startsWith("QUERY-") ?? false;

  function open(next: Panel) {
    setPanel(next);
    setError(null);
    setSuccess(null);
  }

  async function run(call: () => RpcResult, successMessage: string) {
    setBusy(true);
    setError(null);
    setSuccess(null);

    const { error: rpcError } = await call();

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setPanel(null);
    setNote("");
    setRefundRef("");
    setReceipt("");
    setSuccess(successMessage);

    onDone();
  }

  const noteValue = note.trim() || undefined;

  return (
    <li className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900">
            {order.customer_name}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Order {order.order_id.slice(0, 8)} ·{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            isRefundPending
              ? "bg-blue-100 text-blue-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {isRefundPending ? "Refund pending" : "Needs decision"}
        </span>
      </div>

      {/* Customer and payment */}
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="mt-0.5">
            <a href={`tel:${order.phone}`} className="text-orange-600">
              {order.phone}
            </a>
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-gray-500">Email</dt>
          <dd className="mt-0.5 wrap-break-word text-gray-900">
            {order.email}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-gray-500">Address</dt>
          <dd className="mt-0.5 whitespace-pre-line text-gray-900">
            {order.address}
          </dd>
        </div>

        <div>
          <dt className="text-gray-500">Amount paid</dt>
          <dd className="mt-0.5 font-medium text-gray-900">
            {order.currency} {Number(order.total).toLocaleString()}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-gray-500">M-Pesa receipt</dt>
          <dd className="mt-0.5 break-all font-mono text-gray-900">
            {order.payment_reference ?? "None"}
          </dd>
          {placeholder && (
            <p className="mt-1 text-xs text-amber-700">
              This is a placeholder. Replace it with the code from the M-Pesa
              message.
            </p>
          )}
        </div>
      </dl>

      {order.resolution_note && (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Note: {order.resolution_note}
        </p>
      )}

      {/* Items */}
      <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100 text-sm">
        {order.items.map((item, index) => {
          const variant = [
            item.selected_color,
            item.selected_storage,
            item.selected_size,
          ]
            .filter(Boolean)
            .join(" \u00b7 ");

          const short =
            item.available !== null && item.quantity > item.available;

          return (
            <li
              key={`${item.product_id}-${index}`}
              className="flex items-start justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-gray-900">{item.product_name}</p>
                {variant && <p className="text-xs text-gray-500">{variant}</p>}
              </div>

              <div className="shrink-0 text-right">
                <p className="text-gray-900">Qty {item.quantity}</p>
                <p
                  className={`text-xs ${
                    short ? "font-medium text-red-600" : "text-gray-500"
                  }`}
                >
                  {item.available === null
                    ? "Product missing"
                    : `${item.available} available`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Actions */}
      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        {panel === null && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {!isRefundPending && (
              <>
                <button
                  type="button"
                  className={primaryButton}
                  disabled={!order.can_fulfil}
                  onClick={() => open("fulfil")}
                >
                  Fulfil order
                </button>
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => open("refund")}
                >
                  Refund
                </button>
              </>
            )}

            {isRefundPending && (
              <button
                type="button"
                className={primaryButton}
                onClick={() => open("refunded")}
              >
                Mark as refunded
              </button>
            )}

            {placeholder && (
              <button
                type="button"
                className={secondaryButton}
                onClick={() => open("receipt")}
              >
                Set M-Pesa receipt
              </button>
            )}
          </div>
        )}

        {panel === null && !isRefundPending && !order.can_fulfil && (
          <p className="text-xs text-gray-500">
            Fulfil is unavailable because there is not enough stock for every
            item. You can refund instead.
          </p>
        )}

        {panel === "fulfil" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              This deducts the stock and moves the order back to pending so it
              can be shipped.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className={`${inputClassName} resize-none`}
              disabled={busy}
            />
            <ConfirmRow
              label="Confirm fulfil"
              busy={busy}
              onCancel={() => open(null)}
              onConfirm={() =>
                run(
                  () =>
                    supabase.rpc("admin_fulfil_review_order", {
                      p_order_id: order.order_id,
                      p_note: noteValue,
                    }),
                  "Order fulfilled.",
                )
              }
            />
          </div>
        )}

        {panel === "refund" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              This marks the order as refund pending. Reverse the payment in
              M-Pesa, then come back and record the reference.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className={`${inputClassName} resize-none`}
              disabled={busy}
            />
            <ConfirmRow
              label="Confirm refund"
              busy={busy}
              onCancel={() => open(null)}
              onConfirm={() =>
                run(
                  () =>
                    supabase.rpc("admin_start_refund", {
                      p_order_id: order.order_id,
                      p_note: noteValue,
                    }),
                  "Refund started.",
                )
              }
            />
          </div>
        )}

        {panel === "refunded" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Only do this after the money has been returned. Enter the
              reference from the reversal.
            </p>
            {placeholder && (
              <p className="text-xs text-amber-700">
                The receipt above is still a placeholder. Set the real M-Pesa
                receipt first so you reverse the right payment.
              </p>
            )}
            <input
              type="text"
              value={refundRef}
              onChange={(e) => setRefundRef(e.target.value)}
              placeholder="Refund reference"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className={inputClassName}
              disabled={busy}
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className={`${inputClassName} resize-none`}
              disabled={busy}
            />
            <ConfirmRow
              label="Confirm refunded"
              busy={busy}
              disabled={refundRef.trim() === ""}
              onCancel={() => open(null)}
              onConfirm={() =>
                run(
                  () =>
                    supabase.rpc("admin_mark_refunded", {
                      p_order_id: order.order_id,
                      p_refund_reference: refundRef.trim(),
                      p_note: noteValue,
                    }),
                  "Marked as refunded.",
                )
              }
            />
          </div>
        )}

        {panel === "receipt" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter the receipt code from the customer's M-Pesa confirmation
              message, for example UJLB7B3816.
            </p>
            <input
              type="text"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value.toUpperCase())}
              placeholder="M-Pesa receipt code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className={`${inputClassName} font-mono`}
              disabled={busy}
            />
            <ConfirmRow
              label="Save receipt"
              busy={busy}
              disabled={receipt.trim() === ""}
              onCancel={() => open(null)}
              onConfirm={() =>
                run(
                  () =>
                    supabase.rpc("admin_set_payment_reference", {
                      p_order_id: order.order_id,
                      p_reference: receipt.trim(),
                    }),
                  "Receipt saved.",
                )
              }
            />
          </div>
        )}

        {success && (
          <div
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            role="status"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </li>
  );
}

export default function ReviewQueue() {
  const [orders, setOrders] = useState<ReviewOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc(
      "admin_get_review_queue",
    );

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setError(null);
    setOrders((data ?? []) as unknown as ReviewOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Payments to review
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Customers who paid for orders that had already been cancelled.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="shrink-0 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:border-gray-400"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
        </div>
      )}

      {!loading && error && (
        <div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && orders && orders.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-gray-900">Nothing to review.</p>
          <p className="mt-1 text-sm text-gray-500">
            Orders that are paid after they expired will appear here.
          </p>
        </div>
      )}

      {!loading && orders && orders.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <ReviewCard key={order.order_id} order={order} onDone={load} />
          ))}
        </ul>
      )}
    </div>
  );
}
