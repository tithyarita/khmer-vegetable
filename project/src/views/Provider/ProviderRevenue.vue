<template>
  <div class="provider-revenue">
    <div class="revenue-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <PageHeader title="Earning" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
          <!-- Revenue Stats -->
          <div class="mb-4">
            <RevenueStats />
          </div>

          <!-- Products Sell Analysis Chart -->
          <div class="card mb-4">
            <div class="card-body">
              <ProductsSellAnalysis />
            </div>
          </div>

          <!-- Top Customers Section -->
          <div class="card mb-4">
            <div class="card-body">
              <TopCustomers :limit="5" />
            </div>
          </div>

          <!-- Recent Orders -->
          <RecentOrder />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from '../../components/provider_com/sideBar.vue'
import PageHeader from '../../components/provider_com/pageHeader.vue'
import RevenueStats from '../../components/provider_com/revenueStats.vue'
import ProductsSellAnalysis from '../../components/provider_com/ProductsSellAnalysis.vue'
import RecentOrder from '../../components/provider_com/recentOrder.vue'
import TopCustomers from '../../components/provider_com/TopCustomers.vue'
</script>

<style scoped>
.provider-revenue {
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

.revenue-container {
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
}

.card-body {
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .sidebar-wrapper {
    width: 200px;
  }

  .content-wrapper {
    padding: 1rem !important;
  }
}

@media (max-width: 768px) {
  .revenue-container {
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

  .card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .sidebar-wrapper {
    max-height: 150px;
  }

  .revenue-header {
    padding: 0.75rem 1rem !important;
  }

  .revenue-header h5 {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 0.75rem !important;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>
