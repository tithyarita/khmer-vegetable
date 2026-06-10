<template>
  <div class="revenue-stats">
    <div v-if="error" class="alert alert-warning mb-3">
      {{ error }}
    </div>

    <div v-if="loading" class="mb-3 text-muted small">
      Loading revenue summary...
    </div>

    <div class="row g-3">
      <div v-for="stat in stats" :key="stat.id" class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card card h-100 border-0 shadow-sm rounded-3">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon rounded-3" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div>
              <p class="stat-label small text-muted mb-1">{{ stat.label }}</p>
              <h6 class="stat-value mb-0">{{ stat.value }}</h6>
              <small class="stat-sublabel text-muted">{{ stat.sublabel }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const userStore = useUserStore()

const loading = ref(false)
const error = ref('')
const summary = ref({
  totalRevenue: 0,
  totalAdminFee: 0,
  totalProviderNet: 0,
  monthRevenue: 0,
  monthAdminFee: 0,
  monthProviderNet: 0,
  totalOrders: 0,
  monthOrders: 0,
  revenueOrders: 0,
})

const getProviderId = () => {
  const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const stats = computed(() => [
  {
    id: 1,
    icon: 'bi bi-wallet2',
    label: 'Total Revenue (Gross)',
    value: formatCurrency(summary.value.totalRevenue),
    sublabel: 'Before 3% admin fee',
    color: '#1a3d2a',
  },
  {
    id: 2,
    icon: 'bi bi-cash-coin',
    label: 'Admin Fee (3%)',
    value: formatCurrency(summary.value.totalAdminFee),
    sublabel: `$${Number(summary.value.totalRevenue).toFixed(2)} × 3%`,
    color: '#dc2626',
  },
  {
    id: 3,
    icon: 'bi bi-check-circle',
    label: 'Your Net (97%)',
    value: formatCurrency(summary.value.totalProviderNet),
    sublabel: 'Revenue after admin fee',
    color: '#16a34a',
  },
  {
    id: 4,
    icon: 'bi bi-calendar3',
    label: 'Month Revenue (Gross)',
    value: formatCurrency(summary.value.monthRevenue),
    sublabel: 'This month before 3%',
    color: '#2d7a3a',
  },
  {
    id: 5,
    icon: 'bi bi-currency-dollar',
    label: 'Month Admin Fee (3%)',
    value: formatCurrency(summary.value.monthAdminFee),
    sublabel: `$${Number(summary.value.monthRevenue).toFixed(2)} × 3%`,
    color: '#dc2626',
  },
  {
    id: 6,
    icon: 'bi bi-piggy-bank',
    label: 'Month Your Net (97%)',
    value: formatCurrency(summary.value.monthProviderNet),
    sublabel: 'This month after admin fee',
    color: '#16a34a',
  },
  {
    id: 7,
    icon: 'bi bi-bag-check',
    label: 'Total Orders',
    value: String(summary.value.totalOrders),
    sublabel: 'All provider orders',
    color: '#0f766e',
  },
  {
    id: 8,
    icon: 'bi bi-calendar-check',
    label: 'Orders This Month',
    value: String(summary.value.monthOrders),
    sublabel: 'Orders placed this month',
    color: '#c97b63',
  },
])

const fetchRevenueSummary = async () => {
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
    const data = response.data || {}
    summary.value = {
      totalRevenue: Number(data.totalRevenue ?? 0),
      totalAdminFee: Number(data.totalAdminFee ?? 0),
      totalProviderNet: Number(data.totalProviderNet ?? 0),
      monthRevenue: Number(data.monthRevenue ?? 0),
      monthAdminFee: Number(data.monthAdminFee ?? 0),
      monthProviderNet: Number(data.monthProviderNet ?? 0),
      totalOrders: Number(data.totalOrders ?? 0),
      monthOrders: Number(data.monthOrders ?? 0),
      revenueOrders: Number(data.revenueOrders ?? 0),
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load revenue summary.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRevenueSummary()
})
</script>

<style scoped>
.revenue-stats {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.stat-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 16px 18px 14px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
  background: #1a3d2a !important;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.stat-sublabel {
  font-size: 11px;
  font-weight: 400;
  color: #9ca3af;
  margin-top: 2px;
}

@media (max-width: 1199px) {
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 8.5px;
  }

  .card-body {
    padding: 14px 16px 12px;
  }
}

@media (max-width: 768px) {
  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 8px;
  }

  .card-body {
    padding: 12px 14px 10px;
  }
}

@media (max-width: 576px) {
  .stat-icon {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 7.5px;
  }

  .card-body {
    padding: 10px 12px 8px;
    gap: 0.75rem !important;
  }
}
</style>
