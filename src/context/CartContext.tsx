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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Create a ref to hold the timeout ID for the toast message. This allows us to clear the timeout if a new toast message is triggered before the previous one disappears.

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); // Whenever the items state changes, save the updated cart data to localStorage in JSON format string.
  }, [items]);

  function showToast (message:string){
       if(toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current); // If there is an existing timeout for the toast message, clear it to prevent multiple messages from overlapping.
      }
      setToastMessage(message); // Set the toast message state to the provided message, which will trigger the display of the toast notification.
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null) // Clear the toast message after 2 seconds by setting the toastMessage state back to null, which will hide the toast notification.
      },2000) 
  } 

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
    showToast(`${product.name} added to cart`); // Show a toast notification indicating that the product has been added to the cart.
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
      <Toast message={toastMessage} /> {/* Render the Toast component and pass the toastMessage state as a prop. This will display the toast notification when toastMessage is not null. */}
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
