<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">Revenue Trends</h3>
        <p class="chart-sub">Net profit growth over the fiscal month.</p>
      </div>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-dot legend-dot--current"></span> Current
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--prev"></span> Previous
        </span>
      </div>
    </div>

    <svg viewBox="0 0 440 160" class="chart-svg" preserveAspectRatio="none">
      <!-- Grid lines -->
      <line v-for="y in gridLines" :key="y" x1="0" :y1="y" x2="440" :y2="y"
        stroke="#f0f0f0" stroke-width="1" />

      <!-- Filled area under current line -->
      <path :d="areaPath" fill="url(#greenGrad)" opacity=".18" />

      <!-- Previous period line (dashed) -->
      <polyline :points="prevPoints" fill="none"
        stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="5,4"
        stroke-linejoin="round" stroke-linecap="round" />

      <!-- Current line -->
      <polyline :points="currPoints" fill="none"
        stroke="#2d6a4f" stroke-width="2.5"
        stroke-linejoin="round" stroke-linecap="round" />

      <!-- Dots -->
      <circle v-for="(pt, i) in currentCoords" :key="i"
        :cx="pt.x" :cy="pt.y" r="3.5"
        fill="#2d6a4f" stroke="#fff" stroke-width="2" />

      <!-- X-axis week labels -->
      <text v-for="(wk, i) in weeks" :key="wk"
        :x="20 + i * 132" y="156" text-anchor="middle"
        font-size="9" fill="#9ca3af">{{ wk }}</text>

      <!-- Gradient def -->
      <defs>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#2d6a4f" stop-opacity="1" />
          <stop offset="100%" stop-color="#2d6a4f" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const gridLines = [30, 65, 100, 135]

// Current period — a smooth wave that rises mid-month then drops
const currentY = [130, 110, 80, 55, 45, 60, 85, 95, 70, 50, 40, 65, 90, 75, 55]
// Previous period — flatter
const prevY    = [120, 115, 105, 98, 95, 100, 105, 110, 100, 95, 90, 95, 100, 98, 95]

const currentCoords = currentY.map((y, i) => ({ x: 16 + i * 27, y }))
const prevCoords    = prevY.map((y, i)    => ({ x: 16 + i * 27, y }))

const currPoints = computed(() => currentCoords.map(p => `${p.x},${p.y}`).join(' '))
const prevPoints = computed(() => prevCoords.map(p => `${p.x},${p.y}`).join(' '))

// Area path: line + close along bottom
const areaPath = computed(() => {
  const pts = currentCoords
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L${last.x},148 L${first.x},148 Z`
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 18px 20px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  display: flex; flex-direction: column;
}

.chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 14px;
}
.chart-title { font-size: 14px; font-weight: 700; color: #111827; }
.chart-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.legend { display: flex; gap: 12px; align-items: center; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b7280; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot--current { background: #2d6a4f; }
.legend-dot--prev    { background: #d1d5db; }

.chart-svg { width: 100%; height: 160px; }
</style>