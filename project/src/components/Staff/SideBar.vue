<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <i class="bi bi-tree-fill"></i>
      </div>
      <div>
        <p class="brand-name">The Greenhouse</p>
        <p class="brand-sub">Staff Portal</p>
      </div>
    </div>

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
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100%;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 18px;
  border-bottom: 1px solid var(--sidebar-border);
}
.brand-icon {
  width: 34px;
  height: 34px;
  background: var(--brand-green);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}
.brand-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-dark);
  line-height: 1.2;
}
.brand-sub {
  font-size: 10.5px;
  color: #7a9e7a;
  line-height: 1;
  margin-top: 1px;
}

/* ── Nav ── */
.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sidebar-footer {
  padding: 10px 10px 16px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--nav-text);
  transition: background .15s, color .15s;
  cursor: pointer;
}
.nav-item:hover {
  background: var(--nav-hover-bg);
  color: var(--brand-green);
}
.nav-item--active {
  background: var(--nav-active-bg);
  color: var(--nav-active-text);
  font-weight: 600;
}
.nav-icon {
  font-size: 15px;
  flex-shrink: 0;
}
</style>