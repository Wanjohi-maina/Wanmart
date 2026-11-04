export const KINDS = [
  "electronics",
  "clothing",
  "sneakers",
  "watches",
  "accessory",
  "perfume",
] as const;

export type Kind = (typeof KINDS)[number];

export const KIND_LABELS: Record<Kind, string> = {
  electronics: "Electronics",
  clothing: "Clothing",
  sneakers: "Sneakers",
  watches: "Watches",
  accessory: "Accessory",
  perfume: "Perfume",
};

export type ColorRow = { name: string; imageUrl: string; gallery: string[] };
export type StorageRow = { label: string; priceModifier: string };
export type SpecRow = { label: string; value: string };

export type FormState = {
  id: string;
  idTouched: boolean;
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  imageUrl: string;
  images: string[];
  categoryId: string;
  stock: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: string;
  kind: Kind;
  highlights: string[];
  specifications: SpecRow[];
  // Type-specific details
  brand: string;
  warrantyMonths: string;
  condition: "new" | "used";
  colors: ColorRow[];
  storageOptions: StorageRow[];
  sizes: string;
  material: string;
  color: string;
  movement: "quartz" | "automatic" | "digital";
  waterResistant: boolean;
  volumeMl: string;
  concentration: "EDT" | "EDP" | "Parfum";
  gender: "men's" | "women's" | "unisex";
  // Existing attributes this form does not manage, kept as they are.
  extraAttributes: Record<string, unknown>;
};

export type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percent: number | null;
  image_url: string;
  images: string[] | null;
  category_id: string;
  stock: number;
  reserved_stock: number;
  featured: boolean;
  kind: Kind;
  highlights: unknown;
  specifications: unknown;
  attributes: Record<string, unknown>;
  display_order: number | null;
  is_active: boolean;
  date_added: string;
  order_count: number;
};

const MANAGED_KEYS: Record<Kind, string[]> = {
  electronics: [
    "brand",
    "warrantyMonths",
    "condition",
    "colors",
    "storageOptions",
    "colorImages",
    "galleryByColor",
  ],
  clothing: ["sizes", "material", "color"],
  sneakers: ["brand", "sizes", "color"],
  watches: ["brand", "movement", "waterResistant"],
  accessory: ["material", "color"],
  perfume: ["brand", "volumeMl", "concentration", "gender"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(str) : [];
}

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function emptyForm(kind: Kind = "electronics"): FormState {
  return {
    id: "",
    idTouched: false,
    name: "",
    description: "",
    price: "",
    discountPercent: "",
    imageUrl: "",
    images: [],
    categoryId: "",
    stock: "0",
    featured: false,
    isActive: true,
    displayOrder: "",
    kind,
    highlights: [""],
    specifications: [{ label: "", value: "" }],
    brand: "",
    warrantyMonths: "12",
    condition: "new",
    colors: [{ name: "", imageUrl: "", gallery: [] }],
    storageOptions: [{ label: "Standard", priceModifier: "0" }],
    sizes: "",
    material: "",
    color: "",
    movement: "quartz",
    waterResistant: false,
    volumeMl: "",
    concentration: "EDP",
    gender: "unisex",
    extraAttributes: {},
  };
}

export function recordToForm(record: ProductRecord): FormState {
  const kind = record.kind;
  const attr = isRecord(record.attributes) ? record.attributes : {};

  const colorNames = strList(attr.colors);
  const colorImages = isRecord(attr.colorImages) ? attr.colorImages : {};
  const galleryByColor = isRecord(attr.galleryByColor)
    ? attr.galleryByColor
    : {};

  const storage = Array.isArray(attr.storageOptions)
    ? attr.storageOptions.filter(isRecord).map((option) => ({
        label: str(option.label),
        priceModifier: str(option.priceModifier ?? 0),
      }))
    : [];

  const highlights = strList(record.highlights);

  const specs = Array.isArray(record.specifications)
    ? record.specifications.filter(isRecord).map((spec) => ({
        label: str(spec.label),
        value: str(spec.value),
      }))
    : [];

  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attr)) {
    if (!MANAGED_KEYS[kind].includes(key)) extra[key] = value;
  }

  return {
    id: record.id,
    idTouched: true,
    name: record.name,
    description: record.description,
    price: str(record.price),
    discountPercent:
      record.discount_percent === null ? "" : str(record.discount_percent),
    imageUrl: record.image_url,
    images: strList(record.images),
    categoryId: record.category_id,
    stock: str(record.stock),
    featured: record.featured,
    isActive: record.is_active,
    displayOrder: record.display_order === null ? "" : str(record.display_order),
    kind,
    highlights: highlights.length > 0 ? highlights : [""],
    specifications: specs.length > 0 ? specs : [{ label: "", value: "" }],
    brand: str(attr.brand),
    warrantyMonths: str(attr.warrantyMonths ?? 0),
    condition: pick(attr.condition, ["new", "used"] as const, "new"),
    colors:
      colorNames.length > 0
        ? colorNames.map((name) => ({
            name,
            imageUrl: str(colorImages[name]),
            gallery: strList(galleryByColor[name]),
          }))
        : [{ name: "", imageUrl: "", gallery: [] }],
    storageOptions:
      storage.length > 0 ? storage : [{ label: "Standard", priceModifier: "0" }],
    sizes: strList(attr.sizes).join(", "),
    material: str(attr.material),
    color: str(attr.color),
    movement: pick(
      attr.movement,
      ["quartz", "automatic", "digital"] as const,
      "quartz",
    ),
    waterResistant: attr.waterResistant === true,
    volumeMl: str(attr.volumeMl),
    concentration: pick(
      attr.concentration,
      ["EDT", "EDP", "Parfum"] as const,
      "EDP",
    ),
    gender: pick(
      attr.gender,
      ["men's", "women's", "unisex"] as const,
      "unisex",
    ),
    extraAttributes: extra,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function parseSizes(text: string): string[] {
  return text
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}


export function finalPrice(
  price: string,
  discount: string,
  modifier = 0,
): number | null {
  const base = Number(price);
  if (price.trim() === "" || !Number.isFinite(base) || base <= 0) return null;

  const percent = discount.trim() === "" ? 0 : Number(discount);
  if (!Number.isFinite(percent) || percent < 0 || percent > 99) return null;

  return Math.round(((base + modifier) * (100 - percent)) / 100);
}

// Rows the admin left completely blank are ignored.
function activeColors(f: FormState): ColorRow[] {
  return f.colors
    .map((c) => ({
      name: c.name.trim(),
      imageUrl: c.imageUrl.trim(),
      gallery: cleanList(c.gallery),
    }))
    .filter((c) => c.name !== "" || c.imageUrl !== "" || c.gallery.length > 0);
}

function activeStorage(f: FormState): StorageRow[] {
  return f.storageOptions
    .map((s) => ({
      label: s.label.trim(),
      priceModifier: s.priceModifier.trim(),
    }))
    .filter(
      (s) => s.label !== "" || (s.priceModifier !== "" && s.priceModifier !== "0"),
    );
}

function activeSpecs(f: FormState): SpecRow[] {
  return f.specifications
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label !== "" || s.value !== "");
}

