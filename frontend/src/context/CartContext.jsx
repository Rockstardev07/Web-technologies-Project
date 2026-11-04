import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'shopping-cart'

const getId = (product) => String(product?.productId ?? product?._id ?? product?.id ?? '')
const getStock = (product) => {
  const stock = Number(product?.availableQuantity)
  return Number.isFinite(stock) ? Math.max(0, stock) : 0
}
const getPrice = (product) => Number(product?.price ?? product?.productPrice ?? 0)
const getCartQuantity = (item) => Number(item.cartQuantity ?? item.quantity ?? 1)

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item) => getId(item) && getStock(item) > 0).map((item) => ({
      ...item,
      cartQuantity: Math.max(1, Math.min(getCartQuantity(item), getStock(item))),
    })).filter((item) => item.cartQuantity > 0)
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Keep the cart usable in memory if browser storage is unavailable.
    }
  }, [items])

  const addToCart = useCallback((product) => {
    const id = getId(product)
    const stock = getStock(product)
    if (!id || stock < 1) return false

    const existing = items.find((item) => getId(item) === id)
    if (existing && getCartQuantity(existing) >= stock) return false

    setItems((current) => {
      const currentItem = current.find((item) => getId(item) === id)
      if (currentItem) {
        if (getCartQuantity(currentItem) >= getStock(product)) return current
        return current.map((item) => getId(item) === id
          ? { ...item, ...product, cartQuantity: getCartQuantity(item) + 1 }
          : item)
      }
      return [...current, { ...product, cartQuantity: 1 }]
    })
    return true
  }, [items])

  const increaseQuantity = useCallback((id) => {
    setItems((current) => current.map((item) => {
      if (getId(item) !== String(id)) return item
      const quantity = getCartQuantity(item)
      return quantity < getStock(item) ? { ...item, cartQuantity: quantity + 1 } : item
    }))
  }, [])

  const decreaseQuantity = useCallback((id) => {
    setItems((current) => current.map((item) => {
      if (getId(item) !== String(id)) return item
      const quantity = getCartQuantity(item)
      return quantity > 1 ? { ...item, cartQuantity: quantity - 1 } : item
    }))
  }, [])

  const removeFromCart = useCallback((id) => {
    setItems((current) => current.filter((item) => getId(item) !== String(id)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const placeOrder = useCallback(async () => {
    if (!items.length) throw new Error('Your cart is empty.')
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Please sign in before placing an order.')

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ products: items.map((item) => ({
        productId: item.productId,
        quantity: getCartQuantity(item),
      })) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'Unable to place your order.')
    clearCart()
    return data
  }, [items, clearCart])

  const cartCount = items.reduce((sum, item) => sum + getCartQuantity(item), 0)
  const totalAmount = items.reduce((sum, item) => sum + getPrice(item) * getCartQuantity(item), 0)
  const value = useMemo(() => ({
    items,
    cartItems: items,
    cartCount,
    itemCount: cartCount,
    totalAmount,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    placeOrder,
  }), [items, cartCount, totalAmount, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, placeOrder])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
