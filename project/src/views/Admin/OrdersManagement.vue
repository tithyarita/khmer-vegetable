<template>
  <div class="orders-management-page">
    <div class="header-row">
      <div>
        <h1 class="title">Orders Management</h1>
        <p class="subtitle">Track, filter, and analyze customer orders across your ecosystem.</p>
      </div>
      <div class="header-actions">
        <button class="time-btn" :class="{ active: timeframe === 'all' }" @click="setTimeframe('all')">All Time</button>
        <button class="time-btn" :class="{ active: timeframe === 'today' }" @click="setTimeframe('today')">Today</button>
        <button class="time-btn" :class="{ active: timeframe === 'weekly' }" @click="setTimeframe('weekly')">Weekly</button>
        <button class="time-btn" :class="{ active: timeframe === 'monthly' }" @click="setTimeframe('monthly')">Monthly</button>
        <button class="time-btn" :class="{ active: timeframe === 'yearly' }" @click="setTimeframe('yearly')">Yearly</button>
        <button class="time-btn" :class="{ active: timeframe === 'custom' }" @click="setTimeframe('custom')">Custom Range</button>
        <button class="export-btn" @click="exportReport">Export Report</button>
      </div>
    </div>

    <!-- Metrics Matrix Section Breakdown -->
    <div class="summary-row">
      <div class="summary-card">
        <div class="icon-box"><span>📦</span></div>
        <div>
          <div class="summary-label">TOTAL ORDERS</div>
          <div class="summary-value">{{ totalOrdersCount }} <span class="summary-sub">Selected Period</span></div>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon-box"><span>⏳</span></div>
        <div>
          <div class="summary-label">PENDING ORDERS</div>
          <div class="summary-value pending">{{ pendingOrdersCount }} <span class="summary-pending">Queueing</span></div>
        </div>
      </div>

      <div class="summary-card">
        <div class="icon-box"><span>✅</span></div>
        <div>
          <div class="summary-label">COMPLETED</div>
          <div class="summary-value">{{ completedOrdersCount }} <span class="summary-sub">{{ completedPercentage }}</span></div>
        </div>
      </div>

      <div class="summary-card revenue">
        <div class="icon-box"><span>💰</span></div>
        <div>
          <div class="summary-label">REVENUE ({{ timeframe.toUpperCase() }})</div>
          <div class="summary-value">{{ totalRevenue }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Analytics Real-Time Sidebar Strip -->
    <div class="revenue-overview-strip">
      <div class="strip-item"><b>Today:</b> {{ todayRevenue }}</div>
      <div class="strip-item"><b>7 Days:</b> {{ weeklyRevenue }}</div>
      <div class="strip-item"><b>30 Days:</b> {{ monthlyRevenue }}</div>
      <div class="strip-item"><b>12 Months:</b> {{ yearlyRevenue }}</div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="input-label">ORDER STATUS</label>
        <select v-model="status" class="status-filter">
          <option value="All Statuses">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="delivering">Delivering</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div v-if="timeframe === 'custom'" class="custom-date-container">
        <div class="filter-group">
          <label class="input-label">START DATE</label>
          <input type="date" v-model="startDate" class="date-filter" />
        </div>
        <span class="date-separator">to</span>
        <div class="filter-group">
          <label class="input-label">END DATE</label>
          <input type="date" v-model="endDate" class="date-filter" />
        </div>
      </div>

      <button class="clear-filter-btn" @click="resetFilters">Clear Filters</button>
    </div>

    <div class="main-content">
      <div v-if="loading" class="loading-state">
        <p>Loading orders from ecosystem database...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <p>No records fit your selected criteria.</p>
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
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="order in paginatedOrders" 
              :key="order.id" 
              :class="{ selected: order.id === selectedOrder?.id }" 
              @click="selectOrder(order)"
            >
              <td><span class="order-id">#ORD-{{ order.id }}</span></td>
              <td>
                <div class="customer-cell">
                  <span class="customer-avatar" :style="{ background: order.customerColor }">
                    {{ order.customerInitials }}
                  </span>
                  <div>
                    <span>{{ order.customer }}</span>
                    <span v-if="order.customerRawId === 9" class="customer-id">#C{{ order.customerRawId }}</span>
                  </div>
                </div>
              </td>
              <td>{{ order.provider }}</td>
              <td>{{ order.price }}</td>
              <td class="col-status" @click.stop>
                <button
                  v-if="order.status.toLowerCase() === 'pending'"
                  class="btn btn-pending"
                  @click="updateStatus(order, 'delivering')"
                >
                  Pending
                </button>
              
                <button
                  v-if="order.status.toLowerCase() === 'delivering'"
                  class="btn btn-delivering"
                  @click="updateStatus(order, 'completed')"
                >
                  Delivering
                </button>
              
                <span v-if="order.status.toLowerCase() === 'completed'" class="done-text">✓ Completed</span>
              </td>
              <td>
                <button class="btn btn-view" @click.stop="selectOrder(order)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-row">
          <span>SHOWING {{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, filteredOrders.length) }} OF {{ filteredOrders.length }}</span>
          <div class="pagination">
            <button :disabled="page === 1" @click="page--">&lt;</button>
            <button v-for="p in totalPages" :key="p" :class="{ active: p === page }" @click="page = p">{{ p }}</button>
            <button :disabled="page === totalPages" @click="page++">&gt;</button>
          </div>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="selectedOrder" @click="closeModal">
        <div class="modal-card" @click.stop>
          <button class="modal-close-btn" @click="closeModal">✕</button>

          <div class="details-header">
            <span class="details-order-id">#ORD-{{ selectedOrder.id }}</span>
            <span class="details-date">{{ formatDate(selectedOrder.createdAt) }}</span>
            <span class="details-status" :class="selectedOrder.status.toLowerCase()">{{ selectedOrder.status.toUpperCase() }}</span>
          </div>
          
          <div class="details-customer">
            <span class="customer-avatar" :style="{ background: selectedOrder.customerColor }">
              {{ selectedOrder.customerInitials }}
            </span>
            <div>
              <div class="customer-name">{{ selectedOrder.customer }}</div>
              <div v-if="selectedOrder.customerRawId === 9" class="customer-id">#C{{ selectedOrder.customerRawId }}</div>
              <div class="customer-phone">+1 555-0123</div>
              <div class="customer-address">123 Maple St, Harvest Village</div>
            </div>
          </div>

          <div class="details-provider">
            <span class="provider-label">FARM PROVIDER</span>
            <span class="provider-name">{{ selectedOrder.provider }}</span>
          </div>

          <div class="details-items">
            <div class="item-row" v-for="item in selectedOrder.items" :key="item.name">
              <span>{{ item.name }}</span>
              <span>{{ item.qty }} x {{ item.price }}</span>
              <span class="item-total">${{ (item.qty * parseFloat(item.price.replace('$', ''))).toFixed(2) }}</span>
            </div>
          </div>

          <div class="details-total-row">
            <span>Total</span>
            <span class="details-total">{{ selectedOrder.price }}</span>
          </div>

          <div class="details-timeline">
            <div class="timeline-label">JOURNEY TIMELINE</div>
            <ul>
              <li>
                <b>Created At</b> 
                <span>{{ formatDate(selectedOrder.createdAt) }}</span>
              </li>
              <li :class="{ completed: selectedOrder.completedAt }">
                <b>Completed At</b> 
                <span>{{ selectedOrder.completedAt ? formatDate(selectedOrder.completedAt) : 'In Progress' }}</span>
              </li>
            </ul>
          </div>

          <div class="details-actions">
            <button class="print-btn">Print</button>
            <button class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'
