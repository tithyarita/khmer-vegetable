<template>
  <section class="top-selling-section">
    <div class="section-head">
      <div>
        <p class="eyebrow">{{ t('trendingNow') }}</p>
        <h2>{{ t('topSellingProducts') }}</h2>
        <p class="subtext">
          {{ t('topSellingDescription') }}
        </p>
      </div>

      <div class="period-switch">
        <button
          class="period-btn"
          :class="{ active: period === 'week' }"
          @click="changePeriod('week')"
        >
          {{ t('week') }}
        </button>

        <button
          class="period-btn"
          :class="{ active: period === 'month' }"
          @click="changePeriod('month')"
        >
          {{ t('month') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      {{ t('loadingTopSellers') }}
    </div>

    <div v-else-if="error" class="state-card error">
      {{ error }}
    </div>

    <div v-else-if="products.length === 0" class="state-card">
      {{ t('noOrdersFound') }}
    </div>

    <div v-else class="product-grid">
      <router-link
        v-for="p in products"
        :key="p.id"
        :to="`/product/${p.id}`"
        class="product-card"
      >
        <div class="rank-badge">#{{ p.rank || 0 }}</div>

        <div class="image-wrap">
          <img :src="getImage(p.imageUrl)" :alt="p.name" />
        </div>

        <div class="card-body">
          <div class="product-name">{{ p.name }}</div>

          <div class="meta-row">
            <span>{{ formatNumber(p.totalQuantity) }} kg</span>
            <span>{{ p.orderCount || 0 }} {{ t('orders') }}</span>
          </div>

          <div class="price-row">
            <span class="price">${{ formatNumber(p.price) }}</span>
            <span class="period-tag">{{ label }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

/* =========================
   CONFIG
========================= */
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API,
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* =========================
   STATE
========================= */
const period = ref('week')
const loading = ref(false)
const error = ref('')
const products = ref([])

/* =========================
   COMPUTED
========================= */
const label = computed(() =>
  period.value === 'month' ? t('thisMonth') : t('thisWeek')
)

/* =========================
   HELPERS
========================= */
const placeholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23eee"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'

function getImage(url) {
  if (!url) return placeholder

  // If it's a full URL (e.g. http://localhost:3000/uploads/...)
  // extract the relative path and rebuild with the correct API base URL
  if (url.startsWith('http')) {
    const uploadsMatch = url.match(/\/+(uploads\/.+)$/i)
    if (uploadsMatch) {
      return `${API}/${uploadsMatch[1]}`
    }
    // Not an uploads URL (e.g. Cloudinary URL) — keep as-is
    return url
  }

  return `${API}${url.startsWith('/') ? url : '/images/' + url}`
}

function formatNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

/* =========================
   SAFE PERIOD CHANGE
========================= */
function changePeriod(p) {
  if (!['week', 'month'].includes(p)) return
  period.value = p
  fetchTopSellers()
}

/* =========================
   API CALL (ROBUST)
========================= */
let requestId = 0

async function fetchTopSellers() {
  const currentRequest = ++requestId

  loading.value = true
  error.value = ''
  products.value = []

  try {
    const res = await api.get('/orders/top-products', {
      params: { period: period.value }
    })

    // ignore stale responses
    if (currentRequest !== requestId) return

    const data = res.data

    if (Array.isArray(data)) {
      products.value = data
    } else if (Array.isArray(data?.products)) {
      products.value = data.products
    } else {
      products.value = []
    }

  } catch (err) {
    console.error(err)

    if (err.response?.status === 400) {
      error.value = t('serverRejectedPeriod')
    } else if (err.response?.status >= 500) {
      error.value = t('serverErrorTryAgain')
    } else {
      error.value = t('networkError')
    }
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

/* =========================
   INIT
========================= */
onMounted(fetchTopSellers)
</script>
<style scoped>
.top-selling-section {
  background: linear-gradient(180deg, #f3faf4 0%, #ffffff 100%);
  border: 1px solid #dbe9dd;
  border-radius: 24px;
  padding: 28px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.eyebrow {
  font-weight: 800;
  color: #2f7a43;
}

.subtext {
  color: #5f6e63;
}

.period-switch {
  display: flex;
  gap: 6px;
  background: #e8f2ea;
  padding: 4px;
  border-radius: 999px;
}

.period-btn {
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.period-btn.active {
  background: #1f5c34;
  color: white;
}

.state-card {
  padding: 20px;
  text-align: center;
  border: 1px dashed #cfe3d3;
  border-radius: 16px;
}

.state-card.error {
  color: #b91c1c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.product-card {
  position: relative;
  background: white;
  border: 1px solid #e3ece4;
  border-radius: 18px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}

.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #165f37;
  color: white;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.image-wrap {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f7f1;
}

.image-wrap img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.card-body {
  padding: 16px;
}

.product-name {
  font-weight: 800;
}

.meta-row,
.price-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #6f7c72;
}

.price {
  color: #1f5c34;
  font-weight: 900;
}

.period-tag {
  background: #eff8f1;
  padding: 4px 10px;
  border-radius: 999px;
}
</style>