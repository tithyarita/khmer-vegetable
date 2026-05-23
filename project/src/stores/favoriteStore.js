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

export const useFavoriteStore = defineStore('favorite', () => {
  // ================= STATE =================
  const favoriteItems = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  const persistFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(favoriteItems.value))
  }

  // ================= COMPUTED =================
  const favoriteCount = computed(() => {
    return favoriteItems.value.length
  })

  const syncAddToFavorite = async (userId, productId) => {
    if (!userId || !productId) return null
    return api.post('/favorite/add', {
      userId,
      productId,
    })
  }

  const syncRemoveFromFavorite = async (userId, productId) => {
    if (!userId || !productId) return null
    return api.delete(`/favorite/remove/${userId}/${productId}`)
  }

  const syncClearFavorites = async (userId) => {
    if (!userId) return null
    return api.delete(`/favorite/clear/${userId}`)
  }

  const fetchFavoritesFromBackend = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    if (!userId) return

    try {
      const response = await api.get(`/favorite/${userId}`)
      const backendFavorites = response.data || []

      // Map backend favorite items to frontend format
      favoriteItems.value = backendFavorites.map(item => ({
        id: item.product?.id || item.product_id || item.productId,
        name: item.product?.name || item.product_name || item.name,
        price: Number(item.product?.price || item.price || item.unitPrice || 0),
        unitPrice: Number(item.product?.price || item.price || item.unitPrice || 0),
        originalPrice: Number(item.product?.originalPrice || item.originalPrice || item.price || 0),
        image: item.product?.image || item.image || item.imageUrl,
        category: item.product?.category || item.category,
        unit: item.product?.unit || item.unit || 'item',
        providerId: Number(item.product?.provider_id || item.provider_id || item.providerId || 0),
        providerName: item.product?.provider_name || item.provider_name || item.providerName || 'Unknown',
      }))

      persistFavorites()
    } catch (err) {
      console.error('Failed to fetch favorites from backend:', err)
      // Keep localStorage favorites as fallback
    }
  }

  // ================= ACTIONS =================
  const addToFavorite = async (product) => {
    const existingItem = favoriteItems.value.find(item => item.id === product.id || item.id === product.product_id || item.id === product.productId)
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
    const productId = Number(product.id ?? product.product_id ?? product.productId ?? 0)
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    if (userId && productId) {
      syncAddToFavorite(userId, productId).catch((err) => {
        console.error('Failed to persist favorite item to backend:', err)
        console.error('Error details:', err.response?.data || err.message)
        alert('Failed to add to favorites: ' + (err.response?.data?.message || err.message))
      })
    }

    if (!existingItem) {
      favoriteItems.value.push({
        id: productId || product.id,
        name: product.name,
        price: itemPrice,
        unitPrice: itemPrice,
        originalPrice: itemOriginalPrice,
        image: product.image,
        category: product.category,
        unit: product.unit || 'item',
        providerId,
        providerName,
      })
    }

    persistFavorites()
  }

  const removeFromFavorite = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    favoriteItems.value = favoriteItems.value.filter(item => item.id !== productId)
    persistFavorites()

    if (userId) {
      syncRemoveFromFavorite(userId, productId).catch((err) => {
        console.warn('Failed to remove favorite item on backend:', err)
      })
    }
  }

  const clearFavorites = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = Number(user?.id ?? user?.user_id ?? 0)

    favoriteItems.value = []
    persistFavorites()

    if (userId) {
      syncClearFavorites(userId).catch((err) => {
        console.warn('Failed to clear backend favorites:', err)
      })
    }
  }

  const isFavorite = (productId) => {
    return favoriteItems.value.some(item => item.id === productId || item.id === productId)
  }

  return {
    favoriteItems,
    favoriteCount,
    addToFavorite,
    removeFromFavorite,
    clearFavorites,
    isFavorite,
    fetchFavoritesFromBackend
  }
})
