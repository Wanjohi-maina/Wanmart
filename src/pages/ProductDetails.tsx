import { useParams, Link } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import ProductGrid from "../components/product/ProductGrid";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useProduct(id);
  const { addToCart } = useCart();

  const { data: allProducts } = useProducts();

  //Find up to 4 products that belong to the same category as the current product, excluding the current product itself
  const relatedProducts = product
    ? allProducts
        .filter(
          (p) => p.categoryId === product.categoryId && p.id !== product.id, // Keep products from the same category and exclude the product currently being viewed
        )
        .slice(0, 4)
    : [];

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Automatically select the only available color for electronics; otherwise, start with no color selected
  const [selectedColor, setSelectedColor] = useState<string | null>(() =>
    product?.kind === "electronics" && product.colors.length === 1
      ? product.colors[0]
      : null,
  );
  // Automatically select the only available storage option for electronics; otherwise, start with no storage selected
  const [selectedStorage, setSelectedStorage] = useState<string | null>(() =>
    product?.kind === "electronics" && product.storageOptions.length === 1
      ? product.storageOptions[0].label
      : null,
  );
  // Automatically select the only available size for clothing or sneakers; otherwise, start with no size selected
  const [selectedSize, setSelectedSize] = useState<string | null>(() =>
    (product?.kind === "clothing" || product?.kind === "sneakers") &&
    product.sizes.length === 1
      ? product.sizes[0]
      : null,
  );

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
        Product not found.
      </div>
    );
  }

  // Display the selected color image for electronics, otherwise use the default image
  const displayImage =
    product.kind === "electronics" && selectedColor
      ? product.colorImages[selectedColor]
      : product.imageUrl;

  // Find the storage option selected by the user
  const selectedStorageOption =
    product.kind === "electronics"
      ? product.storageOptions.find(
          (storage) => storage.label === selectedStorage,
        )
      : undefined;

  // Calculate the final price by adding any storage price modifier
  const displayPrice =
    product.price + (selectedStorageOption?.priceModifier ?? 0);

  // Check if the product requires electronics variants
  const needsElectronicsVariant = product.kind === "electronics";

  // Check if the product requires a size
  const needsSize = product.kind === "clothing" || product.kind === "sneakers";

  // Check whether any required variant has not been selected
  const variantIncomplete =
    (needsElectronicsVariant && (!selectedColor || !selectedStorage)) ||
    (needsSize && !selectedSize);

  // The price is final when the product doesn't require an electronics variant or when the customer has selected a storage option.
  const priceIsFinal = !needsElectronicsVariant || Boolean(selectedStorage);
  // Calculate the total price based on the selected quantity.
  const totalPrice = displayPrice * selectedQuantity;

  function handleDecrease() {
    setSelectedQuantity((qty) => Math.max(1, qty - 1));
  }

  function handleIncrease() {
    setSelectedQuantity((qty) => qty + 1);
  }

  function handleAddToCart() {
    if (!product) return;
    if (variantIncomplete) return;

    addToCart(product, selectedQuantity, displayPrice, {
      color: selectedColor ?? undefined,
      storage: selectedStorage ?? undefined,
      size: selectedSize ?? undefined,
    }); // four arguments; product added, it's quantity, final price, selected variants
    setSelectedQuantity(1);
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <Link to="/" className="text-sm text-gray-500 hover:underline">
            ← Back to shopping
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900 mt-3">
            {product.name}
          </h1>
          {'brand' in product &&(
            <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span>★★★★★ {product.rating.toFixed(1)}</span>
            <span>({product.reviewCount} reviews)</span>
            <span>·</span>
            <span>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="text-xl text-gray-800 mt-2">
            $
            {priceIsFinal && selectedQuantity > 1
              ? totalPrice.toFixed(2)
              : displayPrice.toFixed(2)}
            {priceIsFinal && selectedQuantity > 1 && (
              <span className="text-base text-gray-400 font-normal">
                {` · $${displayPrice.toFixed(2)} each`}
              </span>
            )}
            {needsElectronicsVariant && !selectedStorage && (
              <span className="text-sm text-gray-400 font-normal">
                {" (starting price)"}
              </span>
            )}
          </p>
          
          {product.highlights.length > 0 && (
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-gray-700">
              {product.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          )}
          
          {/* Only show color and storage options for electronics */}
          {needsElectronicsVariant && (
            <>
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </p>

                {/* Display all available color buttons */}
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)} // Update the selected color when clicked
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        selectedColor === color
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage selection */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Storage{selectedStorage ? `: ${selectedStorage}` : ""}
                </p>

                {/* Display all available storage options */}
                <div className="flex flex-wrap gap-2">
                  {product.storageOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelectedStorage(option.label)} // Update the selected storage when clicked
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        selectedStorage === option.label
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                      {option.priceModifier > 0 &&
                        ` (+$${option.priceModifier})`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Only show the size selector for products that require a size */}
          {needsSize && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Size{selectedSize ? `: ${selectedSize}` : ""}
              </p>

              {/* Display all available size options */}
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)} // Set the selected size when the user clicks a size
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 border border-gray-300 rounded-lg w-fit">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease quantity"
              className="w-10 py-2 text-lg text-gray-700 hover:text-gray-900"
            >
              -
            </button>
            <span className="w-8 text-center text-base font-medium text-gray-900">
              {selectedQuantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="w-10 py-2 text-lg text-gray-700 hover:text-gray-900"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={variantIncomplete}
            className="mt-6 w-full bg-gray-900 text-white rounded-lg py-2.5 hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {variantIncomplete ? "Select options" : "Add to Cart"}
          </button>
        </div>
      </div>
      
      <section className="max-w-4xl mx-auto px-4 py-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Overview</h2>
        <p className="text-gray-600">{product.description}</p>
      </section>

      {product.specifications.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h2>
          <dl className="divide-y divide-gray-100">
            {product.specifications.map((spec)=> (
              <div key={spec.label} className="flex py-2 text-sm">
                <dt className="w-40 shrink-0 text-gray-500">{spec.label}</dt>
                <dd className="text-gray-800">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            You might also like
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </>
  );
}
