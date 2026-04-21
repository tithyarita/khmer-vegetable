<template>
  <div class="analyse-bar">
    <div class="row g-3">
      <div v-for="card in cards" :key="card.id" class="col-md-3 col-sm-6">
        <div class="card-item">
          <div class="card-icon" :style="{ backgroundColor: card.color }">
            <i :class="card.icon"></i>
          </div>
          <div class="card-content">
            <h3 class="card-value">{{ formatNumber(card.value) }}</h3>
            <p class="card-label">{{ card.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cards = ref([
  {
    id: 1,
    icon: 'bi bi-person-circle',
    label: 'Customers',
    value: 5583,
    color: '#e0a0e3'
  },
  {
    id: 2,
    icon: 'bi bi-briefcase',
    label: 'Orders Received',
    value: 539,
    color: '#8ec5fc'
  },
  {
    id: 3,
    icon: 'bi bi-people',
    label: 'Delivery Partners',
    value: 105,
    color: '#d97ef1'
  },
  {
    id: 4,
    icon: 'bi bi-box',
    label: 'Delivery',
    value: 20835,
    color: '#ffc56d'
  }
])

const formatNumber = (num) => {
  return num.toLocaleString()
}
</script>

<style scoped>
.analyse-bar {
  padding: 20px 0;
}

.card-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-value {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
}

.card-label {
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .card-item {
    padding: 15px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .card-value {
    font-size: 1.5rem;
  }
}
</style>
