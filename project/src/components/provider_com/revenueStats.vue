<!-- <template>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.stat-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 16px 18px 14px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
  background: #1a3d2a !important;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.stat-sublabel {
  font-size: 11px;
  font-weight: 400;
  color: #9ca3af;
  margin-top: 2px;
}

@media (max-width: 1199px) {
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 8.5px;
  }

  .card-body {
    padding: 14px 16px 12px;
  }
}

@media (max-width: 768px) {
  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 8px;
  }

  .card-body {
    padding: 12px 14px 10px;
  }
}

@media (max-width: 576px) {
  .stat-icon {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 7.5px;
  }

  .card-body {
    padding: 10px 12px 8px;
    gap: 0.75rem !important;
  }
}
</style> -->
