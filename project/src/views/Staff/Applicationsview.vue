<template>
  <div class="applications">
    <!-- Page heading + queue health badge -->
    <div class="page-heading">
      <div>
        <h1 class="page-title">Application Queue</h1>
        <p class="page-sub">Review and validate new provider credentials to maintain market freshness.</p>
      </div>
      <div class="queue-health">
        <p class="qh-label">QUEUE HEALTH</p>
        <p class="qh-value">{{ pendingCount }} Pending</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <button class="filter-chip filter-chip--outline">
        <i class="bi bi-funnel me-1"></i> Filter
      </button>
      <button
        :class="['filter-chip', activeFilter === 'all' && 'filter-chip--active']"
        @click="activeFilter = 'all'"
      >All Statuses</button>
      <button
        :class="['filter-chip', activeFilter === 'submitted' && 'filter-chip--active']"
        @click="activeFilter = 'submitted'"
      >Pending Only</button>

      <span class="filter-count">
        Displaying 1–{{ filtered.length }} of {{ applications.length }} applications
      </span>
    </div>

    <!-- Loading / error states -->
    <div v-if="loading" class="state-msg">Loading applications…</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <!-- Queue card -->
    <div v-else class="queue-card">
      <div class="col-headings">
        <span class="qcol qcol-app">Applicant Name</span>
        <span class="qcol qcol-farm">Farm Name</span>
        <span class="qcol qcol-date">Submitted Date</span>
        <span class="qcol qcol-status">Status</span>
        <span class="qcol qcol-action"></span>
      </div>

      <!-- Each row maps one ProviderApplication record → ApplicationQueueItem props -->
      <ApplicationQueueItem
        v-for="app in filtered"
        :key="app.id"
        :id="app.id"
        :applicant="{
          name:      app.owner_name,
          email:     app.contact_email,
          avatarUrl: app.profile_photo_path
            ? `${API_BASE}/${app.profile_photo_path}`
            : '',
        }"
        :farm="{
          name:     app.business_name,
          category: app.farm_category ?? '—',
        }"
        :submittedAt="formatDate(app.submitted_at)"
        :status="normalizeStatus(app.application_status)"
      />

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="empty-state">
        No applications match the current filter.
      </div>

      <!-- Pagination footer -->
      <div class="table-footer">
        <span class="footer-count">Showing {{ filtered.length }} of {{ applications.length }} applications</span>
        <div class="pagination">
          <button class="page-btn"><i class="bi bi-chevron-left"></i></button>
          <button
            v-for="n in 3" :key="n"
            :class="['page-btn', { 'page-btn--active': n === currentPage }]"
            @click="currentPage = n"
          >{{ n }}</button>
          <button class="page-btn"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Footer strip -->
    <div class="system-footer">
      <span>The Organic Editorial System v2.4</span>
      <span class="system-status">
        <span class="status-dot"></span> Cloud Services Operational
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApplicationQueueItem from '../../components/Staff/Applicationqueueitem.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const applications = ref([])   // raw records from GET /api/applications
const loading      = ref(true)
const error        = ref(null)
const currentPage  = ref(1)
const activeFilter = ref('all')

// ─── Fetch all applications on mount ────────────────────────────────────────
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * DB stores "submitted" | "in_review" | "approved" | "rejected"
 * The queue item badge expects "pending" | "in-review" | "approved" | "rejected"
 */
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

/**
 * Format ISO timestamp → "Oct 24, 2023 14:22 PM"
 */
function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

// ─── Filtering ───────────────────────────────────────────────────────────────
const filtered = computed(() =>
  activeFilter.value === 'all'
    ? applications.value
    : applications.value.filter(a =>
        normalizeStatus(a.application_status) === activeFilter.value
      )
)

const pendingCount = computed(() =>
  applications.value.filter(a =>
    ['draft', 'submitted'].includes(a.application_status)
  ).length
)
</script>

<style scoped>
.applications { display: flex; flex-direction: column; gap: 20px; }

.page-heading { display: flex; align-items: flex-start; justify-content: space-between; }
.page-title   { font-size: 26px; font-weight: 800; color: var(--brand-dark); letter-spacing: -.4px; }
.page-sub     { font-size: 13px; color: #6b7280; margin-top: 4px; }

.queue-health { text-align: right; background: var(--card-bg); border: 1px solid #eaeaea; border-radius: 10px; padding: 10px 18px; box-shadow: var(--card-shadow); }
.qh-label     { font-size: 9.5px; font-weight: 700; letter-spacing: .6px; color: #9ca3af; text-transform: uppercase; }
.qh-value     { font-size: 20px; font-weight: 800; color: var(--brand-dark); margin-top: 2px; }

.filter-bar   { display: flex; align-items: center; gap: 8px; }
.filter-chip  { padding: 6px 14px; border-radius: 20px; border: 1px solid #d1d5db; background: #fff; font-size: 12.5px; font-weight: 500; color: #374151; cursor: pointer; transition: background .12s, border-color .12s, color .12s; }
.filter-chip:hover { border-color: var(--brand-accent); color: var(--brand-green); }
.filter-chip--active { background: var(--brand-dark); border-color: var(--brand-dark); color: #fff; }
.filter-chip--outline { display: flex; align-items: center; }
.filter-count { margin-left: auto; font-size: 11.5px; color: #9ca3af; }

.state-msg         { padding: 32px; text-align: center; color: #6b7280; font-size: 13.5px; }
.state-msg--error  { color: #dc2626; }

.queue-card   { background: var(--card-bg); border: 1px solid #eaeaea; border-radius: 14px; box-shadow: var(--card-shadow); overflow: hidden; }

.col-headings { display: flex; padding: 10px 24px; background: #f9fafb; border-bottom: 1px solid #f0f0f0; }
.qcol         { font-size: 10.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #9ca3af; }
.qcol-app     { flex: 2.2; }
.qcol-farm    { flex: 2.0; }
.qcol-date    { flex: 1.8; }
.qcol-status  { flex: 1.2; }
.qcol-action  { flex: 0 0 120px; }

.empty-state  { padding: 40px; text-align: center; font-size: 13px; color: #9ca3af; }

.table-footer  { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid #f3f4f6; background: #fafafa; }
.footer-count  { font-size: 11.5px; color: #9ca3af; }
.pagination    { display: flex; gap: 4px; }
.page-btn      { width: 28px; height: 28px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .12s; }
.page-btn:hover { background: #f0f7f0; border-color: var(--brand-accent); }
.page-btn--active { background: var(--brand-dark); color: #fff; border-color: var(--brand-dark); }

.system-footer  { display: flex; justify-content: space-between; font-size: 10.5px; color: #9ca3af; padding: 4px 0; }
.system-status  { display: flex; align-items: center; gap: 6px; }
.status-dot     { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
</style>