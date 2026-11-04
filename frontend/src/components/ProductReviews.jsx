import { useEffect, useState } from 'react'
import './ProductReviews.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductReviews({ productId, initialRating = 0, onRatingChange }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(Number(initialRating) || 0)
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    let active = true
    async function loadReviews() {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productId)}/reviews`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Unable to load reviews.')
        if (active) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : [])
          if (data.averageRating !== undefined) {
            const average = Number(data.averageRating) || 0
            setAverageRating(average)
            onRatingChange?.(average)
          }
          setError('')
        }
      } catch (cause) {
        if (active) setError(cause.message || 'Unable to load reviews.')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (productId) loadReviews()
    return () => { active = false }
  }, [productId, onRatingChange])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!token) {
      setError('Please sign in to submit a review.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: Number(rating), comment: comment.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to submit your review.')
      setMessage(data.message || 'Your review was submitted.')
      setRating('')
      setComment('')

      // The POST response includes the new review and updated average rating.
      if (data.review) setReviews((current) => [data.review, ...current.filter((item) => String(item._id) !== String(data.review._id))])
      if (data.averageRating !== undefined) {
        const average = Number(data.averageRating) || 0
        setAverageRating(average)
        onRatingChange?.(average)
      }
    } catch (cause) {
      setError(cause.message || 'Unable to submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="product-reviews" aria-labelledby="product-reviews-heading">
      <div className="reviews-title-row">
        <div><p className="reviews-kicker">SHOPPER FEEDBACK</p><h2 id="product-reviews-heading">Customer reviews</h2></div>
        <p className="reviews-average"><strong>{averageRating.toFixed(1)}</strong><span> / 5</span><span className="reviews-star" aria-hidden="true"> ★</span></p>
      </div>

      {error && <p className="reviews-message reviews-error" role="alert">{error}</p>}
      {message && <p className="reviews-message reviews-success" role="status">{message}</p>}
      {loading ? <p className="reviews-empty" role="status">Loading reviews…</p> : reviews.length === 0 ? (
        <p className="reviews-empty">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <article className="review-item" key={review._id || `${review.username}-${index}`}>
              <div className="review-item-header"><strong>{review.username || 'Kaadugal customer'}</strong><span>{review.rating} / 5 <span className="reviews-star" aria-hidden="true">★</span></span></div>
              <p>{review.comment || 'No written comment.'}</p>
              {review.createdAt && <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>}
            </article>
          ))}
        </div>
      )}

      <form className="review-submit-form" onSubmit={handleSubmit}>
        <h3>Write a review</h3>
        {!token && <p className="reviews-empty">Sign in to submit a rating and review.</p>}
        <label htmlFor="review-rating">Your rating</label>
        <select id="review-rating" value={rating} onChange={(event) => setRating(event.target.value)} required>
          <option value="">Select a rating</option>
          {[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} out of 5</option>)}
        </select>
        <label htmlFor="review-comment">Your comment</label>
        <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} rows="4" maxLength="1000" placeholder="What should other shoppers know?" />
        <button type="submit" disabled={!token || submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
      </form>
    </section>
  )
}
