<template>
  <div class="dashboard-layout">
    <DashboardSidebar activeMenu="review" @navigate="handleNavigate" />

    <main class="main-content">
      <header class="page-header">
        <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
          <i class="bi bi-list"></i>
        </button>
        <div>
          <h1>Review Order</h1>
          <p>Share your experience to help others</p>
        </div>
      </header>

      <div v-if="pageLoading" class="state-card">
        <div class="spinner"></div>
        <p>Loading order...</p>
      </div>

      <template v-else>
        <div class="bar">
          <span class="bar-code">Order #{{ order?.order_code || route.params.orderId }}</span>
          <span class="bar-dot"></span>
          <span class="bar-count">{{ products.length }} item{{ products.length !== 1 ? 's' : '' }}</span>
          <span class="bar-dot"></span>
          <span class="bar-tag">Delivered</span>
        </div>

        <div class="grid-2x2">
          <div class="card">
            <h3>Delivery Review</h3>
            <div class="stars" style="margin-bottom: 10px">
              <span v-for="i in 5" :key="'dr'+i" class="star" :class="{ on: i <= deliveryRating }" @click="deliveryRating = i">★</span>
              <span class="star-lbl">{{ ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][deliveryRating] }}</span>
            </div>
            <textarea v-model="deliveryFeedback" rows="3" placeholder="Tell us about your delivery experience (optional)"></textarea>
          </div>

          <div class="card">
            <h3>Product Review</h3>
            <div class="chips">
              <button v-for="(p, idx) in products" :key="idx" :class="['chip', { active: activeProduct === idx }]" @click="activeProduct = idx">
                <img v-if="itemImage(p.image)" :src="itemImage(p.image)" :alt="p.name" class="chip-img" />
                <span v-else class="chip-fallback">{{ p.name.charAt(0) }}</span>
                <span>{{ p.name }}</span>
              </button>
            </div>
            <div class="stars" style="margin: 10px 0">
              <span v-for="i in 5" :key="'pr'+i" class="star" :class="{ on: i <= productRating }" @click="productRating = i">★</span>
            </div>
            <textarea v-model="productFeedback" rows="3" placeholder="Tell others about this product (optional)"></textarea>
          </div>
        </div>

        <div class="bottom">
          <button class="btn" :disabled="loading" @click="submitReview">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else class="btn-star">★</span>
            {{ loading ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </template>
    </main>

    <!-- Result Popup -->
    <div v-if="showResult" class="overlay" @click.self="closeResult">
      <div class="result-modal">
        <div v-if="submitted" class="result-body success">
          <div class="result-icon success">&#10003;</div>
          <h2>Thank You!</h2>
          <p>Your review has been submitted successfully.</p>
          <router-link to="/myorder" class="btn-link">Back to My Orders</router-link>
        </div>
        <div v-else class="result-body failure">
          <div class="result-icon fail">&#10007;</div>
          <h2>Submission Failed</h2>
          <p>{{ errorMsg }}</p>
          <button class="btn-link outline" @click="closeResult">Try Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import DashboardSidebar from '../../components/Customer/sidebarUser.vue'
import { useReviewStore } from '@/stores/reviewStore'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()
const userStore = useUserStore()

const isSidebarOpen = ref(false)
const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const handleNavigate = (section) => {
  if (section === 'orders') router.push('/myorder')
  else if (section === 'track') router.push('/order-tracker')
}
provide('isSidebarOpen', isSidebarOpen)
provide('closeSidebar', closeSidebar)

const deliveryRating = ref(4)
const productRating = ref(4)
const activeProduct = ref(0)
const productFeedback = ref('')
const deliveryFeedback = ref('')
const submitted = ref(false)
const loading = ref(false)
const pageLoading = ref(true)
const showResult = ref(false)
const errorMsg = ref('')
const order = ref(null)
const providerId = ref(null)
const products = ref([])

function closeResult() {
  showResult.value = false
  if (!submitted.value) errorMsg.value = ''
}

function itemImage(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let clean = url.replace(/^\/+/, '')
  if (clean.startsWith('images/')) clean = clean.replace('images/', 'uploads/')
  return `${API_BASE_URL}/${clean}`
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login')
    return
  }
  await loadOrder()
})

