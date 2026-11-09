import { Link } from "react-router-dom";
import { useReviewCount } from "./reviewCountContext";

const cards = [
  {
    key: "review",
    title: "Payments to review",
    description: "Customers who paid for orders that were already cancelled.",
    to: "/admin/review",
  },
  {
    key: "orders",
    title: "Orders",
    description: "Search orders, update shipping and handle cancellations.",
    to: "/admin/orders",
  },
  {
    key: "products",
    title: "Products",
    description: "Add, edit and hide products.",
    to: "/admin/products",
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
      <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        You are signed in as an admin.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const highlight = card.key === "review" && waiting;

          return (
            <li
              key={card.key}
              className={`flex flex-col rounded-lg bg-white p-5 shadow-sm ${
                highlight ? "ring-2 ring-amber-300" : ""
              }`}
            >
              <h2 className="text-base font-semibold text-gray-900">
                {card.title}
              </h2>
              <div className="flex flex-col grow justify-between">
              <p className="mt-2 text-sm text-gray-500">{card.description}</p>

              {card.key === "review" && counts && (
                <p
                  className={`mt-3 text-sm ${
                    waiting ? "font-medium text-amber-700" : "text-gray-500"
                  }`}
                >
                  {waiting ? summary : "Nothing waiting."}
                </p>
              )}

              <Link
                to={card.to}
                className=" mt-3 inline-block text-sm text-orange-600 hover:underline"
              >
                Open
              </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}