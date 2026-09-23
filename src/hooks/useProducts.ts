import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { rowToProduct } from "../lib/productMapper";
import { resolveCategoryIds } from "./useCategories";
import type { Product } from "../types";

type UseProductsOptions = {
  searchQuery?: string;
  categorySlug?: string;
  sort?: "featured" | "new";
};

type UseProductsResult = {
  data: Product[];
  loading: boolean;
  error: string | null;
};

export function useProducts(
  options: UseProductsOptions = {},
): UseProductsResult {
  const { searchQuery, categorySlug, sort } = options; // Destructure the options object to extract searchQuery and categorySlug, providing default values if they are not provided

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Track whether this request has been cancelled so an old request cannot update the state after a new one starts
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // Start building the query from the products table
        let query = supabase.from("products").select("*");

        // If a search term exists, search the product name or description
        if (searchQuery && searchQuery.trim() !== "") {
          // Remove extra spaces from the beginning and end of the search term
          const q = searchQuery.trim();
          // Find products whose name or description contains the search term
          query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // If a category was provided, filter products by that category
        if (categorySlug) {
          // Convert the category slug into the matching category IDs
          const categoryIds = await resolveCategoryIds(categorySlug);
          if (categoryIds.length > 0) {
            // Only return products whose category_id matches one of these IDs
            query = query.in("category_id", categoryIds);
          } else {
            // No matching category was found, so return an empty result
            if (!cancelled) {
              setData([]);
            }
            return;
          }
        }

        // If the user wants featured products, only include featured items
        if (sort === "featured") {
          query = query.eq("featured", true);
        }

        // If the user wants new products, sort by date with newest first
        if (sort === "new") {
          query = query.order("date_added", { ascending: false });
        }

        // Execute the completed Supabase query
        const { data: rows, error: fetchError } = await query;

        // Stop if this request has been cancelled
        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message); // Store the error message so the UI can display it
          setData([]); // Clear any existing products because the request failed
          return;
        }
        // Convert the database rows into the Product format and store the products in state
        setData((rows ?? []).map(rowToProduct));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setData([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Run the function to fetch the products
    fetchProducts();

    // Cleanup function that runs when the effect is replaced or unmounted
    return () => {
      // Mark this request as cancelled so it cannot update state later
      cancelled = true;
    };
  }, [searchQuery, categorySlug, sort]);

  return { data, loading, error };
}

export function useProduct(id: string | undefined): {
  data: Product | undefined;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there is no product id, there is nothing to fetch.
    if (!id) {
      setData(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        // Fetch the product from the products table
        const { data: row, error: fetchError } = await supabase
          .from("products")
          .select("*") // Select all columns from the product row
          .eq("id", id) // Only get the product whose id matches the id passed into this hook
          .maybeSingle(); // Expect either one product or no product

        // Stop if this request has been cancelled
        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
          setData(undefined);
          return;
        }
        // Convert the row to a Product if it exists; otherwise, clear the data
        setData(row ? rowToProduct(row) : undefined);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Something went wrong");
        setData(undefined);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
