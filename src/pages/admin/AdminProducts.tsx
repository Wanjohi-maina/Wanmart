import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
    <div>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Products
        </h1>

        <Link
          to="/admin/products/new"
          className="shrink-0 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          Add product
        </Link>
      </div>

      {notice && (
        <div
          className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
        >
          {notice}
        </div>
      )}

      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by name or product ID"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
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

        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(0);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-48"
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

      {error && (
        <div
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && products.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-gray-900">No products found.</p>
        </div>
      )}

      {products.length > 0 && (
        <ul
          className={`mt-4 space-y-3 ${loading ? "opacity-60" : ""}`}
          aria-busy={loading}
        >
          {products.map((product) => {
            const available = product.stock - product.reserved_stock;
            const discounted = product.discount_percent
              ? finalPrice(String(product.price), String(product.discount_percent))
              : null;

            return (
              <li key={product.id}>
                <Link
                  to={`/admin/products/${product.id}`}
                  className="flex gap-3 rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                >
                  <img
                    src={product.image_url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md bg-gray-50 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="truncate font-mono text-xs text-gray-500">
                      {product.id}
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      KES{" "}
                      {discounted !== null
                        ? discounted.toLocaleString()
                        : Number(product.price).toLocaleString()}
                      {discounted !== null && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          {Number(product.price).toLocaleString()}
                        </span>
                      )}
                    </p>

                    <p
                      className={`text-xs ${
                        available <= 0
                          ? "font-medium text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {available <= 0 ? "Out of stock" : `${available} available`}
                      {product.reserved_stock > 0 &&
                        ` · ${product.reserved_stock} reserved`}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
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
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
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