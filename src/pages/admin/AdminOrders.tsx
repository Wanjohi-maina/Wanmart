
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
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
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">Total orders</p>
          <p className="text-lg font-semibold tabular-nums text-gray-900">
            {total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <label htmlFor="order-search" className="sr-only">
          Search orders
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            id="order-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search orders..."
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Search by name, phone, email, order ID, or M-Pesa receipt.
        </p>
      </div>

      {/* Status filters */}
      <div className="mt-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={status === filter.value}
              onClick={() => {
                setStatus(filter.value);
                setPage(0);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${
                status === filter.value
                  ? "bg-orange-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && orders.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-gray-300" />

          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            No orders found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or selecting another status filter.
          </p>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Order list
            </h2>
          </div>

          <ul
            className={`space-y-3 transition-opacity ${
              loading ? "opacity-60" : ""
            }`}
            aria-busy={loading}
          >
            {orders.map((order) => (
              <li key={order.order_id}>
                <Link
                  to={`/admin/orders/${order.order_id}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:p-5"
                >
                  {/* Customer and amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {order.customer_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.order_id.slice(0, 8)}
                        {" · "}
                        {new Date(order.created_at).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.phone}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-gray-900 sm:text-base">
                        {order.currency}{" "}
                        {Number(order.total).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {order.item_count}{" "}
                        {Number(order.item_count) === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  {/* Order statuses */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                    <Badge className={orderStatusClass(order.status)}>
                      {titleCase(order.status)}
                    </Badge>

                    <Badge
                      className={paymentStatusClass(order.payment_status)}
                    >
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
                      {methodLabel(order.payment_method)}
                    </span>

                    <ArrowUpRight className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-orange-600" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">{from}–{to}</span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {total.toLocaleString()}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs text-gray-400">
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={to >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
