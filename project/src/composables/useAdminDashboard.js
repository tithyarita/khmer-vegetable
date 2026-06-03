import { ref } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

export function useAdminDashboard() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  // =====================
  // STATE
  // =====================
  const summary = ref({
    totalRevenue: 0,
    adminProfit: 0,
    totalOrders: 0,
    totalProviders: 0
  })

  const providerReports = ref([])
  const recentOrders = ref([])

  const loading = ref(false)
  const error = ref(null)

  let socket = null

  // =====================
  // FETCH DASHBOARD DATA
  // =====================
  const fetchDashboard = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await axios.get(`${API}/reports/dashboard?period=month`)

      const data = res.data

      // CASE 1: backend returns structured dashboard
      if (data?.summary || data?.providerReports) {
        summary.value = {
          totalRevenue: data.summary?.totalRevenue ?? 0,
          adminProfit: data.summary?.adminProfit ?? 0,
          totalOrders: data.summary?.totalOrders ?? 0,
          totalProviders: data.summary?.totalProviders ?? 0
        }

        providerReports.value = data.providerReports || []
        recentOrders.value = data.recentOrders || []
        return
      }

      // CASE 2: backend returns raw reports array
      const reports = Array.isArray(data?.reports)
        ? data.reports
        : Array.isArray(data)
          ? data
          : []

      providerReports.value = reports

      // derive summary safely
      const totalRevenue = reports.reduce(
        (s, r) => s + (Number(r.total_revenue) || 0),
        0
      )

      const totalOrders = reports.reduce(
        (s, r) => s + (Number(r.total_orders) || 0),
        0
      )

      const adminProfit = reports.reduce(
        (s, r) => s + (Number(r.admin_profit) || 0),
        0
      )

      summary.value = {
        totalRevenue,
        totalOrders,
        adminProfit,
        totalProviders: reports.length
      }

      recentOrders.value = []

    } catch (err) {
      console.error(err)
      error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  // =====================
  // SOCKET CONNECTION
  // =====================
  const connectSocket = () => {
    if (socket) return

    socket = io(API, {
      transports: ['websocket']
    })

    socket.on('dashboard:update', (data) => {
      if (!data) return

      if (data.summary) {
        summary.value = data.summary
      }

      if (data.providerReports) {
        providerReports.value = data.providerReports
      }

      if (data.recentOrders) {
        recentOrders.value = data.recentOrders
      }
    })

    socket.on('order:new', (order) => {
      if (order) {
        recentOrders.value.unshift(order)
      }
    })
  }

  // =====================
  // CLEANUP
  // =====================
  const destroy = () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  // =====================
  // INIT
  // =====================
  const initDashboard = async () => {
    await fetchDashboard()
    connectSocket()
  }

  return {
    summary,
    providerReports,
    recentOrders,
    loading,
    error,
    initDashboard,
    fetchDashboard,
    destroy
  }
}