<template>
  <div class="products-sell-analysis">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Products Sell Analysis</h5>
      <span class="badge bg-secondary">This Year</span>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const userStore = useUserStore()
const chartRef = ref(null)
const loading = ref(false)
const error = ref('')
const monthlyRevenue = ref([
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
  { month: 'Jul', value: 0 },
  { month: 'Aug', value: 0 },
  { month: 'Sep', value: 0 },
  { month: 'Oct', value: 0 },
  { month: 'Nov', value: 0 },
  { month: 'Dec', value: 0 },
])
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

const buildChart = async () => {
  await nextTick()

  if (!chartRef.value) return

  destroyChart()

  const labels = monthlyRevenue.value.map((entry) => entry.month.toUpperCase())
  const data = monthlyRevenue.value.map((entry) => Number(entry.value || 0))
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
    const response = await axios.get(`${API_BASE_URL}/orders/provider/${providerId}/revenue`)
    monthlyRevenue.value = Array.isArray(response.data?.monthlyRevenue)
      ? response.data.monthlyRevenue
      : monthlyRevenue.value
    await buildChart()
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load analysis.'
    await buildChart()
  } finally {
    loading.value = false
  }
}

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
