<template>
  <div>
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
      <!-- Header -->
      <div class="sidebar-header">
        <button class="back-btn" @click="goHome">
          <i class="bi bi-arrow-left"></i>
          <span>{{ t('back') }}</span>
        </button>
      </div>

      <!-- Menu Items -->
      <div class="sidebar-menu">
        <router-link 
          v-for="item in menuItems"
          :key="item.id"
          :to="item.route"
          class="menu-item"
          :class="{ 'active': isActive(item.route) }"
          @click="closeSidebarOnMobile"
        >
          <i :class="item.icon" class="menu-icon"></i>
          <span class="menu-label">{{ item.label }}</span>
        </router-link>
      </div>

      <!-- Logout Section -->
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <i class="bi bi-box-arrow-right menu-icon"></i>
          <span class="menu-label">{{ t('logout') }}</span>
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
import { ref, inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { t, languageStore } = useI18n()

// Get sidebar state from parent component via provide/inject
const isSidebarOpen = inject('isSidebarOpen', ref(false))
const closeSidebar = inject('closeSidebar', () => {})

const menuItems = computed(() => {
  languageStore.language
  return [
    { id: 1, icon: 'bi bi-speedometer2', label: t('dashboard'), route: '/profile' },
    { id: 2, icon: 'bi bi-bag-check', label: t('myOrders'), route: '/myorder' },
    { id: 3, icon: 'bi bi-truck', label: t('trackOrder'), route: '/order-tracker' },
  ]
})

const closeSidebarOnMobile = () => {
  // Close sidebar on mobile after clicking a menu item
  if (window.innerWidth < 992) {
    closeSidebar()
  }
}

const goHome = () => {
  router.push('/home')
}

const isActive = (itemRoute) => {
  return route.path === itemRoute
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
  // Scroll to top after navigation
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, 100)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 24px 0 0 0;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 0 20px;
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.back-btn:hover {
  color: #2D7A3A;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.menu-item {
  padding: 12px 32px;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.menu-item.active, .menu-item:hover {
  background: #eaf5ee;
  border-left: 4px solid #7ca982;
  color: #333;
}

.sidebar-footer {
  margin-top: auto;
  padding: 24px 32px;
}

.logout-btn {
  background: none;
  border: none;
  color: #e53;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
}

.logout-btn:hover {
  color: #c0392b;
}

.menu-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

@media (min-width: 992px) {
  .sidebar {
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

@media (max-width: 768px) {
  .sidebar {
    width: 230px;
  }

  .menu-item {
    padding: 10px 24px;
    font-size: 15px;
  }
}

@media (max-width: 576px) {
  .sidebar {
    width: 200px;
  }

  .menu-item {
    padding: 8px 20px;
    font-size: 14px;
  }

  .menu-icon {
    font-size: 1rem;
  }
}
</style>

