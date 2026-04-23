<template>


  <!-- Main shell: sidebar | content column -->
  <div class="app-shell">
    <!-- ① Sidebar -->
    <AppSidebar />

    <!-- ② Right column: topbar + page content -->
    <div class="content-column">
      <AppTopBar :breadcrumb="breadcrumb" />

      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/Staff/SideBar.vue'
import AppTopBar  from '../components/Staff/TopBar.vue'

const route = useRoute()

const labels = {
  Dashboard:    { chrome: 'Staff dashboardOverview', breadcrumb: 'Organic Editorial' },
  Applications: { chrome: 'Staff Application dashboard', breadcrumb: 'Staff Portal' },
  Profile:      { chrome: 'Staff Profile', breadcrumb: 'Staff Portal' },
}

const currentPageLabel = computed(() => labels[route.name]?.chrome ?? 'Staff Portal')
const breadcrumb       = computed(() => labels[route.name]?.breadcrumb ?? 'Staff Portal')
</script>

<style scoped>
.chrome-label {
  font-size: 11px;
  color: #aaa;
  letter-spacing: .3px;
}

/* Two-column shell */
.app-shell {
  display: flex;
  height: calc(100vh - 24px);
  overflow: hidden;
}

/* Right side grows to fill */
.content-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Scrollable page area */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
  background: var(--page-bg);
}
</style>