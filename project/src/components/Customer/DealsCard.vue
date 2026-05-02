<template>
  <section class="deals-section">
    <div class="deals-grid">
      <div
        class="deal-card"
        v-for="(deal, i) in deals"
        :key="deal.name"
        @click="handleClick(deal)"
      >
        <div class="card-bg" :class="`card-bg-${i + 1}`"></div>

        <div class="card-watermark">{{ deal.watermark }}</div>
        <div class="card-produce">{{ deal.emoji }}</div>
        <div class="card-overlay"></div>

        <div class="card-content">
          <div class="countdown-row">
            <div class="cd-pill">
              <div class="cd-num">{{ formatTime(deal.timeLeft).d }}</div>
              <div class="cd-unit">Day</div>
            </div>

            <div class="cd-pill">
              <div class="cd-num">{{ formatTime(deal.timeLeft).h }}</div>
              <div class="cd-unit">HRS</div>
            </div>

            <div class="cd-pill">
              <div class="cd-num">{{ formatTime(deal.timeLeft).m }}</div>
              <div class="cd-unit">MIN</div>
            </div>
          </div>

          <div class="deal-name">{{ deal.name }}</div>

          <div class="deal-pricing">
            <span class="deal-price">${{ deal.price }}</span>
            <span class="deal-orig">${{ deal.orig }}</span>
            <span class="deal-save">Save {{ deal.save }}%</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useProductStore } from '../../stores/productStore'

const productStore = useProductStore()
const deals = ref([])

// convert initial time to seconds
function toSeconds(d, h, m, s = 0) {
  return d * 86400 + h * 3600 + m * 60 + s;
}

onMounted(async () => {
  try {
    // Fetch products from API
    if (!productStore.products || productStore.products.length === 0) {
      await productStore.fetchAllProducts()
    }
    // Transform first 3 products as deals
    deals.value = productStore.products.slice(0, 3).map((p, index) => ({
      name: p.name,
      emoji: ['🥕', '🥗', '🌽'][index % 3],
      watermark: p.category || 'Fresh Produce',
      price: String(p.price),
      orig: String(parseFloat(p.price) * 1.4),
      save: Math.min(p.discount || 20, 40),
      timeLeft: toSeconds(12 - index, 8 - (index * 2), 34),
    }))
  } catch (error) {
    console.error('Error loading deals:', error)
  }
})

function formatTime(total) {
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);

  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
  };
}

function handleClick(deal) {
  alert(`Added "${deal.name}" to cart — $${deal.price}/box`);
}

let interval;

onMounted(() => {
  interval = setInterval(() => {
    deals.value.forEach((deal) => {
      if (deal.timeLeft > 0) {
        deal.timeLeft--;
      }
    });
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
/* ── Section ────────────────────────────────── */
.deals-section {
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding: 48px 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 28px;
}

.section-title {
  font-size: 32px;
  color: white;
}

.see-all {
  color: #3ddc84;
  text-decoration: none;
  font-weight: bold;
}


.deals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.deal-card {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  min-height: 380px;
  cursor: pointer;
  transition: 0.3s;
}

.deal-card:hover {
  transform: translateY(-8px);
}

.card-bg {
  position: absolute;
  inset: 0;
}

/* backgrounds */
.card-bg-1 {
  background: linear-gradient(135deg, #5bbfa0, #1a3d2b);
}
.card-bg-2 {
  background: linear-gradient(135deg, #e8c084, #b87040);
}
.card-bg-3 {
  background: linear-gradient(135deg, #c4a06a, #6b4e20);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.85));
}

.card-watermark {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.2);
  font-size: 28px;
}

.card-produce {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
}

.card-content {
  position: absolute;
  bottom: 0;
  padding: 20px;
  color: white;
}

/* countdown */
.countdown-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.cd-pill {
  background: rgba(255,255,255,0.2);
  padding: 6px 10px;
  border-radius: 10px;
  text-align: center;
}

.cd-num {
  font-weight: bold;
  font-size: 18px;
}

.cd-unit {
  font-size: 10px;
  opacity: 0.7;
}

/* text */
.deal-name {
  font-weight: bold;
  margin-bottom: 6px;
}

.deal-price {
  color: #3ddc84;
  font-weight: bold;
}

.deal-orig {
  text-decoration: line-through;
  opacity: 0.5;
  margin-left: 6px;
}

.deal-save {
  margin-left: auto;
  background: #3ddc84;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* responsive */
@media (max-width: 900px) {
  .deals-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .deals-grid {
    grid-template-columns: 1fr;
  }
}
</style>