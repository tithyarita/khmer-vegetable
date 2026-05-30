<template>
  <div class="shop-wrapper">
    <NavigationBar />

    <main class="page">
      <!-- BREADCRUMB -->
      <nav class="breadcrumb">
        <router-link to="/">
          {{ t('home') }}
        </router-link>

        <span class="sep">›</span>

        <router-link to="/products">
          {{ t('vegetables') }}
        </router-link>

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
              />

              <span class="pd-seasonal">
                {{ t('seasonalPick') }}
              </span>
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

            <p class="pd-farm">
              {{ t('farmToTable') }} · {{ t('organic') }}
            </p>

            <h1 class="pd-name">
              {{ product.name }}
            </h1>

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
                  <path
                    d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z"
                  />
                </svg>
              </span>

              <span class="rt">
                ({{ avgRating }}
                {{ t('stars') }} ·
                {{ reviews.length }}
                {{ t('reviews') }})
              </span>
            </div>

            <!-- PRICE -->
            <div class="pd-price-row">
              <span class="pd-price">
                ${{ Number(product.price).toFixed(2) }}
              </span>

              <span class="pd-orig">
                ${{ Number(product.originalPrice).toFixed(2) }}
              </span>

              <span
                v-if="product.discount > 0"
                class="pd-off"
              >
                {{ product.discount }}% OFF
              </span>
            </div>

            <!-- INFO -->
            <div class="pd-weight">
              <span>{{ t('weight') }}:</span>
              <strong>{{ product.weight }}</strong>
            </div>

            <div class="pd-provider">
              <span>{{ t('providerOwner') }}:</span>

              <strong>
                {{ product.providerName }}

                <span v-if="product.providerId">
                  (#{{ product.providerId }})
                </span>
              </strong>
            </div>

            <!-- DESCRIPTION -->
            <p class="pd-desc">
              {{ product.description }}
            </p>

            <!-- ACTIONS -->
            <div class="pd-actions">

              <!-- QTY -->
              <div class="qty">
                <button @click="qty = Math.max(1, qty - 1)">
                  −
                </button>

                <span>{{ qty }}</span>

                <button @click="qty++">
                  +
                </button>
              </div>

              <!-- ADD TO CART -->
              <button
                class="add-btn"
                @click="addToCart"
              >
                {{ t('addToCart') }}
              </button>

              <!-- WISHLIST -->
              <button
                class="wish-btn"
                :class="{ liked: wished }"
                @click="wished = !wished"
              >
                ♥
              </button>
            </div>

            <!-- CERT -->
            <div class="pd-certs">

              <div class="cert">
                🌱 {{ t('soilAssociation') }}
              </div>

              <div class="cert">
                🚚 {{ t('sameDayDelivery') }}
              </div>

            </div>
          </div>
        </div>

        <!-- TABS -->
        <div class="pd-tabs">

          <!-- TAB NAV -->
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
              {{ t('reviews') }}
              ({{ reviews.length }})
            </button>

          </div>

          <!-- CULINARY -->
          <div
            class="tab-pane"
            :class="{ active: activeTab === 'culinary' }"
          >
            <div class="cul-grid">

              <div>
                <h2 class="cul-title">
                  {{ t('goldenRatio') }}
                </h2>

                <p class="cul-body">
                  {{ product.culinaryBody }}
                </p>

                <div class="benefits">

                  <div
                    v-for="b in product.benefits"
                    :key="b"
                    class="benefit"
                  >
                    ✅ {{ b }}
                  </div>

                </div>
              </div>

              <!-- NUTRITION -->
              <div class="nutrition">

                <h4>
                  {{ t('nutritionalFacts') }}
                </h4>

                <div
                  v-for="n in product.nutrition"
                  :key="n.label"
                  class="nrow"
                >
                  <span>{{ n.label }}</span>

                  <strong>{{ n.value }}</strong>
                </div>

              </div>
            </div>
          </div>

          <!-- REVIEWS -->
          <div
            class="tab-pane"
            :class="{ active: activeTab === 'reviews' }"
          >

            <!-- SUMMARY -->
            <div class="rev-summary">

              <div class="rev-score">

                <div class="rev-num">
                  {{ avgRating }}
                </div>

                <div class="rev-ct">
                  {{ reviews.length }}
                  {{ t('reviews') }}
                </div>

              </div>

              <div class="bars">

                <div
                  v-for="s in [5,4,3,2,1]"
                  :key="s"
                  class="bar-row"
                  @click="filterStar = filterStar === s ? null : s"
                >

                  <span class="bar-lbl">
                    {{ s }}★
                  </span>

                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :style="{ width: getStarPercentage(s) + '%' }"
                    />
                  </div>

                  <span class="bar-n">
                    {{ getStarCount(s) }}
                  </span>

                </div>
              </div>
            </div>

            <!-- REVIEW LIST -->
            <div class="rev-list">

              <div
                v-for="rv in filteredReviews"
                :key="rv.id"
                class="rev-card"
              >

                <div class="rev-head">

                  <div
                    class="avatar"
                    :style="{ background: rv.color }"
                  >
                    {{ rv.initials }}
                  </div>

                  <div class="rev-meta">

                    <div class="rev-author">
                      {{ rv.author }}

                      <span
                        v-if="rv.verified"
                        class="vbadge"
                      >
                        {{ t('verified') }}
                      </span>
                    </div>

                    <div class="rev-date">
                      {{ rv.date }} · {{ rv.location }}
                    </div>
                  </div>
                </div>

                <div class="rev-title">
                  {{ rv.title }}
                </div>

                <div class="rev-body">
                  {{ rv.body }}
                </div>

              </div>
            </div>

            <!-- REVIEW FORM -->
            <div class="review-form">

              <h3 class="rf-title">
                {{ t('writeReview') }}
              </h3>

              <div class="rf-stars">

                <span class="rf-label">
                  {{ t('yourRating') }}
                </span>

                <span class="rf-star-row">

                  <svg
                    v-for="i in 5"
                    :key="i"
                    class="rf-star"
                    :class="i <= newReview.rating ? 'f' : 'e'"
                    viewBox="0 0 12 12"
                    @click="newReview.rating = i"
                  >
                    <path
                      d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z"
                    />
                  </svg>

                </span>
              </div>

              <textarea
                v-model="newReview.body"
                class="rf-textarea"
                :placeholder="t('writeYourReview')"
                rows="4"
              />

              <button
                class="rf-submit"
                @click="submitReview"
              >
                {{ t('submitReview') }}
              </button>

            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- TOAST -->
    <div
      class="toast"
      :class="{ hide: !toast.show }"
    >
      {{ toast.msg }}
    </div>

    <!-- RELATED -->
    <div class="card-container">

      <div class="section-header">

        <h2 class="section-title">
          {{ t('freshFromField') }}
        </h2>

        <a href="#" class="see-all">
          {{ t('viewVegetables') }} →
        </a>

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

import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

const placeholderImage =
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80&w=800'

const product = reactive({
  id: null,
  name: 'Loading...',
  price: 0,
  originalPrice: 0,
  discount: 0,
  providerId: null,
  providerName: 'Unknown',
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
const wished = ref(false)
const filterStar = ref(null)

const toast = reactive({
  show: false,
  msg: '',
})

const reviews = ref([
  {
    id: 1,
    author: 'Sophie K.',
    initials: 'SK',
    color: '#2d6a3f',
    rating: 5,
    date: 'Oct 24, 2025',
    location: 'Paris, FR',
    verified: true,
    title: 'Amazing!',
    body: 'Very fresh and delicious.',
  },
])

const newReview = reactive({
  rating: 0,
  body: '',
})

const applyProduct = (data) => {
  if (!data) return

  const image =
    data.image ||
    data.imageUrl ||
    placeholderImage

  Object.assign(product, {
    id: data.id,
    name: data.name || 'Untitled Product',
    price: Number(data.price || 0),
    originalPrice: Number(
      data.originalPrice || data.price || 0
    ),
    discount: Number(
      data.discount || 0
    ),
    providerId:
      data.provider?.user_id ||
      data.providerId ||
      null,
    providerName:
      data.provider?.provider_name ||
      data.providerName ||
      'Unknown',
    weight:
      data.weight ||
      `${Number(data.stock || 0)} in stock`,
    description: data.description || '',
    culinaryBody:
      data.description ||
      'Fresh vegetables from local farms.',
    benefits:
      data.benefits || [
        'Fresh from farm',
        'Healthy and organic',
      ],
    nutrition:
      data.nutrition || [
        {
          label: 'Calories',
          value: '50 kcal',
        },
      ],
    images: [image],
  })
}

const loadProduct = async () => {
  try {
    const id = route.params.id

    const data =
      await productStore.fetchProductById(id)

    applyProduct(data)

    activeIdx.value = 0
  } catch (err) {
    console.error(err)
  }
}

watch(
  () => route.params.id,
  () => {
    loadProduct()
  },
  { immediate: true }
)

const avgRating = computed(() => {
  if (!reviews.value.length) return 0

  const total = reviews.value.reduce(
    (sum, r) => sum + r.rating,
    0
  )

  return (
    total / reviews.value.length
  ).toFixed(1)
})

const filteredReviews = computed(() => {
  if (!filterStar.value)
    return reviews.value

  return reviews.value.filter(
    (r) => r.rating === filterStar.value
  )
})

const getStarCount = (star) => {
  return reviews.value.filter(
    (r) => r.rating === star
  ).length
}

const getStarPercentage = (star) => {
  return (
    (getStarCount(star) /
      reviews.value.length) *
    100
  )
}

const showToast = (msg) => {
  toast.msg = msg
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
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

  showToast(
    `${qty.value} item(s) added to cart`
  )
}

const submitReview = () => {
  if (
    !newReview.rating ||
    !newReview.body.trim()
  ) {
    showToast(
      'Please enter review and rating'
    )
    return
  }

  reviews.value.unshift({
    id: Date.now(),
    author: 'Anonymous',
    initials: 'AN',
    color: '#3a8f52',
    rating: newReview.rating,
    date: new Date().toLocaleDateString(),
    location: 'Phnom Penh',
    verified: false,
    title: 'Customer Review',
    body: newReview.body,
  })

  newReview.rating = 0
  newReview.body = ''

  showToast('Review submitted!')
}
</script>

<style scoped>
.shop-wrapper {
  font-family: Arial, sans-serif;
  background: #edf4ef;
  min-height: 100vh;
}

.page {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.breadcrumb {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.pd-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.pd-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.pd-gallery {
  padding: 20px;
  background: #f3faf5;
}

.pd-main img {
  width: 100%;
  border-radius: 12px;
}

.pd-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.pd-thumb {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
}

.pd-thumb.active {
  border-color: green;
}

.pd-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-info {
  padding: 30px;
}

.pd-name {
  font-size: 32px;
  margin: 10px 0;
}

.pd-price {
  font-size: 32px;
  color: green;
  font-weight: bold;
}

.pd-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.qty {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 999px;
}

.qty button {
  width: 40px;
  border: none;
  background: none;
  cursor: pointer;
}

.qty span {
  width: 40px;
  text-align: center;
  line-height: 40px;
}

.add-btn {
  flex: 1;
  border: none;
  background: green;
  color: white;
  border-radius: 999px;
  cursor: pointer;
}

.wish-btn {
  width: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.tab-nav {
  display: flex;
  border-top: 1px solid #ddd;
}

.tab-btn {
  padding: 14px 20px;
  border: none;
  background: none;
  cursor: pointer;
}

.tab-btn.active {
  color: green;
  border-bottom: 2px solid green;
}

.tab-pane {
  display: none;
  padding: 24px;
}

.tab-pane.active {
  display: block;
}

.review-form {
  margin-top: 24px;
}

.rf-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
}

.rf-submit {
  margin-top: 12px;
  padding: 10px 20px;
  background: green;
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a3d28;
  color: white;
  padding: 12px 20px;
  border-radius: 999px;
}

.toast.hide {
  opacity: 0;
}

@media (max-width: 768px) {
  .pd-top {
    grid-template-columns: 1fr;
  }
}
</style>