<template>
  <div class="profile-page">
    <NavigationBar />

    <div class="container" v-if="provider">
      <button class="back-btn" @click="$router.back()">← Back</button>

      <div class="farmer-header">
        <img :src="provider.image" :alt="provider.name" class="farmer-avatar" />
        <div>
          <h1>{{ provider.name }}</h1>
          <p class="farm-name">{{ provider.farm }}</p>
          <p class="location">{{ provider.location }}</p>
          <div class="badges">
            <span class="badge">{{ provider.productCount }} products</span>
            <span class="badge">{{ provider.topProductCount }} top-selling items</span>
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ provider.productCount }}</span>
          <span class="stat-label">All Products</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ provider.topProductCount }}</span>
          <span class="stat-label">Top Products</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ provider.monthOrders }}</span>
          <span class="stat-label">This Month Orders</span>
        </div>
      </div>

      <blockquote class="quote">"{{ provider.quote }}"</blockquote>

      <h2>Top Selling Products by {{ provider.name }}</h2>
      <Card v-if="provider.popularProducts.length" :products="provider.popularProducts" />
      <p v-else class="empty-note">No popular products found for this provider yet.</p>

      <h2 style="margin-top:32px">Promotion Products by {{ provider.name }}</h2>
      <Card v-if="provider.promotionProducts.length" :products="provider.promotionProducts" />
      <p v-else class="empty-note">No discount products available right now.</p>

      <h2 style="margin-top:32px">All Products by {{ provider.name }}</h2>
      <Card v-if="provider.products.length" :products="provider.products" />
      <p v-else class="empty-note">No products found for this provider.</p>
    </div>

    <div v-else class="container empty-state">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <p v-if="loading">Loading provider...</p>
      <p v-else>Provider not found.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import NavigationBar from '@/components/Customer/NavigationBar.vue'
import Card from '@/components/Customer/Card.vue'
import { useProductStore } from '@/stores/productStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const route = useRoute()
const productStore = useProductStore()

const provider = ref(null)
const loading = ref(false)

