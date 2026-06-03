import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useProductStore = defineStore('product', () => {
  // ================= STATE =================
  const products = ref([])
  const selectedProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ================= AXIOS INSTANCE =================
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  })

  // ================= AUTH TOKEN =================
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  // ================= ERROR HANDLER =================
  const handleError = (err, label = 'API ERROR') => {
    console.error(`\n❌ ${label}`)

    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Data:', err.response.data)
    } else if (err.request) {
      console.error('No response from server')
    } else {
      console.error('Error:', err.message)
    }

    error.value = err.response?.data?.message || err.message
  }

  // ================= FORMAT PRODUCT =================
  const formatProduct = (p) => {
    if (!p) return p

    const image = p.image || p.imageUrl || ''

    let finalImage = ''

    if (image) {
      if (image.startsWith('http')) {
        finalImage = image
      } else if (image.startsWith('/')) {
        finalImage = `${API_BASE_URL}${image}`
      } else {
        finalImage = `${API_BASE_URL}/uploads/${image.replace(/^\/uploads\//, '')}`
      }
    }

    return {
      ...p,
      image: finalImage,

      providerId:
        p.providerId ||
        p.provider_id ||
        p.provider?.id ||
        null,

      providerName:
        p.providerName ||
        p.provider?.provider_name ||
        'Unknown',
    }
  }

  // ================= GET ALL PRODUCTS =================
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/products')

      if (!Array.isArray(res.data)) {
        throw new Error('Invalid API response: expected array')
      }

      products.value = res.data.map(formatProduct)

      return products.value
    } catch (err) {
      handleError(err, 'FETCH PRODUCTS FAILED')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchProviderProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/products/provider')

      if (!Array.isArray(res.data)) {
        throw new Error('Invalid API response: expected array')
      }

      products.value = res.data.map(formatProduct)

      return products.value
    } catch (err) {
      handleError(err, 'FETCH PROVIDER PRODUCTS FAILED')
      return []
    } finally {
      loading.value = false
    }
  }

  // ================= GET ONE PRODUCT =================
  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`/products/${id}`)

      selectedProduct.value = formatProduct(res.data)

      return selectedProduct.value
    } catch (err) {
      handleError(err, 'FETCH PRODUCT FAILED')
      return null
    } finally {
      loading.value = false
    }
  }

  // ================= CREATE PRODUCT =================
  const createProduct = async (data) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()

      formData.append('name', data.name || '')
      formData.append('price', Number(data.price || 0))
      formData.append('stock', Number(data.stock || 0))
      formData.append('category', data.category || '')
      formData.append('description', data.description || '')
      formData.append('discount', Number(data.discount || 0))

      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user?.id) {
        formData.append('provider_id', user.id)
      }

      const res = await api.post('/products', formData)

      const newProduct = formatProduct(res.data)

      products.value.unshift(newProduct)

      return newProduct
    } catch (err) {
      handleError(err, 'CREATE PRODUCT FAILED')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= UPDATE PRODUCT =================
  const updateProduct = async (id, data) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()

      formData.append('name', data.name || '')
      formData.append('price', Number(data.price || 0))
      formData.append('stock', Number(data.stock || 0))
      formData.append('category', data.category || '')
      formData.append('description', data.description || '')
      formData.append('discount', Number(data.discount || 0))

      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      const res = await api.put(`/products/${id}`, formData)

      const updated = formatProduct(res.data)

      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }

      selectedProduct.value = updated

      return updated
    } catch (err) {
      handleError(err, 'UPDATE PRODUCT FAILED')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/products/${id}`)

      products.value = products.value.filter(p => p.id !== id)

      return true
    } catch (err) {
      handleError(err, 'DELETE PRODUCT FAILED')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= COMPUTED =================
  const productCount = computed(() => products.value.length)

  const getProductById = computed(() => (id) =>
    products.value.find(p => p.id === id)
  )

  const searchProducts = computed(() => (query) => {
    if (!query) return products.value

    const q = query.toLowerCase()

    return products.value.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  // ================= RETURN =================
  return {
    products,
    selectedProduct,
    loading,
    error,

    fetchAllProducts,
    fetchProviderProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,

    productCount,
    getProductById,
    searchProducts,
  }
})