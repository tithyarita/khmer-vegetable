import { createRouter, createWebHistory } from 'vue-router'




// Public

import HomeView from '../views/HomeView.vue'
import CartView from '../views/CartView.vue'
import FavoritesView from '../views/FavoritesView.vue'

// Provider

import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'

import ProviderProduct from '../views/Provider/ProviderProduct.vue'

import ProductDetail from '../views/Provider/ProductDetail.vue'

import ProfileSettingProvider from '../views/Provider/ProfileSettingProvider.vue'

import ProviderRevenue from '../views/Provider/ProviderRevenue.vue' 

import StaffLayout from '../Layout/StaffLayout.vue'

import DashboardView from '../views/Staff/Dashboardview.vue'

import ApplicationsView from '../views/Staff/Applicationsview.vue'

import ProfileView from '../views/Staff/Profile.vue'

import ApllicationDetailsView from '../views/Staff/ProviderReviewDetail.vue'

// Admin

import AdminLayout from '../Layout/AdminLayout.vue'

import AdminDashboard from '../views/Admin/admindashboard.vue'

import StaffManagement from '../views/Admin/StaffManagement.vue'

import ProviderManagement from '../views/Admin/ProviderManagement.vue'

import UserManagement from '../views/Admin/UserManagement.vue'

import ProductManagement from '../views/Admin/ProductManagement.vue'

import OrdersManagement from '../views/Admin/OrdersManagement.vue'

import Reports from '../views/Admin/Report.vue'

import AdminSetting from '../views/Admin/AdminSetting.vue'



// User (Auth)

import UserRegister from '../views/User/resgister.vue'

import UserLogin from '../views/User/login.vue'



const router = createRouter({

  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [

    // Public

    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView,
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: FavoritesView,
    },


    // Provider

    {

      path: '/provider-dashboard',

      name: 'ProviderDashboard',

      component: ProviderDashboard,

    },

    {

      path: '/provider-products',

      name: 'ProviderProducts',

      component: ProviderProduct,

    },

    {

      path: '/product-detail/:id',

      name: 'ProductDetail',

      component: ProductDetail,

      props: true,

    },

    {

      path: '/provider-revenue',

      name: 'ProviderRevenue',

      component: ProviderRevenue,

    },

    {

      path: '/provider-profile',

      name: 'ProviderProfile',

      component: ProfileSettingProvider,

    },

    {

      path: '/staff',

      component: StaffLayout,

      children: [

        {

          path: '',

          redirect: '/staff/dashboard',

        },

        {

          path: 'dashboard',

          name: 'StaffDashboard',

          component: DashboardView,

        },

        {

          path: 'applications',

          name: 'Applications',

          component: ApplicationsView,

        },

        {
          path: 'details',

          name: 'ApplicationDetails',
              
          component: ApllicationDetailsView,

        },
        
        {

          path: 'profile',

          name: 'StaffProfile',

          component: ProfileView,

        },

      ],

    },



    // Admin

    {

      path: '/admin',

      component: AdminLayout,

      children: [

        {

          path: '',

          redirect: '/admin/dashboard',

        },

        {

          path: 'dashboard',

          name: 'AdminDashboard',

          component: AdminDashboard,

        },

        {

          path: 'staff',

          name: 'AdminStaff',

          component: StaffManagement,

        },

        {

          path: 'providers',

          name: 'AdminProviders',

          component: ProviderManagement,

        },

        {

          path: 'users',

          name: 'AdminUsers',

          component: UserManagement,

        },

        {

          path: 'products',

          name: 'AdminProducts',

          component: ProductManagement,

        },

        {

          path: 'orders',

          name: 'AdminOrders',

          component: OrdersManagement,

        },

        {

          path: 'reports',

          name: 'AdminReports',

          component: Reports,

        },

        {

          path: 'settings',

          name: 'AdminSettings',

          component: AdminSetting,

        },

      ],

    },



    // User (Auth)

    {

      path: '/user/register',

      name: 'UserRegister',

      component: UserRegister,

    },

    {

      path: '/user/login',

      name: 'UserLogin',

      component: UserLogin,

    },

  ],

})



export default router