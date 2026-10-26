import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Badge,
  methodLabel,
  orderStatusClass,
  paymentStatusClass,
  titleCase,
} from "./orderUi";

type OrderRow = {
  order_id: string;
  customer_name: string;
  phone: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_resolution_status: string;
  total: number;
  currency: string;
  created_at: string;
  item_count: number;
};

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ignore responses from outdated requests.
  const requestId = useRef(0);

  // Wait until the admin stops typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);

    supabase
      .rpc("admin_list_orders", {
        p_status: status || undefined,
        p_search: search || undefined,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      })
      .then(({ data, error: rpcError }) => {
        if (id !== requestId.current) return;

        setLoading(false);

        if (rpcError) {
          setError(rpcError.message);
          return;
        }

        const result = data as unknown as {
          total: number;
          orders: OrderRow[];
        };

        setError(null);
        setOrders(result.orders);
        setTotal(Number(result.total));
      });
  }, [status, search, page]);

  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
        Orders
      </h1>

      {/* Search */}
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search name, phone, email, order ID or receipt"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />

      {/* Status filters */}
      <div className="-mx-4 mt-3 overflow-x-auto px-4">
        <div className="flex gap-2 whitespace-nowrap pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(0);
              }}
              className={`rounded-full px-4 py-2 text-sm ${
                status === filter.value
                  ? "bg-orange-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-gray-900">No orders found.</p>
        </div>
      )}

      {orders.length > 0 && (
        <ul
          className={`mt-4 space-y-3 ${loading ? "opacity-60" : ""}`}
          aria-busy={loading}
        >
          {orders.map((order) => (
            <li key={order.order_id}>
              <Link
                to={`/admin/orders/${order.order_id}`}
                className="block rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {order.customer_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {order.order_id.slice(0, 8)} ·{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <p className="shrink-0 font-medium text-gray-900">
                    {order.currency} {Number(order.total).toLocaleString()}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className={orderStatusClass(order.status)}>
                    {titleCase(order.status)}
                  </Badge>
                  <Badge className={paymentStatusClass(order.payment_status)}>
                    {titleCase(order.payment_status)}
                  </Badge>
                  {order.payment_resolution_status !== "none" && (
                    <Badge className="bg-amber-100 text-amber-800">
                      {order.payment_resolution_status === "refunded"
                        ? "Refunded"
                        : "Payment review"}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {methodLabel(order.payment_method)} · {order.item_count}{" "}
                    {Number(order.item_count) === 1 ? "item" : "items"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            {from}–{to} of {total}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={to >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}