<template>
  <div class="admin-shell">
    <AdminSidebar />

    <div class="content-col">
      <AdminTopBar />

      <main class="page-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '../components/Admin/SideBar.vue'
import AdminTopBar  from '../components/Admin/TopBar.vue'
</script>

<style scoped>
.chrome-bar {
  height: 22px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 14px;
}
.chrome-label {
  font-size: 10.5px;
  color: #aaa;
  letter-spacing: .3px;
}

.admin-shell {
  display: flex;
  height: calc(100vh - 22px);
  overflow: hidden;
  background: #f3f4f3;
}

.content-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-area {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px 40px;
  background: #f3f4f3;
}
</style>