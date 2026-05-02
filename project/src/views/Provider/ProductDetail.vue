<template>
  <div class="product-detail">
    <div class="detail-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Product Details" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto">
          <div class="p-4">
            <!-- Back Button -->
            <div class="mb-4">
              <button @click="goBack" class="btn btn-link btn-sm p-0 text-decoration-none text-muted hover-link">
                <i class="bi bi-arrow-left"></i> Back to Products
              </button>
            </div>

            <!-- Main Card -->
            <div class="card detail-card shadow-sm">
              <div class="card-body p-5">
                <div class="row">
                  <!-- Product Image Section -->
                  <div class="col-lg-5 mb-5 mb-lg-0">
                    <div class="product-image-wrapper">
                      <div class="product-image-container">
                        <img 
                          :src="product.image" 
                          @error="handleImageError"
                          class="img-fluid"
                          :alt="product.name"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Product Information Section -->
                  <div class="col-lg-7">
                    <!-- Product Name and Price -->
                    <div class="mb-5">
                      <h2 class="product-title">{{ product.name }}</h2>
                      <p class="product-id text-muted">ID: {{ product.id }}</p>
                      <div class="price-section d-flex align-items-baseline gap-3">
                        <span class="product-price">${{ product.price }}</span>
                        <span class="price-unit text-muted">per unit</span>
                      </div>
                    </div>

                    <!-- Product Details Grid -->
                    <div class="details-grid mb-5">
                      <div class="detail-row">
                        <span class="detail-label">Stock Available</span>
                        <span class="detail-value">{{ product.stock }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Date Added</span>
                        <span class="detail-value">{{ product.addedDate || 'N/A' }}</span>
                      </div>
                    </div>

                    <!-- Description Section -->
                    <div class="description-section mb-5" v-if="product.description">
                      <h5 class="description-title mb-3">
                        <i class="bi bi-file-text"></i> Description
                      </h5>
                      <p class="description-text">{{ product.description }}</p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons-section">
                      <button @click="editProduct" class="btn btn-success btn-lg me-2">
                        <i class="bi bi-pencil"></i> Edit Product
                      </button>
                      <button @click="deleteProduct" class="btn btn-outline-danger btn-lg">
                        <i class="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Info Card -->
            <div class="card detail-card shadow-sm mt-4">
              <div class="card-header bg-white border-bottom p-4">
                <h5 class="mb-0 fw-bold">
                  <i class="bi bi-info-circle text-success"></i> Additional Information
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="info-item">
                      <p class="info-label mb-1"><i class="bi bi-check2-circle" :class="product.stock > 0 ? 'text-success' : 'text-danger'"></i> Status</p>
                      <p class="info-value"><span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">{{ product.stock > 0 ? 'Active' : 'Inactive' }}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <PopupCard 
      v-if="showModal"
      :is-open="showModal"
      :is-edit-mode="true"
      :product="product"
      @close="closeModal"
      @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import PopupCard from '../../components/provider_com/popupCard.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const showModal = ref(false)
const product = ref({
  id: '',
  name: '',
  price: 0,
  stock: '',
  category: '',
  image: '',
  addedDate: '',
  description: ''
})

onMounted(async () => {
  // Get product ID from route params or query
  const productId = route.params.id || route.query.id
  
  if (productId) {
    // Fetch products from store if not already loaded
    if (!productStore.products || productStore.products.length === 0) {
      await productStore.fetchAllProducts()
    }
    loadProduct(productId)
  } else {
    // If no product ID, redirect back to products
    router.push('/provider/products')
  }
})

const loadProduct = (productId) => {
  try {
    if (!productId) {
      alert('No product ID found')
      router.push('/provider/products')
      return
    }

    // Find product from store
    const foundProduct = productStore.products.find(p => String(p.id) === String(productId))
    
    if (foundProduct) {
      // Ensure all properties exist
      product.value = {
        id: foundProduct.id ?? '',
        name: foundProduct.name ?? '',
        price: foundProduct.price ?? 0,
        stock: foundProduct.stock ?? 0,
        category: foundProduct.category ?? '',
        image: foundProduct.image ?? '',
        addedDate: foundProduct.addedDate ?? '',
        description: foundProduct.description ?? ''
      }
      console.log('Product loaded:', product.value)
    } else {
      console.error('Product not found with ID:', productId)
      console.log('Available products:', productStore.products)
      alert('Product not found')
      router.push('/provider/products')
    }
  } catch (error) {
    console.error('Error loading product:', error)
    alert('Error loading product: ' + error.message)
    router.push('/provider/products')
  }
}

const capitalizeCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300'
}