const status = ref('All Statuses')
const timeframe = ref('all') 
const startDate = ref('')
const endDate = ref('')

const page = ref(1)
const pageSize = 10
const orders = ref([])
const loading = ref(false)
const error = ref(null)

const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null

const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

// --- Fetch All Orders from API Ecosystem ---
const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`${API_BASE_URL}/orders`)
    
    orders.value = response.data.map(order => {
      const customerRawId = order.customer?.id ?? order.customer_id
      const customerName = order.customer?.name || `Customer ${order.customer_id}`
      const initials = (customerName || '')
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || `C${customerRawId}`
      
      const rawPrice = parseFloat(order.total) || 0

      return {
        id: order.id,
        customerRawId,
        customer: customerName,
        customerInitials: initials,
        customerColor: '#e0e7ff',
        provider: order.provider?.provider_name || `Provider ${order.provider_id}`,
        rawPrice: rawPrice,
        price: `$${rawPrice.toFixed(2)}`,
        status: order.status || 'pending', 
        statusClass: (order.status || 'pending').toLowerCase(),
        items: order.items || [{ name: 'Default Product Package', qty: 1, price: `$${rawPrice.toFixed(2)}` }], 
        item: order.item || 1,
        orderCode: order.order_code,
        createdAt: new Date(order.created_at),
        completedAt: order.completed_at ? new Date(order.completed_at) : null
      }
    })
  } catch (err) {
    error.value = err.message || 'Failed to load ecosystem database entities'
    console.error('Error fetching orders:', err)
  } finally {
    loading.value = false
  }
}

// --- Polling Lifecycle Engine ---
let pollInterval = null
onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(fetchOrders, 10000) 
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

