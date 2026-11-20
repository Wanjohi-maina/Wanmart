
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types";
import CheckoutProgress from "../components/CheckoutProgress";

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

  // Delivery information
  delivery_method: string | null;
  delivery_label: string | null;
  delivery_fee: number | null;
  delivery_notes: string | null;

  currency: string;
  subtotal: number;
  discount_total: number;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  items: OrderConfirmationItem[];
};

// Polling settings
const FAST_POLL_MS = 4000;
const SLOW_POLL_MS = 15000;
const FAST_WINDOW_MS = 3 * 60 * 1000;
const STOP_AWAITING_AFTER_MS = 30 * 60 * 1000;
const STATUS_POLL_MS = 20000;
const STOP_STATUS_AFTER_MS = 2 * 60 * 60 * 1000;

type PaymentView =
  | "awaiting"
  | "paid"
  | "failed"
  | "review"
  | "refundPending"
  | "cod"
  | "refunded";

// Determine the payment state from the database values
function getPaymentView(order: OrderConfirmation): PaymentView {
  if (order.payment_status === "refunded") return "refunded";

  if (order.payment_status === "paid") {
    if (order.status !== "cancelled") return "paid";

    return order.payment_resolution_status === "refund_pending"
      ? "refundPending"
      : "review";
  }

  if (order.payment_status === "failed") return "failed";
  if (order.payment_method === "mpesa") return "awaiting";

  return "cod";
}

// Determine how long to wait before polling again
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

    return sincePageLoad < FAST_WINDOW_MS
      ? FAST_POLL_MS
      : SLOW_POLL_MS;
  }

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

