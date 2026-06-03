<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Revenue Trends</h3>
        <p class="chart-sub">Admin profit growth analysis.</p>
      </div>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot legend-dot--current"></span> Admin Profit
        </span>
      </div>
    </div>

    <div v-if="!adminProfitData || adminProfitData.length === 0" class="no-data">
      <p>No data available for the selected date range</p>
    </div>

    <svg v-else viewBox="0 0 440 160" class="chart-svg" preserveAspectRatio="none">
      <!-- Grid lines -->
      <line v-for="y in gridLines" :key="y" x1="0" :y1="y" x2="440" :y2="y"
        stroke="#f0f0f0" stroke-width="1" />

      <!-- Filled area under profit line -->
      <path :d="areaPath" fill="url(#greenGrad)" opacity=".18" />

      <!-- Profit line -->
      <polyline :points="profitPoints" fill="none"
        stroke="#2d6a4f" stroke-width="2.5"
        stroke-linejoin="round" stroke-linecap="round" />

      <!-- Dots -->
      <circle v-for="(pt, i) in profitCoords" :key="i"
        :cx="pt.x" :cy="pt.y" r="3.5"
        fill="#2d6a4f" stroke="#fff" stroke-width="2" />

      <!-- X-axis provider labels -->
      <text v-for="(item, i) in displayLabels" :key="item"
        :x="20 + i * labelSpacing" y="156" text-anchor="middle"
        font-size="8" fill="#9ca3af">{{ item }}</text>

      <!-- Gradient def -->
      <defs>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#2d6a4f" stop-opacity="1" />
          <stop offset="100%" stop-color="#2d6a4f" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  adminProfitData: {
    type: Array,
    default: () => [],
  },
  dateRange: {
    type: Object,
    default: () => ({ start: '', end: '' }),
  },
})

const gridLines = [30, 65, 100, 135]

// Calculate profit coordinates from data
const profitCoords = computed(() => {
  if (!props.adminProfitData || props.adminProfitData.length === 0) {
    return []
  }

  const data = props.adminProfitData.slice(0, 15) // Limit to 15 items for readability
  const maxProfit = Math.max(...data.map(d => Number(d.admin_profit || 0)), 1)

  return data.map((item, i) => {
    const profit = Number(item.admin_profit || 0)
    const y = 130 - (profit / maxProfit) * 85 // Scale to SVG height
    return { x: 16 + i * 27, y: Math.max(y, 20) }
  })
})

const profitPoints = computed(() =>
  profitCoords.value.map(p => `${p.x},${p.y}`).join(' ')
)

const areaPath = computed(() => {
  const pts = profitCoords.value
  if (pts.length === 0) return ''

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L${last.x},148 L${first.x},148 Z`
})

const displayLabels = computed(() =>
  props.adminProfitData
    .slice(0, 15)
    .map(d => d.provider_name?.substring(0, 8) || 'N/A')
)

const labelSpacing = computed(() =>
  Math.max(30, 440 / Math.max(displayLabels.value.length, 1))
)
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 18px 20px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  display: flex; flex-direction: column;
}

.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 14px;
}
.chart-title { font-size: 14px; font-weight: 700; color: #111827; }
.chart-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.legend { display: flex; gap: 12px; align-items: center; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b7280; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot--current { background: #2d6a4f; }

.chart-svg { width: 100%; height: 160px; }

.no-data {
  display: flex; align-items: center; justify-content: center;
  height: 160px; color: #9ca3af; font-size: 12px;
}
</style>