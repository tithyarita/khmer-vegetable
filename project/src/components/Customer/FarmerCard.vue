<template>
  <section class="farmers-section">
    <div class="farmers-grid">
      <div
        class="farmer-card"
        v-for="(farmer, index) in farmers"
        :key="index"
        :style="{ animationDelay: `${0.1 + index * 0.1}s` }"
      >
        <!-- Avatar Image -->
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
import { ref } from "vue";
import Profile from "../../assets/images/profile.png";

const farmers = ref([
  {
    image: Profile,
    name: "G Davit",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
  {
    image: Profile,
    name: "G Davit",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
  {
    image: Profile,
    name: "G Davit",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
  {
    image: Profile,
    name: "G Davit",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
]);
</script>

<style scoped>
/* RESET */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* SECTION */
.farmers-section {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: 'Manrope', sans-serif;
  color: #1c1c1e;
}

/* GRID */
.farmers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* CARD */
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
}

.farmer-card:hover {
  transform: translateY(-8px);
}

/* AVATAR (FIXED) */
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

/* TEXT */
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

/* ANIMATION */
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

/* RESPONSIVE */
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