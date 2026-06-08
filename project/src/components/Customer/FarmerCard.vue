<template>
  <section class="farmers-section">
    <div class="farmers-grid">
      <div
        class="farmer-card"
        v-for="(farmer, index) in farmers"
        :key="farmer.id"
        :style="{ animationDelay: `${0.1 + index * 0.1}s` }"
        @click="goToFarmer(farmer.id)"
      >
        <div class="avatar">
          <img :src="farmer.image" :alt="farmer.name" />
        </div>

        <div class="farmer-name">{{ farmer.name }}</div>
        <div class="farmer-farm">{{ farmer.farm }}</div>

        <div class="farmer-divider"></div>

        <p class="farmer-desc">{{ farmer.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'

const router = useRouter()
const productStore = useProductStore()

const farmers = ref([])

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function resolveImage(url) {
  if (!url) return 'https://via.placeholder.com/80'
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}/uploads/${url.replace(/^\/?(images\/|uploads\/)?/, '')}`
}

async function loadFarmers() {
  const products = await productStore.fetchAllProducts()
  if (!products.length) return

  const map = new Map()

  for (const p of products) {
    const provider = p.provider
    if (!provider) continue

    const id = provider.user_id
    if (map.has(id)) continue

    const name = provider.provider_name || provider.name || `Provider #${id}`
    map.set(id, {
      id,
      name,
      farm: provider.farm_name || name,
      image: resolveImage(provider.avatar),
      desc: provider.story || `Fresh produce from ${name}.`,
    })
  }

  farmers.value = Array.from(map.values())
}

onMounted(loadFarmers)

function goToFarmer(id) {
  router.push(`/farmer/${id}`)
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.farmers-section {
  width: 100%;
  padding: 24px 0;
  font-family: 'Manrope', sans-serif;
  color: #1c1c1e;
}

.farmers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.farmer-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.25s ease;
  animation: fadeUp 0.6s both;
  cursor: pointer;
}

.farmer-card:hover {
  transform: translateY(-8px);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #e8f5ee;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.farmer-name {
  font-size: 15px;
  font-weight: 700;
  margin-top: 14px;
}

.farmer-farm {
  font-size: 11px;
  font-weight: 700;
  color: #2d6a4f;
  text-transform: uppercase;
  margin: 8px 0 10px;
}

.farmer-divider {
  width: 36px;
  height: 2px;
  background: #e8f5ee;
  margin-bottom: 10px;
}

.farmer-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .farmers-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 600px) {
  .farmers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
