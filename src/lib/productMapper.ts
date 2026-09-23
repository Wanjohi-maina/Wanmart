import type { Tables } from "../types/supabase";
import type { Product, ProductSpecification } from "../types";

type ProductRow = Tables<"products">;

export function rowToProduct(row: ProductRow): Product {
  const attributes = row.attributes as Record<string, unknown>;

  const baseProduct = {
    id: row.id,
    name: row.name,
    description: row.description,
    highlights: row.highlights as string[],
    specifications: row.specifications as ProductSpecification[],
    price: row.price,
    discountPercent: row.discount_percent ?? undefined,
    imageUrl: row.image_url,
    images: row.images ?? undefined,
    categoryId: row.category_id,
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.review_count,
    featured: row.featured,
    dateAdded: row.date_added,
  };

  switch (row.kind) {
    case "electronics":
      return {
        ...baseProduct,
        kind: "electronics",
        brand: attributes.brand as string,
        warrantyMonths: attributes.warrantyMonths as number,
        condition: attributes.condition as "new" | "used",
        colors: attributes.colors as string[],
        storageOptions: attributes.storageOptions as {
          label: string;
          priceModifier: number;
        }[],
        colorImages: attributes.colorImages as Record<string, string>,
        galleryByColor: attributes.galleryByColor as
          | Record<string, string[]>
          | undefined,
      };

    case "clothing":
      return {
        ...baseProduct,
        kind: "clothing",
        sizes: attributes.sizes as string[],
        material: attributes.material as string,
        color: attributes.color as string,
      };

    case "sneakers":
      return {
        ...baseProduct,
        kind: "sneakers",
        brand: attributes.brand as string,
        sizes: attributes.sizes as string[],
        color: attributes.color as string,
      };

    case "watches":
      return {
        ...baseProduct,
        kind: "watches",
        brand: attributes.brand as string,
        movement: attributes.movement as "quartz" | "automatic" | "digital",
        waterResistant: attributes.waterResistant as boolean,
      };

    case "accessory":
      return {
        ...baseProduct,
        kind: "accessory",
        material: attributes.material as string,
        color: attributes.color as string,
      };

    case "perfume":
      return {
        ...baseProduct,
        kind: "perfume",
        brand: attributes.brand as string,
        volumeMl: attributes.volumeMl as number,
        concentration: attributes.concentration as "EDT" | "EDP" | "Parfum",
        gender: attributes.gender as "men's" | "women's" | "unisex",
      };

    default:
      throw new Error(`Unknown product kind: ${row.kind}`);
  }
}
