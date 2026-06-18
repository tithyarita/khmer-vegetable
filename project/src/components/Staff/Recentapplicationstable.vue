<template>
  <div class="app-table-card">
    <div class="table-header">
      <div>
        <h2 class="table-title">Recent Applications</h2>
        <p class="table-sub">Review and manage recent vendor onboarding requests.</p>
      </div>
      <button class="btn-view-all" @click="$emit('view-all')">View All</button>
    </div>

    <div class="col-headings">
      <span class="col col-vendor">Vendor Name</span>
      <span class="col col-cat">Product Category</span>
      <span class="col col-date">Submission Date</span>
      <span class="col col-status">Status</span>
      <span class="col col-menu"></span>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <div v-else class="table-body">
      <div v-if="applications.length === 0" class="empty-state">
        No recent applications found.
      </div>
      <div
        v-for="app in pagedItems"
        :key="app.id"
        class="app-row"
      >
        <div class="col col-vendor vendor-cell">
          <div class="vendor-logo" :style="app.logoStyle">
            <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.vendorName" />
            <span v-else class="vendor-initial">{{ app.vendorName?.[0] ?? '?' }}</span>
          </div>
          <span class="vendor-name">{{ app.vendorName }}</span>
        </div>

        <span class="col col-cat row-text">{{ app.category }}</span>
        <span class="col col-date row-text">{{ app.date }}</span>

        <div class="col col-status">
          <span :class="['status-badge', `status-badge--${app.status}`]">
            {{ app.status }}
          </span>
        </div>

        <div class="col col-menu menu-cell">
          <button
            v-if="app.status === 'approved' || app.status === 'rejected'"
            class="menu-btn menu-btn--delete"
            title="Delete application"
            @click="$emit('delete-app', app.id)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="table-footer">
      <span class="footer-count">
        Showing {{ pagedItems.length }} of {{ applications.length }} applications
      </span>
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button
          v-for="n in totalPages"
          :key="n"
          :class="['page-btn', { 'page-btn--active': n === currentPage }]"
          @click="currentPage = n"
        >{{ n }}</button>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  applications: { type: Array,   default: () => [] },
  loading:      { type: Boolean, default: false },
  error:        { type: String,  default: null },
})
defineEmits(['view-all', 'delete-app'])

const PAGE_SIZE   = 6
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.applications.length / PAGE_SIZE))
)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return props.applications.slice(start, start + PAGE_SIZE)
})
</script>

<style scoped>
.app-table-card {
  background: var(--card-bg);
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  margin-top: 20px;
}

.table-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px 14px;
}
.table-title { font-size: 17px; font-weight: 700; color: var(--brand-dark); }
.table-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; }

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

.col        { display: flex; align-items: center; }
.col-vendor { flex: 2.2; }
.col-cat    { flex: 1.6; }
.col-date   { flex: 1.4; }
.col-status { flex: 1.1; }
.col-menu   { flex: 0 0 36px; justify-content: flex-end; }

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

.state-msg        { padding: 32px; text-align: center; color: #6b7280; font-size: 13.5px; }
.state-msg--error { color: #dc2626; }
.empty-state      { padding: 40px; text-align: center; font-size: 13px; color: #9ca3af; }

.app-row {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background .12s;
}
.app-row:last-child { border-bottom: none; }
.app-row:hover      { background: #f9fafb; }
.row-text           { font-size: 13px; color: #374151; }

.vendor-cell { display: flex; align-items: center; gap: 11px; }
.vendor-logo {
  width: 36px; height: 36px;
  border-radius: 8px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}
.vendor-logo img { width: 100%; height: 100%; object-fit: cover; }
.vendor-initial  { font-size: 14px; font-weight: 700; color: #9ca3af; }
.vendor-name     { font-size: 13px; font-weight: 600; color: #111827; }

.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge--pending   { background: var(--badge-pending-bg);  color: var(--badge-pending-text); }
.status-badge--in-review { background: var(--badge-review-bg);   color: var(--badge-review-text); }
.status-badge--approved  { background: var(--badge-approved-bg); color: var(--badge-approved-text); }
.status-badge--rejected  { background: var(--badge-rejected-bg); color: var(--badge-rejected-text); }

.menu-btn {
  border: none; background: none;
  color: #9ca3af; font-size: 16px;
  cursor: pointer; padding: 4px;
  border-radius: 6px;
  transition: color .12s, background .12s;
}
.menu-btn:hover { color: #374151; background: #f3f4f6; }
.menu-btn--delete { color: #dc2626; }
.menu-btn--delete:hover { color: #b91c1c; background: #fef2f2; }

.table-footer {
  display: flex; align-items: center; justify-content: space-between;
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
  font-size: 12px; font-weight: 500; color: #374151;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, border-color .12s;
}
.page-btn:hover:not(:disabled) { background: #f0f7f0; border-color: var(--brand-accent); }
.page-btn--active  { background: var(--brand-dark); color: #fff; border-color: var(--brand-dark); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>