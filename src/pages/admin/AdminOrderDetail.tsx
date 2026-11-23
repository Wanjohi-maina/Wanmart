
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useReviewCount } from "./reviewCountContext";
import {
  Badge,
  methodLabel,
  orderStatusClass,
  paymentStatusClass,
  titleCase,
} from "./orderUi";

type ActionKey =
  | "ship"
  | "deliver"
  | "cod_delivered"
  | "cod_failed"
  | "cancel"
  | "cancel_refund";

type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_color: string | null;
  selected_storage: string | null;
  selected_size: string | null;
  image_url: string | null;
};

type Dispatch = {
  reference: string | null;
  note: string | null;
  dispatched_at: string;
  provider: string;
};

type OrderDetail = {
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_resolution_status: string;
  inventory_status: string;
  mpesa_initiation_status: string;
  subtotal: number;
  discount_total: number;
  total: number;
  currency: string;
  created_at: string;
  reservation_expires_at: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  refund_reference: string | null;
  delivery_method: string | null;
  delivery_label: string | null;
  delivery_fee: number;
  delivery_notes: string | null;
  dispatch: Dispatch | null;
  actions: ActionKey[];
  items: OrderItem[];
  callbacks: {
    result_code: number;
    result_description: string | null;
    processing_status: string;
    received_at: string;
  }[];
  history: {
    action: string;
    details: { note?: string | null; reference?: string | null };
    created_at: string;
  }[];
};

type ActionConfig = {
  label: string;
  confirmLabel: string;
  description: string;
  success: string;
  danger?: boolean;
  field?: "note" | "reference" | "dispatch";
};

const ACTIONS: Record<ActionKey, ActionConfig> = {
  ship: {
    label: "Mark as shipped",
    confirmLabel: "Confirm shipped",
    description:
      "Marks the order as shipped. Add the delivery details below so the customer can see them. For Cash on Delivery orders, the payment is recorded when the order is delivered.",
    success: "Order marked as shipped.",
    field: "dispatch",
  },
  deliver: {
    label: "Mark as delivered",
    confirmLabel: "Confirm delivered",
    description: "Marks the order as delivered.",
    success: "Order marked as delivered.",
  },
  cod_delivered: {
    label: "Delivered and paid",
    confirmLabel: "Confirm delivered and paid",
    description:
      "Records the cash payment, deducts the stock and marks the order as delivered.",
    success: "Payment recorded and order delivered.",
    field: "reference",
  },
  cod_failed: {
    label: "Delivery failed",
    confirmLabel: "Confirm delivery failed",
    description:
      "Use this if the customer refused the order or did not pay. The order is cancelled and its reserved stock is released.",
    success: "Order cancelled and stock released.",
    danger: true,
    field: "note",
  },
  cancel: {
    label: "Cancel order",
    confirmLabel: "Confirm cancel",
    description:
      "The order is cancelled and its reserved stock is released.",
    success: "Order cancelled.",
    danger: true,
    field: "note",
  },
  cancel_refund: {
    label: "Cancel and refund",
    confirmLabel: "Confirm cancel and refund",
    description:
      "The customer has paid. The order is cancelled, the stock goes back on sale and the order moves to refund pending. Record the refund afterwards on the Review page.",
    success: "Order cancelled. Record the refund on the Review page.",
    danger: true,
    field: "note",
  },
};

const ACTION_ORDER: ActionKey[] = [
  "ship",
  "deliver",
  "cod_delivered",
  "cod_failed",
  "cancel",
  "cancel_refund",
];

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50";

function callAction(
  action: ActionKey,
  orderId: string,
  value: string,
  value2: string,
): PromiseLike<{ error: { message: string } | null }> {
  const optional = value || undefined;

  switch (action) {
    case "ship":
      return supabase.rpc("admin_ship_order", {
        p_order_id: orderId,
        p_reference: value || undefined,
        p_note: value2 || undefined,
      });
    case "deliver":
      return supabase.rpc("admin_mark_delivered", { p_order_id: orderId });
    case "cod_delivered":
      return supabase.rpc("admin_complete_cod_delivery", {
        p_order_id: orderId,
        p_reference: optional,
      });
    case "cod_failed":
      return supabase.rpc("admin_fail_cod_delivery", {
        p_order_id: orderId,
        p_note: optional,
      });
    default:
      return supabase.rpc("admin_cancel_order", {
        p_order_id: orderId,
        p_note: optional,
      });
  }
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className=" font-medium tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-sm leading-relaxed text-gray-900">
        {children}
      </dd>
    </div>
  );
}

