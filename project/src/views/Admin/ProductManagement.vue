<template>
  <div class="product-page">

    <!-- FILTER BAR -->
    <div class="filterbar">
      <div class="filter-group">

        <span>Filter by:</span>

        <select v-model="status">
          <option>All</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

        <select v-model="provider">
          <option>All Providers</option>

          <option
            v-for="p in providers"
            :key="p"
          >
            {{ p }}
          </option>
        </select>

        <select v-model="category">
          <option>All Categories</option>

          <option
            v-for="c in categories"
            :key="c"
          >
            {{ c }}
          </option>
        </select>

      </div>
    </div>

    <!-- GROUPED TABLE -->
    <div
      v-for="(products, providerName) in groupedProducts"
      :key="providerName"
      class="table-card"
    >

      <h2>{{ providerName }}</h2>

      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRICE</th>
            <th>DISCOUNT</th>
            <th>STOCK</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in products" :key="p.id">

            <!-- PRODUCT -->
            <td class="product">
              <img :src="getImageUrl(p.image)" @error="console.log('Image failed to load:', p.image)" />

              <div>
                <div class="name">{{ p.name }}</div>
                <div class="date">{{ formatDate(p.createdAt) }}</div>
              </div>
            </td>

            <!-- PRICE -->
            <td class="price">${{ p.price }}</td>

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

            <!-- STATUS -->
            <td>
              <span :class="['status', stockClass(p.stock)]">
                {{ stockStatus(p.stock) }}
              </span>
            </td>

            <!-- ACTIONS -->
            <td class="actions">
              <button @click="openProduct(p)">👁</button>
              <button @click="editProduct(p)">✏️</button>
              <button @click="deleteProduct(p)">🗑</button>
            </td>

          </tr>
        </tbody>
      </table>

    </div>

    <!-- EDIT DRAWER -->
    <transition name="slide">
      <aside v-if="showEdit" class="drawer">

        <div class="drawer-header">
          <span class="drawer-title">Edit Product</span>
          <button class="close" @click="closeEdit">×</button>
        </div>

        <form @submit.prevent="submitEdit" class="edit-form">

          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input v-model="editForm.name" required />
            </div>

            <div class="form-group">
              <label>Category</label>
              <input v-model="editForm.category" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price</label>
              <input v-model.number="editForm.price" type="number" min="0" />
            </div>

            <div class="form-group">
              <label>Stock</label>
              <input v-model.number="editForm.stock" type="number" min="0" />
            </div>

            <div class="form-group">
              <label>Discount (%)</label>
              <input v-model.number="editForm.discount" type="number" min="0" max="100" />
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description"></textarea>
          </div>

          <div class="form-group">
            <label>Image</label>
            <input type="file" @change="onImageChange" />
          </div>

          <button type="submit" class="save-btn">Save Changes</button>
        </form>

      </aside>
    </transition>

    <!-- PRODUCT DRAWER -->
    <transition name="slide">
      <aside v-if="showProduct" class="drawer">

        <div class="drawer-header">
          <span class="drawer-title">Product Preview</span>
          <button class="close" @click="showProduct = false">×</button>
        </div>

        <img :src="getImageUrl(selected.image)" class="drawer-img" />

        <div class="drawer-id-badge">
          ID: {{ selected.id }}
        </div>

        <h2 class="drawer-prod-name">{{ selected.name }}</h2>

        <div class="drawer-date">
          {{ formatDate(selected.createdAt) }}
        </div>

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
            <div>{{ stockStatus(selected.stock) }}</div>
          </div>

          <div style="grid-column: span 2;">
            <label>Provider</label>
            <div>{{ selected.provider?.provider_name || 'Unknown' }}</div>
          </div>

        </div>

      </aside>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/productStore'

const store = useProductStore()
const { products } = storeToRefs(store)

/* =========================
   IMAGE FIX (IMPORTANT)
========================= */
const IMAGE_BASE_URL = 'http://localhost:3000/uploads/'

function getImageUrl(image) {
  if (!image) {
    console.log('No image value:', image)
    return ''
  }

  if (image.startsWith('http')) {
    console.log('Image is full URL:', image)
    return image
  }

  if (image.startsWith('/uploads/')) {
    const url = `http://localhost:3000${image}`
    console.log('Image with /uploads/ prefix:', url)
    return url
  }

  const url = IMAGE_BASE_URL + image
  console.log('Image as filename:', url)
  return url
}

/* =========================
   FILTERS
========================= */
const status = ref('All')
const provider = ref('All Providers')
const category = ref('All')

/* =========================
   DRAWERS
========================= */
const showProduct = ref(false)
const selected = ref(null)

const showEdit = ref(false)
const editForm = ref({})
let editImageFile = null

/* =========================
   LOAD PRODUCTS
========================= */
onMounted(async () => {
  await store.fetchAllProducts()
})