// Visual styles for each payment state
function paymentViewStyles(view: PaymentView) {
  switch (view) {
    case "paid":
      return {
        icon: CheckCircle2,
        container: "border-green-200 bg-green-50",
        iconColor: "text-green-600",
        titleColor: "text-green-900",
      };

    case "awaiting":
      return {
        icon: Clock3,
        container: "border-orange-200 bg-orange-50",
        iconColor: "text-orange-600",
        titleColor: "text-orange-900",
      };

    case "failed":
      return {
        icon: CircleAlert,
        container: "border-red-200 bg-red-50",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
      };

    case "review":
      return {
        icon: CircleAlert,
        container: "border-amber-200 bg-amber-50",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
      };

    case "refundPending":
      return {
        icon: RotateCcw,
        container: "border-blue-200 bg-blue-50",
        iconColor: "text-blue-600",
        titleColor: "text-blue-900",
      };

    case "refunded":
      return {
        icon: CheckCircle2,
        container: "border-purple-200 bg-purple-50",
        iconColor: "text-purple-600",
        titleColor: "text-purple-900",
      };

    default:
      return {
        icon: CreditCard,
        container: "border-gray-200 bg-gray-50",
        iconColor: "text-gray-600",
        titleColor: "text-gray-900",
      };
  }
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restoreCart } = useCart();

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

      // Get the access token saved when the order was created
      const accessToken = sessionStorage.getItem(
        `order_access_token_${id}`,
      );

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

          if (!lastOrder) {
            setError(
              orderError.message.toLowerCase().includes("order not found")
                ? "We could not find this order."
                : orderError.message,
            );
          }
        } else if (!data) {
          if (!lastOrder) {
            setError("We could not find this order.");
          }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] px-4 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your order...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait while we retrieve your order details.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-[60vh] px-4 py-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <CircleAlert className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-gray-900">
            Unable to load your order
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error ?? "We could not find this order."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const view = getPaymentView(order);
  const initiation = order.mpesa_initiation_status;

  // The prompt never reached the customer's phone
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

  // Determine the shipping status message
  const statusMessage =
    order.status === "shipped" && view === "paid"
      ? order.payment_method === "cash_on_delivery"
        ? "Your order is on its way."
        : "M-Pesa payment received. Your order is on its way."
      : order.status === "shipped" && view === "cod"
        ? "Your order is on its way. Pay when you receive it."
        : order.status === "delivered" && view === "paid"
          ? order.payment_method === "cash_on_delivery"
            ? "Your order has been delivered and paid for. Thank you for shopping with us."
            : "M-Pesa payment received. Your order has been delivered. Thank you for shopping with us."
          : null;

  // Saved cart snapshot allows the customer to retry an M-Pesa payment
  const snapshotKey = `cart_snapshot_${id}`;

  const canRetry =
    order.payment_method === "mpesa" &&
    sessionStorage.getItem(snapshotKey) !== null;

  function handleRetry() {
    const saved = sessionStorage.getItem(snapshotKey);

    if (!saved || !order) return;

    try {
      const snapshot = JSON.parse(saved) as
        | CartItem[]
        | {
            items?: CartItem[];
            delivery?: {
              deliveryMethod?: string;
              areaId?: string;
              townId?: string;
              routeId?: string;
              deliveryNotes?: string;
            };
          };
      const restored = Array.isArray(snapshot) ? snapshot : snapshot.items;

      if (!Array.isArray(restored) || restored.length === 0) return;

      const delivery = Array.isArray(snapshot) ? undefined : snapshot.delivery;

      restoreCart(restored);
      sessionStorage.removeItem(snapshotKey);

      navigate("/checkout", {
        state: {
          prefill: {
            name: order.customer_name,
            email: order.email,
            phone: order.phone,
            address: order.address,
            deliveryMethod:
              delivery?.deliveryMethod ?? order.delivery_method ?? undefined,
            areaId: delivery?.areaId,
            townId: delivery?.townId,
            routeId: delivery?.routeId,
            deliveryNotes:
              delivery?.deliveryNotes ?? order.delivery_notes ?? undefined,
          },
        },
      });
    } catch (restoreError) {
      console.error("Could not restore the cart:", restoreError);
    }
  }

  // Determine the order status badge
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

  const itemCount = order.items.reduce(
    (total, item) => total + Number(item.quantity),
    0,
  );

  const discountTotal = Number(order.discount_total) || 0;
  const createdAt = new Date(order.created_at);

  const paymentStyles = paymentViewStyles(view);
  const PaymentIcon = paymentStyles.icon;

  return (
    <div className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Checkout progress */}
        <CheckoutProgress currentStep="confirmation" />

        {/* Order heading */}
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                {headingFor(view, promptNotSent, order.payment_method)}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {createdAt.toLocaleDateString()}{" "}
                {createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClassName}`}
            >
              {badgeLabel}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Order reference
            </span>

            <span className="break-all font-mono text-sm font-medium text-gray-900">
              {order.order_id}
            </span>
          </div>
        </div>

        {/* Payment status */}
        <section
          className={`mt-6 rounded-2xl border p-5 sm:p-6 ${paymentStyles.container}`}
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80">
              <PaymentIcon
                className={`h-6 w-6 ${paymentStyles.iconColor}`}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className={`font-semibold ${paymentStyles.titleColor}`}>
                {view === "awaiting" && !promptNotSent
                  ? "Payment awaiting confirmation"
                  : view === "paid"
                    ? "Payment successful"
                    : view === "failed"
                      ? "Payment unsuccessful"
                      : view === "review"
                        ? "Payment needs review"
                        : view === "refundPending"
                          ? "Refund being processed"
                          : view === "refunded"
                            ? "Payment refunded"
                            : "Cash on delivery"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-700">
                {statusMessage ?? displayMessage}
              </p>

              {view === "awaiting" && !promptNotSent && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-orange-800">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                  Checking payment status automatically
                </div>
              )}

              {(view === "failed" || promptNotSent) && (
                <div className="mt-4">
                  {canRetry ? (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  ) : (
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline"
                    >
                      Start a new order
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          {/* Order information */}
          <div className="space-y-6">
            {/* Delivery details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Delivery details
                  </h2>

                  <p className="text-xs text-gray-500">
                    Information provided for this order
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <UserRound className="h-3.5 w-3.5" />
                    Customer name
                  </dt>

                  <dd className="mt-1.5 text-sm font-medium text-gray-900">
                    {order.customer_name}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    Email address
                  </dt>

                  <dd className="mt-1.5 break-all text-sm text-gray-900">
                    {order.email}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    Phone number
                  </dt>

                  <dd className="mt-1.5 text-sm text-gray-900">
                    {order.phone}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Delivery address
                  </dt>

                  <dd className="mt-1.5 whitespace-pre-line text-sm leading-6 text-gray-900">
                    {order.address}
                  </dd>
                </div>

                {/* Selected delivery method and destination */}
                {order.delivery_label && (
                  <div className="sm:col-span-2">
                    <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Truck className="h-3.5 w-3.5" />
                      Delivery
                    </dt>

                    <dd className="mt-1.5 text-sm font-medium text-gray-900">
                      {order.delivery_method === "matatu"
                        ? "Matatu SACCO"
                        : "Courier delivery"}
                      : {order.delivery_label}
                    </dd>
                  </div>
                )}

                {/* Additional delivery instructions */}
                {order.delivery_notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Delivery notes
                    </dt>

                    <dd className="mt-1.5 whitespace-pre-line text-sm leading-6 text-gray-900">
                      {order.delivery_notes}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Payment method */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Payment method
                  </h2>

                  <p className="text-xs text-gray-500">
                    How this order is being paid
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {paymentMethodLabel(order.payment_method)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {view === "cod"
                      ? "Payment is due when you receive your order."
                      : "Payment status is updated automatically."}
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 shrink-0 text-gray-400" />
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Order summary
                  </h2>

                  <p className="text-xs text-gray-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <ul className="mt-5 divide-y divide-gray-100">
                {order.items.map((item, index) => {
                  const variantLabel = [
                    item.selected_color,
                    item.selected_storage,
                    item.selected_size,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  const lineTotal =
                    Number(item.unit_price) * Number(item.quantity);

                  return (
                    <li
                      key={`${item.product_id}-${index}`}
                      className="flex gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="h-16 w-16 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </p>

                        {variantLabel && (
                          <p className="mt-1 text-xs text-gray-500">
                            {variantLabel}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                        {order.currency} {lineTotal.toLocaleString()}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {/* Order totals */}
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>

                  <span>
                    {order.currency}{" "}
                    {Number(order.subtotal).toLocaleString()}
                  </span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-700">
                    <span>Discount</span>

                    <span className="font-medium">
                      - {order.currency} {discountTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Delivery fee */}
                {order.delivery_label && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Delivery</span>

                    <span>
                      {Number(order.delivery_fee) > 0
                        ? `${order.currency} ${Number(order.delivery_fee).toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    {order.currency}{" "}
                    {Number(order.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                to="/"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Continue shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <ShieldCheck className="h-4 w-4 text-gray-400" />

          <p className="text-xs text-gray-500">
            Your order information is securely retrieved using your order access credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
