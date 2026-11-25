import { Card } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function ItemsCard({ order }: { order: OrderDetail }) {
  return (
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
                <p className="font-medium text-gray-900">{item.product_name}</p>

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
              - {order.currency} {Number(order.discount_total).toLocaleString()}
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
  );
}
