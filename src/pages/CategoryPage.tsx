import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductFilters, { type SortOption } from '../components/product/ProductFilters'
import ProductGrid from '../components/product/ProductGrid'

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>() // Get the category slug from the URL parameters using useParams hook
    const { data: matched } = useProducts({ categorySlug: slug }) // Fetch products that match the given category slug using the useProducts hook
    const { all: allCategories, getBySlug } = useCategories() // Fetch all categories and a function to get a category by its slug using the useCategories hook

    const category = slug ? getBySlug(slug) : undefined // Get the category object that matches the given slug using the getBySlug function, or undefined if no slug is provided
    const parentCategory = category?.parentId // Get the parent category object of the current category if it exists,
        ? allCategories.find((c) => c.id === category.parentId)
        : undefined

    const [sort, setSort] = useState<SortOption>('default')

    const results = useMemo(() => { // Use useMemo to memoize the sorted products based on the matched products and the selected sort option, so that the sorting logic is only re-executed when these dependencies change
        if (sort === 'price-asc') return [...matched].sort((a, b) => a.price - b.price) // Sort the matched products in ascending order of price
        if (sort === 'price-desc') return [...matched].sort((a, b) => b.price - a.price) // Sort the matched products in descending order of price
        return matched
    }, [matched, sort])

    if (!category) { 
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
                Category not found.
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:underline">Home</Link>
                {parentCategory && ( 
                    <>
                        {' > '}
                        <Link to={`/category/${parentCategory.slug}`} className="hover:underline">
                            {parentCategory.name}
                        </Link>
                    </>
                )}
                {' > '}
                <span className="text-gray-800">{category.name}</span>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{category.name}</h1>

            {matched.length > 0 && ( // If there are products in the current category, display the number of products and the sorting options
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing {matched.length} {matched.length === 1 ? 'item' : 'items'}
                    </span>
                    <ProductFilters sort={sort} onSortChange={setSort} />
                </div>
            )}

            {results.length === 0 ? ( // If there are no products in the current category, display a message indicating that there are no products yet
                <p className="text-gray-400">No products in this category yet.</p>
            ) : (
                <ProductGrid products={results} />
            )}
        </div>
    )
}