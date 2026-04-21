<template>
  <div class="provider-dashboard">
    <div class="dashboard-container">
      <!-- Sidebar -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <div class="dashboard-header bg-success text-white p-4">
          <h5 class="mb-0">Dashboard</h5>
        </div>

        <!-- Content Area -->
        <div class="content-wrapper">
          <!-- Analyse Cards -->
          <AnalyseBar />

          <!-- Products Sell Analysis Chart -->
          <ProductsSellAnalysis />

          <!-- Popular Products Section -->
          <div class="products-section">
            <div class="products-header">
              <h5 class="mb-0">Popular Product</h5>
              <a href="#" class="view-all">View All</a>
            </div>
            <div class="products-grid">
              <div v-for="product in products" :key="product.id">
                <ProductCard :product="product" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '@/components/provider_com/sideBar.vue'
import AnalyseBar from '@/components/provider_com/analyseBar.vue'
import ProductsSellAnalysis from '@/components/provider_com/ProductsSellAnalysis.vue'
import ProductCard from '@/components/provider_com/productCard.vue'
import tomatoesImg from '@/assets/img-provider/tomatoes.jpg'
import carrotImg from '@/assets/img-provider/carrot.jpg'
import cabbageImg from '@/assets/img-provider/cabbage.jpg'
import onionImg from '@/assets/img-provider/onion.jpg'

const products = ref([
  {
    id: 1,
    name: 'Small Japanese Tomatoes',
    price: 10,
    unit: 'kg',
    image: tomatoesImg
  },
  {
    id: 2,
    name: 'Long Carrot',
    price: 7.50,
    unit: 'kg',
    image: carrotImg
  },
  {
    id: 3,
    name: 'Green Cabbages',
    price: 6,
    unit: 'kg',
    image: cabbageImg
  },
  {
    id: 4,
    name: 'Onions',
    price: 8,
    unit: 'kg',
    image: onionImg
  }
])
</script>

<style scoped>
.provider-dashboard {
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

.dashboard-container {
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

.dashboard-header {
  background-color: #2d5016 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.content-wrapper {
  background-color: #f5f5f5;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.products-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.products-header h5 {
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.view-all {
  color: #ff6b9d;
  font-size: 0.9rem;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  color: #ff5882;
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar-wrapper {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

</style>
