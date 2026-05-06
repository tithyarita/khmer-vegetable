<template>
  <section class="farmers-section">
    <div class="farmers-grid">
      <div
        class="farmer-card"
        v-for="(farmer, index) in farmers"
        :key="farmer.name"
        :style="{ animationDelay: `${0.1 + index * 0.1}s` }"
      >
        <div class="avatar-wrap">
          <div class="avatar">{{ farmer.emoji }}</div>
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

const farmers = ref([
  {
    emoji: "👨‍🌾",
    name: "Pu Sok",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
  {
    emoji: "👩‍🌾",
    name: "Farmer Sarah",
    farm: "Rooted Earth Homestead",
    desc: "Dedicated to growing nutrient-rich root vegetables and seasonal heritage tubers.",
  },
  {
    emoji: "👨‍🌾",
    name: "Pu Sok",
    farm: "Green Valley Farms",
    desc: "Specializes in organic leafy greens and crisp heirloom lettuces harvested daily.",
  },
  {
    emoji: "👩‍🌾",
    name: "Farmer Sarah",
    farm: "Rooted Earth Homestead",
    desc: "Dedicated to growing nutrient-rich root vegetables and seasonal heritage tubers.",
  },
]);
</script>

<style scoped>
/* ── Base Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── SECTION ── */
.farmers-section {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: 'Manrope', sans-serif;
  color: #1c1c1e; /* FIX: global text color */
}

/* ── GRID ── */
.farmers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

/* ── FARMER CARD ── */
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
  min-width: 0;
  animation: fadeUp 0.6s both;
  color: #1c1c1e; /* FIX */
}

.farmer-card:hover {
  transform: translateY(-8px);
}

/* ── AVATAR ── */
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
}

/* ── TEXT FIXES ── */
.farmer-name {
  font-size: 15px;
  font-weight: 700;
  margin-top: 14px;
  color: #1c1c1e;
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


/* ── ANIMATION ── */
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

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .farmers-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .support-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .farmers-grid {
    grid-template-columns: 1fr;
  }

  .support-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>