async function loadOrder() {
  const orderId = route.params.orderId
  if (!orderId) {
    pageLoading.value = false
    return
  }
  try {
    const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
    order.value = res.data
    providerId.value = res.data.provider_id || null
    const items = Array.isArray(res.data.order_items) ? res.data.order_items : []
    products.value = items.map(item => ({
      id: item.product?.id,
      name: item.product?.name || item.name || 'Product',
      image: item.product?.imageUrl || item.product?.image || item.image || '',
    }))
    if (!products.value.length) products.value = [{ name: 'Order Items' }]
  } catch (err) {
    console.error('Failed to load order:', err)
    products.value = [{ name: 'Product' }]
  } finally {
    pageLoading.value = false
  }
}

const submitReview = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login')
    return
  }
  loading.value = true
  try {
    const activeProductId = products.value[activeProduct.value]?.id || null
    await reviewStore.createReview({
      rating: productRating.value,
      feedback: productFeedback.value || 'No written feedback.',
      orderId: route.params.orderId || null,
      deliverySpeed: deliveryRating.value,
      vegFreshness: deliveryRating.value,
      productId: activeProductId,
      providerId: providerId.value,
      deliveryRating: deliveryRating.value,
      deliveryFeedback: deliveryFeedback.value || null,
    })
    submitted.value = true
    showResult.value = true
  } catch (err) {
    submitted.value = false
    errorMsg.value = err.response?.data?.message || err.message || 'Something went wrong. Please try again.'
    showResult.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
  background: #f4f7f5;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 48px 56px;
  width: 100%;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #555;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a2e1f;
}

.page-header p {
  margin: 6px 0 0;
  color: #6b7c72;
  font-size: 1rem;
}

.state-card {
  text-align: center;
  padding: 80px 32px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  color: #6b7c72;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8ede9;
  border-top-color: #2d7a3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.success-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.btn-link { background: #2d7a3a; color: #fff; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block; border: none; cursor: pointer; }
.btn-link.outline { background: #fff; color: #2d7a3a; border: 2px solid #2d7a3a; }
.btn-link:hover { background: #1a5c2a; }
.btn-link.outline:hover { background: #f4f7f5; }

.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e0e8e3;
  border-radius: 14px;
  padding: 16px 24px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5c50;
}

.bar-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c5d4ca;
}

.bar-tag {
  background: #e8f5ec;
  color: #2d7a3a;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-left: auto;
}

.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: #fff;
  border: none;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.card h3 {
  margin: 0 0 18px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2e1f;
}

.stars {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars.sm .star { font-size: 24px; }

.star {
  font-size: 32px;
  color: #dde5df;
  cursor: pointer;
  user-select: none;
  line-height: 1;
  transition: color 0.1s;
}

.star:hover { color: #e8c44a; }
.star.on { color: #f59e0b; }

.star-lbl {
  margin-left: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5c50;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 24px;
  border: 2px solid #dde5df;
  background: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7c72;
  cursor: pointer;
  transition: all 0.12s;
}

.chip:hover {
  border-color: #b8dfc4;
  background: #f8fbf9;
}

.chip.active {
  background: #2d7a3a;
  border-color: #2d7a3a;
  color: #fff;
}

.chip.active .chip-fallback {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.chip-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.chip-fallback {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8ede9;
  color: #6b7c72;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #dde5df;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1a2e1f;
  background: #fafbfa;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color 0.15s, background 0.15s;
}

textarea:focus {
  outline: none;
  border-color: #2d7a3a;
  background: #fff;
}

textarea::placeholder { color: #a0b0a6; }

.bottom {
  text-align: center;
  padding: 24px 0 32px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #2d7a3a;
  color: #fff;
  border: none;
  padding: 16px 56px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn:hover:not(:disabled) { background: #1a5c2a; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-star { font-size: 1.2rem; }

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: bspin 0.7s linear infinite;
}

@keyframes bspin { to { transform: rotate(360deg); } }

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-modal {
  background: #fff;
  border-radius: 20px;
  padding: 40px 48px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.result-body h2 { margin: 0 0 8px; font-size: 1.4rem; color: #1a2e1f; }
.result-body p { margin: 0 0 24px; color: #6b7c72; font-size: 0.95rem; }

.result-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 16px;
}

.result-icon.success { background: #e8f5ec; color: #2d7a3a; }
.result-icon.fail { background: #fde8e8; color: #b91c1c; }

@media (max-width: 768px) {
  .dashboard-layout { flex-direction: column; height: auto; min-height: 100vh; }
  .main-content { padding: 24px 20px 48px; }
  .menu-toggle { display: block; }
  .grid-2x2 { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .page-header h1 { font-size: 1.4rem; }
  .card { padding: 20px; }
}
</style>
