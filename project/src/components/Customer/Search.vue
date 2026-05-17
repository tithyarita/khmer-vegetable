<template>
  <div class="search-page">
    <div class="search-page-inner">

      <div class="modal-topbar">
        <div class="modal-logo">
          <div class="logo-icon small">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" stroke-width="1.8"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" stroke-width="1.8"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="#fff" stroke-width="1.8"/>
            </svg>
          </div>
          <span class="logo-text" style="font-size:17px">Nest<span class="logo-accent">Mart</span></span>
        </div>
        <button class="close-btn" @click="closeSearch">✕</button>
      </div>

      <!-- Big Search Input -->
      <div class="big-search-wrap">
        <div class="big-search" :class="{ focused: searchFocused }">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#2D7A3A" stroke-width="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="#2D7A3A" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <input
            ref="mainSearch"
            v-model="query"
            type="text"
            placeholder="What are you looking for today?"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <button v-if="query" class="clear-x" @click="query = ''">✕</button>
        </div>
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <!-- LEFT -->
        <div class="left-col">

          <!-- DEFAULT STATE -->
          <template v-if="!query">
            <section class="section">
              <p class="sec-label">POPULAR SEARCHES</p>
              <div class="chips-row">
                <button v-for="tag in popularSearches" :key="tag" class="pop-chip" @click="query = tag">{{ tag }}</button>
              </div>
            </section>

            <section class="section">
              <p class="sec-label">TRENDING NOW</p>
              <div class="trending-grid">
                <div v-for="item in trendingItems" :key="item.id" class="trending-card" @click="goToProduct(item)">
                  <div class="trending-img-box">
                    <img :src="item.img" :alt="item.name" />
                  </div>
                  <p class="t-name">{{ item.name }}</p>
                  <p class="t-price">{{ item.price }}</p>
                </div>
              </div>
            </section>

            <section class="section">
              <p class="sec-label">EXPLORE CATEGORIES</p>
              <div class="cat-grid">
                <div v-for="cat in exploreCategories" :key="cat.name" class="cat-card" @click="query = cat.name">
                  <div class="cat-icon-box">{{ cat.icon }}</div>
                  <p class="c-name">{{ cat.name }}</p>
                  <p class="c-count">{{ cat.count }} items</p>
                </div>
              </div>
            </section>
          </template>

          <!-- SEARCH RESULTS STATE -->
          <template v-else>
            <div class="result-tabs">
              <button class="rtab" :class="{ active: resultTab === 'products' }" @click="resultTab = 'products'">
                Products <span class="rtab-ct">{{ filteredItems.length }}</span>
              </button>
              <button class="rtab" :class="{ active: resultTab === 'farmers' }" @click="resultTab = 'farmers'">
                Farmers <span class="rtab-ct">{{ filteredFarmers.length }}</span>
              </button>
            </div>

            <div v-if="resultTab === 'products'">
              <div v-if="!filteredItems.length" class="empty">
                <p>No products for "<strong>{{ query }}</strong>"</p>
                <button class="clear-q" @click="query=''">Clear search</button>
              </div>
              <div class="r-list">
                <div v-for="item in filteredItems" :key="item.id" class="r-row" @click="goToProduct(item)">
                  <div class="r-emoji">{{ item.emoji }}</div>
                  <div class="r-info">
                    <p class="r-name">{{ item.name }}</p>
                    <p class="r-sub">{{ item.farmer }} · {{ item.category }}</p>
                  </div>
                  <span class="r-price">{{ item.priceLabel }}</span>
                </div>
              </div>
            </div>

            <div v-if="resultTab === 'farmers'">
              <div v-if="!filteredFarmers.length" class="empty">
                <p>No farmers for "<strong>{{ query }}</strong>"</p>
                <button class="clear-q" @click="query=''">Clear search</button>
              </div>
              <div class="r-list">
                <div v-for="f in filteredFarmers" :key="f.id" class="r-row" @click="goToFarmer(f)">
                  <div class="r-avatar" :style="{ background: f.bg }">{{ f.initials }}</div>
                  <div class="r-info">
                    <p class="r-name">
                      {{ f.name }}
                      <svg width="12" height="12" viewBox="0 0 24 24" style="vertical-align:middle;margin-left:3px"><circle cx="12" cy="12" r="10" fill="#2D7A3A"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </p>
                    <p class="r-sub">{{ f.location }} · {{ f.specialties.join(', ') }}</p>
                  </div>
                  <button class="follow-sm" @click.stop="f.following = !f.following">
                    {{ f.following ? 'Following' : 'Follow' }}
                  </button>
                </div>
              </div>
            </div>
          </template>

        </div>

        <!-- RIGHT -->
        <div class="right-col">
          <p class="sec-label">FEATURED LOCAL FARMS</p>
          <div class="farms-list">
            <div v-for="farm in featuredFarms" :key="farm.id" class="farm-row" @click="goToFarmer(farm)">
              <div class="farm-ava" :style="{ background: farm.bg }">{{ farm.initials }}</div>
              <div class="farm-info">
                <p class="farm-name">
                  {{ farm.name }}
                  <svg width="13" height="13" viewBox="0 0 24 24" style="vertical-align:middle;margin-left:3px"><circle cx="12" cy="12" r="10" fill="#2D7A3A"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </p>
                <p class="farm-sub">{{ farm.distance }} · {{ farm.tag }}</p>
              </div>
            </div>
          </div>
          <button class="view-all" @click="$router.push('/farmers')">View all local partners →</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { useSearchStore } from '../../stores/searchStore'

