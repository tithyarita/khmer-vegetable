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
        :class="['filter-chip', activeFilter === 'pending' && 'filter-chip--active']"
        @click="activeFilter = 'pending'"
      >Pending Only</button>

      <span class="filter-count">Displaying 1–{{ filtered.length }} of {{ applications.length }} applications</span>
    </div>

    <!-- Queue card -->
    <div class="queue-card">
      <!-- Column headings -->
      <div class="col-headings">
        <span class="qcol qcol-app">Applicant Name</span>
        <span class="qcol qcol-farm">Farm Name</span>
        <span class="qcol qcol-date">Submitted Date</span>
        <span class="qcol qcol-status">Status</span>
        <span class="qcol qcol-action"></span>
      </div>

      <!-- Rows -->
      <ApplicationQueueItem
        v-for="app in filtered"
        :key="app.id"
        :applicant="app.applicant"
        :farm="app.farm"
        :submittedAt="app.submittedAt"
        :status="app.status"
        @view="onView"
      />

      <!-- Pagination footer -->
      <div class="table-footer">
        <span class="footer-count">Showing {{ filtered.length }} of 1,284 applications</span>
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
import { ref, computed } from 'vue'
import ApplicationQueueItem from '../../components/Staff/Applicationqueueitem.vue'

const currentPage  = ref(1)
const activeFilter = ref('all')

const applications = [
  {
    id: 1,
    applicant: { name: 'Sarah Greenfield', email: 'sarah@greenfieldfarms.co', avatarUrl: '' },
    farm:      { name: 'Greenfield Artisanal Orchards', category: 'Heirloom Apples & Pears' },
    submittedAt: 'Oct 24, 2023 14:22 PM',
    status: 'pending',
  },
  {
    id: 2,
    applicant: { name: 'Marcus Thorne', email: 'thorne@urbanveg.io', avatarUrl: '' },
    farm:      { name: 'Thorne Urban Microgreens', category: 'Hydroponic Herbs' },
    submittedAt: 'Oct 25, 2023 09:10 AM',
    status: 'in-review',
  },
  {
    id: 3,
    applicant: { name: 'Elena Rodriguez', email: 'elena@valleyroot.org', avatarUrl: '' },
    farm:      { name: 'Valley Root Cooperative', category: 'Root Vegetables & Tubers' },
    submittedAt: 'Oct 26, 2023 11:45 AM',
    status: 'pending',
  },
  {
    id: 4,
    applicant: { name: 'David Chen', email: 'd.chen@morningstar.com', avatarUrl: '' },
    farm:      { name: 'Morningstar Dairy & Flora', category: 'Goat Cheese & Honey' },
    submittedAt: 'Oct 27, 2023 16:30 PM',
    status: 'in-review',
  },
]

const filtered = computed(() =>
  activeFilter.value === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter.value)
)

const pendingCount = computed(() =>
  applications.filter(a => a.status === 'pending').length
)

function onView(applicant) {
  console.log('View details for:', applicant)
  // TODO: navigate to a detail page or open a modal
}
</script>

<style scoped>
.applications { display: flex; flex-direction: column; gap: 20px; }

/* Heading */
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--brand-dark);
  letter-spacing: -.4px;
}
.page-sub { font-size: 13px; color: #6b7280; margin-top: 4px; }

/* Queue health chip */
.queue-health {
  text-align: right;
  background: var(--card-bg);
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 10px 18px;
  box-shadow: var(--card-shadow);
}
.qh-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: .6px;
  color: #9ca3af;
  text-transform: uppercase;
}
.qh-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--brand-dark);
  margin-top: 2px;
}

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 12.5px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background .12s, border-color .12s, color .12s;
}
.filter-chip:hover { border-color: var(--brand-accent); color: var(--brand-green); }
.filter-chip--active {
  background: var(--brand-dark);
  border-color: var(--brand-dark);
  color: #fff;
}
.filter-chip--outline { display: flex; align-items: center; }
.filter-count {
  margin-left: auto;
  font-size: 11.5px;
  color: #9ca3af;
}

/* Queue card */
.queue-card {
  background: var(--card-bg);
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

/* Column headings */
.col-headings {
  display: flex;
  padding: 10px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}
.qcol {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: #9ca3af;
}
.qcol-app    { flex: 2.2; }
.qcol-farm   { flex: 2.0; }
.qcol-date   { flex: 1.8; }
.qcol-status { flex: 1.2; }
.qcol-action { flex: 0 0 120px; }

/* Footer */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}
.footer-count { font-size: 11.5px; color: #9ca3af; }
.pagination { display: flex; gap: 4px; }
.page-btn {
  width: 28px; height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 12px; font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s;
}
.page-btn:hover { background: #f0f7f0; border-color: var(--brand-accent); }
.page-btn--active { background: var(--brand-dark); color: #fff; border-color: var(--brand-dark); }

/* System footer */
.system-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: #9ca3af;
  padding: 4px 0;
}
.system-status { display: flex; align-items: center; gap: 6px; }
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #22c55e;
}
</style>