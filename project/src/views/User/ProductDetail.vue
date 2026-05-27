<template>
  <div class="shop-wrapper">
    <NavigationBar />

    <main class="page">
      <!-- BREADCRUMB -->
      <nav class="breadcrumb">
        <a href="/">{{ t('home') }}</a>
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
          <!-- Gallery -->
          <div class="pd-gallery">
            <div class="pd-main">
              <img :src="product.images[activeIdx]" :alt="product.name" />

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

            <div class="pd-price-row">
              <span class="pd-price">
                ${{ product.price.toFixed(2) }}
              </span>

              <span class="pd-orig">
                ${{ product.originalPrice.toFixed(2) }}
              </span>

              <span class="pd-off" v-if="product.discount > 0">
                {{ product.discount }}% OFF
              </span>
            </div>

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

            <p class="pd-desc">
              {{ product.description }}
            </p>

            <!-- ACTIONS -->
            <div class="pd-actions">
              <div class="qty">
                <button @click="qty = Math.max(1, qty - 1)">−</button>

                <span>{{ qty }}</span>

                <button @click="qty++">+</button>
              </div>

              <button class="add-btn" @click="addToCart">
                {{ t('addToCart') }}
              </button>

              <button
                class="wish-btn"
                :class="{ liked: wished }"
                @click="wished = !wished"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </button>
            </div>

            <!-- CERTS -->
            <div class="pd-certs">
              <div class="cert">
                <div class="cert-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    />
                  </svg>
                </div>

                {{ t('soilAssociation') }}
              </div>

              <div class="cert">
                <div class="cert-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="1" y="3" width="15" height="13" />
                    <path d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>

                {{ t('sameDayDelivery') }}
              </div>
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
              {{ t('reviews') }}
              ({{ reviews.length }})
            </button>
          </div>

          <!-- Culinary -->
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
                    class="benefit"
                    v-for="b in product.benefits"
                    :key="b"
                  >
                    <div class="ben-ico">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <span>{{ b }}</span>
                  </div>
                </div>
              </div>

              <div class="nutrition">
                <h4>{{ t('nutritionalFacts') }}</h4>

                <div
                  class="nrow"
                  v-for="n in product.nutrition"
                  :key="n.label"
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
            <div class="rev-wrap">
              <!-- SUMMARY -->
              <div class="rev-summary">
                <div class="rev-score">
                  <div class="rev-num">
                    {{ avgRating }}
                  </div>

                  <div class="rev-stars-big">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      class="rsb"
                      :class="i <= Math.round(avgRating) ? 'f' : 'e'"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.55.53-3.09L1.5 4.27l3.11-.45L6 1z"
                      />
                    </svg>
                  </div>

                  <div class="rev-ct">
                    {{ reviews.length }}
                    {{ t('reviews') }}
                  </div>
                </div>

                <div class="bars">
                  <div
                    class="bar-row"
                    v-for="s in [5,4,3,2,1]"
                    :key="s"
                    @click="filterStar = (filterStar === s ? null : s)"
                  >
                    <span class="bar-lbl">{{ s }}★</span>

                    <div class="bar-track">
                      <div
                        class="bar-fill"
                        :style="{ width: getStarPercentage(s) + '%' }"
                      ></div>
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
                  class="rev-card"
                  v-for="rv in filteredReviews"
                  :key="rv.id"
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
                    {{ t('yourRating') }}:
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
                  <span class="rf-rating-text" v-if="newReview.rating > 0">
                    {{ newReview.rating }} star{{ newReview.rating > 1 ? 's' : '' }}
                  </span>
                </div>

                <textarea
                  v-model="newReview.body"
                  class="rf-textarea"
                  :placeholder="t('writeYourReview')"
                  rows="4"
                ></textarea>

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
      </div>
    </main>

    <!-- TOAST -->
    <div class="toast" :class="{ hide: !toast.show }">
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
import Card from '@/components/Customer/Card.vue'
import Footer from '@/components/Customer/Footer.vue'
import NavigationBar from '@/components/Customer/NavigationBar.vue'

import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'

import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

// YOUR OLD SCRIPT CONTINUES HERE...

const placeholderImage =
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&q=80&w=800';

const product = reactive({
  id: null,
  name: 'Loading product...',
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
});

