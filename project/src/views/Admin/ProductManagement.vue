<template>
  <div class="product-page">

    <!-- FILTER BAR -->
    <div class="filterbar">
      <div class="filter-group">
        <span>Filter by:</span>
        <select v-model="status">
          <option>All</option>
          <option>Active</option>
          <option>Out of Stock</option>
        </select>
        <select v-model="provider">
          <option>All Providers</option>
          <option v-for="p in providers" :key="p">{{ p }}</option>
        </select>
        <select v-model="category">
          <option>All Categories</option>
          <option v-for="c in categories" :key="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-card">

      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRICE</th>
            <th>DISCOUNT</th>
            <th>STOCK</th>
            <th>PROVIDER</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in paginatedProducts" :key="p.id">

            <!-- PRODUCT -->
            <td class="product">
              <img :src="p.image" />
              <div>
                <div class="name">{{ p.name }}</div>
                <div class="date">{{ formatDate(p.createdAt) }}</div>
              </div>
            </td>

            <!-- PRICE -->
            <td class="price">
              ${{ p.price }}
            </td>

            <!-- DISCOUNT -->
            <td>
              <span v-if="p.discount > 0" class="discount">
                -{{ p.discount }}%
              </span>
              <span v-else>-</span>
            </td>

            <!-- STOCK -->
            <td>
              <span :class="stockClass(p.stock)">
                {{ p.stock }}
              </span>
            </td>

            <!-- PROVIDER -->
            <td>{{ p.provider }}</td>

            <!-- STATUS -->
            <td>
              <span :class="['status', p.status]">
                {{ p.status }}
              </span>
            </td>

            <!-- ACTIONS -->
            <td class="actions">
              <button @click="openProduct(p)">👁</button>
              <button>✏️</button>
              <button>🗑</button>
            </td>

          </tr>
        </tbody>
      </table>

      <!-- FOOTER -->
      <div class="footer">
        <span>
          Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }}
        </span>

        <div class="pagination">
          <button :disabled="page === 1" @click="page--">‹</button>

          <button
            v-for="n in totalPages"
            :key="n"
            :class="{ active: page === n }"
            @click="page = n"
          >
            {{ n }}
          </button>

          <button :disabled="page === totalPages" @click="page++">›</button>
        </div>
      </div>
    </div>

    <!-- DRAWER -->
    <transition name="slide">
      <aside v-if="showProduct" class="drawer">
        <div class="drawer-header">
          <span class="drawer-title">Product Preview</span>
          <button class="close" @click="showProduct = false">×</button>
        </div>
        <img :src="selected.image" class="drawer-img" />
        <div class="drawer-id-badge">ID: {{ selected.id }}</div>
        <h2 class="drawer-prod-name">{{ selected.name }}</h2>
        <div class="drawer-date">{{ formatDate(selected.addedDate) }}</div>
        <p class="desc">{{ selected.description }}</p>
        <div class="drawer-grid">
          <div>
            <label>Price</label>
            <div>${{ selected.price }}</div>
          </div>
          <div>
            <label>Discount</label>
            <div>{{ selected.discount }}%</div>
          </div>
          <div>
            <label>Stock</label>
            <div>{{ selected.stock }}</div>
          </div>
          <div>
            <label>Status</label>
            <div>{{ selected.status }}</div>
          </div>
          <div style="grid-column: span 2;">
            <label>Provider</label>
            <div>{{ selected.provider }}</div>
          </div>
        </div>
      </aside>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/productStore'

const store = useProductStore()
const { products } = storeToRefs(store)

const status = ref('All')
const provider = ref('All Providers')
const category = ref('All')

const page = ref(1)
const pageSize = 6

const showProduct = ref(false)
const selected = ref(null)

onMounted(() => store.fetchAllProducts())

watch([status, provider, category], () => {
  page.value = 1
})

/* UNIQUE FILTER OPTIONS */
const providers = computed(() => [...new Set(products.value.map(p => p.provider))])
const categories = computed(() => [...new Set(products.value.map(p => p.category))])

/* FILTER */
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchStatus =
      status.value === 'All' ||
      p.status === status.value

    const matchProvider =
      provider.value === 'All Providers' ||
      p.provider === provider.value

    const matchCategory =
      category.value === 'All' ||
      p.category === category.value

    return matchStatus && matchProvider && matchCategory
  })
})

