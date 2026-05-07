<template>
  <div>
  <NavigationBar />
  <div class="fresh-vegetables-page">
    <nav class="breadcrumb">
      Home › Groceries › <span class="active">Fresh Vegetables</span>
    </nav>

    <div class="header">
      <div>
        <h1>Fresh Vegetables</h1>
        <p class="subtitle">
          We found <em>{{ filteredProducts.length }}</em> items for you!
        </p>
      </div>

      <div class="header-controls">
        <div class="view-toggle">
          <button :class="['view-btn', { active: view === 'grid' }]" @click="view = 'grid'">Grid</button>
          <button :class="['view-btn', { active: view === 'list' }]" @click="view = 'list'">List</button>
        </div>

        <select class="sort-select" v-model="sortBy">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>

    <div class="main-content">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Category</h3>
          <div class="category-list">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="cat-item"
              :class="{ active: activeCategory === cat.id }"
              @click="toggleCategory(cat.id)"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Filter by Price</h3>
          <input type="range" min="0" max="150" v-model="maxPrice" class="price-slider" />
          <div class="price-range">
            Range: <strong>$0 – ${{ maxPrice }}</strong>
          </div>
          <button class="filter-btn" @click="applyFilter">Filter</button>
        </div>

        <div class="sidebar-section">
          <h3>Popular Tags</h3>
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
        <!-- 🔥 KEY FIX HERE -->
        <div
          class="products-grid"
          :class="{ 'list-view': view === 'list' }"
          :key="view"
        >
          <ProductCard
            v-for="(product, index) in paginatedProducts"
            :key="product.id + '-' + index"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>

        <div v-if="paginatedProducts.length === 0" class="no-results">
          No products found.
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="page === 1">‹</button>

          <button
            v-for="n in totalPages"
            :key="n"
            :class="['page-btn', { active: page === n }]"
            @click="goToPage(n)"
          >
            {{ n }}
          </button>

          <button @click="nextPage" :disabled="page === totalPages">›</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from './Card.vue'
import NavigationBar from './NavigationBar.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const view = ref('grid')
const sortBy = ref('featured')
const maxPrice = ref(150)
const appliedMaxPrice = ref(150)
const activeCategory = ref(null)
const activeTag = ref(null)
const page = ref(1)
const perPage = 6

const categories = [
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', count: 12 },
]

const tags = ['Organic', 'Fresh', 'Healthy', 'Snacks', 'Dairy']

const filteredProducts = computed(() => {
  let list = props.products.filter(p => p.price <= appliedMaxPrice.value)

  if (activeTag.value) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(activeTag.value.toLowerCase())
    )
  }

  if (sortBy.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (sortBy.value === 'rating') list.sort((a, b) => b.rating - a.rating)

  return list
})

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / perPage)
)

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

watch([sortBy, activeTag, appliedMaxPrice], () => {
  page.value = 1
})

const toggleCategory = id => {
  activeCategory.value = activeCategory.value === id ? null : id
}

const toggleTag = tag => {
  activeTag.value = activeTag.value === tag ? null : tag
}

const applyFilter = () => {
  appliedMaxPrice.value = maxPrice.value
}

const addToCart = product => {
  console.log('Added to cart:', product.name)
}

const prevPage = () => page.value > 1 && page.value--
const nextPage = () => page.value < totalPages.value && page.value++
const goToPage = n => (page.value = n)
</script>
<style scoped>
/* ================= PAGE ================= */
.fresh-vegetables-page {
  max-width: 1280px;
  margin: auto;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
}

/* ================= BREADCRUMB ================= */
.breadcrumb {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
}
.breadcrumb .active {
  color: #0f172a;
  font-weight: 600;
}

/* ================= HEADER ================= */
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
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  margin-top: 4px;
}

/* ================= CONTROLS ================= */
.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-toggle {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 18px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
}

.view-btn.active {
  background: #10b981;
  color: white;
}

.sort-select {
  padding: 8px 14px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
}

/* ================= LAYOUT ================= */
.main-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

/* ================= SIDEBAR ================= */
.sidebar-section {
  background: white;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

.sidebar-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

/* CATEGORY */
.cat-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.cat-item:hover,
.cat-item.active {
  background: #ecfdf5;
}

.cat-icon {
  margin-right: 10px;
}

.cat-name {
  flex: 1;
}

.cat-count {
  font-weight: 600;
  color: #10b981;
}

/* PRICE */
.price-slider {
  width: 100%;
  margin: 10px 0;
  accent-color: #10b981;
}

.price-range {
  font-size: 14px;
}

.filter-btn {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  cursor: pointer;
}

/* TAGS */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 5px 12px;
  background: #f1f5f9;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}

.tag.active,
.tag:hover {
  background: #10b981;
  color: white;
}

/* ================= PRODUCTS ================= */
.products-section {
  width: 100%;
}

/* GRID VIEW */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}

/* LIST VIEW */
.products-grid.list-view {
  grid-template-columns: 1fr;
}

/* ================= PRODUCT CARD ================= */
.product-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  transition: 0.25s;
}

.product-card:hover {
  transform: translateY(-4px);
}

/* IMAGE */
.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 10px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* TEXT */
.product-card h3 {
  font-size: 15px;
  margin: 6px 0;
}

.product-card p {
  font-weight: 600;
  color: #10b981;
}

/* BUTTON */
.product-card button {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: #10b981;
  color: white;
  cursor: pointer;
}

/* ================= LIST MODE FIX ================= */
.products-grid.list-view .product-card {
  display: flex;
  gap: 20px;
  align-items: center;
}

.products-grid.list-view .card-image {
  width: 150px;
  height: 120px;
  flex-shrink: 0;
}

.products-grid.list-view h3 {
  font-size: 16px;
}

/* ================= PAGINATION ================= */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 30px;
}

.pagination button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background: #10b981;
  color: white;
}

/* ================= EMPTY ================= */
.no-results {
  text-align: center;
  padding: 60px;
  color: #64748b;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>