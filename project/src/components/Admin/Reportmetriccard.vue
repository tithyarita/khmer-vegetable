<template>
  <!--
    ReportMetricCard
    Props:
      label      – "TOTAL REVENUE"
      value      – "$42,850"
      trend      – "+7.1%"
      trendUp    – bool
      icon       – Bootstrap-icons class
      showBars   – show mini bar chart inside card (for orders)
      showPeople – show mini people icons (for users)
  -->
  <div class="metric-card">
    <div class="mc-top">
      <span class="mc-label">{{ label }}</span>
    </div>

    <div class="mc-mid">
      <p class="mc-value">{{ value }}</p>

      <!-- Mini bar chart decoration (for orders card) -->
      <div v-if="showBars" class="mini-bars">
        <div v-for="h in barHeights" :key="h" class="mini-bar" :style="{ height: h + 'px' }"></div>
      </div>

      <!-- Mini people icons (for users card) -->
      <div v-else-if="showPeople" class="mini-people">
        <i class="bi bi-person-fill" v-for="n in 3" :key="n"></i>
        <i class="bi bi-three-dots"></i>
      </div>

      <!-- Provider icons -->
      <div v-else-if="showProviders" class="mini-providers">
        <i class="bi bi-shop-window"></i>
      </div>
    </div>

    <div :class="['mc-trend', trendUp ? 'mc-trend--up' : 'mc-trend--down']">
      <i :class="['bi', trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right']"></i>
      <span class="trend-val">{{ trend }}</span>
      <span class="trend-sub">{{ trendLabel }}</span>
    </div>

    <!-- Extra info slot (e.g. "Target 1%" or "2 Pending") -->
    <div v-if="extraInfo" class="mc-extra">
      <span :class="['extra-badge', `extra-badge--${extraType}`]">{{ extraInfo }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:         { type: String,  required: true },
  value:         { type: String,  required: true },
  trend:         { type: String,  default: '' },
  trendLabel:    { type: String,  default: '' },
  trendUp:       { type: Boolean, default: true },
  showBars:      { type: Boolean, default: false },
  showPeople:    { type: Boolean, default: false },
  showProviders: { type: Boolean, default: false },
  extraInfo:     { type: String,  default: '' },
  extraType:     { type: String,  default: 'neutral' }, // neutral | warning | danger
})

const barHeights = [8, 14, 10, 18, 12, 20, 15, 22, 16, 24]
</script>

<style scoped>
.metric-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px 18px 14px;
  flex: 1; min-width: 120px;
  display: flex; flex-direction: column; gap: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  position: relative;
  overflow: hidden;
}

.mc-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: .6px;
  text-transform: uppercase; color: #9ca3af;
}

.mc-mid {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 8px;
}
.mc-value {
  font-size: 28px; font-weight: 800; color: #111827;
  letter-spacing: -1px; line-height: 1;
}

/* Mini bar chart */
.mini-bars {
  display: flex; align-items: flex-end; gap: 2px;
  padding-bottom: 2px; opacity: .55;
}
.mini-bar {
  width: 4px; background: #2d6a4f; border-radius: 2px 2px 0 0;
}

/* Mini people */
.mini-people {
  display: flex; align-items: center; gap: 1px;
  color: #2d6a4f; font-size: 15px; opacity: .5;
}

/* Mini providers */
.mini-providers { color: #2d6a4f; font-size: 22px; opacity: .4; }

/* Trend */
.mc-trend {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600; flex-wrap: wrap;
}
.mc-trend--up   { color: #16a34a; }
.mc-trend--down { color: #dc2626; }
.trend-val  { font-weight: 800; }
.trend-sub  { font-weight: 400; color: #9ca3af; margin-left: 2px; }

/* Extra badge */
.mc-extra { margin-top: 2px; }
.extra-badge {
  font-size: 10px; font-weight: 700; border-radius: 4px; padding: 2px 7px;
}
.extra-badge--neutral { background: #f3f4f6; color: #6b7280; }
.extra-badge--warning { background: #fef3c7; color: #92400e; }
.extra-badge--danger  { background: #fee2e2; color: #991b1b; }
</style>