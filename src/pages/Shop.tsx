import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid'

const TITLES: Record<string, string> = {
    featured: 'Featured Products',
    new: 'New Arrivals',
}

export default function Shop() {
    const [searchParams] = useSearchParams()
    const filter = searchParams.get('filter')
    const sort = filter === 'new' ? 'new' : filter === 'featured' ? 'featured' : undefined

    const { data: products } = useProducts({ sort })

    const title = filter && TITLES[filter] ? TITLES[filter] : 'All Products'

    return (
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12">
                {title}
            </h1>
            <ProductGrid products={products} />
        </div>
    )
}