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
  background: #f7faf7;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  padding: 32px 0 0 0;
}

/* FILTER BAR */
.filterbar {
  max-width: 1200px;
  margin: 0 auto 24px auto;
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,.04);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #6b7280;
}

.filter-group select {
  border: none;
  background: #f1f5f1;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-weight: 500;
  transition: all .2s ease;
}

.filter-group select:hover {
  background: #e6f4ea;
}

/* TABLE CARD */
.table-card {
  max-width: 1200px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,.05);
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  text-align: left;
  font-size: 12px;
  color: #9ca3af;
  padding: 16px 20px;
  font-weight: 600;
  background: #f9fafb;
  letter-spacing: .05em;
}

td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f1;
  vertical-align: middle;
}

/* ROW HOVER */
tbody tr:hover {
  background: #f9fdf9;
}

/* PRODUCT */
.product {
  display: flex;
  gap: 14px;
  align-items: center;
}

.product img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  background: #f3f4f6;
}

.name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.date {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

/* PRICE */
.price {
  font-weight: 600;
  color: #111827;
}

/* DISCOUNT */
.discount {
  color: #dc2626;
  font-weight: 600;
}

/* STOCK COLORS */
.ok {
  color: #16a34a;
  font-weight: 600;
}

.low {
  color: #f59e0b;
  font-weight: 600;
}

.out {
  color: #dc2626;
  font-weight: 600;
}

/* STATUS BADGE */
.status {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #dcfce7;
  color: #15803d;
}

.status.Out\ of\ Stock {
  background: #fee2e2;
  color: #dc2626;
}

/* ACTION BUTTONS */
.actions button {
  margin-right: 6px;
  cursor: pointer;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 15px;
  transition: all .2s ease;
}

.actions button:hover {
  background: #dcfce7;
}

/* FOOTER */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  font-size: 13px;
  color: #6b7280;
}

/* PAGINATION */
.pagination {
  display: flex;
  gap: 6px;
}

.pagination button {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  transition: all .2s ease;
}

.pagination button:hover {
  background: #dcfce7;
}

.pagination button.active {
  background: #16a34a;
  color: #fff;
}

.pagination button:disabled {
  color: #9ca3af;
  background: #f3f4f6;
  cursor: not-allowed;
}

/* DRAWER */
.drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -8px 0 30px rgba(0,0,0,.08);
  z-index: 100;
  padding: 20px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.drawer-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  flex: 1;
}

.close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
}

.drawer-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 16px;
  object-fit: cover;
}

/* BADGE */
.drawer-id-badge {
  background: #ecfdf5;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 12px;
  display: inline-block;
  margin-bottom: 8px;
}

/* TITLE */
.drawer-prod-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
}

.drawer-date {
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 10px;
}

.desc {
  color: #374151;
  font-size: 14px;
  margin-bottom: 18px;
}

/* GRID */
.drawer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

label {
  color: #9ca3af;
  font-size: 11px;
  font-weight: 600;
}
</style>