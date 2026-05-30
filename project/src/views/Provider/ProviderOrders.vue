<template>
  <div class="provider-orders">
    <div class="orders-container">
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <div class="main-content">
        <PageHeader title="Provider Orders" />

        <div class="content-wrapper">  
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

          <div v-if="loading" class="state-box">Loading orders...</div>
          <div v-else-if="error" class="state-box error-box">{{ error }}</div>

          <div v-else class="orders-section">
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
              />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''" aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

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
                    :key="order.orderId"
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
                      <span class="item-count">{{ order.item }}</span>
                    </td>
                    <td class="col-total">
                      <span class="price">${{ order.total.toFixed(2) }}</span>
                    </td>
                    <td class="col-date">
                      {{ formatDate(order.createdAt) }}
                    </td>
                    <td class="col-status">
                      <button
                        v-if="order.status === 'pending'"
                        class="btn btn-pending"
                        @click="updateStatus(order, 'delivering')"
                      >
                        Pending
                      </button>
                      <button
                        v-else-if="order.status === 'delivering'"
                        class="btn btn-delivering"
                        @click="updateStatus(order, 'completed')"
                      >
                        Delivering
                      </button>
                      <span v-else class="done-text">✓ Completed</span>
                    </td>
                    <td class="col-action">
                      <button class="btn-view-detail" @click="openDetailModal(order)" title="View order details">
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

    <transition name="modal">
      <div v-if="showDetailModal && selectedOrder" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content" @click.stop>
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

          <div class="modal-body">
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

            <div class="info-card card-order">
              <h3 class="card-title">Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Created At</span>
                  <span class="info-value">{{ formatFullDate(selectedOrder.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Payment Method</span>
                  <span class="info-value" style="text-transform: uppercase; font-weight: 700; color: #1e3a8a;">
                    {{ selectedOrder.paymentMethod }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="selectedOrder.paymentMethod === 'bank'" class="info-card card-receipt">
              <h3 class="card-title">Customer Remittance Receipt</h3>
              <div class="receipt-wrapper">
                <div v-if="selectedOrder.receiptUrl" class="receipt-container">
                  <img 
                    :src="selectedOrder.receiptUrl.startsWith('http') ? selectedOrder.receiptUrl : `${API_BASE_URL}${selectedOrder.receiptUrl}`" 
                    class="receipt-preview-img" 
                    alt="Customer Payment Receipt"
                    @click="openReceipt(selectedOrder.receiptUrl)"
                  />
                  <p class="receipt-hint">💡 Click image to open file layout full size</p>
                </div>
                <div v-else class="no-receipt-error">
                  <span>⚠️ No receipt image attached by customer.</span>
                </div>
              </div>
            </div>

            <div class="info-card summary-card">
              <div class="summary-row total">
                <span class="summary-label">Total</span>
                <span class="summary-value">${{ selectedOrder.total.toFixed(2) }}</span>
              </div>
            </div>

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
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import SideBar from "@/components/provider_com/sideBar.vue"
import PageHeader from "@/components/common/PageHeader.vue"
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const userStore = useUserStore()

const getProviderId = () => {
  const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
  console.log('USER FROM STORE:', user)
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

// --- State ---
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const activeFilter = ref('all')
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const sortOrder = ref('desc')

// --- Toast ---
const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

// --- Fetch Orders ---
const fetchOrders = async () => {
  loading.value = true
  error.value = null

  const providerId = getProviderId()
  if (!providerId) {
    error.value = 'Provider account not found. Please log in again.'
    loading.value = false
    return
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/orders/provider/${providerId}`)
    orders.value = response.data.map(order => {
      const customerRawId = order.customer?.id ?? order.customer_id
      return {
        orderId: order.id,
        id: order.order_code || `#O${order.id}`,
        customerIdRaw: customerRawId,
        customerId: `#C${customerRawId}`,
        customerName: order.customer?.name || `Customer ${order.customer_id}`,
        status: order.status,
        total: parseFloat(order.total),
        createdAt: new Date(order.created_at),
        completedAt: order.completed_at ? new Date(order.completed_at) : null,
        items: [],
        item: order.item ?? 1,
        // ✅ Map database fields correctly for payment verification
        paymentMethod: order.payment_method || order.paymentMethod || 'bank',
        receiptUrl: order.receipt_url || order.receipt || order.payment_receipt || null
      }
    })
  } catch (err) {
    error.value = err.message || 'Failed to load orders'
    console.error('Error fetching orders:', err)
    showToast('Failed to load orders', 'error')
  } finally {
    loading.value = false
  }
}
let pollInterval = null

onMounted(() => {

  fetchOrders()

  pollInterval = setInterval(fetchOrders, 10000)

})

onUnmounted(() => {

  if (pollInterval) clearInterval(pollInterval)

})

// --- Sort / Filter ---
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const setFilter = (key) => {
  activeFilter.value = key
}

// --- Counts ---
const counts = computed(() => ({
  all: orders.value.length,
  pending: orders.value.filter(o => o.status === 'pending').length,
  delivering: orders.value.filter(o => o.status === 'delivering').length,
  completed: orders.value.filter(o => o.status === 'completed').length,
}))

const statCards = computed(() => [
  { key: 'all',        icon: '📦', label: 'Total Orders', count: counts.value.all,        color: '#4CAF50' },
  { key: 'pending',    icon: '⏳', label: 'Pending',       count: counts.value.pending,    color: '#FF9800' },
  { key: 'delivering', icon: '🚚', label: 'Delivering',    count: counts.value.delivering, color: '#2196F3' },
  { key: 'completed',  icon: '✓',  label: 'Completed',     count: counts.value.completed,  color: '#8BC34A' },
])

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

  return [...result].sort((a, b) => {
    const diff = a.createdAt - b.createdAt
    return sortOrder.value === 'desc' ? -diff : diff
  })
})

