import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || '')
  const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  function setUser(newUser, newToken) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('token', newToken)
  }

  function logout() {
    user.value = null
    token.value = ''
    cart.value = []
    favorites.value = []
    localStorage.clear()
  }

  function addToCart(item) {
    cart.value.push(item)
    localStorage.setItem('cart', JSON.stringify(cart.value))
  }

  function addToFavorites(item) {
    favorites.value.push(item)
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  function clearCart() {
    cart.value = []
    localStorage.setItem('cart', '[]')
  }

  function clearFavorites() {
    favorites.value = []
    localStorage.setItem('favorites', '[]')
  }

  const isLoggedIn = computed(() => !!user.value && !!token.value)

  return {
    user,
    token,
    cart,
    favorites,
    isLoggedIn,
    setUser,
    logout,
    addToCart,
    addToFavorites,
    clearCart,
    clearFavorites
  }
})
