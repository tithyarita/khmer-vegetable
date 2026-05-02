<template>
  <div class="provider-orders">
    <!-- Sidebar -->
    <div class="sidebar-wrapper">
      <SideBar />
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <PageHeader title="Provider Orders" />

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="stat-card"
          :class="{ active: activeFilter === card.key }"
          @click="setFilter(card.key)"
        >
          <span class="stat-number" :style="{ color: card.color }">
            {{ card.count }}
          </span>
          <span class="stat-label">{{ card.label }}</span>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="orders-section">
        <h2 class="section-title">{{ sectionTitle }}</h2>

        <div class="table-wrapper">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order_id</th>
                <th>Customer_id</th>
                <th>Product_id</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total_price</th>
                <th>Create_at</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="order in filteredOrders" :key="order.id">
                <tr
                  v-for="(item, index) in order.items"
                  :key="`${order.id}-${index}`"
                  class="order-row"
                  :class="getRowClass(order.status)"
                >
                  <td v-if="index === 0" :rowspan="order.items.length">
                    {{ order.id }}
                  </td>

                  <td v-if="index === 0" :rowspan="order.items.length">
                    {{ order.customerId }}
                  </td>

                  <td>{{ item.productId }}</td>

                  <td>
                    <div class="product-image">
                      <span class="product-emoji">{{ item.image }}</span>
                    </div>
                  </td>

                  <td>{{ item.quantity }}</td>
                  <td>${{ item.price }}</td>

                  <td v-if="index === 0" :rowspan="order.items.length">
                    ${{ order.total }}
                  </td>

                  <td v-if="index === 0" :rowspan="order.items.length">
                    {{ formatDate(order.createdAt) }}
                  </td>

                  <td v-if="index === 0" :rowspan="order.items.length">
                    <span class="status-badge" :class="`status-${order.status}`">
                      {{ capitalize(order.status) }}
                    </span>
                  </td>

                  <td
                    v-if="index === 0"
                    :rowspan="order.items.length"
                    class="action-cell"
                  >
                    <button
                      class="action-btn confirm-btn"
                      @click="handleConfirm(order)"
                      :title="getConfirmTitle(order.status)"
                    >✓</button>

                    <button
                      class="action-btn reject-btn"
                      @click="handleReject(order)"
                      :title="getRejectTitle(order.status)"
                    >✕</button>
                  </td>
                </tr>
              </template>

              <tr v-if="filteredOrders.length === 0">
                <td colspan="10" class="empty-state">No orders found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
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
    id: '#O12780', customerId: '#C12780', status: 'pending', total: 13,
    createdAt: new Date('2020-02-03'),
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12781', customerId: '#C12781', status: 'cancel', total: 13,
    createdAt: new Date('2020-02-03'),
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12782', customerId: '#C12782', status: 'pending', total: 13,
    createdAt: new Date('2020-02-03'),
    items: [
      { productId: '#P12780', image: '🥦', quantity: '2 kg', price: 2 },
      { productId: '#P12767', image: '🌽', quantity: '2 kg', price: 6 },
      { productId: '#P12721', image: '🥩', quantity: '2 kg', price: 5 },
    ]
  },
  {
    id: '#O12783', customerId: '#C12783', status: 'delivered', total: 20,
    createdAt: new Date('2020-02-05'),
    items: [
      { productId: '#P12780', image: '🍎', quantity: '3 kg', price: 10 },
      { productId: '#P12767', image: '🥕', quantity: '2 kg', price: 10 },
    ]
  },
  {
    id: '#O12784', customerId: '#C12784', status: 'complete', total: 30,
    createdAt: new Date('2020-02-06'),
    items: [
      { productId: '#P12790', image: '🍊', quantity: '5 kg', price: 15 },
      { productId: '#P12791', image: '🍇', quantity: '2 kg', price: 15 },
    ]
  },
])

// --- Filter State ---
const activeFilter = ref('all')

const setFilter = (key) => {
  activeFilter.value = key
}

// --- Computed Counts ---
const counts = computed(() => ({
  all: orders.value.length,
  pending: orders.value.filter(o => o.status === 'pending').length,
  delivered: orders.value.filter(o => o.status === 'delivered').length,
  cancel: orders.value.filter(o => o.status === 'cancel').length,
  complete: orders.value.filter(o => o.status === 'complete').length,
}))

