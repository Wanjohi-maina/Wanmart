import { Link } from "react-router-dom";

const cards = [
  {
    title: "Payments to review",
    description: "Customers who paid for orders that were already cancelled.",
    to: "/admin/review",
  },
  {
    title: "Orders",
    description: "Search orders, update shipping and handle cancellations.",
    to: "/admin/orders",
  },
  {
    title: "Products",
    description: "Add, edit and deactivate products and categories.",
  },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        You are signed in as an admin.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.title} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                {card.title}
              </h2>
              {!card.to && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                  Coming next
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            {card.to && (
              <Link
                to={card.to}
                className="mt-3 inline-block text-sm text-orange-600 hover:underline"
              >
                Open
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}