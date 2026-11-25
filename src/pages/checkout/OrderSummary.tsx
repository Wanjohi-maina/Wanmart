import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartItem } from "../../types";
import { kes } from "./checkoutUi";

type OrderSummaryProps = {
  items: CartItem[];
  totalItems: number;
  originalSubtotal: number;
  totalDiscount: number;
  deliveryFee: number | undefined;
  grandTotal: number;
  submitting: boolean;
  optionsLoaded: boolean;
};

export default function OrderSummary({
  items,
  totalItems,
  originalSubtotal,
  totalDiscount,
  deliveryFee,
  grandTotal,
  submitting,
  optionsLoaded,
}: OrderSummaryProps) {
  return (
    <aside className="lg:col-span-1">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Cart items */}
          <ul className="space-y-4">
            {items.map((item) => {
              // Build a readable variant label.
              const variantLabel = [
                item.selectedColor,
                item.selectedStorage,
                item.selectedSize,
              ]
                .filter(Boolean)
                .join(" · ");

              // Use the selected color image for electronics.
              const displayImage =
                item.product.kind === "electronics" && item.selectedColor
                  ? item.product.colorImages[item.selectedColor]
                  : item.product.imageUrl;

              const lineTotal = item.unitPrice * item.quantity;

              return (
                <li
                  key={`${item.product.id}|${item.selectedColor ?? ""}|${item.selectedStorage ?? ""}|${item.selectedSize ?? ""}`}
                  className="flex gap-3"
                >
                  <img
                    src={displayImage}
                    alt={item.product.name}
                    className="h-17 w-17 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
                      {item.product.name}
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
                    {kes(lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Price summary */}
          <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Subtotal</span>

              <span className="text-gray-700">
                {kes(originalSubtotal)}
              </span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Discount</span>

                <span className="font-medium text-green-700">
                  - {kes(totalDiscount)}
                </span>
              </div>
            )}

            {deliveryFee !== undefined && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Delivery Fee</span>

                <span className="text-right text-gray-700">
                  {deliveryFee === 0 ? "Free" : kes(deliveryFee)}
                </span>
              </div>
            )}
          </div>

          {/* Grand total */}
          <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">
            <span className="text-base font-semibold text-gray-900">
              Total
            </span>

            <span className="text-xl font-bold text-gray-900">
              {kes(grandTotal)}
            </span>
          </div>

          {/* Place order */}
          <button
            type="submit"
            disabled={submitting || !optionsLoaded}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />

                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
            By placing your order you agree to our{" "}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>

          <Link
            to="/cart"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition hover:text-orange-600"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            Return to Cart
          </Link>

          <div className="mt-5 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
            <LockKeyhole
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            Secure checkout
          </div>
        </div>
      </aside>
  );
}