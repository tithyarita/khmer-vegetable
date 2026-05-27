import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useCartStore = defineStore('cart', () => {
  // ================= STATE =================
  const normalizeCartItem = (item) => ({
    ...item,
    providerId: Number(item?.providerId ?? item?.provider_id ?? item?.provider?.user_id ?? 0) || null,
    provider_id: Number(item?.provider_id ?? item?.providerId ?? item?.provider?.user_id ?? 0) || null,
  })

  const cartItems = ref(
    JSON.parse(localStorage.getItem('cart') || '[]').map(normalizeCartItem),
  )

  const persistCart = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  }

  // ================= COMPUTED =================
  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2)
  })

  const syncAddToCart = async (userId, productId, quantity) => {
    if (!userId || !productId || quantity <= 0) return null
    return api.post('/cart/add', {
      userId,
      productId,
      quantity,
    })
  }

  const syncUpdateCartItem = async (userId, productId, quantity) => {
    if (!userId || !productId) return null
    return api.put('/cart/update', {
      userId,
      productId,
      quantity,
    })
  }

  const syncRemoveCartItem = async (userId, productId) => {
    if (!userId || !productId) return null
    return api.delete(`/cart/remove/${userId}/${productId}`)
  }

  const syncClearCart = async (userId) => {
    if (!userId) return null
    return api.delete(`/cart/clear/${userId}`)
  }

  const fetchCartFromBackend = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    if (!userId) return

    try {
      const response = await api.get(`/cart/${userId}`)
      const backendCart = response.data || []

      // Map backend cart items to frontend format
      cartItems.value = backendCart.map(item => ({
        id: item.product_id || item.productId,
        name: item.product_name || item.name,
        price: Number(item.price || item.unitPrice || 0),
        unitPrice: Number(item.price || item.unitPrice || 0),
        originalPrice: Number(item.originalPrice || item.price || 0),
        image: item.image || item.imageUrl,
        category: item.category,
        unit: item.unit || 'item',
        providerId: Number(item.provider_id || item.providerId || 0),
        providerName: item.provider_name || item.providerName || 'Unknown',
        quantity: Number(item.quantity || 1)
      }))

      persistCart()
    } catch (err) {
      console.error('Failed to fetch cart from backend:', err)
      // Keep localStorage cart as fallback
    }
  }

  // ================= ACTIONS =================
  const addToCart = async (product) => {
    const stockValue = product?.stock
    if (stockValue !== undefined && stockValue !== null) {
      const availableStock = Number(stockValue)
      if (Number.isFinite(availableStock) && availableStock <= 0) {
        alert('This product is out of stock.')
        return
      }
    }

    const existingItem = cartItems.value.find(item => item.id === product.id || item.id === product.product_id || item.id === product.productId)
    const itemPrice = Number(product.price ?? product.unitPrice ?? 0)
    const itemOriginalPrice = Number(product.originalPrice ?? itemPrice)
    const providerId = Number(
      product.provider_id ?? product.providerId ?? product.provider?.user_id ?? 0
    ) || null
    const providerName =
      product.providerName ||
      product.provider?.provider_name ||
      product.provider?.name ||
      'Unknown'
    const quantityToAdd = Number(product.quantity ?? 1) || 1
    const productId = Number(product.id ?? product.product_id ?? product.productId ?? 0)
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    if (userId && productId) {
      syncAddToCart(userId, productId, quantityToAdd).catch((err) => {
        console.error('Failed to persist cart item to backend:', err)
        console.error('Error details:', err.response?.data || err.message)
        alert('Failed to add to cart: ' + (err.response?.data?.message || err.message))
      })
    }

    if (existingItem) {
      existingItem.quantity += quantityToAdd
    } else {
      cartItems.value.push({
        id: productId || product.id,
        name: product.name,
        price: itemPrice,
        unitPrice: itemPrice,
        originalPrice: itemOriginalPrice,
        image: product.image,
        category: product.category,
        unit: product.unit || 'item',
        providerId,
        provider_id: providerId,
        providerName,
        quantity: quantityToAdd
      })
    }

    persistCart()
  }

  const removeFromCart = async (productId) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const userId = Number(user?.id ?? user?.user_id ?? 0)

      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--
        if (userId) {
          syncUpdateCartItem(userId, productId, cartItems.value[index].quantity).catch((err) => {
            console.warn('Failed to update cart quantity on backend:', err)
          })
        }
      } else {
        cartItems.value.splice(index, 1)
        if (userId) {
          syncRemoveCartItem(userId, productId).catch((err) => {
            console.warn('Failed to remove cart item on backend:', err)
          })
        }
      }

      persistCart()
    }
  }

  const removeItemCompletely = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    cartItems.value = cartItems.value.filter(item => item.id !== productId)
    persistCart()

    if (userId) {
      syncRemoveCartItem(userId, productId).catch((err) => {
        console.warn('Failed to remove cart item on backend:', err)
      })
    }
  }

  const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    cartItems.value = []
    persistCart()

    if (userId) {
      syncClearCart(userId).catch((err) => {
        console.warn('Failed to clear backend cart:', err)
      })
    }
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    fetchCartFromBackend
  }
})
