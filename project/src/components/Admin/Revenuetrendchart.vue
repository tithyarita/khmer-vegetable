<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Revenue Distribution Streams</h3>
        <p class="chart-sub">Admin profit comparison by {{ periodLabel }}</p>
      </div>
    </div>

    <div v-if="!hasData" class="no-data">
      <p>No data available for the selected date range</p>
    </div>

    <div v-else class="chart-layout">
      <!-- Left: Donut Pie Chart -->
      <div class="pie-section">
        <div class="pie-container">
          <svg viewBox="0 0 220 220" class="pie-svg">
            <circle cx="110" cy="110" r="95" fill="none" stroke="#e8ede9" stroke-width="28" />
            <circle
              v-for="(slice, i) in pieSlices"
              :key="i"
              cx="110"
              cy="110"
              r="95"
              fill="none"
              :stroke="slice.color"
              stroke-width="28"
              :stroke-dasharray="slice.dashArray"
              :stroke-dashoffset="slice.dashOffset"
              transform="rotate(-90, 110, 110)"
              class="pie-segment"
            />
            <text x="110" y="100" text-anchor="middle" class="pie-total-label">${{ totalRevenueDisplay }}</text>
            <text x="110" y="125" text-anchor="middle" class="pie-total-sub">Total Revenue</text>
          </svg>
        </div>

        <!-- Legend -->
        <div class="pie-legend">
          <div v-for="(slice, i) in pieSlices" :key="i" class="legend-item">
            <span class="legend-dot" :style="{ background: slice.color }"></span>
            <span class="legend-label">{{ slice.label }}</span>
            <span class="legend-value">${{ slice.value }}</span>
            <span class="legend-pct">({{ slice.percent }}%)</span>
          </div>
        </div>
      </div>

      <!-- Right: Daily comparison bars -->
      <div class="daily-section">
        <h4 class="daily-title">Admin profit comparison by day</h4>
        <div class="daily-chart">
          <div v-for="(day, i) in dailyData" :key="i" class="daily-bar-group">
            <div class="daily-bar-wrapper">
              <div
                class="daily-bar"
                :style="{ height: day.height + '%', background: day.color }"
                :title="`$${day.value} on ${day.label}`"
              ></div>
            </div>
            <span class="daily-label">{{ day.label }}</span>
            <span class="daily-value">${{ day.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  adminProfitData: {
    type: Array,
    default: () => [],
  },
  activePeriod: {
    type: String,
    default: 'Today',
  },
  useCustomRange: {
    type: Boolean,
    default: false,
  },
  dateRange: {
    type: Object,
    default: () => ({ start: '', end: '' }),
  },
})

