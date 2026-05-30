<template>
  <div class="reports-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports & Analytics</h1>
        <p class="page-sub">
          Monitor system performance and business insights.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn-export">
          <i class="bi bi-download me-1"></i>
          Export PDF
        </button>

        <button class="btn-csv">
          <i class="bi bi-file-earmark-spreadsheet me-1"></i>
          Full Report CSV
        </button>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-bar">
      <div class="period-tabs">
        <button
          v-for="tab in periodTabs"
          :key="tab"
          :class="['period-tab', activePeriod === tab && 'period-tab--active']"
          @click="changePeriod(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- METRICS -->
    <div class="metrics-row">
      <ReportMetricCard
        label="Total Revenue"
        :value="`$${totalRevenue.toFixed(2)}`"
        trend="+ Live"
        :trendUp="true"
      />

      <ReportMetricCard
        label="Total Reports"
        :value="String(reports.length)"
        :trendUp="true"
        :showBars="true"
      />

      <ReportMetricCard
        label="Total Providers"
        :value="String(totalProviders)"
        :trendUp="true"
      />

      <ReportMetricCard
        label="Total Orders"
        :value="String(totalOrders)"
        :trendUp="true"
      />
    </div>

    <!-- CHARTS -->
    <div class="charts-row">
      <div class="chart-left">
        <RevenueTrendChart />
      </div>

      <div class="chart-right">
        <OrderDistributionChart />
      </div>
    </div>

    <!-- PROVIDER CARD -->
    <div class="mid-row">
      <EliteProvidersList />

      <div class="trending-card">
        <div class="card-header">
          <h3 class="card-title">Provider Reports</h3>
          <span class="card-link">Live</span>
        </div>

        <div class="trending-items">
          <div
            v-for="report in reports"
            :key="report.report_id"
            class="trending-item"
          >
            <div class="produce-img">
              <i class="bi bi-shop"></i>
            </div>

            <div>
              <p class="produce-name">
                {{ report.provider_name }}
              </p>

              <p class="produce-sub">
                {{ report.total_orders }} Orders •
                ${{ Number(report.total_revenue || 0).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="snapshot-card">
      <div class="snapshot-header">
        <h3 class="snapshot-title">Recent Orders Snapshot</h3>
        <p class="snapshot-sub">Real-time performance tracking.</p>
      </div>

      <div class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>REPORT ID</th>
              <th>PROVIDER</th>
              <th>PROVIDER ID</th>
              <th>TOTAL ORDERS</th>
              <th>TOTAL REVENUE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="report in reports" :key="report.report_id">
              <td>#REP-{{ report.report_id }}</td>
              <td>{{ report.provider_name }}</td>
              <td>#PRV-{{ report.provider_id }}</td>
              <td>{{ report.total_orders }}</td>
              <td>${{ Number(report.total_revenue || 0).toFixed(2) }}</td>

              <td class="action-cell">
                <button class="view-btn" @click="openPopup(report)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- POPUP -->
    <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
      <div class="popup-card">
        <div class="popup-header">
          <div>
            <h3 class="popup-title">Provider Orders</h3>
            <p class="popup-sub">
              {{ selectedReport?.provider_name }}
            </p>
          </div>

          <button class="popup-close" @click="closePopup">✕</button>
        </div>

        <div class="popup-stats">
          <div class="popup-stat-card">
            <span class="popup-stat-label">Provider ID</span>
            <span class="popup-stat-value">
              #PRV-{{ selectedReport?.provider_id }}
            </span>
          </div>

          <div class="popup-stat-card">
            <span class="popup-stat-label">Total Orders</span>
            <span class="popup-stat-value">
              {{ selectedReport?.total_orders }}
            </span>
          </div>

          <div class="popup-stat-card">
            <span class="popup-stat-label">Total Revenue</span>
            <span class="popup-stat-value">
              ${{ Number(selectedReport?.total_revenue || 0).toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="popup-table-wrapper">
          <table class="orders-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in providerOrders" :key="order.id">
                <td>#ORD-{{ order.id }}</td>
                <td>{{ order.customer?.name || 'Unknown' }}</td>
                <td>${{ Number(order.total || 0).toFixed(2) }}</td>
                <td>
                  <span class="status-badge" :class="order.status">
                    {{ order.status }}
                  </span>
                </td>
                <td>{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import ReportMetricCard from '../../components/Admin/Reportmetriccard.vue'
import RevenueTrendChart from '../../components/Admin/Revenuetrendchart.vue'
import OrderDistributionChart from '../../components/Admin/Orderdistributionchart.vue'
import EliteProvidersList from '../../components/Admin/Eliteproviderslist.vue'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const periodTabs = ['Daily', 'Weekly', 'Monthly', 'Yearly']
const activePeriod = ref('Monthly')

const orders = ref([])
const reports = ref([])

const showPopup = ref(false)
const selectedReport = ref(null)
const providerOrders = ref([])

const fetchOrders = async () => {
  const res = await axios.get(`${API}/orders`)
  orders.value = res.data || []
  filterOrders()
}

const filterOrders = () => {
  const now = new Date()
  let filtered = [...orders.value]

  if (activePeriod.value === 'Daily') {
    filtered = filtered.filter(o => {
      const d = new Date(o.created_at)
      return d.toDateString() === now.toDateString()
    })
  }

  if (activePeriod.value === 'Weekly') {
    const week = new Date()
    week.setDate(now.getDate() - 7)
    filtered = filtered.filter(o => new Date(o.created_at) >= week)
  }

  if (activePeriod.value === 'Monthly') {
    filtered = filtered.filter(o => {
      const d = new Date(o.created_at)
      return d.getMonth() === now.getMonth()
    })
  }

  if (activePeriod.value === 'Yearly') {
    filtered = filtered.filter(o => {
      return new Date(o.created_at).getFullYear() === now.getFullYear()
    })
  }

  generateReports(filtered)
}

const changePeriod = (tab) => {
  activePeriod.value = tab
  filterOrders()
}

const generateReports = async (filteredOrders) => {
  const grouped = {}

  filteredOrders.forEach(order => {
    const id = order.provider_id

    if (!grouped[id]) {
      grouped[id] = {
        provider_id: id,
        provider_name: order.provider?.provider_name || 'Unknown',
        total_orders: 0,
        total_revenue: 0
      }
    }

    grouped[id].total_orders++
    grouped[id].total_revenue += Number(order.total || 0)
  })

  reports.value = Object.values(grouped).map((r, i) => ({
    report_id: i + 1,
    ...r
  }))

  await saveReports()
}

const saveReports = async () => {
  try {
    await axios.post(`${API}/reports/generate`, {
      reports: reports.value
    })
  } catch (e) {
    console.error(e)
  }
}

const openPopup = (report) => {
  selectedReport.value = report

  providerOrders.value = orders.value.filter(
    o => o.provider_id === report.provider_id
  )

  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedReport.value = null
  providerOrders.value = []
}

const formatDate = (d) => new Date(d).toLocaleDateString()

const totalRevenue = computed(() =>
  reports.value.reduce((s, r) => s + Number(r.total_revenue || 0), 0)
)

const totalOrders = computed(() =>
  reports.value.reduce((s, r) => s + Number(r.total_orders || 0), 0)
)

const totalProviders = computed(() => reports.value.length)

onMounted(fetchOrders)
</script>

<style scoped>
.reports-page{
  display:flex;
  flex-direction:column;
  gap:18px;
}

/* HEADER */
.page-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.page-title{
  font-size:26px;
  font-weight:800;
  color:#111827;
}

.page-sub{
  margin-top:4px;
  font-size:12.5px;
  color:#6b7280;
}

.header-actions{
  display:flex;
  gap:10px;
}

.btn-export,
.btn-csv{
  display:flex;
  align-items:center;
  gap:4px;
  padding:9px 16px;
  border-radius:9px;
  font-size:12.5px;
  font-weight:700;
  cursor:pointer;
}

.btn-export{
  background:#fff;
  border:1px solid #e5e7eb;
}

.btn-csv{
  background:#1a3d2a;
  border:none;
  color:#fff;
}

/* FILTER */
.filter-bar{
  display:flex;
  align-items:center;
  gap:10px;
}

.period-tabs{
  display:flex;
  gap:2px;
}

.period-tab{
  padding:6px 14px;
  border:1px solid #e5e7eb;
  background:#fff;
  border-radius:6px;
  cursor:pointer;
  font-size:12px;
  font-weight:600;
}

.period-tab--active{
  background:#1a3d2a;
  color:#fff;
  border-color:#1a3d2a;
}

/* METRICS */
.metrics-row{
  display:flex;
  gap:12px;
}

/* CHARTS */
.charts-row{
  display:flex;
  gap:14px;
}

.chart-left{
  flex:1;
}

.chart-right{
  width:240px;
}

/* MID */
.mid-row{
  display:flex;
  gap:14px;
}

/* CARD */
.trending-card{
  width:240px;
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:18px;
}

.card-header{
  display:flex;
  justify-content:space-between;
  margin-bottom:14px;
}

.card-title{
  font-size:14px;
  font-weight:700;
}

.card-link{
  font-size:11px;
  color:#16a34a;
}

.trending-items{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.trending-item{
  display:flex;
  gap:12px;
  align-items:center;
}

.produce-img{
  width:55px;
  height:55px;
  border-radius:12px;
  background:#dcfce7;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
}

.produce-name{
  font-size:13px;
  font-weight:700;
}

.produce-sub{
  font-size:11px;
  color:#6b7280;
}

/* TABLE */
.snapshot-card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:20px;
}

.snapshot-header{
  margin-bottom:18px;
}

.snapshot-title{
  font-size:16px;
  font-weight:700;
}

.snapshot-sub{
  font-size:12px;
  color:#6b7280;
}

.table-wrapper{
  overflow-x:auto;
}

.orders-table{
  width:100%;
  border-collapse:collapse;
}

.orders-table th{
  text-align:left;
  padding:12px;
  font-size:12px;
  color:#6b7280;
  border-bottom:1px solid #f3f4f6;
}

.orders-table td{
  padding:14px 12px;
  border-bottom:1px solid #f3f4f6;
  font-size:13px;
}

.action-cell{
  text-align:right;
}

.view-btn{
  background:#1a3d2a;
  color:#fff;
  border:none;
  padding:8px 14px;
  border-radius:8px;
  cursor:pointer;
  font-size:12px;
  font-weight:600;
}

/* POPUP */
.popup-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:999;
}

.popup-card{
  width:1000px;
  max-width:95%;
  max-height:90vh;
  overflow-y:auto;
  background:#fff;
  border-radius:20px;
  padding:24px;
}

.popup-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}

.popup-title{
  font-size:22px;
  font-weight:800;
}

.popup-sub{
  margin-top:4px;
  color:#6b7280;
}

.popup-close{
  width:40px;
  height:40px;
  border:none;
  border-radius:10px;
  background:#ef4444;
  color:#fff;
  cursor:pointer;
  font-size:16px;
}

.popup-stats{
  display:flex;
  gap:14px;
  margin-bottom:24px;
}

.popup-stat-card{
  flex:1;
  background:#f9fafb;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.popup-stat-label{
  font-size:12px;
  color:#6b7280;
}

.popup-stat-value{
  font-size:18px;
  font-weight:700;
  color:#111827;
}

.popup-table-wrapper{
  overflow-x:auto;
}

/* STATUS */
.status-badge{
  padding:5px 10px;
  border-radius:20px;
  font-size:11px;
  font-weight:700;
  text-transform:capitalize;
}

.status-badge.pending{
  background:#fef3c7;
  color:#d97706;
}

.status-badge.completed{
  background:#dcfce7;
  color:#16a34a;
}

.status-badge.delivering{
  background:#dbeafe;
  color:#2563eb;
}

.status-badge.shipped{
  background:#ede9fe;
  color:#7c3aed;
}
</style>