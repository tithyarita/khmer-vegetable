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

        <div class="card-produce">
          <img :src="deal.image" :alt="deal.name" />
        </div>

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
import Tomato from '../../assets/images/Tomato3.png'


function toSeconds(d, h, m, s = 0) {
  return d * 86400 + h * 3600 + m * 60 + s;
}

const deals = ref([
  {
    name: "Weekly Seasonal Harvest Box",
    image: Tomato,
    watermark: "Season Veggies",
    price: "19.99",
    orig: "28.00",
    save: 29,
    timeLeft: toSeconds(12, 8, 34),
  },
  {
    name: "Weekly Seasonal Harvest Box",
    image: Tomato,
    watermark: "Season Veggies",
    price: "19.99",
    orig: "28.00",
    save: 29,
    timeLeft: toSeconds(12, 8, 34),
  },{
    name: "Weekly Seasonal Harvest Box",
    image: Tomato,
    watermark: "Season Veggies",
    price: "19.99",
    orig: "28.00",
    save: 29,
    timeLeft: toSeconds(12, 8, 34),
  },
  {
    name: "Weekly Seasonal Harvest Box",
    image: Tomato,
    watermark: "Season Veggies",
    price: "19.99",
    orig: "28.00",
    save: 29,
    timeLeft: toSeconds(12, 8, 34),
  },
  
]);

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
.deals-section {
  width: 100%;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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

.card-bg-1,
.card-bg-2,
.card-bg-3,
.card-bg-4 {
  background: white;
}


.card-watermark {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  font-size: 28px;

}

.card-produce {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-produce img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  transition: 0.3s;
}

.deal-card:hover .card-produce img {
  transform: scale(1.1);
}

.card-content {
  position: absolute;
  bottom: 0;
  padding: 20px;
}

.countdown-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.cd-pill {
  background: rgba(0, 0, 0, 0.2);
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

.deal-name {
  font-weight: bold;
  margin-bottom: 6px;
}

.deal-pricing {
  display: flex;
  align-items: center;
  gap: 6px;
}

.deal-price {
  color: #3ddc84;
  font-weight: bold;
}

.deal-orig {
  text-decoration: line-through;
  opacity: 0.5;
}

.deal-save {
  margin-left: auto;
  background: #3ddc84;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
}

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