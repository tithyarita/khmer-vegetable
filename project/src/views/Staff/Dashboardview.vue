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

    <RecentApplicationsTable
      :applications="recentApplications"
      :loading="loading"
      :error="error"
      @view-all="$router.push('/staff/applications')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatsCard               from '../../components/Staff/StateCard.vue'
import RecentApplicationsTable from '../../components/Staff/Recentapplicationstable.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const applications = ref([])
const loading      = ref(true)
const error        = ref(null)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/applications`)
    if (!res.ok) throw new Error(`Server error: ${res.status}`)
    applications.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
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
    .slice(0, 5)
    .map(a => ({
      id:         a.id,
      vendorName: a.business_name || a.owner_name || '—',
      category:   a.farm_category || '—',
      date:       formatDate(a.submitted_at),
      status:     normalizeStatus(a.application_status),
      logoUrl:    a.profile_photo_path
        ? `${API_BASE}/${a.profile_photo_path}`
        : null,
      logoStyle: { background: '#f0f4f8' },
    }))
)
</script>

<style scoped>
.dashboard    { display: flex; flex-direction: column; gap: 0; }
.page-heading { margin-bottom: 24px; }
.page-title   { font-size: 26px; font-weight: 800; color: var(--brand-dark); letter-spacing: -.4px; }
.page-sub     { font-size: 13px; color: #6b7280; margin-top: 4px; }
.stats-row    { display: flex; gap: 14px; flex-wrap: wrap; }
</style>