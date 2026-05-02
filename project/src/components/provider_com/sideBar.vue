<template>
  <div>
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
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
          @click="closeSidebarOnMobile"
        >
          <i :class="item.icon" class="menu-icon"></i>
          <span class="menu-label">{{ item.label }}</span>
        </router-link>
      </div>

      <!-- Logout Section -->
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn p-3 d-flex align-items-center gap-3 w-100">
          <i class="bi bi-box-arrow-right menu-icon"></i>
          <span class="menu-label">Logout</span>
        </button>
      </div>
    </div>

    <!-- Sidebar Backdrop (Mobile) -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-backdrop d-lg-none" 
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Get sidebar state from parent component via provide/inject
const isSidebarOpen = inject('isSidebarOpen', ref(false))
const closeSidebar = inject('closeSidebar', () => {})

const menuItems = ref([
  { id: 1, icon: 'bi bi-speedometer2', label: 'Dashboard', route: '/provider/dashboard' },
  { id: 2, icon: 'bi bi-box-seam', label: 'Products', route: '/provider/products' },
  { id: 3, icon: 'bi bi-bag-check', label: 'Orders', route: '/provider/orders' },
  { id: 4, icon: 'bi bi-graph-up', label: 'Revenue', route: '/provider/revenue' },
  { id: 5, icon: 'bi bi-person', label: 'Profile', route: '/provider/profile' }
])

const closeSidebarOnMobile = () => {
  // Close sidebar on mobile after clicking a menu item
  if (window.innerWidth < 992) {
    closeSidebar()
  }
}

const isActive = (itemRoute) => {
  return route.path === itemRoute
}

const handleLogout = () => {
  // Clear any stored authentication data
  localStorage.removeItem('authToken')
  localStorage.removeItem('userRole')
  sessionStorage.clear()
  
  // Navigate to login page
  router.push('/')
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
  transition: all 0.3s ease;
}

/* Mobile: Sidebar as offcanvas */
@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 260px;
    z-index: 1050;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar.sidebar-closed {
    transform: translateX(-100%);
  }
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.sidebar-header {
  background-color: #2d5016 !important;
  border-bottom: 1px solid #dee2e6;
  min-height: 70px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header h5 {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  margin-left: 15px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.sidebar-footer {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
  flex-shrink: 0;
  padding: 0;
}

.logout-btn {
  cursor: pointer;
  border-left: 4px solid transparent;
  background-color: transparent;
  transition: all 0.3s ease;
  color: #495057;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  padding: 0.75rem 1rem !important;
  border: none;
  width: 100%;
}

.logout-btn:hover {
  background-color: #e9ecef;
  color: #2d5016;
  border-left-color: #2d5016;
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

/* Desktop: Normal sidebar (lg and up) */
@media (min-width: 992px) {
  .sidebar {
    width: 250px;
    position: static;
    transform: none !important;
  }

  .sidebar-open,
  .sidebar-closed {
    transform: none !important;
  }

  .sidebar-backdrop {
    display: none !important;
  }
}

/* Small adjustments for smaller tablets */
@media (max-width: 768px) {
  .sidebar {
    width: 230px;
  }

  .sidebar-header h5 {
    font-size: 1.1rem;
    margin-left: 10px;
  }

  .menu-item {
    padding: 0.6rem 1rem !important;
    font-size: 0.95rem;
  }

  .menu-icon {
    font-size: 1.1rem;
  }
}

/* Phone sizes */
@media (max-width: 576px) {
  .sidebar {
    width: 200px;
  }

  .sidebar-header h5 {
    font-size: 1rem;
  }

  .menu-item {
    padding: 0.5rem 0.8rem !important;
    font-size: 0.9rem;
  }

  .menu-icon {
    font-size: 1rem;
  }
}
</style>

