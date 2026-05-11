import { createRouter, createWebHistory } from 'vue-router'

// ==================== Layouts ====================
import StaffLayout from '../Layout/StaffLayout.vue'
import AdminLayout from '../Layout/AdminLayout.vue'

// ==================== Public ====================
import HomeView from '../views/User/HomeView.vue'
import CartView from '../views/User/CartView.vue'
import FavoritesView from '../views/User/FavoritesView.vue'
import fashDeals  from '../views/User/fashDeals.vue'
import MyOrder  from '../views/User/MyOrder.vue'
import Receipt from '../views/User/ReceiptView.vue'
import Address from '../views/User/AddressView.vue'
import Checkout from '../views/User/CheckoutView.vue'
import Profile from '../views/User/UserDashboard.vue'


// ==================== Provider ====================
import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'
import ProviderProduct from '../views/Provider/ProviderProduct.vue'
import ProductDetail from '../views/Provider/ProductDetail.vue'
import ProfileSettingProvider from '../views/Provider/ProfileSettingProvider.vue'
import ProviderRevenue from '../views/Provider/ProviderRevenue.vue'
import ProviderOrders from '../views/Provider/ProviderOrders.vue'

// ==================== Staff ====================
import DashboardView from '../views/Staff/Dashboardview.vue'
import ApplicationsView from '../views/Staff/Applicationsview.vue'
import ProfileView from '../views/Staff/Profile.vue'
import ApplicationDetailsView from '../views/Staff/ProviderReviewDetail.vue'

// ==================== Admin ====================
import AdminDashboard from '../views/Admin/admindashboard.vue'
import StaffManagement from '../views/Admin/StaffManagement.vue'
import ProviderManagement from '../views/Admin/ProviderManagement.vue'
import UserManagement from '../views/Admin/UserManagement.vue'
import ProductManagement from '../views/Admin/ProductManagement.vue'
import OrdersManagement from '../views/Admin/OrdersManagement.vue'
import Reports from '../views/Admin/Report.vue'
import AdminSetting from '../views/Admin/AdminSetting.vue'

// // ==================== Auth ====================
// import UserRegister from '../views/User/resgister.vue'
// import UserLogin from '../views/User/login.vue'

// ==================== Routes ====================
const routes = [
  // -------- Public --------
  {
    path: '/',
    component: () => import('../Layout/CustomerLayout.vue'),
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: HomeView },
      { path: 'cart', name: 'Cart', component: CartView },
      { path: 'favorites', name: 'Favorites', component: FavoritesView },
      { path: 'about', name: 'About', component: () => import('../views/User/AboutView.vue') },
      { path: 'Address', name: 'Address', component: Address },
      { path: 'MyOrder', name: 'MyOrder', component: MyOrder },
      { path: 'Receipt', name: 'Receipt', component: Receipt },
      { path: 'fashDeals', name: 'FashDeals', component: fashDeals },
      { path: 'checkout', name: 'Checkout', component: Checkout },
      { path: 'profile', name: 'Profile', component: Profile },

    ],
  },

  // -------- Provider --------
  {
    path: '/provider',
    // If you have a ProviderLayout, add: component: ProviderLayout,
    // component: ProviderLayout,
    redirect: '/provider/dashboard',
    children: [
      { path: 'dashboard', name: 'ProviderDashboard', component: ProviderDashboard },
      { path: 'orders', name: 'ProviderOrders', component: ProviderOrders },
      { path: 'products', name: 'ProviderProducts', component: ProviderProduct },
      { path: 'revenue', name: 'ProviderRevenue', component: ProviderRevenue },
      { path: 'profile', name: 'ProviderProfile', component: ProfileSettingProvider },
      { path: 'product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
    ],
  },

  // -------- Staff --------
  {
    path: '/staff',
    component: StaffLayout,
    children: [
      { path: '', redirect: '/staff/dashboard' },
      { path: 'dashboard', component: DashboardView },
      { path: 'applications', component: ApplicationsView },
      { path: 'details', component: ApplicationDetailsView },
      { path: 'profile', component: ProfileView },
    ],
  },

  // -------- Admin --------
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
    ],
  },

  // -------- Auth --------
  { path: '/user/login', name: 'Login', component: () => import('../views/User/login.vue') },
  // { path: '/user/register', name: 'Register', component: () => import('../views/User/resgister.vue') },
]

// ==================== Router ====================

const router = createRouter({
  history: createWebHistory(),
  routes,
})



// Global navigation guard for role-based dashboard access
router.beforeEach((to, from) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Protect admin routes
  if (to.path.startsWith('/admin')) {
    if (!user || !token || user.role !== 'admin') {
      return { path: '/user/login', query: { redirect: to.fullPath } }
    }
  }
  // Protect provider routes
  if (to.path.startsWith('/provider')) {
    if (!user || !token || user.role !== 'provider') {
      return { path: '/user/login', query: { redirect: to.fullPath } }
    }
  }
  // Allow navigation
  return true
});

export default router
