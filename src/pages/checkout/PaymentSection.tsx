import { CreditCard } from "lucide-react";
import type { PaymentMethod } from "./types";
import { sectionClass } from "./checkoutUi";

type PaymentSectionProps = {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  isMatatu: boolean;
  submitting: boolean;
};

export default function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  isMatatu,
  submitting,
}: PaymentSectionProps) {
  return (
    <section className={sectionClass}>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <CreditCard
              size={20}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Payment Method
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Select how you would like to pay.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* M-Pesa */}
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
            paymentMethod === "mpesa"
              ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="mpesa"
            onChange={() => setPaymentMethod("mpesa")}
            checked={paymentMethod === "mpesa"}
            disabled={submitting}
            className="mt-1 h-4 w-4 accent-orange-600"
          />

          <span className="flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-900">
                M-Pesa
              </span>

              <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Recommended
              </span>
            </span>

            <span className="mt-1 block text-xs leading-relaxed text-gray-500">
              Pay securely using an STK Push sent to your Safaricom
              number.
            </span>
          </span>
        </label>

        {/* Cash on Delivery */}
        <label
          className={`flex items-start gap-3 rounded-xl border p-4 transition ${
            isMatatu
              ? "cursor-not-allowed border-gray-200 bg-gray-100"
              : paymentMethod === "cash_on_delivery"
                ? "cursor-pointer border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                : "cursor-pointer border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cash_on_delivery"
            onChange={() => setPaymentMethod("cash_on_delivery")}
            checked={paymentMethod === "cash_on_delivery"}
            disabled={submitting || isMatatu}
            className="mt-1 h-4 w-4 accent-orange-600"
          />

          <span className="flex-1">
            <span className="text-sm font-semibold text-gray-900">
              Cash on Delivery
            </span>

            <span className="mt-1 block text-xs leading-relaxed text-gray-500">
              {isMatatu
                ? "Not available with Matatu delivery. Please pay using M-Pesa."
                : "Pay when you receive your order."}
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}