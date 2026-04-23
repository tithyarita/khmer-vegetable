<template>
  <aside class="admin-sidebar">
    <!-- Brand label -->
    <div class="sidebar-label">ADMIN CONSOLE</div>

    <!-- Nav items -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
      >
        <i :class="['bi', item.icon, 'nav-icon']"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
  { to: '/admin/staff',     label: 'Staff',     icon: 'bi-person-badge'  },
  { to: '/admin/providers', label: 'Providers', icon: 'bi-shop'          },
  { to: '/admin/users',     label: 'Users',     icon: 'bi-people'        },
  { to: '/admin/products',  label: 'Products',  icon: 'bi-box-seam'      },
  { to: '/admin/orders',    label: 'Orders',    icon: 'bi-cart3'         },
  { to: '/admin/reports',   label: 'Reports',   icon: 'bi-bar-chart-line'},
  { to: '/admin/settings',  label: 'Settings',  icon: 'bi-gear'          },
]
</script>

<style scoped>
.admin-sidebar {
  width: 180px;
  min-width: 180px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* "ADMIN CONSOLE" label */
.sidebar-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #a0a8a0;
  text-transform: uppercase;
  padding: 18px 16px 10px;
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  color: #5a6a5a;
  transition: background .13s, color .13s;
  text-decoration: none;
}
.nav-item:hover {
  background: #f0f7f0;
  color: #1a3d1a;
}
.nav-item--active {
  background: #e6f3e6;
  color: #1a3d1a;
  font-weight: 700;
}
.nav-icon { font-size: 14px; flex-shrink: 0; }
</style>