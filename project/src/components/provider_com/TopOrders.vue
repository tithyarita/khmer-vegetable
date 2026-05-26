<template>
  <div class="top-orders-section">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0 fw-bold">Top Orders</h5>
      <button v-if="!loaded" @click="refresh" class="btn btn-sm btn-outline-secondary">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-if="!loading && topOrders.length === 0" class="alert alert-info">No orders found.</div>

    <div v-if="!loading && topOrders.length > 0" class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th class="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in topOrders" :key="order.orderId">
            <td>{{ order.id }}</td>
            <td>{{ order.customerName }}</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td><span class="badge bg-secondary">{{ order.status }}</span></td>
            <td class="text-end fw-bold text-success">${{ order.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useProviderOrderStore } from '@/stores/providerOrderStore'

const props = defineProps({
  limit: { type: Number, default: 5 }
})

const loading = ref(false)
const loaded = ref(false)
const topOrders = ref([])

const refresh = async () => {
  loading.value = true
  try {
    const userStore = useUserStore()
    const providerOrderStore = useProviderOrderStore()
    const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')
    if (!user?.id) throw new Error('Provider not found')

    const orders = await providerOrderStore.fetchProviderOrders(user.id)
    const sorted = [...orders].sort((a, b) => b.total - a.total)
    topOrders.value = sorted.slice(0, props.limit)
    loaded.value = true
  } catch (err) {
    console.error('Failed to load top orders', err)
    topOrders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => refresh())

const formatDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  return dt.toLocaleString()
}
</script>

<style scoped>
.top-orders-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.table thead th { font-size: 12px; color: #6b7280; }
</style>
