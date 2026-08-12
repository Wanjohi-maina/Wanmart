import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const { data: product } = useProduct(id)
    const {addToCart} = useCart()

    if (!product) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
                Product not found.
            </div>
        )
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

                <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="mt-6 w-full bg-gray-900 text-white rounded-md py-2.5 hover:bg-gray-800 transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    )
}