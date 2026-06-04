<template>
  <div class="analytics-container">
    <header class="dashboard-header">
      <div class="header-title-area">
        <div class="brand-badge">
          <i class="bi bi-flower1"></i>
          <span>Khmer Veg Admin Platform</span>
        </div>
        <h1 class="page-title">របាយការណ៍ និងការវិភាគ <span class="sub-text">(Reports & Analytics)</span></h1>
        <p class="page-subtitle">Track your marketplace yield, vendor performance, and regional logistics metrics.</p>
      </div>

      <div class="action-button-group">
        <button class="action-btn secondary-btn" @click="exportPDF">
          <i class="bi bi-file-earmark-pdf me-2"></i>
          Export PDF
        </button>
        <button class="action-btn primary-btn" @click="exportCSV">
          <i class="bi bi-file-earmark-spreadsheet me-2"></i>
          Full Spreadsheet CSV
        </button>
      </div>
    </header>

    <section class="control-panel-card">
      <div class="filter-flex-wrapper">
        <div class="timeframe-segment">
          <button
            v-for="tab in periodTabs"
            :key="tab"
            :class="['segment-tab', !useCustomDateRange && activePeriod === tab && 'segment-tab--active']"
            @click="changePeriod(tab)"
          >
            {{ tab }}
          </button>
        </div>

        <div class="vertical-divider"></div>

        <div class="calendar-range-group">
          <div class="input-field-wrapper">
            <span class="field-prefix">From</span>
            <input
              id="start-date"
              v-model="startDate"
              type="date"
              class="custom-date-input"
              @change="applyCustomDateRange"
            />
          </div>

          <div class="input-field-wrapper">
            <span class="field-prefix">To</span>
            <input
              id="end-date"
              v-model="endDate"
              type="date"
              class="custom-date-input"
              @change="applyCustomDateRange"
            />
          </div>

          <button v-if="useCustomDateRange" class="clear-filters-link" @click="clearDateRange">
            <i class="bi bi-x-circle-fill me-1"></i> Clear Dates
          </button>
        </div>
      </div>
    </section>

    <section v-if="!loading" class="metrics-dashboard-grid">
      <ReportMetricCard
        label="Gross Marketplace Revenue"
        :value="`$${totalRevenue.toFixed(2)}`"
        trend="Live Yield Tracking"
        :trendUp="true"
        class="custom-metric-card"
      />

      <ReportMetricCard
        label="Total Generated Reports"
        :value="String(filteredReports.length)"
        trend="Ecosystem logs"
        :trendUp="true"
        :showBars="true"
        class="custom-metric-card"
      />

      <ReportMetricCard
        label="Active Local Providers"
        :value="String(totalProviders)"
        trend="Verified Farmers"
        :trendUp="true"
        class="custom-metric-card"
      />

      <ReportMetricCard
        label="Processed Produce Orders"
        :value="String(totalOrders)"
        trend="Fulfilled Checkouts"
        :trendUp="true"
        class="custom-metric-card"
      />

      <ReportMetricCard
        label="Admin Platform Net Profit"
        :value="`$${totalAdminProfit.toFixed(2)}`"
        trend="3% Standard Commission"
        :trendUp="true"
        class="custom-metric-card commission-card"
      />
    </section>
    
    <div v-else class="modern-loading-state">
      <div class="loading-spinner"></div>
      <p>Synchronizing local agricultural ledger data...</p>
    </div>

    <section class="dashboard-row visual-row">
      <div class="chart-container-card">
        <div class="card-title-block">
          <h2 class="section-card-title"><i class="bi bi-graph-up-arrow me-2 text-primary"></i>Revenue Distribution Streams</h2>
          <p class="section-card-sub">Visual analysis comparing total gross processing volume vs admin cut margins.</p>
        </div>
        <div class="chart-mount">
          <RevenueTrendChart 
            :adminProfitData="adminProfitData" 
            :activePeriod="activePeriod"
            :useCustomRange="useCustomDateRange"
            :dateRange="{start: startDate, end: endDate}" 
          />
        </div>
      </div>
    </section>

    <section class="dashboard-row split-row">
      <div class="panel-card flex-grow-panel">
        <div class="panel-card-header">
          <div>
            <h3 class="panel-title">Top Farmers & Providers Overview</h3>
            <p class="panel-subtitle">Ranked by total organic produce item checkouts and absolute revenue.</p>
          </div>
        </div>
        
        <div class="clean-table-viewport">
          <table class="modern-data-table">
            <thead>
              <tr>
                <th style="width: 90px">RANK</th>
                <th>FARMER / PROVIDER</th>
                <th>COMPLETED ORDERS</th>
                <th class="text-right-align">TOTAL REVENUE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(provider, index) in topProviders" :key="provider.provider_id" class="table-hover-row">
                <td>
                  <span :class="['modern-rank-pill', index < 3 ? `top-rank-${index + 1}` : 'standard-rank']">
                    #{{ index + 1 }}
                  </span>
                </td>
                <td>
                  <div class="provider-profile-cell">
                    <div class="profile-avatar-fallback">{{ getProviderName(provider).charAt(0) }}</div>
                    <span class="font-weight-medium">{{ getProviderName(provider) }}</span>
                  </div>
                </td>
                <td><span class="numeric-badge">{{ provider.total_orders }} Orders</span></td>
                <td class="text-right-align text-currency">${{ Number(provider.total_revenue || 0).toFixed(2) }}</td>
              </tr>
              <tr v-if="topProviders.length === 0">
                <td colspan="4" class="empty-table-placeholder">No vegetable performance data compiled for this bracket.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel-card fixed-width-panel">
        <div class="panel-card-header">
          <div>
            <h3 class="panel-title">New Onboarded Farms</h3>
            <p class="panel-subtitle">Recently verified vendors</p>
          </div>
        </div>

        <div class="vertical-feed">
          <div v-for="report in recentProviders" :key="report.provider_id" class="feed-item">
            <div class="feed-icon-avatar">
              <i class="bi bi-patch-check-fill"></i>
            </div>
            <div class="feed-content-block">
              <p class="feed-title">{{ getProviderName(report) }}</p>
              <p class="feed-metadata">
                ID: <code>#PRV-{{ report.provider_id }}</code> • Init: {{ report.total_orders }} ord
              </p>
            </div>
          </div>
          <div v-if="recentProviders.length === 0" class="empty-feed-placeholder">
            No modern farm registries discovered.
          </div>
        </div>
      </div>
    </section>

    <section class="panel-card logs-master-card">
      <div class="panel-card-header text-layout-split">
        <div>
          <h3 class="panel-title">Ecosystem Performance Audit Logs</h3>
          <p class="panel-subtitle">Immutable data ledger for all system processed reports and regional orders.</p>
        </div>
      </div>

      <div class="clean-table-viewport">
        <table class="modern-data-table long-table">
          <thead>
            <tr>
              <th>REPORT CODE</th>
              <th>REGISTERED PROVIDER</th>
              <th>VENDOR ID</th>
              <th>TOTAL VOLUME</th>
              <th>GROSS REVENUE</th>
              <th>ADMIN CUT (3%)</th>
              <th class="text-right-align">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in allReports" :key="report.report_id" class="table-hover-row">
              <td><span class="code-string">{{ report.report_code || `#REP-${report.report_id}` }}</span></td>
              <td><span class="font-weight-medium">{{ getProviderName(report) }}</span></td>
              <td><span class="secondary-tag">#PRV-{{ report.provider_id }}</span></td>
              <td>{{ report.total_orders }} lines</td>
              <td class="font-weight-semibold">${{ Number(report.total_revenue || 0).toFixed(2) }}</td>
              <td class="text-profit-cut">${{ (Number(report.total_revenue || 0) * 0.03).toFixed(2) }}</td>
              <td class="text-right-align">
                <button class="row-action-btn" @click="openPopup(report)">
                  <span>View Details</span>
                  <i class="bi bi-arrow-right-short"></i>
                </button>
              </td>
            </tr>
            <tr v-if="allReports.length === 0">
              <td colspan="7" class="empty-table-placeholder">
                No verified agricultural analytics found in system storage registries.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <transition name="fade-scale">
      <div v-if="showPopup" class="modern-modal-overlay" @click.self="closePopup">
        <div class="modern-modal-card">
          <header class="modal-header-block">
            <div>
              <span class="modal-tag">Vendor Breakdown Ledger</span>
              <h3 class="modal-main-title">{{ getProviderName(selectedReport) }}</h3>
            </div>
            <button class="modal-close-icon-btn" @click="closePopup"><i class="bi bi-x"></i></button>
          </header>

          <div class="modal-stats-strip">
            <div class="strip-card">
              <span class="strip-label">Provider Assignment Code</span>
              <span class="strip-val">#PRV-{{ selectedReport?.provider_id }}</span>
            </div>
            <div class="strip-card">
              <span class="strip-label">Combined Dispatched Orders</span>
              <span class="strip-val text-primary-accent">{{ selectedReport?.total_orders }} Orders</span>
            </div>
            <div class="strip-card">
              <span class="strip-label">Aggregated Revenue Yield</span>
              <span class="strip-val text-success-accent">${{ Number(selectedReport?.total_revenue || 0).toFixed(2) }}</span>
            </div>
          </div>

          <div class="clean-table-viewport max-modal-height">
            <table class="modern-data-table matching-sub-theme">
              <thead>
                <tr>
                  <th>ORDER CODE</th>
                  <th>CLIENT CUSTOMER</th>
                  <th>INVOICE VAL</th>
                  <th>LOGISTICS STATUS</th>
                  <th>TIMESTAMP DATE</th>
                  <th class="text-right-align">PLATFORM PROFIT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in providerOrders" :key="order.id">
                  <td><code class="code-string">#ORD-{{ order.id }}</code></td>
                  <td><span class="font-weight-medium">{{ order.customer?.name || 'Unknown Client' }}</span></td>
                  <td>${{ Number(order.total || 0).toFixed(2) }}</td>
                  <td>
                    <span :class="['status-badge-pill', getStatusClass(order.status)]">
                      <span class="status-dot"></span>
                      {{ order.status }}
                    </span>
                  </td>
                  <td><span class="text-secondary-muted">{{ formatDate(order.created_at) }}</span></td>
                  <td class="text-right-align font-weight-semibold text-profit-cut">${{ (Number(order.total || 0) * 0.03).toFixed(2) }}</td>
                </tr>
                <tr v-if="providerOrders.length === 0">
                  <td colspan="6" class="empty-table-placeholder">No explicit single batch orders matching this filter segment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

