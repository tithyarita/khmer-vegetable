import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref([])
  const loading = ref(false)
  const error = ref(null)

  const api = axios.create({
    baseURL: API_BASE_URL,
  })

  // Add JWT token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Get reviews by product ID
  const fetchReviewsByProduct = async (productId) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`/reviews/product/${productId}`)
      reviews.value = res.data.map(formatReview)
      return reviews.value
    } catch (err) {
      console.error('FETCH REVIEWS ERROR:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Get reviews by current user
  const fetchReviewsByUser = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/reviews/user')
      reviews.value = res.data.map(formatReview)
      return reviews.value
    } catch (err) {
      console.error('FETCH USER REVIEWS ERROR:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Get reviews for current provider (owner of products)
  const fetchReviewsByProvider = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/reviews/provider')
      reviews.value = res.data.map(formatReview)
      return reviews.value
    } catch (err) {
      console.error('FETCH PROVIDER REVIEWS ERROR:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Create review
  const createReview = async (data) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/reviews', data)
      const newReview = formatReview(res.data)
      reviews.value.unshift(newReview)
      return newReview
    } catch (err) {
      console.error('CREATE REVIEW ERROR:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update review
  const updateReview = async (id, data) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.put(`/reviews/${id}`, data)
      const updatedReview = formatReview(res.data)
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reviews.value[index] = updatedReview
      }
      return updatedReview
    } catch (err) {
      console.error('UPDATE REVIEW ERROR:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete review
  const deleteReview = async (id) => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/reviews/${id}`)
      reviews.value = reviews.value.filter(r => r.id !== id)
      return true
    } catch (err) {
      console.error('DELETE REVIEW ERROR:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Format review data for frontend
  const formatReview = (review) => {
    if (!review) return review

    const userName = review.user?.name || review.user?.email || 'Anonymous'
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#2d6a3f', '#a3c585', '#e8a87c', '#6b8e6b', '#c9a87c']
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      id: review.id,
      rating: review.rating,
      feedback: review.feedback,
      author: userName,
      initials: initials,
      color: color,
      date: new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: 'Phnom Penh, KH',
      verified: true,
      title: 'Customer Review',
      body: review.feedback,
      userId: review.user?.id,
      productId: review.product?.id,
    }
  }

  // Computed properties
  const averageRating = computed(() => {
    if (!reviews.value.length) return 0
    const total = reviews.value.reduce((acc, curr) => acc + curr.rating, 0)
    return (total / reviews.value.length).toFixed(1)
  })

  const reviewCount = computed(() => reviews.value.length)

  return {
    reviews,
    loading,
    error,
    fetchReviewsByProduct,
    fetchReviewsByUser,
    fetchReviewsByProvider,
    createReview,
    updateReview,
    deleteReview,
    averageRating,
    reviewCount,
  }
})
