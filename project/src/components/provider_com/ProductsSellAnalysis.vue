<template>
  <div class="products-sell-analysis">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Products Sell Analysis</h5>
      <div class="period-switch" role="tablist" aria-label="Sales analysis period">
        <button
          type="button"
          :class="['period-btn', { active: period === 'year' }]"
          @click="period = 'year'"
        >
          Year
        </button>
        <button
          type="button"
          :class="['period-btn', { active: period === 'day' }]"
          @click="period = 'day'"
        >
          Day
        </button>
        <button
          type="button"
          :class="['period-btn', { active: period === 'week' }]"
          @click="period = 'week'"
        >
          Week
        </button>
        <button
          type="button"
          :class="['period-btn', { active: period === 'month' }]"
          @click="period = 'month'"
        >
          Month
        </button>
      </div>
    </div>
    <div v-if="error" class="alert alert-warning mb-3">
      {{ error }}
    </div>
    <div v-if="loading" class="text-muted small mb-2">
      Loading analysis...
    </div>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const userStore = useUserStore()
const chartRef = ref(null)
const period = ref('month')
const loading = ref(false)
const error = ref('')
const chartData = ref([])
let chartInstance = null

const getProviderId = () => {
  const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const getPeriodLabels = (selectedPeriod) => {
  if (selectedPeriod === 'year') {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  if (selectedPeriod === 'day') {
    return Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)
  }

  if (selectedPeriod === 'week') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, index) => `${index + 1}`)
}

const buildPeriodBuckets = (orders, selectedPeriod) => {
  const labels = getPeriodLabels(selectedPeriod)
  const buckets = labels.map((label) => ({ label, value: 0 }))

  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(now.getDate() - day)
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  orders.forEach((order) => {
    const date = new Date(order.created_at || order.createdAt || order.date)
    if (Number.isNaN(date.getTime())) return

    const revenue = Number(order.total || 0)

    if (selectedPeriod === 'day') {
      if (date >= startOfToday) {
        buckets[date.getHours()].value += revenue
      }
      return
    }

    if (selectedPeriod === 'week') {
      if (date >= startOfWeek) {
        buckets[date.getDay()].value += revenue
      }
      return
    }

    if (selectedPeriod === 'year') {
      if (date >= startOfYear && date.getFullYear() === now.getFullYear()) {
        buckets[date.getMonth()].value += revenue
      }
      return
    }

    if (date >= startOfMonth && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      buckets[date.getDate() - 1].value += revenue
    }
  })

  return buckets
}

const buildChart = async () => {
  await nextTick()

  if (!chartRef.value) return

  destroyChart()

  const labels = chartData.value.map((entry) => entry.label)
  const data = chartData.value.map((entry) => Number(entry.value || 0))
  const maxValue = Math.max(...data, 0)

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: data.map((value, index) => (index % 2 === 0 ? '#1f4ed8' : '#22c55e')),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.72,
          categoryPercentage: 0.82,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(100, Math.ceil(maxValue * 1.2)),
          ticks: {
            callback: (value) => `$${value}`,
          },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

const loadAnalysis = async () => {
  loading.value = true
  error.value = ''

  const providerId = getProviderId()
  if (!providerId) {
    error.value = 'Provider account not found. Please log in again.'
    loading.value = false
    return
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/orders/provider/${providerId}`)
    const orders = Array.isArray(response.data) ? response.data : []
    chartData.value = buildPeriodBuckets(orders, period.value)
    await buildChart()
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load analysis.'
    chartData.value = buildPeriodBuckets([], period.value)
    await buildChart()
  } finally {
    loading.value = false
  }
}

watch(period, async () => {
  await loadAnalysis()
})

onMounted(() => {
  loadAnalysis()
})

onBeforeUnmount(() => {
  destroyChart()
})

</script>

<style scoped>
.products-sell-analysis {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.chart-container {
  position: relative;
  height: 300px;
  margin-top: 1rem;
}

h5 {
  font-weight: 600;
  color: #212529;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
}

.period-switch {
  display: inline-flex;
  gap: 4px;
  background: #eef4ef;
  border-radius: 999px;
  padding: 4px;
  flex-wrap: wrap;
}

.period-btn {
  border: none;
  background: transparent;
  color: #355341;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.period-btn.active {
  background: #1f5c34;
  color: #fff;
}

@media (max-width: 1024px) {
  .products-sell-analysis {
    padding: 1.25rem;
  }

  .chart-container {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .products-sell-analysis {
    padding: 1rem;
  }

  .chart-container {
    height: 200px;
  }

  h5 {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .products-sell-analysis {
    padding: 0.75rem;
  }

  .chart-container {
    height: 180px;
  }

  h5 {
    font-size: 0.95rem;
  }

  .badge {
    font-size: 0.65rem;
  }
}
</style>
