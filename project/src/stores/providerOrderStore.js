import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const useProviderOrderStore = defineStore('providerOrders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  const mapOrder = (order) => {
    const customerRawId = order.customer?.id ?? order.customer_id
    const rawItems = order.order_items ?? order.items ?? []
    return {
      orderId: order.id,
      id: order.order_code || `#O${order.id}`,
      orderCode: order.order_code || `#O${order.id}`,
      providerId: order.provider_id ?? order.provider?.id,
      providerName: order.provider?.provider_name || order.provider?.name || `Provider ${order.provider_id}`,
      customerIdRaw: customerRawId,
      customerId: `#C${customerRawId}`,
      customerName: order.customer?.name || `Customer ${order.customer_id}`,
      customerPhone: order.customer?.phone || order.customer_phone || '',
      status: order.status,
      paymentStatus: order.payment_status || order.paymentStatus || 'pending',
      total: parseFloat(order.total),
      createdAt: new Date(order.created_at),
      completedAt: order.completed_at ? new Date(order.completed_at) : null,
      items: rawItems.map(item => ({
        name: item.product?.name || item.name || `Item ${item.product_id ?? item.id ?? ''}`,
        qty: item.quantity ?? item.qty ?? 1,
        price: item.price != null ? `$${parseFloat(item.price).toFixed(2)}` : '$0.00',
        total: item.quantity != null && item.price != null ? `$${(parseFloat(item.price) * item.quantity).toFixed(2)}` : '$0.00'
      })),
      item: order.item ?? rawItems.length ?? 1,
      paymentMethod: order.payment_method || order.paymentMethod || 'bank',
      receiptUrl: order.payment_proof || order.payment_url || order.receipt_url || order.receipt || order.payment_receipt || null,
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
