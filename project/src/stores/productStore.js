import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const selectedProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const api = axios.create({
    baseURL: API_BASE_URL,
  })

  // ================= TOKEN =================
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    console.log('TOKEN SENT:', token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  // ================= IMAGE FIX (MAIN FIX) =================
  const formatProduct = (product) => {
    if (!product) return product

    const img = product.imageUrl || ''
    const providerId = Number(
      product.providerId ??
      product.provider_id ??
      product.provider?.user_id ??
      0
    ) || null

    const providerName =
      product.providerName ||
      product.provider?.provider_name ||
      product.provider?.name ||
      'Unknown'

    console.log('RAW imageUrl:', img)

    let finalImage = null

    if (img) {
      if (img.startsWith('http')) {
        finalImage = img
      } else {
        // FORCE correct /images path
        finalImage = `${API_BASE_URL}/images/${img.replace('/images/', '')}`
      }
    }

    product.image = finalImage
    product.providerId = providerId
    product.providerName = providerName

    console.log('FINAL image URL:', product.image)

    return product
  }

  // ================= GET ALL =================
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/products')

      console.log('API RESPONSE:', res.data)

      products.value = res.data.map(formatProduct)

      console.log('FINAL PRODUCTS:', products.value)

      return products.value
    } catch (err) {
      console.error('FETCH ERROR:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // ================= GET ONE =================
  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`/products/${id}`)

      selectedProduct.value = formatProduct(res.data)

      return selectedProduct.value
    } catch (err) {
      console.error(err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // ================= CREATE =================
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

      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user?.id) formData.append('provider_id', user.id)

      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newProduct = formatProduct(res.data)

      products.value.push(newProduct)

      return newProduct
    } catch (err) {
      console.error(err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= UPDATE =================
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
      formData.append('discount', data.discount || 0)

      if (data.imageFile) {
        formData.append('image', data.imageFile)
      }

      const res = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      selectedProduct.value = formatProduct(res.data)

      await fetchAllProducts()

      return selectedProduct.value
    } catch (err) {
      console.error('UPDATE ERROR:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ================= DELETE =================
  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/products/${id}`)

      products.value = products.value.filter(p => p.id !== id)

      return true
    } catch (err) {
      console.error(err)
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

  const searchProducts = computed(() => (q) => {
    if (!q) return products.value

    const query = q.toLowerCase()

    return products.value.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  })

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

    productCount,
    getProductById,
    searchProducts,
  }
})