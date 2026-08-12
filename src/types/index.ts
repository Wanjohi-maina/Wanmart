export type Product = {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    categoryId: string
}
export type Category = {
    id: string
    name: string
    slug: string
    parentId: string | null
}
export type CartItem = {
    product: Product
    quantity: number
}