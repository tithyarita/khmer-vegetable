<script setup>
import { onMounted } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import SideBar from "@/components/provider_com/sideBar.vue"
import PageHeader from "@/components/provider_com/pageHeader.vue"
import ProfileCard from '@/components/provider_com/ProfileCard.vue'
import ProviderForm from '@/components/provider_com/ProviderForm.vue'
import BankAccount from '@/components/provider_com/BankAccount.vue'

const store = useProviderStore()

onMounted(() => {
  store.loadProvider()
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

        <div class="content-wrapper">
          <ProfileCard />
          <ProviderForm />
          <BankAccount />
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
  width: 320px;
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

.content-wrapper {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1260px;
}
</style>