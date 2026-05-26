<template>
  <div class="category-page">
    <NavigationBar />
<<<<<<< HEAD
    <div class="category-content">
      <nav class="breadcrumb">
        <router-link to="/">Home</router-link><span class="sep">›</span>
=======

    <div class="category-content">
      <nav class="breadcrumb">
        <router-link to="/">{{ t('home') }}</router-link>
        <span class="sep">›</span>
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
        <span class="cur">{{ categoryIcon }} {{ categoryName }}</span>
      </nav>

      <div class="header">
        <div>
          <h1>{{ categoryName }}</h1>
          <p class="subtitle">
<<<<<<< HEAD
            We found <em>{{ filteredProducts.length }}</em> items for you!
=======
            {{ t('foundItems') }} <em>{{ filteredProducts.length }}</em> {{ t('items') }}
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
          </p>
        </div>

        <div class="header-controls">
          <div class="search-box">
<<<<<<< HEAD
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search products..." />
          </div>
          <div class="view-toggle">
            <button :class="['view-btn', { active: view === 'grid' }]" @click="view = 'grid'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button :class="['view-btn', { active: view === 'list' }]" @click="view = 'list'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
=======
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchProducts')"
            />
          </div>

          <div class="view-toggle">
            <button :class="['view-btn', { active: view === 'grid' }]" @click="view = 'grid'">
              {{ t('grid') }}
            </button>
            <button :class="['view-btn', { active: view === 'list' }]" @click="view = 'list'">
              {{ t('list') }}
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
            </button>
          </div>

          <select class="sort-select" v-model="sortBy">
<<<<<<< HEAD
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
=======
            <option value="featured">{{ t('featured') }}</option>
            <option value="price-asc">{{ t('priceLowHigh') }}</option>
            <option value="price-desc">{{ t('priceHighLow') }}</option>
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
          </select>
        </div>
      </div>

      <div class="main-content">
        <aside class="sidebar">
<<<<<<< HEAD
          <div class="sidebar-section">
            <h3>Category</h3>
