export type Category = {
    id: string
    name: string
    slug: string
    parentId: string | null
}

export type StorageOption = {
    label: string
    priceModifier: number
}

type BaseProduct = {
    id: string
    name: string
    description: string
    highlights: string[]
    price: number
    imageUrl: string
    categoryId: string
    stock: number
    rating: number
    reviewCount: number
}

export type ElectronicsProduct = BaseProduct & {
    kind: 'electronics'
    brand: string
    warrantyMonths: number
    condition: 'new' | 'used'
    colors: string[]
    storageOptions: StorageOption[]
    colorImages: Record<string, string>
}

export type ClothingProduct = BaseProduct & {
    kind: 'clothing'
    sizes: string[]
    material: string
    color: string
}

export type SneakersProduct = BaseProduct & {
    kind: 'sneakers'
    brand: string
    sizes: string[]
    color: string
}

export type WatchesProduct = BaseProduct & {
    kind: 'watches'
    brand: string
    movement: 'quartz' | 'automatic' | 'digital'
    waterResistant: boolean
}

export type AccessoryProduct = BaseProduct & {
    kind: 'accessory'
    material: string
    color: string
}

export type PerfumeProduct = BaseProduct & {
    kind: 'perfume'
    brand: string
    volumeMl: number
    concentration: 'EDT' | 'EDP' | 'Parfum'
    gender: "men's" | "women's" | 'unisex'
}

export type Product =
    | ElectronicsProduct
    | ClothingProduct
    | SneakersProduct
    | WatchesProduct
    | AccessoryProduct
    | PerfumeProduct

export type CartItem = {
    product: Product
    quantity: number
    unitPrice: number
    selectedColor?: string
    selectedStorage?: string
}