<template>
  <div class="product-page">

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
          <option v-for="p in providers" :key="p">{{ p }}</option>
        </select>

        <select v-model="category">
          <option>All Categories</option>
          <option v-for="c in categories" :key="c">{{ c }}</option>
        </select>
      </div>
    </div>

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
            <th>ORIGINAL PRICE</th>
            <th>DISCOUNT</th>
            <th>FINAL PRICE</th>
            <th>STOCK</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in products" :key="p.id">

            <td class="product">
              <img :src="getImageUrl(p.image)" @error="console.log('Image failed to load:', p.image)" />
              <div>
                <div class="name">{{ p.name }}</div>
                <div class="date">{{ formatDate(p.createdAt) }}</div>
              </div>
            </td>

            <td class="price original-strike">${{ Number(p.price).toFixed(2) }}</td>

            <td>
              <span v-if="p.discount > 0" class="discount">
                -{{ p.discount }}%
              </span>
              <span v-else>-</span>
            </td>

            <td class="price final-green">
              ${{ getFinalPrice(p.price, p.discount) }}
            </td>

            <td>
              <span :class="stockClass(p.stock)">
                {{ p.stock }}
              </span>
            </td>

            <td>
              <span :class="['status', stockClass(p.stock)]">
                {{ stockStatus(p.stock) }}
              </span>
            </td>

            <td class="actions">
              <button @click="openProduct(p)">👁</button>
              <button @click="editProduct(p)">✏️</button>
              <button @click="deleteProduct(p)">🗑</button>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

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
              <input v-model.number="editForm.price" type="number" min="0" step="0.01" />
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

    <transition name="slide">
      <aside v-if="showProduct" class="drawer preview-drawer">
        <div class="drawer-header">
          <span class="drawer-title">Product Insights</span>
          <button class="close" @click="showProduct = false">×</button>
        </div>

        <div class="preview-hero-wrapper">
          <img :src="getImageUrl(selected.image)" class="drawer-img-new" />
          <div class="drawer-absolute-badge">ID: {{ selected.id }}</div>
        </div>

        <div class="preview-content">
          <h2 class="drawer-title-primary">{{ selected.name }}</h2>
          <div class="drawer-tag">{{ selected.category || 'General Category' }}</div>
          
          <p class="desc-clean">{{ selected.description || 'No written description provided for this resource asset.' }}</p>

          <div class="drawer-grid-modern">
            <div class="grid-card final-price-highlight">
              <label>Calculated Final Price</label>
              <div class="card-value">${{ getFinalPrice(selected.price, selected.discount) }}</div>
            </div>

            <div class="grid-card">
              <label>Original Price</label>
              <div class="card-value">${{ Number(selected.price).toFixed(2) }}</div>
            </div>

            <div class="grid-card">
              <label>Applied Discount</label>
              <div class="card-value color-red">{{ selected.discount }}% Off</div>
            </div>

            <div class="grid-card">
              <label>Current Stock</label>
              <div class="card-value">{{ selected.stock }} Units</div>
            </div>

            <div class="grid-card">
              <label>Availability status</label>
              <div :class="['card-status', stockClass(selected.stock)]">
                {{ stockStatus(selected.stock) }}
              </div>
            </div>

            <div class="grid-card">
              <label>Assigned Provider</label>
              <div class="card-value text-truncate">{{ selected.provider?.provider_name || 'Unknown' }}</div>
            </div>

            <div class="grid-card full-span-card">
              <label>Created Timestamp (MySQL Database)</label>
              <div class="card-value date-stamp">
                ⏳ {{ formatMySQLTimestamp(selected.addedDate) }}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </transition>

  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/productStore'

/* =========================
   STORE
========================= */
const store = useProductStore()
const { products } = storeToRefs(store)

/* =========================
   CONFIG
========================= */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const UPLOAD_BASE = `${API_BASE}/uploads`

