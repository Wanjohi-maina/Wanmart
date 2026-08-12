import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

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
            <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-2 w-full text-sm bg-gray-900 text-white rounded-md py-1.5 hover:bg-gray-800 transition-colors"
            >
            Add to Cart
            </button>
      </div>
    </div>
  );
}
