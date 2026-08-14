import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((item) => item.product.id === product.id); //Find the product in the cart (Is the current product already in the cart?)
  const quantity = cartItem?.quantity ?? 0; // If the value on the left is null/undefined, use value on the right (0)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden mb-2">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <p className="text-sm font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
        </Link>
        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-2 w-full text-sm bg-gray-900 text-white rounded-md py-1.5 hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="mt-2 w-full flex items-center justify-between border border-gray-300 rounded-md py-1">
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
