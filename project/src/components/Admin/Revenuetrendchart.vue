<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Revenue Distribution Streams</h3>
        <p class="chart-sub">Admin profit comparison by {{ periodLabel }}</p>
      </div>
    </div>

    <div v-if="!adminProfitData || adminProfitData.length === 0" class="no-data">
      <p>No data available for the selected date range</p>
    </div>

    <div v-else class="chart-container">
      <div class="y-axis">
        <div class="y-axis-label">{{ maxValue }}</div>
        <div class="y-axis-label">{{ (maxValue * 0.75).toFixed(0) }}</div>
        <div class="y-axis-label">{{ (maxValue * 0.5).toFixed(0) }}</div>
        <div class="y-axis-label">{{ (maxValue * 0.25).toFixed(0) }}</div>
        <div class="y-axis-label">0</div>
      </div>
      <div class="chart-bars">
        <div v-for="(bar, i) in barData" :key="i" class="bar-wrapper">
          <div class="bar-value">${{ bar.value }}</div>
          <div class="bar" :style="{ height: bar.heightPercent + '%' }"></div>
          <div class="bar-label">{{ displayLabels[i] }}</div>
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

const gridLines = [30, 65, 100, 135]

const periodLabel = computed(() => {
  if (props.useCustomRange) return 'custom range'
  const period = props.activePeriod.toLowerCase()
  if (period === 'today') return 'hour'
  if (period === 'weekly') return 'day'
  if (period === 'monthly') return 'day'
  if (period === 'yearly') return 'month'
  return 'period'
})

// Aggregate data by time period
const aggregatedData = computed(() => {
  if (!props.adminProfitData || props.adminProfitData.length === 0) {
    return []
  }

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
      groups[key] = { key, profit: 0 }
    }
    groups[key].profit += profit
  })
  
  return Object.values(groups)
})

// Calculate max value for Y-axis
const maxValue = computed(() => {
  const data = aggregatedData.value
  if (data.length === 0) return 100
  const max = Math.max(...data.map(d => d.profit), 1)
  return Math.ceil(max / 10) * 10 // Round up to nearest 10
})

// Calculate bar chart data
const barData = computed(() => {
  const data = aggregatedData.value.slice(0, 12)
  if (data.length === 0) return []
  
  const max = Math.max(...data.map(d => d.profit), 1)
  
  return data.map((item) => {
    const heightPercent = (item.profit / max) * 100
    return {
      heightPercent: Math.max(heightPercent, 5), // Minimum 5% height
      value: item.profit.toFixed(2)
    }
  })
})

const displayLabels = computed(() => {
  return aggregatedData.value.slice(0, 12).map(d => d.key)
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

.chart-container {
  width: 100%;
  height: 200px;
  display: flex;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 10px 40px 0;
  width: 50px;
  border-right: 1px solid #e8e8e8;
}

.y-axis-label {
  font-size: 10px;
  color: #9ca3af;
  text-align: right;
  padding-right: 8px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  flex: 1;
  height: 100%;
  padding: 20px 10px 40px 15px;
  gap: 15px;
  position: relative;
}

.chart-bars::after {
  content: '';
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e8e8e8;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
}

.bar-value {
  font-size: 11px;
  font-weight: 700;
  color: #1e5e3a;
  margin-bottom: 8px;
}

.bar {
  width: 100%;
  min-height: 8px;
  background: linear-gradient(180deg, #1e5e3a 0%, #40916c 100%);
  border-radius: 6px 6px 0 0;
  transition: height 0.3s ease;
}

.bar:hover {
  background: linear-gradient(180deg, #154429 0%, #2d6a4f 100%);
}

.bar-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 10px;
  text-align: center;
  word-break: break-word;
}
</style>