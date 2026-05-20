import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

export const useAdminOrderStore = defineStore('adminOrders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  const mapOrder = (order) => {
    const customerRawId = order.customer?.id ?? order.customer_id
    const customerName = order.customer?.name || `Customer ${order.customer_id}`
    const initials = (customerName || '')
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || `C${customerRawId}`

    return {
      id: order.id,
      customerRawId,
      customer: customerName,
      customerInitials: initials,
      customerColor: '#e0e7ff',
      provider: order.provider?.provider_name || 'Unknown',
      price: `$${parseFloat(order.total).toFixed(2)}`,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      statusClass: order.status.toLowerCase(),
      items: [],
      item: order.item || 1,
      orderCode: order.order_code,
      createdAt: new Date(order.created_at),
      completedAt: order.completed_at ? new Date(order.completed_at) : null,
    }
  }

  const fetchAllOrders = async () => {
    loading.value = true
    error.value = ''

    try {
      const response = await axios.get(`${API_BASE_URL}/orders`)
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
    fetchAllOrders,
  }
})
