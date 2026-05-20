import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // ================= STATE =================
  const cartItems = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

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

  // ================= ACTIONS =================
  const addToCart = (product) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    const itemPrice = Number(product.price ?? product.unitPrice ?? 0)
    const itemOriginalPrice = Number(product.originalPrice ?? itemPrice)
    const providerId = Number(
      product.provider_id ?? product.providerId ?? product.provider?.user_id ?? 0
    ) || null
    const quantityToAdd = Number(product.quantity ?? 1) || 1

    if (existingItem) {
      existingItem.quantity += quantityToAdd
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: itemPrice,
        unitPrice: itemPrice,
        originalPrice: itemOriginalPrice,
        image: product.image,
        category: product.category,
        unit: product.unit || 'item',
        providerId,
        quantity: quantityToAdd
      })
    }

    persistCart()
  }

  const removeFromCart = (productId) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--
      } else {
        cartItems.value.splice(index, 1)
      }

      persistCart()
    }
  }

  const removeItemCompletely = (productId) => {
    cartItems.value = cartItems.value.filter(item => item.id !== productId)
    persistCart()
  }

  const clearCart = () => {
    cartItems.value = []
    persistCart()
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart
  }
})
