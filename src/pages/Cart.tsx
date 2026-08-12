import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
    const { items, updateQuantity, removeFromCart, totalPrice } = useCart()

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-400 mb-4">Your cart is empty.</p>
                <Link to="/" className="text-gray-900 hover:underline">
                    Continue shopping
                </Link>
            </div>
        )
    } // If the cart is empty, display a message and a link to continue shopping.

    return (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Cart</h1>

            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map((item) => (
                    <li key={item.product.id} className="flex items-center gap-4 py-4">
                        <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md bg-gray-100"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                        </div>
                        <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))} // Update the quantity of the product in the cart when the input value changes
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)} // Remove the product from the cart when the button is clicked
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            Remove
                        </button>
                    </li>
                ))}
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
    )

}