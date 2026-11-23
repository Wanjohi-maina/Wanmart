import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  PackageCheck,
  PackageX,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LoaderCircle,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Badge } from "./orderUi";
import { KINDS, KIND_LABELS, finalPrice, type Kind } from "./productForm";

type ProductRow = {
  id: string;
  name: string;
  kind: Kind;
  price: number;
  discount_percent: number | null;
  image_url: string;
  category_name: string | null;
  stock: number;
  reserved_stock: number;
  is_active: boolean;
  featured: boolean;
};

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Visible" },
  { value: "inactive", label: "Hidden" },
];

export default function AdminProducts() {
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [products, setProducts] = useState<ProductRow[]>([]);
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
      .rpc("admin_list_products", {
        p_status: status || undefined,
        p_kind: kind || undefined,
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
          products: ProductRow[];
        };

        setError(null);
        setProducts(result.products);
        setTotal(Number(result.total));
      });
  }, [status, kind, search, page]);

  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store's products, pricing, visibility and stock.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
        >
          <Plus size={17} />
          Add product
        </Link>
      </div>

      {/* Success notice */}
      {notice && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          {notice}
        </div>
      )}

      {/* Search and filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or product ID"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Visibility filters */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-fit gap-1 rounded-full bg-gray-100 p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setStatus(filter.value);
                    setPage(0);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    status === filter.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product type filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="shrink-0 text-gray-400" />

            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-48"
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Initial loading */}
      {loading && products.length === 0 && (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-16">
          <LoaderCircle size={28} className="animate-spin text-orange-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Package size={24} className="text-gray-500" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-gray-900">
            No products found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {/* Product list */}
      {products.length > 0 && (
        <section aria-busy={loading}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Product listings
            </h2>

            <p className="text-xs text-gray-500">
              {from}–{to} of {total} products
            </p>
          </div>

          <ul
            className={`space-y-3 transition-opacity ${
              loading ? "opacity-60" : ""
            }`}
          >
            {products.map((product) => {
              const available = product.stock - product.reserved_stock;

              const discounted = product.discount_percent
                ? finalPrice(
                    String(product.price),
                    String(product.discount_percent),
                  )
                : null;

              return (
                <li key={product.id}>
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-orange-200 hover:bg-gray-50/50 sm:items-center sm:gap-4 sm:p-4"
                  >
                    {/* Product image */}
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover sm:h-24 sm:w-24"
                    />

                    {/* Product information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-orange-600 sm:text-base">
                            {product.name}
                          </p>

                          <p className="mt-1 truncate font-mono text-xs text-gray-400">
                            {product.id}
                          </p>

                          {product.category_name && (
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {product.category_name}
                            </p>
                          )}
                        </div>

                        <ChevronRight
                          size={19}
                          className="mt-1 hidden shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 sm:block"
                        />
                      </div>

                      {/* Price */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-gray-900">
                          KES{" "}
                          {discounted !== null
                            ? discounted.toLocaleString()
                            : Number(product.price).toLocaleString()}
                        </span>

                        {discounted !== null && (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              KES {Number(product.price).toLocaleString()}
                            </span>
                            <Badge className="bg-red-50 text-red-700">
                              {product.discount_percent}% off
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Stock information */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            available <= 0 ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          {available <= 0 ? (
                            <PackageX size={14} />
                          ) : (
                            <PackageCheck size={14} />
                          )}

                          {available <= 0
                            ? "Out of stock"
                            : `${available} available`}
                        </span>

                        {product.reserved_stock > 0 && (
                          <span className="text-xs text-gray-500">
                            {product.reserved_stock} reserved
                          </span>
                        )}
                      </div>

                      {/* Product badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-700">
                          {KIND_LABELS[product.kind] ?? product.kind}
                        </Badge>

                        {!product.is_active && (
                          <Badge className="bg-amber-100 text-amber-800">
                            Hidden
                          </Badge>
                        )}

                        {product.featured && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <span className="inline-flex items-center gap-1">
                              <Star size={11} />
                              Featured
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Mobile navigation indicator */}
                    <ChevronRightIcon
                      size={18}
                      className="mt-1 shrink-0 text-gray-400 sm:hidden"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {from}–{to}
            </span>{" "}
            of <span className="font-medium text-gray-900">{total}</span>{" "}
            products
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="button"
              disabled={to >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