function cleanList(list: string[]): string[] {
  return list.map((item) => item.trim()).filter(Boolean);
}

export function validateForm(
  f: FormState,
  isNew: boolean,
  reservedStock: number,
): string[] {
  const errors: string[] = [];
  const isWhole = (value: string) => /^\d+$/.test(value.trim());
  const isNumber = (value: string) =>
    value.trim() !== "" && Number.isFinite(Number(value));

  if (isNew) {
    const id = f.id.trim();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || id.length > 60 || id === "new") {
      errors.push(
        "The product ID can only use lowercase letters, numbers and hyphens, for example iphone-15-pro.",
      );
    }
  }

  if (f.name.trim() === "") errors.push("Name is required.");
  if (f.description.trim() === "") errors.push("Description is required.");
  if (f.categoryId === "") errors.push("Choose a category.");
  if (f.imageUrl.trim() === "") errors.push("Main image URL is required.");

  if (!isNumber(f.price) || Number(f.price) <= 0) {
    errors.push("Price must be greater than 0.");
  } else if (!Number.isInteger(Number(f.price))) {
    errors.push("Price must be a whole number of shillings.");
  }

  if (f.discountPercent.trim() !== "") {
    if (!isWhole(f.discountPercent) || Number(f.discountPercent) > 99) {
      errors.push("Discount must be a whole number from 0 to 99.");
    }
  }

  if (!isWhole(f.stock)) {
    errors.push("Stock must be a whole number.");
  } else if (!isNew && Number(f.stock) < reservedStock) {
    errors.push(
      `Stock cannot be below ${reservedStock}, the amount reserved by open orders.`,
    );
  }

  if (f.displayOrder.trim() !== "" && !/^-?\d+$/.test(f.displayOrder.trim())) {
    errors.push("Display order must be a whole number.");
  }

  const specs = f.specifications.map((s) => ({
    label: s.label.trim(),
    value: s.value.trim(),
  }));
  if (specs.some((s) => (s.label === "") !== (s.value === ""))) {
    errors.push("Each specification needs both a label and a value.");
  }

  const gallery = cleanList(f.images);
  if (new Set(gallery).size !== gallery.length) {
    errors.push("Gallery image URLs must all be different.");
  }

  const needsBrand = ["electronics", "sneakers", "watches", "perfume"];
  if (needsBrand.includes(f.kind) && f.brand.trim() === "") {
    errors.push("Brand is required.");
  }

  if (["clothing", "accessory"].includes(f.kind) && f.material.trim() === "") {
    errors.push("Material is required.");
  }

  if (
    ["clothing", "sneakers", "accessory"].includes(f.kind) &&
    f.color.trim() === ""
  ) {
    errors.push("Color is required.");
  }

  if (f.kind === "clothing" || f.kind === "sneakers") {
    const sizes = parseSizes(f.sizes);
    if (sizes.length === 0) {
      errors.push("Add at least one size.");
    } else if (new Set(sizes).size !== sizes.length) {
      errors.push("Sizes must all be different.");
    }
  }

  if (f.kind === "electronics") {
    if (!isWhole(f.warrantyMonths)) {
      errors.push("Warranty must be a whole number of months.");
    }

    const colors = activeColors(f);
    if (colors.length === 0) {
      errors.push("Add at least one color.");
    } else {
      if (colors.some((c) => c.name === "")) {
        errors.push("Every color needs a name.");
      }
      if (new Set(colors.map((c) => c.name)).size !== colors.length) {
        errors.push("Color names must all be different.");
      }
      if (colors.some((c) => c.imageUrl === "")) {
        errors.push("Every color needs an image URL.");
      }
      if (colors.some((c) => new Set(c.gallery).size !== c.gallery.length)) {
        errors.push("The extra images for a color must all be different.");
      }
    }

    const storage = activeStorage(f);
    if (storage.length === 0) {
      errors.push("Add at least one storage option.");
    } else {
      if (storage.some((s) => s.label === "")) {
        errors.push("Every storage option needs a label.");
      }
      if (new Set(storage.map((s) => s.label)).size !== storage.length) {
        errors.push("Storage option labels must all be different.");
      }
      if (storage.some((s) => !isNumber(s.priceModifier))) {
        errors.push("Every storage option needs a price change (use 0 for none).");
      } else if (
        storage.some((s) => !Number.isInteger(Number(s.priceModifier)))
      ) {
        errors.push("Storage price changes must be whole numbers of shillings.");
      } else if (
        storage.some((s) => Number(f.price) + Number(s.priceModifier) <= 0)
      ) {
        errors.push("A storage price change makes the price zero or negative.");
      }
    }
  }

  if (f.kind === "perfume") {
    if (!isNumber(f.volumeMl) || Number(f.volumeMl) <= 0) {
      errors.push("Volume must be greater than 0.");
    }
  }

  return errors;
}

