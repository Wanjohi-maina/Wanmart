import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";

// Define the actions that can be waiting for confirmation
type PendingAction =
  | {
      type: "remove";
      productId: string;
      productName: string;
      variant: { color?: string; storage?: string; size?: string };
    }
  | { type: "clear" };

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useCart();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-orange-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  } // If the cart is empty, display a message and a link to continue shopping.

  function handleConfirm() {
    if (!pendingAction) return;

    if (pendingAction.type === "remove") {
      removeFromCart(pendingAction.productId, pendingAction.variant);
    } else {
      // Clear the entire cart
      clearCart();
    }
    setPendingAction(null); // Reset the pending action after confirming
  }

  // Determine the title, message, and button text for the confirmation dialog
  const dialogCopy =
    pendingAction?.type === "remove"
      ? {
          title: "Remove item",
          message: `Remove ${pendingAction.productName} from your cart?`,
          confirmLabel: "Remove",
        }
      : pendingAction?.type === "clear"
        ? {
            title: "Clear cart",
            message: "Remove all items from your cart?",
            confirmLabel: "Clear cart",
          }
        : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
        <button
          type="button"
          onClick={() => setPendingAction({ type: "clear" })}
          className="text-sm text-white bg-red-600 px-3 py-1.5 rounded-full hover:bg-red-500 transition-colors"
        >
          Clear cart
        </button>
      </div>

      <ul className="bg-gray-50 p-4 rounded-lg">
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
          const lineTotal = item.unitPrice * item.quantity;
          return (
            <li
              key={`${item.product.id}-${index}`}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-100 mt-4 rounded-lg"
            >
              <div className="flex items-center gap-4 w-full">
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img
                    src={displayImage}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md bg-gray-50 md:w-20 md:h-20"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline wrap-break-words"
                  >
                    {item.product.name}
                  </Link>

                  {/* Display the selected variants if any exist */}
                  {variantLabel && (
                    <p className="text-xs text-gray-500">{variantLabel}</p>
                  )}

                  <p className="text-sm text-gray-600">
                    $
                    {item.quantity > 1
                      ? lineTotal.toFixed(2)
                      : item.unitPrice.toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="text-gray-500 font-normal">
                        {` · $${item.unitPrice.toFixed(2)} each`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {/* Allow the user to change the item quantity */}
              <div className="flex items-center w-full justify-between sm:gap-4 sm:flex-0 mt-2 sm:mt-0">
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
                  className="w-16 border border-orange-300 hover:border-orange-400 rounded-lg px-2 py-1 text-sm"
                />
                {/* Remove this specific product variant from the cart */}
                <button
                  type="button"
                  onClick={() =>
                    setPendingAction({
                      type: "remove",
                      productId: item.product.id,
                      productName: item.product.name,
                      variant,
                    })
                  } // Set the pending action to remove this item, which will trigger the confirmation dialog
                  className="text-sm underline text-gray-600 hover:text-orange-600"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center sm:justify-end">
          <Link
            to="/checkout"
            className="w-full rounded-full bg-orange-600 px-6 py-3 text-center text-white transition-colors hover:bg-orange-700 sm:w-auto"
          >
            Checkout
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogCopy !== null}
        title={dialogCopy?.title ?? ""}
        message={dialogCopy?.message ?? ""}
        confirmLabel={dialogCopy?.confirmLabel ?? ""}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
