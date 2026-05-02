<template>
  <!--
    A single applicant row in the Application Queue list.

    Props:
      applicant  – { name, email, avatarUrl }
      farm       – { name, category }
      submittedAt – "Oct 24, 2023 · 14:22 PM"
      status     – "pending" | "in-review" | "approved" | "rejected"
  -->
  <div class="queue-item">
    <!-- Avatar + applicant info -->
    <div class="qi-applicant">
      <div class="qi-avatar">
        <img v-if="applicant.avatarUrl" :src="applicant.avatarUrl" :alt="applicant.name" />
        <i v-else class="bi bi-person-fill"></i>
      </div>
      <div class="qi-applicant-text">
        <p class="qi-name">{{ applicant.name }}</p>
        <p class="qi-email">{{ applicant.email }}</p>
      </div>
    </div>

    <!-- Farm name + category -->
    <div class="qi-farm">
      <p class="qi-farm-name">{{ farm.name }}</p>
      <p class="qi-farm-cat">{{ farm.category }}</p>
    </div>

    <!-- Submitted date/time -->
    <div class="qi-date">
      <p class="qi-date-main">{{ dateMain }}</p>
      <p class="qi-date-time">{{ dateTime }}</p>
    </div>

    <!-- Status badge -->
    <div class="qi-status">
      <span :class="['status-badge', `status-badge--${status}`]">
        {{ statusLabel }}
      </span>
    </div>

    <!-- Action button -->
    <div class="qi-action">
      <router-link to="/staff/details" class="btn-details" @click="$emit('view', applicant)">
        View Details
      </router-link>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  applicant:   { type: Object, required: true },
  farm:        { type: Object, required: true },
  submittedAt: { type: String, required: true },  // e.g. "Oct 24, 2023 14:22 PM"
  status:      { type: String, default: 'pending' },
})

defineEmits(['view'])

// Split "Oct 24, 2023 14:22 PM" into date / time parts
const dateMain = computed(() => props.submittedAt.split(' ').slice(0, 3).join(' '))
const dateTime = computed(() => props.submittedAt.split(' ').slice(3).join(' '))

const statusLabels = {
  pending:   'PENDING',
  'in-review': 'IN REVIEW',
  approved:  'APPROVED',
  rejected:  'REJECTED',
}
const statusLabel = computed(() => statusLabels[props.status] ?? props.status.toUpperCase())
</script>

<style scoped>
.queue-item {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid #f3f4f6;
  transition: background .12s;
}
.queue-item:hover { background: #f9fafb; }
.queue-item:last-child { border-bottom: none; }

/* Column widths */
.qi-applicant { flex: 2.2; display: flex; align-items: center; gap: 12px; }
.qi-farm      { flex: 2.0; }
.qi-date      { flex: 1.8; }
.qi-status    { flex: 1.2; }
.qi-action    { flex: 0 0 120px; display: flex; justify-content: flex-end; }

/* Avatar */
.qi-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #0369a1;
  font-size: 20px;
  flex-shrink: 0;
}
.qi-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Applicant text */
.qi-name  { font-size: 13.5px; font-weight: 600; color: #111827; }
.qi-email { font-size: 11.5px; color: #6b7280; margin-top: 1px; }

/* Farm */
.qi-farm-name { font-size: 13px; font-weight: 600; color: #111827; }
.qi-farm-cat  { font-size: 11.5px; color: var(--brand-mid); margin-top: 2px; font-weight: 500; }

/* Date */
.qi-date-main { font-size: 13px; color: #374151; font-weight: 500; }
.qi-date-time { font-size: 11.5px; color: #9ca3af; margin-top: 1px; }

/* Status badges */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .4px;
}
.status-badge--pending   { background: var(--badge-pending-bg);  color: var(--badge-pending-text); }
.status-badge--in-review { background: var(--badge-review-bg);   color: var(--badge-review-text); }
.status-badge--approved  { background: var(--badge-approved-bg); color: var(--badge-approved-text); }
.status-badge--rejected  { background: var(--badge-rejected-bg); color: var(--badge-rejected-text); }

/* View Details button */
.btn-details {
  border: 1.5px solid #d1d5db;
  background: #fff;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: border-color .15s, background .15s, color .15s;
}
.btn-details:hover {
  border-color: var(--brand-accent);
  background: #f0f7f0;
  color: var(--brand-green);
}
</style>