/* =========================
   IMAGE RESOLVER (FIXED)
========================= */
function getImageUrl(image) {
  if (!image) return ''

  // already full URL
  if (image.startsWith('http')) return image

  let clean = image.replace(/^\/+/, '')

  // FIX: backend mismatch /images → /uploads
  if (clean.startsWith('images/')) {
    clean = clean.replace('images/', 'uploads/')
  }

  if (clean.startsWith('uploads/')) {
    return `${API_BASE}/${clean}`
  }

  return image || '';
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
const showEdit = ref(false)

const selected = ref(null)
const editForm = ref({})
let editImageFile = null

/* =========================
   INIT
========================= */
onMounted(async () => {
  await store.fetchAllProducts()
})

/* =========================
   PROVIDERS / CATEGORIES
========================= */
const providers = computed(() => {
  const set = new Set()
  products.value.forEach(p => {
    if (p.provider?.provider_name) set.add(p.provider.provider_name)
  })
  return [...set]
})

const categories = computed(() =>
  [...new Set(products.value.map(p => p.category).filter(Boolean))]
)

/* =========================
   STOCK LOGIC
========================= */
function stockClass(stock) {
  if (!stock || stock === 0) return 'out'
  if (stock <= 10) return 'low'
  return 'ok'
}

function stockStatus(stock) {
  if (!stock || stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

/* =========================
   PRICE
========================= */
function getFinalPrice(price, discount) {
  const p = Number(price) || 0
  const d = Number(discount) || 0

  if (d <= 0) return p.toFixed(2)
  return (p * (1 - d / 100)).toFixed(2)
}

/* =========================
   FILTERING
========================= */
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return (
      (status.value === 'All' || stockStatus(p.stock) === status.value) &&
      (provider.value === 'All Providers' ||
        p.provider?.provider_name === provider.value) &&
      (category.value === 'All' || p.category === category.value)
    )
  })
})

