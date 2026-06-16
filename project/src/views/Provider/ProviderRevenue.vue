<template>
  <div class="provider-revenue">
    <div class="revenue-container">
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <div class="main-content">
        <PageHeader title="Earning" />

        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
          
          <!-- Date Range Filter -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="date-filter-row">
                <div class="date-filter-group">
                  <div class="date-field">
                    <label for="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      v-model="dateRange.start"
                      class="form-control"
                    />
                  </div>
                  <div class="date-field">
                    <label for="endDate">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      v-model="dateRange.end"
                      class="form-control"
                    />
                  </div>
                  <button class="btn btn-primary" @click="loadMonthlyReport" :disabled="reportLoading">
                    <i class="bi bi-search me-1"></i> Analyze
                  </button>
                  <button class="btn btn-outline-secondary" @click="resetDateRange" :disabled="reportLoading">
                    <i class="bi bi-arrow-counterclockwise"></i> Reset
                  </button>
                </div>
                <div class="date-range-badge" v-if="dateRange.start || dateRange.end">
                  <i class="bi bi-calendar-range me-1"></i>
                  {{ dateRange.start || '...' }} → {{ dateRange.end || '...' }}
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body report-toolbar">
              <div>
                <p class="report-kicker mb-1">Provider report</p>
                <h5 class="mb-1 fw-bold">Monthly sales report</h5>
                <p class="report-note mb-0">
                  Download a PDF summary of this month's sales, revenue, and top-selling products.
                </p>
              </div>

              <button
                class="btn btn-success download-btn"
                @click="downloadMonthlyReport"
                :disabled="reportLoading"
              >
                <i class="bi bi-file-earmark-pdf me-1"></i>
                Download Report PDF
              </button>
            </div>
          </div>

          <div class="dashboard-stats-grid mb-4">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-wallet2"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">TOTAL REVENUE (GROSS)</span>
                <strong class="stat-value">{{ formatCurrency(reportData.totalRevenue) }}</strong>
                <span class="stat-subtext">Before 3% admin fee</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <i class="bi bi-cash-stack"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">ADMIN FEE (3%)</span>
                <strong class="stat-value">{{ formatCurrency(reportData.adminFee) }}</strong>
                <span class="stat-subtext">
                  {{ formatCurrency(reportData.totalRevenue) }} × 3%
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper net-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">YOUR NET (97%)</span>
                <strong class="stat-value net-value">{{ formatCurrency(reportData.netRevenue) }}</strong>
                <span class="stat-subtext">Revenue after admin fee</span>
              </div>
            </div>
          </div>

          <div ref="reportRef" class="pdf-report-sheet" aria-hidden="true">
            <div class="pdf-header">
              <div class="pdf-branding">
                <div class="pdf-logo">
                  <span>KV</span>
                </div>
                <div>
                  <div class="pdf-brand">Khmer Vegetable Market</div>
                  <h1>Monthly Sales Receipt</h1>
                  <p>{{ reportMeta.monthLabel }}</p>
                </div>
              </div>
              <div class="pdf-badge">Provider</div>
            </div>

            <div class="pdf-meta-row">
              <div>
                <span>Provider</span>
                <strong>{{ reportData.providerName }}</strong>
              </div>
              <div>
                <span>Generated</span>
                <strong>{{ reportMeta.generatedAt }}</strong>
              </div>
              <div>
                <span>Period</span>
                <strong>{{ reportMeta.monthLabel }}</strong>
              </div>
            </div>

            <div class="pdf-summary-grid">
              <div class="pdf-summary-card">
                <span>Total Revenue</span>
                <strong>{{ formatCurrency(reportData.totalRevenue) }}</strong>
              </div>
              <div class="pdf-summary-card">
                <span>Admin Fee (3%)</span>
                <strong>{{ formatCurrency(reportData.adminFee) }}</strong>
              </div>
              <div class="pdf-summary-card full-width">
                <span>Revenue After Admin Fee (97%)</span>
                <strong>{{ formatCurrency(reportData.netRevenue) }}</strong>
              </div>
            </div>

            <div class="pdf-footer">
              <div class="pdf-footer-left">
                <span>Thank you for selling with Khmer Vegetable Market.</span>
                <span>Keep this receipt for your records.</span>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <ProductsSellAnalysis />
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <TopCustomers :limit="5" />
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <TopOrders :limit="5" @view-order="openDetailModal" />
            </div>
          </div>

          <!-- Recent Orders -->
          <RecentOrder @view-order="openDetailModal" />
        </div>
      </div>
    </div>
    <OrderDetailModal :show="showDetailModal" :order="selectedOrder" @close="showDetailModal = false" />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import ProductsSellAnalysis from '../../components/provider_com/ProductsSellAnalysis.vue'
