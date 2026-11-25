import { Mail, MapPin, Phone, Truck, UserRound } from "lucide-react";
import type { OrderConfirmation } from "./types";

export default function DeliveryDetails({ order }: { order: OrderConfirmation }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
          <Truck className="h-5 w-5 text-orange-600" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            Delivery details
          </h2>

          <p className="text-xs text-gray-500">
            Information provided for this order
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <UserRound className="h-3.5 w-3.5" />
            Customer name
          </dt>

          <dd className="mt-1.5 text-sm font-medium text-gray-900">
            {order.customer_name}
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Mail className="h-3.5 w-3.5" />
            Email address
          </dt>

          <dd className="mt-1.5 break-all text-sm text-gray-900">
            {order.email}
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Phone className="h-3.5 w-3.5" />
            Phone number
          </dt>

          <dd className="mt-1.5 text-sm text-gray-900">
            {order.phone}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            Delivery address
          </dt>

          <dd className="mt-1.5 whitespace-pre-line text-sm leading-6 text-gray-900">
            {order.address}
          </dd>
        </div>

        {/* Selected delivery method and destination */}
        {order.delivery_label && (
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Truck className="h-3.5 w-3.5" />
              Delivery
            </dt>

            <dd className="mt-1.5 text-sm font-medium text-gray-900">
              {order.delivery_method === "matatu"
                ? "Matatu SACCO"
                : "Courier delivery"}
              : {order.delivery_label}
            </dd>
          </div>
        )}

        {/* Additional delivery instructions */}
        {order.delivery_notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-500">
              Delivery notes
            </dt>

            <dd className="mt-1.5 whitespace-pre-line text-sm leading-6 text-gray-900">
              {order.delivery_notes}
            </dd>
          </div>
        )}
        
        {order.dispatch &&
          (order.dispatch.reference || order.dispatch.note) && (
            <div>
              <dt className="text-gray-500 text-xs">Dispatch details</dt>
              <dd className="text-sm mt-0.5 text-gray-900 whitespace-pre-line">
                {[order.dispatch.reference, order.dispatch.note]
                  .filter(Boolean)
                  .join("\n")}
              </dd>
            </div>
          )}
      </dl>
    </section>
  );
}