const PIE_COLORS = ['#1e5e3a', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#f0fdf4']
const DAILY_COLORS = ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#f0fdf4']

const periodLabel = computed(() => {
  if (props.useCustomRange) return 'custom range'
  const period = props.activePeriod.toLowerCase()
  if (period === 'today') return 'hour'
  if (period === 'weekly') return 'day'
  if (period === 'monthly') return 'day'
  if (period === 'yearly') return 'month'
  return 'period'
})

const hasData = computed(() => {
  return props.adminProfitData && props.adminProfitData.length > 0
})

// Aggregate data by time period for daily breakdown
const aggregatedData = computed(() => {
  if (!hasData.value) return []
  const data = props.adminProfitData
  const period = props.activePeriod.toLowerCase()
  const groups = {}

  data.forEach(item => {
    const date = new Date(item.created_at || item.createdAt || Date.now())
    let key = ''

    if (props.useCustomRange) {
      key = date.toISOString().split('T')[0]
    } else if (period === 'today') {
      key = `${date.getHours()}:00`
    } else if (period === 'weekly') {
      key = date.toLocaleDateString('en-US', { weekday: 'short' })
    } else if (period === 'monthly') {
      key = date.getDate().toString()
    } else if (period === 'yearly') {
      key = date.toLocaleDateString('en-US', { month: 'short' })
    } else {
      key = date.toISOString().split('T')[0]
    }

    const profit = Number(item.admin_profit || 0)
    if (!groups[key]) {
      groups[key] = { key, profit: 0, count: 0 }
    }
    groups[key].profit += profit
    groups[key].count++
  })

  return Object.values(groups)
})

// Calculate total revenue and admin profit for the pie chart
const totalRevenue = computed(() => {
  if (!hasData.value) return 0
  return props.adminProfitData.reduce((sum, item) => sum + Number(item.total_revenue || item.total || 0), 0)
})

const totalAdminProfit = computed(() => {
  if (!hasData.value) return 0
  return props.adminProfitData.reduce((sum, item) => sum + Number(item.admin_profit || item.total_revenue * 0.03 || 0), 0)
})

const totalRevenueDisplay = computed(() => {
  return totalRevenue.value.toFixed(0)
})

// Pie slices: Total Revenue split into Gross Provider Revenue (97%) and Admin Fee (3%)
const pieSlices = computed(() => {
  const gross = totalRevenue.value - totalAdminProfit.value
  const admin = totalAdminProfit.value
  const total = totalRevenue.value || 1

  const grossPct = ((gross / total) * 100).toFixed(1)
  const adminPct = ((admin / total) * 100).toFixed(1)

  const circumference = 2 * Math.PI * 95 // 2 * pi * r

  const grossLength = (gross / total) * circumference
  const adminLength = (admin / total) * circumference

  return [
    {
      label: 'Provider Revenue (97%)',
      value: gross.toFixed(2),
      percent: grossPct,
      color: '#1e5e3a',
      dashArray: `${grossLength} ${circumference - grossLength}`,
      dashOffset: 0,
    },
    {
      label: 'Admin Fee (3%)',
      value: admin.toFixed(2),
      percent: adminPct,
      color: '#74c69d',
      dashArray: `${adminLength} ${circumference - adminLength}`,
      dashOffset: -grossLength,
    },
  ]
})

// Daily comparison data
const dailyData = computed(() => {
  const data = aggregatedData.value.slice(0, 10)
  if (data.length === 0) return []
  const max = Math.max(...data.map(d => d.profit), 1)

  return data.map((item, i) => ({
    label: item.key,
    value: item.profit.toFixed(2),
    height: Math.max((item.profit / max) * 100, 5),
    color: DAILY_COLORS[i % DAILY_COLORS.length],
  }))
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.chart-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
  font-size: 14px;
}

/* Two-column layout */
.chart-layout {
  display: flex;
  gap: 30px;
  align-items: stretch;
  flex-wrap: wrap;
}

.pie-section {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pie-container {
  width: 220px;
  height: 220px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-segment {
  transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease;
  cursor: pointer;
}
.pie-segment:hover {
  filter: brightness(1.1);
}

.pie-total-label {
  font-size: 22px;
  font-weight: 800;
  fill: #1e5e3a;
  font-family: 'Inter', system-ui, sans-serif;
}

.pie-total-sub {
  font-size: 11px;
  fill: #6b7280;
  font-family: 'Inter', system-ui, sans-serif;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 320px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f9fafb;
  transition: background 0.2s;
}
.legend-item:hover {
  background: #f0fdf4;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.legend-value {
  font-weight: 700;
  color: #111827;
}

.legend-pct {
  font-size: 11px;
  color: #6b7280;
  min-width: 36px;
  text-align: right;
}

/* Daily comparison section */
.daily-section {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
}

.daily-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.daily-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex: 1;
  gap: 8px;
  min-height: 180px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8ede9;
  position: relative;
}

.daily-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 50px;
  gap: 4px;
}

.daily-bar-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-height: 100px;
}

.daily-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
  cursor: pointer;
}
.daily-bar:hover {
  opacity: 0.8;
  transform: scaleX(1.05);
}

.daily-label {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.daily-value {
  font-size: 9px;
  font-weight: 700;
  color: #1e5e3a;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-layout {
    flex-direction: column;
  }
  .daily-chart {
    min-height: 140px;
  }
}
</style>