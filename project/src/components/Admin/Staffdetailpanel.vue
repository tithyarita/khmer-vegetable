<template>
  <!--
    StaffDetailPanel
    Props: member – staff object (or null = empty state)
  -->
  <div v-if="!member" class="empty-state">
    <i class="bi bi-person-bounding-box"></i>
    <p>Select a staff member to view details</p>
  </div>

  <div v-else class="detail-col">

    <!-- ① Profile card -->
    <div class="profile-card">
      <div class="profile-bg"></div>
      <div class="profile-body">
        <div class="profile-avatar">
          <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
          <span v-else class="avatar-initials">{{ initials(member.name) }}</span>
        </div>
        <p class="profile-name">{{ member.name }}</p>
        <p class="profile-email">{{ member.email }}</p>

        <div class="profile-badges">
          <div class="profile-badge-item">
            <span class="badge-label">ROLE</span>
            <span class="badge-value">{{ member.role }}</span>
          </div>
          <div class="profile-badge-item profile-badge-item--status">
            <span class="badge-label">STATUS</span>
            <span class="badge-value">{{ member.statusLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ② Daily Activity Summary -->
    <div class="panel-card">
      <div class="panel-title-row">
        <i class="bi bi-calendar2-check panel-icon"></i>
        <h3 class="panel-title">Daily Activity Summary</h3>
      </div>

      <div class="activity-items">
        <div class="activity-row">
          <div class="activity-text">
            <span class="activity-label">Last Login</span>
            <span class="activity-value">{{ member.lastLogin }}</span>
          </div>
          <i class="bi bi-box-arrow-in-right activity-icon"></i>
        </div>
        <div class="activity-row">
          <div class="activity-text">
            <span class="activity-label">Managed Orders</span>
            <span class="activity-value">{{ member.managedOrders }}</span>
          </div>
          <i class="bi bi-bag-check activity-icon"></i>
        </div>
        <div class="activity-row" style="border-bottom:none">
          <div class="activity-text">
            <span class="activity-label">Permission Level</span>
            <span class="activity-value">{{ member.permissionLevel }}</span>
          </div>
          <i class="bi bi-shield-check activity-icon"></i>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="logs-section">
        <p class="logs-label">RECENT LOGS</p>
        <ul class="logs-list">
          <li v-for="(log, i) in member.recentLogs" :key="i" class="log-item">
            <span class="log-dot"></span>
            <span>{{ log }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- ③ Security Management -->
    <div class="security-card">
      <div class="security-icon-wrap">
        <i class="bi bi-shield-lock"></i>
      </div>
      <p class="security-title">Security Management</p>
      <p class="security-sub">Force password reset or revoke all active sessions for this staff member.</p>
      <div class="security-actions">
        <button class="btn-reset">Reset Password</button>
        <button class="btn-revoke">Revoke Access</button>
      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  member: { type: Object, default: null }
})

function initials(name) {
  return name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() ?? '??'
}
</script>

<style scoped>
/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 300px; color: #d1d5db; gap: 10px;
}
.empty-state i { font-size: 40px; }
.empty-state p { font-size: 13px; }

/* Detail column */
.detail-col { display: flex; flex-direction: column; gap: 14px; }

/* ① Profile card */
.profile-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.profile-bg {
  height: 70px;
  background: linear-gradient(135deg, #1a3d2a 0%, #2d6a4f 60%, #52b788 100%);
}
.profile-body { padding: 0 20px 20px; }

.profile-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: #2d6a4f;
  border: 3px solid #fff;
  margin-top: -30px; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { font-size: 18px; font-weight: 800; color: #fff; }

.profile-name  { font-size: 16px; font-weight: 800; color: #111827; }
.profile-email { font-size: 11.5px; color: #6b7280; margin-top: 2px; margin-bottom: 14px; }

.profile-badges { display: flex; gap: 8px; }
.profile-badge-item {
  flex: 1; background: #1a3d2a; border-radius: 9px;
  padding: 8px 12px; display: flex; flex-direction: column; gap: 3px;
}
.profile-badge-item--status { background: #2d6a4f; }
.badge-label { font-size: 8.5px; font-weight: 700; letter-spacing: .6px; color: #a8c8b0; text-transform: uppercase; }
.badge-value { font-size: 12px; font-weight: 700; color: #fff; }

/* ② Activity panel */
.panel-card {
  background: #fff; border: 1px solid #eaeaea;
  border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.panel-title-row {
  display: flex; align-items: center; gap: 7px;
  margin-bottom: 14px;
}
.panel-icon  { font-size: 15px; color: #2d6a4f; }
.panel-title { font-size: 13.5px; font-weight: 700; color: #111827; }

.activity-items { display: flex; flex-direction: column; }
.activity-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 0; border-bottom: 1px solid #f3f4f3;
}
.activity-text { display: flex; flex-direction: column; gap: 3px; }
.activity-label { font-size: 10.5px; color: #9ca3af; font-weight: 500; }
.activity-value { font-size: 13.5px; font-weight: 700; color: #111827; }
.activity-icon  { font-size: 16px; color: #d1d5db; }

/* Logs */
.logs-section { margin-top: 14px; }
.logs-label {
  font-size: 9.5px; font-weight: 800; letter-spacing: .6px;
  color: #9ca3af; margin-bottom: 8px;
}
.logs-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.log-item {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 11.5px; color: #374151; line-height: 1.4;
}
.log-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #2d6a4f; flex-shrink: 0; margin-top: 4px;
}

/* ③ Security card */
.security-card {
  background: #fff; border: 1px solid #eaeaea;
  border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  text-align: center;
}
.security-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #6b7280;
  margin: 0 auto 10px;
}
.security-title { font-size: 13.5px; font-weight: 700; color: #111827; }
.security-sub   { font-size: 11px; color: #9ca3af; margin-top: 4px; line-height: 1.5; }
.security-actions {
  display: flex; gap: 8px; margin-top: 14px;
}
.btn-reset {
  flex: 1; padding: 8px;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  background: #fff; font-size: 12px; font-weight: 600; color: #374151;
  cursor: pointer; transition: background .12s;
}
.btn-reset:hover { background: #f3f4f6; }
.btn-revoke {
  flex: 1; padding: 8px;
  border: 1.5px solid #fee2e2; border-radius: 8px;
  background: #fff; font-size: 12px; font-weight: 600; color: #b91c1c;
  cursor: pointer; transition: background .12s;
}
.btn-revoke:hover { background: #fef2f2; }
</style>