function DispatchCard({
  order,
  onSaved,
}: {
  order: OrderDetail;
  onSaved: () => Promise<void>;
}) {
  const dispatch = order.dispatch;

  const [editing, setEditing] = useState(false);
  const [reference, setReference] = useState(dispatch?.reference ?? "");
  const [note, setNote] = useState(dispatch?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!dispatch) return null;

  async function handleSave() {
    setBusy(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("admin_update_dispatch", {
      p_order_id: order.order_id,
      p_reference: reference.trim() || undefined,
      p_note: note.trim() || undefined,
    });

    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setEditing(false);
    await onSaved();
  }

  return (
    <Card title="Dispatch details">
      {!editing ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <Field label="Reference">
              {dispatch.reference ?? "None"}
            </Field>
            <Field label="Note">{dispatch.note ?? "None"}</Field>
            <Field label="Dispatched">
              {new Date(dispatch.dispatched_at).toLocaleString()}
            </Field>
          </dl>

          <p className="text-xs leading-relaxed text-gray-500">
            The customer can see the reference and note on their order page.
          </p>

          <button
            type="button"
            onClick={() => {
              setReference(dispatch.reference ?? "");
              setNote(dispatch.note ?? "");
              setEditing(true);
            }}
            className="inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
          >
            Edit dispatch details
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="dispatch-reference"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Reference
            </label>
            <input
              id="dispatch-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={200}
              disabled={busy}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="dispatch-note"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Note
            </label>
            <textarea
              id="dispatch-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={busy}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            Both are shown to the customer on their order page.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={handleSave}
              className="w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Saving..." : "Save details"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { refresh } = useReviewCount();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [panel, setPanel] = useState<ActionKey | null>(null);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase.rpc("admin_get_order", {
      p_order_id: id,
    });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setLoadError(null);
    setOrder(data as unknown as OrderDetail);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function open(next: ActionKey | null) {
    setPanel(next);
    setText("");
    setText2("");
    setActionError(null);
    setSuccess(null);
  }

  async function perform(action: ActionKey) {
    if (!id) return;

    setBusy(true);
    setActionError(null);
    setSuccess(null);

    const { error } = await callAction(action, id, text.trim(), text2.trim());

    setBusy(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setPanel(null);
    setText("");
    setText2("");
    setSuccess(ACTIONS[action].success);
    await load();
    refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div>
        <Link
          to="/admin/orders"
          className="text-sm text-gray-500 hover:text-orange-600"
        >
          ← Orders
        </Link>

        <div
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError ?? "Order not found."}
        </div>
      </div>
    );
  }

  const available = ACTION_ORDER.filter((key) => order.actions.includes(key));

  const needsPaymentDecision =
    order.payment_resolution_status === "manual_review" ||
    order.payment_resolution_status === "refund_pending";

  // A payment prompt may already be out for an unpaid M-Pesa order.
  const promptMayBeLive =
    order.payment_method === "mpesa" &&
    order.payment_status === "unpaid" &&
    order.mpesa_initiation_status !== "not_started" &&
    order.mpesa_initiation_status !== "failed";

  const isMatatu = order.delivery_method === "matatu";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/admin/orders"
        className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-orange-600"
      >
        ← Orders
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
          {order.customer_name}
        </h1>

        <p className="mt-2 break-all font-mono text-xs text-gray-500">
          {order.order_id}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className={orderStatusClass(order.status)}>
            {titleCase(order.status)}
          </Badge>

          <Badge className={paymentStatusClass(order.payment_status)}>
            {titleCase(order.payment_status)}
          </Badge>

          {needsPaymentDecision && (
            <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
              Payment review
            </Badge>
          )}
        </div>
      </div>

      {success && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {success}
        </div>
      )}

      {/* Actions */}
      <Card title="Actions">
        {panel === null && (
          <div className="space-y-4">
            {available.length > 0 ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {available.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => open(key)}
                    className={
                      ACTIONS[key].danger
                        ? "w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 sm:w-auto"
                        : "w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:w-auto"
                    }
                  >
                    {ACTIONS[key].label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No actions are available for this order.
              </p>
            )}

            {needsPaymentDecision && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800">
                This order needs a payment decision.{" "}
                <Link to="/admin/review" className="underline">
                  Open Review
                </Link>
              </p>
            )}
          </div>
        )}

        {panel !== null && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-600">
              {ACTIONS[panel].description}
            </p>

            {panel === "cancel" && promptMayBeLive && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800">
                A payment prompt may already have been sent. If the customer
                pays after you cancel, the payment will appear under Review.
              </p>
            )}

            {ACTIONS[panel].field === "note" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Note (optional)"
                className={`${inputClassName} resize-none`}
                disabled={busy}
              />
            )}

            {ACTIONS[panel].field === "reference" && (
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Receipt or reference (optional)"
                autoCorrect="off"
                spellCheck={false}
                className={inputClassName}
                disabled={busy}
              />
            )}

            {ACTIONS[panel].field === "dispatch" && (
              <>
                <div>
                  <label
                    htmlFor="ship-reference"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Reference (optional)
                  </label>

                  <input
                    id="ship-reference"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={200}
                    placeholder={
                      isMatatu
                        ? "SACCO parcel receipt number and vehicle plate"
                        : "Rider's name and phone number"
                    }
                    className={inputClassName}
                    disabled={busy}
                  />
                </div>

                <div>
                  <label
                    htmlFor="ship-note"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Note (optional)
                  </label>

                  <textarea
                    id="ship-note"
                    value={text2}
                    onChange={(e) => setText2(e.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Anything the customer should know"
                    className={`${inputClassName} resize-none`}
                    disabled={busy}
                  />
                </div>

                <p className="text-xs leading-relaxed text-gray-500">
                  Both are shown to the customer on their order page.
                </p>
              </>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => perform(panel)}
                className={`w-full rounded-full px-5 py-3 text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                  ACTIONS[panel].danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {busy ? "Working..." : ACTIONS[panel].confirmLabel}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => open(null)}
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {actionError}
          </div>
        )}
      </Card>

      {/* Items */}
      <Card title="Items">
        <ul className="divide-y divide-gray-100">
          {order.items.map((item, index) => {
            const variant = [
              item.selected_color,
              item.selected_storage,
              item.selected_size,
            ]
              .filter(Boolean)
              .join(" \u00b7 ");

            return (
              <li
                key={`${item.product_id}-${index}`}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                  />
                ) : (
                  <div
                    className="h-16 w-16 shrink-0 rounded-lg bg-gray-100"
                    aria-hidden="true"
                  />
                )}

                <div className="min-w-0 flex-1 self-center text-sm">
                  <p className="font-medium text-gray-900">
                    {item.product_name}
                  </p>

                  {variant && (
                    <p className="text-xs leading-relaxed text-gray-500">
                      {variant}
                    </p>
                  )}

                  <p className="text-xs leading-relaxed text-gray-500">
                    Qty {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 text-sm text-gray-900">
                  {order.currency}{" "}
                  {(Number(item.unit_price) * item.quantity).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>
              {order.currency} {Number(order.subtotal).toLocaleString()}
            </span>
          </div>

          {Number(order.discount_total) > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Discount</span>
              <span>
                - {order.currency}{" "}
                {Number(order.discount_total).toLocaleString()}
              </span>
            </div>
          )}

          {order.delivery_label && (
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>
                {Number(order.delivery_fee) > 0
                  ? `${order.currency} ${Number(order.delivery_fee).toLocaleString()}`
                  : "Free"}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-950">
            <span>Total</span>
            <span>
              {order.currency} {Number(order.total).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Delivery */}
      {order.delivery_label && (
        <Card title="Delivery">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <Field label="Method">
              {isMatatu ? "Matatu SACCO" : "Courier delivery"}
            </Field>

            <Field label={isMatatu ? "Town and SACCO" : "Area"}>
              {order.delivery_label}
            </Field>

            <Field label="Delivery fee">
              {Number(order.delivery_fee) > 0
                ? `${order.currency} ${Number(order.delivery_fee).toLocaleString()}`
                : "Free"}
            </Field>

            <Field label={isMatatu ? "Deliver to" : "Address"}>
              <span className="whitespace-pre-line">{order.address}</span>
            </Field>

            {order.delivery_notes && (
              <div className="sm:col-span-2">
                <Field label="Customer's delivery notes">
                  <span className="whitespace-pre-line">
                    {order.delivery_notes}
                  </span>
                </Field>
              </div>
            )}
          </dl>
        </Card>
      )}

      {/* Dispatch */}
      <DispatchCard
        key={`${order.dispatch?.reference ?? ""}:${order.dispatch?.note ?? ""}`}
        order={order}
        onSaved={async () => {
          await load();
          setSuccess("Dispatch details saved.");
        }}
      />

      {/* Customer */}
      <Card title="Customer">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          <Field label="Phone">
            <a
              href={`tel:${order.phone}`}
              className="font-medium text-orange-600"
            >
              {order.phone}
            </a>
          </Field>

          <Field label="Email">{order.email}</Field>

          {!order.delivery_label && (
            <div className="sm:col-span-2">
              <Field label="Address">
                <span className="whitespace-pre-line">{order.address}</span>
              </Field>
            </div>
          )}
        </dl>
      </Card>

      {/* Payment */}
      <Card title="Payment">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          <Field label="Method">
            {methodLabel(order.payment_method)}
          </Field>

          <Field label="Receipt or reference">
            <span className="font-mono">
              {order.payment_reference ?? "None"}
            </span>
          </Field>

          {order.refund_reference && (
            <Field label="Refund reference">
              <span className="font-mono">{order.refund_reference}</span>
            </Field>
          )}

          {order.resolution_note && (
            <div className="sm:col-span-2">
              <Field label="Note">{order.resolution_note}</Field>
            </div>
          )}
        </dl>
      </Card>

      {/* Technical details */}
      <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <summary className="cursor-pointer text-base font-semibold text-gray-900 transition hover:text-orange-600">
          System details
        </summary>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
          <Field label="Stock status">
            {titleCase(order.inventory_status)}
          </Field>

          <Field label="Payment review">
            {titleCase(order.payment_resolution_status)}
          </Field>

          {order.payment_method === "mpesa" && (
            <Field label="Prompt status">
              {titleCase(order.mpesa_initiation_status)}
            </Field>
          )}

          {order.reservation_expires_at && (
            <Field label="Reservation expires">
              {new Date(order.reservation_expires_at).toLocaleString()}
            </Field>
          )}
        </dl>

        {order.callbacks.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-900">
              Payment callbacks
            </p>

            <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
              {order.callbacks.map((callback, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3"
                >
                  <p className="text-gray-900">
                    Code {callback.result_code}
                    {callback.result_description
                      ? `: ${callback.result_description}`
                      : ""}
                  </p>

                  <p className="text-xs leading-relaxed text-gray-500">
                    {titleCase(callback.processing_status)} ·{" "}
                    {new Date(callback.received_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </details>

      {/* Activity */}
      <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <summary className="cursor-pointer text-base font-semibold text-gray-900 transition hover:text-orange-600">
          Activity
        </summary>

        {order.history.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No admin actions yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
            {order.history.map((entry, index) => (
              <li
                key={index}
                className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3"
              >
                <p className="text-gray-900">{titleCase(entry.action)}</p>

                {(entry.details?.note || entry.details?.reference) && (
                  <p className="text-gray-600">
                    {[entry.details.reference, entry.details.note]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                <p className="text-xs leading-relaxed text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
