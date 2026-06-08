<template>
  <div class="dashboard-viewport">
    
    <header class="topbar-container">
      <div class="branding-group">
        <div class="ecosystem-tag">
          <span class="pulse-indicator"></span>
          Marketplace Live Overview
        </div>
        <h1 class="main-dashboard-title">Admin Dashboard Panel</h1>
        <p class="subtitle-text">Monitor continuous crop yields, active farmer payouts, and localized logistical items.</p>
      </div>

      <div class="smart-filter-hub">
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

        <div class="date-range-capsule">
          <div class="inline-date-input">
            <span class="date-label">From</span>
            <input type="date" v-model="startDate" class="hidden-date-picker" @change="applyCustomDateRange" />
          </div>
          <div class="date-arrow-separator"><i class="bi bi-arrow-right"></i></div>
          <div class="inline-date-input">
            <span class="date-label">To</span>
            <input type="date" v-model="endDate" class="hidden-date-picker" @change="applyCustomDateRange" />
          </div>
          
          <button v-if="useCustomDateRange" class="control-reset-btn mini-clear" @click="clearDateRange" title="Reset filters">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="dashboard-loading-spinner-screen">
      <div class="spinner-circle"></div>
      <p class="loading-label-text">Fetching agricultural distribution matrices...</p>
    </div>

    <div v-else class="dashboard-main-content-fade">

      <section class="kpi-dashboard-grid">
        <div class="metric-kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Gross Crop Revenue</span>
            <h2 class="kpi-value-text text-forest">{{ formatMoney(summary.revenue) }}</h2>
          </div>
          <div class="kpi-icon-wrapper icon-bg-revenue">
            <i class="bi bi-cash-stack"></i>
          </div>
        </div>

        <div class="metric-kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Platform Admin Profit (3%)</span>
            <h2 class="kpi-value-text text-ocean">{{ formatMoney(summary.profit) }}</h2>
          </div>
          <div class="kpi-icon-wrapper icon-bg-profit">
            <i class="bi bi-pie-chart-fill"></i>
          </div>
        </div>

        <div class="metric-kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Total Fulfillments</span>
            <h2 class="kpi-value-text">{{ summary.orders }} <span class="kpi-unit-label">lines</span></h2>
          </div>
          <div class="kpi-icon-wrapper icon-bg-orders">
            <i class="bi bi-bag-check"></i>
          </div>
        </div>

        <div class="metric-kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Verified Active Farmers</span>
            <h2 class="kpi-value-text">{{ summary.providers }} <span class="kpi-unit-label">farms</span></h2>
          </div>
          <div class="kpi-icon-wrapper icon-bg-providers">
            <i class="bi bi-tree"></i>
          </div>
        </div>
      </section>

      <section class="dashboard-layout-row visual-graphics-row">
        <div class="content-panel-card big-chart-flex">
          <div class="panel-header-block">
            <div class="header-icon-dot bg-forest-dot"><i class="bi bi-graph-up"></i></div>
            <div>
              <h3 class="panel-headline-title">Revenue Trajectory Trend ({{ useCustomDateRange ? 'Custom' : activePeriod }})</h3>
              <p class="panel-headline-subtitle">Visual mapping of transactional values compiled across the chosen timeline bracket.</p>
            </div>
          </div>
          <div class="canvas-render-container line-canvas-height">
            <canvas ref="lineCanvas"></canvas>
          </div>
        </div>

        <div class="content-panel-card small-chart-flex">
          <div class="panel-header-block">
            <div class="header-icon-dot bg-ocean-dot"><i class="bi bi-pie-chart"></i></div>
            <div>
              <h3 class="panel-headline-title">Marketplace Split</h3>
              <p class="panel-headline-subtitle">Gross marketplace value vs admin fee metrics.</p>
            </div>
          </div>
          <div class="canvas-render-container pie-canvas-height">
            <canvas ref="pieCanvas"></canvas>
          </div>
        </div>
      </section>

      <section class="dashboard-layout-row dual-tables-row">
        <div class="content-panel-card split-column-card">
          <div class="panel-header-block layout-space-between">
            <div class="d-flex-align-center">
              <div class="header-icon-dot bg-amber-dot"><i class="bi bi-clock-history"></i></div>
              <div>
                <h3 class="panel-headline-title">Recent Dispatched Orders</h3>
                <p class="panel-headline-subtitle">Real-time trace logs of vegetable purchases within chosen timeline.</p>
              </div>
            </div>
          </div>

          <div class="list-rows-container">
            <div v-for="o in recentOrders" :key="o.id" class="list-item-row interaction-hover">
              <div class="row-left-meta">
                <div class="order-id-pouch">#{{ o.id }}</div>
                <div class="row-text-block">
                  <span class="row-main-bold text-dark">{{ o.provider }}</span>
                  <p class="row-sub-muted">{{ formatDate(o.createdAt) }}</p>
                </div>
              </div>

              <div class="row-right-meta">
                <span class="row-monetary-text">{{ formatMoney(o.total) }}</span>
                <span class="status-pill-badge" :class="o.status">
                  <span class="inner-status-circle"></span>
                  {{ o.status }}
                </span>
              </div>
            </div>
            <div v-if="recentOrders.length === 0" class="empty-placeholder-padding">
              No recent orders discovered for this period.
            </div>
          </div>
        </div>

        <div class="content-panel-card split-column-card">
          <div class="panel-header-block layout-space-between">
            <div class="d-flex-align-center">
              <div class="header-icon-dot bg-purple-dot"><i class="bi bi-award"></i></div>
              <div>
                <h3 class="panel-headline-title">Top Farmers & Cooperatives</h3>
                <p class="panel-headline-subtitle">Top yield performers filtered by total combined gross invoice checkouts.</p>
              </div>
            </div>
          </div>

          <div class="list-rows-container">
            <div v-for="(p, index) in topProviders" :key="p.id" class="list-item-row interaction-hover">
              <div class="row-left-meta">
                <div class="ranking-avatar-index" :class="`rank-index-${index + 1}`">
                  {{ index + 1 }}
                </div>
                <div class="row-text-block">
                  <span class="row-main-bold text-dark">{{ p.name }}</span>
                  <p class="row-sub-muted"><span class="badge-count-pill">{{ p.orders }}</span> verified checkouts</p>
                </div>
              </div>

              <div class="row-right-meta">
                <span class="row-monetary-text text-forest">{{ formatMoney(p.revenue) }}</span>
                <p class="row-sub-profit-cut">
                  Cut: <span class="font-semibold">{{ formatMoney(p.revenue * 0.03) }}</span>
                </p>
              </div>
            </div>
            <div v-if="topProviders.length === 0" class="empty-placeholder-padding">
              No provider yield distributions calculated.
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue"
import axios from "axios"
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const API = "http://localhost:3000"