export default {
  name: 'SearchPage',
  setup() {
    const searchStore = useSearchStore()
    return { searchStore }
  },
  data() {
    return {
      searchFocused: false,
      query: '',
      resultTab: 'products',
      popularSearches: ['Heirloom Tomatoes', 'Organic Kale', 'Bell Peppers', 'Bok Choy', 'Spinach'],
      trendingItems: [
        { id: 1, name: 'Purple Carrots', price: '$2.49 / lb', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', emoji: '🥕' },
        { id: 2, name: 'Heirloom Tomatoes', price: '$3.99 / lb', img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80', emoji: '🍅' },
        { id: 3, name: 'Baby Bok Choy', price: '$1.75 / pack', img: 'https://images.unsplash.com/photo-1612257999756-c81e3ecca1e0?w=400&q=80', emoji: '🥬' },
      ],
      exploreCategories: [
        { name: 'Leafy Greens', icon: '🥬', count: 24 },
        { name: 'Root Veggies', icon: '🥕', count: 18 },
        { name: 'Cruciferous', icon: '🥦', count: 12 },
        { name: 'Herbs', icon: '🌿', count: 15 },
        { name: 'Fruits', icon: '🍎', count: 31 },
        { name: 'Grains', icon: '🌾', count: 9 },
      ],
      featuredFarms: [
        { id: 1, name: 'Green Valley Farm', initials: 'GV', bg: '#d1ead6', distance: '2.4 miles away', tag: 'Organic' },
        { id: 2, name: 'Sun-Kissed Acres', initials: 'SK', bg: '#fdeec9', distance: '4.1 miles away', tag: 'Sustainable' },
        { id: 3, name: 'Morning Dew Coop', initials: 'MD', bg: '#ccd9f5', distance: '1.8 miles away', tag: 'Local Best' },
      ],
      allItems: [
        { id: 1, name: 'Cherry Tomatoes', farmer: 'Dara Farm', priceLabel: '$2.50/kg', category: 'Vegetables', emoji: '🍅' },
        { id: 2, name: 'Fresh Spinach', farmer: 'Green Valley', priceLabel: '$1.80/bunch', category: 'Leafy Greens', emoji: '🥬' },
        { id: 3, name: 'Mango', farmer: 'Mekong Harvest', priceLabel: '$3.20/kg', category: 'Fruits', emoji: '🥭' },
        { id: 4, name: 'Jasmine Rice', farmer: 'Rice Kingdom', priceLabel: '$1.50/kg', category: 'Grains', emoji: '🌾' },
        { id: 5, name: 'Lemongrass', farmer: 'Herb Garden', priceLabel: '$0.90/bunch', category: 'Herbs', emoji: '🌿' },
        { id: 6, name: 'Dragon Fruit', farmer: 'Mekong Harvest', priceLabel: '$4.00/kg', category: 'Fruits', emoji: '🐉' },
        { id: 7, name: 'Morning Glory', farmer: 'Green Valley', priceLabel: '$1.20/bunch', category: 'Vegetables', emoji: '🥦' },
        { id: 8, name: 'Kampot Pepper', farmer: 'Kampot Spice', priceLabel: '$8.50/100g', category: 'Herbs', emoji: '🌶️' },
        { id: 9, name: 'Buffalo Milk', farmer: 'Tonle Sap Dairy', priceLabel: '$3.80/ltr', category: 'Dairy', emoji: '🥛' },
        { id: 10, name: 'Purple Carrots', farmer: 'Dara Farm', priceLabel: '$2.49/lb', category: 'Root Veggies', emoji: '🥕' },
        { id: 11, name: 'Heirloom Tomatoes', farmer: 'Green Valley Farm', priceLabel: '$3.99/lb', category: 'Vegetables', emoji: '🍅' },
        { id: 12, name: 'Baby Bok Choy', farmer: 'Morning Dew Coop', priceLabel: '$1.75/pack', category: 'Vegetables', emoji: '🥬' },
        { id: 13, name: 'Organic Kale', farmer: 'Sun-Kissed Acres', priceLabel: '$2.20/bunch', category: 'Leafy Greens', emoji: '🥗' },
        { id: 14, name: 'Bell Peppers', farmer: 'Dara Farm', priceLabel: '$1.90/kg', category: 'Vegetables', emoji: '🫑' },
      ],
      farmers: [
        { id: 1, name: 'Dara Farm', initials: 'DF', bg: '#d1ead6', location: 'Takeo Province', specialties: ['Vegetables', 'Organic'], following: false },
        { id: 2, name: 'Green Valley Farm', initials: 'GV', bg: '#d1ead6', location: 'Kampong Speu', specialties: ['Vegetables', 'Herbs'], following: true },
        { id: 3, name: 'Mekong Harvest', initials: 'MH', bg: '#fdeec9', location: 'Kampong Cham', specialties: ['Fruits', 'Tropical'], following: false },
        { id: 4, name: 'Rice Kingdom', initials: 'RK', bg: '#eeeee8', location: 'Battambang', specialties: ['Grains', 'Rice'], following: false },
        { id: 5, name: 'Herb Garden', initials: 'HG', bg: '#d6f0dc', location: 'Siem Reap', specialties: ['Herbs', 'Spices'], following: false },
        { id: 6, name: 'Kampot Spice', initials: 'KS', bg: '#ffe5cc', location: 'Kampot Province', specialties: ['Spices', 'Organic'], following: true },
        { id: 7, name: 'Sun-Kissed Acres', initials: 'SK', bg: '#fdeec9', location: 'Kandal Province', specialties: ['Sustainable', 'Vegetables'], following: false },
        { id: 8, name: 'Morning Dew Coop', initials: 'MD', bg: '#ccd9f5', location: 'Siem Reap', specialties: ['Local Best', 'Mixed'], following: false },
      ],
    }
  },
  computed: {
    filteredItems() {
      if (!this.query.trim()) return []
      const q = this.query.toLowerCase()
      return this.allItems.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.farmer.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      )
    },
    filteredFarmers() {
      if (!this.query.trim()) return []
      const q = this.query.toLowerCase()
      return this.farmers.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.specialties.some(s => s.toLowerCase().includes(q))
      )
    },
  },
  watch: {
    query(v) { if (v) this.resultTab = 'products' },
  },
  methods: {
    closeSearch() { this.$router.push('/home') },
    goToProduct(item) { this.$router.push(`/product/${item.id}`) },
    goToFarmer(f) { this.$router.push(`/farmers/${f.id}`) },
  },
  mounted() {
    if (this.searchStore.query) {
      this.query = this.searchStore.query
    }
    this.$nextTick(() => this.$refs.mainSearch?.focus())
  },
}
</script>

