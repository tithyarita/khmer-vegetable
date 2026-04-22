import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'
import ProviderProduct from '../views/Provider/ProviderProduct.vue'
import ProviderRevenue from '../views/Provider/ProviderRevenue.vue'
<<<<<<< HEAD
import ProviderProfileSetting from '../views/Provider/ProfileSettingProvider.vue'
=======
import Login from '../views/User/login.vue'
import Register from '../views/User/resgister.vue'
>>>>>>> 81e710de5e2023413646b16bc020a33bc8b04ea5

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
      path: '/provider-revenue',
      name: 'providerRevenue',
      component: ProviderRevenue,
    },
    {
<<<<<<< HEAD
      path: '/provider-profile-setting',
      name: 'providerProfileSetting',
      component: ProviderProfileSetting,
=======
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
>>>>>>> 81e710de5e2023413646b16bc020a33bc8b04ea5
    },
  ],
})

export default router
