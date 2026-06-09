<template>
  <div class="shop-wrapper">
    <NavigationBar />

    <main class="page">
      <!-- BREADCRUMB -->
      <nav class="breadcrumb">
        <router-link to="/">{{ t('home') }}</router-link>
        <span class="sep">›</span>
        <router-link to="/products">{{ t('vegetables') }}</router-link>
        <span class="sep">›</span>
        <span class="cur">{{ product.name }}</span>
      </nav>

      <!-- PRODUCT CARD -->
      <div class="pd-card">
        <div class="pd-top">
          <!-- GALLERY -->
          <div class="pd-gallery">
            <div class="pd-main">
              <img
                :src="product.images[activeIdx]"
                :alt="product.name"
                ref="mainImg"
              />
              <span class="pd-seasonal">{{ t('seasonalPick') }}</span>
            </div>

            <div class="pd-thumbs">
              <div
                v-for="(img, i) in product.images"
                :key="i"
                class="pd-thumb"
                :class="{ active: activeIdx === i }"
                @click="activeIdx = i"
              >
                <img :src="img" :alt="product.name" />
              </div>
            </div>
          </div>

          <!-- INFO -->
          <div class="pd-info">
            <p class="pd-farm">{{ t('farmToTable') }} · {{ t('organic') }}</p>

            <h1 class="pd-name">{{ product.name }}</h1>

            <!-- RATING -->
            <div class="pd-rating-row">
              <span class="stars">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="st"
                  :class="i <= Math.round(avgRating) ? 'f' : 'e'"
                  viewBox="0 0 12 12"
                >
                  <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                </svg>
              </span>
              <span class="rt">
                {{ avgRating }} {{ t('stars') }} · {{ reviews.length }} {{ t('reviews') }}
              </span>
            </div>

            <!-- PRICE -->
            <div class="pd-price-row">
              <span class="pd-price">${{ Number(product.price).toFixed(2) }}</span>
              <span class="pd-orig">${{ Number(product.originalPrice).toFixed(2) }}</span>
              <span v-if="product.discount > 0" class="pd-off">-{{ product.discount }}%</span>
            </div>

            <!-- STOCK -->
            <div class="pd-stock" :class="{ low: stockStatus === 'low', out: stockStatus === 'out' }">
              <span class="stock-dot" />
              <span v-if="stockStatus === 'in'">{{ t('inStock') }}</span>
              <span v-else-if="stockStatus === 'low'">{{ t('lowStock') }} ({{ product.stock }})</span>
              <span v-else>{{ t('outOfStock') }}</span>
            </div>

            <!-- INFO ROWS -->
            <div class="pd-weight-chip">
              <i class="bi bi-clock"></i>
              <span>{{ t('weight') }}: <strong>{{ product.weight }}</strong></span>
            </div>

            <router-link
              v-if="product.providerId"
              :to="`/farmer/${product.providerId}`"
              class="pd-provider-chip"
            >
              <span class="pc-avatar">
                <img v-if="product.providerImage" :src="product.providerImage" :alt="product.providerName" class="pc-img" />
                <i v-else-if="!providerInitial || providerInitial.startsWith('#')" class="bi bi-person-fill"></i>
                <span v-else class="pc-initial">{{ providerInitial }}</span>
              </span>
              <span class="pc-body">
                <span class="pc-name">{{ displayName }}</span>
                <span class="pc-label">{{ t('providerOwner') }}</span>
              </span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <div v-else class="pd-provider-chip">
              <span class="pc-avatar">?</span>
              <span class="pc-name">{{ product.providerName }}</span>
            </div>

            <!-- DESCRIPTION -->
            <p class="pd-desc">{{ product.description }}</p>

            <!-- ACTIONS -->
            <div class="pd-actions">
              <div class="qty">
                <button @click="qty = Math.max(1, qty - 1)" :disabled="stockStatus === 'out'">−</button>
                <span>{{ qty }}</span>
                <button @click="qty++" :disabled="qty >= product.stock || stockStatus === 'out'">+</button>
              </div>

              <button
                class="add-btn"
                :disabled="stockStatus === 'out'"
                @click="addToCart"
              >
                <i class="bi bi-cart3"></i>
                {{ t('addToCart') }}
              </button>

              <button
                class="wish-btn"
                :class="{ liked: favoriteStore.isFavorite(product.id) }"
                @click="toggleWish"
              >
                <i :class="favoriteStore.isFavorite(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
              </button>
            </div>

            <!-- CERTIFICATIONS -->
            <div class="pd-certs">
              <div class="cert"><i class="bi bi-flower1"></i> {{ t('soilAssociation') }}</div>
              <div class="cert"><i class="bi bi-truck"></i> {{ t('sameDayDelivery') }}</div>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <div class="pd-tabs">
          <div class="tab-nav">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'culinary' }"
              @click="activeTab = 'culinary'"
            >
              {{ t('culinaryProfile') }}
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'reviews' }"
              @click="activeTab = 'reviews'"
            >
              {{ t('reviews') }} ({{ reviews.length }})
            </button>
          </div>

          <!-- CULINARY TAB -->
          <div class="tab-pane" :class="{ active: activeTab === 'culinary' }">
            <div class="cul-grid">
              <div>
                <h2 class="cul-title">{{ t('goldenRatio') }}</h2>
                <p class="cul-body">{{ product.culinaryBody }}</p>
                <div class="benefits">
                  <div v-for="b in product.benefits" :key="b" class="benefit">
                    <div class="ben-ico">
                      <i class="bi bi-check-lg"></i>
                    </div>
                    {{ b }}
                  </div>
                </div>
              </div>
              <div class="nutrition">
                <h4>{{ t('nutritionalFacts') }}</h4>
                <div v-for="n in product.nutrition" :key="n.label" class="nrow">
                  <span>{{ n.label }}</span>
                  <strong>{{ n.value }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- REVIEWS TAB -->
          <div class="tab-pane" :class="{ active: activeTab === 'reviews' }">
            <!-- LOADING -->
            <div v-if="reviewStore.loading" class="rev-loading">
              <div class="spinner" />
              <span>{{ t('loading') }}...</span>
            </div>

            <template v-else>
              <!-- SUMMARY -->
              <div class="rev-summary">
                <div class="rev-score">
                  <div class="rev-num">{{ avgRating }}</div>
                  <div class="rev-stars-big">
                    <svg v-for="i in 5" :key="i" class="rsb" :class="i <= Math.round(avgRating) ? 'f' : 'e'" viewBox="0 0 12 12">
                      <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                    </svg>
                  </div>
                  <div class="rev-ct">{{ reviews.length }} {{ t('reviews') }}</div>
                </div>

                <div class="bars">
                  <div
                    v-for="s in [5,4,3,2,1]"
                    :key="s"
                    class="bar-row"
                    :class="{ active: filterStar === s }"
                    @click="filterStar = filterStar === s ? null : s"
                  >
                    <span class="bar-lbl">{{ s }}★</span>
                    <div class="bar-track">
                      <div class="bar-fill" :style="{ width: getStarPercentage(s) + '%' }" />
                    </div>
                    <span class="bar-n">{{ getStarCount(s) }}</span>
                  </div>
                </div>
              </div>

              <!-- TOOLBAR -->
              <div class="rev-toolbar">
                <span class="rev-count">
                  {{ t('showing') }}
                  <strong>{{ filteredReviews.length }}</strong>
                  {{ t('of') }}
                  <strong>{{ reviews.length }}</strong>
                  {{ t('reviews') }}
                  <span v-if="filterStar">({{ filterStar }}★)</span>
                </span>

                <select v-model="sortBy" class="rev-sort">
                  <option value="newest">{{ t('newest') }}</option>
                  <option value="oldest">{{ t('oldest') }}</option>
                  <option value="highest">{{ t('highestRated') }}</option>
                  <option value="lowest">{{ t('lowestRated') }}</option>
                </select>
              </div>

              <!-- REVIEW LIST -->
              <div class="rev-list">
                <div
                  v-for="rv in sortedReviews"
                  :key="rv.id"
                  class="rev-card"
                >
                  <div class="rev-head">
                    <div class="avatar" :style="{ background: rv.color }">{{ rv.initials }}</div>
                    <div class="rev-meta">
                      <div class="rev-author">
                        {{ rv.author }}
                        <span v-if="rv.verified" class="vbadge">{{ t('verified') }}</span>
                      </div>
                      <div class="rev-stars-row">
                        <svg v-for="i in 5" :key="i" class="rcs" :class="i <= rv.rating ? 'f' : 'e'" viewBox="0 0 12 12">
                          <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                        </svg>
                      </div>
                      <div class="rev-date">{{ rv.date }}</div>
                    </div>
                  </div>
                  <div class="rev-body">{{ rv.body }}</div>
                </div>

                <div v-if="!filteredReviews.length" class="rev-empty">
                  {{ t('noReviews') }}
                </div>
              </div>

              <!-- WRITE REVIEW -->
              <div v-if="userStore.isLoggedIn" class="rev-write">
                <button
                  class="write-review-btn"
                  @click="showReviewForm = !showReviewForm"
                >
                  <i class="bi bi-plus-lg"></i>
                  {{ showReviewForm ? t('cancelReview') : t('writeReview') }}
                </button>

                <div v-if="showReviewForm" class="review-form">
                  <h3 class="rf-title">{{ t('writeReview') }}</h3>

                  <div class="rf-stars">
                    <span class="rf-label">{{ t('yourRating') }} <span class="rf-req">*</span></span>
                    <span class="rf-star-row">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        class="rf-star"
                        :class="i <= newReview.rating ? 'f' : 'e'"
                        viewBox="0 0 12 12"
                        @mouseenter="hoverStar = i"
                        @mouseleave="hoverStar = 0"
                        @click="newReview.rating = i"
                      >
                        <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                      </svg>
                    </span>
                    <span v-if="hoverStar || newReview.rating" class="rf-rating-text">
                      {{ ratingLabels[hoverStar || newReview.rating] }}
                    </span>
                  </div>

                  <div class="rf-feedback">
                    <label class="rf-feedback-label">{{ t('yourFeedback') }} <span class="rf-req">*</span></label>
                    <textarea
                      v-model="newReview.body"
                      class="rf-textarea"
                      :placeholder="t('writeYourReview')"
                      rows="4"
                      maxlength="500"
                    />
                    <div class="rf-char-count">{{ newReview.body.length }}/500</div>
                  </div>

                  <button
                    class="rf-submit"
                    :disabled="!newReview.rating || !newReview.body.trim() || reviewStore.loading"
                    @click="submitReview"
                  >
                    {{ reviewStore.loading ? t('submitting') + '...' : t('submitReview') }}
                  </button>
                </div>
              </div>

              <div v-else class="login-prompt">
                <router-link to="/user/login">{{ t('loginToReview') }}</router-link>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- TOAST -->
    <div class="toast" :class="{ hide: !toast.show }">
      <i v-if="toast.icon === 'success'" class="bi bi-check-circle-fill"></i>
      {{ toast.msg }}
    </div>

    <!-- RELATED -->
    <div class="card-container">
      <div class="section-header">
        <h2 class="section-title">{{ t('freshFromField') }}</h2>
        <router-link to="/products" class="see-all">{{ t('viewVegetables') }} →</router-link>
      </div>
      <Card />
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavigationBar from '@/components/Customer/NavigationBar.vue'
import Footer from '@/components/Customer/Footer.vue'
import Card from '@/components/Customer/Card.vue'

import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'
import { useReviewStore } from '@/stores/reviewStore'
import { useFavoriteStore } from '@/stores/favoriteStore'

import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()
const reviewStore = useReviewStore()
const favoriteStore = useFavoriteStore()

const placeholderImage = 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80&w=800'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function resolveProviderImage(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE}/uploads/${url.replace(/^\/?(images\/|uploads\/)?/, '')}`
}

