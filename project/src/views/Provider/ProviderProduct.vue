<template>
  <div class="provider-product">
    <div class="product-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
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
import SideBar from '@/components/provider_com/sideBar.vue'
import PageHeader from '@/components/provider_com/pageHeader.vue'
import ProductTable from '@/components/provider_com/productTable.vue'
import PopupCard from '@/components/provider_com/popupCard.vue'
import carrotImg from '@/assets/img-provider/carrot.jpg'
import tomatoesImg from '@/assets/img-provider/tomatoes.jpg'
import cabbageImg from '@/assets/img-provider/cabbage.jpg'
import onionImg from '@/assets/img-provider/onion.jpg'

const route = useRoute()
const router = useRouter()
const STORAGE_KEY = 'khmer_products'

const searchQuery = ref('')
const sortBy = ref('popular')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const isEditMode = ref(false)
const selectedProduct = ref(null)

// Initialize products - try to load from localStorage first
const getDefaultProducts = () => [
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  },
  {
    id: '0932489309Z',
    name: 'Carrot',
    price: 80,
    addedDate: '03 Feb 2020',
    stock: '100kg',
    category: 'vegetables',
    image: carrotImg,
    discount: 0
  }
]

const loadProductsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return getDefaultProducts()
}

const products = ref(loadProductsFromStorage())

const totalProducts = ref(87)

const filteredProducts = computed(() => {
  let result = products.value

  // Filter by search query
  if (searchQuery.value) {
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.id.includes(searchQuery.value)
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

// Watch for changes to products and save to localStorage
watch(
  () => products.value,
  (newProducts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },
  { deep: true }
)

// Check for query parameters on mount
onMounted(() => {
  if (route.query.sort === 'popular') {
    sortBy.value = 'popular'
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

const saveProduct = (productData) => {
  if (isEditMode.value) {
    // Update existing product
    const index = products.value.findIndex(p => p.id === productData.id)
    if (index !== -1) {
      products.value[index] = { ...productData }
    }
  } else {
    // Add new product
    products.value.push({ ...productData })
    totalProducts.value++
  }
  closeModal()
}

const deleteProduct = (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    products.value = products.value.filter(p => p.id !== productId)
    totalProducts.value--
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value)
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
</style>
