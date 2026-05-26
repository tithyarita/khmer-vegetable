<template>
  <div class="profile-page">
    <NavigationBar />
    <div class="container" v-if="farmer">
      <button class="back-btn" @click="$router.back()">← Back</button>

      <div class="farmer-header">
        <img :src="farmer.image" :alt="farmer.name" class="farmer-avatar" />
        <div>
          <h1>{{ farmer.name }}</h1>
          <p class="farm-name">{{ farmer.farm }}</p>
          <p class="location">{{ farmer.location }}</p>
          <div class="badges">
            <span v-for="b in farmer.badges" :key="b.label" class="badge">{{ b.icon }} {{ b.label }}</span>
          </div>
        </div>
      </div>

      <div class="stats">
        <div v-for="s in farmer.stats" :key="s.label" class="stat">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>

      <blockquote class="quote">"{{ farmer.quote }}"</blockquote>

      <h2>Products by {{ farmer.name }}</h2>
      <div class="products-grid">
        <div v-for="p in farmer.products" :key="p.id" class="product-card" @click="$router.push(`/product/${p.id}`)">
          <img :src="p.image" :alt="p.name" />
          <div class="product-info">
            <span class="category">{{ p.category }}</span>
            <span class="name">{{ p.name }}</span>
            <span class="price">${{ p.price }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavigationBar from '@/components/Customer/NavigationBar.vue'
import { getFarmerById } from '@/data/farmers'

const route = useRoute()
const farmer = computed(() => getFarmerById(route.params.id))
</script>

<style scoped>
.profile-page {
  background: #f9f9f6;
  min-height: 100vh;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}
.back-btn {
  background: none;
  border: none;
  color: #2d6a4f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
}
.farmer-header {
  display: flex;
  gap: 28px;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}
.farmer-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8f5ee;
}
.farmer-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a2e1a;
}
.farm-name {
  font-size: 16px;
  color: #2d6a4f;
  font-weight: 600;
  margin: 0 0 2px;
}
.location {
  font-size: 13px;
  color: #8fa896;
  margin: 0 0 10px;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.badge {
  background: #e8f5ee;
  color: #1a4a2e;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
}
.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.stat {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #2d6a4f;
}
.stat-label {
  font-size: 12px;
  color: #8fa896;
  margin-top: 4px;
}
.quote {
  font-style: italic;
  color: #5a7060;
  font-size: 16px;
  line-height: 1.6;
  border-left: 3px solid #2d6a4f;
  padding-left: 20px;
  margin: 0 0 32px;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a2e1a;
  margin-bottom: 20px;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
}
.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.product-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.category {
  font-size: 11px;
  color: #8fa896;
  text-transform: uppercase;
  font-weight: 600;
}
.name {
  font-weight: 600;
  font-size: 14px;
  color: #1a2e1a;
}
.price {
  font-weight: 700;
  color: #2d6a4f;
  font-size: 16px;
  margin-top: 4px;
}
@media (max-width: 768px) {
  .farmer-header {
    flex-direction: column;
    text-align: center;
  }
  .badges {
    justify-content: center;
  }
  .stats {
    flex-direction: column;
  }
}
</style>