import RecentOrder from '../../components/provider_com/recentOrder.vue'
import TopCustomers from '../../components/provider_com/TopCustomers.vue'
import TopOrders from '../../components/provider_com/TopOrders.vue'
import OrderDetailModal from '../../components/provider_com/OrderDetailModal.vue'

const API_BASE_URL = 'http://localhost:3000'
const showDetailModal = ref(false)
const selectedOrder = ref({})

const openDetailModal = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}
const reportRef = ref(null)
const reportLoading = ref(false)

  const reportData = ref({
    providerName: '-',
    totalRevenue: 0,
    adminFee: 0,
    netRevenue: 0,
    totalOrders: 0,
  })

const reportMeta = ref({
  monthLabel: '',
  generatedAt: '',
})

const dateRange = reactive({
  start: '',
  end: '',
})

const getDefaultMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

const api = axios.create({ baseURL: API_BASE_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const getProviderId = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return Number(user?.id ?? user?.providerId ?? user?.provider_id ?? 0) || null
}

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const buildMonthLabel = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

const resetDateRange = () => {
  const defaults = getDefaultMonthRange()
  dateRange.start = defaults.start
  dateRange.end = defaults.end
  loadMonthlyReport()
}

const loadMonthlyReport = async () => {
  reportLoading.value = true
  const providerId = getProviderId()

  if (providerId) {
    try {
      // Fetch report data from the reports table (pre-calculated revenue, admin fee, net)
      const reportResponse = await api.get(`/reports/provider/${providerId}`)
      const report = reportResponse.data || {}

      reportData.value = {
        providerName: report.provider_name || userName(),
        totalRevenue: Number(report.total_revenue || 0),
        adminFee: Number(report.admin_profit || 0),
        netRevenue: Number(report.net_revenue || 0),
        totalOrders: Number(report.total_orders || 0),
      }
    } catch (e) {
      console.error('Failed to load provider report:', e)
      // Fallback: show zeros
      reportData.value = {
        providerName: userName(),
        totalRevenue: 0,
        adminFee: 0,
        netRevenue: 0,
        totalOrders: 0,
      }
    }
  } else {
    reportData.value = {
      providerName: userName(),
      totalRevenue: 0,
      adminFee: 0,
      netRevenue: 0,
      totalOrders: 0,
    }
  }

  // Build period label from date range
  if (dateRange.start || dateRange.end) {
    const startLabel = dateRange.start ? new Date(dateRange.start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'
    const endLabel = dateRange.end ? new Date(dateRange.end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'
    reportMeta.value.monthLabel = `${startLabel} - ${endLabel}`
  } else {
    reportMeta.value.monthLabel = buildMonthLabel()
  }

  reportMeta.value.generatedAt = new Date().toLocaleString()

  reportLoading.value = false
}

const buildReportFragment = (data, meta, stylesHtml = '') => {
  return `
    ${stylesHtml}
    <div style="max-width:800px;margin:0 auto;padding:20px;background:#fff;color:#0f172a">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h2 style="margin:0">Khmer Vegetable Market</h2>
          <div>${meta.monthLabel}</div>
        </div>
        <div style="text-align:right">
          <div>Generated: ${meta.generatedAt}</div>
          <div>Provider: ${data.providerName}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px">
        <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
          <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800">Total Revenue</div>
          <div style="font-size:18px;font-weight:900">${formatCurrency(data.totalRevenue)}</div>
        </div>
        <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
          <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800">Admin Fee (3%)</div>
          <div style="font-size:18px;font-weight:900">${formatCurrency(data.adminFee)}</div>
        </div>
      </div>

      <div style="display:block;margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc">
        <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800">Revenue After Admin Fee (97%)</div>
        <div style="font-size:22px;font-weight:900;color:#2d6a4f">${formatCurrency(data.netRevenue)}</div>
      </div>
    </div>
  `
}

const downloadMonthlyReport = async () => {
  reportLoading.value = true
  try {
    await loadMonthlyReport()
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(n => n.outerHTML).join('\n')
    const fragmentHtml = buildReportFragment(reportData.value, reportMeta.value, styles)

    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, { position: 'fixed', width: '0', height: '0', border: '0', opacity: '0', left: '-99999px' })
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    iframeDoc.open()
    iframeDoc.write(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fragmentHtml}</body></html>`)
    iframeDoc.close()

    await new Promise(resolve => setTimeout(resolve, 500))

    await html2pdf()
      .set({
        margin: 10,
        filename: `monthly-provider-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(iframeDoc.body)
      .save()

    iframe.remove()
  } catch (error) {
    console.error(error)
  } finally {
    reportLoading.value = false
  }
}

const userName = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.name || 'Provider'
}

onMounted(() => {
  // Set default date range to current month
  const defaults = getDefaultMonthRange()
  dateRange.start = defaults.start
  dateRange.end = defaults.end
  reportMeta.value.monthLabel = buildMonthLabel()
  loadMonthlyReport()
})
</script>

<style scoped>
/* Date Filter */
.date-filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.date-filter-group {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.date-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.date-field label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.date-field input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 150px;
}
.date-field input:focus {
  outline: none;
  border-color: #2d6a4f;
  box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
}
.date-filter-group .btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  height: 38px;
}
.date-range-badge {
  font-size: 0.8rem;
  color: #2d6a4f;
  background: #dcfce7;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
}

