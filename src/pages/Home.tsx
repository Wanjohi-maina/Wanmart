import { Link } from 'react-router-dom'
import { Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid'
import NewsletterSignup from '../components/NewsletterSignup'

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-gray-900">
                {title}
            </h2>
        </div>
    )
}

export default function Home() {
    const { parents } = useCategories()
    const { data: allProducts } = useProducts()

    const featured = allProducts.slice(0, 8)
    const newArrivals = [...allProducts].reverse().slice(0, 4)

    return (
        <div>
            {/* Hero */}
            <section className="px-4 pt-10 sm:pt-16 md:pt-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight">
                        Everything You Need.
                        <br />
                        All in One Place.
                    </h1>

                    <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Discover tech, fashion, accessories, and fragrances
                        selected for modern everyday living.
                    </p>

                    {/* Hero CTA */}
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        
                        <a  href="#categories"
                            className="w-full sm:w-auto bg-gray-900 text-white text-sm sm:text-base font-medium rounded-full px-8 py-3 sm:px-10 sm:py-3.5 hover:bg-gray-800 transition-colors"
                        >
                            Shop Now
                        </a>
                    </div>
                </div>

                {/* Hero Product Image */}
                <div className="mt-10 sm:mt-14 md:mt-16 w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-gray-100 overflow-hidden">
                    <img
                        src="/images/hero/macbook-air-m5.jpg"
                        alt="Featured products across every category"
                        className="w-full h-full object-cover"
                    />
                </div>
            </section>

            {/* Shop by Category */}
            <section
                id="categories"
                className="px-4 py-14 sm:py-20 max-w-6xl mx-auto"
            >
                <div className="mb-8 sm:mb-12">
                    <SectionHeading eyebrow="Explore" title="Shop by Category" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {parents.map((category) => (
                        <Link
                            key={category.id}
                            to={`/category/${category.slug}`}
                            className="group"
                        >
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                <img
                                    src={`https://placehold.co/500x500?text=${encodeURIComponent(category.name)}`}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                                <p className="mt-3 text-sm sm:text-base text-center font-medium text-gray-900">
                                    {category.name}
                                </p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="px-4 py-14 sm:py-20 max-w-6xl mx-auto">
                    <div className="mb-8 sm:mb-12">
                        <SectionHeading eyebrow="Curated for you" title="Featured Products" />
                    </div>

                    <ProductGrid products={featured} />
                </section>
            )}

            {/* Promotional Banner */}
            <section className="relative bg-gray-900 overflow-hidden">
                <img
                    src="/images/promo-banner.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />

                <div className="relative px-4 py-20 sm:py-28 md:py-32 text-center">
                    <p className="text-sm font-medium text-gray-300">
                        Shop the latest
                    </p>

                    <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
                        New finds. Everyday essentials.
                    </h2>

                    <p className="mt-3 sm:mt-4 text-gray-200 text-sm sm:text-base max-w-md mx-auto">
                        Discover new arrivals across tech, fashion,
                        accessories, and more.
                    </p>

                    <a
                        href="#categories"
                        className="mt-6 sm:mt-8 inline-block bg-white text-gray-900 text-sm sm:text-base font-medium rounded-full px-7 py-3 sm:px-8 sm:py-3.5 hover:bg-gray-100 transition-colors"
                    >
                        Shop New Arrivals
                    </a>
                </div>
            </section>

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <section className="px-4 py-14 sm:py-20 max-w-6xl mx-auto">
                    <div className="mb-8 sm:mb-12">
                        <SectionHeading eyebrow="Just added" title="New Arrivals" />
                    </div>

                    <ProductGrid products={newArrivals} />
                </section>
            )}

            {/* Why Shop With Us */}
            <section className="border-t border-gray-100 px-4 py-16 sm:py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="text-sm font-medium text-gray-500">
                            The WanMart difference
                        </p>

                        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gray-900">
                            Shopping made simple
                        </h2>

                        <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                            Everything you need, thoughtfully organized and
                            easy to shop.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Sparkles className="h-5 w-5 text-gray-900" />
                            </div>

                            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
                                Curated Selection
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Quality products across tech, fashion,
                                accessories, and fragrances.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <ShoppingBag className="h-5 w-5 text-gray-900" />
                            </div>

                            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
                                Simple Shopping
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Browse easily, compare options, and find what
                                you need without the clutter.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <ShieldCheck className="h-5 w-5 text-gray-900" />
                            </div>

                            <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
                                Shop With Confidence
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Clear product information and transparent
                                pricing help you make informed choices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <NewsletterSignup />
        </div>
    )
}