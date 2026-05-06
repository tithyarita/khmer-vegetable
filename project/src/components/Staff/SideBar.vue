<template>
  <aside class="sidebar">

    <div class="brand-name">STAFF CONSOLE</div>

    <!-- Primary nav -->
    <nav class="sidebar-nav">
      <router-link to="/staff/dashboard"    class="nav-item" active-class="nav-item--active">
        <i class="bi bi-grid-1x2-fill nav-icon"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/staff/applications" class="nav-item" active-class="nav-item--active">
        <i class="bi bi-file-earmark-text nav-icon"></i>
        <span>Applications</span>
      </router-link>
      <router-link to="/staff/profile"      class="nav-item" active-class="nav-item--active">
        <i class="bi bi-person-circle nav-icon"></i>
        <span>Profile</span>
      </router-link>
    </nav>

    <!-- Bottom utilities -->
    <div class="sidebar-footer">
      <a href="#" class="nav-item">
        <i class="bi bi-gear nav-icon"></i>
        <span>Settings</span>
      </a>
      <a href="#" class="nav-item">
        <i class="bi bi-question-circle nav-icon"></i>
        <span>Help</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
</script>

<style scoped>
.sidebar {
  width: 180px;
  min-width: 180px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.brand-name {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #a0a8a0;
  text-transform: uppercase;
  padding: 18px 16px 10px;
}
.brand-sub {
  font-size: 10.5px;
  color: #7a9e7a;
  line-height: 1;
  margin-top: 1px;
}

/* ── Nav ── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 8px;
}
.sidebar-footer {
  padding: 10px 10px 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  color: #5a6a5a;
  transition: background .13s, color .13s;
  text-decoration: none;
}
.nav-item:hover {
  background: #f0f7f0;
  color: #1a3d1a;
}
.nav-item--active {
  background: #e6f3e6;
  color: #1a3d1a;
  font-weight: 700;
}
.nav-icon { font-size: 14px; flex-shrink: 0; }
</style>