const product = reactive({
  id: null,
  name: 'Loading...',
  price: 0,
  originalPrice: 0,
  discount: 0,
  stock: 0,
  providerId: null,
  providerName: 'Unknown',
  providerImage: '',
  weight: 'N/A',
  description: '',
  culinaryBody: '',
  benefits: [],
  nutrition: [],
  images: [placeholderImage],
})

const activeTab = ref('culinary')
const activeIdx = ref(0)
const qty = ref(1)
const filterStar = ref(null)
const showReviewForm = ref(false)
const sortBy = ref('newest')
const hoverStar = ref(0)
const mainImg = ref(null)

const toast = reactive({
  show: false,
  msg: '',
  icon: 'success',
})

const reviews = ref([])

const newReview = reactive({
  rating: 0,
  body: '',
})

const ratingLabels = ['', t('poor'), t('fair'), t('good'), t('veryGood'), t('excellent')]

const providerInitial = computed(() => {
  const name = product.providerName || ''
  if (name.toLowerCase() === 'provider' || name.toLowerCase() === 'unknown' || !name) {
    return product.providerId ? `#${product.providerId}` : '#'
  }
  return name.charAt(0).toUpperCase()
})

const displayName = computed(() => {
  const name = product.providerName || ''
  const id = product.providerId
  return name || `Farm #${id || '?'}`
})

