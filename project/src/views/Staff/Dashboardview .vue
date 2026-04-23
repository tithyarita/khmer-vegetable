<template>
  <div class="dashboard">
    <!-- Page heading -->
    <div class="page-heading">
      <h1 class="page-title">Staff Dashboard</h1>
      <p class="page-sub">Manage incoming vendor requests and portal status.</p>
    </div>

    <!-- ── Stats row: 4 × StatsCard ── -->
    <div class="stats-row">
      <StatsCard
        label="Total Forms"
        :value="128"
        icon="bi-archive"
        badgeText="12% this week"
        badgeType="success"
        valueColor="var(--brand-dark)"
      />
      <StatsCard
        label="Pending Review"
        :value="42"
        icon="bi-clipboard-check"
        badgeText="Action required"
        badgeType="warning"
        valueColor="#1a2e1a"
      />
      <StatsCard
        label="Staff Approved"
        :value="892"
        icon="bi-patch-check"
        badgeText="Lifetime total"
        badgeType="neutral"
        valueColor="#14532d"
      />
      <StatsCard
        label="Rejected"
        :value="350"
        icon="bi-slash-circle"
        badgeText="-2% last week"
        badgeType="danger"
        valueColor="#7f1d1d"
      />
    </div>

    <!-- ── Recent Applications table ── -->
    <RecentApplicationsTable
      class="mt-4"
      @view-all="$router.push('/applications')"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import StatsCard               from '../../components/Staff/StateCard.vue'
import RecentApplicationsTable from '../../components/Staff/Recentapplicationstable.vue'

const router = useRouter()
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 0; }

.page-heading { margin-bottom: 24px; }
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--brand-dark);
  letter-spacing: -.4px;
}
.page-sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* Stats row: 4 cards side by side */
.stats-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
</style>