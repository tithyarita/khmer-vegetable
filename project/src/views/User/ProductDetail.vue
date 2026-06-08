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

            <!-- WRITE REVIEW BUTTON -->
            <button
              v-if="userStore.isLoggedIn"
              class="write-review-btn"
              @click="showReviewForm = !showReviewForm"
            >
              {{ showReviewForm ? t('cancelReview') : t('writeReview') }}
            </button>

            <div
              v-else
              class="login-prompt"
            >
              <router-link to="/user/login">
                {{ t('loginToReview') }}
              </router-link>
            </div>

            <!-- REVIEW FORM -->
            <div
              v-if="showReviewForm && userStore.isLoggedIn"
              class="review-form"
            >

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
import { useReviewStore } from '@/stores/reviewStore'

import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()
const reviewStore = useReviewStore()

const placeholderImage =
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80&w=800'

const product = reactive({
  id: null,
  name: 'Loading...',
  price: 0,
  originalPrice: 0,
  discount: 0,
  stock: 0,
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
const showReviewForm = ref(false)

const toast = reactive({
  show: false,
  msg: '',
})

const reviews = ref([])

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
    name: data.name || 'Untitled product',
    price: Number(data.price || 0),
    discount: Number(data.discount || 0),
    originalPrice: Number(data.originalPrice || data.price || 0),
    stock: Number(data.stock ?? 0),
    providerId: data.provider?.user_id || data.provider_id || data.providerId || null,
    providerName: data.provider?.provider_name || data.providerName || data.provider?.name || 'Unknown',
    weight: data.weight || `${Number(data.stock || 0)} in stock`,
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
  const id = route.params.id
  if (!id) return

  try {
    const data =
      await productStore.fetchProductById(id)

    applyProduct(data)

    activeIdx.value = 0
  } catch (err) {
    console.error(err)
  }
}

const loadReviews = async () => {
  const id = route.params.id
  if (!id) return

  try {
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

  const availableStock = Number(product.stock ?? 0)
  if (availableStock <= 0) {
    alert('This product is out of stock.')
    return
  }

  if (qty.value > availableStock) {
    alert(`Only ${availableStock} in stock.`)
    return
  }

  cartStore.addToCart({
    ...product,
    unitPrice: Number(product.price ?? 0),
    originalPrice: Number(product.originalPrice ?? product.price ?? 0),
    quantity: qty.value,
    unit: product.unit || 'item',
    provider_id: product.providerId,
    providerName: product.providerName || 'Unknown',
  })

  showToast(
    `${qty.value} item(s) added to cart`
  )
}

const submitReview = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/user/login')
    return
  }

  if (
    !newReview.rating ||
    !newReview.body.trim()
  ) {
    showToast(
      'Please enter review and rating'
    )
    return
  }

  try {
    await reviewStore.createReview({
      rating: newReview.rating,
      feedback: newReview.body,
      productId: product.id,
    })

    // Reload reviews from backend
    await loadReviews()

    newReview.rating = 0
    newReview.body = ''
    showReviewForm.value = false

    showToast('Review submitted!')
  } catch (err) {
    console.error('Failed to submit review:', err)
    showToast('Failed to submit review. Please try again.')
  }
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
  .page { padding: 16px 16px 40px; }
  .pd-top { grid-template-columns: 1fr; gap: 20px; }
  .pd-gallery { padding: 20px; border-right: none; border-bottom: 1px solid var(--bd); }
  .pd-info { padding: 24px 20px; gap: 12px; }
  .pd-name { font-size: 24px; }
  .pd-price { font-size: 28px; }
  .pd-desc { font-size: 13px; }
  .pd-actions { gap: 10px; }
  .add-btn { height: 40px; font-size: 14px; }
  .wish-btn { width: 40px; height: 40px; }
  .wish-btn svg { width: 16px; }
  
  .nav { padding: 0 16px; }
  .nav-links { gap: 16px; margin-right: 16px; }
  .nav-links a { font-size: 12px; }
  
  .tab-nav { padding: 0 16px; }
  .tab-btn { padding: 12px 16px; font-size: 13px; }
  
  .cul-grid { grid-template-columns: 1fr; gap: 24px; }
  .nutrition { padding: 16px; }
  
  .rev-summary { grid-template-columns: 100px 1fr; gap: 20px; padding: 20px; }
  .rev-num { font-size: 36px; }
}

