import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";
import Toast from "../components/ui/Toast";

type CartVariant = {
  color?: string;
  storage?: string;
  size?: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    unitPrice?: number,
    variant?: CartVariant,
  ) => void;
  removeFromCart: (productId: string, variant?: CartVariant) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: CartVariant,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "wanmart_cart";

// Creates a unique key for a product plus it's selected variants
function getCartItemKey(productId: string, variant?: CartVariant): string {
  return `${productId}|${variant?.color ?? ""}|${variant?.storage ?? ""}|${variant?.size ?? ""}`; // If variant exists, get its color. If it doesn't, use an empty string.
}

// Checks whether a cart item matches the given product and variant key
function itemMatchesKey(item: CartItem, key: string): boolean {
  return (
    getCartItemKey(item.product.id, {
      color: item.selectedColor,
      storage: item.selectedStorage,
      size: item.selectedSize,
    }) === key
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem(STORAGE_KEY); // Retrieve the cart data from localStorage using the STORAGE_KEY. If there is stored data, parse it from JSON format into a JavaScript object (array of CartItem). If there is no stored data, return an empty array to initialize the cart state.
    return storedCart ? JSON.parse(storedCart) : [];
  }); // Look in localStorage and restore the cart

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Create a ref to hold the timeout ID for the toast message. This allows us to clear the timeout if a new toast message is triggered before the previous one disappears.

  // Whenever the items state changes, save the updated cart data to localStorage in JSON format string.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function showToast(message: string) {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current); // If there is an existing timeout for the toast message, clear it to prevent multiple messages from overlapping.
    }
    setToastMessage(message); // Set the toast message state to the provided message, which will trigger the display of the toast notification.
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null); // Clear the toast message after 2 seconds by setting the toastMessage state back to null, which will hide the toast notification.
    }, 2000);
  }

  function addToCart(
    product: Product,
    quantity: number = 1,
    unitPrice: number = product.price,
    variant?: CartVariant,
  ) {
    setItems((prevItems) => {
      // Create a unique key based on the product and selected variants
      const key = getCartItemKey(product.id, variant);

      // Check if the same product with the same variants already exists in the cart
      const existingItem = prevItems.find((item) => itemMatchesKey(item, key));

      // If the item already exists, increase its quantity
      if (existingItem) {
        return prevItems.map((item) =>
          itemMatchesKey(item, key)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      // If the item doesn't exist, add it as a new cart item
      return [
        ...prevItems,
        {
          product,
          quantity,
          unitPrice,
          selectedColor: variant?.color,
          selectedStorage: variant?.storage,
          selectedSize: variant?.size,
        },
      ];
    });
    showToast(`${product.name} added to cart`); // Show a toast notification indicating that the product has been added to the cart.
  }

  function removeFromCart(productId: string, variant?: CartVariant) {
    // Create a unique key for the product and its selected variants
    const key = getCartItemKey(productId, variant);

    // Remove the matching item from the cart
    setItems(
      (prevItems) => prevItems.filter((item) => !itemMatchesKey(item, key)), // keeps the items that don't match the key.
    );
  }

  function updateQuantity(
    productId: string,
    quantity: number,
    variant?: CartVariant,
  ) {
    // If quantity is 0 or less, remove the item from the cart
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    // Create a unique key for the product and its selected variants
    const key = getCartItemKey(productId, variant);

    // Find the matching item and update its quantity
    setItems((prevItems) =>
      prevItems.map((item) =>
        itemMatchesKey(item, key) ? { ...item, quantity } : item,
      ),
    );
  }

  function clearCart() {
    setItems([]); // Clear the cart by setting the items state to an empty array.
  }

  // Calculate the total number of items in the cart by summing up the quantity of each item in the items array
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate the total price of all items in the cart by multiplying the price of each item by its quantity and summing up the results.
  const totalPrice = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
      <Toast message={toastMessage} />{" "}
      {/* Render the Toast component and pass the toastMessage state as a prop. This will display the toast notification when toastMessage is not null. */}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext); // Access the CartContext using the useContext hook. This allows components to consume the cart state and functions provided by the CartProvider.
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context; // Return the context value, which includes the cart state and functions for managing the cart.
}
