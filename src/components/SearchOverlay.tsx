import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { CloseIcon } from "./Icons";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: results } = useProducts({ searchQuery: query });

  function handleClose() {
    setQuery("");
    onClose();
  }

  function goToResults() {
    if (query.trim() === "") return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    handleClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") goToResults();
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-40 bg-white transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 border-b border-gray-200 p-4">
        <input
          type="text"
          autoFocus={isOpen}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products..."
          className="flex-1 text-lg outline-none"
        />
        <button type="button" aria-label="Close search" onClick={handleClose}>
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-2xl overflow-y-auto px-4 py-4">
        {query.trim() === "" ? (
          <p className="text-sm text-gray-400">
            Start typing to search products.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-gray-400">No products match "{query}".</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {results.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    onClick={handleClose}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
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
              className="mt-4 text-sm font-medium text-orange-600"
            >
              View all {results.length} results →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