const stockStatus = computed(() => {
  const s = Number(product.stock)
  if (s <= 0) return 'out'
  if (s <= 5) return 'low'
  return 'in'
})

const applyProduct = (data) => {
  if (!data) return

  const image = data.image || data.imageUrl || placeholderImage

  Object.assign(product, {
    id: data.id,
    name: data.name || 'Untitled product',
    price: data.price || 0,
    originalPrice: data.originalPrice || data.price || 0,
    discount: data.discount || 0,
    stock: Number(data.stock ?? 0),
    providerId: data.provider?.user_id || data.provider_id || data.providerId || null,
    providerName: data.provider?.farm_name || data.provider?.provider_name || data.providerName || `Farm #${data.provider?.user_id || '?'}`,
    providerImage: resolveProviderImage(data.provider?.avatar || data.provider?.image || ''),
    weight: data.weight || 'N/A',
    description: data.description || '',
    culinaryBody: data.description || 'Fresh vegetables from local farms.',
    benefits: data.benefits || ['Fresh from farm', 'Healthy and organic'],
    nutrition: data.nutrition || [{ label: 'Calories', value: '50 kcal' }],
    images: [image],
  })
}

const loadProduct = async () => {
  try {
    const id = route.params.id
    const data = await productStore.fetchProductById(id)
    applyProduct(data)
    activeIdx.value = 0
    qty.value = 1
  } catch (err) {
    console.error(err)
  }
}

