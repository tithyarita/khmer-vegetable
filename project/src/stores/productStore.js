import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useProductStore = defineStore('product', () => {
  // ================= STATE =================
  const products = ref([])
  const selectedProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ================= API INSTANCE =================
  const api = axios.create({
    baseURL: API_BASE_URL,
  })

  // ================= AUTH INTERCEPTOR (FIX 401) =================
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  // ================= HELPERS =================
  const formatImage = (product) => {
    if (!product) return product

    if (product.imageUrl && product.imageUrl.trim() !== '') {
      product.image = product.imageUrl.startsWith('http')
        ? product.imageUrl
        : API_BASE_URL + product.imageUrl
    } else {
      product.image = null
    }

    return product
  }

  // ================= ACTIONS =================

  // GET ALL PRODUCTS
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/products')
      products.value = res.data.map(formatImage)
      return products.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Fetch products error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // GET ONE PRODUCT
  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`/products/${id}`)
      selectedProduct.value = formatImage(res.data)
      return selectedProduct.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  // CREATE PRODUCT
  const createProduct = async (data) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()

      formData.append('name', data.name)
      formData.append('price', Number(data.price))
      formData.append('stock', Number(data.stock))
      formData.append('category', data.category)
      formData.append('description', data.description || '')
      formData.append('discount', data.discount || 0)

      if (data.imageFile instanceof File) {
        formData.append('image', data.imageFile)
      }

      // FIXED: correct user structure
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user?.id) {
        formData.append('provider_id', user.id)
      }

      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newProduct = formatImage(res.data)
      products.value.push(newProduct)

      return newProduct
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Create product error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // UPDATE PRODUCT
  const updateProduct = async (id, data) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()

      formData.append('name', data.name)
      formData.append('price', Number(data.price))
      formData.append('stock', Number(data.stock))
      formData.append('category', data.category)
      formData.append('description', data.description || '')
      formData.append('discount', data.discount ?? 0)

      if (data.imageFile instanceof File) {
        formData.append('image', data.imageFile)
      }

      const res = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const updated = formatImage(res.data)

      await fetchAllProducts()

      if (selectedProduct.value?.id === id) {
        selectedProduct.value = updated
      }

      return updated
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Update product error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/products/${id}`)

      products.value = products.value.filter(p => p.id !== id)

      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= UTIL =================
  const clearError = () => (error.value = null)
  const clearSelectedProduct = () => (selectedProduct.value = null)

  // ================= COMPUTED =================
  const productCount = computed(() => products.value.length)

  const getProductById = computed(() => (id) =>
    products.value.find(p => p.id === id)
  )

  const searchProducts = computed(() => (q) => {
    if (!q) return products.value

    const query = q.toLowerCase()

    return products.value.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query)
    )
  })

  // ================= EXPORT =================
  return {
    products,
    selectedProduct,
    loading,
    error,

    fetchAllProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,

    clearError,
    clearSelectedProduct,

    productCount,
    getProductById,
    searchProducts,
  }
})