// --- Currency Formatter Utility ---
const formatCurrency = (amount) => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// --- Strict Calendar-Bound Filtering Windows ---
const dateFilteredOrders = computed(() => {
  const now = new Date()
  
  return orders.value.filter(order => {
    const orderDate = new Date(order.createdAt)
    
    if (timeframe.value === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      return orderDate >= startOfToday
    }
    
    if (timeframe.value === 'weekly') {
      const currentDay = now.getDay()
      const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1
      const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0)
      return orderDate >= startOfThisWeek
    }
    
    if (timeframe.value === 'monthly') {
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      return orderDate >= startOfThisMonth
    }

    if (timeframe.value === 'yearly') {
      const startOfThisYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      return orderDate >= startOfThisYear
    }
    
    if (timeframe.value === 'custom') {
      let withinBounds = true
      if (startDate.value) {
        const start = new Date(startDate.value)
        start.setHours(0, 0, 0, 0)
        withinBounds = withinBounds && orderDate >= start
      }
      if (endDate.value) {
        const end = new Date(endDate.value)
        end.setHours(23, 59, 59, 999)
        withinBounds = withinBounds && orderDate <= end
      }
      return withinBounds
    }
    
    return true 
  })
})

// --- Independent Calendar-Bound Revenue Timeframe Aggregators ---
// --- Strict "Today is Today" Calendar Isolation ---

const todayRevenue = computed(() => {
  const now = new Date()
  // Format current date to a clean, timezone-safe 'YYYY-MM-DD' string
  const todayString = now.toISOString().split('T')[0] 
  
  const sum = orders.value
    .filter(order => {
      const orderDateString = new Date(order.createdAt).toISOString().split('T')[0]
      return orderDateString === todayString
    })
    .reduce((acc, curr) => acc + curr.rawPrice, 0)
    
  return formatCurrency(sum)
})

const weeklyRevenue = computed(() => {
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1
  const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0)
  
  const sum = orders.value
    .filter(o => new Date(o.createdAt) >= startOfThisWeek)
    .reduce((acc, curr) => acc + curr.rawPrice, 0)
  return formatCurrency(sum)
})

const monthlyRevenue = computed(() => {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  
  const sum = orders.value
    .filter(o => new Date(o.createdAt) >= startOfThisMonth)
    .reduce((acc, curr) => acc + curr.rawPrice, 0)
  return formatCurrency(sum)
})

const yearlyRevenue = computed(() => {
  const now = new Date()
  const startOfThisYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
  
  const sum = orders.value
    .filter(o => new Date(o.createdAt) >= startOfThisYear)
    .reduce((acc, curr) => acc + curr.rawPrice, 0)
  return formatCurrency(sum)
})

// --- Active Dashboard KPIs ---
const totalOrdersCount = computed(() => dateFilteredOrders.value.length)
const pendingOrdersCount = computed(() => dateFilteredOrders.value.filter(o => o.status.toLowerCase() === 'pending').length)
const completedOrdersCount = computed(() => dateFilteredOrders.value.filter(o => o.status.toLowerCase() === 'completed').length)

const completedPercentage = computed(() => {
  if (totalOrdersCount.value === 0) return '0.0%'
  return `${((completedOrdersCount.value / totalOrdersCount.value) * 100).toFixed(1)}%`
})

const totalRevenue = computed(() => {
  const sum = dateFilteredOrders.value.reduce((acc, current) => acc + current.rawPrice, 0)
  return formatCurrency(sum)
})

