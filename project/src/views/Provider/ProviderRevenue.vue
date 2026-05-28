<template>
  <div class="provider-revenue">
    <div class="revenue-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Earning" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
          <!-- Monthly PDF Report Button -->
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
                <span>This Month Revenue</span>
                <strong>{{ formatCurrency(reportData.monthRevenue) }}</strong>
              </div>
              <div class="pdf-summary-card">
                <span>Orders This Month</span>
                <strong>{{ reportData.monthOrders }}</strong>
              </div>
              <div class="pdf-summary-card">
                <span>Top Product</span>
                <strong>{{ reportData.topProductName }}</strong>
              </div>
            </div>

            <div class="pdf-section">
              <h2>Top Selling Products</h2>
              <table class="pdf-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th class="text-end">Kg Sold</th>
                    <th class="text-end">Orders</th>
                    <th class="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in reportData.products" :key="product.id">
                    <td>{{ product.rank }}</td>
                    <td>{{ product.name }}</td>
                    <td class="text-end">{{ product.totalQuantity.toFixed(2) }}</td>
                    <td class="text-end">{{ product.orderCount }}</td>
                    <td class="text-end">{{ formatCurrency(product.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pdf-footer">
              <div class="pdf-footer-left">
                <span>Thank you for selling with Khmer Vegetable Market.</span>
                <span>Keep this receipt for your records.</span>
              </div>

              <div class="pdf-signature">
                <div class="signature-line"></div>
                <span>Authorized Signature</span>
              </div>
            </div>
          </div>

          <!-- Revenue Stats -->
          <div class="mb-4">
            <RevenueStats />
          </div>

          <!-- Products Sell Analysis Chart -->
          <div class="card mb-4">
            <div class="card-body">
              <ProductsSellAnalysis />
            </div>
          </div>

          <!-- Top Customers Section -->
          <div class="card mb-4">
            <div class="card-body">
              <TopCustomers :limit="5" />
            </div>
          </div>

          <!-- Top Orders Section -->
          <div class="card mb-4">
            <div class="card-body">
              <TopOrders :limit="5" />
            </div>
          </div>

          <!-- Recent Orders -->
          <RecentOrder />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import RevenueStats from '../../components/provider_com/revenueStats.vue'
import ProductsSellAnalysis from '../../components/provider_com/ProductsSellAnalysis.vue'
import RecentOrder from '../../components/provider_com/recentOrder.vue'
import TopCustomers from '../../components/provider_com/TopCustomers.vue'
import TopOrders from '../../components/provider_com/TopOrders.vue'

const API_BASE_URL = 'http://localhost:3000'
const reportRef = ref(null)
const reportLoading = ref(false)
const reportData = ref({
  providerName: '-',
  totalRevenue: 0,
  monthRevenue: 0,
  monthOrders: 0,
  topProductName: '-',
  products: [],
})
const reportMeta = ref({
  monthLabel: '',
  generatedAt: '',
})

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

const loadMonthlyReport = async () => {
  reportLoading.value = true

  const providerId = getProviderId()

  let revenueData = {}
  let products = []

  if (providerId) {
    const [revenueResponse, productsResponse] = await Promise.all([
      api.get(`/orders/provider/${providerId}/revenue`),
      api.get('/orders/top-products', {
        params: { period: 'month', providerId },
      }),
    ])

    revenueData = revenueResponse.data || {}
    products = Array.isArray(productsResponse.data?.products)
      ? productsResponse.data.products
      : []
  } else {
    // No provider id (admin / anonymous): fetch global top-products only
    try {
      const productsResponse = await api.get('/orders/top-products', { params: { period: 'month' } })
      products = Array.isArray(productsResponse.data?.products) ? productsResponse.data.products : []
    } catch (e) {
      products = []
    }
  }

  // Fallback to global top-products if provider-specific list is empty
  if (!products.length) {
    try {
      const fallback = await api.get('/orders/top-products', { params: { period: 'month' } })
      products = Array.isArray(fallback.data?.products) ? fallback.data.products : []
    } catch (e) {
      // ignore fallback errors, products will remain empty
    }
  }

  const computedProducts = products.map((product) => ({
    ...product,
    revenue: Number(product.totalQuantity || 0) * Number(product.price || 0),
  }))

  const computedMonthRevenue = Number(
    revenueData?.monthRevenue ?? computedProducts.reduce((s, p) => s + Number(p.revenue || 0), 0),
  )

  reportData.value = {
    providerName: userName(),
    totalRevenue: Number(revenueData.totalRevenue ?? 0),
    monthRevenue: computedMonthRevenue,
    monthOrders: Number(revenueData.totalOrders ?? 0) || 0,
    topProductName: computedProducts[0]?.name || '-',
    products: computedProducts,
  }

  reportMeta.value = {
    monthLabel: buildMonthLabel(),
    generatedAt: new Date().toLocaleString(),
  }

  reportLoading.value = false
}

const buildReportFragment = (data, meta, stylesHtml = '') => {
  const rows = (data.products || [])
    .map(
      (p, i) => `
      <tr>
        <td style="padding:8px">${p.rank || i + 1}</td>
        <td style="padding:8px">${p.name}</td>
        <td style="padding:8px;text-align:right">${Number(p.totalQuantity || 0).toFixed(2)}</td>
        <td style="padding:8px;text-align:right">${p.orderCount || 0}</td>
        <td style="padding:8px;text-align:right">${formatCurrency(p.revenue || 0)}</td>
      </tr>`,
    )
    .join('\n')

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
          <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800">Revenue This Month</div>
          <div style="font-size:18px;font-weight:900">${formatCurrency(data.monthRevenue)}</div>
        </div>
      </div>

      <h3 style="margin-top:22px">Top Selling Products</h3>
      <table style="width:100%;border-collapse:collapse;font-family:inherit">
        <thead>
          <tr>
            <th style="text-align:left">#</th>
            <th style="text-align:left">Product</th>
            <th style="text-align:right">Kg Sold</th>
            <th style="text-align:right">Orders</th>
            <th style="text-align:right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="margin-top:28px;text-align:left;color:#64748b;font-size:12px">Thank you for selling with Khmer Vegetable Market.</div>
    </div>
  `
}

const downloadMonthlyReport = async () => {
  reportLoading.value = true
  try {
    await loadMonthlyReport()

    // Collect styles and inject into fragment so html2canvas has necessary rules
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((n) => n.outerHTML)
      .join('\n')

    const fragmentHtml = buildReportFragment(reportData.value, reportMeta.value, styles)

    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, {
      position: 'fixed',
      width: '0',
      height: '0',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
      left: '-99999px',
      top: '0',
    })
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      throw new Error('Unable to prepare PDF document')
    }

    iframeDoc.open()
    iframeDoc.write(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fragmentHtml}</body></html>`)
    iframeDoc.close()

    // Wait for layout inside the iframe
    await new Promise((resolve) => setTimeout(resolve, 500))

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
    console.error('Failed to generate report PDF:', error)
    alert(error?.message || 'Failed to generate report PDF.')
  } finally {
    reportLoading.value = false
  }
}

const userName = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.name || 'Provider'
}

