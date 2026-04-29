<template>
  <div class="provider-product">
    <div class="product-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Alert Message Bar -->
        <transition name="slide-down">
          <div 
            v-if="errorMessage" 
            :class="['alert-bar', isSuccessMessage ? 'alert-success' : 'alert-error']"
            role="alert">
            <div class="alert-content">
              <div class="alert-icon">
                <i :class="isSuccessMessage ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
              </div>
              <div class="alert-message">
                {{ errorMessage }}
              </div>
              <button type="button" class="alert-close" @click="errorMessage = null" aria-label="Close">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </transition>

        <!-- Loading Indicator -->
        <div v-if="loadingProducts" class="d-flex justify-content-center align-items-center" style="height: 400px;">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <template v-if="!loadingProducts">
          <!-- Header -->
          <PageHeader title="All Products" />

            <!-- Filter Bar -->
          <div class="filter-bar bg-white border-bottom p-4 ">
            <div class="row w-100 g-3 align-items-center">
              <div class="col-12 col-md-3">
                <input 
                  type="text" 
                  placeholder="Search by name, email or phone" 
                  v-model="searchQuery"
                  class="form-control form-control-sm"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0 text-nowrap">Sort By:</label>
                  <select v-model="sortBy" class="form-select form-select-sm">
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              <div class="col-12 col-md-3">
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0 text-nowrap">Categories:</label>
                  <select v-model="selectedCategory" class="form-select form-select-sm">
                    <option value="">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="herbs">Herbs</option>
                  </select>
                </div>
              </div>

              <div class="col-12 col-md-3 text-end">
                <button @click="openAddProductModal" class="btn btn-success btn-sm">
                  <i class="bi bi-plus-circle"></i> Add Product
                </button>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <ProductTable 
            :products="paginatedProducts"
            @view="viewProductDetail"
            @edit="openEditProductModal"
            @delete="deleteProduct"
          />

          <!-- Pagination -->
          <div class="pagination-wrapper bg-white border-top p-3 ">
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="prevPage" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left"></i> PREV
                  </button>
                </li>
                
                <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                
                <li v-if="hasEllipsisEnd" class="page-item disabled">
                  <span class="page-link">...</span>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">
                    NEXT <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            <div class="text-center mt-2">
              <small class="text-muted">
                Page {{ currentPage }} of {{ totalPages }} (Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }} items)
              </small>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Popup Card Component -->
    <PopupCard 
      :is-open="showModal"
      :is-edit-mode="isEditMode"
      :product="selectedProduct"
      @close="closeModal"
      @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import ProductTable from '../../components/provider_com/productTable.vue'
import PopupCard from '../../components/provider_com/popupCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const searchQuery = ref('')
const sortBy = ref('popular')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const isEditMode = ref(false)
const selectedProduct = ref(null)
const loadingProducts = ref(false)
const errorMessage = ref(null)

const isSuccessMessage = computed(() => {
  if (!errorMessage.value) return false
  return errorMessage.value.toLowerCase().includes('success') || 
         errorMessage.value.toLowerCase().includes('successfully')
})

const filteredProducts = computed(() => {
  let result = productStore.products

  // Filter by search query
  if (searchQuery.value) {
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.id.toString().includes(searchQuery.value)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  // Sort
  if (sortBy.value === 'price-low') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-high') {
    result.sort((a, b) => b.price - a.price)
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  const totalPagesNum = totalPages.value

  if (totalPagesNum <= maxVisiblePages) {
    for (let i = 1; i <= totalPagesNum; i++) {
      pages.push(i)
    }
  } else {
    const startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPagesNum, startPage + maxVisiblePages - 1)
    const adjustedStart = Math.max(1, endPage - maxVisiblePages + 1)

    for (let i = adjustedStart; i <= endPage; i++) {
      pages.push(i)
    }
  }

  return pages
})

const hasEllipsisEnd = computed(() => {
  return Math.max(...visiblePages.value) < totalPages.value
})

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for changes to product store error
watch(
  () => productStore.error,
  (newError) => {
    if (newError) {
      errorMessage.value = newError
      setTimeout(() => {
        errorMessage.value = null
      }, 3000)
    }
  }
)

