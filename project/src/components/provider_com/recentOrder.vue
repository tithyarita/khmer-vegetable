<template>
  <div class="recent-order-wrapper card border-0 shadow-sm">
    <div class="card-header bg-white border-bottom py-3 px-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">Recent Order</h5>
        <button class="btn btn-link btn-sm">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
    </div>
    <div class="card-body p-0">
      <div v-if="error" class="px-4 py-3 text-warning small">
        {{ error }}
      </div>

      <div v-if="loading" class="px-4 py-3 text-muted small">
        Loading recent orders...
      </div>

      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr class="table-light">
              <th class="order-id-header px-4 py-3">ORDER ID</th>
              <th class="product-header px-4 py-3">PRODUCT</th>
              <th class="quantity-header px-4 py-3">QUANTITY (KG)</th>
              <th class="date-header px-4 py-3">DATE</th>
              <th class="status-header px-4 py-3">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="recent-order-row">
              <td class="order-id-col px-4 py-3">
                <span class="fw-bold text-primary">{{ order.id }}</span>
              </td>
              <td class="product-col px-4 py-3">{{ order.product }}</td>
              <td class="quantity-col px-4 py-3">{{ order.quantity }}</td>
              <td class="date-col px-4 py-3">{{ order.date }}</td>
              <td class="status-col px-4 py-3">
                <span class="badge" :class="`bg-${order.statusColor}`">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = 'http://localhost:3000'
const userStore = useUserStore()

const orders = ref([])
const loading = ref(false)
const error = ref('')

const getProviderId = () => {
  const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

const formatDate = (value) => {
  if (!value) return 'Unknown'
  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusColor = (status) => {
  if (status === 'delivering') return 'primary'
  if (status === 'pending') return 'warning'
  return 'success'
}

const loadRecentOrders = async () => {
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
    const recentOrders = Array.isArray(response.data?.recentOrders) ? response.data.recentOrders : []

    orders.value = recentOrders.map((order) => ({
      id: order.id,
      product: order.product,
      quantity: order.quantity,
      date: formatDate(order.date),
      status: order.status,
      statusColor: getStatusColor(order.status),
    }))
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load recent orders.'
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecentOrders()
})
</script>

<style scoped>
.recent-order-wrapper {
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.table {
  font-size: 13px;
}

.table thead th {
  background-color: #f9faf9;
  font-weight: 700;
  color: #9ca3af;
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border: none;
}

.recent-order-row {
  border-bottom: 1px solid #e8e8e8;
  transition: all 0.2s;
}

.recent-order-row:hover {
  background-color: #fafbfa;
}

.recent-order-row td {
  border: none;
  vertical-align: middle;
  color: #6b7280;
}

.order-id-header {
  width: 15%;
}

.product-header {
  width: 25%;
}

.quantity-header {
  width: 20%;
}

.date-header {
  width: 25%;
}

.status-header {
  width: 15%;
}

.order-id-col {
  font-weight: 600;
  width: 15%;
}

.product-col {
  width: 25%;
}

.quantity-col {
  width: 20%;
}

.date-col {
  font-size: 12px;
  color: #9ca3af;
  width: 25%;
}

.status-col {
  width: 15%;
}

.badge {
  font-size: 10px;
  padding: 4px 8px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .table {
    font-size: 0.8rem;
  }

  .table thead th {
    padding: 0.5rem 0.25rem !important;
  }

  .recent-order-row td {
    padding: 0.5rem 0.25rem !important;
  }

  .order-id-header,
  .product-header,
  .quantity-header,
  .date-header,
  .status-header {
    width: auto;
  }

  .order-id-col,
  .product-col,
  .quantity-col,
  .date-col,
  .status-col {
    width: auto;
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .table {
    font-size: 0.75rem;
  }

  .table thead th {
    padding: 0.4rem 0.15rem !important;
    font-size: 0.7rem;
  }

  .recent-order-row td {
    padding: 0.4rem 0.15rem !important;
  }
}
</style>
