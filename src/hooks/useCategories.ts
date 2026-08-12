import {
    categories,
    getParentCategories,
    getChildCategories,
    getCategoryBySlug,
} from '../data/categories'
import type { Category } from '../types'

type UseCategoriesResult = {
    all: Category[]
    parents: Category[]
    getChildren: (parentId: string) => Category[]
    getBySlug: (slug: string) => Category | undefined
}

export function useCategories(): UseCategoriesResult {
    return {
        all: categories, // Return all categories
        parents: getParentCategories(), // Return only top-level categories (those with no parent)
        getChildren: getChildCategories, // Return all categories that have the given parentId
        getBySlug: getCategoryBySlug, // Return the category that matches the given slug, or undefined if not found
    }
}