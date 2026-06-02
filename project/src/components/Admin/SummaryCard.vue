<template>
  <div :class="['summary-card', dark && 'summary-card--dark']">

    <div class="sc-header">
      <span class="sc-label">{{ label }}</span>

      <div class="sc-icon-wrap">
        <i :class="['bi', icon]"></i>
      </div>
    </div>

    <p class="sc-value">
      {{ displayValue }}
    </p>

    <div :class="['sc-trend', trendUp ? 'sc-trend--up' : 'sc-trend--down']">
      <i
        :class="[
          'bi',
          trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right',
          'me-1'
        ]"
        style="font-size:10px"
      />

      <span class="trend-pct">{{ trend }}</span>
      <span class="trend-label">{{ trendLabel }}</span>
    </div>

    <div class="sc-watermark" aria-hidden="true">
      <i :class="['bi', icon]"></i>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },

  // FIX: allow number OR string
  value: { type: [String, Number], required: true },

  icon: { type: String, default: 'bi-graph-up' },
  trend: { type: String, default: '' },
  trendLabel: { type: String, default: 'vs last month' },
  trendUp: { type: Boolean, default: true },
  dark: { type: Boolean, default: false },
})

/* normalize display so UI is always safe */
const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '0'
  return String(props.value)
})
</script>

<style scoped>
.summary-card {
  position: relative;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 18px 20px 16px;
  flex: 1;
  min-width: 140px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.07);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-card--dark {
  background: #1a3d2a;
  border-color: #1a3d2a;
  color: #fff;
}

.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sc-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}
.summary-card--dark .sc-label { color: #a8c8b0; }

.sc-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f0f7f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
}

.summary-card--dark .sc-icon-wrap {
  background: rgba(255,255,255,.12);
  color: #a8e6c0;
}

.sc-value {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
}

.summary-card--dark .sc-value {
  color: #fff;
}

.sc-trend {
  display: flex;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
}

.sc-trend--up { color: #16a34a; }
.sc-trend--down { color: #dc2626; }

.trend-label {
  color: #9ca3af;
  font-weight: 400;
}

.summary-card--dark .trend-label {
  color: #a8c8b0;
}

.sc-watermark {
  position: absolute;
  bottom: -10px;
  right: -5px;
  font-size: 70px;
  opacity: 0.2;
  pointer-events: none;
}
</style>