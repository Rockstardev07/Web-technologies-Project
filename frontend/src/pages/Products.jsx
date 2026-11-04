import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchFilter from "../components/SearchFilter";
import { useCart } from "../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("2500");
  const [minRating, setMinRating] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];

      setProducts(list);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized access. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load product inventory."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("2500");
    setMinRating("");
    setSortOrder("");
  };

  const categories = useMemo(
    () => ["All", ...new Set(products.map((item) => item.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((item) => {
      const itemCat = (item.category || "").toLowerCase();
      const itemName = (item.productName || item.name || "").toLowerCase();
      const itemPrice = Number(item.productPrice ?? item.price ?? 0);
      const itemRating = Number(item.productRating ?? item.rating ?? 0);
      const minimum = minPrice === "" ? 0 : Number(minPrice);
      const maximum = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);

      const matchesCategory =
        selectedCategory === "All" ||
        itemCat === selectedCategory.toLowerCase();

      const matchesSearch = itemName.includes(searchQuery.toLowerCase());
      const matchesPrice = itemPrice >= minimum && itemPrice <= maximum;
      const matchesRating = minRating === "" || itemRating >= Number(minRating);

      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });
    if (sortOrder === "price-asc") filtered.sort((a, b) => Number(a.price ?? a.productPrice ?? 0) - Number(b.price ?? b.productPrice ?? 0));
    if (sortOrder === "price-desc") filtered.sort((a, b) => Number(b.price ?? b.productPrice ?? 0) - Number(a.price ?? a.productPrice ?? 0));
    return filtered;
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, minRating, sortOrder]);

  const handleAddToCart = (item) => {
    const added = addToCart(item);
    if (added) {
      alert("Product added to cart successfully!");
    } else {
      alert("Unable to add product. Check available stock.");
    }
  };

  return (
    <div className="store-page-wrapper">
      <Navbar
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <div className="store-page-content">
        <header className="store-page-header">
          <div>
            <p className="store-eyebrow">KAADUGAL CATALOG</p>
            <h1>Products</h1>
            <p>Authentic brands, verified seller inventory, and reliable handling across all departments.</p>
          </div>
        </header>

        <div className="store-viewport">
          <aside className="store-sidebar">
            <div className="sidebar-header">
              <h4>Filters</h4>

              {(selectedCategory !== "All" || searchQuery || minPrice !== "" ||
                maxPrice !== "2500" || minRating !== "" || sortOrder !== "") && (
                <button
                  onClick={handleClearFilters}
                  className="clear-filters-link"
                >
                  Clear all
                </button>
              )}
            </div>

            <SearchFilter
              showSearchCategory={true}
              category={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              resultCount={filteredProducts.length}
              showResultCount={false}
              onClear={handleClearFilters}
            />
          </aside>

          <main className="store-catalog-panel">
            <div className="catalog-headline-strip">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> items
              </span>
            </div>

            {loading ? (
              <div className="catalog-feedback-card">
                <div className="spinner-circle"></div>
                <p>Loading available products...</p>
              </div>
            ) : error ? (
              <div className="catalog-feedback-card feedback-error">
                <p>{error}</p>

                <button onClick={fetchProducts} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="catalog-feedback-card">
                <h3>No products found</h3>
                <p>
                  No products match your current search and filter settings.
                </p>

                <button onClick={handleClearFilters} className="retry-btn">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="product-multi-grid">
                {filteredProducts.map((prod, idx) => (
                  <ProductCard
                    key={prod.productId || prod._id || idx}
                    product={prod}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
