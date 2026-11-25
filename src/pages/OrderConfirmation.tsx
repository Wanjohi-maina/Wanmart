import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types";
import CheckoutProgress from "../components/CheckoutProgress";
import type {
  OrderConfirmation,
  PaymentView,
} from "./orderConfirmation/types";
import DeliveryDetails from "./orderConfirmation/DeliveryDetails";
import OrderHeading from "./orderConfirmation/OrderHeading";
import OrderSummary from "./orderConfirmation/OrderSummary";
import PaymentMethodCard from "./orderConfirmation/PaymentMethodCard";
import PaymentStatus from "./orderConfirmation/PaymentStatus";
// Polling settings
const FAST_POLL_MS = 4000;
const SLOW_POLL_MS = 15000;
const FAST_WINDOW_MS = 3 * 60 * 1000;
const STOP_AWAITING_AFTER_MS = 30 * 60 * 1000;
const STATUS_POLL_MS = 20000;
const STOP_STATUS_AFTER_MS = 2 * 60 * 60 * 1000;

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

    return sincePageLoad < FAST_WINDOW_MS ? FAST_POLL_MS : SLOW_POLL_MS;
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

function headingFor(view: PaymentView, promptNotSent: boolean, method: string) {
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
      const accessToken = sessionStorage.getItem(`order_access_token_${id}`);

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

  return (
    <div className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Checkout progress */}
        <CheckoutProgress currentStep="confirmation" />

        <OrderHeading
          order={order}
          heading={headingFor(view, promptNotSent, order.payment_method)}
          badgeLabel={badgeLabel}
          badgeClassName={badgeClassName}
          createdAt={createdAt}
        />
        <PaymentStatus
          view={view}
          promptNotSent={promptNotSent}
          statusMessage={statusMessage}
          displayMessage={displayMessage}
          canRetry={canRetry}
          handleRetry={handleRetry}
          styles={paymentStyles}
        />
        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          {/* Order information */}
          <div className="space-y-6">
            <DeliveryDetails order={order} />

            <PaymentMethodCard
              view={view}
              methodLabel={paymentMethodLabel(order.payment_method)}
            />
          </div>

          <OrderSummary
            order={order}
            itemCount={itemCount}
            discountTotal={discountTotal}
          />
        </div>

        {/* Bottom reassurance */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <ShieldCheck className="h-4 w-4 text-gray-400" />

          <p className="text-xs text-gray-500">
            Your order information is securely retrieved using your order access
            credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