const sectionTitle = computed(() => ({
  all: 'All Orders', pending: 'Pending Orders',
  delivering: 'Delivering Orders', completed: 'Completed Orders',
})[activeFilter.value] || 'All Orders')

// --- Status Label ---
const getStatusLabel = (status) => ({
  pending: 'Pending', delivering: 'Delivering', completed: 'Completed'
})[status] || status

// --- Update Status ---
const updateStatus = async (order, status) => {
  try {
    console.log('Updating order:', order.orderId, status)

    await axios.patch(
      `${API_BASE_URL}/orders/${order.orderId}/status`,
      { status }
    )

    const local = orders.value.find(o => o.orderId === order.orderId)

    if (local) local.status = status

    if (selectedOrder.value?.orderId === order.orderId)

      selectedOrder.value.status = status

    await fetchOrders()
    showToast('Order status updated successfully')
  } catch (error) {
    console.error('UPDATE ERROR:', error.response?.data || error.message)
    showToast('Failed to update order status', 'error')
  }
}

// --- Modal Controls ---
const openDetailModal = (order) => {
  selectedOrder.value = { ...order }
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}
const openReceipt = (url) => {

  const full = url.startsWith('http')

    ? url

    : `${API_BASE_URL}${url}`

  window.open(full, '_blank')

}

// --- Date Formatting ---
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const formatFullDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
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
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

:deep(.page-header) { flex-shrink: 0; }

.content-wrapper {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* State boxes */
.state-box {
  text-align: center;
  padding: 3rem;
  background: var(--color-bg-white);
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-size: 1rem;
}
.error-box {
  background: #fee2e2;
  color: #dc2626;
}

/* Stats */
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

/* Orders section */
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

.sort-btn svg:first-child { width: 14px; height: 14px; }
.sort-arrow { width: 14px; height: 14px; transition: transform 0.2s ease; }
.sort-arrow.flipped { transform: rotate(180deg); }

/* Search */
.search-bar { position: relative; }
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
  box-sizing: border-box;
}

.search-input::placeholder { color: #bbb; }
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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0;
}

.clear-search-btn:hover { color: var(--color-text-primary); background: var(--color-bg-light); }
.clear-search-btn svg { width: 16px; height: 16px; }

/* Table */
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

.orders-table th:nth-child(1) { width: 14.28%; text-align: left; }
.orders-table th:nth-child(2) { width: 14.28%; text-align: left; }
.orders-table th:nth-child(3) { width: 10%; }
.orders-table th:nth-child(4) { width: 12%; }
.orders-table th:nth-child(5) { width: 16%; }
.orders-table th:nth-child(6) { width: 14%; }
.orders-table th:nth-child(7) { width: 12%; }

.order-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s ease;
  border-left: 3px solid transparent;
}

.order-row:hover { background: var(--color-bg-light); }
.order-row.status-pending    { border-left-color: var(--color-pending); }
.order-row.status-delivering { border-left-color: var(--color-delivering); }
.order-row.status-completed  { border-left-color: var(--color-completed); }

.order-row td { padding: 12px; vertical-align: middle; color: var(--color-text-primary); }
.col-order-id { text-align: left; }
.col-customer { text-align: left; }
.col-items    { text-align: center; }
.col-total    { text-align: center; }
.col-date     { text-align: center; }
.col-status   { text-align: center; }
.col-action   { text-align: center; }

