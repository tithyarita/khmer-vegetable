<template>
  <!--
    Displays a table of recent vendor applications.
    Each row: vendor logo | vendor name + category | date | status badge | score bar | action menu
  -->
  <div class="app-table-card">
    <!-- Card header -->
    <div class="table-header">
      <div>
        <h2 class="table-title">Recent Applications</h2>
        <p class="table-sub">Review and manage recent vendor onboarding requests.</p>
      </div>
      <button class="btn-view-all" @click="$emit('view-all')">View All</button>
    </div>

    <!-- Column headings -->
    <div class="col-headings">
      <span class="col col-vendor">Vendor Name</span>
      <span class="col col-cat">Product Category</span>
      <span class="col col-date">Submission Date</span>
      <span class="col col-status">Status</span>
      <span class="col col-score">Score</span>
      <span class="col col-menu"></span>
    </div>

    <!-- Rows -->
    <div class="table-body">
      <div
        v-for="app in applications"
        :key="app.id"
        class="app-row"
      >
        <!-- Vendor logo / avatar -->
        <div class="col col-vendor vendor-cell">
          <div class="vendor-logo" :style="app.logoStyle">
            <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.vendorName" />
            <span v-else class="vendor-initial">{{ app.vendorName[0] }}</span>
          </div>
          <span class="vendor-name">{{ app.vendorName }}</span>
        </div>

        <!-- Category -->
        <span class="col col-cat row-text">{{ app.category }}</span>

        <!-- Date -->
        <span class="col col-date row-text">{{ app.date }}</span>

        <!-- Status badge -->
        <div class="col col-status">
          <span :class="['status-badge', `status-badge--${app.status.toLowerCase()}`]">
            {{ app.status }}
          </span>
        </div>

        <!-- Score bar -->
        <div class="col col-score score-cell">
          <div class="score-track">
            <div
              class="score-fill"
              :style="{
                width: app.score + '%',
                background: scoreColor(app.score)
              }"
            ></div>
          </div>
          <span class="score-pct">{{ app.score }}%</span>
        </div>

        <!-- Action menu -->
        <div class="col col-menu menu-cell">
          <button class="menu-btn" title="More options">
            <i class="bi bi-three-dots"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination footer -->
    <div class="table-footer">
      <span class="footer-count">Showing {{ applications.length }} of 1,284 applications</span>
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
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['view-all'])

const currentPage = ref(1)

// Sample data – in a real app pass this in via props or fetch from an API
const applications = [
  {
    id: 1,
    vendorName: 'Green Valley Farms',
    logoUrl: '',
    logoStyle: { background: '#e5e7eb' },
    category: 'Organic Vegetables',
    date: 'Oct 24, 2023',
    status: 'Pending',
    score: 85,
  },
  {
    id: 2,
    vendorName: 'Sun-Kissed Orchards',
    logoUrl: 'https://placehold.co/36x36/4ade80/fff?text=S',
    logoStyle: {},
    category: 'Seasonal Fruits',
    date: 'Oct 22, 2023',
    status: 'Approved',
    score: 92,
  },
  {
    id: 3,
    vendorName: 'Alpine Dairy Co.',
    logoUrl: 'https://placehold.co/36x36/f87171/fff?text=A',
    logoStyle: {},
    category: 'Dairy & Cheese',
    date: 'Oct 21, 2023',
    status: 'Rejected',
    score: 45,
  },
  {
    id: 4,
    vendorName: 'Honeycomb Collective',
    logoUrl: 'https://placehold.co/36x36/fbbf24/fff?text=H',
    logoStyle: {},
    category: 'Honey & Beeswax',
    date: 'Oct 19, 2023',
    status: 'Pending',
    score: 78,
  },
]

// Score → colour gradient (green for high, red for low)
function scoreColor(score) {
  if (score >= 75) return '#2d6a4f'
  if (score >= 50) return '#f59e0b'
  return '#be123c'
}
</script>

<style scoped>
/* ── Card shell ── */
.app-table-card {
  background: var(--card-bg);
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

/* Header */
.table-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px 14px;
}
.table-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--brand-dark);
}
.table-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.btn-view-all {
  background: var(--brand-dark);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-view-all:hover { background: var(--brand-green); }

/* Column layout helper */
.col { display: flex; align-items: center; }
.col-vendor  { flex: 2.2; }
.col-cat     { flex: 1.6; }
.col-date    { flex: 1.4; }
.col-status  { flex: 1.1; }
.col-score   { flex: 1.8; }
.col-menu    { flex: 0 0 36px; justify-content: flex-end; }

/* Column headings row */
.col-headings {
  display: flex;
  padding: 8px 24px;
  background: #f9fafb;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}
.col-headings .col {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: #9ca3af;
}

/* Rows */
.app-row {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background .12s;
}
.app-row:last-child { border-bottom: none; }
.app-row:hover { background: #f9fafb; }

.row-text {
  font-size: 13px;
  color: #374151;
}

/* Vendor cell */
.vendor-cell { display: flex; align-items: center; gap: 11px; }
.vendor-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}
.vendor-logo img { width: 100%; height: 100%; object-fit: cover; }
.vendor-initial {
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
}
.vendor-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

/* Status badges */
.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
}
.status-badge--pending  { background: var(--badge-pending-bg);  color: var(--badge-pending-text); }
.status-badge--approved { background: var(--badge-approved-bg); color: var(--badge-approved-text); }
.status-badge--rejected { background: var(--badge-rejected-bg); color: var(--badge-rejected-text); }

/* Score bar */
.score-cell { display: flex; align-items: center; gap: 8px; }
.score-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s ease;
}
.score-pct {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  min-width: 32px;
}

/* Action menu */
.menu-btn {
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color .12s, background .12s;
}
.menu-btn:hover { color: #374151; background: #f3f4f6; }

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

/* Pagination */
.pagination { display: flex; gap: 4px; }
.page-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s, border-color .12s;
}
.page-btn:hover { background: #f0f7f0; border-color: var(--brand-accent); }
.page-btn--active {
  background: var(--brand-dark);
  color: #fff;
  border-color: var(--brand-dark);
}
</style>