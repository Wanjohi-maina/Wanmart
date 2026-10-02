import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";

type PaymentMethod = "mpesa" | "cash_on_delivery";

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate the original subtotal before discounts.
  const originalSubtotal = items.reduce((total, item) => {
    const originalPrice = item.originalUnitPrice ?? item.unitPrice;

    return total + originalPrice * item.quantity;
  }, 0);

  // Calculate the total discount.
  const totalDiscount = originalSubtotal - totalPrice;

  // If the cart is empty, there is nothing to check out.
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Your cart is empty.</p>

        <Link to="/" className="text-orange-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); // Clear any previous error.

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      phone.trim() === "" ||
      address.trim() === ""
    ) {
      setError("Name, email, phone, and address are required.");
      return;
    }
    setSubmitting(true);

    try {
      //Convert the cart items into the format expected by the create_order() SQL function
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.selectedColor ?? null,
        storage: item.selectedStorage ?? null,
        size: item.selectedSize ?? null,
      }));
      //Call the secure database function
      const { data, error: orderError } = await supabase.rpc("create_order", {
        p_customer_name: name.trim(),
        p_email: email.trim(),
        p_phone: phone.trim(),
        p_address: address.trim(),
        p_items: orderItems,
        p_payment_method: paymentMethod,
      });
      // Handle any errors returned by the database function
      if (orderError) {
        setError(
          orderError.message ||
            "We could not create your order. Please try again.",
        );
        return;
      }
      // Make sure the database actually returned an order ID.
      if (!data?.order_id) {
        setError("Order was created, but no order ID was returned.");
        return;
      }

      clearCart(); // Clear the cart after successful order creation.
      navigate(`/order-confirmation/${data.order_id}`); // Navigate to the order confirmation page with the order ID.
    } catch (error) {
      console.error("Error creating order:", error);
      setError(
        "Something went wrong while placing your order. Please try again.",
      );
    } finally {
      setSubmitting(false); // Reset the submitting state regardless of success or failure.
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your details and choose your payment method.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Customer Information
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0700 456 789"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="123 Main St, Nairobi, Kenya"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </section>
          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Payment Method
            </h2>
            <div className="space-y-3">
              {/* Mpesa  */}
              <label
                className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                  paymentMethod === "mpesa"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    onChange={() => setPaymentMethod("mpesa")}
                    checked={paymentMethod === "mpesa"}
                    disabled={submitting}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">M-Pesa</p>

                    <p className="mt-1 text-xs text-gray-500">
                      Pay securely using M-Pesa.
                    </p>
                  </div>
                </div>
              </label>
              {/* Cash on Delivery */}
              <label
                className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    onChange={() => setPaymentMethod("cash_on_delivery")}
                    checked={paymentMethod === "cash_on_delivery"}
                    className="mt-1"
                    disabled={submitting}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Cash on Delivery
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Pay when you receive your order.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>
          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg bg-gray-50 p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>
            {/* Cart items */}
            <ul className="space-y-4">
              {items.map((item) => {
                // Build a readable variant label
                const variantLabel = [
                  item.selectedColor,
                  item.selectedStorage,
                  item.selectedSize,
                ]
                  .filter(Boolean)
                  .join(" \u00b7 ");

                // Use the selected color image for electronics
                const displayImage =
                  item.product.kind === "electronics" && item.selectedColor
                    ? item.product.colorImages[item.selectedColor]
                    : item.product.imageUrl;

                // Calculate the line total.
                const lineTotal = item.unitPrice * item.quantity;

                return (
                  <li
                    key={`${item.product.id}|${item.selectedColor ?? ""}|${item.selectedStorage ?? ""}|${item.selectedSize ?? ""}`}
                    className="flex gap-3"
                  >
                    <img
                      src={displayImage}
                      alt={item.product.name}
                      className="h-16 w-16 shrink-0 rounded-md object-cover bg-white"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
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
                      KSh {lineTotal.toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>
            {/* Price Summary */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                    <span> Subtotal </span>
                    <span className=" text-gray-400 text-xs">
                        ({totalItems}{" "}{totalItems === 1 ? "item" : "items"})
                    </span>
                </div>
                <span>
                  KSh {originalSubtotal.toLocaleString()}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <span>Discount</span>

                  <span>
                    - KSh {totalDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
                <span>Total</span>

                <span>
                  KSh {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            {/* Place order button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-orange-600 px-6 py-3 text-center text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
               {submitting ? "Placing Order..." : "Place Order"} 
            </button>
            {/* Return to cart */}
            <Link to="/cart" className="mt-3 block text-center text-sm text-gray-500 hover:text-orange-600">
              ← Return to Cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