=======

          <div class="sidebar-section">
            <h3>{{ t('category') }}</h3>

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
            <div class="category-list">
              <div
                v-for="cat in allCategories"
                :key="cat.value"
                class="cat-item"
                :class="{ active: activeCategory === cat.value }"
                @click="toggleCategory(cat.value)"
              >
                <span class="cat-icon">{{ cat.icon }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
<<<<<<< HEAD
            <h3>Filter by Price</h3>
            <input type="range" min="0" max="150" v-model="maxPrice" class="price-slider" />
            <div class="price-range">
              Range: <strong>$0 – ${{ maxPrice }}</strong>
            </div>
            <button class="filter-btn" @click="applyFilter">Filter</button>
          </div>

          <div class="sidebar-section">
            <h3>Popular Tags</h3>
=======
            <h3>{{ t('price') }}</h3>

            <input
              type="range"
              min="0"
              max="150"
              v-model="maxPrice"
              class="price-slider"
            />

            <div class="price-range">
              {{ t('range') }}: <strong>$0 – ${{ maxPrice }}</strong>
            </div>

            <button class="filter-btn" @click="applyFilter">
              {{ t('filter') }}
            </button>
          </div>

          <div class="sidebar-section">
            <h3>{{ t('popularTags') }}</h3>

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
<<<<<<< HEAD
        </aside>

        <div class="products-section">
          <div v-if="loading" class="no-results">Loading products...</div>

          <div v-else class="products-grid" :class="{ 'list-view': view === 'list' }" :key="view">
=======

        </aside>

        <div class="products-section">

          <div v-if="loading" class="no-results">
            {{ t('loading') }}
          </div>

          <div v-else class="products-grid" :class="{ 'list-view': view === 'list' }">

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
            <div
              v-for="(product, index) in paginatedProducts"
              :key="product.id + '-' + index"
              class="product-card"
              @click="goToProduct(product.id)"
            >
<<<<<<< HEAD
              <div class="card-image">
                <img :src="product.image" :alt="product.name" />
                <span v-if="product.discount > 0" class="badge badge-discount">-{{ product.discount }}%</span>
              </div>
              <div class="card-body">
                <p class="category-label">{{ product.category }}</p>
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="price-row">
                  <div class="prices">
                    <span class="price">${{ product.price }}</span>
                    <span v-if="product.discount > 0" class="original-price">${{ product.originalPrice }}</span>
                  </div>
                  <button class="btn-add" @click.stop="addToCart(product)">
                    <span class="plus">+</span> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && paginatedProducts.length === 0" class="no-results">
            No products found in this category.
          </div>

          <div class="pagination" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="page === 1">‹</button>
            <button v-for="n in totalPages" :key="n" :class="['page-btn', { active: page === n }]" @click="goToPage(n)">{{ n }}</button>
            <button @click="nextPage" :disabled="page === totalPages">›</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
=======

              <div class="card-image">
                <img :src="product.image" :alt="product.name" />
              </div>

              <div class="card-body">
                <p class="category-label">{{ product.category }}</p>
                <h3 class="product-name">{{ product.name }}</h3>

                <p class="provider-owner">
                  {{ t('provider') }}: {{ product.providerName || t('unknown') }}
                </p>

                <div class="price-row">
                  <span class="price">${{ product.price }}</span>

                  <button class="btn-add" @click.stop="addToCart(product)">
                    {{ t('add') }}
                  </button>
                </div>
              </div>

            </div>

          </div>

          <div v-if="!loading && paginatedProducts.length === 0" class="no-results">
            {{ t('noProducts') }}
          </div>

        </div>
      </div>
    </div>

    <Footer />
  </div>
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import { useCartStore } from '../../stores/cartStore'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'
<<<<<<< HEAD
=======
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'

const languageStore = useLanguageStore()
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

<<<<<<< HEAD
=======
const t = (key) =>
  messages?.[languageStore.language]?.[key] || key

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
const view = ref('grid')
const sortBy = ref('featured')
const maxPrice = ref(150)
const appliedMaxPrice = ref(150)
const activeCategory = ref(null)
const activeTag = ref(null)
const searchQuery = ref('')
const page = ref(1)
const perPage = ref(6)
const loading = ref(false)
<<<<<<< HEAD
=======

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
<<<<<<< HEAD
  'root veg': 'Root Veg',
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
  'root-veg': 'Root Veg',
  cruciferous: 'Cruciferous',
  fruits: 'Fruits',
  herbs: 'Herbs',
}

<<<<<<< HEAD
const categoryType = computed(() => {
  return decodeURIComponent(route.params.type || '').toLowerCase()
})

const categoryName = computed(() => {
  return categoryMap[categoryType.value] || route.params.type || 'Products'
=======
const categoryType = computed(() =>
  decodeURIComponent(route.params.type || '').toLowerCase()
)

const categoryName = computed(() =>
  categoryMap[categoryType.value] || route.params.type || 'Products'
)

const categoryIcon = computed(() => {
  const cat = allCategories.find(c => c.value === categoryType.value)
  return cat?.icon || ''
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
})

const filteredProducts = computed(() => {
  let list = productStore.products.filter(p => {
    const cat = (p.category || '').toLowerCase()
<<<<<<< HEAD
    const catMatch = !categoryType.value || cat === categoryType.value || cat === categoryName.value.toLowerCase()
    const priceMatch = parseFloat(p.price || 0) <= appliedMaxPrice.value
    const categoryFilterMatch = !activeCategory.value || cat === activeCategory.value
    const tagMatch = !activeTag.value || (p.name || '').toLowerCase().includes(activeTag.value.toLowerCase())
    const searchMatch = !searchQuery.value || (p.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return catMatch && priceMatch && categoryFilterMatch && tagMatch && searchMatch
  })

  if (sortBy.value === 'price-asc') list.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0))
  if (sortBy.value === 'price-desc') list.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
=======

    return (
      (!categoryType.value || cat === categoryType.value) &&
      parseFloat(p.price || 0) <= appliedMaxPrice.value &&
      (!activeCategory.value || cat === activeCategory.value) &&
      (!activeTag.value ||
        (p.name || '').toLowerCase().includes(activeTag.value.toLowerCase())) &&
      (!searchQuery.value ||
        (p.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  })

  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  }
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d

  return list
})

<<<<<<< HEAD
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / perPage.value)))
=======
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / perPage.value))
)
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredProducts.value.slice(start, start + perPage.value)
})

