import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types";

// Type for one item in the order
type OrderConfirmationItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  original_unit_price: number | null;
  selected_color: string | null;
  selected_storage: string | null;
  selected_size: string | null;
  image_url: string | null;
};

// Type for the complete order
type OrderConfirmation = {
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_resolution_status?: string | null;
  mpesa_initiation_status: string | null;
  currency: string;
  subtotal: number;
  discount_total: number;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  items: OrderConfirmationItem[];
};

// Polling settings.
const FAST_POLL_MS = 4000; // awaiting an M-Pesa payment, first 3 minutes
const SLOW_POLL_MS = 15000; // awaiting an M-Pesa payment, after that
const FAST_WINDOW_MS = 3 * 60 * 1000;
const STOP_AWAITING_AFTER_MS = 30 * 60 * 1000;
const STATUS_POLL_MS = 20000; // watching shipping and delivery updates
const STOP_STATUS_AFTER_MS = 2 * 60 * 60 * 1000;

type PaymentView =
  | "awaiting"
  | "paid"
  | "failed"
  | "review"
  | "refundPending"
  | "cod"
  | "refunded";

// Work out which payment state to show from the order's database values.
function getPaymentView(order: OrderConfirmation): PaymentView {
  if (order.payment_status === "refunded") return "refunded";

  if (order.payment_status === "paid") {
    if (order.status !== "cancelled") return "paid";

    // Paid but cancelled: either we are refunding it, or it needs review.
    return order.payment_resolution_status === "refund_pending"
      ? "refundPending"
      : "review";
  }

  if (order.payment_status === "failed") return "failed";
  if (order.payment_method === "mpesa") return "awaiting";

  return "cod";
}

// How long to wait before checking again, or null to stop checking.
function nextPollDelay(
  order: OrderConfirmation,
  sincePageLoad: number,
  sinceResume: number,
): number | null {
  const view = getPaymentView(order);

  if (view === "awaiting") {
    if (sincePageLoad >= STOP_AWAITING_AFTER_MS) return null;

    const noPrompt =
      order.mpesa_initiation_status === "failed" ||
      order.mpesa_initiation_status === "not_started";

    if (noPrompt) return SLOW_POLL_MS;

    return sincePageLoad < FAST_WINDOW_MS ? FAST_POLL_MS : SLOW_POLL_MS;
  }

  // Payment is settled. Keep watching until the order reaches an end state.
  const finished =
    order.status === "delivered" ||
    order.payment_status === "refunded" ||
    view === "failed";

  if (finished || sinceResume >= STOP_STATUS_AFTER_MS) return null;

  return STATUS_POLL_MS;
}

function paymentMethodLabel(method: string) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "cash_on_delivery") return "Cash on Delivery";
  return method;
}

function paymentMessage(
  view: PaymentView,
  method: string,
  waitedLong: boolean,
  initiation: string | null,
) {
  switch (view) {
    case "paid":
      return method === "cash_on_delivery"
        ? "Your order has been paid for and will be delivered soon."
        : "M-Pesa payment received. Your order is confirmed.";

    case "failed":
      if (method === "cash_on_delivery") {
        return "This order has been cancelled. If you were not expecting this, please contact support.";
      }
      if (initiation === "failed" || initiation === "not_started") {
        return "We could not send the M-Pesa payment prompt to your phone, so the order was cancelled. Please start a new order and try again, or contact support.";
      }
      return "The payment was not completed and the order has been cancelled. If you received an M-Pesa confirmation message, please contact support.";

    case "review":
      return "We received your payment, but your order needs a quick review by our team before it can be processed. Please keep your M-Pesa confirmation message.";

    case "refundPending":
      return "Your order has been cancelled and your refund is being processed. If you have any questions, please contact support.";  

    case "awaiting":
      if (initiation === "failed" || initiation === "not_started") {
        return "We could not send the M-Pesa payment prompt to your phone. Please start a new order and try again, or contact support.";
      }
      if (initiation === "unknown" || initiation === "initiating") {
        return "We could not confirm that the M-Pesa prompt was sent. If a prompt appears and you pay, please contact support with your order ID so we can confirm it. Otherwise this order will be cancelled automatically.";
      }
      return waitedLong
        ? "We have not received confirmation yet. If you entered your M-Pesa PIN, keep this page open and it will update when the payment is confirmed. If no prompt appeared on your phone, check that the number is a Safaricom line registered for M-Pesa. If no payment is confirmed, the order is cancelled automatically."
        : "Check your phone and enter your M-Pesa PIN to complete the payment. This page will update automatically.";

    case "refunded":
      return "Your payment has been refunded. If you have any questions, please contact support.";

    default:
      return "Pay when you receive your order.";
  }
}

