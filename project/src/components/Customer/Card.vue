<template>
  <div :class="['product-' + viewMode]">
    <div
      v-for="product in displayProducts"
      :key="product.id"
      :class="['product-card', { 'list-card': viewMode === 'list' }]"
      @click="goToProductDetail(product.id)"
      style="cursor: pointer;"
    >
      <div class="card-image">
        <img :src="product.image" :alt="product.name" />

        <span
          v-if="product.badge"
          class="badge"
          :class="badgeClass(product.badge)"
        >
          {{ product.badge }}
        </span>

        <span
          v-if="product.discount"
          class="badge badge-discount"
        >
          -{{ product.discount }}%
        </span>

        <div v-if="product.label" class="image-label">
          {{ product.label }}
        </div>

        <button
          class="btn-favorite"
          @click.stop="toggleFavorite(product)"
          :class="{ active: isFavorite(product.id) }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
              stroke-width="1.8"
              stroke-linejoin="round"
              :class="{ filled: isFavorite(product.id) }"
            />
          </svg>
        </button>
      </div>

      <div class="card-body">
        <p class="category">{{ product.category || t('product') }}</p>
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="provider-owner">{{ product.providerName }}</p>

        <div class="rating">
          <i class="bi bi-star-fill"></i>
          <span class="rating-text">{{ getProductRating(product.id) }}</span>
        </div>

        <div class="price-row">
          <div class="prices">
            <span class="price">${{ formatPrice(product.price) }}</span>
            <span class="original-price">${{ formatPrice(getOriginalPrice(product)) }}</span>
          </div>

          <button
            class="btn-add"
            @click.stop="addToCart(product)"
          >
            <span class="plus">+</span> {{ t('add') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'
const languageStore = useLanguageStore()
const t = (key) => messages[languageStore.language][key] || key
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cartStore'
import { useProductStore } from '../../stores/productStore'
import { useFavoriteStore } from '../../stores/favoriteStore'
import axios from 'axios'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  products: {
    type: Array,
    default: null,
  },
  viewMode: {
    type: String,
    default: 'grid',
  },
})

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const resolveImage = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return API_BASE_URL + path
  return API_BASE_URL + '/uploads/' + path
}

const normalizeProduct = product => ({
  ...product,
  price: Number(product?.price ?? 0),
  discount: Number(product?.discount ?? 0),
  providerId: Number(product?.providerId ?? product?.provider_id ?? product?.provider?.user_id ?? 0) || null,
  providerName: product?.providerName || product?.provider?.farm_name || product?.provider?.provider_name || `Farm #${product?.provider?.user_id || '?'}`,
  image: resolveImage(product?.image || product?.imageUrl || ''),
  stock: Number(product?.stock ?? 0),
})

const displayProducts = computed(() => {
  if (props.product) {
    return [normalizeProduct(props.product)]
  }

  if (Array.isArray(props.products) && props.products.length > 0) {
    return props.products.map(normalizeProduct)
  }

  return productStore.products.map(normalizeProduct)
})

const formatPrice = value => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00'
}

const getOriginalPrice = product => {
  return Number(product?.originalPrice ?? product?.price ?? 0)
}

const badgeClass = badge => ({
  'badge-hot': badge === 'HOT',
  'badge-sale': badge === 'SALE',
  'badge-new': badge === 'NEW',
  'badge-discount': badge === 'DISCOUNT',
})

const addToCart = product => {
  if (Number(product.stock || 0) <= 0) {
    alert('This product is out of stock.')
    return
  }

  cartStore.addToCart({
    ...product,
    originalPrice: getOriginalPrice(product),
    unitPrice: Number(product.price ?? 0),
    unit: product.unit || 'item',
    provider_id: product.provider_id ?? product.provider?.user_id ?? product.providerId ?? null,
    providerName: product.providerName || product.provider?.farm_name || product.provider?.provider_name || `Farm #${product.provider?.user_id || '?'}`,
  })
}

const toggleFavorite = product => {
  if (favoriteStore.isFavorite(product.id)) {
    favoriteStore.removeFromFavorite(product.id)
  } else {
    favoriteStore.addToFavorite(product)
  }
}

const isFavorite = productId => {
  return favoriteStore.isFavorite(productId)
}

const ratingsMap = ref({})

const getProductRating = (productId) => {
  if (!productId) return 0
  const entry = ratingsMap.value[Number(productId)]
  return entry ? Number(entry.average) : 0
}

const fetchRatings = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/reviews/ratings`)
    console.log('Ratings API response:', res.data)
    const map = {}
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    for (const r of data) {
      const pid = Number(r.productId ?? r.product_id ?? r.product?.id)
      if (!pid) continue
      map[pid] = { average: r.average ?? r.avg ?? 0, count: r.count ?? 0 }
    }
    ratingsMap.value = map
  } catch (err) {
    console.error('Failed to fetch ratings:', err)
  }
}

const goToProductDetail = productId => {
  router.push(`/product/${productId}`)
}

onMounted(async () => {
  if (!props.product && !(Array.isArray(props.products) && props.products.length > 0) && !productStore.products.length) {
    await productStore.fetchAllProducts()
  }
  fetchRatings()
})
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
  min-width: 0;
  padding: 20px;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.1);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 12px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.3s;
}

.product-card:hover img {
  transform: scale(1.08);
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.badge-hot  { background: #2D7A3A; color: #fff; }
.badge-sale { background: #F59E0B; color: #fff; }
.badge-new  { background: #6B7280; color: #fff; }
.badge-discount { background: #DC2626; color: #fff; }

.image-label {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  font-weight: 600;
  white-space: pre-line;
  text-align: right;
}

.btn-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-favorite:hover {
  background: #fff;
  transform: scale(1.1);
}

.btn-favorite.active {
  background: #e85a2d;
}

.btn-favorite svg path {
  fill: none;
  stroke: #2D7A3A;
  transition: none;
}

.btn-favorite.active svg path.filled {
  fill: #fff;
  stroke: transparent;
}

.card-body {
  padding: 12px 0 0;
}

.category {
  font-size: 11px;
  color: #9ca3af;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  margin: 4px 0 6px;
  line-height: 1.3;
}

.provider-owner {
  font-size: 11px;
  color: #4b5563;
  margin-bottom: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  color: #f5a623;
  font-size: 13px;
}

.rating-text {
  font-weight: 600;
  color: #4b5563;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prices {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.original-price {
  font-size: 12px;
  color: #9ca3af;
  text-decoration: line-through;
}

.btn-add {
  border: none;
  background: #2D7A3A;
  color: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add:hover {
  background: #1f5a2a;
}

.plus {
  font-size: 14px;
  margin-right: 4px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-list .list-card {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 12px;
}

.product-list .list-card .card-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.product-list .list-card .card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
}

.product-list .list-card .card-footer {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>