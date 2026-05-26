<template>
  <section class="top-selling-section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Trending now</p>
        <h2>Top Selling Products</h2>
        <p class="subtext">Products ranked by the total kg ordered in the selected period.</p>
      </div>

      <div class="period-switch" role="tablist" aria-label="Top selling period">
        <button
          type="button"
          :class="['period-btn', { active: period === 'week' }]"
          @click="period = 'week'"
        >
          Week
        </button>
        <button
          type="button"
          :class="['period-btn', { active: period === 'month' }]"
          @click="period = 'month'"
        >
          Month
        </button>
      </div>
    </div>

    <div v-if="loading" class="state-card">Loading top sellers...</div>
    <div v-else-if="!products.length" class="state-card">
      No orders found for this period yet.
    </div>

    <div v-else class="product-grid">
      <article v-for="product in products.slice(0, 4)" :key="product.id" class="product-card">
        <div class="rank-badge">#{{ product.rank }}</div>
        <div class="image-wrap">
          <img :src="resolveImage(product.imageUrl)" :alt="product.name" />
        </div>

        <div class="card-body">
          <div class="product-name">{{ product.name }}</div>
          <div class="meta-row">
            <span>{{ product.totalQuantity.toFixed(2) }} kg sold</span>
            <span>{{ product.orderCount }} orders</span>
          </div>

          <div class="price-row">
            <span class="price">${{ Number(product.price || 0).toFixed(2) }}</span>
            <span class="period-tag">{{ periodLabel }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const period = ref('week')
const loading = ref(false)
const products = ref([])

const periodLabel = computed(() => (period.value === 'month' ? 'This Month' : 'This Week'))

const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 rx=%2224%22 fill=%22%23eef3ee%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%236b7280%22%3ENo Image%3C/text%3E%3C/svg%3E'

function resolveImage(imageUrl) {
  if (!imageUrl) return placeholderImage
  if (imageUrl.startsWith('http')) return imageUrl
  return `${API_BASE_URL}/images/${imageUrl.replace('/images/', '')}`
}

async function loadTopSellers() {
  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const customerId = Number(user?.id ?? user?.user_id ?? 0)

    const params = { period: period.value }
    if (customerId) params.customerId = customerId

    const response = await api.get('/orders/top-products', { params })
    products.value = response.data?.products || []
  } catch (error) {
    console.error('Failed to load top sellers:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

watch(period, loadTopSellers)
onMounted(loadTopSellers)
</script>

<style scoped>
.top-selling-section {
  background: linear-gradient(180deg, #f3faf4 0%, #ffffff 100%);
  border: 1px solid #dbe9dd;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 40px rgba(31, 85, 47, 0.08);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2f7a43;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.section-head h2 {
  margin: 0;
  color: #163420;
  font-size: 1.8rem;
  font-weight: 800;
}

.subtext {
  margin: 6px 0 0;
  color: #5f6e63;
  max-width: 620px;
}

.period-switch {
  display: inline-flex;
  background: #e8f2ea;
  padding: 4px;
  border-radius: 999px;
  gap: 4px;
}

.period-btn {
  border: none;
  background: transparent;
  color: #355341;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.period-btn.active {
  background: #1f5c34;
  color: #fff;
  box-shadow: 0 8px 18px rgba(31, 92, 52, 0.22);
}

.state-card {
  background: #fff;
  border: 1px dashed #bfd3c2;
  border-radius: 18px;
  padding: 22px;
  color: #5b6c60;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  position: relative;
  background: #fff;
  border: 1px solid #e3ece4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(19, 50, 30, 0.06);
}

.rank-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  background: rgba(21, 83, 42, 0.92);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
}

.image-wrap {
  height: 180px;
  background: linear-gradient(160deg, #f1f7f1 0%, #e5f0e7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrap img {
  width: 72%;
  height: 72%;
  object-fit: contain;
}

.card-body {
  padding: 18px;
}

.product-name {
  font-size: 1.02rem;
  font-weight: 800;
  color: #16261d;
  min-height: 48px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #6f7c72;
  font-size: 0.9rem;
  margin-top: 10px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.price {
  color: #1f5c34;
  font-size: 1.15rem;
  font-weight: 900;
}

.period-tag {
  background: #eff8f1;
  color: #2d6a44;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
}

@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .top-selling-section {
    padding: 20px;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>