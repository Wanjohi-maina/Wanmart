import { useMemo } from 'react'
import { mockProducts } from '../data/mockProducts'
import { resolveCategoryIds } from '../data/categories'
import type { Product } from '../types'

type UseProductsOptions = {
    searchQuery?: string
    categorySlug?: string
}

type UseProductsResult = {
    data: Product[]
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
    const { searchQuery, categorySlug } = options // Destructure the options object to extract searchQuery and categorySlug, providing default values if they are not provided

    const data = useMemo(() => { // Use useMemo to memoize the filtered products based on searchQuery and categorySlug, so that the filtering logic is only re-executed when these dependencies change
        let result = mockProducts // Start with the full list of mock products

        if (searchQuery && searchQuery.trim() !== '') { // Check if a search query is provided and is not just whitespace
            const q = searchQuery.trim().toLowerCase() // Trim whitespace from the search query and convert it to lowercase for case-insensitive comparison
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(q) ||
                    product.description.toLowerCase().includes(q)
            ) // If a search query is provided and is not just whitespace, filter the products to include only those whose name or description includes the search query (case-insensitive)
        }

        if (categorySlug) { // Check if a category slug is provided
            const categoryIds = resolveCategoryIds(categorySlug) // Use the resolveCategoryIds function to get the IDs of the category and its children based on the provided slug
            result = result.filter((product) => categoryIds.includes(product.categoryId)) // Filter the products to include only those whose categoryId is in the list of resolved category IDs
        } 

        return result // Return the filtered list of products based on the search query and category slug
    }, [searchQuery, categorySlug])

    return { data } 
}
export function useProduct(id: string | undefined): { data: Product | undefined } {
    const data = useMemo(() => mockProducts.find((product) => product.id === id), [id]) // Find the product with the matching id from the mockProducts array and memoize the result based on the id dependency
    return { data } // Return the found product (or undefined if not found) in an object with a data property
}