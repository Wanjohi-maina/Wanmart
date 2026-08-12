import type { Category } from '../types'

export const categories: Category[] = [
    { id: 'electronics', name: 'Electronics', slug: 'electronics', parentId: null },
    { id: 'phones', name: 'Phones', slug: 'phones', parentId: 'electronics' },
    { id: 'laptops', name: 'Laptops', slug: 'laptops', parentId: 'electronics' },

    { id: 'fashion', name: 'Fashion', slug: 'fashion', parentId: null },
    { id: 'clothing', name: 'Clothing', slug: 'clothing', parentId: 'fashion' },
    { id: 'sneakers', name: 'Sneakers', slug: 'sneakers', parentId: 'fashion' },

    { id: 'accessories', name: 'Accessories', slug: 'accessories', parentId: null },
    { id: 'watches', name: 'Watches', slug: 'watches', parentId: 'accessories' },
    { id: 'sunglasses', name: 'Sunglasses', slug: 'sunglasses', parentId: 'accessories' },

    { id: 'perfumes', name: 'Perfumes', slug: 'perfumes', parentId: null },
    { id: 'men-fragrance', name: 'Men Fragrances', slug: 'men-fragrance', parentId: 'perfumes' },
    { id: 'women-fragrance', name: 'Women Fragrances', slug: 'women-fragrance', parentId: 'perfumes' },
]

// Return top level categories (those with no parent)
export function getParentCategories(): Category[] {
    return categories.filter((c) => c.parentId === null)
}
// Return all categories that have the given parentId
export function getChildCategories(parentId: string): Category[] {
    return categories.filter((c) => c.parentId === parentId)
}
// Return the category that matches the given slug, or undefined if not found
export function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug)
}

// parent slug -> ids of all its children (so "Fashion" shows Clothing + Sneakers combined)
// child slug -> just its own id
export function resolveCategoryIds(slug: string): string[] {
    const category = getCategoryBySlug(slug) // Finds the full category object based on the provided slug
    if (!category) return [] // If the category is not found, return an empty array (guard clause)
    const children = getChildCategories(category.id) // Filters the categories that match the parentId of the found category, effectively getting all its children
    return children.length > 0 ? children.map((c) => c.id) : [category.id] // If there are children, return their ids; otherwise, return the id of the category itself
}