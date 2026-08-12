import { Link } from 'react-router-dom'
import type { Product } from '../../types'

type ProductCardProps = {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link to={`/product/${product.id}`} className="block">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
        </Link>
    )
}