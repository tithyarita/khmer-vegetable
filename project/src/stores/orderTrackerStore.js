import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function productImage(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${API_BASE_URL}${url}`
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildSteps(status, createdAt, completedAt) {
  const normalized = String(status || 'pending').toLowerCase()

  const placedState = 'done'
  const deliveryState =
    normalized === 'pending' ? 'pending' : normalized === 'delivering' ? 'active' : 'done'
  const completedState = normalized === 'completed' ? 'done' : 'pending'

  return [
    {
      label: 'Order Placed',
      time: formatTime(createdAt),
      state: placedState,
      icon: 'check',
    },
    {
      label: 'Out for Delivery',
      time: normalized === 'delivering' ? 'In transit' : normalized === 'completed' ? 'Delivered en route' : 'Waiting',
      state: deliveryState,
      icon: 'truck',
    },
    {
      label: 'Completed',
      time: normalized === 'completed' ? formatTime(completedAt) : 'Pending',
      state: completedState,
      icon: 'gift',
    },
  ]
}

function mapOrder(order) {
  if (!order) return null

  const items = Array.isArray(order.order_items) ? order.order_items : []
  const status = String(order.status || 'pending').toLowerCase()

  return {
    id: order.id,
    orderCode: order.order_code || `ORD-${order.id}`,
    status,
    statusLabel:
      status === 'completed' ? 'Completed' : status === 'delivering' ? 'Out for Delivery' : 'Pending',
    arrivalTime:
      status === 'completed'
        ? `Delivered ${formatTime(order.completed_at || order.created_at)}`
        : status === 'delivering'
          ? 'On the way to you'
          : 'Preparing your order',
    createdAt: order.created_at,
    completedAt: order.completed_at,
    total: Number(order.total || 0),
    paymentMethod: order.payment_method || '—',
    paymentStatus: order.payment_status || 'pending',
    providerName: order.provider?.provider_name || 'Provider',
    customerName: order.customer?.name || 'Customer',
    steps: buildSteps(status, order.created_at, order.completed_at),
    details: [
      {
        label: 'Provider',
        value: order.provider?.provider_name || '—',
        sub: order.provider?.farm_name || 'Fresh produce partner',
        icon: 'user',
      },
      {
        label: 'Payment',
        value: (order.payment_method || '—').toUpperCase(),
        sub: `Status: ${order.payment_status || 'pending'}`,
        icon: 'box',
      },
    ],
    items: items.map((entry) => ({
      id: entry.id,
      name: entry.product?.name || 'Product',
      quantity: Number(entry.quantity || 1),
      price: Number(entry.price || entry.product?.price || 0),
      image: productImage(entry.product?.imageUrl),
      category: entry.product?.category || '',
    })),
    deliveryFee: 0,
    raw: order,
  }
}

export const useOrderTrackerStore = defineStore('orderTracker', () => {
  const currentOrder = ref(null)
  const customerOrders = ref([])
  const loading = ref(false)
  const error = ref(null)

  const subtotal = computed(() => {
    if (!currentOrder.value) return 0
    return currentOrder.value.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
  })

  const total = computed(() => {
    if (!currentOrder.value) return 0
    return subtotal.value + (currentOrder.value.deliveryFee || 0)
  })

  const fetchOrder = async (orderId) => {
    loading.value = true
    error.value = null

    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
      currentOrder.value = mapOrder(res.data)
      if (!currentOrder.value) {
        error.value = 'Order not found'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Order not found'
      currentOrder.value = null
    } finally {
      loading.value = false
    }
  }

  const refreshOrder = async (orderId) => {
    if (!orderId) return
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`)
      currentOrder.value = mapOrder(res.data)
    } catch {
      // silent refresh failure
    }
  }

  const fetchCustomerOrders = async (customerId) => {
    loading.value = true
    error.value = null

    try {
      const res = await axios.get(`${API_BASE_URL}/orders/customer/${customerId}`)
      const list = Array.isArray(res.data) ? res.data : []
      customerOrders.value = list.map(mapOrder).filter(Boolean)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load orders'
      customerOrders.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    currentOrder,
    customerOrders,
    loading,
    error,
    subtotal,
    total,
    fetchOrder,
    refreshOrder,
    fetchCustomerOrders,
    mapOrder,
  }
})