// --- Sorting, Filters and Pagination ---
const filteredOrders = computed(() => {
  let result = dateFilteredOrders.value
  if (status.value !== 'All Statuses') {
    result = result.filter(o => o.status.toLowerCase() === status.value.toLowerCase())
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))
const paginatedOrders = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const selectedOrder = ref(null)
function selectOrder(order) { selectedOrder.value = order }
function closeModal() { selectedOrder.value = null }

const setTimeframe = (type) => {
  timeframe.value = type
  page.value = 1 
}

const resetFilters = () => {
  status.value = 'All Statuses'
  timeframe.value = 'all'
  startDate.value = ''
  endDate.value = ''
  page.value = 1
}

const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const exportReport = () => {
  showToast(`Exporting data matrix layout for ${timeframe.value.toUpperCase()} scope.`, 'success')
}

// --- Status State Mutation Pipeline ---
const updateStatus = async (order, newStatus) => {
  try {
    await axios.patch(`${API_BASE_URL}/orders/${order.id}/status`, { status: newStatus })
    
    const local = orders.value.find(o => o.id === order.id)
    if (local) {
      local.status = newStatus
      if (newStatus === 'completed') local.completedAt = new Date()
    }

    if (selectedOrder.value?.id === order.id) {
      selectedOrder.value.status = newStatus
      if (newStatus === 'completed') selectedOrder.value.completedAt = new Date()
    }

    showToast(`Order status updated to ${newStatus}`, 'success')
  } catch (err) {
    console.error('Database write execution failure:', err)
    showToast('Failed to change workflow tracking status', 'error')
  }
}
</script>

<style scoped>
.orders-management-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
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
  font-size: 0.95rem;
  font-weight: 600;
  color: #14532d;
  cursor: pointer;
  transition: all 0.2s ease;
}
.time-btn:hover { background: #e2e8f0; }
.time-btn.active {
  background: #14532d;
  color: #fff;
}
.export-btn {
  background: #15803d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.export-btn:hover { opacity: 0.9; }

.revenue-overview-strip {
  display: flex;
  gap: 2rem;
  background: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.strip-item {
  font-size: 0.9rem;
  color: #475569;
}
.strip-item b {
  color: #14532d;
}

.summary-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.summary-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  flex: 1;
  min-width: 240px;
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
.summary-card.revenue .icon-box { background: rgba(255,255,255,0.15); }
.summary-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.summary-card.revenue .summary-label { color: rgba(255,255,255,0.8); }
.summary-value {
  color: #14532d;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 0.1rem;
}
.summary-card.revenue .summary-value { color: #fff; }
.summary-pending {
  color: #ea580c;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 0.5rem;
}
.summary-value.pending { color: #ea580c; }
.summary-sub {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.input-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.02em;
}
.status-filter, .date-filter {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  min-width: 160px;
}
.status-filter:focus, .date-filter:focus { border-color: #14532d; }
.custom-date-container {
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
}
.date-separator {
  color: #64748b;
  padding-bottom: 0.6rem;
  font-weight: 600;
}
.clear-filter-btn {
  background: #fff1f2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  transition: background 0.2s;
}
.clear-filter-btn:hover { background: #ffe4e6; }

.main-content { display: flex; gap: 2rem; }
.table-section {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem;
  overflow-x: auto;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.orders-table th {
  color: #64748b;
  font-weight: 600;
  padding: 0.8rem 0.5rem;
  text-align: left;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #f1f5f9;
}
.orders-table td {
  padding: 1rem 0.5rem;
  vertical-align: middle;
  font-size: 0.95rem;
  border-bottom: 1px solid #f1f5f9;
}
.orders-table tr:hover {
  background: #f8fafc;
  cursor: pointer;
}
.orders-table tr.selected { background: #f1f5f9; }
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
  color: #1e293b;
  font-size: 0.8rem;
}
.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-pending {
  background: #ea580c;
  color: white;
}
.btn-pending:hover {
  background: #c2410c;
  transform: translateY(-1px);
}
.btn-delivering {
  background: #2563eb;
  color: white;
}
.btn-delivering:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
.btn-view {
  background: #e2e8f0;
  color: #334155;
}
.btn-view:hover { background: #cbd5e1; }
.done-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: #16a34a;
}
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}
.pagination button {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  margin: 0 0.15rem;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  font-weight: 600;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination button.active {
  background: #14532d;
  color: #fff;
  border-color: #14532d;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close-btn:hover { background: #e2e8f0; }
.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.details-order-id {
  font-weight: 700;
  color: #14532d;
  font-size: 1.25rem;
}
.details-date {
  color: #64748b;
  font-size: 0.95rem;
}
.details-status {
  margin-left: auto;
  border-radius: 8px;
  padding: 0.3rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
}
.details-status.pending { background: #fff7ed; color: #ea580c; }
.details-status.delivering { background: #eff6ff; color: #2563eb; }
.details-status.completed { background: #f0fdf4; color: #16a34a; }

.details-customer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}
.customer-name {
  font-weight: 700;
  color: #14532d;
}
.customer-phone, .customer-address {
  color: #64748b;
  font-size: 0.95rem;
}
.details-provider { margin-bottom: 1.5rem; }
.provider-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
.provider-name {
  color: #14532d;
  font-weight: 600;
}
.details-items {
  margin-bottom: 1rem;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 0.75rem;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  color: #334155;
}
.item-total {
  font-weight: 600;
  color: #14532d;
}
.details-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.details-total { color: #14532d; }
.details-timeline {
  margin-bottom: 1.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}
.timeline-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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
  padding: 0.3rem 0;
  color: #475569;
}
.details-timeline li.completed {
  color: #16a34a;
  font-weight: 600;
}
.details-actions { display: flex; gap: 1rem; }
.print-btn, .cancel-btn {
  flex: 1;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.cancel-btn {
  background: #fff1f2;
  color: #dc2626;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 4rem;
  background: #fff;
  border-radius: 12px;
  color: #64748b;
  font-size: 1.1rem;
  width: 100%;
}
.error-state { background: #fee2e2; color: #dc2626; }

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1100;
}
.toast-success { background: #22c55e; }
.toast-error { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>