<style scoped>
* { box-sizing: border-box; }
:global(body) { margin: 0; overflow-x: hidden; }

/* ===== PAGE ===== */
.search-page {
  background: #fff; min-height: 100vh;
  display: flex; justify-content: center;
  padding: 40px 20px;
}

.search-page-inner {
  width: 100%; max-width: 1100px;
}

.modal-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 30px;
}
.modal-logo { display: flex; align-items: center; gap: 8px; }
.close-btn {
  width: 32px; height: 32px; border-radius: 50%; background: #f3f4f6;
  border: none; font-size: 14px; color: #6b7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover { background: #e5e7eb; color: #1f2937; }

/* big search */
.big-search-wrap { margin-bottom: 38px; }
.big-search {
  display: flex; align-items: center; gap: 14px;
  border: 2px solid #e0e0e0; border-radius: 16px;
  padding: 16px 22px; background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.big-search.focused { border-color: #2D7A3A; box-shadow: 0 0 0 4px rgba(45,122,58,0.09); }
.big-search input {
  flex: 1; border: none; outline: none;
  font-size: 20px; color: #1f2937; background: transparent; font-family: inherit;
}
.big-search input::placeholder { color: #b0b7bf; }
.clear-x { background: none; border: none; font-size: 16px; color: #b0b7bf; cursor: pointer; padding: 0; }
.clear-x:hover { color: #374151; }

/* body columns */
.modal-body { display: grid; grid-template-columns: 1fr 260px; gap: 56px; align-items: start; }

/* section label */
.sec-label { font-size: 11px; font-weight: 700; color: #adb5bd; letter-spacing: 1.3px; margin: 0 0 16px; }
.section { margin-bottom: 36px; }

/* popular chips */
.chips-row { display: flex; gap: 8px; flex-wrap: wrap; }
.pop-chip {
  padding: 7px 16px; border-radius: 999px; border: 1.5px solid #e5e7eb;
  background: #fff; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.18s;
}
.pop-chip:hover { border-color: #2D7A3A; color: #2D7A3A; background: #f0faf2; }

/* trending */
.trending-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.trending-card { cursor: pointer; }
.trending-card:hover .trending-img-box img { transform: scale(1.04); }
.trending-img-box {
  width: 100%; aspect-ratio: 4/3; border-radius: 12px;
  overflow: hidden; background: #f0f0ec; margin-bottom: 10px;
}
.trending-img-box img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
.t-name { margin: 0 0 3px; font-size: 14px; font-weight: 600; color: #1f2937; }
.t-price { margin: 0; font-size: 13px; color: #2D7A3A; font-weight: 600; }

/* categories */
.cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cat-card {
  background: #f9fafb; border-radius: 14px; padding: 18px 10px;
  text-align: center; cursor: pointer; border: 1.5px solid #f0f0f0;
  transition: all 0.18s;
}
.cat-card:hover { border-color: #2D7A3A; background: #f0faf2; }
.cat-icon-box { font-size: 28px; margin-bottom: 8px; }
.c-name { margin: 0 0 3px; font-size: 13px; font-weight: 600; color: #1f2937; }
.c-count { margin: 0; font-size: 11px; color: #adb5bd; }

/* result tabs */
.result-tabs { display: flex; gap: 6px; margin-bottom: 22px; }
.rtab {
  display: flex; align-items: center; gap: 7px; padding: 8px 18px;
  border-radius: 999px; border: 1.5px solid #e5e7eb; background: #fff;
  font-size: 13px; color: #6b7280; cursor: pointer; transition: all 0.18s;
}
.rtab.active { background: #2D7A3A; color: #fff; border-color: #2D7A3A; }
.rtab-ct { background: rgba(255,255,255,0.25); border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 600; }
.rtab:not(.active) .rtab-ct { background: #f3f4f6; color: #6b7280; }

/* results list */
.r-list { display: flex; flex-direction: column; }
.r-row {
  display: flex; align-items: center; gap: 13px;
  padding: 11px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s;
}
.r-row:hover { background: #f6fbf7; }
.r-emoji { width: 44px; height: 44px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.r-avatar { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #2D7A3A; flex-shrink: 0; }
.r-info { flex: 1; min-width: 0; }
.r-name { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #1f2937; }
.r-sub { margin: 0; font-size: 12px; color: #adb5bd; }
.r-price { font-size: 13px; font-weight: 600; color: #2D7A3A; white-space: nowrap; }
.follow-sm {
  padding: 4px 12px; border-radius: 999px; border: 1.5px solid #2D7A3A;
  background: #fff; color: #2D7A3A; font-size: 11px; font-weight: 600;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.follow-sm:hover { background: #2D7A3A; color: #fff; }

/* empty */
.empty { text-align: center; padding: 48px 20px; color: #adb5bd; }
.empty p { font-size: 14px; margin: 0 0 16px; }
.empty strong { color: #374151; }
.clear-q { background: #2D7A3A; color: #fff; border: none; padding: 8px 20px; border-radius: 999px; font-size: 13px; cursor: pointer; }
.clear-q:hover { background: #1a5c27; }

/* right col */
.farms-list { display: flex; flex-direction: column; gap: 22px; margin-bottom: 22px; }
.farm-row {
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; padding: 4px 6px; border-radius: 10px; transition: background 0.15s;
}
.farm-row:hover { background: #f6fbf7; }
.farm-ava { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #2D7A3A; flex-shrink: 0; }
.farm-info { flex: 1; }
.farm-name { margin: 0 0 3px; font-size: 14px; font-weight: 600; color: #1f2937; }
.farm-sub { margin: 0; font-size: 12px; color: #adb5bd; }
.view-all { background: none; border: none; color: #2D7A3A; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }
.view-all:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .search-page { padding: 20px 16px; }
  .modal-body { grid-template-columns: 1fr; gap: 32px; }
  .trending-grid { grid-template-columns: repeat(2, 1fr); }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>