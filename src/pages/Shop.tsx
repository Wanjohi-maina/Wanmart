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

    const { data: products, loading, error } = useProducts({ sort })

    const title = filter && TITLES[filter] ? TITLES[filter] : 'All Products'

    if(loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if(error) {
    console.error(error)
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-red-600">
        Something went wrong loading products. Please try again.
      </div>
    )
  }  

    return (
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12">
                {title}
            </h1>
            <ProductGrid products={products} />
        </div>
    )
}