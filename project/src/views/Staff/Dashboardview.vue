<template>
  <div class="dashboard">
    <div class="page-heading">
      <h1 class="page-title">Staff Dashboard</h1>
      <p class="page-sub">Manage incoming vendor requests and portal status.</p>
    </div>

    <div class="stats-row">
      <StatsCard
        label="Total Forms"
        :value="applications.length"
        icon="bi-archive"
        badgeText="All time"
        badgeType="success"
        valueColor="var(--brand-dark)"
      />
      <StatsCard
        label="Pending Review"
        :value="counts.pending"
        icon="bi-clipboard-check"
        badgeText="Action required"
        badgeType="warning"
        valueColor="#1a2e1a"
      />
      <StatsCard
        label="Staff Approved"
        :value="counts.approved"
        icon="bi-patch-check"
        badgeText="Lifetime total"
        badgeType="neutral"
        valueColor="#14532d"
      />
      <StatsCard
        label="Rejected"
        :value="counts.rejected"
        icon="bi-slash-circle"
        badgeText="Lifetime total"
        badgeType="danger"
        valueColor="#7f1d1d"
      />
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Status Distribution</h3>
          <p>Breakdown of vendor applications by current status</p>
        </div>
        <div class="chart-body">
          <canvas ref="statusCanvas"></canvas>
        </div>
      </div>
    </div>

    <RecentApplicationsTable
      :applications="recentApplications"
      :loading="loading"
      :error="error"
      @view-all="$router.push('/staff/applications')"
      @delete-app="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import StatsCard               from '../../components/Staff/StateCard.vue'
import RecentApplicationsTable from '../../components/Staff/Recentapplicationstable.vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend)

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const statusCanvas = ref(null)
let statusChart = null
const applications = ref([])
const loading      = ref(true)
const error        = ref(null)

function renderStatusChart() {
  if (!statusCanvas.value) return
  statusChart?.destroy()
  statusChart = new Chart(statusCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [counts.value.pending, counts.value.approved, counts.value.rejected],
        backgroundColor: ['#d97706', '#16a34a', '#dc2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12, weight: '500' }, padding: 16, color: '#2d3748' }
        },
        tooltip: { padding: 12, cornerRadius: 8 }
      }
    }
  })
}
async function handleDelete(id) {
  if (!confirm('Delete this application? This cannot be undone.')) return
  try {
    const res = await fetch(`${API_BASE}/api/applications/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Delete failed')
    }
    applications.value = applications.value.filter(a => a.id !== id)
  } catch (err) {
    alert('Failed to delete: ' + err.message)
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/applications`)
    if (!res.ok) throw new Error(`Server error: ${res.status}`)
    applications.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
  loading.value = false
  nextTick(renderStatusChart)
  }
})

function normalizeStatus(dbStatus) {
  const map = {
    draft:     'pending',
    submitted: 'pending',
    in_review: 'in-review',
    approved:  'approved',
    rejected:  'rejected',
  }
  return map[dbStatus] ?? 'pending'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const counts = computed(() => ({
  pending:  applications.value.filter(a => ['draft', 'submitted'].includes(a.application_status)).length,
  approved: applications.value.filter(a => a.application_status === 'approved').length,
  rejected: applications.value.filter(a => a.application_status === 'rejected').length,
}))

const recentApplications = computed(() =>
  [...applications.value]
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .map(a => ({
      id:         a.id,
      vendorName: a.business_name || a.owner_name || '—',
      category:   a.farm_category || '—',
      date:       formatDate(a.submitted_at),
      status:     normalizeStatus(a.application_status),
      score:      a.id_document_path ? 80 : 40,
      logoUrl: a.profile_photo_path
        ? (a.profile_photo_path.startsWith('http')
            ? a.profile_photo_path 
            : `${API_BASE}/images/${a.profile_photo_path.replace(/\\/g, '/').replace('uploads/', '')}`)
        : null,
      logoStyle: { background: '#f0f4f8' },
    }))
  )
  onBeforeUnmount(() => statusChart?.destroy())
</script>

<style scoped>
.dashboard    { display: flex; flex-direction: column; gap: 0; }
.page-heading { margin-bottom: 24px; }
.page-title   { font-size: 26px; font-weight: 800; color: var(--brand-dark); letter-spacing: -.4px; }
.page-sub     { font-size: 13px; color: #6b7280; margin-top: 4px; }
.stats-row    { display: flex; gap: 14px; flex-wrap: wrap; }
.charts-row { margin: 24px 0 24px; }
.chart-card {
  border: 1px solid #e1e9e3;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(18,43,29,0.02);
  overflow: hidden;
}
.chart-header {
  padding: 20px;
  border-bottom: 1px solid #f0f4f1;
}
.chart-header h3 {
  font-size: 15.5px;
  font-weight: 700;
  color: #111c15;
  margin: 0;
}
.chart-header p {
  font-size: 12px;
  color: #718096;
  margin: 2px 0 0;
}
.chart-body {
  padding: 24px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>