import ReportMetricCard from '../../components/Admin/Reportmetriccard.vue'


const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const periodTabs = ['Today', 'Weekly', 'Monthly', 'Yearly']
const activePeriod = ref('Today')

const orders = ref([]) 
const reports = ref([]) 
const loading = ref(false)

const startDate = ref('')
const endDate = ref('')
const useCustomDateRange = ref(false)

const adminProfitData = ref([])
const showPopup = ref(false)
const selectedReport = ref(null)
const providerOrders = ref([])

let socket = null

const refreshDashboardMetrics = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchRawOrders(),
      fetchReports()
    ])
    await fetchRevenueTrends()
  } catch (err) {
    console.error('Error synchronizing metrics:', err)
  } finally {
    loading.value = false
  }
}

const fetchRawOrders = async () => {
  try {
    const res = await axios.get(`${API}/orders`)
    orders.value = Array.isArray(res.data) ? res.data : res.data?.orders || []
  } catch (err) {
    console.error('Failed loading ecosystem orders:', err)
    orders.value = []
  }
}

const fetchReports = async () => {
  try {
    const res = await axios.get(`${API}/reports/filtered/all`)
    reports.value = Array.isArray(res.data) ? res.data : res.data?.reports || []
  } catch (err) {
    console.error('Failed loading baseline reports:', err)
    reports.value = []
  }
}

