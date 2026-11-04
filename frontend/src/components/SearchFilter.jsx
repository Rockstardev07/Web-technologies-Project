import './SearchFilter.css'

/** Reusable controlled search/filter panel. Products owns the actual list and filtering. */
export default function SearchFilter({
  searchQuery = '', onSearchChange = () => {},
  category = 'All', onCategoryChange = () => {}, categories = [],
  minPrice = '', onMinPriceChange = () => {},
  maxPrice = '', onMaxPriceChange = () => {},
  minRating = '', onMinRatingChange = () => {},
  sortOrder = '', onSortOrderChange = () => {},
  resultCount = 0, onClear = () => {}, showSearchCategory = true, showResultCount = true,
}) {
  return (
    <section className="search-filter-panel" aria-label="Product filters">
      {showSearchCategory && <>
        <label className="search-filter-field">
          <span>Search by name</span>
          <input type="search" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Find a product" />
        </label>
        <label className="search-filter-field">
          <span>Category</span>
          <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            {(categories.length ? categories : ['All']).map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </>}
      <div className="search-filter-price-row">
        <label className="search-filter-field"><span>Minimum price (₹)</span>
          <input type="number" min="0" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} placeholder="0" />
        </label>
        <label className="search-filter-field"><span>Maximum price (₹)</span>
          <input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} placeholder="No limit" />
        </label>
      </div>
      <label className="search-filter-field"><span>Customer rating</span>
        <select value={minRating} onChange={(event) => onMinRatingChange(event.target.value)}>
          <option value="">Any rating</option>
          {[4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}+ stars</option>)}
        </select>
      </label>
      <label className="search-filter-field"><span>Sort products</span>
        <select value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value)}>
          <option value="">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
      <div className="search-filter-footer">
        {showResultCount && <span aria-live="polite">{resultCount} {resultCount === 1 ? 'product' : 'products'} found</span>}
        <button type="button" onClick={onClear}>Clear all filters</button>
      </div>
    </section>
  )
}
