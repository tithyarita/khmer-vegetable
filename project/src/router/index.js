import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProviderDashboard from '../views/Provider/ProviderDashboard.vue'
import ProviderProduct from '../views/Provider/ProviderProduct.vue'
import ProviderRevenue from '../views/Provider/ProviderRevenue.vue'
import ProviderProfileSetting from '../views/Provider/ProfileSettingProvider.vue'

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
      path: '/provider-profile-setting',
      name: 'providerProfileSetting',
      component: ProviderProfileSetting,
    },
  ],
})

export default router
