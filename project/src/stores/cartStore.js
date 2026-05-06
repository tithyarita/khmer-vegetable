import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // ================= STATE =================
  const cartItems = ref([])

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

    if (existingItem) {
      existingItem.quantity++
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        quantity: 1
      })
    }
  }

  const removeFromCart = (productId) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--
      } else {
        cartItems.value.splice(index, 1)
      }
    }
  }

  const removeItemCompletely = (productId) => {
    cartItems.value = cartItems.value.filter(item => item.id !== productId)
  }

  const clearCart = () => {
    cartItems.value = []
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
