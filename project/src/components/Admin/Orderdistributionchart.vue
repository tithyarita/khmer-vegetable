<template>
  <div class="dist-card">
    <div class="dist-header">
      <h3 class="dist-title">Order Distribution</h3>
      <p class="dist-sub">Status breakdown of all orders.</p>
    </div>

    <div v-if="!orderDistribution || !orderDistribution.statuses" class="no-data">
      <p>No data available</p>
    </div>

    <div v-else>
      <!-- SVG donut -->
      <div class="donut-wrap">
        <svg viewBox="0 0 120 120" class="donut-svg">
          <!-- Background circle -->
          <circle cx="60" cy="60" r="44" fill="none" stroke="#f3f4f3" stroke-width="18" />

          <!-- Donut segments -->
          <circle v-for="(segment, idx) in donutSegments" :key="idx"
            cx="60" cy="60" r="44" fill="none"
            :stroke="segment.color" stroke-width="18"
            :stroke-dasharray="segment.dasharray + ' 276'"
            :stroke-dashoffset="segment.offset"
            stroke-linecap="butt"
            transform="rotate(-90 60 60)" />

          <!-- Center text -->
          <text x="60" y="56" text-anchor="middle" font-size="16" font-weight="800" fill="#111827">
            {{ orderDistribution.total }}
          </text>
          <text x="60" y="68" text-anchor="middle" font-size="8"  font-weight="500" fill="#9ca3af">TOTAL</text>
        </svg>
      </div>

      <!-- Legend -->
      <div class="dist-legend">
        <div v-for="item in legendItems" :key="item.status" class="legend-row">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          <span class="legend-label">{{ item.status }}</span>
          <span class="legend-pct">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  orderDistribution: {
    type: Object,
    default: null,
  },
})

// Color mapping for different order statuses
const statusColors = {
  'PENDING': '#a7f3d0',
  'CONFIRMED': '#2d6a4f',
  'COMPLETED': '#2d6a4f',
  'CANCELLED': '#e5e7eb',
  'pending': '#a7f3d0',
  'confirmed': '#2d6a4f',
  'completed': '#2d6a4f',
  'cancelled': '#e5e7eb',
}

// Legend items with colors and percentages
const legendItems = computed(() => {
  if (!props.orderDistribution || !props.orderDistribution.statuses) {
    return []
  }

  return props.orderDistribution.statuses.map(s => ({
    status: s.status,
    percentage: s.percentage,
    color: statusColors[s.status] || '#6b7280',
  }))
})

// Calculate donut segments
const donutSegments = computed(() => {
  if (!props.orderDistribution || !props.orderDistribution.statuses) {
    return []
  }

  let offset = 0
  return props.orderDistribution.statuses.map(s => {
    const dasharray = (s.percentage / 100) * 276
    const currentOffset = offset
    offset -= dasharray
    return {
      color: statusColors[s.status] || '#6b7280',
      dasharray: dasharray,
      offset: currentOffset,
    }
  })
})
</script>

<style scoped>
.dist-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  display: flex; flex-direction: column;
}

.dist-header { margin-bottom: 16px; }
.dist-title { font-size: 14px; font-weight: 700; color: #111827; }
.dist-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.donut-wrap {
  display: flex; justify-content: center;
  flex: 1;
}
.donut-svg { width: 130px; height: 130px; }

.dist-legend {
  display: flex; flex-direction: column; gap: 8px; margin-top: 16px;
}
.legend-row {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
}
.legend-dot   { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: #374151; font-weight: 500; }
.legend-pct   { font-weight: 700; color: #111827; }

.no-data {
  display: flex; align-items: center; justify-content: center;
  height: 200px; color: #9ca3af; font-size: 12px;
}
</style>