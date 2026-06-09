<template>
  <div class="dashboard-layout">
    <DashboardSidebar activeMenu="track" @navigate="onNavigate" />

    <main class="main-content">
      <header class="page-header">
        <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
          <i class="bi bi-list"></i>
        </button>
        <div>
          <h1>Order Tracker</h1>
          <p>Follow your order status in real time</p>
        </div>
        <button
          v-if="selectedOrderId"
          class="refresh-btn"
          type="button"
          :disabled="loading"
          @click="manualRefresh"
        >
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </header>

      <!-- No order selected: show list -->
      <template v-if="!selectedOrderId">
        <div v-if="loading" class="state-card">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>

        <div v-else-if="error" class="state-card error">
          <i class="bi bi-exclamation-circle"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="trackableOrders.length === 0" class="state-card">
          <i class="bi bi-truck"></i>
          <h3>No active orders</h3>
          <p>Place an order to start tracking your delivery.</p>
          <router-link to="/myorder" class="primary-btn">View My Orders</router-link>
        </div>

        <div v-else class="order-pick-list">
          <p class="pick-hint">Select an order to track:</p>
          <button
            v-for="order in trackableOrders"
            :key="order.id"
            class="pick-card"
            type="button"
            @click="goToOrder(order.id)"
          >
            <div>
              <span class="pick-code">{{ order.orderCode }}</span>
              <span class="pick-provider">{{ order.providerName }}</span>
            </div>
            <span :class="['status-badge', statusClass(order.status)]">{{ order.statusLabel }}</span>
          </button>
        </div>
      </template>

      <!-- Single order tracker -->
      <template v-else>
        <div v-if="loading && !orderTrackerStore.currentOrder" class="state-card">
          <div class="spinner"></div>
          <p>Loading order...</p>
        </div>

        <div v-else-if="error && !orderTrackerStore.currentOrder" class="state-card error">
          <i class="bi bi-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button class="primary-btn" type="button" @click="router.push('/order-tracker')">Back to list</button>
        </div>

        <template v-else-if="orderTrackerStore.currentOrder">
          <div class="tracker-top">
            <button class="back-link" type="button" @click="router.push('/order-tracker')">
              <i class="bi bi-arrow-left"></i> All orders
            </button>
            <div class="live-badge" :class="liveBadgeClass">
              <span class="live-dot"></span>
              {{ orderTrackerStore.currentOrder.statusLabel }}
            </div>
          </div>

          <div class="tracker-hero">
            <h2>{{ orderTrackerStore.currentOrder.orderCode }}</h2>
            <p>{{ orderTrackerStore.currentOrder.arrivalTime }}</p>
            <span class="auto-refresh-note">
              <i class="bi bi-arrow-repeat"></i> Auto-updates every 8 seconds
            </span>
          </div>

          <!-- Status stepper -->
          <section class="card stepper-card">
            <div class="stepper">
              <div
                v-for="(step, i) in orderTrackerStore.currentOrder.steps"
                :key="step.label"
                class="stepper-item"
              >
                <div :class="['step', step.state]">
                  <div class="step-icon">
                    <i :class="stepIcon(step.icon)"></i>
                  </div>
                  <span class="step-label">{{ step.label }}</span>
                  <span class="step-time">{{ step.time }}</span>
                </div>
                <div
                  v-if="i < orderTrackerStore.currentOrder.steps.length - 1"
                  :class="['connector', connectorState(i)]"
                />
              </div>
            </div>
          </section>

          <div class="tracker-grid">
            <!-- Order items -->
            <section class="card items-card">
              <div class="card-title-row">
                <h3>Order Items</h3>
                <span class="item-count">{{ orderTrackerStore.currentOrder.items.length }} products</span>
              </div>

              <div
                v-for="item in orderTrackerStore.currentOrder.items"
                :key="item.id"
                class="basket-item"
              >
                <div class="basket-img">
                  <img v-if="item.image" :src="item.image" :alt="item.name" />
                  <span v-else class="img-fallback">{{ item.name.charAt(0) }}</span>
                </div>
                <div class="basket-info">
                  <span class="basket-name">{{ item.name }}</span>
                  <span class="basket-sub">Qty: {{ item.quantity }}</span>
                </div>
                <span class="basket-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>

              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span>${{ orderTrackerStore.subtotal.toFixed(2) }}</span>
                </div>
                <div class="totals-row grand">
                  <span>Total</span>
                  <span>${{ orderTrackerStore.currentOrder.total.toFixed(2) }}</span>
                </div>
              </div>
            </section>

            <!-- Details -->
            <section class="card details-card">
              <h3>Delivery Details</h3>
              <div
                v-for="detail in orderTrackerStore.currentOrder.details"
                :key="detail.label"
                class="detail-row"
              >
                <div class="detail-icon"><i :class="detailIcon(detail.icon)"></i></div>
                <div>
                  <span class="detail-label">{{ detail.label }}</span>
                  <span class="detail-value">{{ detail.value }}</span>
                  <span class="detail-sub">{{ detail.sub }}</span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-icon"><i class="bi bi-calendar3"></i></div>
                <div>
                  <span class="detail-label">Order Date</span>
                  <span class="detail-value">{{ formatDate(orderTrackerStore.currentOrder.createdAt) }}</span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-icon"><i class="bi bi-credit-card"></i></div>
                <div>
                  <span class="detail-label">Payment Status</span>
                  <span class="detail-value">{{ orderTrackerStore.currentOrder.paymentStatus }}</span>
                </div>
              </div>
            </section>
          </div>

          <div class="bottom-actions">
            <router-link to="/myorder" class="ghost-btn">
              <i class="bi bi-bag-check"></i> My Orders
            </router-link>
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderTrackerStore } from '../../stores/orderTrackerStore'
import { useUserStore } from '@/stores/userStore'
import DashboardSidebar from '../../components/Customer/sidebarUser.vue'

