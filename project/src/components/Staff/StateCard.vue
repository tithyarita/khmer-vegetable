<template>
  <!--
    Props:
      label      – card heading text, e.g. "TOTAL FORMS"
      value      – big number, e.g. 128
      icon       – Bootstrap-icons class, e.g. "bi-archive"
      badgeText  – small pill label, e.g. "12% this week"
      badgeType  – "success" | "warning" | "danger" | "neutral"
      valueColor – optional override, e.g. "var(--brand-dark)"
  -->
  <div class="stats-card">
    <div class="stats-header">
      <span class="stats-label">{{ label }}</span>
      <i :class="['bi', icon, 'stats-icon']"></i>
    </div>

    <p class="stats-value" :style="{ color: valueColor }">
      {{ formattedValue }}
    </p>

    <span :class="['stats-badge', `stats-badge--${badgeType}`]">
      <i v-if="badgeType === 'success'" class="bi bi-arrow-up-right me-1" style="font-size:10px"></i>
      {{ badgeText }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label:      { type: String,  required: true },
  value:      { type: Number,  required: true },
  icon:       { type: String,  default: 'bi-dash' },
  badgeText:  { type: String,  default: '' },
  badgeType:  { type: String,  default: 'neutral' },   // success | warning | danger | neutral
  valueColor: { type: String,  default: 'var(--brand-dark)' }
})

// Format numbers ≥ 1000 with comma
const formattedValue = computed(() =>
  props.value.toLocaleString()
)
</script>

<style scoped>
.stats-card {
  background: var(--card-bg);
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 20px 22px 18px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
}

/* Top row: label + icon */
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stats-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .7px;
  color: #6b7280;
  text-transform: uppercase;
}
.stats-icon {
  font-size: 22px;
  color: #d1d5db;
}

/* Big number */
.stats-value {
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  margin: 6px 0 4px;
  letter-spacing: -1px;
}

/* Bottom badge/pill */
.stats-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

/* Variants */
.stats-badge--success {
  background: #dcfce7;
  color: #15803d;
}
.stats-badge--warning {
  background: #fef9c3;
  color: #a16207;
}
.stats-badge--danger {
  background: #ffe4e6;
  color: #be123c;
}
.stats-badge--neutral {
  background: #f3f4f6;
  color: #6b7280;
}
</style>