const api = axios.create({ baseURL: API_BASE_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 rx=%2224%22 fill=%22%23eef3ee%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%236b7280%22%3ENo Image%3C/text%3E%3C/svg%3E'

const getOriginalPrice = (product) => {
  const price = Number(product?.price ?? 0)
  const discount = Number(product?.discount ?? 0)

  if (!discount || discount <= 0) {
    return Number(product?.originalPrice ?? price)
  }

  return Number(product?.originalPrice ?? (price / Math.max(1 - discount / 100, 0.01)))
}

function resolveImage(imageUrl) {
  if (!imageUrl) return placeholderImage
  if (imageUrl.startsWith('http')) return imageUrl
  return `${API_BASE_URL}/images/${imageUrl.replace('/images/', '')}`
}

const providerId = computed(() => Number(route.params.id || 0) || null)

const loadProvider = async () => {
  loading.value = true
  try {
    if (!productStore.products.length) {
      await productStore.fetchAllProducts()
    }

    const allProducts = productStore.products.filter((product) => {
      const currentProviderId = Number(product.providerId ?? product.provider_id ?? product.provider?.user_id ?? 0) || null
      return currentProviderId === providerId.value
    })

    const providerName =
      allProducts[0]?.providerName ||
      allProducts[0]?.provider?.provider_name ||
      allProducts[0]?.provider?.name ||
      'Unknown Provider'

    const productLookup = new Map(allProducts.map((product) => [Number(product.id), product]))

    let topProducts = []
    try {
      const topResponse = await api.get('/orders/top-products', {
        params: { period: 'month', providerId: providerId.value },
      })
      topProducts = Array.isArray(topResponse.data?.products) ? topResponse.data.products : []
    } catch (error) {
      topProducts = []
    }

    const popularProducts = (topProducts.length ? topProducts : allProducts.slice(0, 4)).map((product) => {
      const source = productLookup.get(Number(product.id)) || product
      const price = Number(source.price ?? product.price ?? 0)
      const discount = Number(source.discount ?? product.discount ?? 0)

      return {
        ...source,
        ...product,
        price,
        discount,
        originalPrice: getOriginalPrice({ ...source, ...product, price, discount }),
        providerName: source.providerName || providerName,
        image: resolveImage(source.image || source.imageUrl || product.image || product.imageUrl),
        badge: 'HOT',
        label: `${Number(product.totalQuantity || 0).toFixed(2)} kg sold`,
      }
    })

    const promotionProducts = allProducts
      .filter((product) => Number(product.discount ?? 0) > 0)
      .sort((a, b) => Number(b.discount ?? 0) - Number(a.discount ?? 0))
      .map((product) => ({
        ...product,
        price: Number(product.price ?? 0),
        discount: Number(product.discount ?? 0),
        originalPrice: getOriginalPrice(product),
        providerName: product.providerName || providerName,
        image: resolveImage(product.image || product.imageUrl),
        badge: 'SALE',
      }))

    provider.value = {
      id: providerId.value,
      name: providerName,
      farm: providerName,
      location: 'Cambodia',
      quote: `Browse all products and top sellers from ${providerName}.`,
      image: resolveImage(allProducts[0]?.image || allProducts[0]?.imageUrl),
      productCount: allProducts.length,
      topProductCount: topProducts.length,
      monthOrders: Number((topProducts || []).reduce((sum, item) => sum + Number(item.orderCount || 0), 0)),
      products: allProducts.map((product) => ({
        ...product,
        price: Number(product.price ?? 0),
        discount: Number(product.discount ?? 0),
        originalPrice: getOriginalPrice(product),
        image: resolveImage(product.image || product.imageUrl),
        providerName: product.providerName || providerName,
      })),
      popularProducts,
      promotionProducts,
    }
  } finally {
    loading.value = false
  }
}

watch(providerId, loadProvider)
onMounted(loadProvider)
</script>

<style scoped>
.profile-page {
  background: #f9f9f6;
  min-height: 100vh;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}
.back-btn {
  background: none;
  border: none;
  color: #2d6a4f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
}
.farmer-header {
  display: flex;
  gap: 28px;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}
.farmer-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8f5ee;
}
.farmer-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #1a2e1a; }
.farm-name { font-size: 16px; color: #2d6a4f; font-weight: 600; margin: 0 0 2px; }
.location { font-size: 13px; color: #8fa896; margin: 0 0 10px; }
.badges { display: flex; flex-wrap: wrap; gap: 8px; }
.badge { background: #e8f5ee; color: #1a4a2e; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 99px; }
.stats { display: flex; gap: 16px; margin-bottom: 24px; }
.stat { flex: 1; background: #fff; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.stat-value { display: block; font-size: 22px; font-weight: 700; color: #2d6a4f; }
.stat-label { font-size: 12px; color: #8fa896; margin-top: 4px; }
.quote { font-style: italic; color: #5a7060; font-size: 16px; line-height: 1.6; border-left: 3px solid #2d6a4f; padding-left: 20px; margin: 0 0 32px; }
h2 { font-size: 20px; font-weight: 700; color: #1a2e1a; margin-bottom: 20px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.product-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; transition: transform 0.2s; }
.product-card:hover { transform: translateY(-4px); }
.product-card img { width: 100%; height: 150px; object-fit: cover; }
.product-info { padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.category { font-size: 11px; color: #8fa896; text-transform: uppercase; font-weight: 600; }
.name { font-weight: 600; font-size: 14px; color: #1a2e1a; }
.price { font-weight: 700; color: #2d6a4f; font-size: 16px; margin-top: 4px; }
.empty-state { padding-top: 40px; }
.empty-note { color: #6f7f73; margin: 0 0 8px; }
@media (max-width: 768px) {
  .farmer-header { flex-direction: column; text-align: center; }
  .badges { justify-content: center; }
  .stats { flex-direction: column; }
}
</style>