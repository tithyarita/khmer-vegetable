import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

const transformProductImage = (product) => {
  if (product.imageUrl && !product.imageUrl.startsWith('http')) {
    // Convert relative path to absolute URL
    product.image = `${API_BASE_URL}${product.imageUrl}`
  } else if (product.imageUrl) {
    product.image = product.imageUrl
  } else {
    product.image = 'https://via.placeholder.com/200?text=No+Image'
  }
  return product
}

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedProduct = ref(null)

  // API client instance
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Actions
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/products')
      // Transform image URLs from backend responses
      products.value = response.data.map(transformProductImage)
      return products.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch products'
      console.error('Error fetching products:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/products/${id}`)
      selectedProduct.value = transformProductImage(response.data)
      return selectedProduct.value
    } catch (err) {
      error.value = err.message || `Failed to fetch product with id ${id}`
      console.error('Error fetching product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', productData.name)
      formData.append('price', productData.price)
      // Stock must be sent as a number
      formData.append('stock', Number(productData.stock))
      formData.append('category', productData.category)
      formData.append('description', productData.description || '')
      formData.append('discount', productData.discount || 0)
      
      // Add image file if present
      if (productData.imageFile instanceof File) {
        formData.append('image', productData.imageFile)
      }

      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const newProduct = transformProductImage(response.data)
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create product'
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', productData.name)
      formData.append('price', productData.price)
      // Stock must be sent as a number
      formData.append('stock', Number(productData.stock))
      formData.append('category', productData.category)
      formData.append('description', productData.description || '')
      formData.append('discount', productData.discount || 0)
      
      // Add image file if present and it's a new file
      if (productData.imageFile instanceof File) {
        formData.append('image', productData.imageFile)
      }

      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Update in local state with transformed image URL
      const updatedProduct = transformProductImage(response.data)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      
      return updatedProduct
    } catch (err) {
      error.value = err.response?.data?.message || err.message || `Failed to update product with id ${id}`
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete(`/products/${id}`)
      
      // Remove from local state
      products.value = products.value.filter(p => p.id !== id)
      
      return true
    } catch (err) {
      error.value = err.message || `Failed to delete product with id ${id}`
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedProduct = () => {
    selectedProduct.value = null
  }

  // Computed properties
  const productCount = computed(() => products.value.length)

  const getProductById = computed(() => (id) => {
    return products.value.find(p => p.id === id)
  })

  const getProductsByCategory = computed(() => (category) => {
    return products.value.filter(p => p.category === category)
  })

  const searchProducts = computed(() => (query) => {
    if (!query) return products.value
    const lowerQuery = query.toLowerCase()
    return products.value.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    )
  })

  return {
    // State
    products,
    loading,
    error,
    selectedProduct,
    
    // Actions
    fetchAllProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    clearSelectedProduct,
    
    // Computed
    productCount,
    getProductById,
    getProductsByCategory,
    searchProducts,
  }
})
