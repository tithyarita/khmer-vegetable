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
          <!-- Stats Cards with Enhanced Design -->
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
            <div class="section-header">
              <h2 class="section-title">{{ sectionTitle }}</h2>
              <span class="result-count">{{ filteredOrders.length }} orders</span>
            </div>

            <!-- Search Bar -->
            <div class="search-bar">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search order ID or customer..."
                class="search-input"
                @input="handleSearch"
              />
              <button
                v-if="searchQuery"
                class="clear-search-btn"
                @click="clearSearch"
                title="Clear search"
              >
                ✕
              </button>
            </div>

            <!-- Orders Table -->
            <div class="table-wrapper">
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
                        <svg viewBox="0 0 64 64" fill="none">
                          <rect x="8" y="16" width="40" height="36" rx="2" stroke="currentColor" stroke-width="2"/>
                          <path d="M8 20h40" stroke="currentColor" stroke-width="2"/>
                          <circle cx="16" cy="28" r="2" fill="currentColor"/>
                          <circle cx="24" cy="28" r="2" fill="currentColor"/>
                          <circle cx="32" cy="28" r="2" fill="currentColor"/>
                        </svg>
                        <p>No orders found</p>
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="order-row"
                    :class="`status-${order.status}`"
                  >
                    <td class="order-id">
                      <span class="id-badge">{{ order.id }}</span>
                    </td>

                    <td class="customer-name">
                      <span class="name-text">{{ order.customerName }}</span>
                      <span class="customer-id">{{ order.customerId }}</span>
                    </td>

                    <td class="items-count">
                      <span class="item-badge">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</span>
                    </td>

                    <td class="total-price">
                      <span class="price-text">${{ order.total }}</span>
                    </td>

                    <td class="created-date">
                      {{ formatDate(order.createdAt) }}
                    </td>

                    <td class="status-cell">
                      <span class="status-badge" :class="`badge-${order.status}`">
                        {{ getStatusLabel(order.status) }}
                      </span>
                    </td>

                    <td class="action-cell">
                      <button
                        class="action-btn view-detail-btn"
                        @click="openDetailModal(order)"
                        title="View order details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Detail
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
            <button class="modal-close-btn" @click="closeDetailModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Customer Info Card -->
            <div class="info-card">
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
            <div class="info-card">
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
            <div class="info-card">
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

            <!-- Summary Card -->
            <div class="info-card summary-card">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">${{ calculateSubtotal() }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Tax</span>
                <span class="summary-value">$0</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total</span>
                <span class="summary-value">${{ selectedOrder.total }}</span>
              </div>
            </div>

            <!-- Status & Actions -->
            <div class="modal-actions">
              <div class="status-info">
                <span class="status-label">Status:</span>
                <span class="status-badge" :class="`badge-${selectedOrder.status}`">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div class="action-buttons">
                <button
                  v-if="selectedOrder.status === 'pending'"
                  class="action-primary"
                  @click="updateStatus(selectedOrder, 'delivering')"
                >
                  Mark as Delivering
                </button>
                <button
                  v-if="selectedOrder.status === 'delivering'"
                  class="action-primary"
                  @click="updateStatus(selectedOrder, 'completed')"
                >
                  Mark as Completed
                </button>
                <button class="action-secondary" @click="closeDetailModal">
                  Close
                </button>
              </div>
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
import SideBar from "@/components/provider_com/sideBar.vue"
import PageHeader from "@/components/provider_com/pageHeader.vue"

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

// --- Update Status ---
const updateStatus = (order, newStatus) => {
  const originalOrder = orders.value.find(o => o.id === order.id)
  if (originalOrder) {
    originalOrder.status = newStatus
    if (newStatus === 'completed') {
      originalOrder.completedAt = new Date()
    }
    showToast(`Order ${order.id} marked as ${getStatusLabel(newStatus)}`, 'success')
    closeDetailModal()
  }
}

// --- Search Functions ---
const handleSearch = () => {
  // Real-time search filtering via computed property
}

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
  max-width: 1260px;
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
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
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
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ===== ORDERS SECTION ===== */
.orders-section {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.result-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-light);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: var(--color-bg-light);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-bg-white);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-light);
  border-radius: 6px;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table thead {
  background: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border);
}

.orders-table th {
  padding: 14px 16px;
  text-align: left;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.order-row {
  border-bottom: 1px solid var(--color-border);
  transition: all 0.15s ease;
}

.order-row:hover {
  background: var(--color-bg-light);
}

.order-row.status-pending {
  border-left: 3px solid var(--color-pending);
}

.order-row.status-delivering {
  border-left: 3px solid var(--color-delivering);
}

.order-row.status-completed {
  border-left: 3px solid var(--color-completed);
}

.order-row td {
  padding: 16px;
  vertical-align: middle;
  color: var(--color-text-primary);
}

.order-id {
  font-weight: 600;
}

.id-badge {
  display: inline-block;
  padding: 6px 10px;
  background: var(--color-bg-light);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.customer-name {
  min-width: 150px;
}

.name-text {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
}

.customer-id {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.items-count {
  text-align: center;
}

.item-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #e8f4f8;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #01579b;
}

.total-price {
  font-weight: 600;
  font-size: 1rem;
}

.price-text {
  color: var(--color-primary);
}

.created-date {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.status-cell {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-pending {
  background: #fff3e0;
  color: #e65100;
}

.badge-delivering {
  background: #e3f2fd;
  color: #1565c0;
}

.badge-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-cell {
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.view-detail-btn {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.view-detail-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.view-detail-btn svg {
  width: 16px;
  height: 16px;
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
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
  color: var(--color-text-secondary);
}

.empty-state p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--color-bg-white);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 8px;
}

.modal-close-btn:hover {
  background: var(--color-bg-light);
  color: var(--color-text-primary);
}

.modal-close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: var(--color-bg-light);
  border-radius: 12px;
  padding: 18px;
  border: 1px solid var(--color-border);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.info-value {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: var(--color-bg-white);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--color-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-emoji {
  font-size: 1.6rem;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-size: 0.85rem;
}

.product-price {
  font-weight: 700;
  color: var(--color-primary);
}

.product-specs {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.spec {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-bg-light);
  border-radius: 4px;
  font-weight: 500;
}

.summary-card {
  border-top: 2px solid var(--color-border);
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  padding: 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: none;
}

.summary-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-actions {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg-light);
  border-radius: 8px;
}

.status-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.3px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-primary,
.action-secondary {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.action-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.action-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.action-secondary {
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.action-secondary:hover {
  background: var(--color-border);
}

/* ===== TOAST ===== */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-success {
  background: var(--color-completed);
}

.toast-error {
  background: #F44336;
}

.toast-warning {
  background: var(--color-pending);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(100px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 14px;
    border-radius: 10px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .orders-table th,
  .orders-table td {
    padding: 12px 10px;
    font-size: 0.8rem;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .modal-content {
    border-radius: 12px;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
    gap: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-primary,
  .action-secondary {
    min-width: 100px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .sidebar-wrapper {
    display: none;
  }

  .orders-container {
    flex-direction: column;
  }

  .content-wrapper {
    padding: 12px 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .orders-table {
    font-size: 0.75rem;
  }

  .orders-table th,
  .orders-table td {
    padding: 8px;
  }

  .view-detail-btn {
    padding: 6px 8px;
    font-size: 0.7rem;
  }

  .modal-content {
    max-width: 95vw;
  }
}
</style>