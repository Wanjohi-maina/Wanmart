
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  ReceiptText,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useReviewCount } from "./reviewCountContext";

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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100";

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

const secondaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

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
        {busy && <RefreshCw size={16} className="animate-spin" />}
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
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900">
            {order.customer_name}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Order {order.order_id.slice(0, 8)} ·{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isRefundPending
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isRefundPending ? "Refund pending" : "Needs decision"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* Customer and payment */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer details
          </h3>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={14} />
                Phone
              </dt>
              <dd className="mt-1">
                <a
                  href={`tel:${order.phone}`}
                  className="font-medium text-gray-900 transition-colors hover:text-orange-600"
                >
                  {order.phone}
                </a>
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={14} />
                Email
              </dt>
              <dd className="mt-1 break-words text-gray-900">
                {order.email}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={14} />
                Address
              </dt>
              <dd className="mt-1 whitespace-pre-line text-gray-900">
                {order.address}
              </dd>
            </div>
          </dl>
        </section>

        <div className="my-5 border-t border-gray-100" />

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payment details
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <CreditCard size={14} />
                Amount paid
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {order.currency} {Number(order.total).toLocaleString()}
              </p>
            </div>

            <div className="min-w-0 rounded-lg bg-gray-50 p-3">
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <ReceiptText size={14} />
                M-Pesa receipt
              </p>
              <p className="mt-1 break-all font-mono text-sm font-medium text-gray-900">
                {order.payment_reference ?? "None"}
              </p>

              {placeholder && (
                <p className="mt-2 text-xs leading-relaxed text-amber-700">
                  This is a placeholder. Replace it with the code from the
                  M-Pesa message.
                </p>
              )}
            </div>
          </div>
        </section>

        {order.resolution_note && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <p className="text-xs font-medium text-gray-500">
              Previous resolution note
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {order.resolution_note}
            </p>
          </div>
        )}

        {/* Items */}
        <section className="mt-5 border-t border-gray-100 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Package size={17} className="text-gray-500" />
              Order items
            </h3>

            <span className="text-xs text-gray-500">
              {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 px-3">
            {order.items.map((item, index) => {
              const variant = [
                item.selected_color,
                item.selected_storage,
                item.selected_size,
              ]
                .filter(Boolean)
                .join(" · ");

              const short =
                item.available !== null && item.quantity > item.available;

              return (
                <li
                  key={`${item.product_id}-${index}`}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.product_name}
                    </p>

                    {variant && (
                      <p className="mt-1 text-xs text-gray-500">{variant}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Qty {item.quantity}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        item.available === null || short
                          ? "font-medium text-red-600"
                          : "text-green-700"
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
        </section>

        {/* Actions */}
        <section className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Resolution actions
          </h3>

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
                    <PackageCheck size={16} />
                    Fulfil order
                  </button>

                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => open("refund")}
                  >
                    <RotateCcw size={16} />
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
                  <CheckCircle2 size={16} />
                  Mark as refunded
                </button>
              )}

              {placeholder && (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => open("receipt")}
                >
                  <ReceiptText size={16} />
                  Set M-Pesa receipt
                </button>
              )}
            </div>
          )}

          {panel === null && !isRefundPending && !order.can_fulfil && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                Fulfil is unavailable because there is not enough stock for
                every item. You can refund instead.
              </p>
            </div>
          )}

          {/* Fulfil confirmation */}
          {panel === "fulfil" && (
            <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50/50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Confirm fulfilment
              </h4>

              <p className="text-sm leading-relaxed text-gray-600">
                This deducts the stock and moves the order back to pending so
                it can be shipped.
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

          {/* Refund confirmation */}
          {panel === "refund" && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Start refund
              </h4>

              <p className="text-sm leading-relaxed text-gray-600">
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

          {/* Mark as refunded */}
          {panel === "refunded" && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Record completed refund
              </h4>

              <p className="text-sm leading-relaxed text-gray-600">
                Only do this after the money has been returned. Enter the
                reference from the reversal.
              </p>

              {placeholder && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>
                    The receipt above is still a placeholder. Set the real
                    M-Pesa receipt first so you reverse the right payment.
                  </p>
                </div>
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

          {/* Set M-Pesa receipt */}
          {panel === "receipt" && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Update M-Pesa receipt
              </h4>

              <p className="text-sm leading-relaxed text-gray-600">
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

          {/* Success and error messages */}
          {success && (
            <div
              className="mt-3 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              role="status"
            >
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div
              className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>
      </div>
    </li>
  );
}

export default function ReviewQueue() {
  const [orders, setOrders] = useState<ReviewOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { refresh } = useReviewCount();

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
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Payments to review
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">
            Customers who paid for orders that had already been cancelled.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading */}
     {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Unable to load payments</p>
            <p className="mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders && orders.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <CheckCircle2 size={24} className="text-gray-500" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-gray-900">
            Nothing to review
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-gray-500">
            Orders that are paid after they expired will appear here.
          </p>
        </div>
      )}

      {/* Review cards */}
      {!loading && orders && orders.length > 0 && (
        <ul className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <ReviewCard
              key={order.order_id}
              order={order}
              onDone={() => {
                load();
                refresh();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
