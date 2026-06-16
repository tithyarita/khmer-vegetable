<template>
  <div class="profile-page">
    <NavigationBar />

    <div class="container" v-if="provider">
      <button class="back-btn" @click="$router.back()">{{ t('back') }}</button>

      <div class="farmer-header">
        <img :src="provider.image" :alt="provider.name" class="farmer-avatar" />
        <div>
          <h1>{{ provider.name }}</h1>
          <p class="farm-name">{{ provider.farm }}</p>
          <p class="location">{{ provider.location }}</p>

          <!-- Contact Info: Email & Phone -->
          <div class="contact-info">
            <div class="contact-item" v-if="provider.email">
              <i class="bi bi-envelope-fill"></i>
              <span>{{ provider.email }}</span>
            </div>
            <div class="contact-item" v-if="provider.phone">
              <i class="bi bi-telephone-fill"></i>
              <span>{{ provider.phone }}</span>
            </div>
          </div>

          <div class="badges">
            <span class="badge">{{ provider.productCount }} {{ t('products') }}</span>
            <span class="badge">{{ provider.topProductCount }} {{ t('topSellingItems') }}</span>
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ provider.productCount }}</span>
          <span class="stat-label">{{ t('allProducts') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ provider.topProductCount }}</span>
          <span class="stat-label">{{ t('topProducts') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ provider.monthOrders }}</span>
          <span class="stat-label">{{ t('thisMonthOrders') }}</span>
        </div>
      </div>

      <blockquote class="quote">"{{ t('browseAllProducts') }} {{ provider.name }}."</blockquote>

      <h2>{{ t('topSellingProductsBy') }} {{ provider.name }}</h2>
      <Card v-if="provider.popularProducts.length" :products="provider.popularProducts" />
      <p v-else class="empty-note">{{ t('noPopularProducts') }}</p>

      <h2 style="margin-top:32px">{{ t('promotionProductsBy') }} {{ provider.name }}</h2>
      <Card v-if="provider.promotionProducts.length" :products="provider.promotionProducts" />
      <p v-else class="empty-note">{{ t('noDiscountProducts') }}</p>

      <h2 style="margin-top:32px">{{ t('allProductsBy') }} {{ provider.name }}</h2>
      <Card v-if="provider.products.length" :products="provider.products" />
      <p v-else class="empty-note">{{ t('noProductsFound') }}</p>
    </div>

    <div v-else class="container empty-state">
      <button class="back-btn" @click="$router.back()">{{ t('back') }}</button>
      <p v-if="loading">{{ t('loadingProvider') }}</p>
      <p v-else>{{ t('providerNotFound') }}</p>
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
import { useI18n } from '@/composables/useI18n'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const route = useRoute()
const productStore = useProductStore()
const { t } = useI18n()

const provider = ref(null)
const loading = ref(false)