const statCards = computed(() => [
  { key: 'all',       label: 'order count',    count: counts.value.all,       color: '#4CAF50' },
  { key: 'pending',   label: 'pending count',  count: counts.value.pending,   color: '#FF9800' },
  { key: 'delivered', label: 'Delivered count',count: counts.value.delivered, color: '#2196F3' },
  { key: 'cancel',    label: 'Cancel orders',  count: counts.value.cancel,    color: '#F44336' },
  { key: 'complete',  label: 'Completes',      count: counts.value.complete,  color: '#2196F3' },
])

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeFilter.value)
})

const sectionTitle = computed(() => {
  const map = {
    all: 'All Orders',
    pending: 'Pending Orders',
    delivered: 'Delivered Orders',
    cancel: 'Cancelled Orders',
    complete: 'Completed Orders',
  }
  return map[activeFilter.value] || 'All Orders'
})

// --- Actions ---
const getRowClass = (status) => `row-${status}`

const getConfirmTitle = (status) => {
  if (status === 'pending') return 'Mark as Delivered'
  if (status === 'delivered') return 'Mark as Complete'
  return ''
}

const getRejectTitle = (status) => {
  if (status === 'pending') return 'Cancel Order'
  if (status === 'delivered') return 'Revert to Pending'
  return ''
}

const handleConfirm = (order) => {
  if (order.status === 'pending') {
    order.status = 'delivered'
    showToast(`Order ${order.id} marked as Delivered`, 'success')
  } else if (order.status === 'delivered') {
    order.status = 'complete'
    showToast(`Order ${order.id} marked as Complete`, 'success')
  }
}

const handleReject = (order) => {
  if (order.status === 'pending') {
    order.status = 'cancel'
    showToast(`Order ${order.id} cancelled`, 'error')
  } else if (order.status === 'delivered') {
    order.status = 'pending'
    showToast(`Order ${order.id} reverted to Pending`, 'warning')
  }
}

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

// --- Helpers ---
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const formatDate = (date) => {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
}
</script>

<style scoped>
.provider-orders {
  
  display: flex;
  min-height: 100vh;
  background: #f5f8f0;
  font-family: 'Segoe UI', sans-serif

}

.sidebar-wrapper {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  height: 100vh;
  
}

.main-content {
  flex: 1;
  padding: 0 24px 28px; 
  
}

:deep(.page-header) {
  margin-bottom: 24px; /* ✅ controls space */
}



/* --- Stats Grid --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #e8f5e9;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}

.stat-card.active {
  border-color: #66BB6A;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

/* --- Orders Section --- */
.orders-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 20px;
}

.table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.orders-table thead tr {
  border-bottom: 2px solid #e0e0e0;
}

.orders-table th {
  padding: 12px 14px;
  text-align: left;
  color: #555;
  font-weight: 600;
  white-space: nowrap;
}

/* Row backgrounds by status */
.order-row.row-pending   { background: #f1f8e9; }
.order-row.row-cancel    { background: #fce4ec; }
.order-row.row-delivered { background: #e3f2fd; }
.order-row.row-complete  { background: #e8f5e9; }

.order-row td {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  color: #444;
  white-space: nowrap;
}

.order-meta {
  font-weight: 500;
}

/* Product Image */
.product-image {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
}

.product-emoji {
  font-size: 1.4rem;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-pending   { background: #FF9800; color: white; }
.status-cancel    { background: #F44336; color: white; }
.status-delivered { background: #2196F3; color: white; }
.status-complete  { background: #4CAF50; color: white; }

/* Action Buttons */
.action-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.confirm-btn {
  background: #e8f5e9;
  color: #2e7d32;
}

.confirm-btn:hover {
  background: #4CAF50;
  color: white;
  transform: scale(1.1);
}

.reject-btn {
  background: #fce4ec;
  color: #c62828;
}

.reject-btn:hover {
  background: #F44336;
  color: white;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px;
  color: #aaa;
  font-size: 1rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.toast-success  { background: #4CAF50; }
.toast-error    { background: #F44336; }
.toast-warning  { background: #FF9800; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>