const loadReviews = async () => {
  try {
    const id = route.params.id
    const data = await reviewStore.fetchReviewsByProduct(id)
    reviews.value = data
  } catch (err) {
    console.error('Failed to load reviews:', err)
  }
}

watch(
  () => route.params.id,
  () => {
    loadProduct()
    loadReviews()
    activeTab.value = 'culinary'
    filterStar.value = null
    showReviewForm.value = false
  },
  { immediate: true }
)

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const total = reviews.value.reduce((sum, r) => sum + r.rating, 0)
  return (total / reviews.value.length).toFixed(1)
})

const filteredReviews = computed(() => {
  let list = reviews.value
  if (filterStar.value) {
    list = list.filter((r) => r.rating === filterStar.value)
  }
  return list
})

const sortedReviews = computed(() => {
  const list = [...filteredReviews.value]
  switch (sortBy.value) {
    case 'newest':
      return list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    case 'oldest':
      return list.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date))
    case 'highest':
      return list.sort((a, b) => b.rating - a.rating)
    case 'lowest':
      return list.sort((a, b) => a.rating - b.rating)
    default:
      return list
  }
})

const getStarCount = (star) => {
  return reviews.value.filter((r) => r.rating === star).length
}

const getStarPercentage = (star) => {
  return reviews.value.length ? (getStarCount(star) / reviews.value.length) * 100 : 0
}