const fetchRevenueTrends = async () => {
  try {
    let endpoint = `${API}/reports/date-range?period=${activePeriod.value.toLowerCase()}`
    if (useCustomDateRange.value && startDate.value && endDate.value) {
      endpoint = `${API}/reports/date-range?start=${startDate.value}&end=${endDate.value}`
    }
    const res = await axios.get(endpoint)
    adminProfitData.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    adminProfitData.value = []
  }
}

const getProviderName = (reportItem) => {
  if (!reportItem) return 'Independent Provider'
  if (reportItem.provider_name && typeof reportItem.provider_name === 'string') return reportItem.provider_name
  if (reportItem.provider && typeof reportItem.provider === 'object') {
    return reportItem.provider.provider_name || reportItem.provider.name || 'Independent Provider'
  }
  if (reportItem.provider && typeof reportItem.provider === 'string') return reportItem.provider
  return 'Independent Provider'
}

const filteredOrdersByTimeframe = computed(() => {
  const now = new Date()
  
  if (useCustomDateRange.value && startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)

    return orders.value.filter(o => {
      const date = new Date(o.created_at || o.createdAt)
      return date >= start && date <= end
    })
  }

  return orders.value.filter(o => {
    const timestamp = o.created_at || o.createdAt
    if (!timestamp) return false
    
    const orderDate = new Date(timestamp)

    if (activePeriod.value === 'Today') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      )
    }

    if (activePeriod.value === 'Weekly') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      return orderDate >= oneWeekAgo && orderDate <= now
    }

    if (activePeriod.value === 'Monthly') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      )
    }

    if (activePeriod.value === 'Yearly') {
      return orderDate.getFullYear() === now.getFullYear()
    }

    return true
  })
})