/* PAGINATION */
const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / pageSize)
)

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

/* ACTIONS */
function openProduct(p) {
  selected.value = p
  showProduct.value = true
}

/* HELPERS */
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function stockClass(stock) {
  if (stock === 0) return 'out'
  if (stock < 10) return 'low'
  return 'ok'
}
</script>

<style scoped>
.product-page {
  background: #f3f4f6;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  padding: 32px 0 0 0;
}
.filterbar {
  max-width: 1200px;
  margin: 0 auto 24px auto;
  background: #fff;
  padding: 18px 28px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  border: 1px solid #eaeaea;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: #888;
}
.filter-group select {
  border: none;
  background: #f6f7f8;
  border-radius: 12px;
  padding: 7px 18px;
  font-size: 15px;
  color: #222;
  box-shadow: 0 1px 4px #0001;
  outline: none;
  appearance: none;
  font-weight: 500;
}
.table-card {
  max-width: 1200px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  padding: 0 0 8px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  border: 1px solid #eaeaea;
}
table {
  width: 100%;
  border-collapse: separate;
  padding: 20px;
  font-size: 15px;
}
th {
  text-align: left;
  font-size: 13px;
  color: #9ca3af;
  padding: 18px 0 12px 0;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: none;
}
td {
  padding: 18px 0 18px 0;
  border-top: 1px solid #f3f4f3;
  vertical-align: middle;
  background: #fff;
}
tr {
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  border-radius: 8px;
  border: 1px solid #eaeaea;
  margin-bottom: 4px;
}
.product {
  display: flex;
  gap: 16px;
  align-items: center;
}
.product img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #eaeaea;
}
.name {
  font-weight: 700;
  font-size: 15px;
  color: #222;
}
.date {
  font-size: 12px;
  color: #b0b4ba;
  margin-top: 2px;
}
.price {
  font-weight: 700;
  color: #222;
  font-size: 15px;
}
.discount {
  color: #dc2626;
  font-weight: 600;
}
.ok {
  color: #15803d;
}
.low {
  color: #eab308;
}
.out {
  color: #dc2626;
}
.status {
  padding: 4px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  background: #e5fbe6;
  color: #15803d;
}
.status.Out\ of\ Stock {
  background: #fee2e2;
  color: #dc2626;
}
.actions button {
  margin-right: 6px;
  cursor: pointer;
  background: #f6f7f8;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 16px;
  transition: background 0.15s;
}
.actions button:hover {
  background: #e5e7eb;
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px 8px 18px;
  font-size: 13px;
  color: #b0b4ba;
}
.pagination {
  display: flex;
  gap: 6px;
}
.pagination button {
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 14px;
  color: #222;
  cursor: pointer;
  transition: background 0.15s;
}
.pagination button.active {
  background: #14532d;
  color: #fff;
}
.pagination button:disabled {
  color: #b0b4ba;
  background: #f3f4f6;
  cursor: not-allowed;
}
/* DRAWER */
.drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 410px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 24px #0002;
  z-index: 100;
  padding: 0 32px 32px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  border-left: 1px solid #eaeaea;
}
.drawer-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 18px;
  margin-bottom: 10px;
  gap: 10px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 8px;
}
.drawer-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  flex: 1;
}
.close {
  background: none;
  border: none;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  margin-left: 8px;
}
.drawer-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 18px;
  margin-top: 8px;
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #eaeaea;
}
.drawer-id-badge {
  background: #f3f4f6;
  color: #15803d;
  font-size: 13px;
  font-weight: 700;
  border-radius: 7px;
  padding: 4px 14px;
  display: inline-block;
  margin-bottom: 8px;
  border: 1px solid #eaeaea;
}
.drawer-prod-name {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 2px;
  color: #222;
}
.drawer-date {
  color: #b0b4ba;
  font-size: 13px;
  margin-bottom: 10px;
}
.desc {
  color: #444;
  font-size: 15px;
  margin-bottom: 18px;
}
.drawer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  width: 100%;
  margin-bottom: 18px;
}
label {
  color: #b0b4ba;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}
</style>