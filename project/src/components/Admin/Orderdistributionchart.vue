<template>
  <div class="dist-card">
    <div class="dist-header">
      <h3 class="dist-title">Order Distribution</h3>
      <p class="dist-sub">Status of current deliveries.</p>
    </div>

    <!-- SVG donut -->
    <div class="donut-wrap">
      <svg viewBox="0 0 120 120" class="donut-svg">
        <!-- Background circle -->
        <circle cx="60" cy="60" r="44" fill="none" stroke="#f3f4f3" stroke-width="18" />

        <!-- Delivered 70% -->
        <circle cx="60" cy="60" r="44" fill="none"
          stroke="#2d6a4f" stroke-width="18"
          stroke-dasharray="193.2 276"
          stroke-dashoffset="0"
          stroke-linecap="butt"
          transform="rotate(-90 60 60)" />

        <!-- Cancelled 15% -->
        <circle cx="60" cy="60" r="44" fill="none"
          stroke="#e5e7eb" stroke-width="18"
          stroke-dasharray="41.4 276"
          stroke-dashoffset="-193.2"
          stroke-linecap="butt"
          transform="rotate(-90 60 60)" />

        <!-- Pending 15% -->
        <circle cx="60" cy="60" r="44" fill="none"
          stroke="#a7f3d0" stroke-width="18"
          stroke-dasharray="41.4 276"
          stroke-dashoffset="-234.6"
          stroke-linecap="butt"
          transform="rotate(-90 60 60)" />

        <!-- Center text -->
        <text x="60" y="56" text-anchor="middle" font-size="16" font-weight="800" fill="#111827">1.2k</text>
        <text x="60" y="68" text-anchor="middle" font-size="8"  font-weight="500" fill="#9ca3af">TOTAL</text>
      </svg>
    </div>

    <!-- Legend -->
    <div class="dist-legend">
      <div v-for="item in slices" :key="item.label" class="legend-row">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-pct">{{ item.pct }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const slices = [
  { label: 'Delivered', pct: 70, color: '#2d6a4f' },
  { label: 'Cancelled', pct: 15, color: '#e5e7eb' },
  { label: 'Pending',   pct: 15, color: '#a7f3d0' },
]
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
</style>