/* Grid for the 3 main cards */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: #1f5c34;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon-wrapper.net-icon {
  background-color: #2d6a4f;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0.25rem 0;
}

.stat-value.net-value {
  color: #2d6a4f;
}

.stat-subtext {
  font-size: 0.85rem;
  color: #64748b;
}

.full-width {
  grid-column: span 2;
}

/* Layout Core styles */
.provider-revenue {
  background-color: #f5f5f5;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
.revenue-container { display: flex; height: 100%; width: 100%; }
.sidebar-wrapper { width: 250px; background-color: #f8f9fa; border-right: 1px solid #dee2e6; flex-shrink: 0; }
.main-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.content-wrapper { background-color: #f5f5f5; }

.card { background: white; border: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
.card-body { padding: 1.5rem; }
.report-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.report-kicker { color: #2d6a4f; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.report-note { color: #6b7280; font-size: 13px; }

.pdf-report-sheet { position: absolute; left: -99999px; top: 0; width: 210mm; min-height: 297mm; background: #fff; padding: 18mm 16mm; }
.pdf-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 14px; }
.pdf-branding { display: flex; align-items: center; gap: 14px; }
.pdf-logo { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1f5c34, #2d6a4f); color: #fff; font-weight: 900; }
.pdf-brand { font-size: 12px; font-weight: 800; color: #2d6a4f; text-transform: uppercase; }
.pdf-header h1 { margin: 6px 0 4px; font-size: 24px; font-weight: 900; }
.pdf-badge { padding: 8px 12px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; }

.pdf-meta-row { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pdf-meta-row > div { border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc; padding: 10px 12px; }
.pdf-meta-row span { display: block; font-size: 10px; color: #64748b; font-weight: 800; }

.pdf-summary-grid { margin-top: 18px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.pdf-summary-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 14px; background: #f8fafc; }
.pdf-summary-card span { display: block; font-size: 10px; font-weight: 800; color: #64748b; }
.pdf-summary-card strong { font-size: 18px; font-weight: 900; }

.pdf-footer { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #64748b; }

@media (max-width: 992px) {
  .dashboard-stats-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .revenue-container { flex-direction: column; }
  .sidebar-wrapper { width: 100%; max-height: 180px; }
}
</style>