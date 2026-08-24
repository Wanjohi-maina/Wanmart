import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-gray-900 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  } // If the cart is empty, display a message and a link to continue shopping.

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Cart</h1>

      <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {/* Loop through all items currently in the cart */}
        {items.map((item, index) => {
          // Create a variant object containing the item's selected options
          const variant = {
            color: item.selectedColor,
            storage: item.selectedStorage,
            size: item.selectedSize,
          };
          // Create a readable label from the selected variants
          // filter(Boolean) removes any undefined or empty values
          // join() combines the remaining values with a separator
          const variantLabel = [
            item.selectedColor,
            item.selectedStorage,
            item.selectedSize,
          ]
            .filter(Boolean)
            .join(" . ");

          // Use the selected color image for electronics, otherwise use the default product image
          const displayImage =
            item.product.kind === "electronics" && item.selectedColor
              ? item.product.colorImages[item.selectedColor]
              : item.product.imageUrl;

          // Calculate the total price for this cart item based on its quantity.
          const lineTotal = item.unitPrice * item.quantity
          return (
            <li
              key={`${item.product.id}-${index}`}
              className="flex items-center gap-4 py-4"
            >
              <Link to={`/product/${item.product.id}`} className="shrink-0">
                <img
                  src={displayImage}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-md bg-gray-100"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/product/${item.product.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                  {item.product.name}
                </Link>
                
                {/* Display the selected variants if any exist */}
                {variantLabel && (
                  <p className="text-xs text-gray-400">{variantLabel}</p>
                )}

                <p className="text-sm text-gray-500">
                   ${item.quantity > 1 ? lineTotal.toFixed(2) : item.unitPrice.toFixed(2)}
                    {item.quantity > 1 && (
                        <span className="text-gray-400 font-normal">
                            {` · $${item.unitPrice.toFixed(2)} each`}
                        </span>
                    )}
                </p>
              </div>
              {/* Allow the user to change the item quantity */}
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item.product.id,
                    Number(e.target.value),
                    variant,
                  )
                } // Update the quantity of the product in the cart when the input value changes
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              {/* Remove this specific product variant from the cart */}
              <button
                type="button"
                onClick={() => removeFromCart(item.product.id, variant)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <span className="text-lg font-semibold text-gray-900">
          Total: ${totalPrice.toFixed(2)}
        </span>
        <Link
          to="/checkout"
          className="bg-gray-900 text-white rounded-md px-6 py-2.5 hover:bg-gray-800 transition-colors"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
