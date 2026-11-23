
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Package,
  Truck,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { useReviewCount } from "./reviewCountContext";

const cards = [
  {
    key: "review",
    title: "Payments to review",
    description:
      "Review late payments, make decisions and record refunds.",
    to: "/admin/review",
    icon: CreditCard,
  },
  {
    key: "orders",
    title: "Orders",
    description:
      "Search orders, update shipping and handle cancellations.",
    to: "/admin/orders",
    icon: ClipboardList,
  },
  {
    key: "products",
    title: "Products",
    description:
      "Add, edit and manage your product catalogue.",
    to: "/admin/products",
    icon: Package,
  },
  {
    key: "delivery",
    title: "Delivery",
    description:
      "Manage delivery areas, matatu routes and fees.",
    to: "/admin/delivery",
    icon: Truck,
  },
];

export default function AdminHome() {
  const { counts } = useReviewCount();

  const waiting = counts !== null && counts.total > 0;

  const summary = counts
    ? [
        counts.needsDecision > 0 &&
          (counts.needsDecision === 1
            ? "1 needs a decision"
            : `${counts.needsDecision} need a decision`),
        counts.refundPending > 0 &&
          `${counts.refundPending} ${
            counts.refundPending === 1 ? "refund" : "refunds"
          } to record`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div>
      {/* Dashboard heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your store, orders and delivery operations.
        </p>
      </div>

      {/* Navigation cards */}
      <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const highlight = card.key === "review" && waiting;
          const Icon = card.icon;

          return (
            <li key={card.key} className="min-w-0">
              <Link
                to={card.to}
                className={`group flex h-full min-h-52 flex-col rounded-xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${
                  highlight
                    ? "border-amber-200"
                    : "border-gray-200"
                }`}
              >
                {/* Icon and status */}
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                      highlight
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  {highlight && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Action needed
                    </span>
                  )}
                </div>

                {/* Card content */}
                <div className="mt-5 flex-1">
                  <h2 className="text-base font-semibold text-gray-900">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {card.description}
                  </p>

                  {card.key === "review" && counts !== null && (
                    <p
                      className={`mt-3 text-xs leading-5 ${
                        waiting
                          ? "font-medium text-amber-700"
                          : "text-gray-500"
                      }`}
                    >
                      {waiting ? summary : "Nothing waiting for review."}
                    </p>
                  )}
                </div>

                {/* Card link indicator */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-medium text-orange-600">
                    Open
                  </span>

                  <ArrowUpRight className="h-4 w-4 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-600" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