function headingFor(
  view: PaymentView,
  promptNotSent: boolean,
  method: string,
) {
  switch (view) {
    case "awaiting":
      return promptNotSent
        ? "Payment could not be started"
        : "Waiting for your payment";
    case "failed":
      if (method === "cash_on_delivery") return "Order cancelled";
      return promptNotSent
        ? "Payment could not be started"
        : "Payment not completed";
    case "review":
      return "We received your payment";
    case "refundPending":
      return "Your refund is on its way";  
    case "refunded":
      return "Order refunded";
    default:
      return "Thank you for your order";
  }
}

function orderStatusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function orderStatusClassName(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrderConfirmation() {
  // Get the order ID from the URL.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const { restoreCart } = useCart()

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitedLong, setWaitedLong] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No order ID was provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastOrder: OrderConfirmation | null = null;
    const startedAt = Date.now();
    let resumedAt = startedAt;

    async function load() {
      if (inFlight) return;

      // Get the access token saved when the order was created.
      const accessToken = sessionStorage.getItem(`order_access_token_${id}`);

      // Don't fetch the order if the access token is missing.
      if (!accessToken) {
        setError("Unable to verify your order. Please return to checkout.");
        setLoading(false);
        return;
      }

      inFlight = true;

      try {
        const { data, error: orderError } = await supabase.rpc(
          "get_order_confirmation",
          {
            p_order_id: id,
            p_access_token: accessToken,
          },
        );

        if (cancelled) return;

        if (orderError) {
          console.error("Error fetching order:", orderError);

          // Only show an error if the order has never loaded.
          // A failed background check keeps the last known order on screen.
          if (!lastOrder) {
            setError(
              orderError.message.toLowerCase().includes("order not found")
                ? "We could not find this order."
                : orderError.message,
            );
          }
        } else if (!data) {
          if (!lastOrder) setError("We could not find this order.");
        } else {
          lastOrder = data as OrderConfirmation;
          setError(null);
          setOrder(lastOrder);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Error fetching order:", err);

        if (!lastOrder) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the order.",
          );
        }
      } finally {
        inFlight = false;
      }

      if (cancelled) return;

      setLoading(false);

      if (!lastOrder) return;

      const sincePageLoad = Date.now() - startedAt;

      if (
        getPaymentView(lastOrder) === "awaiting" &&
        sincePageLoad >= FAST_WINDOW_MS
      ) {
        setWaitedLong(true);
      }

      const delay = nextPollDelay(
        lastOrder,
        sincePageLoad,
        Date.now() - resumedAt,
      );

      if (delay === null) return;

      timer = setTimeout(load, delay);
    }

    // Check straight away when the customer comes back to this tab.
    function handleVisible() {
      if (document.visibilityState !== "visible" || cancelled) return;

      resumedAt = Date.now();
      if (timer) clearTimeout(timer);
      load();
    }

    document.addEventListener("visibilitychange", handleVisible);

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [id]);

  // Show loading spinner while fetching the order.
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show an error if the order could not be loaded.
  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Order not found
        </h1>

        <p className="text-gray-500 mb-6">
          {error ?? "We could not find this order."}
        </p>

        <Link to="/" className="text-orange-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const view = getPaymentView(order);
  const initiation = order.mpesa_initiation_status;

  // The prompt never reached the customer's phone.
   const promptNotSent =
    order.payment_method === "mpesa" &&
    (view === "awaiting" || view === "failed") &&
    (initiation === "failed" || initiation === "not_started");

  const displayMessage = paymentMessage(
    view,
    order.payment_method,
    waitedLong,
    initiation,
  );

  // Once the order has left the warehouse, say so.
  const statusMessage =
    order.status === "shipped" && view === "paid"
     ? order.payment_method === "cash_on_delivery"
      ? "Your order is on its way."
      : "M-Pesa payment received. Your order is on its way."
      : order.status === "shipped" && view === "cod"
        ? "Your order is on its way. Pay when you receive it."
        : order.status === "delivered" && view === "paid"
          ? order.payment_method === "cash_on_delivery"
            ? "Your order has been delivered and paid for. Thank you for shopping with us"
            : "M-Pesa payment received. Your order has been delivered. Thank you for shopping with us."
          : null;

  // A saved copy of the cart lets the customer retry with the same items.
  const snapshotKey = `cart_snapshot_${id}`;
  const canRetry =
    order.payment_method === "mpesa" &&
    sessionStorage.getItem(snapshotKey) !== null;

  function handleRetry() {
    const saved = sessionStorage.getItem(snapshotKey);
    if (!saved || !order) return;

    try {
      const restored = JSON.parse(saved) as CartItem[];

      if (!Array.isArray(restored) || restored.length === 0) return;

      restoreCart(restored);
      sessionStorage.removeItem(snapshotKey);

      navigate("/checkout", {
        state: {
          prefill: {
            name: order.customer_name,
            email: order.email,
            phone: order.phone,
            address: order.address,
          },
        },
      });
    } catch (restoreError) {
      console.error("Could not restore the cart:", restoreError);
    }
  }  

  // A paid-but-cancelled order is under review, not simply cancelled.
  const badgeLabel =
    view === "review"
      ? "Payment under review"
      : view === "refundPending"
        ? "Refund pending"
        : view === "refunded"
          ? "Refunded"
          : orderStatusLabel(order.status);
  const badgeClassName =
    view === "review"
      ? "bg-amber-100 text-amber-800"
      : view === "refundPending"
        ? "bg-blue-100 text-blue-800"
        : view === "refunded"
          ? "bg-purple-100 text-purple-800"
          : orderStatusClassName(order.status);

  // Calculate the total number of products in the order.
  const itemCount = order.items.reduce(
    (total, item) => total + Number(item.quantity),
    0,
  );

  // Convert the discount to a number.
  const discountTotal = Number(order.discount_total) || 0;

  // Convert the database timestamp into a JavaScript Date.
  const createdAt = new Date(order.created_at);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {headingFor(view, promptNotSent, order.payment_method)}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <p className="text-gray-700">
            Order ID:{" "}
            <span className="font-mono text-gray-900">{order.order_id}</span>
          </p>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassName}`}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {createdAt.toLocaleDateString()}{" "}
          {createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery details */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Delivery details
            </h2>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="mt-0.5 text-gray-900">{order.customer_name}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="mt-0.5 text-gray-900">{order.email}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="mt-0.5 text-gray-900">{order.phone}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="mt-0.5 text-gray-900 whitespace-pre-line">
                  {order.address}
                </dd>
              </div>
            </dl>
          </section>

          {/* Payment */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Payment
            </h2>

            <p className="text-sm text-gray-900">
              {paymentMethodLabel(order.payment_method)}
            </p>

            <div
              className="mt-1 flex items-start gap-2 text-sm text-gray-500"
              aria-live="polite"
            >
              {view === "awaiting" && !promptNotSent && (
                <div
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-gray-300 border-t-orange-600 animate-spin"
                  aria-hidden="true"
                ></div>
              )}
              <p>{statusMessage ?? displayMessage}</p>
            </div>

            {(view === "failed" || promptNotSent) && (
              <div className="mt-4">
                {canRetry ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="w-full rounded-full bg-orange-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
                  >
                    Try again
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Start a new order
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Order summary
            </h2>

            <ul className="space-y-4">
              {order.items.map((item, index) => {
                const variantLabel = [
                  item.selected_color,
                  item.selected_storage,
                  item.selected_size,
                ]
                  .filter(Boolean)
                  .join(" \u00b7 ");

                const lineTotal =
                  Number(item.unit_price) * Number(item.quantity);

                return (
                  <li
                    key={`${item.product_id}-${index}`}
                    className="flex gap-3"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-16 w-16 shrink-0 rounded-md object-cover bg-white"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 shrink-0 rounded-md bg-gray-100"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product_name}
                      </p>

                      {variantLabel && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {variantLabel}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {order.currency} {lineTotal.toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Order totals */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span>Subtotal</span>

                  <span className="text-gray-400 text-xs">
                    {" "}
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                </div>

                <span>
                  {order.currency} {Number(order.subtotal).toLocaleString()}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <span>Discount</span>

                  <span>
                    - {order.currency} {discountTotal.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
                <span>Total</span>

                <span>
                  {order.currency} {Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="mt-6 block w-full rounded-full bg-orange-600 px-6 py-3 text-center text-white transition-colors hover:bg-orange-700"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}