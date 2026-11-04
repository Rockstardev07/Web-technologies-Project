import React from "react";
import { Link } from "react-router-dom";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(amount) || 0
  );

export default function ProductCard({ product, onAddToCart }) {
  const id = product.productId || product._id || "N/A";
  const name = product.productName || product.name || "Untitled Product";
  const price = Number(product.productPrice ?? product.price ?? 0);
  const category = product.category || "General";
  const quantity = Number(product.availableQuantity ?? product.quantity ?? 0);
  const description = product.description || "No product description provided.";
  const image =
    product.imageUrl ||
    product.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";

  const isInStock = quantity > 0;

  return (
    <article className="store-product-card">
      <div className="card-media-box">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <div className="card-details">
        <div className="card-meta-row">
          <span className="badge-category">{category}</span>
          <span className="item-sku">ID: #{id}</span>
        </div>

        <h3 className="item-title" title={name}>
          {name}
        </h3>
        <Link to={`/products/${encodeURIComponent(id)}`} className="product-card-details-link">
          View product details
        </Link>

        <p className="item-description" title={description}>
          {description}
        </p>

        <div className="item-rating-row">
          <span className="star-icons">★★★★☆</span>
          <span className="rating-total">1,248</span>
        </div>

        <div className="item-pricing">
          <strong className="item-price">{money(price)}</strong>
        </div>

        <div className="item-inventory">
          {isInStock ? (
            <span className="status-instock">
              In Stock &nbsp;•&nbsp; <strong>{quantity} units left</strong>
            </span>
          ) : (
            <span className="status-outstock">Currently Out of Stock</span>
          )}
        </div>

        <button
          className="store-cta-btn"
          disabled={!isInStock}
          onClick={() => onAddToCart && onAddToCart(product)}
        >
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}
