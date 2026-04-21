<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header bg-success text-white p-4">
      <h5 class="mb-0">Logo</h5>
    </div>

    <!-- Menu Items -->
    <div class="sidebar-menu">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item p-3 d-flex align-items-center gap-3"
        :class="{ 'active': item.id === activeMenu }"
        @click="activeMenu = item.id"
      >
        <i :class="item.icon" class="menu-icon"></i>
        <span class="menu-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeMenu = ref(1)

const menuItems = ref([
  { id: 1, icon: 'bi bi-speedometer2', label: 'Dashboard' },
  { id: 2, icon: 'bi bi-box-seam', label: 'Products' },
  { id: 3, icon: 'bi bi-bag-check', label: 'Orders' },
  { id: 4, icon: 'bi bi-graph-up', label: 'Revenue' },
  { id: 5, icon: 'bi bi-gear', label: 'Setting' }
])
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  min-height: 100vh;
  width: 100%;
}

.sidebar-header {
  background-color: #2d5016 !important;
  border-bottom: 1px solid #dee2e6;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
}

.menu-item {
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  color: #495057;
  font-weight: 500;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #2d5016;
}

.menu-item.active {
  background-color: #e8f5e9;
  border-left-color: #2d5016;
  color: #2d5016;
}

.menu-icon {
  font-size: 1.3rem;
}

.menu-label {
  white-space: nowrap;
}
</style>
