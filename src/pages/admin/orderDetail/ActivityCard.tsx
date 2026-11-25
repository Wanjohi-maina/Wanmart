import { titleCase } from "../orderUi";
import type { OrderDetail } from "./types";

export default function ActivityCard({ order }: { order: OrderDetail }) {
  return (
    <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <summary className="cursor-pointer text-base font-semibold text-gray-900 transition hover:text-orange-600">
        Activity
      </summary>

      {order.history.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No admin actions yet.</p>
      ) : (
        <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
          {order.history.map((entry, index) => (
            <li
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3"
            >
              <p className="text-gray-900">{titleCase(entry.action)}</p>

              {(entry.details?.note || entry.details?.reference) && (
                <p className="text-gray-600">
                  {[entry.details.reference, entry.details.note]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              <p className="text-xs leading-relaxed text-gray-500">
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
