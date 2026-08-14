import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import {useState} from 'react'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const { data: product } = useProduct(id)
    const {addToCart} = useCart()

    const [selectedQuantity, setSelectedQuantity] = useState(1)

    if (!product) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
                Product not found.
            </div>
        )
    }
    
    function handleDecrease () {
        setSelectedQuantity((qty) => Math.max(1, qty -1))
    }

    function handleIncrease () {
        setSelectedQuantity((qty) => qty + 1)
    }

    function handleAddToCart () {
        if(!product) return
        addToCart(product, selectedQuantity)
        setSelectedQuantity(1)
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                    src={product.imageUrl}
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
                <p className="text-xl text-gray-800 mt-2">
                    ${product.price.toFixed(2)}
                </p>
                <p className="text-gray-600 mt-4">{product.description}</p>

                <div className="mt-6 flex items-center gap-2 border border-gray-300 rounded-md w-fit">
                    <button
                      type='button'
                      onClick={handleDecrease}
                      aria-label='Decrease quantity'
                      className='w-10 py-2 text-lg text-gray-700 hover:text-gray-900'
                    >
                        -
                    </button>
                    <span className='w-8 text-center text-base font-medium text-gray-900'>{selectedQuantity}</span>
                    <button
                     type='button'
                     onClick={handleIncrease}
                     aria-label='Increase quantity'
                     className='w-10 py-2 text-lg text-gray-700 hover:text-gray-900'
                    >
                        +
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-6 w-full bg-gray-900 text-white rounded-md py-2.5 hover:bg-gray-800 transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    )
}