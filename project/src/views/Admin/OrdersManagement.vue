<template>
  <div class="orders-management-page">
    <div class="header-row">
      <div>
        <h1 class="title">Orders Management</h1>
        <p class="subtitle">Track and manage all customer orders in your ecosystem.</p>
      </div>
      <div class="header-actions">
        <button class="time-btn active">All Time</button>
        <button class="time-btn">Last 30 Days</button>
        <button class="export-btn">Export Report</button>
      </div>
    </div>

    <!-- SUMMARY (NOW DYNAMIC) -->
    <div class="summary-row">
      <div class="summary-card">
        <div class="icon-box"><span>📦</span></div>
        <div>
          <div class="summary-label">TOTAL ORDERS</div>
          <div class="summary-value">
            {{ totalOrders }}
          </div>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon-box"><span>⏳</span></div>
        <div>
          <div class="summary-label">PENDING ORDERS</div>
          <div class="summary-value pending">
            {{ pendingOrders }}
          </div>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon-box"><span>✅</span></div>
        <div>
          <div class="summary-label">COMPLETED</div>
          <div class="summary-value">
            {{ completedOrders }}
          </div>
        </div>
      </div>

      <div class="summary-card revenue">
        <div class="icon-box"><span>💰</span></div>
        <div>
          <div class="summary-label">TOTAL REVENUE</div>
          <div class="summary-value">
            ${{ totalRevenue.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-bar">
      <select v-model="status" class="status-filter">
        <option>All Statuses</option>
        <option>pending</option>
        <option>completed</option>
        <option>shipped</option>
        <option>delivering</option>
      </select>

      <button class="clear-filter-btn" @click="clearFilter">
        Clear Filters
      </button>
    </div>

    <!-- TABLE -->
    <div class="main-content">
      <div v-if="loading" class="loading-state">
        <p>Loading orders...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <div v-else class="table-section">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>PROVIDER</th>
              <th>TOTAL PRICE</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="order in paginatedOrders"
              :key="order.id"
              @click="selectOrder(order)"
              :class="{ selected: selectedOrder?.id === order.id }"
            >
              <td>#ORD-{{ order.id }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.provider }}</td>
              <td>${{ order.total }}</td>
              <td>{{ order.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const orders = ref([])
const loading = ref(false)
const error = ref(null)

const status = ref('All Statuses')
const selectedOrder = ref(null)

/* -----------------------
   FETCH ORDERS
------------------------*/
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${API}/orders`)

    orders.value = res.data.map(o => ({
      id: o.id,
      customer: o.customer?.name || 'Unknown',
      provider: o.provider?.provider_name || 'Unknown',
      total: Number(o.total || 0),
      status: o.status
    }))
  } catch (e) {
    error.value = 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

/* -----------------------
   FILTERED ORDERS
------------------------*/
const filteredOrders = computed(() => {
  if (status.value === 'All Statuses') return orders.value
  return orders.value.filter(o => o.status === status.value)
})

/* -----------------------
   SUMMARY CALCULATIONS
------------------------*/
const totalOrders = computed(() => filteredOrders.value.length)

const pendingOrders = computed(() =>
  filteredOrders.value.filter(o => o.status === 'pending').length
)

const completedOrders = computed(() =>
  filteredOrders.value.filter(o => o.status === 'completed').length
)

const totalRevenue = computed(() =>
  filteredOrders.value.reduce((sum, o) => sum + o.total, 0)
)

/* -----------------------
   PAGINATION
------------------------*/
const page = ref(1)
const pageSize = 10

const paginatedOrders = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

/* -----------------------
   ACTIONS
------------------------*/
const selectOrder = (order) => {
  selectedOrder.value = order
}

const clearFilter = () => {
  status.value = 'All Statuses'
}

/* -----------------------
   WATCH FILTER
------------------------*/
watch(status, () => {
  page.value = 1
})

/* -----------------------
   INIT
------------------------*/
onMounted(fetchOrders)
</script>

<style scoped>
.orders-management-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.title {
  color: #14532d;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.subtitle {
  color: #64748b;
  font-size: 1rem;
}
.header-actions {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}
.time-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #14532d;
  cursor: pointer;
}
.time-btn.active {
  background: #14532d;
  color: #fff;
}
.export-btn {
  background: #14532d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
}
.summary-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.summary-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2rem;
  min-width: 260px;
}
.summary-card.revenue {
  background: #14532d;
  color: #fff;
}
.icon-box {
  background: #f1f5f9;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
}
.summary-label {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}
.summary-card.revenue .summary-label {
  color: #fff;
}
.summary-value {
  color: #14532d;
  font-size: 1.5rem;
  font-weight: 700;
}
.summary-card.revenue .summary-value {
  color: #fff;
}
.summary-change {
  color: #22c55e;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.summary-pending {
  color: #f59e42;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.summary-value.pending {
  color: #f59e42;
}
.summary-sub {
  color: #64748b;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
}
.status-filter, .date-filter {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  color: #14532d;
}
.clear-filter-btn {
  background: #fff1f2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
}
.main-content {
  display: flex;
  gap: 2rem;
}
.table-section {
  flex: 2;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.orders-table th {
  color: #64748b;
  font-weight: 600;
  padding: 0.7rem 0.5rem;
  text-align: left;
  font-size: 0.95rem;
}
.orders-table td {
  padding: 0.7rem 0.5rem;
  vertical-align: middle;
  font-size: 1rem;
}
.orders-table tr.selected {
  background: #f1f5f9;
}
.order-id {
  font-weight: 600;
  color: #14532d;
}
.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #222;
  margin-right: 0.5rem;
}
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #64748b;
}
.status-badge.delivered {
  background: #22c55e;
  color: #fff;
}
.status-badge.pending {
  background: #f59e42;
  color: #fff;
}
.status-badge.confirmed {
  background: #2563eb;
  color: #fff;
}
.status-badge.shipped {
  background: #fbbf24;
  color: #222;
}
.status-badge.cancelled {
  background: #dc2626;
  color: #fff;
}
.status-badge.completed {
  background: #10b981;
  color: #fff;
}
.status-badge.delivering {
  background: #3b82f6;
  color: #fff;
}
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.pagination button {
  background: #fff;
  border: 1px solid #14532d;
  color: #14532d;
  border-radius: 6px;
  margin: 0 0.2rem;
  padding: 0.2rem 0.8rem;
  cursor: pointer;
}
.pagination button.active {
  background: #14532d;
  color: #fff;
}
.details-section {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.details-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.details-order-id {
  font-weight: 700;
  color: #14532d;
  font-size: 1.1rem;
}
.details-date {
  color: #64748b;
  font-size: 0.98rem;
}
.details-status {
  background: #22c55e;
  color: #fff;
  border-radius: 8px;
  padding: 0.3rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
}
.details-customer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.customer-name {
  font-weight: 700;
  color: #14532d;
}
.customer-phone, .customer-address {
  color: #64748b;
  font-size: 0.98rem;
}
.details-provider {
  margin-bottom: 1.2rem;
}
.provider-label {
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
.provider-name {
  color: #14532d;
  font-weight: 600;
  font-size: 1.05rem;
}
.details-items {
  margin-bottom: 1.2rem;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}
.item-total {
  font-weight: 600;
  color: #14532d;
}
.details-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
}
.details-total {
  color: #14532d;
}
.details-timeline {
  margin-bottom: 1.2rem;
}
.timeline-label {
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.details-timeline ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.details-timeline li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
  color: #222;
}
.details-timeline li.delivered {
  color: #22c55e;
  font-weight: 700;
}
.details-actions {
  display: flex;
  gap: 1.2rem;
}
.print-btn, .cancel-btn {
  flex: 1;
  background: #f1f5f9;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.cancel-btn {
  background: #fff1f2;
  color: #dc2626;
}
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 12px;
  color: #64748b;
  font-size: 1.1rem;
}
.error-state {
  background: #fee2e2;
  color: #dc2626;
}
</style>