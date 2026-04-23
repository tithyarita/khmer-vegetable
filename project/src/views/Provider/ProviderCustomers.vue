<template>
  <div class="provider-customers">
    <div class="customers-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Customers" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
          <!-- Customers Table Component -->
          <div class="card">
            <div class="card-body">
              <TopCustomers :showSearch="true" :showSort="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from '@/components/provider_com/sideBar.vue'
import PageHeader from '@/components/provider_com/pageHeader.vue'
import TopCustomers from '@/components/provider_com/TopCustomers.vue'
</script>

<style scoped>
.provider-customers {
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

.customers-container {
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
}

.card {
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .customers-container {
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

  .content-wrapper {
    padding: 1rem !important;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .sidebar-wrapper {
    max-height: 150px;
  }

  .content-wrapper {
    padding: 0.75rem !important;
  }
}
</style>
