import { methodLabel } from "../orderUi";
import { Card, Field } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function PaymentCard({ order }: { order: OrderDetail }) {
  return (
    <Card title="Payment">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <Field label="Method">{methodLabel(order.payment_method)}</Field>

        <Field label="Receipt or reference">
          <span className="font-mono">{order.payment_reference ?? "None"}</span>
        </Field>

        {order.refund_reference && (
          <Field label="Refund reference">
            <span className="font-mono">{order.refund_reference}</span>
          </Field>
        )}

        {order.resolution_note && (
          <div className="sm:col-span-2">
            <Field label="Note">{order.resolution_note}</Field>
          </div>
        )}
      </dl>
    </Card>
  );
}
