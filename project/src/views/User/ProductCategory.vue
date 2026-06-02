<template>
  <div class="category-page">
    <NavigationBar />

    <div class="category-content">

      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/">
          {{ t('home') }}
        </router-link>

        <span class="sep">›</span>

        <span class="cur">
          {{ categoryIcon }} {{ categoryName }}
        </span>
      </nav>

      <!-- Header -->
      <div class="header">

        <div>
          <h1>{{ categoryName }}</h1>

          <p class="subtitle">
            {{ t('foundItems') }}
            <em>{{ filteredProducts.length }}</em>
            {{ t('items') }}
          </p>
        </div>

        <!-- Controls -->
        <div class="header-controls">

          <!-- Search -->
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchProducts')"
            />
          </div>

          <!-- Sort -->
          <select
            class="sort-select"
            v-model="sortBy"
          >
            <option value="featured">
              {{ t('featured') }}
            </option>

            <option value="price-asc">
              {{ t('priceLowHigh') }}
            </option>

            <option value="price-desc">
              {{ t('priceHighLow') }}
            </option>
          </select>

        </div>
      </div>

      <!-- Mobile filter toggle -->
      <button class="filter-toggle" @click="showSidebar = !showSidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
        </svg>
        {{ t('filter') }}
      </button>

      <!-- Main -->
      <div class="main-content">

        <!-- Sidebar -->
        <aside class="sidebar" :class="{ open: showSidebar }">
          <div class="sidebar-backdrop" @click="showSidebar = false" />

          <div class="sidebar-section">

            <h3>{{ t('category') }}</h3>

            <div class="category-list">

              <div
                v-for="cat in allCategories"
                :key="cat.value"
                class="cat-item"
                :class="{ active: activeCategory === cat.value }"
                @click="toggleCategory(cat.value)"
              >
                <span class="cat-icon">
                  {{ cat.icon }}
                </span>

                <span class="cat-name">
                  {{ cat.name }}
                </span>
              </div>

            </div>
          </div>

          <!-- Price -->
          <div class="sidebar-section">

            <h3>{{ t('price') }}</h3>

            <input
              type="range"
              min="0"
              max="150"
              v-model="maxPrice"
              class="price-slider"
            />

            <div class="price-range">
              {{ t('range') }}:
              <strong>$0 - ${{ maxPrice }}</strong>
            </div>

            <button
              class="filter-btn"
              @click="applyFilter"
            >
              {{ t('filter') }}
            </button>

          </div>

          <!-- Tags -->
          <div class="sidebar-section">

            <h3>{{ t('popularTags') }}</h3>

            <div class="tags">

              <span
                v-for="tag in tags"
                :key="tag"
                class="tag"
                :class="{ active: activeTag === tag }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </span>

            </div>
          </div>

        </aside>

        <!-- Products -->
        <div class="products-section">

          <div
            v-if="loading"
            class="no-results"
          >
            {{ t('loading') }}
          </div>

          <Card
            v-else
            :products="paginatedProducts"
          />

          <!-- Empty -->
          <div
            v-if="!loading && paginatedProducts.length === 0"
            class="no-results"
          >
            {{ t('noProducts') }}
          </div>

          <!-- Pagination -->
          <div
            class="pagination"
            v-if="totalPages > 1"
          >

            <button
              @click="prevPage"
              :disabled="page === 1"
            >
              ‹
            </button>

            <button
              v-for="n in totalPages"
              :key="n"
              :class="['page-btn', { active: page === n }]"
              @click="goToPage(n)"
            >
              {{ n }}
            </button>

            <button
              @click="nextPage"
              :disabled="page === totalPages"
            >
              ›
            </button>

          </div>

        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Card from '../../components/Customer/Card.vue'
import Footer from '../../components/Customer/Footer.vue'
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'

const languageStore = useLanguageStore()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const t = (key) =>
  messages?.[languageStore.language]?.[key] || key

const showSidebar = ref(false)
const sortBy = ref('featured')
const maxPrice = ref(150)
const appliedMaxPrice = ref(150)
const activeCategory = ref(null)
const activeTag = ref(null)
const searchQuery = ref('')
const page = ref(1)
const perPage = ref(6)
const loading = ref(false)

