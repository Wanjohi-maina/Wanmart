import type { OrderConfirmation } from "./types";

type OrderHeadingProps = {
  order: OrderConfirmation;
  heading: string;
  badgeLabel: string;
  badgeClassName: string;
  createdAt: Date;
};

export default function OrderHeading({
  order,
  heading,
  badgeLabel,
  badgeClassName,
  createdAt,
}: OrderHeadingProps) {
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {heading}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {createdAt.toLocaleDateString()}{" "}
            {createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Order reference
        </span>

        <span className="break-all font-mono text-sm font-medium text-gray-900">
          {order.order_id}
        </span>
      </div>
    </div>
  );
}