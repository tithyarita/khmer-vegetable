<template>
  <div class="shop-wrapper">
   <NavigationBar />
    <div class="fresh-vegetables-page">
    <nav class="breadcrumb">
      <a href="/">Home</a><span class="sep">›</span>
      <router-link to="/products">Groceries</router-link><span class="sep">›</span>
      <span class="cur">Fresh Vegetables</span>
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
          <button :class="['view-btn', { active: view === 'grid' }]" @click="view = 'grid'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>
          <button :class="['view-btn', { active: view === 'list' }]" @click="view = 'list'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
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
.shop-wrapper {
  --gd: #1a3d28; --gm: #2d6a3f; --ga: #3a8f52; --gl: #e6f4eb; --gp: #f3faf5;
  --amb: #f5a623; --red: #e85a2d; --t1: #16261e; --t2: #435c4e; --t3: #8aa898;
  --bd: #d8e8de; --wh: #ffffff;
  --ss: 0 2px 10px rgba(26,61,40,.07);
  --sm: 0 6px 28px rgba(26,61,40,.11);
  --r: 16px; --tr: .2s cubic-bezier(.4,0,.2,1);
  background: #edf4ef;
  min-height: 100vh;
}

.fresh-vegetables-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  font-family: 'DM Sans', sans-serif;
  color: var(--t1);
}

.breadcrumb { display: flex; gap: 6px; font-size: 13px; color: var(--t3); margin-bottom: 20px; }
.breadcrumb a { color: var(--t2); text-decoration: none; }
.breadcrumb .cur { color: var(--t3); }
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

.subtitle {
  color: var(--t3);
  margin-top: 4px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-toggle {
  display: flex;
  border: 1.5px solid var(--bd);
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 18px;
  background: var(--wh);
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--t3);
  font-family: 'DM Sans', sans-serif;
  transition: var(--tr);
}

.view-btn.active {
  background: var(--gm);
  color: white;
}

.sort-select {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--bd);
  background: var(--wh);
  font-family: 'DM Sans', sans-serif;
  color: var(--t2);
}

.main-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

.sidebar-section {
  background: var(--wh);
  padding: 18px;
  border-radius: var(--r);
  margin-bottom: 20px;
  box-shadow: var(--ss);
  border: 1px solid var(--bd);
}

.sidebar-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--t1);
}

.cat-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--tr);
}

.cat-item:hover,
.cat-item.active {
  background: var(--gl);
}

.cat-icon { margin-right: 10px; }
.cat-name { flex: 1; color: var(--t2); }
.cat-count { font-weight: 600; color: var(--ga); }

.price-slider {
  width: 100%;
  margin: 10px 0;
  accent-color: var(--gm);
}

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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 5px 12px;
  background: var(--gl);
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  color: var(--t2);
  transition: var(--tr);
}

.tag.active,
.tag:hover {
  background: var(--gm);
  color: white;
}

.products-section { width: 100%; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}

.products-grid.list-view { grid-template-columns: 1fr; }

.product-card {
  background: var(--wh);
  border-radius: var(--r);
  padding: 14px;
  box-shadow: var(--ss);
  transition: var(--tr);
  border: 1px solid var(--bd);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sm);
}

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

.product-card h3 {
  font-size: 15px;
  margin: 6px 0;
  color: var(--t1);
}

.product-card p {
  font-weight: 600;
  color: var(--ga);
}

.product-card button {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: var(--gm);
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  transition: var(--tr);
}
.product-card button:hover { background: var(--gd); }

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

.products-grid.list-view h3 { font-size: 16px; }

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

.pagination button.active {
  background: var(--gm);
  color: white;
  border-color: var(--gm);
}
.pagination button:hover:not(.active) {
  border-color: var(--ga);
}

.no-results {
  text-align: center;
  padding: 60px;
  color: var(--t3);
}

@media (max-width: 992px) {
  .main-content { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>