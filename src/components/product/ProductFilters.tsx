export type SortOption = 'default' | 'price-asc' | 'price-desc'

type ProductFiltersProps = {
    sort: SortOption
    onSortChange: (sort: SortOption) => void
}

export default function ProductFilters({ sort, onSortChange }: ProductFiltersProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <label htmlFor="sort" className="text-gray-600">
                Sort:
            </label>
            <select
                id="sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="border border-gray-300 rounded px-2 py-1"
            >
                <option value="default">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
            </select>
        </div>
    )
}