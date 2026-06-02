import { ref } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'http://localhost:3000'

// simple cache (fast load)
let cache = {
  summary: null,
  providerReports: [],
  recentOrders: [],
  timestamp: 0,
}

export function useAdminDashboard() {

  const summary = ref({
    totalRevenue: 0,
    adminProfit: 0,
    totalOrders: 0,
    totalProviders: 0,
  })

  const providerReports = ref([])
  const recentOrders = ref([])

  let socket = null

  // -----------------------------
  // INIT DASHBOARD
  // -----------------------------
  async function initDashboard() {
    await loadCached()
    await fetchDashboard()

    connectSocket()
  }

  // -----------------------------
  // CACHE LOAD
  // -----------------------------
  async function loadCached() {
    const saved = localStorage.getItem('admin-cache')
    if (saved) {
      const data = JSON.parse(saved)
      summary.value = data.summary
      providerReports.value = data.providerReports
      recentOrders.value = data.recentOrders
    }
  }

  // -----------------------------
  // API FETCH
  // -----------------------------
  async function fetchDashboard() {
    const res = await axios.get(`${API}/reports/dashboard?period=month`)

    summary.value = res.data.summary
    providerReports.value = res.data.providerReports
    recentOrders.value = res.data.recentOrders

    cache = res.data
    cache.timestamp = Date.now()

    localStorage.setItem('admin-cache', JSON.stringify(cache))
  }

  // -----------------------------
  // SOCKET REAL TIME
  // -----------------------------
  function connectSocket() {
    socket = io(API)

    socket.on('dashboard:update', (data) => {
      summary.value = data.summary
      providerReports.value = data.providerReports
      recentOrders.value = data.recentOrders
    })

    socket.on('order:new', (order) => {
      recentOrders.value.unshift(order)
    })
  }

  return {
    summary,
    providerReports,
    recentOrders,
    initDashboard,
    fetchDashboard,
  }
}