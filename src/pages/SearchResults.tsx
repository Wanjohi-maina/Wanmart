import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductFilters, {
  type SortOption,
} from "../components/product/ProductFilters";
import ProductGrid from "../components/product/ProductGrid";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: matched } = useProducts({ searchQuery: query });

  const [sort, setSort] = useState<SortOption>("default");

  const results = useMemo(() => {
    if (sort === "price-asc")
      return [...matched].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      return [...matched].sort((a, b) => b.price - a.price);
    return matched;
  }, [matched, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Search results for "{query}"
      </h1>

      {matched.length > 0 && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            Showing {matched.length} {matched.length === 1 ? "item" : "items"}
          </span>
          <ProductFilters sort={sort} onSortChange={setSort} />
        </div>
      )}

      {results.length === 0 ? (
        <p className="text-gray-400">No products match "{query}".</p>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
}