const props = defineProps({
  id: { type: [String, Number], default: null },
})

const route = useRoute()
const router = useRouter()
const orderTrackerStore = useOrderTrackerStore()
const userStore = useUserStore()
const { loading, error } = storeToRefs(orderTrackerStore)

const isSidebarOpen = ref(false)
const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
provide('isSidebarOpen', isSidebarOpen)
provide('closeSidebar', closeSidebar)

const selectedOrderId = computed(() => {
  const raw = props.id || route.params.id
  return raw ? Number(raw) : null
})

const trackableOrders = computed(() => {
  return orderTrackerStore.customerOrders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const liveBadgeClass = computed(() => {
  const status = orderTrackerStore.currentOrder?.status
  if (status === 'completed') return 'live-completed'
  if (status === 'delivering') return 'live-delivering'
  return 'live-pending'
})

let pollTimer = null

function statusClass(status) {
  if (status === 'completed') return 'badge-completed'
  if (status === 'delivering') return 'badge-delivering'
  return 'badge-pending'
}

function stepIcon(icon) {
  return ({
    check: 'bi bi-check-lg',
    truck: 'bi bi-truck',
    gift: 'bi bi-gift',
  })[icon] || 'bi bi-circle'
}

function detailIcon(icon) {
  return ({
    user: 'bi bi-shop',
    box: 'bi bi-credit-card',
  })[icon] || 'bi bi-info-circle'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function connectorState(i) {
  const steps = orderTrackerStore.currentOrder?.steps || []
  if (steps[i]?.state === 'done' && steps[i + 1]?.state === 'active') return 'half'
  if (steps[i]?.state === 'done') return 'done'
  return 'pending'
}

function goToOrder(id) {
  router.push(`/order-tracker/${id}`)
}

function onNavigate(section) {
  if (section === 'dashboard') router.push('/profile')
  else if (section === 'orders') router.push('/myorder')
}

function startPolling() {
  stopPolling()
  if (!selectedOrderId.value) return
  pollTimer = setInterval(() => {
    orderTrackerStore.refreshOrder(selectedOrderId.value)
  }, 8000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function loadTracker() {
  if (selectedOrderId.value) {
    await orderTrackerStore.fetchOrder(selectedOrderId.value)
    startPolling()
  } else {
    stopPolling()
    const userId = userStore.user?.id
    if (userId) {
      await orderTrackerStore.fetchCustomerOrders(userId)
    }
  }
}

async function manualRefresh() {
  if (selectedOrderId.value) {
    await orderTrackerStore.refreshOrder(selectedOrderId.value)
  }
}

watch(selectedOrderId, () => {
  loadTracker()
})

onMounted(loadTracker)
onUnmounted(stopPolling)
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
  max-width: 1000px;
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

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2d7a3a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.order-pick-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pick-hint {
  margin: 0 0 8px;
  color: #6b7c72;
  font-size: 0.9rem;
}

.pick-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e8ede9;
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.pick-card:hover {
  border-color: #b8dfc4;
  box-shadow: 0 4px 12px rgba(45, 122, 58, 0.08);
}

.pick-code {
  display: block;
  font-weight: 700;
  color: #1a2e1f;
  font-size: 0.95rem;
}

.pick-provider {
  font-size: 0.82rem;
  color: #8a9a90;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-pending { background: #fef3c7; color: #d97706; }
.badge-delivering { background: #dbeafe; color: #2563eb; }
.badge-completed { background: #e8f5ec; color: #2d7a3a; }

.tracker-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.back-link {
  background: none;
  border: none;
  color: #2d7a3a;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 1.5s ease infinite;
}

.live-pending { background: #fef3c7; color: #d97706; }
.live-pending .live-dot { background: #d97706; }
.live-delivering { background: #dbeafe; color: #2563eb; }
.live-delivering .live-dot { background: #2563eb; }
.live-completed { background: #e8f5ec; color: #2d7a3a; }
.live-completed .live-dot { background: #2d7a3a; animation: none; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.tracker-hero {
  background: linear-gradient(135deg, #2d7a3a, #4a9e5c);
  border-radius: 18px;
  padding: 24px 28px;
  color: #fff;
  margin-bottom: 20px;
}

.tracker-hero h2 {
  margin: 0 0 6px;
  font-size: 1.3rem;
}

.tracker-hero p {
  margin: 0;
  opacity: 0.9;
}

.auto-refresh-note {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-size: 0.78rem;
  opacity: 0.85;
}

.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  padding: 22px 24px;
}

.stepper-card {
  margin-bottom: 20px;
}

.stepper {
  display: flex;
  align-items: flex-start;
}

.stepper-item {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.stepper-item:last-child {
  flex: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 90px;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.step.done .step-icon {
  background: #2d7a3a;
  color: #fff;
}

.step.active .step-icon {
  background: #4a9e5c;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(45, 122, 58, 0.2);
}

.step.pending .step-icon {
  background: #f0f4f1;
  color: #a0b0a8;
  border: 2px dashed #dde5df;
}

.step-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #4a5c50;
}

.step.pending .step-label {
  color: #a0b0a8;
}

.step-time {
  font-size: 0.72rem;
  color: #8a9a90;
  margin-top: 3px;
}

.connector {
  flex: 1;
  height: 2px;
  margin-top: 24px;
  min-width: 20px;
}

.connector.done { background: #2d7a3a; }
.connector.pending { background: #e8ede9; }
.connector.half { background: linear-gradient(90deg, #2d7a3a 55%, #e8ede9 55%); }

.tracker-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
  margin-bottom: 20px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title-row h3,
.details-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2e1f;
}

.item-count {
  font-size: 0.78rem;
  font-weight: 600;
  color: #2d7a3a;
  background: #e8f5ec;
  padding: 3px 10px;
  border-radius: 12px;
}

.basket-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f4f1;
}

.basket-item:last-of-type {
  border-bottom: none;
}

.basket-img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: #e8f5ec;
  flex-shrink: 0;
}

.basket-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 700;
  color: #2d7a3a;
}

.basket-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.basket-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e1f;
}

.basket-sub {
  font-size: 0.78rem;
  color: #8a9a90;
}

.basket-price {
  font-weight: 700;
  color: #2d7a3a;
}

.totals {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f4f1;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  color: #6b7c72;
  margin-bottom: 6px;
}

.totals-row.grand {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a2e1f;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #e8f5ec;
}

.detail-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f4f1;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-icon {
  width: 36px;
  height: 36px;
  background: #e8f5ec;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d7a3a;
  flex-shrink: 0;
}

.detail-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8a9a90;
  letter-spacing: 0.03em;
}

.detail-value {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a2e1f;
}

.detail-sub {
  display: block;
  font-size: 0.78rem;
  color: #8a9a90;
}

.bottom-actions {
  display: flex;
  gap: 10px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #4a5c50;
  border: 1.5px solid #dde5df;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
}

.ghost-btn:hover {
  background: #f4f7f5;
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

  .tracker-grid {
    grid-template-columns: 1fr;
  }

  .stepper {
    flex-direction: column;
    gap: 0;
  }

  .stepper-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .step {
    flex-direction: row;
    gap: 12px;
    text-align: left;
    min-width: 0;
    width: 100%;
  }

  .step-icon {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .connector {
    width: 2px;
    height: 20px;
    margin: 4px 0 4px 23px;
    min-width: 0;
  }

  .connector.half {
    background: linear-gradient(180deg, #2d7a3a 55%, #e8ede9 55%);
  }
}
</style>
