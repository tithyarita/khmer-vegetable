<script setup lang="ts">
import BankAccount from '@/components/provider_com/BankAccount.vue';
import ProfileCard from '@/components/provider_com/ProfileCard.vue';
import ProviderForm from '@/components/provider_com/ProviderForm.vue';
import SideBar from '@/components/provider_com/sideBar.vue';
import PageHeader from '@/components/provider_com/pageHeader.vue';
</script>

<template>
  <div class="provider-profile-setting">
    <div class="profile-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Provider Profile" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
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
  background-color: #f5f5f5;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.profile-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.sidebar-wrapper {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  background-color: #f5f5f5;
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    max-height: 180px;
  }

  .main-content {
    flex: 1;
  }
}
</style>