const showToast = (msg, icon = 'success') => {
  toast.msg = msg
  toast.icon = icon
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const addToCart = () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login')
    return
  }

  cartStore.addToCart({
    ...product,
    quantity: qty.value,
    provider_id: product.providerId,
    providerName: product.providerName,
  })

  showToast(`${qty.value} item(s) added to cart`)
}

const toggleWish = () => {
  if (favoriteStore.isFavorite(product.id)) {
    favoriteStore.removeFromFavorite(product.id)
  } else {
    favoriteStore.addToFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      category: product.category,
      providerId: product.providerId,
      providerName: product.providerName,
    })
    showToast(t('addedToWishlist'))
  }
}

const submitReview = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login')
    return
  }

  if (!newReview.rating || !newReview.body.trim()) {
    showToast(t('pleaseRateAndReview'), 'error')
    return
  }

  try {
    await reviewStore.createReview({
      rating: newReview.rating,
      feedback: newReview.body,
      productId: product.id,
    })

    await loadReviews()

    newReview.rating = 0
    newReview.body = ''
    showReviewForm.value = false
    showToast(t('reviewSubmitted'))
  } catch (err) {
    console.error('Failed to submit review:', err)
    const msg = err.response?.data?.message || t('reviewFailed')
    showToast(msg, 'error')
  }
}

</script>

<style scoped>
/* ============================================
   PRODUCT DETAIL - KH VEGETABLE REDESIGN
   ============================================ */

/* ---- Variables ---- */
.shop-wrapper {
  --gd: #1a3d28;
  --gm: #2d6a3f;
  --ga: #3a8f52;
  --gl: #e6f4eb;
  --gp: #f3faf5;
  --amb: #f5a623;
  --red: #e85a2d;
  --t1: #16261e;
  --t2: #435c4e;
  --t3: #8aa898;
  --bd: #d8e8de;
  --wh: #ffffff;
  --r: 16px;
  --tr: 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  font-family: 'DM Sans', sans-serif;
  background: var(--gp);
  min-height: 100vh;
}

/* ---- Page ---- */
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
}

/* ---- Breadcrumb ---- */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--t3);
  margin-bottom: 24px;
  padding: 0;
}

.breadcrumb a { color: var(--t2); text-decoration: none; transition: color 0.2s; }
.breadcrumb a:hover { color: var(--t1); }
.breadcrumb .sep { color: #c8d5cc; }
.breadcrumb .cur { color: var(--t3); font-weight: 500; }
.sep { color: #c8d5cc; }

/* ---- Product Card ---- */
.pd-card {
  background: var(--wh);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.pd-top {
  display: grid;
  grid-template-columns: 550px 1fr;
  gap: 0;
}

/* ---- Gallery ---- */
.pd-gallery {
  padding: 16px;
  background: var(--gp);
  width: 550px;
}

.pd-main {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: crosshair;
}

.pd-main img {
  width: 100%;
  display: block;
  border-radius: 10px;
}

.pd-seasonal {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--gm);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.pd-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.pd-thumb {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--tr);
  opacity: 0.6;
}

.pd-thumb:hover {
  opacity: 0.9;
}

.pd-thumb.active {
  border-color: var(--gm);
  opacity: 1;
}

.pd-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- Product Info ---- */
.pd-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
}

.pd-farm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gm);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  background: var(--gl);
  padding: 4px 14px;
  border-radius: 20px;
  width: fit-content;
}

.pd-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--t1);
  line-height: 1.15;
  margin: 0;
}

/* Rating */
.pd-rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.stars {
  display: flex;
  gap: 3px;
}

.st {
  width: 16px;
  height: 16px;
}

.st.f {
  fill: var(--amb);
  stroke: var(--amb);
}

.st.e {
  fill: var(--bd);
  stroke: var(--bd);
}

.rt {
  font-size: 14px;
  color: var(--t2);
  font-weight: 500;
}

.rt strong {
  color: var(--t1);
}

/* Price */
.pd-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.pd-price {
  font-size: 34px;
  font-weight: 700;
  color: var(--gm);
  letter-spacing: -0.5px;
}

.pd-orig {
  font-size: 18px;
  color: var(--t3);
  text-decoration: line-through;
  font-weight: 500;
}

