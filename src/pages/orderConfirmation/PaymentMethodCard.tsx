import { CreditCard, ShieldCheck } from "lucide-react";
import type { PaymentView } from "./types";

type PaymentMethodCardProps = {
  view: PaymentView;
  methodLabel: string;
};

export default function PaymentMethodCard({
  view,
  methodLabel,
}: PaymentMethodCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <CreditCard className="h-5 w-5 text-gray-600" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            Payment method
          </h2>

          <p className="text-xs text-gray-500">
            How this order is being paid
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {methodLabel}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {view === "cod"
              ? "Payment is due when you receive your order."
              : "Payment status is updated automatically."}
          </p>
        </div>

        <ShieldCheck className="h-5 w-5 shrink-0 text-gray-400" />
      </div>
    </section>
  );
}