const groupedProducts = computed(() => {
  const groups = {}

  filteredProducts.value.forEach(p => {
    const key = p.provider?.provider_name || 'Unknown Provider'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
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

/* =========================
   IMAGE UPLOAD
========================= */
function onImageChange(e) {
  const file = e.target.files?.[0]
  if (file) editImageFile = file
}

/* =========================
   SAVE EDIT
========================= */
async function submitEdit() {
  try {
    const payload = {
      ...editForm.value,
    }

    if (editImageFile) {
      payload.imageFile = editImageFile
    }

    await store.updateProduct(editForm.value.id, payload)

    showEdit.value = false
    await nextTick()
    await store.fetchAllProducts()

    alert('Product updated successfully')
  } catch (err) {
    console.error(err)
    alert('Failed to update product')
  }
}

/* =========================
   DELETE
========================= */
async function deleteProduct(p) {
  if (!confirm('Delete this product?')) return

  try {
    await store.deleteProduct(p.id)
    await store.fetchAllProducts()
    alert('Deleted successfully')
  } catch (err) {
    console.error(err)
    alert('Delete failed')
  }
}

/* =========================
   DATE FORMATTERS
========================= */
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMySQLTimestamp(date) {
  if (!date) return 'No Timestamp'

  const d = new Date(date)
  if (isNaN(d.getTime())) return date

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
<style scoped>
/* =========================
   PAGE OVERVIEW
========================= */
.product-page {
  background: #f5f7fb;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  padding: 32px 24px 60px;
  color: #1f2937;
}

/* =========================
   FILTER DESIGN
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
  box-shadow: 0 10px 35px rgba(16, 185, 129, 0.08), 0 2px 10px rgba(0,0,0,.03);
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
   DATA TABLE LAYOUT
========================= */
.table-card {
  max-width: 1250px;
  margin: 0 auto 34px auto;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.7);
  box-shadow: 0 15px 40px rgba(16,185,129,.08), 0 3px 10px rgba(0,0,0,.04);
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

tbody tr {
  transition: all .25s ease;
}

tbody tr:hover {
  background: linear-gradient(to right, #f7fff9, #f0fdf4);
}

/* =========================
   CELL ATTRIBUTES
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
   PRICING DESIGN STYLES
========================= */
.price {
  font-size: 15px;
}

.original-strike {
  color: #9ca3af;
  text-decoration: line-through;
  font-weight: 500;
}

.final-green {
  font-weight: 800;
  color: #166534;
  font-size: 16px;
}

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
   STOCK INTERFACES
========================= */
.ok, .low, .out {
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
}

.ok { background: #dcfce7; color: #15803d; }
.low { background: #fef3c7 !important; color: #d97706 !important; }
.out { background: #fee2e2 !important; color: #dc2626 !important; }

.status {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

/* =========================
   ACTION HANDLERS
========================= */
.actions { white-space: nowrap; }
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
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(34,197,94,.25);
}

/* =========================
   DRAWERS ENGINE
========================= */
.drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 440px;
  max-width: 100%;
  height: 100vh;
  background: rgba(255,255,255,.98);
  backdrop-filter: blur(18px);
  box-shadow: -12px 0 40px rgba(0,0,0,.08);
  z-index: 100;
  padding: 26px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 14px;
}

.drawer-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  flex: 1;
}

.close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #f1f5f9;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  transition: all .2s;
}

.close:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* =======================================
   REDESIGNED PRODUCT PREVIEW DRAWERS
======================================= */
.preview-drawer {
  background: #ffffff;
  padding-bottom: 40px;
}

.preview-hero-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* FIXED: Automatically makes the wrapper a perfect fluid square */
  border-radius: 20px;
  overflow: hidden;
  margin-top: 10px;
  margin-bottom: 22px;
  background: #f8fafc; /* Canvas base filler for irregular aspect ratios */
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 26px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-img-new {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Keeps full image visible inside the square boundary */
  display: block;
}

.drawer-absolute-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  z-index: 2;
}

.drawer-title-primary {
  font-size: 25px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.25;
}

.drawer-tag {
  display: inline-block;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 8px;
  margin-bottom: 18px;
  border: 1px solid #bbf7d0;
}

.desc-clean {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  background: #f8fafc;
  padding: 14px 18px;
  border-radius: 14px;
  margin: 0 0 24px 0;
  border-left: 4px solid #cbd5e1;
}

/* MODERN DRAWER GRID */
.drawer-grid-modern {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.grid-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.full-span-card {
  grid-column: span 2;
}

.final-price-highlight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #bbf7d0;
}

.grid-card label {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.grid-card .card-value {
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
}

.final-price-highlight .card-value {
  color: #15803d;
  font-size: 22px;
  font-weight: 800;
}

.color-red { color: #dc2626 !important; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.card-status { font-size: 14px; font-weight: 700; }
.card-status.ok { color: #15803d; }
.card-status.low { color: #d97706; }
.card-status.out { color: #dc2626; }

.date-stamp {
  color: #0284c7 !important;
  font-family: monospace;
  font-size: 13px !important;
}

/* =========================
   FORM CONFIG
========================= */
.edit-form { display: flex; flex-direction: column; gap: 18px; margin-top: 10px; }
.form-row { display: flex; gap: 18px; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.edit-form input, .edit-form textarea {
  border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 15px; background: #f9fafb; color: #1f2937;
}
.edit-form input:focus, .edit-form textarea:focus { border-color: #22c55e; outline: none; }
.save-btn {
  margin-top: 10px; background: linear-gradient(to right, #22c55e, #16a34a); color: #fff; border: none;
  border-radius: 12px; padding: 12px 0; font-size: 16px; font-weight: 700; cursor: pointer;
}
.save-btn:hover { transform: translateY(-1px); }

/* =========================
   ANIMATION RULES
========================= */
.slide-enter-active, .slide-leave-active { transition: all .3s ease-out; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* =========================
   RESPONSIVE DESIGN
========================= */
@media (max-width: 900px) {
  .form-row { flex-direction: column; gap: 0; }
  .product-page { padding: 20px 14px 40px; }
  .filterbar { border-radius: 20px; padding: 16px; flex-direction: column; gap: 12px; }
  .filter-group { width: 100%; }
  .filter-group select { flex: 1; min-width: unset; }
  .table-card { overflow-x: auto; }
  table { min-width: 950px; }
  .drawer { width: 100%; border-radius: 0; }
}
</style>