onMounted(() => {
  reportMeta.value.monthLabel = buildMonthLabel()
})
</script>

<style scoped>
.provider-revenue {
  background-color: #f5f5f5;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.revenue-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.sidebar-wrapper {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow: hidden;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  background-color: #f5f5f5;
}

.card {
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card-body {
  padding: 1.5rem;
}

.report-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.report-kicker {
  color: #2d6a4f;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.report-note {
  color: #6b7280;
  font-size: 13px;
}

.download-btn {
  white-space: nowrap;
}

.pdf-report-sheet {
  position: absolute;
  left: -99999px;
  top: 0;
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  color: #0f172a;
  padding: 18mm 16mm;
  box-sizing: border-box;
}

.pdf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #e5e7eb;
}

.pdf-branding {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pdf-logo {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f5c34, #2d6a4f);
  color: #fff;
  font-weight: 900;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 18px rgba(31, 92, 52, 0.18);
}

.pdf-brand {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2d6a4f;
}

.pdf-header h1 {
  margin: 6px 0 4px;
  font-size: 24px;
  font-weight: 900;
}

.pdf-header p {
  margin: 0;
  color: #475569;
}

.pdf-badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-weight: 800;
}

.pdf-meta-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pdf-meta-row > div {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  padding: 10px 12px;
}

.pdf-meta-row span {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 4px;
}

.pdf-meta-row strong {
  font-size: 12px;
  color: #0f172a;
}

.pdf-summary-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pdf-summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  background: #f8fafc;
}

.pdf-summary-card span {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  margin-bottom: 6px;
}

.pdf-summary-card strong {
  font-size: 18px;
  font-weight: 900;
}

.pdf-section {
  margin-top: 18px;
}

.pdf-section h2 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 900;
}

.pdf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.pdf-table th,
.pdf-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e5e7eb;
}

.pdf-table th {
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}

.pdf-footer {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.pdf-footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
  color: #64748b;
}

.pdf-signature {
  min-width: 190px;
  text-align: center;
  font-size: 10px;
  color: #475569;
}

.signature-line {
  border-bottom: 1px solid #111827;
  height: 34px;
  margin-bottom: 6px;
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }

  .content-wrapper {
    padding: 1rem !important;
  }
}

@media (max-width: 768px) {
  .revenue-container {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    max-height: 180px;
  }

  .main-content {
    flex: 1;
  }

  .content-wrapper {
    padding: 1rem !important;
  }

  .card {
    margin-bottom: 1rem;
  }

  .report-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .pdf-meta-row {
    grid-template-columns: 1fr;
  }

  .pdf-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .sidebar-wrapper {
    max-height: 150px;
  }

  .revenue-header {
    padding: 0.75rem 1rem !important;
  }

  .revenue-header h5 {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 0.75rem !important;
  }

  .card-body {
    padding: 1rem;
  }

  .download-btn {
    width: 100%;
  }
}
</style>