.pd-off {
  font-size: 13px;
  font-weight: 700;
  background: #fee9e0;
  color: var(--red);
  padding: 4px 12px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

/* Stock */
.pd-stock {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gm);
  padding: 6px 0;
}

.pd-stock.low {
  color: var(--amb);
}

.pd-stock.out {
  color: var(--red);
}

.stock-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gm);
  box-shadow: 0 0 0 3px var(--gl);
}

.pd-stock.low .stock-dot {
  background: var(--amb);
  box-shadow: 0 0 0 3px #fef3c7;
}

.pd-stock.out .stock-dot {
  background: var(--red);
  box-shadow: 0 0 0 3px #fee2e2;
}

/* Weight chip */
.pd-weight-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: var(--gp);
  border: 1px solid var(--bd);
  border-radius: 10px;
  font-size: 14px;
  color: var(--t2);
}

.pd-weight-chip svg {
  color: var(--t3);
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.pd-weight-chip strong {
  color: var(--t1);
  font-weight: 600;
}

/* Provider profile chip (full-width) */
.pd-provider-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px 14px 14px;
  background: var(--wh);
  border: 1px solid var(--bd);
  border-radius: 14px;
  color: var(--t1);
  text-decoration: none;
  transition: all var(--tr);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  width: 100%;
  box-sizing: border-box;
}

.pd-provider-chip:hover {
  border-color: var(--gm);
  background: var(--gp);
  box-shadow: 0 3px 16px rgba(45, 106, 63, 0.14);
}

.pc-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--gm), var(--ga));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.pc-avatar svg {
  width: 22px;
  height: 22px;
}

.pc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-initial {
  font-size: 18px;
  font-weight: 700;
}

.pc-body {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.pc-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--t1);
}

.pc-label {
  font-size: 12px;
  color: var(--t3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pd-provider-chip > svg {
  color: var(--t3);
  flex-shrink: 0;
  transition: transform var(--tr);
}

.pd-provider-chip:hover > svg {
  color: var(--gm);
  transform: translateX(4px);
}

.pd-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--t2);
  margin: 2px 0;
  padding: 12px 16px;
  background: var(--gp);
  border-radius: 10px;
  border-left: 3px solid var(--gm);
}

/* Actions */
.pd-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.qty {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--bd);
  border-radius: 10px;
  overflow: hidden;
  background: var(--wh);
}

.qty button {
  width: 42px;
  height: 44px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--t2);
  transition: background var(--tr);
}

.qty button:hover:not(:disabled) {
  background: var(--gl);
}

.qty button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty span {
  width: 40px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: var(--t1);
}

.add-btn {
  flex: 1;
  height: 48px;
  border: none;
  background: linear-gradient(135deg, var(--gm), var(--gd));
  color: #fff;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all var(--tr);
  box-shadow: 0 4px 14px rgba(45, 106, 63, 0.3);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 106, 63, 0.4);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.add-btn i {
  font-size: 18px;
}

.wish-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid var(--bd);
  background: var(--wh);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--t3);
  font-size: 20px;
  transition: all var(--tr);
}

.wish-btn:hover {
  border-color: var(--red);
  color: var(--red);
  background: #fff5f2;
  transform: translateY(-2px);
}

.wish-btn.liked {
  border-color: var(--red);
  color: var(--red);
  background: #fff5f2;
}

/* Certs */
.pd-certs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.cert {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--t2);
  background: var(--gp);
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--bd);
}

.cert i {
  font-size: 13px;
  color: var(--gm);
}

/* ---- Tabs ---- */
.pd-tabs {
  border-top: 1px solid var(--bd);
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--bd);
  padding: 0 32px;
  background: var(--wh);
}

.tab-btn {
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: var(--t3);
  font-weight: 500;
  font-size: 14px;
  transition: all var(--tr);
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--t1);
}

.tab-btn.active {
  color: var(--gm);
  border-bottom-color: var(--gm);
}

.tab-pane {
  display: none;
  padding: 32px;
  animation: fadeIn 0.3s ease;
}

