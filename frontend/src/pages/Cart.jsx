import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import './Cart.css'

const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

export default function Cart() {
  const { items, cartCount, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalAmount, placeOrder } = useCart()
  const [placingOrder, setPlacingOrder] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  async function handlePlaceOrder() {
    setError('')
    setMessage('')
    if (!items.length) {
      setError('Your cart is empty. Add products before placing an order.')
      return
    }

    setPlacingOrder(true)
    try {
      const result = await placeOrder()
      const order = result.order || {}
      setConfirmation({
        orderId: result.orderId || order.orderId || 'Order placed',
        products: order.products || items.map((item) => ({
          productId: item.productId,
          productName: item.name ?? item.productName,
          price: item.price ?? item.productPrice,
          quantity: item.cartQuantity,
        })),
        totalAmount: Number(order.totalAmount ?? totalAmount),
        orderDate: order.orderDate || new Date().toISOString(),
      })
      setMessage(result.message || 'Your order was placed successfully.')
    } catch (cause) {
      setError(cause.message || 'Unable to place your order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <main className="cart-page">
      <header className="cart-page-header">
        <div><p className="cart-eyebrow">KAADUGAL CHECKOUT</p><h1>Shopping cart</h1></div>
        {!confirmation && items.length > 0 && <button className="cart-clear-button" type="button" onClick={clearCart}>Clear cart</button>}
      </header>

      {error && <p className="cart-alert cart-alert-error" role="alert">{error}</p>}
      {message && <p className="cart-alert cart-alert-success" role="status">{message}</p>}

      {confirmation ? (
        <section className="order-confirmation" aria-labelledby="confirmation-heading">
          <div className="confirmation-check" aria-hidden="true">✓</div>
          <p className="cart-eyebrow">ORDER CONFIRMED</p>
          <h2 id="confirmation-heading">Thank you for your order</h2>
          <p>Order ID: <strong>{confirmation.orderId}</strong></p>
          <p className="confirmation-date">Placed {new Date(confirmation.orderDate).toLocaleString()}</p>
          <div className="confirmation-lines">
            {confirmation.products.map((product, index) => (
              <div className="cart-summary-row" key={`${product.productId}-${index}`}>
                <span>{product.productName} × {product.quantity}</span>
                <span>{money(Number(product.price) * Number(product.quantity))}</span>
              </div>
            ))}
            <div className="cart-summary-total"><span>Order total</span><strong>{money(confirmation.totalAmount)}</strong></div>
          </div>
          <Link className="cart-primary-link" to="/orders">View order history</Link>
        </section>
      ) : items.length === 0 ? (
        <section className="cart-empty-state">
          <div className="cart-empty-icon" aria-hidden="true">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse the shop and add something you love.</p>
          <Link className="cart-primary-link" to="/products">Continue shopping</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Products in your cart">
            {items.map((item) => {
              const id = String(item.productId ?? item._id ?? item.id)
              const name = item.name ?? item.productName ?? 'Product'
              const price = Number(item.price ?? item.productPrice ?? 0)
              const image = item.imageUrl ?? item.productImageUrl ?? item.image
              const quantity = Number(item.cartQuantity ?? item.quantity ?? 1)
              const available = Number(item.availableQuantity ?? 0)
              return (
                <article className="cart-item" key={id}>
                  <div className="cart-item-image">{image ? <img src={image} alt={name} /> : <span aria-hidden="true">◇</span>}</div>
                  <div className="cart-item-content">
                    <div className="cart-item-heading"><div><p className="cart-item-category">{item.category || 'General'}</p><h2>{name}</h2></div>
                      <button type="button" className="cart-remove-button" onClick={() => removeFromCart(id)} aria-label={`Remove ${name}`}>Remove</button>
                    </div>
                    <p className="cart-item-price">{money(price)} each <span>· {available} available</span></p>
                    <div className="cart-item-footer">
                      <div className="cart-quantity-control" aria-label={`${name} quantity`}>
                        <button type="button" onClick={() => decreaseQuantity(id)} disabled={quantity <= 1} aria-label={`Decrease ${name} quantity`}>−</button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => increaseQuantity(id)} disabled={quantity >= available} aria-label={`Increase ${name} quantity`}>+</button>
                      </div>
                      <strong>{money(price * quantity)}</strong>
                    </div>
                  </div>
                </article>
              )
            })}
            <Link className="cart-continue-link" to="/products">← Continue shopping</Link>
          </section>

          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="cart-summary-row"><span>Items ({cartCount})</span><span>{money(totalAmount)}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="cart-summary-total"><span>Estimated total</span><strong>{money(totalAmount)}</strong></div>
            <button type="button" className="cart-place-order" onClick={handlePlaceOrder} disabled={placingOrder}>
              {placingOrder ? 'Placing order…' : 'Place order'}
            </button>
            <p className="cart-trust-note">Final pricing and stock availability are confirmed by the server.</p>
          </aside>
        </div>
      )}
    </main>
  )
}
