<template>
  <div class="analyse-bar">
    <div class="row g-3">
      <div v-for="card in cards" :key="card.id" class="col-12 col-sm-6 col-lg-3">
        <div class="card-item card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="card-icon rounded" :style="{ backgroundColor: card.color }">
              <i :class="card.icon"></i>
            </div>
            <div>
              <h6 class="card-value mb-1">{{ formatNumber(card.value) }}</h6>
              <p class="card-label mb-0 small text-muted">{{ card.label }}</p>
            </div>
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
  padding: 0;
}

.card-item {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.card-body {
  padding: 1.25rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.card-label {
  font-size: 0.9rem;
  color: #6c757d;
}

@media (max-width: 1199px) {
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .card-label {
    font-size: 0.85rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .card-icon {
    width: 45px;
    height: 45px;
    font-size: 1.25rem;
  }

  .card-value {
    font-size: 1rem;
  }

  .card-label {
    font-size: 0.8rem;
  }

  .card-body {
    padding: 0.875rem;
  }
}

@media (max-width: 576px) {
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .card-value {
    font-size: 0.9rem;
  }

  .card-label {
    font-size: 0.75rem;
  }

  .card-body {
    padding: 0.75rem;
    gap: 0.75rem !important;
  }
}
</style>