.tab-pane.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- Culinary Tab ---- */
.cul-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 36px;
}

.cul-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 12px;
}

.cul-body {
  line-height: 1.7;
  color: var(--t2);
  font-size: 14px;
}

.benefits {
  margin-top: 16px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--t1);
}

.ben-ico {
  width: 20px;
  height: 20px;
  background: var(--gl);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ben-ico svg {
  width: 10px;
}

.nutrition {
  background: var(--gp);
  border: 1px solid var(--bd);
  border-radius: 12px;
  padding: 20px;
}

.nutrition h4 {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--t1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nrow {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--bd);
  font-size: 13px;
  color: var(--t2);
}

.nrow:last-child {
  border-bottom: none;
}

.nrow strong {
  color: var(--t1);
}

/* ---- Reviews Tab ---- */

/* Loading */
.rev-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: var(--t3);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bd);
  border-top-color: var(--gm);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Summary */
.rev-summary {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 32px;
  background: var(--gp);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.rev-score {
  text-align: center;
}

.rev-num {
  font-size: 44px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  color: var(--t1);
  line-height: 1;
}

.rev-stars-big {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin: 6px 0;
}

.rsb {
  width: 16px;
  height: 16px;
}

.rsb.f {
  fill: var(--amb);
}

.rsb.e {
  fill: var(--bd);
}

.rev-ct {
  font-size: 13px;
  color: var(--t3);
  font-weight: 500;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
  transition: background var(--tr);
}

.bar-row:hover {
  background: var(--gl);
}

.bar-row.active {
  background: var(--gl);
}

.bar-lbl {
  font-size: 12px;
  font-weight: 600;
  color: var(--t2);
  width: 24px;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: var(--bd);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--amb);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.bar-n {
  font-size: 12px;
  color: var(--t3);
  width: 20px;
  text-align: right;
}

/* Toolbar */
.rev-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rev-count {
  font-size: 13px;
  color: var(--t2);
}

.rev-sort {
  padding: 8px 14px;
  border: 1.5px solid var(--bd);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: var(--t1);
  background: var(--wh);
  cursor: pointer;
  outline: none;
}

.rev-sort:focus {
  border-color: var(--gm);
}

/* Review Card */
.rev-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rev-card {
  padding: 20px;
  background: var(--wh);
  border: 1px solid var(--bd);
  border-radius: 12px;
  transition: box-shadow var(--tr);
}

.rev-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.rev-head {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.rev-meta {
  flex: 1;
  min-width: 0;
}

.rev-author {
  font-weight: 600;
  font-size: 14px;
  color: var(--t1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.vbadge {
  font-size: 10px;
  background: var(--gl);
  color: var(--gm);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.rev-stars-row {
  display: flex;
  gap: 2px;
  margin: 4px 0;
}

.rcs {
  width: 12px;
  height: 12px;
}

.rcs.f {
  fill: var(--amb);
}

.rcs.e {
  fill: var(--bd);
}

.rev-date {
  font-size: 12px;
  color: var(--t3);
  margin-top: 1px;
}

.rev-body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--t2);
}

.rev-empty {
  text-align: center;
  padding: 32px;
  color: var(--t3);
  font-size: 14px;
}

/* Write Review Section */
.rev-write {
  margin-top: 24px;
}

.write-review-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--gm);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--tr);
}

.write-review-btn:hover {
  background: var(--gd);
  transform: translateY(-1px);
}

/* Review Form */
.review-form {
  margin-top: 16px;
  padding: 24px;
  background: var(--gp);
  border: 1px solid var(--bd);
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

.rf-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 16px;
}

.rf-stars {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.rf-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--t2);
}

.rf-req {
  color: var(--red);
}

.rf-star-row {
  display: flex;
  gap: 4px;
}

.rf-star {
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rf-star:hover {
  transform: scale(1.2);
}

.rf-star.f {
  fill: var(--amb);
}

.rf-star.e {
  fill: var(--bd);
}

.rf-rating-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--gm);
}

.rf-feedback {
  margin-bottom: 16px;
}

.rf-feedback-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--t2);
  margin-bottom: 8px;
}

