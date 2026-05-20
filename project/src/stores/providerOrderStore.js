import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useProviderOrderStore = defineStore('providerOrders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  const mapOrder = (order) => {
    const customerRawId = order.customer?.id ?? order.customer_id
    return {
      id: order.order_code || `#O${order.id}`,
      customerIdRaw: customerRawId,
      customerId: `#C${customerRawId}`,
      customerName: order.customer?.name || `Customer ${order.customer_id}`,
      status: order.status,
      total: parseFloat(order.total),
      createdAt: new Date(order.created_at),
      completedAt: order.completed_at ? new Date(order.completed_at) : null,
      items: order.order_items || [],
      item: order.item ?? 1,
      orderId: order.id,
      raw: order,
    }
  }

  const fetchProviderOrders = async (providerId) => {
    loading.value = true
    error.value = ''

    try {
      if (!providerId) {
        throw new Error('Provider account not found. Please log in again.')
      }

      const response = await axios.get(`${API_BASE_URL}/orders/provider/${providerId}`)
      const backendOrders = Array.isArray(response.data) ? response.data : []
      orders.value = backendOrders.map(mapOrder)
      return orders.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load orders'
      orders.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    error,
    fetchProviderOrders,
  }
})
