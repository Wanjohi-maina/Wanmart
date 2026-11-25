import { Card, Field } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function DeliveryCard({
  order,
  isMatatu,
}: {
  order: OrderDetail;
  isMatatu: boolean;
}) {
  if (!order.delivery_label) return null;

  return (
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
              <span className="whitespace-pre-line">{order.delivery_notes}</span>
            </Field>
          </div>
        )}
      </dl>
    </Card>
  );
}
