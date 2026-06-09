<script setup>
import { onMounted, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import { useProviderOrderStore } from "@/stores/providerOrderStore"
import { useReviewStore } from "@/stores/reviewStore"

import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import ProfileCard from "../../components/provider_com/ProfileCard.vue"
import FormProvider from "../../components/provider_com/ProviderForm.vue"
import BankAccount from "../../components/provider_com/BankAccount.vue"
import CustomerFeedback from "../../components/provider_com/CustomerFeedback.vue"

const store = useProviderStore()
const providerOrderStore = useProviderOrderStore()
const reviewStore = useReviewStore()

const currentUser = JSON.parse(localStorage.getItem("user") || 'null')
const providerId = Number(currentUser?.id || currentUser?.user_id || 0) || null

const dynamicRating = computed(() => {
  const avg = Number(reviewStore.averageRating)
  if (!avg) return "—"
  return `${avg.toFixed(1)} ★`
})

const activeServices = computed(() => {
  if (!providerOrderStore.orders?.length) return 0
  return providerOrderStore.orders.filter(order => {
    const status = String(order.status || '').toLowerCase()
    return status !== 'cancelled' && status !== 'rejected'
  }).length
})

const totalBookings = computed(() => providerOrderStore.orders?.length || 0)

const totalRevenue = computed(() => {
  return providerOrderStore.orders.reduce((sum, order) => {
    return sum + (Number(order.total) || 0)
  }, 0)
})

const stats = computed(() => [
  { title: "Active Orders", value: activeServices.value, icon: "📦", color: "#15803d" },
  { title: "Total Orders", value: totalBookings.value, icon: "📋", color: "#0369a1" },
  { title: "Revenue", value: `$${totalRevenue.value.toLocaleString()}`, icon: "💰", color: "#b45309" },
  { title: "Rating", value: dynamicRating.value, icon: "⭐", color: "#7c3aed" },
])

onMounted(async () => {
  if (!providerId) {
    console.warn('Provider profile cannot load: missing authenticated user id.')
    return
  }
  await Promise.all([
    store.loadProvider(providerId),
    providerOrderStore.fetchProviderOrders(providerId),
    reviewStore.fetchReviewsByProvider(),
  ])
})
</script>

<template>
  <div class="provider-page">
    <aside class="sidebar">
      <SideBar />
    </aside>

    <main class="main-content">
      <PageHeader title="My Profile" />

      <div v-if="store.loading" class="loading-banner">
        <div class="spinner"></div>
        Loading profile...
      </div>

      <template v-else>
        <section class="section-pad">
          <ProfileCard />
        </section>

        <section class="stats-grid section-pad">
          <div v-for="(item, i) in stats" :key="i" class="stats-card">
            <div class="stats-icon" :style="{ background: item.color + '18', color: item.color }">
              <span>{{ item.icon }}</span>
            </div>
            <div class="stats-body">
              <h2>{{ item.value }}</h2>
              <p>{{ item.title }}</p>
            </div>
          </div>
        </section>

        <section class="content-grid section-pad">
          <div class="left-column">
            <FormProvider />
          </div>
          <div class="right-column">
            <BankAccount />
            <CustomerFeedback />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.provider-page {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
  font-family: "DM Sans", sans-serif;
}

.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  z-index: 1000;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  overflow-y: auto;
  padding-bottom: 48px;
}

.loading-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 30px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #15803d;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.section-pad {
  padding: 0 30px;
  margin-top: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e8ecef;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 14px;
}

.stats-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stats-body h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.stats-body p {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.8rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1100px) {
  .content-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; }
  .section-pad { padding: 0 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