@media (max-width: 480px) {
  .page { padding: 12px 12px 30px; }
  .breadcrumb { font-size: 11px; margin-bottom: 16px; }
  .pd-gallery { padding: 16px; gap: 10px; }
  .pd-main { aspect-ratio: 1/1; }
  .pd-thumbs { gap: 8px; }
  .pd-thumb { width: 56px; height: 56px; }
  .pd-info { padding: 16px; gap: 10px; }
  .pd-farm { font-size: 10px; }
  .pd-name { font-size: 20px; margin-bottom: 8px; }
  .pd-rating-row { gap: 8px; }
  .pd-rating-row .stars { gap: 2px; }
  .st { width: 12px; height: 12px; }
  .pd-price-row { gap: 8px; }
  .pd-price { font-size: 24px; }
  .pd-orig { font-size: 13px; }
  .pd-off { font-size: 10px; padding: 3px 8px; }
  .pd-weight { font-size: 12px; }
  .pd-provider { font-size: 12px; margin-top: 8px; color: var(--t2); }
  .pd-desc { font-size: 12px; line-height: 1.5; }
  
  .qty { border-radius: 8px; }
  .qty button { width: 32px; height: 32px; font-size: 16px; }
  .qty span { width: 28px; font-size: 13px; }
  .add-btn { height: 38px; font-size: 13px; }
  .wish-btn { width: 38px; height: 38px; }
  .wish-btn svg { width: 14px; }
  
  .nav { height: 50px; padding: 0 12px; }
  .nav-logo { font-size: 16px; }
  .nav-links { display: none; }
  .nav-cart { padding: 6px 14px; font-size: 12px; }
  
  .tab-nav { padding: 0 12px; overflow-x: auto; }
  .tab-btn { padding: 10px 12px; font-size: 12px; white-space: nowrap; }
  
  .tab-pane { padding: 16px; }
  .cul-title { font-size: 18px; }
  .cul-body { font-size: 13px; }
  .benefit { gap: 8px; font-size: 12px; }
  .ben-ico { width: 16px; height: 16px; }
  .ben-ico svg { width: 8px; }
  
  .rev-summary { grid-template-columns: 80px 1fr; gap: 16px; padding: 16px; }
  .rev-num { font-size: 28px; }
  .rev-stars-big { gap: 2px; }
  .rsb { width: 12px; height: 12px; }
  .bar-row { gap: 8px; margin-bottom: 3px; }
  .bar-lbl { font-size: 11px; width: 20px; }
  .bar-n { font-size: 11px; }
  
  .rev-card { padding: 14px; margin-bottom: 10px; }
  .avatar { width: 36px; height: 36px; font-size: 12px; }
  .rev-author { font-size: 12px; }
  .rev-date { font-size: 11px; }
  .rev-title { font-size: 12px; }
  .rev-body { font-size: 12px; line-height: 1.4; }
}

/* 
   TABS 
*/
.pd-tabs { border-top: 1px solid var(--bd); }
.tab-nav { display: flex; border-bottom: 1px solid var(--bd); padding: 0 32px; }
.tab-btn { padding: 14px 20px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: var(--t3); font-weight: 500; transition: var(--tr); }
.tab-btn.active { color: var(--gm); border-bottom-color: var(--gm); }

.tab-pane { display: none; padding: 32px; animation: fadeIn .3s ease; }
.tab-pane.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

/* Culinary Pane */
.cul-grid { display: grid; grid-template-columns: 1fr 250px; gap: 32px; }
.cul-title { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 12px; }
.cul-body { line-height: 1.7; color: var(--t2); font-size: 14px; }
.benefit { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 13.5px; }
.ben-ico { width: 18px; height: 18px; background: var(--gl); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.ben-ico svg { width: 10px; stroke: var(--gm); }

.nutrition { background: var(--gp); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; }
.nutrition h4 { margin-bottom: 12px; font-size: 14px; }
.nrow { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--bd); font-size: 13px; }

