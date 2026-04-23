<template>
  <!--
    Props:
      label      – "Total Active Users"
      value      – "12,482"  (string so you can pass "$142.6k")
      icon       – Bootstrap-icons class, e.g. "bi-person"
      trend      – "+8.4%"
      trendLabel – "vs last month"  |  "highest ever peak"
      trendUp    – true/false (controls colour)
      dark       – true → dark green card (Net Revenue card)
  -->
  <div :class="['summary-card', dark && 'summary-card--dark']">
    <!-- Top: label + icon -->
    <div class="sc-header">
      <span class="sc-label">{{ label }}</span>
      <div class="sc-icon-wrap">
        <i :class="['bi', icon]"></i>
      </div>
    </div>

    <!-- Big value -->
    <p class="sc-value">{{ value }}</p>

    <!-- Trend pill -->
    <div :class="['sc-trend', trendUp ? 'sc-trend--up' : 'sc-trend--down']">
      <i :class="['bi', trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right', 'me-1']" style="font-size:10px"></i>
      <span class="trend-pct">{{ trend }}</span>
      <span class="trend-label">{{ trendLabel }}</span>
    </div>

    <!-- Watermark icon (large faded) -->
    <div class="sc-watermark" aria-hidden="true">
      <i :class="['bi', icon]"></i>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:      { type: String,  required: true },
  value:      { type: String,  required: true },
  icon:       { type: String,  default: 'bi-graph-up' },
  trend:      { type: String,  default: '' },
  trendLabel: { type: String,  default: 'vs last month' },
  trendUp:    { type: Boolean, default: true },
  dark:       { type: Boolean, default: false },
})
</script>

<style scoped>
/* ── Card base ── */
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
  transition: box-shadow .2s;
}
.summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.10); }

/* Dark variant (Net Revenue) */
.summary-card--dark {
  background: #1a3d2a;
  border-color: #1a3d2a;
  color: #fff;
}

/* Header */
.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sc-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: .2px;
  line-height: 1.3;
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
  font-size: 14px;
  color: #2d6a4f;
  flex-shrink: 0;
}
.summary-card--dark .sc-icon-wrap {
  background: rgba(255,255,255,.12);
  color: #a8e6c0;
}

/* Big number */
.sc-value {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -1px;
  margin: 4px 0 2px;
}
.summary-card--dark .sc-value { color: #fff; }

/* Trend row */
.sc-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  flex-wrap: wrap;
}
.sc-trend--up   { color: #16a34a; }
.sc-trend--down { color: #dc2626; }
.summary-card--dark .sc-trend--up   { color: #6ee7b7; }
.summary-card--dark .sc-trend--down { color: #fca5a5; }

.trend-pct   { font-weight: 700; }
.trend-label { font-weight: 400; color: #9ca3af; margin-left: 3px; }
.summary-card--dark .trend-label { color: #a8c8b0; }

/* Large watermark icon */
.sc-watermark {
  position: absolute;
  bottom: -8px;
  right: -4px;
  font-size: 68px;
  color: #e5e7eb;
  opacity: .35;
  pointer-events: none;
  line-height: 1;
}
.summary-card--dark .sc-watermark { color: rgba(255,255,255,.08); opacity: 1; }
</style>