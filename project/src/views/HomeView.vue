<template>
  <div class="home">
    <NavigationBar />
    <br>

    <HeroBanner />

    <section class="section popular-vegetables">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">Popular Vegetables</h2>
          <a href="#" class="see-all">All Deals →</a>
        </div>
        <Card />
          <div class="section-header">
          <h2 class="section-title">Popular Vegetables</h2>
          <a href="#" class="see-all">All Deals →</a>
        </div>
      
          
        <Farm />
          <div class="section-header">
          <h2 class="section-title">Popular Vegetables</h2>
          <a href="#" class="see-all">All Deals →</a>
        </div>
        <Deals />
        
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup>
import HeroBanner from '../components/Customer/Hero.vue'
import NavigationBar from '../components/Customer/NavigationBar.vue'
import Farm from '@/components/Customer/FarmerCard.vue'
import Card from '../components/Customer/Card.vue'
import Deals from '../components/Customer/DealsCard.vue'
import Footer from '../components/Customer/Footer.vue'
</script>

<style scoped>
.see-all {
  font-family: "DM Serif Display", serif;
  color: rgb(101, 142, 101);
  text-decoration: none;
  font-size: 1.2rem;
  
}
.home {
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ── SECTION ── */
.section {
  width: 100%;
  padding: 48px 24px;
  box-sizing: border-box;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── HEADER ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1a;
}

/* ── GRIDS ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
/* ── ONLY Popular Vegetables HEADER ── */
:deep(.vegetables-header .section-title) {
  font-family: "DM Serif Display", serif;
  font-size: 2rem;
  color: #2d6a4f;
  letter-spacing: -0.5px;
}

/* optional different link style */
:deep(.vegetables-header .see-all) {
  color: #3ddc84;
  font-weight: 700;
}

:deep(.vegetables-header .see-all:hover) {
  color: #1f7a4a;
}

.farmers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .section {
    padding: 32px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
  
</style>