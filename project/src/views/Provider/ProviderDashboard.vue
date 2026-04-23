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
        <PageHeader title="Dashboard" />

        <!-- Content Area -->
        <div class="content-wrapper flex-grow-1 overflow-y-auto p-4">
          <!-- Analyse Cards -->
          <div class="mb-4">
            <AnalyseBar />
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
              <TopCustomers />
            </div>
          </div>

          <!-- Popular Products Section -->
          <div class="card">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold">Popular Product</h5>
                <button @click="goToProducts" class="btn btn-link btn-sm text-decoration-none">View All</button>
              </div>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div v-for="product in products" :key="product.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <ProductCard :product="product" />
                </div>
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
import { useRouter } from 'vue-router'
import SideBar from '@/components/provider_com/sideBar.vue'
import PageHeader from '@/components/provider_com/pageHeader.vue'
import AnalyseBar from '@/components/provider_com/analyseBar.vue'
import ProductsSellAnalysis from '@/components/provider_com/ProductsSellAnalysis.vue'
import ProductCard from '@/components/provider_com/productCard.vue'
import TopCustomers from '@/components/provider_com/TopCustomers.vue'
import tomatoesImg from '@/assets/img-provider/tomatoes.jpg'
import carrotImg from '@/assets/img-provider/carrot.jpg'
import cabbageImg from '@/assets/img-provider/cabbage.jpg'
import onionImg from '@/assets/img-provider/onion.jpg'

const router = useRouter() 

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

const goToProducts = () => {
  router.push('/provider-products?sort=popular')
}
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

.content-wrapper {
  background-color: #f5f5f5;
}

.card {
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  border-bottom: 1px solid #dee2e6 !important;
  border-radius: 8px 8px 0 0;
}

.card-body {
  padding: 1.5rem;
}

.btn-link {
  color: #ff6b9d;
  font-weight: 500;
  text-decoration: none;
}

.btn-link:hover {
  color: #ff5882;
  text-decoration: none;
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
  .dashboard-container {
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

  .dashboard-header {
    padding: 0.75rem 1rem !important;
  }

  .dashboard-header h5 {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 0.75rem !important;
  }

  .card-body {
    padding: 1rem;
  }

  .card-header {
    padding: 0.75rem 1rem !important;
  }
}
</style>
