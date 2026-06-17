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
/* ============================================================
   BASE — Mobile-first (320px+)
   ============================================================ */
.top-selling-section {
  background: linear-gradient(180deg, #f3faf4 0%, #ffffff 100%);
  border: 1px solid #dbe9dd;
  border-radius: 20px;
  padding: 20px 16px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #2f7a43;
  margin: 0;
}

.section-head h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1a2e1f;
  margin: 4px 0;
}

.subtext {
  font-size: 0.85rem;
  color: #5f6e63;
  margin: 0;
}

.period-switch {
  display: flex;
  gap: 4px;
  background: #e8f2ea;
  padding: 4px;
  border-radius: 999px;
  align-self: flex-start;
}

.period-btn {
  border: none;
  background: transparent;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  color: #4d6955;
  transition: all 0.2s;
}

.period-btn.active {
  background: #1f5c34;
  color: #fff;
}

/* ---- States ---- */
.state-card {
  padding: 32px 20px;
  text-align: center;
  border: 1px dashed #cfe3d3;
  border-radius: 14px;
  color: #5f6e63;
  font-size: 0.9rem;
}

.state-card.error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fef2f2;
}

/* ---- Grid ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.product-card {
  position: relative;
  background: #fff;
  border: 1px solid #e3ece4;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #165f37;
  color: #fff;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  z-index: 1;
}

.image-wrap {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f7f1;
}

.image-wrap img {
  width: 65%;
  height: 65%;
  object-fit: contain;
}

.card-body {
  padding: 12px;
}

.product-name {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #6f7c72;
  font-size: 0.75rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.price {
  color: #1f5c34;
  font-weight: 900;
  font-size: 1rem;
}

.period-tag {
  background: #eff8f1;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  color: #4d6955;
}

/* ============================================================
   TABLET — 600px+
   ============================================================ */
@media (min-width: 600px) {
  .top-selling-section {
    padding: 24px 22px;
    border-radius: 22px;
  }

  .section-head {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
  }

  .section-head h2 {
    font-size: 1.5rem;
  }

  .period-switch {
    align-self: auto;
  }

  .period-btn {
    padding: 8px 15px;
    font-size: 0.85rem;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .image-wrap {
    height: 150px;
  }

  .product-name {
    font-size: 0.9rem;
  }
}

/* ============================================================
   DESKTOP — 1024px+
   ============================================================ */
@media (min-width: 1024px) {
  .top-selling-section {
    padding: 28px;
    border-radius: 24px;
  }

  .section-head {
    margin-bottom: 22px;
  }

  .section-head h2 {
    font-size: 1.6rem;
  }

  .subtext {
    font-size: 0.9rem;
  }

  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .image-wrap {
    height: 180px;
  }

  .image-wrap img {
    width: 70%;
    height: 70%;
  }

  .card-body {
    padding: 16px;
  }

  .product-name {
    font-size: 0.95rem;
  }

  .meta-row {
    font-size: 0.8rem;
  }

  .price {
    font-size: 1.1rem;
  }

  .period-tag {
    font-size: 0.75rem;
    padding: 4px 10px;
  }

  .rank-badge {
    top: 10px;
    left: 10px;
    padding: 4px 10px;
    font-size: 11px;
  }
}

/* ============================================================
   LARGE — 1400px+
   ============================================================ */
@media (min-width: 1400px) {
  .product-grid {
    gap: 22px;
  }

  .image-wrap {
    height: 200px;
  }
}
</style>