// Core State Fields
const allRawOrders = ref([])
const filteredOrders = ref([])
const loading = ref(false)

// Timeframe Filter Matrix State
const periodTabs = ["Today", "Weekly", "Monthly", "Yearly"]
const activePeriod = ref("Monthly")
const useCustomDateRange = ref(false)
const startDate = ref("")
const endDate = ref("")

const summary = ref({
  revenue: 0,
  profit: 0,
  orders: 0,
  providers: 0
})

const lineCanvas = ref(null)
const pieCanvas = ref(null)

let lineChart = null
let pieChart = null

/* INITIAL DATA ACQUISITION */
const fetchAllOrders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/orders`)
    allRawOrders.value = data.map(o => ({
      id: o.id,
      total: Number(o.total || 0),
      status: o.status || 'pending',
      providerId: o.provider_id || o.provider?.id,
      provider: o.provider?.provider_name || `Provider ${o.provider_id || 'Unknown'}`,
      createdAt: new Date(o.created_at)
    }))
    executeFilteringEngine()
  } catch (error) {
    console.error("Critical ecosystem failure during ledger synchronization:", error)
  } finally {
    loading.value = false
  }
}

/* CHRONOLOGICAL FILTER ENGINE */
const executeFilteringEngine = () => {
  let processed = [...allRawOrders.value]

  if (useCustomDateRange.value) {
    // Process input parameters using strict custom calendar boundaries
    if (startDate.value) {
      const start = new Date(startDate.value)
      start.setHours(0, 0, 0, 0)
      processed = processed.filter(o => o.createdAt >= start)
    }
    if (endDate.value) {
      const end = new Date(endDate.value)
      end.setHours(23, 59, 59, 999)
      processed = processed.filter(o => o.createdAt <= end)
    }
  } else {
    // Dynamically project bounds relative to localized system time context
    const now = new Date()
    const referenceStart = new Date()
    
    if (activePeriod.value === "Today") {
      referenceStart.setHours(0, 0, 0, 0)
      processed = processed.filter(o => o.createdAt >= referenceStart)
    } 
    else if (activePeriod.value === "Weekly") {
      referenceStart.setDate(now.getDate() - 7)
      referenceStart.setHours(0, 0, 0, 0)
      processed = processed.filter(o => o.createdAt >= referenceStart)
    } 
    else if (activePeriod.value === "Monthly") {
      referenceStart.setDate(1)
      referenceStart.setHours(0, 0, 0, 0)
      processed = processed.filter(o => o.createdAt >= referenceStart)
    } 
    else if (activePeriod.value === "Yearly") {
      referenceStart.setMonth(0, 1)
      referenceStart.setHours(0, 0, 0, 0)
      processed = processed.filter(o => o.createdAt >= referenceStart)
    }
  }

  filteredOrders.value = processed
  buildSummaryMatrix()
  
  nextTick(() => {
    buildCharts()
  })
}

/* METRIC COMPILATION MATRIX */
const buildSummaryMatrix = () => {
  const revenue = filteredOrders.value.reduce((sum, o) => sum + o.total, 0)
  const validProviders = filteredOrders.value.filter(o => o.providerId)

  summary.value = {
    revenue,
    profit: revenue * 0.03,
    orders: filteredOrders.value.length,
    providers: new Set(validProviders.map(o => o.providerId)).size
  }
}

/* PERIOD ADJUSTMENT INTERFACES */
const changePeriod = (period) => {
  useCustomDateRange.value = false
  activePeriod.value = period
  startDate.value = ""
  endDate.value = ""
  executeFilteringEngine()
}

const applyCustomDateRange = () => {
  if (startDate.value || endDate.value) {
    useCustomDateRange.value = true
    executeFilteringEngine()
  }
}

const clearDateRange = () => {
  useCustomDateRange.value = false
  startDate.value = ""
  endDate.value = ""
  activePeriod.value = "Monthly" // Fallback back default timeline
  executeFilteringEngine()
}

/* CHART KEY GENERATOR (Adapts labels gracefully depending on time frame scope) */
const formatChartLabelKey = (date) => {
  const d = new Date(date)
  if (activePeriod.value === "Today" && !useCustomDateRange.value) {
    return `${String(d.getHours()).padStart(2, "0")}:00`
  }
  if (activePeriod.value === "Yearly" && !useCustomDateRange.value) {
    return d.toLocaleString("en-US", { month: "short" })
  }
  return d.toISOString().split("T")[0] // Standard YYYY-MM-DD template configuration
}

/* GRAPHIC RENDERING SERVICES */
const buildCharts = () => {
  if (!lineCanvas.value || !pieCanvas.value) return

  const grouped = {}
  filteredOrders.value.forEach(o => {
    const key = formatChartLabelKey(o.createdAt)
    grouped[key] = (grouped[key] || 0) + o.total
  })

  // Format array payload mapping key-value sets properly
  let labels = Object.keys(grouped)
  if (activePeriod.value !== "Today" && activePeriod.value !== "Yearly") {
    labels.sort()
  }
  const values = labels.map(l => grouped[l])

  lineChart?.destroy()
  pieChart?.destroy()

  lineChart = new Chart(lineCanvas.value, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Marketplace Gross Volume",
        data: values,
        borderColor: "#1b613a", 
        borderWidth: 3,
        pointBackgroundColor: "#1b613a",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
        backgroundColor: "rgba(27, 97, 58, 0.05)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 12,
          backgroundColor: "#111c15",
          titleFont: { family: "Inter", size: 12 },
          bodyFont: { family: "Inter", size: 13, weight: "bold" },
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          grid: { color: "#f0f4f1" },
          ticks: { font: { family: "Inter", size: 11 }, color: "#718096" }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "Inter", size: 11 }, color: "#718096" }
        }
      }
    }
  })

  pieChart = new Chart(pieCanvas.value, {
    type: "pie",
    data: {
      labels: ["Gross Vendor Volume", "Admin Commission (3%)"],
      datasets: [{
        data: [summary.value.revenue - summary.value.profit, summary.value.profit],
        backgroundColor: ["#1b613a", "#2b6cb0"],
        borderWidth: 2,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "Inter", size: 12, weight: 500 }, color: "#2d3748", padding: 16 }
        },
        tooltip: { padding: 12, cornerRadius: 8 }
      }
    }
  })
}

/* DYNAMIC COMPUTED SUB-DATASETS */
const topProviders = computed(() => {
  const map = {}
  filteredOrders.value.forEach(o => {
    if (!o.providerId) return
    if (!map[o.providerId]) {
      map[o.providerId] = { id: o.providerId, name: o.provider, revenue: 0, orders: 0 }
    }
    map[o.providerId].revenue += o.total
    map[o.providerId].orders++
  })
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
})

const recentOrders = computed(() =>
  [...filteredOrders.value].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
)

/* UTILS */
const formatMoney = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v || 0)

const formatDate = (date) => {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

onMounted(fetchAllOrders)

onBeforeUnmount(() => {
  lineChart?.destroy()
  pieChart?.destroy()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.dashboard-viewport {
  font-family: 'Inter', sans-serif;
  color: #2d3748;
  background-color: #fcfdfc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.topbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  border-bottom: 1px solid #eef2ef;
  padding-bottom: 20px;
}

.ecosystem-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #eaf5ee;
  color: #1b613a;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 11.5px;
  font-weight: 700;
  margin-bottom: 8px;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  background-color: #16a34a;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
}

.main-dashboard-title {
  font-size: 28px;
  font-weight: 800;
  color: #111c15;
  letter-spacing: -0.5px;
}

.subtitle-text {
  font-size: 13.5px;
  color: #5a6e61;
  margin-top: 4px;
}

/* Timeframe Navigation Component Styling */
.smart-filter-hub {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.timeframe-segment {
  display: flex;
  background-color: #f1f5f2;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #dce4de;
}

.segment-tab {
  border: none;
  background: transparent;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-tab:hover {
  color: #1b613a;
}

.segment-tab--active {
  background-color: #ffffff;
  color: #1b613a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.vertical-divider {
  width: 1px;
  height: 28px;
  background-color: #dce4de;
}

.date-range-capsule {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #dce4de;
  border-radius: 10px;
  padding: 4px 14px;
  position: relative;
}

.inline-date-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-label {
  font-size: 11px;
  font-weight: 700;
  color: #8fa495;
  text-transform: uppercase;
}

.hidden-date-picker {
  border: none;
  outline: none;
  font-size: 13px;
  color: #1a202c;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
}

.date-arrow-separator {
  padding: 0 12px;
  color: #cbd5ce;
  font-size: 12px;
}

.control-reset-btn.mini-clear {
  background: transparent;
  border: none;
  color: #e53e3e;
  padding: 0 0 0 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}
.control-reset-btn.mini-clear:hover {
  color: #c53030;
}

.kpi-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.metric-kpi-card {
  background-color: #ffffff;
  border: 1px solid #e1e9e3;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(18, 43, 29, 0.015);
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 6px;
}

.kpi-value-text {
  font-size: 24px;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -0.5px;
}

.kpi-unit-label {
  font-size: 14px;
  font-weight: 400;
  color: #a0aec0;
}

.text-forest { color: #1b613a !important; }
.text-ocean { color: #2b6cb0 !important; }

.kpi-icon-wrapper {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.icon-bg-revenue { background-color: #eaf5ee; color: #1b613a; }
.icon-bg-profit { background-color: #ebf8ff; color: #2b6cb0; }
.icon-bg-orders { background-color: #fef3c7; color: #d97706; }
.icon-bg-providers { background-color: #f3e8ff; color: #8b5cf6; }

.dashboard-layout-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
}

.visual-graphics-row > .big-chart-flex { flex: 2.3; min-width: 450px; }
.visual-graphics-row > .small-chart-flex { flex: 1.1; min-width: 280px; }
.dual-tables-row > .split-column-card { flex: 1; min-width: 340px; }

.content-panel-card {
  background-color: #ffffff;
  border: 1px solid #e1e9e3;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(18, 43, 29, 0.02);
  overflow: hidden;
}

.panel-header-block {
  padding: 20px;
  border-bottom: 1px solid #f0f4f1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.layout-space-between { justify-content: space-between; }
.d-flex-align-center { display: flex; align-items: center; gap: 12px; }

.header-icon-dot {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.bg-forest-dot { background-color: #eaf5ee; color: #1b613a; }
.bg-ocean-dot { background-color: #ebf8ff; color: #2b6cb0; }
.bg-amber-dot { background-color: #fffbeb; color: #d97706; }
.bg-purple-dot { background-color: #f5f3ff; color: #7c3aed; }

.panel-headline-title {
  font-size: 15.5px;
  font-weight: 700;
  color: #111c15;
}

.panel-headline-subtitle {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.canvas-render-container {
  padding: 20px;
  position: relative;
  width: 100%;
}

.line-canvas-height { height: 320px; }
.pie-canvas-height { height: 260px; }

.list-rows-container {
  display: flex;
  flex-direction: column;
}

.list-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #eef2ef;
}

.list-item-row:last-child { border-bottom: none; }
.interaction-hover { transition: background-color 0.15s ease; }
.interaction-hover:hover { background-color: #f7faf8; }

.row-left-meta, .row-right-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.row-right-meta {
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.row-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-main-bold {
  font-size: 13.5px;
  font-weight: 600;
}

.text-dark { color: #1a202c; }

.row-sub-muted {
  font-size: 11.5px;
  color: #718096;
}

.row-monetary-text {
  font-size: 14px;
  font-weight: 700;
  color: #2d3748;
}

.order-id-pouch {
  font-family: monospace;
  background-color: #edf2f7;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #4a5568;
}

.badge-count-pill {
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.row-sub-profit-cut {
  font-size: 11px;
  color: #4a5568;
  background-color: #f0f4f8;
  padding: 2px 6px;
  border-radius: 4px;
}

.font-semibold { font-weight: 600; color: #2b6cb0; }

.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.inner-status-circle { width: 5px; height: 5px; border-radius: 50%; }
.status-pill-badge.completed { background-color: #edfdf5; color: #15803d; }
.status-pill-badge.completed .inner-status-circle { background-color: #16a34a; }
.status-pill-badge.delivering { background-color: #eff6ff; color: #1d4ed8; }
.status-pill-badge.delivering .inner-status-circle { background-color: #3b82f6; }
.status-pill-badge.pending { background-color: #fffbeb; color: #b45309; }
.status-pill-badge.pending .inner-status-circle { background-color: #d97706; }

.ranking-avatar-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.rank-index-1 { background-color: #fef3c7; color: #d97706; }
.rank-index-2 { background-color: #e0f2fe; color: #0369a1; }
.rank-index-3 { background-color: #e2e8f0; color: #475569; }
.rank-index-4, .rank-index-5 { background-color: #f7faf8; color: #718096; }

.empty-placeholder-padding {
  padding: 30px;
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
}

.dashboard-loading-spinner-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.spinner-circle {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #1b613a;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin-clockwise 0.8s linear infinite;
  margin-bottom: 14px;
}

@keyframes spin-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-label-text {
  font-size: 13.5px;
  color: #718096;
  font-weight: 500;
}

.dashboard-main-content-fade {
  animation: component-fade-in 0.35s ease-out forwards;
}

@keyframes component-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>