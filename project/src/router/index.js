import { createRouter, createWebHistory } from 'vue-router'

// ==================== Layouts ====================
import StaffLayout from '../Layout/StaffLayout.vue'
import AdminLayout from '../Layout/AdminLayout.vue'

// ==================== Admin ====================
import AdminDashboard from '../views/Admin/admindashboard.vue'
import StaffManagement from '../views/Admin/StaffManagement.vue'
import ProviderManagement from '../views/Admin/ProviderManagement.vue'
import UserManagement from '../views/Admin/UserManagement.vue'
import ProductManagement from '../views/Admin/ProductManagement.vue'
import OrdersManagement from '../views/Admin/OrdersManagement.vue'
import Reports from '../views/Admin/Report.vue'
import AdminSetting from '../views/Admin/AdminSetting.vue'
import AdminProfile from '../views/Admin/AdminProfile.vue'

// ==================== Provider ====================
import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'
import ProviderProduct from '../views/Provider/ProviderProduct.vue'
import ProviderRevenue from '../views/Provider/ProviderRevenue.vue'
import ProviderOrders from '../views/Provider/ProviderOrders.vue'
import ProfileSettingProvider from '../views/Provider/ProfileSettingProvider.vue'
import ProductDetail from '../views/Provider/ProductDetail.vue'
import Providerapplicationform from '@/views/Provider/Providerapplicationform.vue'

// ==================== Staff ====================
import DashboardView from '../views/Staff/Dashboardview.vue'
import ApplicationsView from '../views/Staff/Applicationsview.vue'
import ProfileView from '../views/Staff/Profile.vue'
import ApplicationDetailsView from '../views/Staff/ProviderReviewDetail.vue'

// ==================== Public ====================
import HomeView from '../views/User/HomeView.vue'
import CartView from '../views/User/CartView.vue'
import FavoritesView from '../views/User/FavoritesView.vue'
import MyOrder from '../views/User/MyOrder.vue'
import Receipt from '../views/User/ReceiptView.vue'
import Address from '../views/User/AddressView.vue'
import Checkout from '../views/User/CheckoutView.vue'
import Profile from '../views/User/UserDashboard.vue'
import OrderTracker from '../views/User/OrderTracker.vue'
import ProductDetailUser from '../views/User/ProductDetail.vue'
import Search from '../components/Customer/Search.vue'
import ProductList from '../components/Customer/Productlist.vue'
import fashDeals from '../views/User/fashDeals.vue'

// ==================== Routes ====================
const routes = [
  // PUBLIC
  {
    path: '/',
    component: () => import('../Layout/CustomerLayout.vue'),
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', component: HomeView },
      { path: 'cart', component: CartView },
      { path: 'favorites', component: FavoritesView },
      { path: 'about', component: () => import('../views/User/AboutView.vue') },
      { path: 'address', component: Address },
      { path: 'myorder', component: MyOrder },
      { path: 'receipt', component: Receipt },
      { path: 'fashDeals', component: fashDeals },
      { path: 'checkout', component: Checkout },
      { path: 'profile', component: Profile },
      { path: 'search', component: Search },
      { path: 'order-tracker', component: OrderTracker },
      { path: 'product/:id', component: ProductDetailUser, props: true },
      { path: 'products', component: ProductList },
    ],
  },

  // PROVIDER
  {
    path: '/provider',
    redirect: '/provider/dashboard',
    children: [
      { path: 'dashboard', component: ProviderDashboard },
      { path: 'orders', component: ProviderOrders },
      { path: 'products', component: ProviderProduct },
      { path: 'revenue', component: ProviderRevenue },
      { path: 'profile', component: ProfileSettingProvider },
      { path: 'product/:id', component: ProductDetail, props: true },
    ],
  },

  // STAFF
  {
    path: '/staff',
    component: StaffLayout,
    children: [
      { path: '', redirect: '/staff/dashboard' },
      { path: 'dashboard', component: DashboardView },
      { path: 'applications', component: ApplicationsView },
      { path: 'details/:id', component: ApplicationDetailsView, props: true },
      { path: 'profile', component: ProfileView },
    ],
  },

  // ADMIN
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'staff', component: StaffManagement },
      { path: 'providers', component: ProviderManagement },
      { path: 'users', component: UserManagement },
      { path: 'products', component: ProductManagement },
      { path: 'orders', component: OrdersManagement },
      { path: 'reports', component: Reports },
      { path: 'settings', component: AdminSetting },
      { path: 'profile', component: AdminProfile },
    ],
  },

  // PROVIDER APPLICATION
  { path: '/application-form', component: Providerapplicationform },

  // AUTH
  { path: '/user/login', component: () => import('../views/User/login.vue') },
  { path: '/user/register', component: () => import('../views/User/resgister.vue') },
  { path: '/provider/login', component: () => import('../views/Provider/login.vue') },
  
  // AUTH ALIASES
  { path: '/login', redirect: '/user/login' },
  { path: '/register', redirect: '/user/register' },
]

// ==================== ROUTER ====================
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ==================== GLOBAL GUARD (FIXED) ====================
router.beforeEach((to, from) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const role = user?.role?.trim()?.toLowerCase()

  // NOT LOGGED IN
  if ((to.path.startsWith('/admin') || to.path.startsWith('/provider')) && !token) {
    return `/user/login?redirect=${to.fullPath}`
  }

  // ADMIN PROTECTION
  if (to.path.startsWith('/admin')) {
    if (!user || role !== 'admin') {
      return `/user/login?redirect=${to.fullPath}`
    }
  }

  // PROVIDER PROTECTION
  if (to.path.startsWith('/provider')) {
    if (!user || role !== 'provider') {
      return `/user/login?redirect=${to.fullPath}`
    }
  }

  // Allow navigation
  return true
})

export default router