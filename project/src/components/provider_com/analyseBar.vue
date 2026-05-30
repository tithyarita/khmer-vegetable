<template>
  <div class="analyse-bar">
    <div v-if="error" class="alert alert-warning mb-3">
      {{ error }}
    </div>

    <div v-if="loading" class="text-muted small mb-3">
      Loading dashboard metrics...
    </div>

    <div class="row g-3">
      <div v-for="card in cards" :key="card.id" class="col-12 col-sm-6 col-lg-3">
        <div class="card-item card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="card-icon rounded" :style="{ backgroundColor: card.color }">
              <i :class="card.icon"></i>
            </div>
            <div>
              <h6 class="card-value mb-1">{{ formatNumber(card.value) }}</h6>
              <p class="card-label mb-0 small text-muted">{{ card.label }}</p>
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
  customers: 0,
  ordersReceived: 0,
  pendingOrders: 0,
  completedOrders: 0,
})

const getProviderId = () => {
  const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString()
}

const cards = computed(() => [
  {
    id: 1,
    icon: 'bi bi-person-circle',
    label: 'Customers',
    value: summary.value.customers,
    color: '#1a3d2a'
  },
  {
    id: 2,
    icon: 'bi bi-briefcase',
    label: 'Orders Received',
    value: summary.value.ordersReceived,
    color: '#2d7a3a'
  },
  {
    id: 3,
    icon: 'bi bi-hourglass-split',
    label: 'Pending Orders',
    value: summary.value.pendingOrders,
    color: '#0f766e'
  },
  {
    id: 4,
    icon: 'bi bi-check2-circle',
    label: 'Completed Orders',
    value: summary.value.completedOrders,
    color: '#c97b63'
  }
])

const loadSummary = async () => {
  loading.value = true
  error.value = ''

  const providerId = getProviderId()
  if (!providerId) {
    error.value = 'Provider account not found. Please log in again.'
    loading.value = false
    return
  }

  try {
    const [ordersResponse, revenueResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/orders/provider/${providerId}`),
      axios.get(`${API_BASE_URL}/orders/provider/${providerId}/revenue`),
    ])

    const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
    const uniqueCustomers = new Set(
      orders.map((order) => order?.customer?.id ?? order?.customer_id).filter(Boolean),
    )

    summary.value = {
      customers: uniqueCustomers.size,
      ordersReceived: Number(revenueResponse.data?.totalOrders ?? orders.length ?? 0),
      pendingOrders: Number(revenueResponse.data?.pendingOrders ?? 0),
      completedOrders: orders.filter((order) => order?.status === 'completed').length,
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load dashboard metrics.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSummary()
})
</script>

<style scoped>
.analyse-bar {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.card-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 16px 18px 14px;
}

.card-icon {
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

.card-value {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -1px;
}

.card-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

@media (max-width: 1199px) {
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .card-label {
    font-size: 0.85rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .card-icon {
    width: 45px;
    height: 45px;
    font-size: 1.25rem;
  }

  .card-value {
    font-size: 1rem;
  }

  .card-label {
    font-size: 0.8rem;
  }

  .card-body {
    padding: 0.875rem;
  }
}

@media (max-width: 576px) {
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .card-value {
    font-size: 0.9rem;
  }

  .card-label {
    font-size: 0.75rem;
  }

  .card-body {
    padding: 0.75rem;
    gap: 0.75rem !important;
  }
}
</style>