const tags = ['Organic', 'Fresh', 'Healthy', 'Snacks', 'Dairy']

const allCategories = [
  { value: 'vegetables', name: 'Vegetables', icon: '🫑' },
  { value: 'leafy-greens', name: 'Leafy Greens', icon: '🥬' },
  { value: 'tubers', name: 'Tubers', icon: '🥔' },
  { value: 'root-veg', name: 'Root Veg', icon: '🥕' },
  { value: 'cruciferous', name: 'Cruciferous', icon: '🥦' },
  { value: 'fruits', name: 'Fruits', icon: '🍎' },
  { value: 'herbs', name: 'Herbs', icon: '🌿' },
]

const categoryMap = {
  vegetables: 'Vegetables',
  greens: 'Leafy Greens',
  tubers: 'Tubers',
  'root veg': 'Root Veg',
  'root-veg': 'Root Veg',
  cruciferous: 'Cruciferous',
  fruits: 'Fruits',
  herbs: 'Herbs',
}

const categoryType = computed(() =>
  decodeURIComponent(route.params.type || '').toLowerCase()
)

const categoryName = computed(() =>
  categoryMap[categoryType.value] ||
  route.params.type ||
  'Products'
)

const categoryIcon = computed(() => {
  const cat = allCategories.find(
    c => c.value === categoryType.value
  )

  return cat?.icon || ''
})

const filteredProducts = computed(() => {
  let list = productStore.products.filter(p => {
    const cat = (p.category || '').toLowerCase()

    const catMatch =
      !categoryType.value ||
      cat === categoryType.value ||
      cat === categoryName.value.toLowerCase()

    const priceMatch =
      parseFloat(p.price || 0) <= appliedMaxPrice.value

    const categoryFilterMatch =
      !activeCategory.value ||
      cat === activeCategory.value

    const tagMatch =
      !activeTag.value ||
      (p.name || '')
        .toLowerCase()
        .includes(activeTag.value.toLowerCase())

    const searchMatch =
      !searchQuery.value ||
      (p.name || '')
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    return (
      catMatch &&
      priceMatch &&
      categoryFilterMatch &&
      tagMatch &&
      searchMatch
    )
  })

  if (sortBy.value === 'price-asc') {
    list.sort(
      (a, b) =>
        parseFloat(a.price || 0) -
        parseFloat(b.price || 0)
    )
  }

  if (sortBy.value === 'price-desc') {
    list.sort(
      (a, b) =>
        parseFloat(b.price || 0) -
        parseFloat(a.price || 0)
    )
  }

  return list
})

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      filteredProducts.value.length / perPage.value
    )
  )
)

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage.value

  return filteredProducts.value.slice(
    start,
    start + perPage.value
  )
})

watch(
  [sortBy, activeTag, appliedMaxPrice],
  () => {
    page.value = 1
  }
)

watch(
  () => route.params.type,
  () => {
    page.value = 1
    activeCategory.value = null
    activeTag.value = null
  }
)

onMounted(async () => {
  loading.value = true

  try {
    await productStore.fetchAllProducts()
  } finally {
    loading.value = false
  }
})

function toggleCategory(value) {
  activeCategory.value =
    activeCategory.value === value
      ? null
      : value

  page.value = 1
}

function toggleTag(tag) {
  activeTag.value =
    activeTag.value === tag
      ? null
      : tag

  page.value = 1
}

function applyFilter() {
  appliedMaxPrice.value = maxPrice.value
}

function prevPage() {
  if (page.value > 1) {
    page.value--
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
  }
}

function goToPage(n) {
  page.value = n
}
</script>



<style scoped>
.category-page {
  --gd: #1a3d28; --gm: #2d6a3f; --ga: #3a8f52; --gl: #e6f4eb; --gp: #f3faf5;
  --amb: #f5a623; --red: #e85a2d; --t1: #16261e; --t2: #435c4e; --t3: #8aa898;
  --bd: #d8e8de; --wh: #ffffff;
  --ss: 0 2px 10px rgba(26,61,40,.07);
  --sm: 0 6px 28px rgba(26,61,40,.11);
  --r: 16px; --tr: .2s cubic-bezier(.4,0,.2,1);
  background: #edf4ef;
  min-height: 100vh;
}

