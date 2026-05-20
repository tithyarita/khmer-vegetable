import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = 'http://localhost:3000'

export const useCustomerOrderStore = defineStore('customerOrders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref('')

  const getInitial = (name) => {
    return (name || '?').trim().charAt(0).toUpperCase()
  }

  const formatStatus = (status) => {
    if (status === 'completed') return 'DELIVERED'
    if (status === 'delivering') return 'IN PROGRESS'
    return 'PENDING'
  }

  const formatDate = (value) => {
    if (!value) return 'Unknown date'
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const mapOrder = (order) => {
    const items = Array.isArray(order.order_items) ? order.order_items : []
    const previewItems = items
      .slice(0, 2)
      .map((item) => getInitial(item.product?.name || 'Item'))

    return {
      id: order.id,
      orderCode: order.order_code || `ORD-${order.id}`,
      status: order.status || 'pending',
      statusLabel: formatStatus(order.status),
      statusClass: order.status === 'completed' ? 'badge-delivered' : 'badge-progress',
      meta: `Placed on ${formatDate(order.created_at)}`,
      price: Number(order.total || 0).toFixed(2),
      previewItems: previewItems.length ? previewItems : ['O', 'R'],
      extraCount: Math.max(items.length - previewItems.length, 0),
      itemsLabel: items.length
        ? items.map((item) => item.product?.name || 'Product').join(', ')
        : 'No items available',
      providerName: order.provider?.provider_name || 'Unknown',
      raw: order,
    }
  }

  const mergeOrdersByIdentity = (primaryOrders, secondaryOrders) => {
    const merged = [...primaryOrders]
    const hasOrder = (candidate) => {
      return merged.some((existing) => {
        const sameId = Number(existing?.id ?? 0) > 0 && Number(existing?.id ?? 0) === Number(candidate?.id ?? 0)
        const sameCode = Boolean(existing?.order_code) && existing?.order_code === candidate?.order_code
        return sameId || sameCode
      })
    }

    secondaryOrders.forEach((order) => {
      if (!hasOrder(order)) {
        merged.push(order)
      }
    })

    return merged.sort((a, b) => {
      const aTime = new Date(a?.created_at || 0).getTime()
      const bTime = new Date(b?.created_at || 0).getTime()
      return bTime - aTime
    })
  }

  const fetchCustomerOrders = async () => {
    loading.value = true
    error.value = ''

    try {
      const userStore = useUserStore()
      const user = userStore.user || JSON.parse(localStorage.getItem('user') || 'null')

      if (!user?.id) {
        error.value = 'Please log in to view your orders.'
        orders.value = []
        return []
      }

      const customerId = Number(user.id)
      const primaryResponse = await axios.get(`${API_BASE_URL}/orders/customer/${customerId}`)

      let backendOrders = Array.isArray(primaryResponse.data) ? primaryResponse.data : []

      if (!backendOrders.length) {
        const allOrdersResponse = await axios.get(`${API_BASE_URL}/orders`)
        const allOrders = Array.isArray(allOrdersResponse.data) ? allOrdersResponse.data : []

        backendOrders = allOrders.filter((order) => {
          const relationCustomerId = Number(order?.customer?.user_id ?? order?.customer?.id ?? 0)
          const rowCustomerId = Number(order?.customer_id ?? 0)
          return relationCustomerId === customerId || rowCustomerId === customerId
        })
      }

      const localOrderData = JSON.parse(localStorage.getItem('lastOrder') || 'null')
      const cachedOrders = Array.isArray(localOrderData?.backendOrders)
        ? localOrderData.backendOrders
            .map((entry) => entry?.data || entry)
            .filter(Boolean)
        : []

      const mergedOrders = mergeOrdersByIdentity(backendOrders, cachedOrders)
      orders.value = mergedOrders.map((order) => mapOrder(order))

      return orders.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load orders.'
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
    fetchCustomerOrders,
  }
})