/*
   REVIEWS
*/
.rev-summary { display: grid; grid-template-columns: 150px 1fr; gap: 32px; background: var(--gp); padding: 24px; border-radius: 12px; margin-bottom: 24px; }
.rev-num { font-size: 48px; font-family: 'Playfair Display', serif; font-weight: 700; }
.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; cursor: pointer; }
.bar-track { flex: 1; height: 8px; background: var(--gl); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--gm); }

/* Review Table */
.review-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.review-table thead {
  background: var(--gp);
  border-bottom: 2px solid var(--bd);
}

.review-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-table tbody tr {
  border-bottom: 1px solid var(--bd);
  transition: background 0.2s;
}

.review-table tbody tr:hover {
  background: var(--gp);
}

.review-table tbody tr:last-child {
  border-bottom: none;
}

.review-table td {
  padding: 16px;
  vertical-align: top;
}

.user-cell {
  width: 25%;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--t1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-location {
  font-size: 12px;
  color: var(--t3);
  margin-top: 2px;
}

.vbadge {
  font-size: 10px;
  background: var(--gl);
  color: var(--gm);
  padding: 2px 6px;
  border-radius: 10px;
}

.rating-cell {
  width: 15%;
  text-align: center;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 4px;
}

.st {
  width: 14px;
  height: 14px;
}

.st.f {
  fill: var(--amb);
  stroke: var(--amb);
}

.st.e {
  fill: var(--bd);
  stroke: var(--bd);
}

.rating-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--gm);
}

.feedback-cell {
  width: 45%;
}

.feedback-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--t1);
  margin-bottom: 4px;
}

.feedback-body {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.5;
}

.date-cell {
  width: 15%;
  font-size: 13px;
  color: var(--t3);
  white-space: nowrap;
}

/*
   WRITE REVIEW BUTTON
*/
.write-review-btn {
  margin-top: 24px;
  padding: 12px 28px;
  background: #2d6a3f;
  color: #ffffff;
  border: 2px solid #2d6a3f;
  border-radius: 99px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.write-review-btn:hover {
  background: #1b4d2a;
  border-color: #1b4d2a;
  transform: translateY(-1px);
}

.login-prompt {
  margin-top: 24px;
  padding: 16px;
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

/* 
   REVIEW FORM 
*/
.review-form {
  margin-top: 24px;
  padding: 24px;
  background: var(--gp);
  border: 1px solid var(--bd);
  border-radius: 12px;
}
.rf-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 16px;
}
.rf-stars {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.rf-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--t2);
}
.rf-star-row {
  display: flex;
  gap: 4px;
}
.rf-star {
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.rf-star:hover {
  transform: scale(1.15);
}
.rf-star.hover {
  fill: var(--amb);
}
.rf-rating-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--gm);
  margin-left: 8px;
}
.rf-feedback {
  margin-bottom: 14px;
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
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--t1);
  background: var(--wh);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
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
  padding: 12px 28px;
  background: var(--gm);
  color: #fff;
  border: none;
  border-radius: 99px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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

/* 
   TOAST 
*/
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: var(--gd); color: #fff; padding: 12px 24px; border-radius: 99px;
  font-size: 14px; box-shadow: 0 4px 20px rgba(0,0,0,.2);
  transition: all .3s ease; z-index: 1000;
}
.toast.hide { opacity: 0; bottom: 10px; pointer-events: none; }

/* Utility Stars */
.st, .rsb, .rcs { width: 14px; height: 14px; }
.f { fill: var(--amb); }
.e { fill: #dde9e2; }
.cert-ico {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
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
  color: #1a2e1a;
}

.see-all {
  font-family: "DM Serif Display", serif;
  color: rgb(101, 142, 101);
  text-decoration: none;
  font-size: 1.2rem;
}
.section {
  width: 100%;
  padding: 48px 24px;
  box-sizing: border-box;
}
</style>