<template>
  <div class="outer">
    <div class="wrap">
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

      <div v-if="loading" class="loading-state">Loading discounted products...</div>
      <div v-else-if="discountedProducts.length === 0" class="empty-state">
        No discounted products available right now.
      </div>
      <ProductCard v-else :products="discountedProducts" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ProductCard from '../../components/Customer/Card.vue'
import { useProductStore } from '@/stores/productStore'

const productStore = useProductStore()

const totalSeconds = ref(8 * 3600 + 42 * 60 + 15)
const loading = ref(false)
let interval = null

const formatted = computed(() => {
  const time = totalSeconds.value
  return {
    hrs: String(Math.floor(time / 3600)).padStart(2, '0'),
    mins: String(Math.floor((time % 3600) / 60)).padStart(2, '0'),
    secs: String(time % 60).padStart(2, '0'),
  }
})

const discountedProducts = computed(() => {
  return productStore.products
    .filter(product => Number(product.discount ?? 0) > 0)
    .sort((a, b) => Number(b.discount ?? 0) - Number(a.discount ?? 0))
})

const loadDiscountedProducts = async () => {
  if (productStore.products.length > 0) return

  loading.value = true
  try {
    await productStore.fetchAllProducts()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  interval = setInterval(() => {
    if (totalSeconds.value > 0) totalSeconds.value--
  }, 1000)

  loadDiscountedProducts()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
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

.loading-state,
.empty-state {
  padding: 20px;
  text-align: center;
  color: #556;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #dfe7e2;
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