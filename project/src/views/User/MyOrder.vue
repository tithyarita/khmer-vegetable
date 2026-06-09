<template>
  <div class="dashboard-layout">
    <DashboardSidebar activeMenu="orders" @navigate="handleNavigate" />

    <main class="main-content">
      <header class="page-header">
        <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
          <i class="bi bi-list"></i>
        </button>
        <div>
          <h1>My Orders</h1>
          <p>View your order history and track deliveries</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="refreshOrders">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </header>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
          type="button"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count">{{ countByStatus(tab.key) }}</span>
        </button>
      </div>

      <!-- States -->
      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <div v-else-if="error" class="state-card error">
        <i class="bi bi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="primary-btn" type="button" @click="refreshOrders">Try Again</button>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="state-card">
        <i class="bi bi-bag"></i>
        <h3>No orders found</h3>
        <p>{{ activeTab === 'all' ? "You haven't placed any orders yet." : `No ${activeTab} orders right now.` }}</p>
        <router-link to="/home" class="primary-btn">Start Shopping</router-link>
      </div>

      <!-- Order list -->
      <div v-else class="orders-list">
        <article v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="card-header">
            <div>
              <span class="order-code">{{ order.orderCode }}</span>
              <span class="order-date">{{ order.meta }}</span>
            </div>
            <span :class="['status-badge', order.statusClass]">
              <span v-if="order.status === 'pending'" class="pulse-dot"></span>
              {{ order.statusLabel }}
            </span>
          </div>

          <div class="card-body">
            <div class="provider-row">
              <i class="bi bi-shop"></i>
              <span>{{ order.providerName }}</span>
            </div>
            <p class="items-summary">{{ order.itemsLabel }}</p>
            <div class="card-meta">
              <span><i class="bi bi-box"></i> {{ order.itemCount }} items</span>
              <span><i class="bi bi-credit-card"></i> {{ order.paymentMethod }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="total">${{ order.price }}</span>
            <div class="actions">
              <button class="ghost-btn" type="button" @click="openDetail(order)">
                <i class="bi bi-eye"></i> Details
              </button>
              <button
                v-if="order.status !== 'completed'"
                class="primary-btn sm"
                type="button"
                @click="trackOrder(order)"
              >
                <i class="bi bi-truck"></i> Track
              </button>
              <button v-else class="primary-btn sm outline" type="button" @click="openDetail(order)">
                View Receipt
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Order Details</h2>
            <p>{{ selectedOrder.orderCode }}</p>
          </div>
          <button class="close-btn" type="button" @click="closeDetail">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Status</span>
              <span :class="['status-badge', selectedOrder.statusClass]">{{ selectedOrder.statusLabel }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Provider</span>
              <span class="value">{{ selectedOrder.providerName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Payment</span>
              <span class="value">{{ selectedOrder.paymentMethod }} ({{ selectedOrder.paymentStatus }})</span>
            </div>
            <div class="detail-item">
              <span class="label">Date</span>
              <span class="value">{{ selectedOrder.meta.replace('Placed on ', '') }}</span>
            </div>
          </div>

          <h3 class="section-label">Order Items</h3>
          <div class="items-table">
            <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
              <div class="item-img-wrap">
                <img v-if="itemImage(item.image)" :src="itemImage(item.image)" :alt="item.name" />
                <span v-else class="item-fallback">{{ item.name.charAt(0) }}</span>
              </div>
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">Qty: {{ item.quantity }}</span>
              </div>
              <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="total-row">
            <span>Order Total</span>
            <span class="total-amount">${{ selectedOrder.price }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="ghost-btn" type="button" @click="closeDetail">Close</button>
          <button
            v-if="selectedOrder.status !== 'completed'"
            class="primary-btn"
            type="button"
            @click="trackOrder(selectedOrder)"
          >
            <i class="bi bi-truck"></i> Track Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCustomerOrderStore } from '@/stores/customerOrderStore'
import DashboardSidebar from '../../components/Customer/sidebarUser.vue'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const router = useRouter()
const customerOrderStore = useCustomerOrderStore()
const { orders, loading, error } = storeToRefs(customerOrderStore)

const activeTab = ref('all')
const selectedOrder = ref(null)

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'delivering', label: 'Delivery' },
  { key: 'completed', label: 'Completed' },
]

const isSidebarOpen = ref(false)
const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
provide('isSidebarOpen', isSidebarOpen)
provide('closeSidebar', closeSidebar)

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === activeTab.value)
})