const totalOrders = computed(() => filteredOrdersByTimeframe.value.length)

const totalRevenue = computed(() => {
  return filteredOrdersByTimeframe.value.reduce((sum, o) => {
    const rawPrice = String(o.price || o.total || '0')
    const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0
    return sum + cleanPrice
  }, 0)
})

const totalAdminProfit = computed(() => {
  return filteredOrdersByTimeframe.value.reduce((sum, o) => {
    if (o.admin_profit !== undefined) return sum + Number(o.admin_profit)
    
    const rawPrice = String(o.price || o.total || '0')
    const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0
    return sum + (cleanPrice * 0.03) 
  }, 0)
})

const totalProviders = computed(() => {
  const providersSet = new Set(
    filteredOrdersByTimeframe.value
      .map(o => o.provider_id || o.provider)
      .filter(Boolean)
  )
  return providersSet.size
})

const topProviders = computed(() => {
  const groups = {}
  filteredOrdersByTimeframe.value.forEach(o => {
    const key = o.provider_id || 1
    const name = o.provider_name || 
                 (o.provider && typeof o.provider === 'object' ? (o.provider.provider_name || o.provider.name) : o.provider) || 
                 'Independent Provider'
                 
    const rawPrice = String(o.price || o.total || '0')
    const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0

    if (!groups[key]) {
      groups[key] = { provider_id: key, provider_name: name, total_orders: 0, total_revenue: 0 }
    }
    groups[key].total_orders++
    groups[key].total_revenue += cleanPrice
  })

  return Object.values(groups)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5)
})

const recentProviders = computed(() => {
  return [...reports.value]
    .sort((a, b) => Number(b.provider_id || 0) - Number(a.provider_id || 0))
    .slice(0, 5)
})

const allReports = computed(() => reports.value)

const filteredReports = computed(() => {
  if (useCustomDateRange.value && startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)
    return reports.value.filter(r => {
      const rDate = new Date(r.created_at)
      return rDate >= start && rDate <= end
    })
  }
  
  const now = new Date()
  return reports.value.filter(r => {
    const rDate = new Date(r.created_at)
    if (activePeriod.value === 'Today') {
      return rDate.getDate() === now.getDate() && rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear()
    }
    if (activePeriod.value === 'Weekly') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      return rDate >= oneWeekAgo && rDate <= now
    }
    if (activePeriod.value === 'Monthly') {
      return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear()
    }
    if (activePeriod.value === 'Yearly') {
      return rDate.getFullYear() === now.getFullYear()
    }
    return true
  })
})

const changePeriod = async (tab) => {
  activePeriod.value = tab
  useCustomDateRange.value = false
  startDate.value = ''
  endDate.value = ''
  await fetchRevenueTrends()
}

const applyCustomDateRange = async () => {
  if (!startDate.value || !endDate.value) return
  useCustomDateRange.value = true
  await fetchRevenueTrends()
}

const clearDateRange = async () => {
  startDate.value = ''
  endDate.value = ''
  useCustomDateRange.value = false
  await changePeriod(activePeriod.value)
}

const openPopup = async (report) => {
  selectedReport.value = report
  try {
    const res = await axios.get(`${API}/orders/provider/${report.provider_id}`)
    providerOrders.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    providerOrders.value = []
  }
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedReport.value = null
  providerOrders.value = []
}

