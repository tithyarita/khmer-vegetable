<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header bg-success text-white p-4">
      <h5 class="mb-0">Logo</h5>
    </div>

    <!-- Menu Items -->
    <div class="sidebar-menu">
      <router-link 
        v-for="item in menuItems"
        :key="item.id"
        :to="item.route"
        class="menu-item p-3 d-flex align-items-center gap-3"
        :class="{ 'active': isActive(item.route) }"
      >
        <i :class="item.icon" class="menu-icon"></i>
        <span class="menu-label">{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = ref([
  { id: 1, icon: 'bi bi-speedometer2', label: 'Dashboard', route: '/provider-dashboard' },
  { id: 2, icon: 'bi bi-box-seam', label: 'Products', route: '/provider-products' },
  { id: 3, icon: 'bi bi-bag-check', label: 'Orders', route: '#' },
  { id: 4, icon: 'bi bi-graph-up', label: 'Revenue', route: '/provider-revenue' },
  { id: 5, icon: 'bi bi-gear', label: 'Setting', route: '/provider-profile' }
])

const isActive = (itemRoute) => {
  return route.path === itemRoute
}
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  background-color: #2d5016 !important;
  border-bottom: 1px solid #dee2e6;
  min-height: 70px;
  display: flex;
  align-items: center;
}

.sidebar-header h5 {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.menu-item {
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  color: #495057;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #2d5016;
}

.menu-item.active {
  background-color: #e8f5e9;
  border-left-color: #2d5016;
  color: #2d5016;
  font-weight: 600;
}

.menu-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }

  .sidebar-menu {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .menu-item {
    min-width: 120px;
    padding: 0.75rem 1rem !important;
    border-left: none;
    border-bottom: 4px solid transparent;
  }

  .menu-item:hover {
    border-bottom-color: #2d5016;
  }

  .menu-item.active {
    border-left: none;
    border-bottom-color: #2d5016;
  }

  .menu-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .menu-item {
    min-width: 100px;
    padding: 0.5rem 0.75rem !important;
  }

  .menu-label {
    font-size: 0.75rem;
  }

  .menu-icon {
    font-size: 1rem;
  }
}
</style>
