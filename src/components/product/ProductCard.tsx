import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  // Check whether the product category requires variant selection
  const needsVariant =
    product.kind === "electronics" ||
    product.kind === "clothing" ||
    product.kind === "sneakers";
  
  const hasVariablePrice = product.kind === "electronics";
  // Determine if the product has a discount and calculate the discounted price if applicable
  const hasDiscount =
    typeof product.discountPercent === "number" && product.discountPercent > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercent! / 100)
    : product.price;

  // Find the same product in the cart only if it has no selected variants
  const cartItem = items.find(
    (item) =>
      item.product.id === product.id &&
      !item.selectedColor &&
      !item.selectedStorage &&
      !item.selectedSize,
  );

  // Get the cart quantity, or use 0 if the product isn't in the cart
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden mb-2">
          {hasDiscount && (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
              -{product.discountPercent}%
            </span>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="p-3 flex flex-1 flex-col gap-2">
        <Link to={`/product/${product.id}`} className="block">
          <p className="text-sm font-medium text-gray-900">{product.name}</p>
          {hasDiscount ? (
            <p className="text-sm">
              <span className="text-gray-900 font-medium">
                {hasVariablePrice ? 'From' : ''} ${discountedPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500 line-through">
                 ${product.price.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {hasVariablePrice ? 'From' : ''} ${product.price.toFixed(2)}
            </p>
          )}
        </Link>
        {needsVariant ? (
          <Link
            to={`/product/${product.id}`}
            className="mt-auto block w-full text-center text-sm text-white bg-orange-600 rounded-full py-1.5 hover:bg-orange-700 transition-colors"
          >
            View options
          </Link>
        ) : quantity === 0 ? (
          <button
            type="button"
            onClick={() => addToCart(product, {
              unitPrice: discountedPrice,
              originalUnitPrice: hasDiscount ? product.price : undefined,
            })}
            className="mt-auto w-full text-sm bg-orange-600 text-white rounded-full py-1.5 hover:bg-orange-700 transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="mt-auto w-full flex items-center justify-between border border-orange-300 rounded-full py-1">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="w-8 text-gray-700 hover:text-gray-900"
            >
              -
            </button>
            <span className="text-sm font-medium text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 text-gray-700 hover:text-gray-900"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
