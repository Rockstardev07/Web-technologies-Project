import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(2500);

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

      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setProducts(list);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized access. Please log in again.");
      } else {
        setError(err.response?.data?.message || "Failed to load product inventory.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMaxPrice(2500);
  };

  const filteredProducts = products.filter((item) => {
    const itemCat = (item.category || "").toLowerCase();
    const itemName = (item.productName || item.name || "").toLowerCase();
    const itemPrice = Number(item.productPrice || item.price || 0);

    const matchesCategory =
      selectedCategory === "All" || itemCat === selectedCategory.toLowerCase();
    const matchesSearch = itemName.includes(searchQuery.toLowerCase());
    const matchesPrice = itemPrice <= maxPrice;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="store-page-canvas">
      <Navbar
        onSearch={setSearchQuery}
        onCategorySelect={setSelectedCategory}
        activeCategory={selectedCategory}
      />

      <section className="store-billboard">
        <div className="billboard-container">
          <h2>Exclusive Clearance & New Arrivals</h2>
          <p>
            Authentic brands, verified seller inventory, and same-day handling across all departments.
          </p>
        </div>
      </section>

      <div className="store-viewport">
        <aside className="store-sidebar">
          <div className="sidebar-header">
            <h4>Filters</h4>
            {(selectedCategory !== "All" || searchQuery || maxPrice < 2500) && (
              <button onClick={handleClearFilters} className="clear-filters-link">
                Clear all
              </button>
            )}
          </div>

          <div className="filter-group">
            <h5>Category</h5>
            <ul className="category-selection-list">
              {["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty"].map(
                (cat) => (
                  <li
                    key={cat}
                    className={selectedCategory === cat ? "is-selected" : ""}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="filter-group">
            <h5>Price Range</h5>
            <input
              type="range"
              min="10"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="price-range-label">
              Up to <strong>${maxPrice}</strong>
            </div>
          </div>

          <div className="filter-group">
            <h5>Customer Reviews</h5>
            <div className="rating-filter-pill">★★★★☆ & Up</div>
            <div className="rating-filter-pill">★★★☆☆ & Up</div>
          </div>
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
              <p>No products match your current search and filter settings.</p>
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
                  onAddToCart={(item) => {
                    console.log("Cart integration link for Member 2:", item);
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}