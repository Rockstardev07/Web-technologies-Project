import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './OrderHistory.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0)

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please sign in to view your orders.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to load your orders.')
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (cause) {
      setError(cause.message || 'Unable to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders, reload])

  return (
    <main className="order-history-page">
      <header className="order-history-heading"><div><p className="order-history-kicker">YOUR ACCOUNT</p><h1>Your orders</h1><p>Review purchases and order details.</p></div><Link to="/products">Continue shopping</Link></header>
      {loading ? <div className="order-history-state" role="status">Loading your orders…</div> : error ? (
        <section className="order-history-state order-history-error" role="alert"><p>{error}</p><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></section>
      ) : orders.length === 0 ? (
        <section className="order-history-state order-history-empty"><div aria-hidden="true">📦</div><h2>No orders yet</h2><p>When you place an order, it will appear here.</p><Link to="/products">Explore products</Link></section>
      ) : (
        <section className="order-history-list" aria-label="Order history">
          {orders.map((order) => (
            <article className="order-history-card" key={order._id || order.orderId}>
              <header className="order-card-header">
                <div><span>ORDER PLACED</span><strong>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date unavailable'}</strong></div>
                <div><span>ORDER ID</span><strong>{order.orderId || order._id}</strong></div>
                <div><span>STATUS</span><strong className="order-status">{order.orderStatus || 'Processing'}</strong></div>
                <div><span>ORDER TOTAL</span><strong>{money(order.totalAmount)}</strong></div>
              </header>
              <div className="order-card-products">
                {(order.products || []).map((product, index) => (
                  <div className="order-history-product" key={`${product.productId || product._id}-${index}`}>
                    <div><h3>{product.productName || product.name || 'Product'}</h3><p>Product ID: {product.productId || '—'} · Quantity: {product.quantity}</p></div>
                    <strong>{money(Number(product.price) * Number(product.quantity))}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
