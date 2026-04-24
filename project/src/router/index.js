import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'
import ProviderProduct from '../views/Provider/ProviderProduct.vue'
import ProductDetail from '../views/Provider/ProductDetail.vue'
import ProviderRevenue from '../views/Provider/ProviderRevenue.vue'
import ProfileSetingProvider from '../views/Provider/ProfileSettingProvider.vue' 
import StaffLayout from '../Layout/StaffLayout.vue'
import DashboardView from '../views/Staff/Dashboardview .vue'
import ApplicationsView from '../views/Staff/Applicationsview.vue'
import ProfileView from '../views/Staff/Profile.vue'
import AdminLayout from '../Layout/AdminLayout.vue'
import DashboardOverview from '../views/Admin/admindashboard.vue'
import StaffManagement from '../views/Admin/StaffManagement.vue'
import ProviderManagement from '../views/Admin/ProviderManagement.vue'
import UserManagement from '../views/Admin/UserManagement.vue'
import ProductManagement from '../views/Admin/ProductManagement.vue'
import OrdersManagement from '../views/Admin/OrdersManagement.vue'
import Reports from '../views/Admin/Report.vue'
import AdminSetting from '../views/Admin/AdminSetting.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/provider-dashboard',
      name: 'providerDashboard',
      component: ProviderDashboard,
    },
    {
      path: '/provider-products',
      name: 'providerProducts',
      component: ProviderProduct,
    },
    {
      path: '/product-detail/:id',
      name: 'productDetail',
      component: ProductDetail,
    },
    {
      path: '/provider-revenue',
      name: 'providerRevenue',
      component: ProviderRevenue,
    },
    {
      path: '/provider-profile',
      name: 'providerProfile',
      component: ProfileSetingProvider,
    },
    {
      path: '/staff',
      component: StaffLayout,
      children: [
      { path: 'dashboard',    component: DashboardView,    name: 'Dashboard' },
      { path: 'applications', component: ApplicationsView, name: 'Applications' },
      { path: 'profile',      component: ProfileView,      name: 'Profile' },
      ]
    },
    {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '',          redirect: '/admin/dashboard'                          },
      { path: 'dashboard', component: DashboardOverview, name: 'AdminDashboard' },
      { path: 'staff',     component: StaffManagement,         name: 'AdminStaff'     },
      { path: 'providers', component: ProviderManagement,         name: 'AdminProviders' },
      { path: 'users',     component: UserManagement,         name: 'AdminUsers'     },
      { path: 'products',  component: ProductManagement,         name: 'AdminProducts'  },
      { path: 'orders',    component: OrdersManagement,         name: 'AdminOrders'    },
      { path: 'reports',   component: Reports,         name: 'AdminReports'   },
      { path: 'settings',  component: AdminSetting,         name: 'AdminSettings'  },
    ]
    },
  ],
})

export default router
