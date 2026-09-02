import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { SearchIcon } from "./Icons";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: results } = useProducts({ searchQuery: query });

  // Show the dropdown only when the input is focused and the user has entered a non-empty search query
  const showDropdown = isFocused && query.trim() !== "";

  // Listen for clicks outside the search container and close the dropdown when one occurs
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    // Add the click listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Remove the listener when the component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate to the full search results page
  function goToResults() {
    if (query.trim() === "") return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`); // Add the search query to the URL as a query parameter
    setIsFocused(false);
  }

  // Handle keyboard actions inside the search input
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") goToResults();
    if (e.key === "Escape") setIsFocused(false);
  }

  // Clear the search and close the dropdown
  function handleSelect() {
    setQuery("");
    setIsFocused(false);
  }
  return (
    <>
      {/* Show a dark overlay behind the search when it is focused */}
      {isFocused && (
        <div
          className="fixed left-0 right-0 top-16 bottom-0 z-30 bg-gray-900/30 transition-opacity"
          onClick={() => setIsFocused(false)}
        />
      )}
      {/* Search bar container; hidden on mobile */}
      <div
        ref={containerRef}
        className="relative z-40 hidden md:block w-full max-w-xs"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className={`w-full rounded-xl border px-3 py-1.5 pr-9 text-sm outline-none transition-colors ${
              isFocused
                ? "border-orange-600 ring-1 ring-orange-600"
                : "border-orange-300"
            }`}
          />
          <SearchIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
        </div>

        {/* Display search results when the dropdown should be visible */}
        {showDropdown && (
          <div className="absolute left-0 top-full mt-3 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {results.length === 0 ? (
              <p className="p-3 text-sm text-gray-400">
                No products match "{query}".
              </p>
            ) : (
              <>
                <ul className="flex flex-col gap-2 p-3 max-h-72 overflow-y-auto">
                  {results.slice(0, 5).map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${product.id}`}
                        onClick={handleSelect}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={goToResults}
                  className="block w-full text-left px-3 pb-3 text-sm font-medium text-orange-600 hover:underline"
                >
                  View all {results.length} results →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