/* =========================
   PROVIDERS
========================= */
const providers = computed(() => {
  const names = new Set()
  products.value.forEach(p => {
    if (p.provider?.provider_name) {
      names.add(p.provider.provider_name)
    }
  })
  return Array.from(names)
})

/* =========================
   CATEGORIES
========================= */
const categories = computed(() => {
  return [...new Set(products.value.map(p => p.category))]
})

/* =========================
   STOCK STATUS
========================= */
function stockClass(stock) {
  if (stock === 0) return 'out'
  if (stock <= 10) return 'low'
  return 'ok'
}

function stockStatus(stock) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

/* =========================
   FILTER
========================= */
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return (
      (status.value === 'All' || stockStatus(p.stock) === status.value) &&
      (provider.value === 'All Providers' || p.provider?.provider_name === provider.value) &&
      (category.value === 'All' || p.category === category.value)
    )
  })
})

/* =========================
   GROUP
========================= */
const groupedProducts = computed(() => {
  const groups = {}

  filteredProducts.value.forEach(p => {
    const providerName = p.provider?.provider_name || 'Unknown Provider'
    if (!groups[providerName]) groups[providerName] = []
    groups[providerName].push(p)
  })

  return groups
})

/* =========================
   ACTIONS
========================= */
function openProduct(p) {
  selected.value = p
  showProduct.value = true
}

function editProduct(p) {
  editForm.value = { ...p }
  editImageFile = null
  showEdit.value = true
}

function closeEdit() {
  showEdit.value = false
}

function onImageChange(e) {
  const file = e.target.files[0]
  if (file) editImageFile = file
}

async function submitEdit() {
  try {
    const payload = { ...editForm.value }

    if (editImageFile) {
      payload.imageFile = editImageFile
    }

    await store.updateProduct(editForm.value.id, payload)

    showEdit.value = false
    await nextTick()
    await store.fetchAllProducts()

    alert('Product updated!')
  } catch (err) {
    alert('Failed to update product')
  }
}

async function deleteProduct(p) {
  if (!confirm('Are you sure?')) return

  try {
    await store.deleteProduct(p.id)
    await store.fetchAllProducts()
    alert('Product deleted!')
  } catch (err) {
    alert('Failed to delete product')
  }
}

/* =========================
   DATE
========================= */
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
<style scoped>
/* =========================
   PAGE
========================= */
.product-page {
  background: #f5f7fb;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  padding: 32px 24px 60px;
  color: #1f2937;
}

/* =========================
   FILTER BAR
========================= */
.filterbar {
  max-width: 1250px;
  margin: 0 auto 28px auto;
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.5);
  padding: 18px 24px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow:
    0 10px 35px rgba(16, 185, 129, 0.08),
    0 2px 10px rgba(0,0,0,.03);
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.filter-group span {
  font-size: 14px;
  font-weight: 700;
  color: #166534;
}

.filter-group select {
  border: 1px solid #dcfce7;
  background: #ffffff;
  border-radius: 14px;
  padding: 10px 16px;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-weight: 600;
  min-width: 170px;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,.03);
}

.filter-group select:hover {
  border-color: #86efac;
  transform: translateY(-1px);
}

.filter-group select:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34,197,94,.15);
}

/* =========================
   PROVIDER SECTION
========================= */
.table-card {
  max-width: 1250px;
  margin: 0 auto 34px auto;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.7);
  box-shadow:
    0 15px 40px rgba(16,185,129,.08),
    0 3px 10px rgba(0,0,0,.04);
}

.table-card h2 {
  padding: 26px 28px 0;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #166534;
  position: relative;
}

