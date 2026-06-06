<template>
  <div class="product-detail-viewport">
    <div class="detail-layout-container">
      
      <aside class="sidebar-wrapper">
        <SideBar />
      </aside>

      <main class="main-viewport-content">
        <div class="header-container-wrapper">
          <PageHeader title="Product Details" />
        </div>

        <div class="scrolling-content-pane">
          
          <div class="navigation-action-row">
            <button @click="goBack" class="back-link-btn">
              <i class="bi bi-arrow-left-short fs-4"></i> Back to Products
            </button>
          </div>

          <div class="row g-4 m-0">
            
            <div class="col-xl-5 col-lg-6">
              <div class="cute-media-card">
                <div class="media-display-frame">
                  <img 
                    :src="product.image" 
                    @error="handleImageError"
                    class="hero-fluid-img"
                    :alt="product.name"
                  />
                </div>
              </div>
            </div>

            <div class="col-xl-7 col-lg-6">
              <div class="info-details-card">
                
                <div class="identity-header-block">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <span class="badge-category-tag text-uppercase">
                      {{ product.category || 'General Catalog' }}
                    </span>
                    <span class="text-serial-id">ID: {{ product.id }}</span>
                  </div>
                  <h1 class="main-product-title">{{ product.name || 'Unnamed Product' }}</h1>
                </div>

                <div class="pricing-matrix-module">
                  <div class="d-flex align-items-baseline gap-3">
                    <div class="d-flex flex-column">
                      <span class="pricing-label">Final Value</span>
                      <span class="final-calculated-price">${{ calculateFinalDisplayPrice() }}</span>
                    </div>
                    <div v-if="Number(product.discount) > 0" class="d-flex flex-column border-start ps-3 border-light-subtle">
                      <span class="pricing-label line-through-label">Original Price</span>
                      <span class="strike-original-price">${{ Number(product.price).toFixed(2) }}</span>
                    </div>
                    <span v-if="Number(product.discount) > 0" class="badge-discount-tag">
                      -{{ product.discount }}% Off
                    </span>
                  </div>
                </div>

                <div class="specs-grid-layout mb-4">
                  <div class="spec-metric-item">
                    <div class="label-wrapper"><i class="bi bi-box-seam text-mint me-2"></i> Stock Available</div>
                    <div class="value-wrapper fw-bold">{{ product.stock || 0 }} Units</div>
                  </div>
                  
                  <div class="spec-metric-item">
                    <div class="label-wrapper"><i class="bi bi-clock text-mint me-2"></i> Date Added</div>
                    <div class="value-wrapper font-monospace text-secondary">
                      {{ formatMysqlDate(product.addedDate) }}
                    </div>
                  </div>
                  
                  <div class="spec-metric-item">
                    <div class="label-wrapper"><i class="bi bi-shield-check text-mint me-2"></i> Lifecycle Status</div>
                    <div class="value-wrapper">
                      <span :class="['lifecycle-indicator-pill', product.stock > 0 ? 'is-active-status' : 'is-inactive-status']">
                        {{ product.stock > 0 ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="description-content-well mb-4" v-if="product.description">
                  <h5 class="well-title"><i class="bi bi-file-text text-mint me-2"></i> Description</h5>
                  <p class="well-paragraph">{{ product.description }}</p>
                </div>

                <div class="action-footer-buttons">
                  <button @click="editProduct" class="btn btn-action-prime">
                    <i class="bi bi-pencil-square me-2"></i> Edit Details
                  </button>
                  <button @click="deleteProduct" class="btn btn-action-danger">
                    <i class="bi bi-trash3 me-2"></i> Delete Product
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>

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
  description: '',
  discount: 0
})

onMounted(async () => {
  const productId = route.params.id || route.query.id
  if (productId) {
    if (!productStore.products || productStore.products.length === 0) {
      await productStore.fetchAllProducts()
    }
    loadProduct(productId)
  } else {
    router.push('/provider/products')
  }
})

const loadProduct = (productId) => {
  try {
    if (!productId) {
      router.push('/provider/products')
      return
    }
    const foundProduct = productStore.products.find(p => String(p.id) === String(productId))
    if (foundProduct) {
      product.value = {
        id: foundProduct.id ?? '',
        name: foundProduct.name ?? '',
        price: foundProduct.price ?? 0,
        stock: foundProduct.stock ?? 0,
        category: foundProduct.category ?? '',
        image: foundProduct.image ?? '',
        addedDate: foundProduct.addedDate ?? '', 
        description: foundProduct.description ?? '',
        discount: foundProduct.discount ?? 0
      }
    } else {
      router.push('/provider/products')
    }
  } catch (error) {
    router.push('/provider/products')
  }
}

const formatMysqlDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const standardDateTime = dateStr.replace(' ', 'T')
    const parsedDate = new Date(standardDateTime)
    
    if (isNaN(parsedDate.getTime())) return dateStr

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (e) {
    return dateStr
  }
}