function buildAttributes(f: FormState): Record<string, unknown> {
  const extra = { ...f.extraAttributes };

  switch (f.kind) {
    case "electronics": {
      const colors = activeColors(f);
      const gallery = Object.fromEntries(
        colors.filter((c) => c.gallery.length > 0).map((c) => [c.name, c.gallery]),
      );

      return {
        ...extra,
        brand: f.brand.trim(),
        warrantyMonths: Number(f.warrantyMonths),
        condition: f.condition,
        colors: colors.map((c) => c.name),
        storageOptions: activeStorage(f).map((s) => ({
          label: s.label,
          priceModifier: Number(s.priceModifier),
        })),
        colorImages: Object.fromEntries(colors.map((c) => [c.name, c.imageUrl])),
        // Only colors with extra images get an entry.
        ...(Object.keys(gallery).length > 0 ? { galleryByColor: gallery } : {}),
      };
    }
    case "clothing":
      return {
        ...extra,
        sizes: parseSizes(f.sizes),
        material: f.material.trim(),
        color: f.color.trim(),
      };
    case "sneakers":
      return {
        ...extra,
        brand: f.brand.trim(),
        sizes: parseSizes(f.sizes),
        color: f.color.trim(),
      };
    case "watches":
      return {
        ...extra,
        brand: f.brand.trim(),
        movement: f.movement,
        waterResistant: f.waterResistant,
      };
    case "accessory":
      return {
        ...extra,
        material: f.material.trim(),
        color: f.color.trim(),
      };
    case "perfume":
      return {
        ...extra,
        brand: f.brand.trim(),
        volumeMl: Number(f.volumeMl),
        concentration: f.concentration,
        gender: f.gender,
      };
  }
}

export function buildPayload(f: FormState): Record<string, unknown> {
  const discount = f.discountPercent.trim();
  const order = f.displayOrder.trim();

  return {
    id: f.id.trim(),
    name: f.name.trim(),
    description: f.description.trim(),
    price: Number(f.price),
    discount_percent: discount === "" ? null : Number(discount),
    image_url: f.imageUrl.trim(),
    images: cleanList(f.images),
    category_id: f.categoryId,
    stock: Number(f.stock),
    featured: f.featured,
    is_active: f.isActive,
    display_order: order === "" ? null : Number(order),
    kind: f.kind,
    highlights: cleanList(f.highlights),
    specifications: activeSpecs(f),
    attributes: buildAttributes(f),
  };
}