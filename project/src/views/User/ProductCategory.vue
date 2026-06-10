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
          {{ categoryName }}
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

          <!-- View toggle -->
          <div class="view-toggle">
            <button
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
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
                :class="{ active: categoryType === cat.value }"
                @click="goToCategory(cat.value)"
              >
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

          <template v-else>
            <Card
              v-if="paginatedProducts.length > 0"
              :products="paginatedProducts"
              :viewMode="viewMode"
            />

            <div
              v-else
              class="no-results"
            >
              {{ t('noProducts') }}
            </div>
          </template>

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

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Card from '../../components/Customer/Card.vue'
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'

const languageStore = useLanguageStore()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const t = (key) =>
  messages?.[languageStore.language]?.[key] || key

const showSidebar = ref(false)
const viewMode = ref('grid')
const sortBy = ref('featured')
const maxPrice = ref(150)
const appliedMaxPrice = ref(150)
const activeTag = ref(null)
const searchQuery = ref('')
const page = ref(1)
const perPage = ref(6)
const loading = ref(false)

const tags = ['Organic', 'Fresh', 'Healthy', 'Snacks', 'Dairy']

const allCategories = [
  { value: 'vegetables', name: 'Vegetables' },
  { value: 'greens', name: 'Leafy Greens' },
  { value: 'tubers', name: 'Tubers' },
  { value: 'root-veg', name: 'Root Veg' },
  { value: 'cruciferous', name: 'Cruciferous' },
  { value: 'fruits', name: 'Fruits' },
  { value: 'herbs', name: 'Herbs' },
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

const filteredProducts = computed(() => {
  let list = productStore.products.filter(p => {
    const cat = (p.category || '').toLowerCase()

    const catMatch =
      !categoryType.value ||
      cat === categoryType.value ||
      cat === categoryName.value.toLowerCase()

    const priceMatch =
      parseFloat(p.price || 0) <= appliedMaxPrice.value

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

function goToCategory(value) {
  if (categoryType.value === value) {
    router.push('/products')
  } else {
    router.push(`/category/${value}`)
  }
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

.view-toggle {
  display: flex;
  border: 1px solid var(--bd);
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--wh);
  border: none;
  cursor: pointer;
  color: var(--t3);
  transition: var(--tr);
}

.view-btn.active {
  background: var(--gl);
  color: var(--gm);
}

.view-btn:not(:last-child) {
  border-right: 1px solid var(--bd);
}

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
  .category-content { padding: 20px 16px 48px; }

  .main-content { grid-template-columns: 1fr; }

  .header { flex-direction: column; align-items: flex-start; gap: 12px; }

  .header-controls { width: 100%; justify-content: space-between; }

  .sidebar {
    position: fixed;
    top: 0;
    left: -300px;
    width: 280px;
    height: 100vh;
    z-index: 200;
    background: #fff;
    padding: 24px 20px;
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
  .category-content { padding: 14px 12px 40px; }

  h1 { font-size: 20px; }

  .subtitle { font-size: 12px; }

  .header-controls { gap: 6px; flex-wrap: nowrap; }

  .view-btn { width: 28px; height: 28px; }

  .sort-select { padding: 6px 10px; font-size: 12px; max-width: 130px; }

  .filter-toggle { font-size: 12px; padding: 8px 14px; }

  .sidebar { width: 260px; padding: 20px 16px; }

  .pagination { gap: 4px; }

  .pagination button { width: 28px; height: 28px; font-size: 11px; }

  .breadcrumb { font-size: 11px; margin-bottom: 14px; }
}


</style>
