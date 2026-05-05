<template>
  <div class="provider-orders">
    <div class="orders-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Provider Orders" />

        <!-- Content Wrapper -->
        <div class="content-wrapper">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div
              v-for="card in statCards"
              :key="card.key"
              class="stat-card"
              :class="{ active: activeFilter === card.key }"
              @click="setFilter(card.key)"
            >
              <div class="stat-icon" :style="{ background: card.color }">
                {{ card.icon }}
              </div>
              <div class="stat-content">
                <span class="stat-number">{{ card.count }}</span>
                <span class="stat-label">{{ card.label }}</span>
              </div>
            </div>
          </div>

          <!-- Orders Section -->
          <div class="orders-section">
            <!-- Section Header -->
            <div class="section-header">
              <div class="header-left">
                <h2 class="section-title">{{ sectionTitle }}</h2>
                <span class="result-count">{{ filteredOrders.length }} result{{ filteredOrders.length !== 1 ? 's' : '' }}</span>
              </div>
              <button class="sort-btn" @click="toggleSort" :title="sortOrder === 'desc' ? 'Oldest first' : 'Newest first'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M7 12h10M11 18h2"/>
                </svg>
                <span>{{ sortOrder === 'desc' ? 'Newest first' : 'Oldest first' }}</span>
                <svg class="sort-arrow" :class="{ flipped: sortOrder === 'asc' }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 10l5 5 5-5"/>
                </svg>
              </button>
            </div>

            <!-- Search Bar -->
            <div class="search-bar">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search order ID, customer name..."
                class="search-input"
                @input="handleSearch"
              />
              <button
                v-if="searchQuery"
                class="clear-search-btn"
                @click="clearSearch"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Orders Table -->
            <div class="table-container">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredOrders.length === 0" class="empty-row">
                    <td colspan="7">
                      <div class="empty-state">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor">
                          <rect x="8" y="16" width="40" height="36" rx="2" stroke-width="2"/>
                          <path d="M8 20h40" stroke-width="2"/>
                          <circle cx="16" cy="28" r="2" fill="currentColor"/>
                          <circle cx="24" cy="28" r="2" fill="currentColor"/>
                          <circle cx="32" cy="28" r="2" fill="currentColor"/>
                        </svg>
                        <h3>No orders found</h3>
                        <p>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                  <tr
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="order-row"
                    :class="`status-${order.status}`"
                  >
                    <td class="col-order-id">
                      <span class="id-badge">{{ order.id }}</span>
                    </td>
                    <td class="col-customer">
                      <div class="customer-info">
                        <span class="customer-name">{{ order.customerName }}</span>
                        <span class="customer-id">{{ order.customerId }}</span>
                      </div>
                    </td>
                    <td class="col-items">
                      <span class="item-count">{{ order.items.length }}</span>
                    </td>
                    <td class="col-total">
                      <span class="price">${{ order.total }}</span>
                    </td>
                    <td class="col-date">
                      {{ formatDate(order.createdAt) }}
                    </td>
                    <td class="col-status">
                      <span class="status-badge" :class="`badge-${order.status}`">
                        {{ getStatusLabel(order.status) }}
                      </span>
                    </td>
                    <td class="col-action">
                      <button
                        class="btn-view-detail"
                        @click="openDetailModal(order)"
                        title="View order details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <transition name="modal">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-title-section">
              <h2 class="modal-title">Order Details</h2>
              <p class="modal-subtitle">{{ selectedOrder.id }}</p>
            </div>
            <button class="modal-close-btn" @click="closeDetailModal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Customer Info Card -->
            <div class="info-card card-customer">
              <h3 class="card-title">Customer Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">{{ selectedOrder.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Customer ID</span>
                  <span class="info-value">{{ selectedOrder.customerId }}</span>
                </div>
              </div>
            </div>

            <!-- Order Info Card -->
            <div class="info-card card-order">
              <h3 class="card-title">Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Created At</span>
                  <span class="info-value">{{ formatFullDate(selectedOrder.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Completed At</span>
                  <span class="info-value">{{ selectedOrder.completedAt ? formatFullDate(selectedOrder.completedAt) : 'Pending' }}</span>
                </div>
              </div>
            </div>

            <!-- Products Card -->
            <div class="info-card card-products">
              <h3 class="card-title">Products</h3>
              <div class="products-list">
                <div
                  v-for="(item, index) in selectedOrder.items"
                  :key="index"
                  class="product-item"
                >
                  <div class="product-image">
                    <span class="product-emoji">{{ item.image }}</span>
                  </div>
                  <div class="product-details">
                    <div class="product-header">
                      <span class="product-id">{{ item.productId }}</span>
                      <span class="product-price">${{ item.price }}</span>
                    </div>
                    <div class="product-specs">
                      <span class="spec">{{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Card (no tax) -->
            <div class="info-card summary-card">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">${{ calculateSubtotal() }}</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total</span>
                <span class="summary-value">${{ selectedOrder.total }}</span>
              </div>
            </div>

            <!-- Status display only — no action buttons -->
            <div class="modal-status-bar">
              <span class="status-label">Status</span>
              <span class="status-badge" :class="`badge-${selectedOrder.status}`">
                {{ getStatusLabel(selectedOrder.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor">
          <path v-if="toast.type === 'success'" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import SideBar from "@/components/provider_com/SideBar.vue"
import PageHeader from "@/components/provider_com/PageHeader.vue"

// --- Sample Data ---
const orders = ref([
  {
    id: '#O12780',
    customerId: '#C12780',
    customerName: 'John Smith',
    status: 'pending',
    total: 13,
    createdAt: new Date('2024-02-03'),
    completedAt: null,
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12781',
    customerId: '#C12781',
    customerName: 'Sarah Johnson',
    status: 'delivering',
    total: 13,
    createdAt: new Date('2024-02-03'),
    completedAt: null,
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12782',
    customerId: '#C12782',
    customerName: 'Michael Chen',
    status: 'pending',
    total: 13,
    createdAt: new Date('2024-02-03'),
    completedAt: null,
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12783',
    customerId: '#C12783',
    customerName: 'Emma Wilson',
    status: 'completed',
    total: 20,
    createdAt: new Date('2024-02-05'),
    completedAt: new Date('2024-02-06'),
    items: [
      { productId: '#P12780', image: '🍎', quantity: '3 kg', price: 10 },
      { productId: '#P12767', image: '🥕', quantity: '2 kg', price: 10 },
    ]
  },
  {
    id: '#O12784',
    customerId: '#C12784',
    customerName: 'Robert Brown',
    status: 'completed',
    total: 30,
    createdAt: new Date('2024-02-06'),
    completedAt: new Date('2024-02-07'),
    items: [
      { productId: '#P12790', image: '🍊', quantity: '5 kg', price: 15 },
      { productId: '#P12791', image: '🍇', quantity: '2 kg', price: 15 },
    ]
  },
  {
    id: '#O12785',
    customerId: '#C12785',
    customerName: 'Lisa Anderson',
    status: 'delivering',
    total: 25,
    createdAt: new Date('2024-02-07'),
    completedAt: null,
    items: [
      { productId: '#P12795', image: '🍓', quantity: '1 kg', price: 12 },
      { productId: '#P12796', image: '🥒', quantity: '2 kg', price: 8 },
      { productId: '#P12797', image: '🧄', quantity: '0.5 kg', price: 5 },
    ]
  },
])

// --- Filter & Search State ---
const activeFilter = ref('all')
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const sortOrder = ref('desc') // 'desc' = newest first, 'asc' = oldest first

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const setFilter = (key) => {
  activeFilter.value = key
}

// --- Computed Counts ---
const counts = computed(() => ({
  all: orders.value.length,
  pending: orders.value.filter(o => o.status === 'pending').length,
  delivering: orders.value.filter(o => o.status === 'delivering').length,
  completed: orders.value.filter(o => o.status === 'completed').length,
}))

const statCards = computed(() => [
  { key: 'all', icon: '📦', label: 'Total Orders', count: counts.value.all, color: '#4CAF50' },
  { key: 'pending', icon: '⏳', label: 'Pending', count: counts.value.pending, color: '#FF9800' },
  { key: 'delivering', icon: '🚚', label: 'Delivering', count: counts.value.delivering, color: '#2196F3' },
  { key: 'completed', icon: '✓', label: 'Completed', count: counts.value.completed, color: '#8BC34A' },
])

// --- Filter Orders ---
const filteredOrders = computed(() => {
  let result = orders.value

  if (activeFilter.value !== 'all') {
    result = result.filter(o => o.status === activeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(o =>
      o.id.toLowerCase().includes(query) ||
      o.customerId.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query)
    )
  }

  result = [...result].sort((a, b) => {
    const diff = a.createdAt - b.createdAt
    return sortOrder.value === 'desc' ? -diff : diff
  })

  return result
})

const sectionTitle = computed(() => {
  const map = {
    all: 'All Orders',
    pending: 'Pending Orders',
    delivering: 'Delivering Orders',
    completed: 'Completed Orders',
  }
  return map[activeFilter.value] || 'All Orders'
})

// --- Status Labels ---
const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    delivering: 'Delivering',
    completed: 'Completed',
  }
  return labels[status] || status
}

// --- Modal Functions ---
const openDetailModal = (order) => {
  selectedOrder.value = { ...order }
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

const calculateSubtotal = () => {
  if (!selectedOrder.value) return 0
  return selectedOrder.value.items.reduce((sum, item) => sum + item.price, 0)
}

// --- Search Functions ---
const handleSearch = () => {}

const clearSearch = () => {
  searchQuery.value = ''
}

// --- Toast Notification ---
const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null

const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

// --- Date Formatting ---
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatFullDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
:root {
  --color-primary: #4CAF50;
  --color-pending: #FF9800;
  --color-delivering: #2196F3;
  --color-completed: #8BC34A;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666;
  --color-border: #e0e0e0;
  --color-bg-light: #f5f5f5;
  --color-bg-white: #ffffff;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.12);
}

/* ===== LAYOUT ===== */
.provider-orders {
  background: var(--color-bg-light);
  width: 100%;
  height: 100vh;
  position: fixed;
  inset: 0;
  font-family: 'DM Sans', sans-serif;
}

.orders-container {
  display: flex;
  height: 100%;
}

.sidebar-wrapper {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border-right: 1px solid var(--color-border);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

:deep(.page-header) {
  flex-shrink: 0;
}

.content-wrapper {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-card.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, #f0f9f0 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

/* ===== ORDERS SECTION ===== */
.orders-section {
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
}

.sort-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #f0f9f0;
}

.sort-btn svg:first-child {
  width: 14px;
  height: 14px;
}

.sort-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.sort-arrow.flipped {
  transform: rotate(180deg);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.result-count {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-light);
  padding: 4px 10px;
  border-radius: 16px;
  font-weight: 500;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: var(--color-bg-white);
  font-family: 'DM Sans', sans-serif;
}

.search-input::placeholder {
  color: #bbb;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0;
}

.clear-search-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-light);
}

.clear-search-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* ===== TABLE ===== */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-white);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: fixed;
}

.orders-table thead {
  background: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border);
}

.orders-table th {
  padding: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.orders-table th:first-child { text-align: left; }
.orders-table th:nth-child(2) { text-align: left; }

.orders-table th:nth-child(1) { width: 14.28%; }
.orders-table th:nth-child(2) { width: 14.28%; }
.orders-table th:nth-child(3) { width: 14.28%; }
.orders-table th:nth-child(4) { width: 14.28%; }
.orders-table th:nth-child(5) { width: 14.28%; }
.orders-table th:nth-child(6) { width: 14.28%; }
.orders-table th:nth-child(7) { width: 14.28%; }

.order-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s ease;
  border-left: 3px solid transparent;
}

.order-row:hover { background: var(--color-bg-light); }
.order-row.status-pending { border-left-color: var(--color-pending); }
.order-row.status-delivering { border-left-color: var(--color-delivering); }
.order-row.status-completed { border-left-color: var(--color-completed); }

.order-row td {
  padding: 12px;
  vertical-align: middle;
  color: var(--color-text-primary);
}

.col-order-id { text-align: left; }
.col-customer { text-align: left; }
.col-items { text-align: center; }
.col-total { text-align: center; }
.col-date { text-align: center; }
.col-status { text-align: center; }
.col-action { text-align: center; }

.col-order-id .id-badge {
  display: inline-block;
  padding: 5px 8px;
  background: var(--color-bg-light);
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.col-customer .customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.customer-id {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.col-items .item-count {
  display: inline-block;
  padding: 4px 10px;
  background: #e3f2fd;
  color: #01579b;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
  text-align: center;
  min-width: 35px;
}

.col-total .price {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.95rem;
}

.col-date {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 14px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.badge-pending   { background: #fff3e0; color: #e65100; }
.badge-delivering { background: #e3f2fd; color: #1565c0; }
.badge-completed  { background: #e8f5e9; color: #2e7d32; }

.btn-view-detail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
}

.btn-view-detail:hover {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
}

.btn-view-detail svg {
  width: 13px;
  height: 13px;
}

.empty-row td {
  padding: 0;
  border: none;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state svg {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 8px 0 4px;
}

.empty-state p {
  font-size: 0.85rem;
  margin: 0;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
  animation: modalSlideIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== MODAL HEADER ===== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
  background: #ffffff;
  border-radius: 14px 14px 0 0;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 3px 0;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  border-radius: 8px;
  padding: 0;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #ebebeb;
  color: #1a1a1a;
}

.modal-close-btn svg {
  width: 16px;
  height: 16px;
}

/* ===== MODAL BODY ===== */
.modal-body {
  background: #f8f9fb;
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 0 0 14px 14px;
}

/* ===== INFO CARDS ===== */
.info-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8eaed;
  border-left: 3px solid #e8eaed;
}

.card-customer { border-left-color: #4CAF50; }
.card-order    { border-left-color: #2196F3; }
.card-products { border-left-color: #FF9800; }

.card-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-size: 0.68rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
}

.info-value {
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* ===== PRODUCTS ===== */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fb;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e8eaed;
}

.product-emoji {
  font-size: 1.4rem;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.product-id {
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
}

.product-price {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.product-specs {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.spec {
  display: inline-block;
  padding: 2px 6px;
  background: #ffffff;
  border-radius: 3px;
  font-weight: 500;
  border: 1px solid #e8eaed;
}

/* ===== SUMMARY ===== */
.summary-card {
  background: #ffffff;
  border-left: none !important;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
  padding-top: 12px;
}

.summary-row.total {
  padding: 12px 0 0;
  border-top: 1.5px solid #e8eaed;
}

.summary-label {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.88rem;
}

.summary-row.total .summary-label {
  font-weight: 700;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.summary-value {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.summary-row.total .summary-value {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1rem;
}

/* ===== STATUS BAR (read-only, no buttons) ===== */
.modal-status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.status-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== TOAST ===== */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toast-success { background: var(--color-completed); }
.toast-error   { background: #F44336; }
.toast-warning { background: var(--color-pending); }

/* ===== TRANSITIONS ===== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(100px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .content-wrapper { padding: 20px 24px; }
  .orders-section { padding: 20px; }
}

@media (max-width: 768px) {
  .sidebar-wrapper { display: none; }
  .content-wrapper { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .stat-card { padding: 12px; }
  .stat-number { font-size: 1.2rem; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .orders-table th, .orders-table td { padding: 10px; }
  .btn-view-detail { padding: 5px 8px; font-size: 0.65rem; }
  .modal-content { max-height: 95vh; }
  .info-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .content-wrapper { padding: 12px; gap: 16px; }
  .stats-grid { grid-template-columns: 1fr; gap: 10px; }
  .stat-card { padding: 10px; }
  .stat-icon { width: 40px; height: 40px; font-size: 1.2rem; }
  .orders-table { font-size: 0.8rem; }
  .orders-table th, .orders-table td { padding: 8px; }
  .btn-view-detail { padding: 4px 6px; font-size: 0.6rem; }
  .modal-content { max-width: 95vw; }
  .modal-header { padding: 14px 16px; }
  .modal-body { padding: 14px 16px 18px; gap: 10px; }
}
</style>