.rf-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--bd);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--t1);
  background: var(--wh);
  outline: none;
  resize: vertical;
  transition: border-color var(--tr);
  box-sizing: border-box;
  line-height: 1.5;
}

.rf-textarea:focus {
  border-color: var(--gm);
}

.rf-char-count {
  font-size: 12px;
  color: var(--t3);
  text-align: right;
  margin-top: 4px;
}

.rf-submit {
  padding: 12px 32px;
  background: var(--gm);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--tr);
}

.rf-submit:hover:not(:disabled) {
  background: var(--gd);
  transform: translateY(-1px);
}

.rf-submit:disabled {
  background: var(--t3);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Login Prompt */
.login-prompt {
  margin-top: 24px;
  padding: 20px;
  background: var(--gp);
  border: 1px solid var(--bd);
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  color: var(--t2);
}

.login-prompt a {
  color: var(--gm);
  font-weight: 600;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

/* ---- Toast ---- */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gd);
  color: #fff;
  padding: 12px 24px;
  border-radius: 99px;
  font-size: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast.hide {
  opacity: 0;
  bottom: 10px;
  pointer-events: none;
}

/* ---- Related Products ---- */
.card-container {
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--t1);
}

.see-all {
  font-family: 'DM Sans', sans-serif;
  color: var(--gm);
  text-decoration: none;
  font-size: 1.2rem;
  transition: color var(--tr);
}

.see-all:hover {
  color: var(--gd);
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 1024px) {
  .pd-top {
    grid-template-columns: 1fr;
  }

  .pd-gallery {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 12px;
  }

  .pd-top {
    grid-template-columns: 1fr;
  }

  .pd-gallery {
    width: 100%;
    padding: 12px;
  }

  .pd-thumb {
    width: 56px;
    height: 56px;
  }

  .pd-info {
    padding: 16px;
    gap: 10px;
  }

  .pd-name {
    font-size: 22px;
  }

  .pd-price {
    font-size: 26px;
  }

  .pd-provider-chip {
    padding: 10px 14px;
  }

  .pc-avatar {
    width: 40px;
    height: 40px;
  }

  .tab-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 0;
    padding: 0 12px;
  }

  .tab-btn {
    padding: 14px 16px;
    font-size: 13px;
    white-space: nowrap;
  }

  .tab-pane {
    padding: 16px;
  }

  .cul-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .rev-summary {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .rev-toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .write-review-btn {
    width: 100%;
    justify-content: center;
  }

  .review-form {
    padding: 16px;
  }

  .card-container {
    padding: 0 12px 32px;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 8px;
  }

  .pd-gallery {
    padding: 8px;
  }

  .pd-thumbs {
    gap: 6px;
  }

  .pd-thumb {
    width: 48px;
    height: 48px;
  }

  .pd-info {
    padding: 12px;
    gap: 8px;
  }

  .pd-name {
    font-size: 18px;
  }

  .pd-price {
    font-size: 22px;
  }

  .pd-orig {
    font-size: 14px;
  }

  .pd-provider-chip {
    padding: 8px 12px;
  }

  .pc-avatar {
    width: 36px;
    height: 36px;
  }

  .pc-name {
    font-size: 13px;
  }

  .breadcrumb {
    font-size: 11px;
  }

  .pd-actions {
    flex-wrap: wrap;
  }

  .qty button {
    width: 34px;
    height: 34px;
  }

  .qty span {
    width: 30px;
  }

  .add-btn {
    height: 38px;
    font-size: 13px;
    flex: 1;
  }

  .wish-btn {
    width: 38px;
    height: 38px;
  }

  .pd-certs {
    flex-direction: column;
    gap: 6px;
  }

  .cert {
    font-size: 11px;
    padding: 6px 10px;
  }

  .tab-btn {
    padding: 12px 14px;
    font-size: 12px;
  }

  .tab-pane {
    padding: 12px;
  }

  .rev-card {
    padding: 12px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .rev-num {
    font-size: 36px;
  }

  .card-container {
    padding: 0 8px 24px;
  }
}
</style>