.category-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  font-family: 'DM Sans', sans-serif;
  color: var(--t1);
}

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

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 30px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: var(--t1);
  font-family: 'Playfair Display', serif;
}

.subtitle { color: var(--t3); margin-top: 4px; }

.header-controls { display: flex; align-items: center; gap: 10px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f6f5;
  border: 1.5px solid #e2e8e6;
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s, background 0.2s;
}
.search-box:focus-within {
  border-color: #52b788;
  background: #fff;
}
.search-box svg { color: #8aa898; flex-shrink: 0; }
.search-box input {
  border: none;
  background: none;
  outline: none;
  padding: 9px 0;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #16261e;
  width: 180px;
}
.search-box input::placeholder { color: #8aa898; }

.sort-select {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--bd);
  background: var(--wh);
  font-family: 'DM Sans', sans-serif;
  color: var(--t2);
}

.main-content { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }

.sidebar-section {
  background: var(--wh);
  padding: 18px;
  border-radius: var(--r);
  margin-bottom: 20px;
  box-shadow: var(--ss);
  border: 1px solid var(--bd);
}

.sidebar-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--t1); }

.cat-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--tr);
}

.cat-item:hover, .cat-item.active { background: var(--gl); }
.cat-icon { margin-right: 10px; }
.cat-name { flex: 1; color: var(--t2); }

.price-slider { width: 100%; margin: 10px 0; accent-color: var(--gm); }
.price-range { font-size: 14px; color: var(--t2); }

.filter-btn {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 999px;
  background: var(--gm);
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  transition: var(--tr);
}
.filter-btn:hover { background: var(--gd); }

.tags { display: flex; flex-wrap: wrap; gap: 6px; }

.tag {
  padding: 5px 12px;
  background: var(--gl);
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  color: var(--t2);
  transition: var(--tr);
}

.tag.active, .tag:hover { background: var(--gm); color: white; }

.products-section { width: 100%; }

.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 30px;
}

.pagination button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--bd);
  background: var(--wh);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  color: var(--t2);
  transition: var(--tr);
}

.pagination button.active { background: var(--gm); color: white; border-color: var(--gm); }
.pagination button:hover:not(.active) { border-color: var(--ga); }

.no-results { text-align: center; padding: 60px; color: var(--t3); }

.filter-toggle {
  display: none;
}

@media (max-width: 992px) {
  .main-content { grid-template-columns: 1fr; }

  .header { flex-direction: column; align-items: flex-start; }

  .header-controls { width: 100%; flex-wrap: wrap; }

  .search-box { flex: 1; min-width: 0; }
  .search-box input { width: 100%; }

  .sidebar {
    position: fixed;
    top: 0;
    left: -300px;
    width: 280px;
    height: 100vh;
    z-index: 200;
    background: #fff;
    padding: 20px;
    overflow-y: auto;
    transition: left 0.25s ease;
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  }

  .sidebar.open { left: 0; }

  .sidebar-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: -1;
  }

  .sidebar.open .sidebar-backdrop { display: block; }

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    margin-bottom: 16px;
    border: 1.5px solid var(--bd);
    border-radius: 10px;
    background: var(--wh);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--t2);
    transition: var(--tr);
  }

  .filter-toggle:hover { border-color: var(--ga); color: var(--gm); }

  .pagination button { width: 32px; height: 32px; font-size: 13px; }
}

@media (max-width: 600px) {
  .category-content { padding: 16px 12px 40px; }

  h1 { font-size: 22px; }

  .header-controls { gap: 6px; }

  .sort-select { padding: 6px 10px; font-size: 12px; }

  .pagination { gap: 4px; }

  .pagination button { width: 28px; height: 28px; font-size: 11px; }

  .breadcrumb { font-size: 11px; margin-bottom: 14px; }
}


</style>