const goBack = () => {
  router.push('/provider/products')
}

const editProduct = () => {
  // Make sure product data is fresh
  const productId = route.params.id || route.query.id
  loadProduct(productId)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  // Refresh product data after modal closes
  setTimeout(() => {
    const productId = route.params.id || route.query.id
    loadProduct(productId)
  }, 300)
}

const saveProduct = async (productData) => {
  try {
    // Update product through the store
    await productStore.updateProduct(productData.id, productData)
    
    // Reload the product data
    loadProduct(productData.id)
    
    // Close modal and show success
    showModal.value = false
    alert('Product updated successfully!')
  } catch (error) {
    console.error('Error saving product:', error)
    alert('Error updating product: ' + error.message)
  }
}

const deleteProduct = async () => {
  if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
      const productId = product.value.id
      // Delete product through the store
      await productStore.deleteProduct(productId)
      alert('Product deleted successfully!')
      router.push('/provider/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product: ' + error.message)
    }
  }
}
</script>

<style scoped>
.product-detail {
  background-color: #f5f5f5;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.detail-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.sidebar-wrapper {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  background-color: #f5f5f5;
  flex: 1;
  overflow-y: auto;
}

.hover-link {
  color: #666 !important;
  transition: all 0.3s ease;
}

.hover-link:hover {
  color: #2d5016 !important;
  padding-left: 5px;
}

.detail-card {
  border: none;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.detail-card:hover {
  box-shadow: 0 4px 12px rgba(45, 80, 22, 0.1) !important;
}

.product-image-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-image-container {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-image-container:hover {
  border-color: #2d5016;
}

.product-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.description-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f5f5 100%);
  border-left: 4px solid #2d5016;
  border-radius: 6px;
  padding: 1.5rem;
}

.description-title {
  color: #2d5016;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description-title .bi {
  font-size: 1.2rem;
}

.description-text {
  color: #333;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.product-id {
  font-size: 0.95rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.price-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f5f5 100%);
  border-left: 4px solid #2d5016;
  border-radius: 6px;
}

.product-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d5016;
}

.price-unit {
  font-size: 0.9rem;
  font-weight: 500;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.detail-row:hover {
  background-color: #f0f5f0;
  border-left-color: #2d5016;
  padding-left: 1.5rem;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}

.action-buttons-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-success {
  background-color: #2d5016;
  border-color: #2d5016;
  font-weight: 600;
  padding: 0.6rem 2rem;
  transition: all 0.3s ease;
}

.btn-success:hover {
  background-color: #1e5a24;
  border-color: #1e5a24;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 80, 22, 0.3);
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  font-weight: 600;
  padding: 0.6rem 2rem;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  transform: translateY(-2px);
}

.btn-lg {
  font-size: 1rem;
  border-radius: 6px;
}

.info-item {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #2d5016;
  transition: all 0.3s ease;
}

.info-item:hover {
  background-color: #f0f5f0;
  transform: translateX(5px);
}

.info-label {
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-value {
  color: #333;
  font-weight: 500;
  font-size: 1rem;
  margin: 0;
}

.card-header {
  background-color: white !important;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h5 {
  color: #1a1a1a;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header .bi {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    display: none;
  }

  .content-wrapper {
    padding: 1rem !important;
  }

  .card {
    margin-bottom: 1rem;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .product-price {
    font-size: 2rem;
  }

  .action-buttons-section {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.8rem;
  }
}
</style>