const applyProduct = (data) => {
  if (!data) return;

  const price = Number(data.price || 0);
  const discount = Number(data.discount || data.discountPercentage || 0);
  const originalPrice = Number(data.originalPrice || price);
  const image = data.image || data.imageUrl || placeholderImage;

  Object.assign(product, {
    id: data.id,
    name: data.name || 'Untitled product',
    price,
    discount,
    originalPrice,
    stock: Number(data.stock ?? 0),
    providerId: data.provider?.user_id || data.provider_id || data.providerId || null,
    providerName: data.provider?.provider_name || data.providerName || data.provider?.name || 'Unknown',
    weight: data.weight || `${Number(data.stock || 0)} in stock`,
    description: data.description || '',
    culinaryBody:
      data.description ||
      'Fresh product information is loaded from the backend for this item.',
    benefits: data.benefits || ['Fresh from local farms', 'Loaded from backend'],
    nutrition: data.nutrition || [],
    images: [image],
  });
};

const loadProduct = async () => {
  const id = route.params.id;
  const data = await productStore.fetchProductById(id);
  applyProduct(data);
  activeIdx.value = 0;
};

// --- REVIEWS DATA ---
const reviews = ref([
  { id: 1, author: "Sophie K.", initials: "SK", color: "#2d6a3f", rating: 5, date: "Oct 24, 2025", location: "Paris, FR", verified: true, title: "Absolutely Stunning!", body: "The fractals were perfect and it tasted so sweet when roasted." },
  { id: 2, author: "Marc L.", initials: "ML", color: "#a3c585", rating: 4, date: "Oct 20, 2025", location: "Lyon, FR", verified: true, title: "Great Quality", body: "Very fresh, though slightly smaller than expected." }
]);

// --- STATE ---
const activeTab = ref('culinary');
const activeIdx = ref(0);
const qty = ref(1);
const cartCount = ref(0);
const cartBump = ref(false);
const wished = ref(false);
const filterStar = ref(null);
const toast = reactive({ show: false, msg: "" });
const newReview = reactive({ rating: 0, body: '' });
const hoverRating = ref(0);

// --- COMPUTED ---
const discPct = computed(() => Number(product.discount || 0));

const avgRating = computed(() => {
  if (!reviews.value.length) return 0;
  const total = reviews.value.reduce((acc, curr) => acc + curr.rating, 0);
  return (total / reviews.value.length).toFixed(1);
});

const filteredReviews = computed(() => {
  if (!filterStar.value) return reviews.value;
  return reviews.value.filter(r => r.rating === filterStar.value);
});

// --- METHODS ---
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
  });

  cartCount.value += qty.value;
  cartBump.value = true;
  showToast(`${qty.value} items added to your basket`);
  setTimeout(() => (cartBump.value = false), 300);
};

const showToast = (msg) => {
  toast.msg = msg;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
};

const getStarCount = (s) => reviews.value.filter(r => r.rating === s).length;
const getStarPercentage = (s) => (getStarCount(s) / reviews.value.length) * 100;

const submitReview = () => {
  if (!newReview.rating || !newReview.body.trim()) {
    showToast('Please write a review and select a rating')
    return
  }
  const colors = ['#2d6a3f', '#a3c585', '#e8a87c', '#6b8e6b', '#c9a87c']
  reviews.value.unshift({
    id: Date.now(),
    author: 'Anonymous',
    initials: 'AN',
    color: colors[Math.floor(Math.random() * colors.length)],
    rating: newReview.rating,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    location: 'Phnom Penh, KH',
    verified: false,
    title: 'Customer Review',
    body: newReview.body,
  })
  newReview.rating = 0
  newReview.body = ''
  showToast('Your review has been submitted!')
}

watch(
  () => route.params.id,
  () => {
    loadProduct();
  },
  { immediate: true }
)

</script>

<style scoped>
/* 
   COLORS & VARIABLES 
*/
.shop-wrapper {
  --gd: #1a3d28; --gm: #2d6a3f; --ga: #3a8f52; --gl: #e6f4eb; --gp: #f3faf5;
  --amb: #f5a623; --red: #e85a2d; --t1: #16261e; --t2: #435c4e; --t3: #8aa898;
  --bd: #d8e8de; --wh: #ffffff;
  --ss: 0 2px 10px rgba(26,61,40,.07);
  --sm: 0 6px 28px rgba(26,61,40,.11);
  --r: 16px; --tr: .2s cubic-bezier(.4,0,.2,1);
  
  font-family: 'DM Sans', sans-serif;
  color: var(--t1);
  background: #edf4ef;
  min-height: 100vh;
}