// Check for query parameters on mount and load products from API
onMounted(async () => {
  if (route.query.sort === 'popular') {
    sortBy.value = 'popular'
  }
  
  // Fetch products from API
  loadingProducts.value = true
  try {
    await productStore.fetchAllProducts()
  } catch (error) {
    console.error('Failed to load products:', error)
    errorMessage.value = 'Failed to load products from server'
  } finally {
    loadingProducts.value = false
  }
})

const openAddProductModal = () => {
  isEditMode.value = false
  selectedProduct.value = null
  showModal.value = true
}

const viewProductDetail = (productId) => {
  router.push({
    name: 'productDetail',
    params: { id: productId }
  })
}

const openEditProductModal = (product) => {
  isEditMode.value = true
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  selectedProduct.value = null
}

const saveProduct = async (productData) => {
  try {
    if (isEditMode.value) {
      // Update existing product via API
      await productStore.updateProduct(productData.id, productData)
      errorMessage.value = 'Product updated successfully'
    } else {
      // Add new product via API
      await productStore.createProduct(productData)
      errorMessage.value = 'Product added successfully'
    }
    
    // Clear message after 2 seconds
    setTimeout(() => {
      errorMessage.value = null
    }, 2000)
    
    closeModal()
  } catch (error) {
    console.error('Error saving product:', error)
    // Display backend error message or generic error
    errorMessage.value = error.response?.data?.message || 
                        error.message || 
                        'Failed to save product'
  }
}

const deleteProduct = async (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await productStore.deleteProduct(productId)
      errorMessage.value = 'Product deleted successfully'
      
      // Clear message after 2 seconds
      setTimeout(() => {
        errorMessage.value = null
      }, 2000)
      
      // Adjust current page if necessary
      if (currentPage.value > totalPages.value) {
        currentPage.value = Math.max(1, totalPages.value)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      errorMessage.value = 'Failed to delete product'
    }
  }
}
</script>

<style scoped>
.provider-product {
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

.product-container {
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
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: white;
}

.filter-bar {
  flex-shrink: 0;
}

.form-select, .form-control {
  border-color: #dee2e6;
}

.form-select:focus, .form-control:focus {
  border-color: #2d5016;
  box-shadow: 0 0 0 0.2rem rgba(45, 80, 22, 0.25);
}

:deep(.product-table-wrapper) {
  flex: 1;
}

.pagination-wrapper {
  flex-shrink: 0;
}

.pagination {
  gap: 0.25rem;
}

.pagination .page-link {
  color: #2d5016;
  border-color: #dee2e6;
  padding: 0.375rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination .page-link:hover:not(.disabled) {
  background-color: #e8f5e9;
  border-color: #2d5016;
}

.pagination .page-item.active .page-link {
  background-color: #2d5016;
  border-color: #2d5016;
  color: white;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }

  .filter-bar .row {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    max-height: 200px;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
  }

  .filter-bar .row {
    flex-direction: column;
  }

  .filter-bar .col-md-4 {
    flex: 0 0 100%;
  }

  .form-control-sm, .form-select-sm {
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .sidebar-wrapper {
    max-height: 150px;
  }

  .product-header {
    padding: 0.75rem 1rem;
  }

  .product-header h5 {
    font-size: 1rem;
  }

  .filter-bar {
    padding: 1rem;
  }
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }

  .filter-bar .row {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    max-height: 200px;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
  }

  .filter-bar .row {
    flex-direction: column;
  }

  .filter-bar .col-md-3 {
    flex: 0 0 100%;
  }

  .form-control-sm, .form-select-sm {
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .sidebar-wrapper {
    max-height: 150px;
  }

  .filter-bar {
    padding: 1rem;
  }
}

/* Beautiful Alert Bar Styles */
.alert-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  z-index: 1030;
  padding: 1rem 2rem;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 12px;
  margin: 0;
  max-width: 600px;
  width: calc(100% - 40px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-bar.alert-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-bottom: 3px solid #047857;
}

.alert-bar.alert-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-bottom: 3px solid #991b1b;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.alert-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  animation: bounce 0.5s ease-out;
}

.alert-message {
  flex: 1;
  letter-spacing: 0.3px;
}

.alert-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.alert-close:hover {
  transform: scale(1.2);
}

.alert-close:active {
  transform: scale(0.95);
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-120px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-120px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-leave-active {
  transition: all 0.3s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-120px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-120px);
}
</style>
