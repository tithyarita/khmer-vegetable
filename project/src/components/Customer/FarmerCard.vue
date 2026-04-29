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

      <!-- Support Card -->
      <div class="support-card">
        <div class="support-icon-wrap">
          <span class="support-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 19H6.931A1 1 0 0 1 6 18.026l-.066-3.733A2 2 0 0 0 5.198 13H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h.5"/>
              <path d="M14 7h.536a2 2 0 0 1 1.933 1.35l1.3 3.9a2 2 0 0 1-1.933 2.65H14"/>
              <path d="M14 7V5a2 2 0 1 0-4 0v5a1 1 0 0 1-1 1H7"/>
              <path d="M18 14.5c.5-.5.5-1.5 0-2s-1 0-1.5.5L15 14.5l-1.5-1.5c-.5-.5-1-.5-1.5 0s-.5 1.5 0 2l3 3 3-3z"/>
            </svg>
          </span>
        </div>

        <div class="support-content">
          <div class="support-title">Support Local</div>
          <p class="support-desc">
            100% of our produce comes from verified family-run farms within 50 miles of our center.
          </p>
        </div>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  font-family: 'Manrope', sans-serif;
  color: #1c1c1e; /* FIX: global text color */
}

/* ── GRID ── */
.farmers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) minmax(220px, 300px);
  gap: 20px;
  align-items: stretch;
}

/* ── FARMER CARD ── */
.farmer-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0,0,0,0.09);
  transition: 0.3s;
  animation: fadeUp 0.6s both;
  color: #1c1c1e; /* FIX */
}

.farmer-card:hover {
  transform: translateY(-8px);
}

/* ── AVATAR ── */
.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #e8f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
}

/* ── TEXT FIXES ── */
.farmer-name {
  font-size: 20px;
  font-weight: 700;
  margin-top: 20px;
  color: #1c1c1e;
}

.farmer-farm {
  font-size: 11px;
  font-weight: 800;
  color: #2d6a4f;
  text-transform: uppercase;
  margin: 10px 0 16px;
}

.farmer-divider {
  width: 40px;
  height: 2px;
  background: #e8f5ee;
  margin-bottom: 16px;
}

.farmer-desc {
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.6;
}

/* ── SUPPORT CARD ── */
.support-card {
  background: #1c2b22;
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: white; /* FIX */
}

/* icon */
.support-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(45,106,79,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-icon {
  color: #2d6a4f;
}

/* text */
.support-title {
  font-size: 22px;
  font-weight: 700;
  color: #3ddc84;
  margin-bottom: 10px;
}

.support-desc {
  font-size: 13.5px;
  color: rgba(255,255,255,0.75);
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
@media (max-width: 1100px) {
  .farmers-grid {
    grid-template-columns: repeat(2, 1fr);
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