const getStatusClass = (status) => {
  if (!status) return 'status-pending'
  const s = status.toLowerCase()
  if (s === 'completed') return 'status-completed'
  if (s === 'delivering' || s === 'shipped') return 'status-delivering'
  return 'status-pending'
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : 'N/A')

const connectSocket = () => {
  socket = io(API)
  socket.on('dashboard:update', () => {
    refreshDashboardMetrics()
  })
}

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

const exportPDF = () => console.log('Exporting PDF payloads...')
const exportCSV = () => console.log('Exporting CSV payloads...')

onMounted(() => {
  refreshDashboardMetrics()
  connectSocket()
})

onUnmounted(() => {
  disconnectSocket()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Kantumruuy+Pro:wght@400;600;700&display=swap');

/* Typography & Root Overrides */
.analytics-container {
  font-family: 'Inter', 'Kantumruuy Pro', sans-serif;
  color: #2d3748;
  background-color: #fcfdfc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Redesign */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  border-bottom: 1px solid #eef2ef;
  padding-bottom: 20px;
}
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #eaf5ee;
  color: #1b613a;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #111c15;
  letter-spacing: -0.5px;
}
.page-title .sub-text {
  font-size: 18px;
  font-weight: 400;
  color: #718096;
}
.page-subtitle {
  font-size: 14px;
  color: #5a6e61;
  margin-top: 4px;
}
.action-button-group {
  display: flex;
  gap: 12px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.primary-btn {
  background-color: #1e5e3a;
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(30, 94, 58, 0.15);
}
.primary-btn:hover {
  background-color: #154429;
  transform: translateY(-1px);
}
.secondary-btn {
  background-color: #ffffff;
  color: #2d3748;
  border: 1px solid #dce4de;
}
.secondary-btn:hover {
  background-color: #f7f9f8;
  border-color: #cbd5ce;
}

/* Smart Control Filters */
.control-panel-card {
  background: #ffffff;
  border: 1px solid #e1e9e3;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 1px 3px rgba(18, 43, 29, 0.03);
}
.filter-flex-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.timeframe-segment {
  display: flex;
  background-color: #f0f4f1;
  padding: 4px;
  border-radius: 10px;
}
.segment-tab {
  border: none;
  background: transparent;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #5a6e61;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.segment-tab--active {
  background-color: #ffffff;
  color: #1e5e3a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.vertical-divider {
  width: 1px;
  height: 28px;
  background-color: #e1e9e3;
}
@media (max-width: 768px) {
  .vertical-divider { display: none; }
}
.calendar-range-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.input-field-wrapper {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #dce4de;
  border-radius: 8px;
  padding: 2px 10px;
}
.input-field-wrapper:focus-within {
  border-color: #1e5e3a;
  box-shadow: 0 0 0 3px rgba(30, 94, 58, 0.1);
}
.field-prefix {
  font-size: 11px;
  font-weight: 700;
  color: #8fa495;
  text-transform: uppercase;
  margin-right: 8px;
}
.custom-date-input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #1a202c;
  padding: 6px 0;
  background: transparent;
}
.clear-filters-link {
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.clear-filters-link:hover {
  text-decoration: underline;
}

/* Metrics Dashboard Grid Layout */
.metrics-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.custom-metric-card {
  background: #ffffff;
  border: 1px solid #e1e9e3 !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 10px rgba(18, 43, 29, 0.02) !important;
}
.commission-card {
  background: linear-gradient(135deg, #ffffff 0%, #f4faf6 100%);
  border-color: #cde2d4 !important;
}

/* Content Panel Framework cards */
.dashboard-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.visual-row {
  width: 100%;
}
.split-row > .flex-grow-panel {
  flex: 2;
  min-width: 450px;
}
.split-row > .fixed-width-panel {
  flex: 1;
  min-width: 300px;
}
.panel-card, .chart-container-card {
  background: #ffffff;
  border: 1px solid #e1e9e3;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(18, 43, 29, 0.02);
  overflow: hidden;
}
.chart-container-card {
  width: 100%;
  padding: 20px;
}
.card-title-block, .panel-card-header {
  padding: 20px;
  border-bottom: 1px solid #f0f4f1;
}
.panel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-card-title, .panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111c15;
}
.section-card-sub, .panel-subtitle {
  font-size: 12.5px;
  color: #718096;
  margin-top: 3px;
}

/* Modern Data Table Styling */
.clean-table-viewport {
  overflow-x: auto;
  width: 100%;
}
.modern-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.modern-data-table th {
  background-color: #f7faf8;
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 700;
  color: #5a6e61;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e1e9e3;
}
.modern-data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #eef2ef;
  font-size: 13.5px;
  color: #2d3748;
  vertical-align: middle;
}
.table-hover-row {
  transition: background-color 0.15s ease;
}
.table-hover-row:hover {
  background-color: #f4faf6;
}

/* Alignment and Typography classes */
.text-right-align { text-align: right !important; }
.font-weight-medium { font-weight: 500; }
.font-weight-semibold { font-weight: 600; }
.text-currency { color: #1e5e3a; font-weight: 700; }
.text-profit-cut { color: #2b6cb0; font-weight: 600; }
.code-string {
  font-family: monospace;
  background-color: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  color: #4a5568;
  font-size: 12px;
}
.secondary-tag {
  font-size: 12px;
  color: #718096;
}

/* Custom Rank Badge Pills */
.modern-rank-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
}
.top-rank-1 { background-color: #fef3c7; color: #d97706; }
.top-rank-2 { background-color: #e0f2fe; color: #0369a1; }
.top-rank-3 { background-color: #e2e8f0; color: #475569; }
.standard-rank { background-color: #f7faf8; color: #718096; }

/* Table User Profiles */
.provider-profile-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-avatar-fallback {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #eaf5ee;
  color: #1e5e3a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}
.numeric-badge {
  background-color: #edf2f7;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #4a5568;
}

/* Right Side Vertical Feed Design */
.vertical-feed {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 20px 20px;
}
.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f4f1;
}
.feed-item:last-child { border-bottom: none; }
.feed-icon-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #ebf8ff;
  color: #3182ce;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.feed-content-block {
  display: flex;
  flex-direction: column;
}
.feed-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
}
.feed-metadata {
  font-size: 11.5px;
  color: #718096;
  margin-top: 2px;
}

/* Master Logs Row Specific Details */
.logs-master-card {
  margin-top: 4px;
}
.row-action-btn {
  background: transparent;
  border: 1px solid #dce4de;
  color: #1e5e3a;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}
.row-action-btn:hover {
  background-color: #1e5e3a;
  color: #ffffff;
  border-color: #1e5e3a;
}

/* Modern Overlaid Floating Modal Sheet UI */
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(11, 23, 17, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modern-modal-card {
  background-color: #ffffff;
  width: 900px;
  max-width: 92%;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.modal-header-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.modal-tag {
  font-size: 11px;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.modal-main-title {
  font-size: 22px;
  font-weight: 800;
  color: #111c15;
  margin-top: 2px;
}
.modal-close-icon-btn {
  background-color: #f7faf8;
  border: 1px solid #e1e9e3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: #4a5568;
  transition: background-color 0.2s;
}
.modal-close-icon-btn:hover {
  background-color: #fee2e2;
  color: #c53030;
}
.modal-stats-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.strip-card {
  background-color: #f7faf8;
  border: 1px solid #e1e9e3;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}
.strip-label {
  font-size: 11px;
  color: #718096;
  font-weight: 500;
}
.strip-val {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin-top: 4px;
}
.text-primary-accent { color: #1e5e3a; }
.text-success-accent { color: #2b6cb0; }
.max-modal-height {
  max-height: 400px;
}

/* Status Badge Pill Variants */
.status-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 11.5px;
  font-weight: 600;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-completed {
  background-color: #e6fffa;
  color: #234e52;
}
.status-completed .status-dot { background-color: #319795; }

.status-delivering {
  background-color: #fffaf0;
  color: #744210;
}
.status-delivering .status-dot { background-color: #dd6b20; }

.status-pending {
  background-color: #fff5f5;
  color: #742a2a;
}
.status-pending .status-dot { background-color: #e53e3e; }

/* Empty Placeholder Global Styles */
.empty-table-placeholder, .empty-feed-placeholder {
  text-align: center;
  padding: 30px !important;
  color: #718096;
  font-size: 13px;
  background: transparent;
}

/* Modern Loading Layout State */
.modern-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 14px;
}
.loading-spinner {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #1e5e3a;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transition Animations */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>