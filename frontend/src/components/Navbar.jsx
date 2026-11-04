import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar({ onSearch, searchValue }) {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchValue !== undefined) setSearchTerm(searchValue);
  }, [searchValue]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className="market-header">
      {/* Simple Top Bar */}
      <div className="nav-main">
        {/* Brand / Logo */}
        <Link to="/products" className="nav-brand">
          Kaadugal<span className="brand-domain">.in</span>
        </Link>

        {/* Clean Search Input */}
        <form className="nav-search-wrapper" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Right Navigation Actions */}
        <div className="nav-actions">
          {token ? (
            <div className="nav-menu-item dropdown-trigger">
              <span className="nav-subtext">Hello, {storedUser?.username || "Member"}</span>
              <span className="nav-boldtext">Account & Lists ▾</span>
              <div className="nav-dropdown-content">
                <Link to="/profile">Your Account</Link>
                <Link to="/orders">Your Orders</Link>
                <button onClick={handleLogout} className="logout-action-btn">
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-menu-item">
              <span className="nav-subtext">Hello, sign in</span>
              <span className="nav-boldtext">Account & Lists</span>
            </Link>
          )}

          <Link to="/orders" className="nav-menu-item">
            <span className="nav-subtext">Returns</span>
            <span className="nav-boldtext">& Orders</span>
          </Link>

          <Link to="/cart" className="nav-cart-link">
            <div className="cart-icon-group">
              <span className="cart-svg-wrap">🛒</span>
              <span className="cart-count-badge">{cartCount}</span>
            </div>
            <span className="nav-boldtext cart-text">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