/* 
   NAVIGATION 
*/
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--bd);
  padding: 0 32px;
  display: flex; align-items: center; height: 56px;
}
.nav-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--gm); margin-right: auto; }
.nav-links { display: flex; gap: 28px; margin-right: 32px; }
.nav-links a { font-size: 13px; font-weight: 500; color: var(--t2); text-decoration: none; transition: color var(--tr); }
.nav-links a:hover { color: var(--gm); }

.nav-cart {
  display: flex; align-items: center; gap: 8px;
  background: var(--gm); color: #fff;
  border: none; border-radius: 99px;
  padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
  position: relative; transition: background var(--tr);
}
.cart-badge {
  position: absolute; top: -6px; right: -6px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--amb); color: #fff; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
}
.cart-badge.bump { animation: bump .3s ease; }
@keyframes bump { 50% { transform: scale(1.4); } }

/* 
   PRODUCT LAYOUT 
*/
.page { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }
.breadcrumb { display: flex; gap: 6px; font-size: 13px; color: var(--t3); margin-bottom: 20px; }
.breadcrumb a { color: var(--t2); text-decoration: none; }

.pd-card {
  background: var(--wh); border-radius: var(--r);
  box-shadow: var(--sm); border: 1px solid var(--bd);
  overflow: hidden; animation: up .5s ease both;
}
@keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.pd-top { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; }

/* Gallery */
.pd-gallery { padding: 28px; display: flex; flex-direction: column; gap: 14px; background: var(--gp); border-right: 1px solid var(--bd); }
.pd-main { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3; }
.pd-main img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.pd-main:hover img { transform: scale(1.04); }
.pd-seasonal { position: absolute; top: 14px; left: 14px; background: var(--amb); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 11px; border-radius: 99px; text-transform: uppercase; }
.pd-thumbs { display: flex; gap: 10px; }
.pd-thumb { width: 68px; height: 68px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: var(--tr); }
.pd-thumb.active { border-color: var(--gm); box-shadow: 0 0 0 3px rgba(45,106,63,.15); }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* Info */
.pd-info { padding: 32px 36px; display: flex; flex-direction: column; gap: 16px; }
.pd-farm { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--ga); letter-spacing: .12em; }
.pd-name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--t1); }
.pd-price-row { display: flex; align-items: center; gap: 12px; }
.pd-price { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--gm); font-weight: 700; }
.pd-orig { color: var(--t3); text-decoration: line-through; }
.pd-off { background: #fff0e8; color: var(--red); font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 99px; }

.pd-actions { display: flex; gap: 12px; align-items: center; margin-top: 10px; }
.qty { display: flex; align-items: center; border: 1.5px solid var(--bd); border-radius: 99px; }
.qty button { width: 36px; height: 36px; border: none; background: none; cursor: pointer; font-size: 18px; }
.qty span { width: 32px; text-align: center; font-weight: 600; }

.add-btn { flex: 1; height: 44px; background: var(--gm); color: #fff; border: none; border-radius: 99px; font-weight: 600; cursor: pointer; transition: var(--tr); }
.add-btn:hover { background: var(--gd); transform: translateY(-1px); }

.wish-btn { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--bd); background: var(--gp); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.wish-btn svg { width: 18px; stroke: var(--t2); fill: none; stroke-width: 2; transition: var(--tr); }
.wish-btn.liked svg { fill: var(--red); stroke: var(--red); }

/* Certificates */
.pd-certs { display: flex; gap: 40px; margin-top: 24px; align-items: flex-start; }
.cert { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 220px; }
.cert-ico { width: 56px; height: 56px; border-radius: 50%; background: var(--gl); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cert-ico svg { width: 24px; height: 24px; stroke: var(--gm); stroke-width: 2; fill: var(--gm); }
.cert { font-size: 13px; font-weight: 500; color: var(--t2); letter-spacing: .5px; text-transform: uppercase; }

@media (max-width: 1024px) {
  .pd-top { grid-template-columns: 1fr 1fr; gap: 30px; }
  .pd-gallery { padding: 24px; }
  .pd-info { padding: 28px 30px; gap: 14px; }
  .pd-name { font-size: 28px; }
  .pd-price { font-size: 32px; }
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

.rev-card { border: 1px solid var(--bd); padding: 20px; border-radius: 12px; margin-bottom: 12px; background: #fff; }
.rev-head { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
.rev-author { font-weight: 600; font-size: 14px; }
.vbadge { font-size: 10px; background: var(--gl); color: var(--gm); padding: 2px 6px; border-radius: 10px; }

/* 
   REVIEW FORM 
*/
.review-form {
  margin-top: 28px;
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