<template>
  <div class="fresh-vegetables-page">
    <nav class="breadcrumb">
      Home › Groceries › <span class="active">Fresh Vegetables</span>
    </nav>

    <div class="header">
      <div>
        <h1>Fresh Vegetables</h1>
        <p class="subtitle">We found <em>{{ filteredProducts.length }}</em> items for you!</p>
      </div>

      <div class="header-controls">
        <div class="view-toggle">
          <button :class="{ active: view === 'grid' }" @click="view = 'grid'">Grid</button>
          <button :class="{ active: view === 'list' }" @click="view = 'list'">List</button>
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
          <h3>Fill by Price</h3>
          <input type="range" min="0" max="150" v-model="maxPrice" class="price-slider" />
          <div class="price-range">Range: <strong>$0 – ${{ maxPrice }}</strong></div>
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
        <div class="products-grid" :class="{ 'list-view': view === 'list' }">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
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
            class="page-btn"
            :class="{ active: page === n }"
            @click="goToPage(n)"
          >
            {{ n }}
          </button>
          <button @click="nextPage" :disabled="page === totalPages">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Normal <script> - Define default data here
export default {
  name: 'FreshVegetables',
  props: {
    products: {
      type: Array,
      default: () => [
        {
          id: 1,
          name: "Organic Curly Kale Bunch",
          category: "Leafy Greens",
          price: "2.50",
          originalPrice: "3.20",
          rating: 4.9,
          badge: "HOT",
          image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600"
        },
        {
          id: 2,
          name: "Fresh Garden Radish (Bunch)",
          category: "Root Veg",
          price: "1.99",
          originalPrice: "2.50",
          rating: 4.8,
          badge: "SALE",
          image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600"
        },
        {
          id: 3,
          name: "Sweet Red Bell Peppers (3 Pack)",
          category: "Vegetables",
          price: "3.45",
          originalPrice: "4.00",
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600"
        },
        {
          id: 4,
          name: "Baby Spinach Leaves 200g",
          category: "Leafy Greens",
          price: "2.80",
          rating: 4.7,
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"
        }
      ]
    }
  }
}
</script>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from './Card.vue'

const props = defineProps()   // Empty because props are defined in normal <script>

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
  let list = props.products.filter(p => parseFloat(p.price) <= appliedMaxPrice.value)

  if (activeTag.value) {
    list = list.filter(p => p.name.toLowerCase().includes(activeTag.value.toLowerCase()))
  }

  const sorted = [...list]
  if (sortBy.value === 'price-asc') sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  if (sortBy.value === 'price-desc') sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
  if (sortBy.value === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))

  return sorted
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

watch([sortBy, activeTag, appliedMaxPrice], () => {
  page.value = 1
})

const toggleCategory = (id) => activeCategory.value = activeCategory.value === id ? null : id
const toggleTag = (tag) => activeTag.value = activeTag.value === tag ? null : tag
const applyFilter = () => appliedMaxPrice.value = maxPrice.value
const addToCart = (product) => console.log('Added to cart:', product.name)

const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }
const goToPage = (n) => { page.value = n }
</script>

<style scoped>
/* ==================== FULL STYLES ==================== */
.fresh-vegetables-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
}

.breadcrumb { color: #64748b; margin-bottom: 20px; }
.breadcrumb .active { color: #0f172a; font-weight: 500; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}
h1 { font-size: 36px; font-weight: 700; margin: 0; color: #0f172a; }
.subtitle { color: #64748b; margin-top: 6px; }

.header-controls { display: flex; gap: 12px; align-items: center; }

.view-toggle {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.view-btn {
  padding: 10px 26px;
  font-size: 14.5px;
  background: white;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.view-btn:first-child { border-right: 2px solid #e2e8f0; }
.view-btn.active { background: #0f172a; color: white; }

.sort-select {
  padding: 10px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.main-content { 
  display: grid; 
  grid-template-columns: 280px 1fr; 
  gap: 32px; 
}

.sidebar-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

h3 { margin-bottom: 16px; font-weight: 600; color: #334155; }

.category-list .cat-item {
  display: flex; 
  align-items: center; 
  padding: 10px 12px; 
  border-radius: 10px; 
  cursor: pointer;
}
.category-list .cat-item:hover, 
.category-list .cat-item.active { 
  background: #f0fdf4; 
}

.cat-icon { margin-right: 12px; font-size: 20px; }
.cat-name { flex: 1; }
.cat-count { color: #10b981; font-weight: 600; }

.price-slider { width: 100%; accent-color: #10b981; margin: 12px 0; }

.filter-btn {
  width: 100%; 
  padding: 14px; 
  background: #10b981; 
  color: white; 
  border: none;
  border-radius: 9999px; 
  font-weight: 600; 
  margin-top: 12px;
}

.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  padding: 6px 14px; 
  background: #f1f5f9; 
  border-radius: 9999px; 
  font-size: 13px; 
  cursor: pointer;
}
.tag.active, .tag:hover { background: #10b981; color: white; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.products-grid.list-view {
  grid-template-columns: 1fr;
}

.products-grid.list-view .product-card {
  display: flex;
  gap: 24px;
}

.products-grid.list-view .card-image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.pagination button {
  width: 40px; 
  height: 40px; 
  border: 1px solid #e2e8f0; 
  background: white;
  border-radius: 8px; 
  cursor: pointer;
}
.pagination button.active { 
  background: #10b981; 
  color: white; 
}

.no-results {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 18px;
}

@media (max-width: 992px) {
  .main-content { grid-template-columns: 1fr; }
}
</style>