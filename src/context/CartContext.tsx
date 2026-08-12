import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "wanmart_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem(STORAGE_KEY); // Retrieve the cart data from localStorage using the STORAGE_KEY. If there is stored data, parse it from JSON format into a JavaScript object (array of CartItem). If there is no stored data, return an empty array to initialize the cart state.
    return storedCart ? JSON.parse(storedCart) : [];
  }); // Look in localStorage and restore the cart

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); // Whenever the items state changes, save the updated cart data to localStorage in JSON format string.
  }, [items]);

  function addToCart(product: Product, quantity: number = 1) {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id,
      ); // Check if the product already exists in the cart by searching for an item with the same product ID. If found, existingItem will hold that item; otherwise, it will be undefined.
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity } // If the product already exists in the cart, update its quantity by adding the new quantity to the existing one.
            : item,
        );
      }
      return [...prevItems, { product, quantity }]; // If the product does not exist in the cart, add it as a new item with the specified quantity.
    });
  }

  function removeFromCart(productId: string) {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId),
    ); // Keep items whose product ID does not match the specified productId, effectively removing the item from the cart.
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId); // If the new quantity is less than or equal to zero, remove the item from the cart.
      return;
    }
    setItems((prevItems) =>
      prevItems.map(
        (item) =>
          item.product.id === productId ? { ...item, quantity } : item, // Update the quantity of the item with the specified productId. If the product ID matches, create a new object with the updated quantity; otherwise, keep the item unchanged.
      ),
    );
  }

  function clearCart() {
    setItems([]); // Clear the cart by setting the items state to an empty array.
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0); // Calculate the total number of items in the cart by summing up the quantity of each item in the items array
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  ); // Calculate the total price of all items in the cart by multiplying the price of each item by its quantity and summing up the results.

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
