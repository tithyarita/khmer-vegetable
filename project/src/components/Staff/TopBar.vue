<template>
  <header class="topbar">
    <!-- Left: breadcrumb / page title -->
    <span class="topbar-breadcrumb">{{ breadcrumb }}</span>

    <!-- Centre: search -->
    <div class="topbar-search">
      <i class="bi bi-search search-icon"></i>
      <input type="text" placeholder="Search marketplace..." class="search-input" />
    </div>

    <!-- Right: bell + user -->
    <div class="topbar-actions">
      <button class="icon-btn" aria-label="Notifications">
        <i class="bi bi-bell"></i>
        <span class="notif-dot"></span>
      </button>

      <div class="user-chip">
        <div class="user-info">
          <span class="user-name">Alex Rivera</span>
          <span class="user-role">ADMINISTRATOR</span>
        </div>
        <div class="user-avatar">
          <i class="bi bi-person-fill"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  breadcrumb: { type: String, default: 'Staff Portal' }
})
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  flex-shrink: 0;
}

/* Breadcrumb */
.topbar-breadcrumb {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-dark);
  white-space: nowrap;
  min-width: 130px;
}

/* Search */
.topbar-search {
  flex: 1;
  max-width: 320px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 13px;
}
.search-input {
  width: 100%;
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px 0 30px;
  font-size: 12.5px;
  color: #374151;
  background: #f9fafb;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.search-input:focus {
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(82,183,136,.15);
  background: #fff;
}

/* Right actions */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: background .15s;
}
.icon-btn:hover { background: #f0f7f0; color: var(--brand-green); }

.notif-dot {
  width: 7px;
  height: 7px;
  background: #ef4444;
  border-radius: 50%;
  position: absolute;
  top: 6px;
  right: 6px;
  border: 1.5px solid #fff;
}

/* User chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  cursor: pointer;
  transition: background .15s;
}
.user-chip:hover { background: #f0f7f0; }

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}
.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1f2937;
}
.user-role {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .5px;
  color: #6b7280;
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--brand-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}
</style>