<template>
  <header class="topbar">
  
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

</script>

<style scoped>
.topbar {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #ebebeb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
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
  max-width: 380px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b8b0;
  font-size: 12px;
  pointer-events: none;
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
  border-color: #52b788;
  box-shadow: 0 0 0 3px rgba(82,183,136,.12);
  background: #fff;
}

/* Right actions */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #f8f9f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: background .13s;
}
.icon-btn:hover { background: #f0f7f0; color: #1a3d1a; }
.notif-dot {
  width: 6px; height: 6px;
  background: #ef4444;
  border-radius: 50%;
  position: absolute;
  top: 5px; right: 5px;
  border: 1.5px solid #fff;
}

/* User chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 5px 3px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: background .13s;
}
.user-chip:hover { background: #f0f7f0; }

.user-info { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; }
.user-name  { font-size: 12px; font-weight: 700; color: #111827; }
.user-role  { font-size: 9.5px; color: #6b7280; letter-spacing: .3px; }

.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #1a3d2a;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: .5px;
}
</style>