.id-badge {
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

.customer-info { display: flex; flex-direction: column; gap: 2px; }
.customer-name { font-weight: 500; color: var(--color-text-primary); font-size: 0.9rem; }
.customer-id { font-size: 0.7rem; color: var(--color-text-secondary); }

.item-count {
  display: inline-block;
  padding: 4px 10px;
  background: #e3f2fd;
  color: #01579b;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 35px;
  text-align: center;
}

.price { font-weight: 600; color: var(--color-primary); font-size: 0.95rem; }
.col-date { color: var(--color-text-secondary); font-size: 0.85rem; white-space: nowrap; }

/* Status buttons */
.btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pending { background: #FF9800; color: white; }
.btn-pending:hover { background: #F57C00; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3); }
.btn-delivering { background: #2196F3; color: white; }
.btn-delivering:hover { background: #1976D2; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3); }
.done-text { font-size: 0.75rem; font-weight: 700; color: #4CAF50; }

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

.btn-view-detail:hover { background: #1976D2; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3); }
.btn-view-detail svg { width: 13px; height: 13px; }

/* Empty state */
.empty-row td { padding: 0; border: none; }
.empty-state { padding: 60px 20px; text-align: center; color: var(--color-text-secondary); }
.empty-state svg { width: 56px; height: 56px; margin-bottom: 16px; opacity: 0.5; }
.empty-state h3 { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 8px 0 4px; }
.empty-state p { font-size: 0.85rem; margin: 0; }

/* Modal Styles */
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
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
  border-radius: 14px 14px 0 0;
}

.modal-title-section { flex: 1; }
.modal-title { font-size: 1.2rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 3px 0; }
.modal-subtitle { font-size: 0.8rem; color: #999; margin: 0; font-family: 'Courier New', monospace; font-weight: 600; }

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

.modal-close-btn:hover { background: #ebebeb; color: #1a1a1a; }
.modal-close-btn svg { width: 16px; height: 16px; }

.modal-body {
  background: #f8f9fb;
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 0 0 14px 14px;
}

.info-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8eaed;
  border-left: 3px solid #e8eaed;
}

.card-customer { border-left-color: #4CAF50; }
.card-order    { border-left-color: #2196F3; }
.card-receipt  { border-left-color: #1e3a8a; }

.card-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; gap: 3px; }
.info-label { font-size: 0.68rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; }
.info-value { font-size: 0.9rem; color: var(--color-text-primary); font-weight: 500; }

/* ✅ Receipt CSS Elements */
.receipt-wrapper {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.receipt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.receipt-preview-img {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  background: #fff;
  transition: transform 0.2s ease;
}

.receipt-preview-img:hover {
  transform: scale(1.02);
}

.receipt-hint {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.no-receipt-error {
  padding: 12px;
  background: #fff1f2;
  border: 1px dashed #fecdd3;
  color: #be123c;
  font-size: 13px;
  border-radius: 8px;
  text-align: center;
}

/* Summary */
.summary-card { background: #ffffff; border-left: none !important; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; }
.summary-row.total { border-top: 1.5px solid #e8eaed; padding-top: 12px; }
.summary-label { color: var(--color-text-secondary); font-weight: 500; font-size: 0.88rem; }
.summary-row.total .summary-label { font-weight: 700; color: var(--color-text-primary); font-size: 0.95rem; }
.summary-value { font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem; }
.summary-row.total .summary-value { font-weight: 700; color: var(--color-primary); font-size: 1rem; }

/* Status bar */
.modal-status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.status-label { font-size: 0.72rem; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.status-badge { display: inline-block; padding: 5px 12px; border-radius: 14px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.badge-pending    { background: #fff3e0; color: #e65100; }
.badge-delivering { background: #e3f2fd; color: #1565c0; }
.badge-completed  { background: #e8f5e9; color: #2e7d32; }

/* Toast */
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

.toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
.toast-success { background: #4CAF50; }
.toast-error   { background: #F44336; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
.toast-enter-active, .toast-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px) translateX(100px); }

/* Responsive */
@media (max-width: 1024px) { .content-wrapper { padding: 20px 24px; } .orders-section  { padding: 20px; } }
@media (max-width: 768px) {
  .sidebar-wrapper { display: none; }
  .content-wrapper { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .stat-card  { padding: 12px; }
  .stat-number { font-size: 1.2rem; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .orders-table th, .orders-table td { padding: 10px; }
  .btn-view-detail { padding: 5px 8px; font-size: 0.65rem; }
  .modal-content { max-height: 95vh; }
  .info-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .content-wrapper { padding: 12px; gap: 16px; }
  .stats-grid { grid-template-columns: 1fr; gap: 10px; }
  .stat-card  { padding: 10px; }
  .stat-icon  { width: 40px; height: 40px; font-size: 1.2rem; }
  .orders-table { font-size: 0.8rem; }
  .orders-table th, .orders-table td { padding: 8px; }
  .btn-view-detail { padding: 4px 6px; font-size: 0.6amp; }
  .modal-content { max-width: 95vw; }
  .modal-header { padding: 14px 16px; }
  .modal-body   { padding: 14px 16px 18px; gap: 10px; }
}
</style>