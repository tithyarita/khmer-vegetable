<template>
  <div class="card vh-card">
    <h3 class="vh-title">Verification Health</h3>
    <p class="vh-subtitle">Overall confidence score based on submitted telemetry.</p>

    <div
      v-for="metric in metrics"
      :key="metric.label"
      class="metric-row"
    >
      <div class="metric-label-row">
        <span class="metric-label">{{ metric.label }}</span>
        <span class="metric-pct">{{ metric.value }}%</span>
      </div>
      <div class="metric-bar">
        <div
          class="metric-fill"
          :style="{ width: metric.value + '%' }"
        ></div>
      </div>
    </div>

    <div class="vh-footer">
      <i class="bi bi-info-circle"></i>
      <span>{{ footerNote }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "VerificationHealth",
  props: {
    metrics: {
      type: Array,
      required: true,
      // [{ label: string, value: number (0–100) }]
    },
    footerNote: {
      type: String,
      default: "Ready for immediate board approval.",
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 22px 24px;
}

.vh-card {
  background: #1f4e2e;
  border-color: #1f4e2e;
}

.vh-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 5px;
}

.vh-subtitle {
  font-size: 12px;
  color: #a8c5b0;
  margin: 0 0 22px;
  line-height: 1.55;
}

.metric-row {
  margin-bottom: 18px;
}

.metric-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
}

.metric-label {
  font-size: 10px;
  font-weight: 700;
  color: #a8c5b0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.metric-pct {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.metric-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: #a8f0c6;
  border-radius: 4px;
  transition: width 0.7s ease;
}

.vh-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  font-size: 12px;
  color: #a8c5b0;
  line-height: 1.4;
}

.vh-footer i {
  flex-shrink: 0;
  font-size: 14px;
}
</style>