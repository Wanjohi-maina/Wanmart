import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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
  currency: string;
  subtotal: number;
  discount_total: number;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  items: OrderConfirmationItem[];
};

function paymentMethodLabel(method: string) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "cash_on_delivery") return "Cash on Delivery";
  return method;
}

function paymentMessage(method: string, paymentStatus: string) {
  if (paymentStatus === "failed") {
    return "The payment was not completed and the order has been cancelled.";
  }
  if (method === "cash_on_delivery" && paymentStatus === "paid") {
    return "Your order has been paid for and will be delivered soon.";
  }
  if (method === "cash_on_delivery") {
    return "Pay when you receive your order.";
  }

  if (method === "mpesa" && paymentStatus === "paid") {
    return "M-Pesa payment received.";
  }

  if (method === "mpesa") {
    return "Complete your M-Pesa payment. We will confirm the order once payment is received.";
  }

  return "Your order has been placed.";
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

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No order ID was provided.");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const { data, error: orderError } = await supabase.rpc(
          "get_order_confirmation",
          {
            p_order_id: id,
          },
        );

        // Supabase returned an error.
        if (orderError) {
          console.error("Error fetching order:", orderError);

          setError(
            orderError.message.toLowerCase().includes("order not found")
              ? "We could not find this order."
              : orderError.message,
          );

          return;
        }

        // No order was returned.
        if (!data) {
          setError("We could not find this order.");
          return;
        }

        // Store the order in state.
        setOrder(data as OrderConfirmation);
      } catch (error) {
        console.error("Error fetching order:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the order.",
        );
      } finally {
        // Stop showing the loading spinner.
        setLoading(false);
      }
    }

    fetchOrder();
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
          Thank you for your order
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <p className="text-gray-700">
            Order ID:{" "}
            <span className="font-mono text-gray-900">
              {order.order_id}
            </span>
          </p>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusClassName(order.status)}`}
          >
            {orderStatusLabel(order.status)}
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
                <dd className="mt-0.5 text-gray-900">
                  {order.customer_name}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="mt-0.5 text-gray-900">
                  {order.email}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="mt-0.5 text-gray-900">
                  {order.phone}
                </dd>
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

            <p className="mt-1 text-sm text-gray-500">
              {paymentMessage(
                order.payment_method,
                order.payment_status,
              )}
            </p>
          </section>
        </div>

        {/* Right side - Order summary */}
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
                    ({itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"})
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