<<<<<<< HEAD
watch(sortBy, () => { page.value = 1 })
watch(activeTag, () => { page.value = 1 })
watch(appliedMaxPrice, () => { page.value = 1 })
=======
watch([sortBy, activeTag, appliedMaxPrice], () => {
  page.value = 1
})

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
watch(() => route.params.type, () => {
  page.value = 1
  activeCategory.value = null
  activeTag.value = null
})

onMounted(async () => {
  loading.value = true
  try {
    await productStore.fetchAllProducts()
  } finally {
    loading.value = false
  }
})

function toggleCategory(value) {
  activeCategory.value = activeCategory.value === value ? null : value
  page.value = 1
}

function toggleTag(tag) {
  activeTag.value = activeTag.value === tag ? null : tag
  page.value = 1
}

function applyFilter() {
  appliedMaxPrice.value = maxPrice.value
}

function goToProduct(id) {
  router.push({ name: 'ProductDetailUser', params: { id } })
}

function addToCart(product) {
  cartStore.addToCart(product)
}
<<<<<<< HEAD

function prevPage() { if (page.value > 1) page.value-- }

function nextPage() { if (page.value < totalPages.value) page.value++ }

function goToPage(n) { page.value = n }
</script>

=======
</script>
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
<<<<<<< HEAD
  font-family: 'DM Sans', sans-serif;
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
<<<<<<< HEAD
  font-family: 'Playfair Display', serif;
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
<<<<<<< HEAD
  font-family: 'DM Sans', sans-serif;
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
  font-size: 13px;
  color: #16261e;
  width: 180px;
}
.search-box input::placeholder { color: #8aa898; }

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
<<<<<<< HEAD
  font-family: 'DM Sans', sans-serif;
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
  transition: var(--tr);
}

.view-btn.active { background: var(--gm); color: white; }

.sort-select {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--bd);
  background: var(--wh);
<<<<<<< HEAD
  font-family: 'DM Sans', sans-serif;
=======
>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
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
  cursor: pointer;
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
  position: relative;
}

.card-image img { width: 100%; height: 100%; object-fit: cover; }

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.badge-hot { background: #e85a2d; }
.badge-sale { background: #f5a623; }
.badge-new { background: #3a8f52; }
.badge-discount { left: auto; right: 8px; background: #c0392b; }

.product-card h3 { font-size: 15px; margin: 6px 0; color: var(--t1); }
.category-label { font-size: 12px; color: var(--t3); margin: 0; }

<<<<<<< HEAD
=======
.provider-owner {
  margin: 2px 0 10px;
  font-size: 12px;
  color: var(--t2);
}

>>>>>>> 24b89f35ff9c5539343ebe2542d9c12ef3c8163d
.price-row { display: flex; justify-content: space-between; align-items: center; }
.prices { display: flex; align-items: center; gap: 6px; }
.price { font-weight: 700; color: var(--gd); font-size: 16px; }
.original-price { text-decoration: line-through; color: var(--t3); font-size: 12px; }

.btn-add {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: var(--gm);
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  transition: var(--tr);
}
.btn-add:hover { background: var(--gd); }
.plus { margin-right: 2px; }

.products-grid.list-view .product-card {
  display: flex;
  gap: 20px;
  align-items: center;
}
.products-grid.list-view .card-image { width: 150px; height: 120px; flex-shrink: 0; }
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

.pagination button.active { background: var(--gm); color: white; border-color: var(--gm); }
.pagination button:hover:not(.active) { border-color: var(--ga); }

.no-results { text-align: center; padding: 60px; color: var(--t3); }

@media (max-width: 992px) {
  .main-content { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