const api = axios.create({ baseURL: API_BASE_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 rx=%2224%22 fill=%22%23eef3ee%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%236b7280%22%3ENo Image%3C/text%3E%3C/svg%3E'

function resolveImage(imageUrl) {
  if (!imageUrl) return placeholderImage
  if (imageUrl.startsWith('http')) return imageUrl
  return `${API_BASE_URL}/images/${imageUrl.replace('/images/', '')}`
}

const getOriginalPrice = (product) => {
  const price = Number(product?.price ?? 0)
  const discount = Number(product?.discount ?? 0)
  if (!discount || discount <= 0) {
    return Number(product?.originalPrice ?? price)
  }
  return Number(product?.originalPrice ?? (price / Math.max(1 - discount / 100, 0.01)))
}

const providerId = computed(() => Number(route.params.id || 0) || null)

const loadProvider = async () => {
  loading.value = true
  try {
    const [providerRes, topRes] = await Promise.allSettled([
      api.get(`/providers/${providerId.value}`),
      api.get('/orders/top-products', {
        params: { period: 'month', providerId: providerId.value },
      }),
    ])

    const providerData = providerRes.status === 'fulfilled' ? providerRes.value.data : null
    const topProducts = topRes.status === 'fulfilled' && Array.isArray(topRes.value.data?.products)
      ? topRes.value.data.products
      : []

    const name = providerData?.provider_name || providerData?.farm_name || 'Unknown Provider'
    const farm = providerData?.farm_name || name

    let allProducts = []
    if (providerData?.products) {
      allProducts = providerData.products
    } else {
      if (!productStore.products.length) {
        await productStore.fetchAllProducts()
      }
      allProducts = productStore.products.filter((product) => {
        const pid = Number(product.providerId ?? product.provider_id ?? product.provider?.user_id ?? 0) || null
        return pid === providerId.value
      })
    }

    const productLookup = new Map(allProducts.map((product) => [Number(product.id), product]))

    const popularProducts = (topProducts.length ? topProducts : allProducts.slice(0, 4)).map((product) => {
      const source = productLookup.get(Number(product.id)) || product
      const price = Number(source.price ?? product.price ?? 0)
      const discount = Number(source.discount ?? product.discount ?? 0)
      return {
        ...source, ...product, price, discount,
        originalPrice: getOriginalPrice({ ...source, ...product, price, discount }),
        providerName: source.providerName || name,
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
        providerName: product.providerName || name,
        image: resolveImage(product.image || product.imageUrl),
        badge: 'SALE',
      }))

    // Extract email and phone from provider data or related user
    const providerEmail = providerData?.email || providerData?.user?.email || ''
    const providerPhone = providerData?.user?.phone || ''
    provider.value = {
      id: providerId.value,
      name,
      farm,
      email: providerEmail,
      phone: providerPhone,
      image: resolveImage(providerData?.avatar || providerData?.farm_image || providerData?.user?.avatar || allProducts[0]?.image || allProducts[0]?.imageUrl),
      location: providerData?.location || 'Cambodia',
      productCount: allProducts.length,
      topProductCount: topProducts.length,
      monthOrders: Number((topProducts || []).reduce((sum, item) => sum + Number(item.orderCount || 0), 0)),
      products: allProducts.map((product) => ({
        ...product,
        price: Number(product.price ?? 0),
        discount: Number(product.discount ?? 0),
        originalPrice: getOriginalPrice(product),
        image: resolveImage(product.image || product.imageUrl),
        providerName: product.providerName || name,
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
  background: linear-gradient(135deg, #f0fdf4 0%, #f9f9f6 100%);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
}

body.khmer-font .profile-page {
  font-family: 'Kantumruy Pro', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.back-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}

.farmer-header {
  display: flex;
  gap: 32px;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.farmer-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #22c55e;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}

.farmer-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #1a2e1a;
  letter-spacing: -0.02em;
}

.farm-name {
  font-size: 18px;
  color: #2d6a4f;
  font-weight: 700;
  margin: 0 0 4px;
}

.location {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}
.contact-item i {
  font-size: 16px;
  color: #2d6a4f;
  width: 18px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 99px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.stat:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #22c55e;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quote {
  font-style: italic;
  color: #4b5563;
  font-size: 17px;
  line-height: 1.7;
  border-left: 4px solid #22c55e;
  padding-left: 24px;
  margin: 0 0 40px;
  background: rgba(255, 255, 255, 0.6);
  padding: 20px 24px;
  border-radius: 0 16px 16px 0;
}

h2 {
  font-size: 24px;
  font-weight: 800;
  color: #1a2e1a;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.empty-state {
  padding-top: 60px;
  text-align: center;
}

.empty-note {
  color: #6b7280;
  margin: 0 0 12px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .farmer-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .badges {
    justify-content: center;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .farmer-avatar {
    width: 100px;
    height: 100px;
  }
  
  .farmer-header h1 {
    font-size: 22px;
  }
}
</style>