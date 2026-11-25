import { titleCase } from "../orderUi";
import { Field } from "./orderDetailUi";
import type { OrderDetail } from "./types";

export default function SystemDetails({ order }: { order: OrderDetail }) {
  return (
    <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <summary className="cursor-pointer text-base font-semibold text-gray-900 transition hover:text-orange-600">
        System details
      </summary>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
        <Field label="Stock status">{titleCase(order.inventory_status)}</Field>

        <Field label="Payment review">
          {titleCase(order.payment_resolution_status)}
        </Field>

        {order.payment_method === "mpesa" && (
          <Field label="Prompt status">
            {titleCase(order.mpesa_initiation_status)}
          </Field>
        )}

        {order.reservation_expires_at && (
          <Field label="Reservation expires">
            {new Date(order.reservation_expires_at).toLocaleString()}
          </Field>
        )}
      </dl>

      {order.callbacks.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-900">Payment callbacks</p>

          <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
            {order.callbacks.map((callback, index) => (
              <li
                key={index}
                className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3"
              >
                <p className="text-gray-900">
                  Code {callback.result_code}
                  {callback.result_description
                    ? `: ${callback.result_description}`
                    : ""}
                </p>

                <p className="text-xs leading-relaxed text-gray-500">
                  {titleCase(callback.processing_status)} ·{" "}
                  {new Date(callback.received_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </details>
  );
}
