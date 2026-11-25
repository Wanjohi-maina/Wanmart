import { Card, Field } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function CustomerCard({ order }: { order: OrderDetail }) {
  return (
    <Card title="Customer">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <Field label="Phone">
          <a href={`tel:${order.phone}`} className="font-medium text-orange-600">
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
  );
}
