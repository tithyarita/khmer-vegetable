<template>
  <div class="top-orders-section">
    <div class="top-orders-header">
      <h5 class="top-orders-title">Top Orders</h5>
      <button v-if="!loaded" @click="refresh" class="refresh-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading orders...</span>
    </div>

    <div v-else-if="topOrders.length === 0" class="empty-state">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor">
        <rect x="8" y="16" width="40" height="36" rx="2" stroke-width="2"/>
        <path d="M8 20h40" stroke-width="2"/>
        <circle cx="16" cy="28" r="2" fill="currentColor"/>
        <circle cx="24" cy="28" r="2" fill="currentColor"/>
        <circle cx="32" cy="28" r="2" fill="currentColor"/>
      </svg>
      <p>No orders found</p>
    </div>

    <div v-else class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in topOrders"
            :key="order.orderId"
            class="order-row"
          >
            <td>
              <span class="order-id">{{ order.id }}</span>
            </td>
            <td>
              <div class="customer-cell">
                <span class="customer-avatar">{{ (order.customerName || 'U').slice(0, 2).toUpperCase() }}</span>
                <span class="customer-name">{{ order.customerName }}</span>
              </div>
            </td>
            <td class="date-col">{{ formatDate(order.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="`badge-${order.status}`">
                {{ capitalize(order.status) }}
              </span>
            </td>
            <td class="total-col">${{ order.total.toFixed(2) }}</td>
            <td>
              <button class="btn-view" @click="$emit('view-order', order)">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useProviderOrderStore } from '@/stores/providerOrderStore'

const emit = defineEmits(['view-order'])

const props = defineProps({
  limit: { type: Number, default: 5 }
})

const loading = ref(false)
const loaded = ref(false)
const topOrders = ref([])

const refresh = async () => {
  loading.value = true
  try {
    const userStore = useUserStore()
    const providerOrderStore = useProviderOrderStore()
    const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
    if (!user?.id) throw new Error('Provider not found')

    const orders = await providerOrderStore.fetchProviderOrders(user.id)
    const sorted = [...orders].sort((a, b) => b.total - a.total)
    topOrders.value = sorted.slice(0, props.limit)
    loaded.value = true
  } catch (err) {
    console.error('Failed to load top orders', err)
    topOrders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => refresh())

const formatDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
</script>

<style scoped>
.top-orders-section {
  font-family: 'DM Sans', sans-serif;
}

.top-orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.top-orders-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.18s;
}
.refresh-btn svg { width: 13px; height: 13px; }
.refresh-btn:hover { border-color: #4CAF50; color: #4CAF50; background: #f0f9f0; }

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 32px;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #bbb;
}
.empty-state svg { width: 48px; height: 48px; margin-bottom: 10px; opacity: 0.4; }
.empty-state p { margin: 0; font-size: 0.9rem; }

.table-container { overflow-x: auto; }

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.orders-table thead tr {
  border-bottom: 1.5px solid #f0f1f5;
}

.orders-table th {
  padding: 10px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.orders-table td {
  padding: 12px 16px;
  color: #1a1a1a;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.order-row { transition: background 0.15s; }
.order-row:hover { background: #fafbfa; }
.order-row:last-child td { border-bottom: none; }

.order-id {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4CAF50;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.customer-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #81C784);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.customer-name { font-weight: 500; color: #1a1a1a; }

.date-col { color: #666; font-size: 0.82rem; }

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.badge-pending    { background: #fff3e0; color: #e65100; }
.badge-delivering { background: #e3f2fd; color: #1565c0; }
.badge-completed  { background: #e8f5e9; color: #2e7d32; }

.total-col {
  font-weight: 700;
  color: #2e7d32;
  text-align: left;
}

.btn-view {
  padding: 5px 12px;
  background: #f0f9f0;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2e7d32;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-view:hover {
  background: #4CAF50;
  border-color: #4CAF50;
  color: #fff;
}

.text-right { text-align: right; }
</style>
