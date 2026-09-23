import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Category } from "../types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
};

//  Converts a category from the database format into the format used by the frontend
function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    imageUrl: row.image_url ?? undefined,
  };
}

type UseCategoriesResult = {
  all: Category[];
  parents: Category[];
  getChildren: (parentId: string) => Category[];
  getBySlug: (slug: string) => Category | undefined;
  loading: boolean;
  error: string | null;
};

export function useCategories(): UseCategoriesResult {
  const [all, setAll] = useState<Category[]>([]); // Stores all categories fetched from Supabase
  const [loading, setLoading] = useState(true); // Keeps track of whether the categories are currently loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Used to prevent an old request from updating state after the effect has been cleaned up
    let cancelled = false;

    async function fetchCategories() {
      setLoading(true);

      // Get all columns from the categories table
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*");

      // Stop if this request has been cancelled
      if (cancelled) return;

      // Check whether Supabase returned an error, otherwise convert each database row into our frontend Category type
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAll((data ?? []).map(rowToCategory));
      }
      setLoading(false); 
    }

    fetchCategories();

    // Cancel the request when the effect cleans up
    return () => {
      cancelled = true;
    };
  }, []);

  // Get only the top-level categories
  const parents = all.filter((c) => c.parentId === null);

  // Get children of a parent category
  const getChildren = (parentId: string) =>
    all.filter((c) => c.parentId === parentId);

  // Find a category whose slug matches the slug provided
  const getBySlug = (slug: string) => all.find((c) => c.slug === slug);

  return { all, parents, getChildren, getBySlug, loading, error };
}

// Get category IDs for a given slug
export async function resolveCategoryIds (slug: string): Promise<string []> {
   // Find the category by slug 
   const {data: category, error: categoryError} = await supabase
       .from('categories')
       .select('id')
       .eq('slug', slug)
       .maybeSingle()

    // Return empty array if category isn't found
    if (categoryError || !category) return []   

    // Find the category's children
    const {data: children, error: childrenError} = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', category.id)

    // Use the parent ID if fetching children fails
    if(childrenError) return [category.id] 

    // Return child IDs, or the current category ID if there are no children
    return children && children.length > 0 
       ? children.map((c) => c.id)
       : [category.id]
}

