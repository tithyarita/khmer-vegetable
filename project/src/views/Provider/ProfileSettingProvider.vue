<script setup>
import { onMounted } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import SideBar from "@/components/provider_com/sideBar.vue"
import PageHeader from "@/components/provider_com/pageHeader.vue"
import ProfileCard from '@/components/provider_com/ProfileCard.vue'
import ProviderForm from '@/components/provider_com/ProviderForm.vue'
import BankAccount from '@/components/provider_com/BankAccount.vue'
import axios from "axios"
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
const store = useProviderStore()

onMounted(async () => {
  store.loadProvider()
  // If user is logged in and is a provider, fetch provider profile from backend
  if (userStore.user && userStore.user.role === 'provider') {
    try {
      console.log('Logged in user:', userStore.user)
      const res = await axios.get(`http://localhost:3000/providers/${userStore.user.id}`)
      console.log('Backend provider data:', res.data)
      if (res.data) {
        store.updateProfile({
          name: res.data.provider_name || res.data.name,
          location: res.data.location || '',
          id: res.data.user_id || '',
          email: res.data.email || '',
          // Add more fields as needed
        })
      }
    } catch (err) {
      // Optionally handle error
      console.error('Failed to load provider profile', err)
    }
  }
})
</script>

<template>
  <div class="provider-profile-setting">
    <div class="profile-container">
      <div class="sidebar-wrapper">
        <SideBar />
      </div>
      <div class="main-content">
        <PageHeader title="Provider Profile" />
        <div class="profile-header">
          <h2>Welcome, <span class="provider-name">{{ store.provider.name }}</span></h2>
          <p class="provider-email">{{ store.provider.email }}</p>
        </div>
        <div class="content-wrapper">
          <ProfileCard />
          <div class="profile-section">
            <h3>Edit Profile Information</h3>
            <ProviderForm />
          </div>
          <div class="profile-section">
            <h3>Bank Accounts</h3>
            <BankAccount />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.provider-profile-setting {
  background: #f5f5f5;
  width: 100%;
  height: 100vh;
  position: fixed;
  inset: 0;
  font-family: 'DM Sans', sans-serif;
}

.profile-container {
  display: flex;
  height: 100%;
}

.sidebar-wrapper {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.profile-header {
  background: #fff;
  border-radius: 14px;
  margin: 24px 28px 0 28px;
  padding: 24px 32px 16px 32px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.profile-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.provider-name {
  color: #2e7d32;
}

.provider-email {
  color: #888;
  font-size: 1rem;
  margin-bottom: 0;
}

.content-wrapper {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1260px;
}

.profile-section {
  background: #fff;
  border-radius: 14px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px #0001;
}

.profile-section h3 {
  margin-top: 0;
  color: #2e7d32;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 18px;
}
</style>