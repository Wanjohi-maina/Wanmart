
import { Check } from "lucide-react";

type CheckoutStep = "cart" | "checkout" | "confirmation";

type CheckoutProgressProps = {
  currentStep: CheckoutStep;
};

const steps: { id: CheckoutStep; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "confirmation", label: "Confirmation" },
];

export default function CheckoutProgress({
  currentStep,
}: CheckoutProgressProps) {
  // Find the position of the current step.
  const currentIndex = steps.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <nav
      aria-label="Checkout progress"
      className="mt-7 w-full max-w-xl"
    >
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li
              key={step.id}
              className={`flex items-center ${
                index !== steps.length - 1 ? "flex-1" : ""
              }`}
              aria-current={active ? "step" : undefined}
            >
              {/* Step circle and label */}
              <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                    completed
                      ? "bg-orange-600 text-white"
                      : active
                        ? "bg-orange-600 text-white ring-4 ring-orange-100"
                        : "border border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  {completed ? (
                    <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={`whitespace-nowrap text-[11px] sm:text-sm ${
                    active
                      ? "font-semibold text-orange-600"
                      : completed
                        ? "font-medium text-gray-700"
                        : "font-medium text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index !== steps.length - 1 && (
                <div
                  className={`mx-2 h-px min-w-3 flex-1 sm:mx-3 ${
                    completed ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