function countByStatus(key) {
  if (key === 'all') return orders.value.length
  return orders.value.filter((o) => o.status === key).length
}

function itemImage(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

async function refreshOrders() {
  await customerOrderStore.fetchCustomerOrders()
}

function handleNavigate(section) {
  if (section === 'dashboard') router.push('/profile')
  else if (section === 'track') router.push('/order-tracker')
}

function openDetail(order) {
  selectedOrder.value = order
}

function closeDetail() {
  selectedOrder.value = null
}

function trackOrder(order) {
  closeDetail()
  router.push(`/order-tracker/${order.id}`)
}

refreshOrders()
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
  background: #f4f7f5;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 36px 48px;
  max-width: 960px;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a2e1f;
}

.page-header p {
  margin: 4px 0 0;
  color: #6b7c72;
  font-size: 0.92rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #555;
  cursor: pointer;
  padding: 4px;
}

.refresh-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #dde5df;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5c50;
  cursor: pointer;
}

.refresh-btn:hover:not(:disabled) {
  background: #eaf5ee;
  border-color: #b8dfc4;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid #dde5df;
  background: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7c72;
  cursor: pointer;
  transition: all 0.15s;
}

.tab.active {
  background: #2d7a3a;
  border-color: #2d7a3a;
  color: #fff;
}

.tab-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

.state-card {
  text-align: center;
  padding: 56px 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  color: #6b7c72;
}

.state-card i {
  font-size: 2.5rem;
  color: #c5d4ca;
  display: block;
  margin-bottom: 12px;
}

.state-card h3 {
  margin: 0 0 6px;
  color: #1a2e1f;
}

.state-card.error i {
  color: #f87171;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8ede9;
  border-top-color: #2d7a3a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(45, 122, 58, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 12px;
  gap: 12px;
}

.order-code {
  display: block;
  font-weight: 700;
  color: #1a2e1f;
  font-size: 0.95rem;
}

.order-date {
  font-size: 0.8rem;
  color: #8a9a90;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.badge-pending {
  background: #fef3c7;
  color: #d97706;
}

.badge-delivering {
  background: #dbeafe;
  color: #2563eb;
}

.badge-completed {
  background: #e8f5ec;
  color: #2d7a3a;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d97706;
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card-body {
  padding: 0 20px 14px;
}

.provider-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #4a5c50;
  font-weight: 600;
  margin-bottom: 6px;
}

.items-summary {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #1a2e1f;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: #8a9a90;
}

.card-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f9fbf9;
  border-top: 1px solid #f0f4f1;
  gap: 12px;
  flex-wrap: wrap;
}

.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d7a3a;
}

.actions {
  display: flex;
  gap: 8px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2d7a3a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.primary-btn.sm {
  padding: 8px 14px;
}

.primary-btn.outline {
  background: transparent;
  color: #2d7a3a;
  border: 1.5px solid #2d7a3a;
}

.primary-btn:hover {
  background: #246830;
}

.primary-btn.outline:hover {
  background: #eaf5ee;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #4a5c50;
  border: 1.5px solid #dde5df;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn:hover {
  background: #f4f7f5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 24px 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #1a2e1f;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #8a9a90;
}

.close-btn {
  background: #f4f7f5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7c72;
}

.modal-body {
  padding: 20px 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-item .label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8a9a90;
  margin-bottom: 4px;
}

.detail-item .value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2e1f;
}

.section-label {
  margin: 0 0 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #4a5c50;
}

.items-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9fbf9;
  border-radius: 12px;
}

.item-img-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #e8f5ec;
  flex-shrink: 0;
}

.item-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 700;
  color: #2d7a3a;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e1f;
}

.item-qty {
  font-size: 0.78rem;
  color: #8a9a90;
}

.item-price {
  font-weight: 700;
  color: #2d7a3a;
  font-size: 0.9rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e8f5ec;
  font-weight: 700;
  font-size: 1rem;
}

.total-amount {
  color: #2d7a3a;
  font-size: 1.2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 22px;
  border-top: 1px solid #f0f4f1;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-content {
    padding: 20px 16px 32px;
  }

  .refresh-btn {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    width: 100%;
  }

  .actions .ghost-btn,
  .actions .primary-btn {
    flex: 1;
    justify-content: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