const calculateFinalDisplayPrice = () => {
  const base = Number(product.value.price) || 0
  const disc = Number(product.value.discount) || 0
  return (base * (1 - (disc / 100))).toFixed(2)
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 300%22%3E%3Crect width=%22300%22 height=%22300%22 fill=%22%23f1f5f9%22/%3E%3C/svg%3E'
}

const goBack = () => { router.push('/provider/products') }

const editProduct = () => {
  const productId = route.params.id || route.query.id
  loadProduct(productId)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    const productId = route.params.id || route.query.id
    loadProduct(productId)
  }, 300)
}

const saveProduct = async (productData) => {
  try {
    await productStore.updateProduct(productData.id, productData)
    loadProduct(productData.id)
    showModal.value = false
  } catch (error) {
    console.error(error)
  }
}

const deleteProduct = async () => {
  if (confirm('Are you absolutely certain you wish to delete this profile? This cannot be undone.')) {
    try {
      await productStore.deleteProduct(product.value.id)
      router.push('/provider/products')
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style scoped>
.product-detail-viewport {
  background-color: #fafbfd;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.detail-layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.sidebar-wrapper {
  width: 260px;
  background-color: #ffffff;
  flex-shrink: 0;
  padding: 0;
  height: 100%;
  margin: 0;
}

.main-viewport-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header-container-wrapper {
  flex-shrink: 0;
}

.scrolling-content-pane {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* padding: 24px 32px; */
}

/* Custom Styled Scrollbar Elements */
.scrolling-content-pane::-webkit-scrollbar {
  width: 6px;
}
.scrolling-content-pane::-webkit-scrollbar-track {
  background: transparent;
}
.scrolling-content-pane::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* Navigation Line */
.navigation-action-row {
  margin-bottom: 24px;
}

.back-link-btn {
  background: transparent;
  border: none;
  color: #718096;
  font-weight: 600;
  font-size: 14px;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.back-link-btn:hover {
  color: #10b981;
  transform: translateX(-2px);
}

/* Image Wrapper Grid Styling */
.cute-media-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
}

.media-display-frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-fluid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.media-display-frame:hover .hero-fluid-img {
  transform: scale(1.04);
}

/* Specification Board Layout Cards */
.info-details-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 36px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
}

.badge-category-tag {
  background: #ecfdf5;
  color: #10b981;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.75px;
  padding: 6px 14px;
  border-radius: 100px;
}

.text-serial-id {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 600;
  background: #f7fafc;
  padding: 4px 10px;
  border-radius: 6px;
}

.main-product-title {
  font-size: 32px;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -0.5px;
}

/* Pricing Matrix Cluster Module */
.pricing-matrix-module {
  background: #f8fafc;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid #edf2f7;
  margin: 24px 0;
  position: relative;
}

.pricing-label {
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  text-uppercase: uppercase;
  letter-spacing: 0.5px;
}

.final-calculated-price {
  font-size: 38px;
  font-weight: 850;
  color: #10b981;
  line-height: 1.1;
  margin-top: 2px;
}

.line-through-label { color: #a0aec0; }
.strike-original-price {
  font-size: 20px;
  font-weight: 600;
  color: #a0aec0;
  text-decoration: line-through;
  margin-top: 4px;
}

.badge-discount-tag {
  background: #fef2f2;
  color: #ef4444;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  align-self: center;
}

/* Functional Information Properties Rows Matrix */
.specs-grid-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  font-size: 14px;
  transition: border 0.2s ease;
}
.spec-metric-item:hover {
  border-color: #e2e8f0;
}

.label-wrapper {
  color: #4a5568;
  font-weight: 500;
}

.value-wrapper {
  color: #2d3748;
  font-weight: 600;
}

.text-mint {
  color: #10b981;
}

.lifecycle-indicator-pill {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}
.is-active-status { background: #dcfce7; color: #15803d; }
.is-inactive-status { background: #fee2e2; color: #b91c1c; }

/* Description Well Content Component Container */
.description-content-well {
  background: #fafbfd;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 20px;
}
.well-title {
  font-size: 14px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}
.well-paragraph {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

/* Operational Action Buttons */
.action-footer-buttons {
  display: flex;
  gap: 14px;
  margin-top: 32px;
}

.btn-action-prime {
  background: #1a202c;
  color: #ffffff;
  font-weight: 600;
  border-radius: 14px;
  padding: 14px 32px;
  border: none;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(26, 32, 44, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-action-prime:hover {
  background: #2d3748;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 32, 44, 0.15);
}

.btn-action-danger {
  background: transparent;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  font-weight: 600;
  border-radius: 14px;
  padding: 14px 28px;
  font-size: 15px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-action-danger:hover {
  background: #fff5f5;
  border-color: #feb2b2;
  transform: translateY(-2px);
}
</style>