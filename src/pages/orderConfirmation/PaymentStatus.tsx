import { ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { PaymentView, PaymentViewStyles } from "./types";

type PaymentStatusProps = {
  view: PaymentView;
  promptNotSent: boolean;
  statusMessage: string | null;
  displayMessage: string;
  canRetry: boolean;
  handleRetry: () => void;
  styles: PaymentViewStyles;
};

export default function PaymentStatus({
  view,
  promptNotSent,
  statusMessage,
  displayMessage,
  canRetry,
  handleRetry,
  styles,
}: PaymentStatusProps) {
  const PaymentIcon = styles.icon;

  return (
    <section
      className={`mt-6 rounded-2xl border p-5 sm:p-6 ${styles.container}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80">
          <PaymentIcon
            className={`h-6 w-6 ${styles.iconColor}`}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold ${styles.titleColor}`}>
            {view === "awaiting" && !promptNotSent
              ? "Payment awaiting confirmation"
              : view === "paid"
                ? "Payment successful"
                : view === "failed"
                  ? "Payment unsuccessful"
                  : view === "review"
                    ? "Payment needs review"
                    : view === "refundPending"
                      ? "Refund being processed"
                      : view === "refunded"
                        ? "Payment refunded"
                        : "Cash on delivery"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-700">
            {statusMessage ?? displayMessage}
          </p>

          {view === "awaiting" && !promptNotSent && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-orange-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Checking payment status automatically
            </div>
          )}

          {(view === "failed" || promptNotSent) && (
            <div className="mt-4">
              {canRetry ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline"
                >
                  Start a new order
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}