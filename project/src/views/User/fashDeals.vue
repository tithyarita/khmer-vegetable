<template>
  <div class="outer">
    <div class="wrap">
      <!-- Header -->
      <div class="header">
        <div class="title-block">
          <h2><span class="bolt">⚡</span> Weekly Flash Deals</h2>
          <p>Unbeatable prices on fresh harvest. Hurry, stock is limited!</p>
        </div>
        <div class="timer">
          <span class="timer-label">ENDS IN:</span>
          <div class="timer-seg">
            <div class="num">{{ formatted.hrs }}</div>
            <div class="unit">HRS</div>
          </div>
          <span class="colon">:</span>
          <div class="timer-seg">
            <div class="num">{{ formatted.mins }}</div>
            <div class="unit">MIN</div>
          </div>
          <span class="colon">:</span>
          <div class="timer-seg">
            <div class="num">{{ formatted.secs }}</div>
            <div class="unit">SEC</div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <ProductCard :products="products" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ProductCard from '../../components/Customer/Card.vue'



// Countdown timer — 8h 42m 15s
const totalSeconds = ref(8 * 3600 + 42 * 60 + 15)
let interval = null

const formatted = computed(() => {
  const t = totalSeconds.value
  return {
    hrs:  String(Math.floor(t / 3600)).padStart(2, '0'),
    mins: String(Math.floor((t % 3600) / 60)).padStart(2, '0'),
    secs: String(t % 60).padStart(2, '0'),
  }
})

onMounted(() => {
  interval = setInterval(() => {
    if (totalSeconds.value > 0) totalSeconds.value--
  }, 1000)
})

onUnmounted(() => clearInterval(interval))

function addToCart(product) {
  alert(`Added "${product.name}" to cart!`)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.outer {
  background: #dde5ea;
  border-radius: 20px;
  padding: 4px;
  border: 1.5px dashed #b0bec5;
}

.wrap {
  background: #e8eef2;
  padding: 28px 24px;
  border-radius: 16px;
  font-family: sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
}

.title-block h2 {
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.bolt {
  color: #e53;
  font-size: 18px;
}

.title-block p {
  color: #777;
  font-size: 12px;
  margin-top: 4px;
}

.timer {
  background: #fff;
  border-radius: 10px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0.5px solid #ddd;
}

.timer-label {
  font-size: 10px;
  font-weight: 600;
  color: #999;
  letter-spacing: 1px;
}

.timer-seg {
  text-align: center;
}

.timer-seg .num {
  font-size: 17px;
  font-weight: 700;
  color: #111;
  line-height: 1;
}

.timer-seg .unit {
  font-size: 8px;
  color: #aaa;
  letter-spacing: 0.5px;
}

.colon {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  padding-bottom: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 0.5px solid #e0e0e0;
}

.img-wrap {
  position: relative;
  background: #1a1a1a;
  height: 150px;
}

.img-wrap img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: 0.4px;
}

.badge.hot {
  background: #1db877;
  color: #fff;
}

.badge.sale {
  background: #f59e0b;
  color: #fff;
}

.card-body {
  padding: 10px 12px 12px;
}

.cat {
  font-size: 10px;
  color: #aaa;
  margin-bottom: 3px;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin-bottom: 7px;
  line-height: 1.3;
}

.stars {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 9px;
}

.star {
  color: #ca8a04;
  font-size: 13px;
}

.rating {
  font-size: 11px;
  color: #999;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prices {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 17px;
  font-weight: 700;
  color: #166534;
}

.original {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
}

.add-btn {
  background: #dcfce7;
  color: #166534;
  border: none;
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: background 0.15s;
  white-space: nowrap;
}

.add-btn:hover {
  background: #bbf7d0;
}
</style>