<template>
  <header class="admin-topbar">
    <!-- Search -->
    <div class="search-wrap">
      <i class="bi bi-search search-icon"></i>
      <input
        type="text"
        class="search-input"
        placeholder="Search orders, providers or skus..."
      />
    </div>

    <!-- Right actions -->
    <div class="topbar-actions">
      <button class="icon-btn" title="Upload">
        <i class="bi bi-upload"></i>
      </button>
      <button class="icon-btn" title="Notifications">
        <i class="bi bi-bell"></i>
        <span class="notif-dot"></span>
      </button>

      <div class="user-chip">
        <div class="user-info">
          <span class="user-name">Julian Moss</span>
          <span class="user-role">Head Administrator</span>
        </div>
        <div class="user-avatar">JM</div>
      </div>
    </div>
  </header>
</template>

<script setup></script>

<style scoped>
.admin-topbar {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #ebebeb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}

/* Search */
.search-wrap {
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
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 12px 0 30px;
  font-size: 12px;
  color: #374151;
  background: #f8f9f8;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.search-input:focus {
  border-color: #52b788;
  box-shadow: 0 0 0 3px rgba(82,183,136,.12);
  background: #fff;
}
.search-input::placeholder { color: #b0b8b0; }

/* Right side */
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