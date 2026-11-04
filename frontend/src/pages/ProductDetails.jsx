import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import ProductReviews from '../components/ProductReviews.jsx'
import './ProductDetails.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

export default function ProductDetails() {
  const { productId } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleRatingChange = useCallback((value) => {
    setProduct((current) => current ? { ...current, rating: value } : current)
  }, [])

  useEffect(() => {
    let active = true
    async function loadProduct() {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Unable to load this product.')
        if (active) setProduct(data.product || data)
      } catch (cause) {
        if (active) setError(cause.message || 'Unable to load this product.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProduct()
    return () => { active = false }
  }, [productId])

  if (loading) return <main className="product-details-page"><p role="status">Loading product details…</p></main>
  if (error || !product) return <main className="product-details-page"><p className="details-error" role="alert">{error || 'Product not found.'}</p><Link to="/products">Back to products</Link></main>

  const name = product.name ?? product.productName ?? 'Product'
  const id = product.productId ?? product._id
  const price = Number(product.price ?? product.productPrice ?? 0)
  const available = Number(product.availableQuantity ?? 0)
  const rating = Number(product.rating ?? product.productRating ?? 0)
  const reviews = product.reviews ?? product.productReviews ?? []

  function handleAddToCart() {
    const added = addToCart(product)
    setNotice(added ? `${name} added to your cart.` : 'This product is out of stock or has reached its stock limit.')
  }

  return (
    <main className="product-details-page">
      <Link className="details-back-link" to="/products">← Back to products</Link>
      <section className="product-details-card">
        <div className="product-details-photo">
          {product.imageUrl ? <img src={product.imageUrl} alt={name} /> : <div className="product-image-fallback" aria-label="No product image">No image</div>}
        </div>
        <div className="product-details-copy">
          <p className="product-details-category">{product.category || 'Uncategorized'}</p>
          <h1>{name}</h1>
          <p className="product-details-rating"><span aria-hidden="true">★</span> {rating.toFixed(1)} / 5 <span>({reviews.length} reviews)</span></p>
          <p className="product-details-price">{money(price)}</p>
          <p className="product-details-description">{product.description || 'No description is available for this product.'}</p>
          <dl className="product-details-facts">
            <div><dt>Product ID</dt><dd>{id}</dd></div>
            <div><dt>Category</dt><dd>{product.category || '—'}</dd></div>
            <div><dt>Available quantity</dt><dd>{available}</dd></div>
            <div><dt>Availability</dt><dd className={available > 0 ? 'stock-available' : 'stock-unavailable'}>{available > 0 ? 'In stock' : 'Out of stock'}</dd></div>
          </dl>
          {notice && <p className="details-notice" role="status">{notice}</p>}
          <button className="details-add-button" type="button" onClick={handleAddToCart} disabled={available < 1}>Add to cart</button>
        </div>
      </section>
      <ProductReviews productId={product.productId} initialRating={rating} onRatingChange={handleRatingChange} />
    </main>
  )
}
