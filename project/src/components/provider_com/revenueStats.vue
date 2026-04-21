<template>
  <div class="revenue-stats">
    <div class="row g-3">
      <div v-for="stat in stats" :key="stat.id" class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card card h-100 border-0 shadow-sm rounded-3">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon rounded-3" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div>
              <p class="stat-label small text-muted mb-1">{{ stat.label }}</p>
              <h6 class="stat-value mb-0">{{ stat.value }}</h6>
              <small class="stat-sublabel text-muted">{{ stat.sublabel }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  {
    id: 1,
    icon: 'bi bi-wallet2',
    label: 'Total Earning',
    value: '$350.4',
    sublabel: '',
    color: '#e0a0e3'
  },
  {
    id: 2,
    icon: 'bi bi-cash-coin',
    label: 'Earn this month',
    value: '$642.39',
    sublabel: '',
    color: '#8ec5fc'
  },
  {
    id: 3,
    icon: 'bi bi-bag-check',
    label: 'Total Orders',
    value: '57',
    sublabel: '',
    color: '#d97ef1'
  },
  {
    id: 4,
    icon: 'bi bi-percent',
    label: 'Orders This month',
    value: '57',
    sublabel: '',
    color: '#ffc56d'
  }
])
</script>

<style scoped>
.revenue-stats {
  padding: 0;
}

.stat-card {
  background: white;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.card-body {
  padding: 1.25rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: #adb5bd;
}

@media (max-width: 1199px) {
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .card-body {
    padding: 0.875rem;
  }
}

@media (max-width: 576px) {
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-value {
    font-size: 0.9rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .card-body {
    padding: 0.75rem;
    gap: 0.75rem !important;
  }
}
</style>