.table-card h2::after {
  content: '';
  display: block;
  width: 70px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(to right, #22c55e, #86efac);
  margin-top: 10px;
}

/* =========================
   TABLE
========================= */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

thead {
  background: linear-gradient(to right, #f0fdf4, #ecfdf5);
}

th {
  text-align: left;
  font-size: 12px;
  color: #6b7280;
  padding: 18px 24px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  border-bottom: 1px solid #ecfdf5;
}

td {
  padding: 20px 24px;
  border-bottom: 1px solid #f0fdf4;
  vertical-align: middle;
  transition: all .2s ease;
}

/* =========================
   ROWS
========================= */
tbody tr {
  transition: all .25s ease;
}

tbody tr:hover {
  background: linear-gradient(to right, #f7fff9, #f0fdf4);
  transform: scale(1.002);
}

/* =========================
   PRODUCT INFO
========================= */
.product {
  display: flex;
  gap: 16px;
  align-items: center;
}

.product img {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  object-fit: cover;
  background: #f3f4f6;
  border: 3px solid #ecfdf5;
  transition: all .25s ease;
}

tbody tr:hover .product img {
  transform: scale(1.05);
}

.name {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
  margin-bottom: 4px;
}

.date {
  font-size: 12px;
  color: #9ca3af;
}

/* =========================
   PRICE
========================= */
.price {
  font-weight: 800;
  color: #166534;
  font-size: 15px;
}

/* =========================
   DISCOUNT
========================= */
.discount {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* =========================
   STOCK
========================= */
.ok,
.low,
.out {
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
}


.ok {
  background: #dcfce7;
  color: #15803d;
}

.low,
.status.Low\ Stock {
  background: #fef3c7 !important;
  color: #d97706 !important;
}

.out,
.status.Out\ of\ Stock {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

/* =========================
   STATUS
========================= */
.status {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #dcfce7;
  color: #15803d;
  letter-spacing: .02em;
}

.status.Out\ of\ Stock {
  background: #fee2e2;
  color: #dc2626;
}

/* =========================
   ACTION BUTTONS
========================= */
.actions {
  white-space: nowrap;
}

.actions button {
  margin-right: 8px;
  cursor: pointer;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 14px;
  width: 42px;
  height: 42px;
  font-size: 16px;
  transition: all .25s ease;
}

.actions button:hover {
  background: linear-gradient(to bottom right, #22c55e, #16a34a);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 18px rgba(34,197,94,.25);
}

/* =========================
   FOOTER
========================= */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  font-size: 13px;
  color: #6b7280;
  background: #fcfffd;
}

/* =========================
   PAGINATION
========================= */
.pagination {
  display: flex;
  gap: 8px;
}

.pagination button {
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  transition: all .25s ease;
  font-weight: 600;
}

.pagination button:hover {
  background: #dcfce7;
  transform: translateY(-1px);
}

.pagination button.active {
  background: linear-gradient(to right, #22c55e, #16a34a);
  color: #fff;
  box-shadow: 0 8px 18px rgba(34,197,94,.3);
}

.pagination button:disabled {
  color: #9ca3af;
  background: #f3f4f6;
  cursor: not-allowed;
}

/* =========================
   DRAWER
========================= */
.drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 430px;
  max-width: 100%;
  height: 100vh;
  background: rgba(255,255,255,.96);
  backdrop-filter: blur(18px);
  box-shadow: -12px 0 40px rgba(0,0,0,.08);
  z-index: 100;
  padding: 26px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255,255,255,.6);
}

/* =========================
   DRAWER HEADER
========================= */
.drawer-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.drawer-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  flex: 1;
}

.close {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: #f3f4f6;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: all .25s ease;
}

.close:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: rotate(90deg);
}

/* =========================
   DRAWER IMAGE
========================= */
.drawer-img {
  width: 100%;
  border-radius: 24px;
  margin-bottom: 20px;
  object-fit: cover;
  box-shadow: 0 15px 30px rgba(0,0,0,.08);
}

/* =========================
   BADGE
========================= */
.drawer-id-badge {
  background: linear-gradient(to right, #dcfce7, #bbf7d0);
  color: #166534;
  font-size: 12px;
  font-weight: 800;
  border-radius: 999px;
  padding: 7px 14px;
  display: inline-block;
  margin-bottom: 12px;
  width: fit-content;
}

/* =========================
   TITLE
========================= */
.drawer-prod-name {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #111827;
  line-height: 1.2;
}

.drawer-date {
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 14px;
}

.desc {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 26px;
}

/* =========================
   GRID
========================= */
.drawer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  width: 100%;
}

.drawer-grid > div {
  background: #f9fffb;
  border: 1px solid #ecfdf5;
  border-radius: 18px;
  padding: 16px;
  transition: all .2s ease;
}

.drawer-grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16,185,129,.08);
}

label {
  display: block;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .08em;
}

/* =========================
   ANIMATION
========================= */
.slide-enter-active,
.slide-leave-active {
  transition: all .35s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* =========================
   SCROLLBAR
========================= */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #bbf7d0;
  border-radius: 999px;
}

::-webkit-scrollbar-track {
  background: transparent;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 10px;
}

.form-row {
  display: flex;
  gap: 18px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.edit-form input,
.edit-form textarea {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 15px;
  background: #f9fafb;
  color: #1f2937;
  transition: border-color .2s;
}

.edit-form input:focus,
.edit-form textarea:focus {
  border-color: #22c55e;
  outline: none;
}

.save-btn {
  margin-top: 10px;
  background: linear-gradient(to right, #22c55e, #16a34a);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(34,197,94,.13);
  transition: background .2s, transform .2s;
}

.save-btn:hover {
  background: linear-gradient(to right, #16a34a, #22c55e);
  transform: translateY(-2px) scale(1.03);
}

@media (max-width: 900px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}


/* =========================
   RESPONSIVE
========================= */
@media (max-width: 900px) {
  .product-page {
    padding: 20px 14px 40px;
  }

  .filterbar {
    border-radius: 20px;
    padding: 16px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    flex: 1;
    min-width: unset;
  }

  .table-card {
    overflow-x: auto;
  }

  table {
    min-width: 850px;
  }

  .drawer {
    width: 100%;
    border-radius: 0;
  }
}
</style>