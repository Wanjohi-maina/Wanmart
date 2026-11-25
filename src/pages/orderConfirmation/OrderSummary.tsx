import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrderConfirmation } from "./types";

type OrderSummaryProps = {
  order: OrderConfirmation;
  itemCount: number;
  discountTotal: number;
};

export default function OrderSummary({
  order,
  itemCount,
  discountTotal,
}: OrderSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">Order summary</h2>

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
              {order.currency} {Number(order.subtotal).toLocaleString()}
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
            <span className="font-semibold text-gray-900">Total</span>

            <span className="text-xl font-bold text-gray-900">
              {order.currency} {Number(order.total).toLocaleString()}
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
  );
}