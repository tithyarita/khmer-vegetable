<template>
  <div class="timeline-wrapper">
    <h3 class="section-title">Process Timeline</h3>

    <div
      v-for="(step, idx) in steps"
      :key="idx"
      class="timeline-item"
      :class="{ 'last-item': idx === steps.length - 1 }"
    >
      <!-- Connector line drawn via CSS pseudo-element -->
      <div class="timeline-dot" :class="step.done ? 'done' : 'pending'">
        <i :class="step.done ? 'bi bi-check-lg' : 'bi bi-circle'"></i>
      </div>

      <div class="timeline-content">
        <span class="step-title">{{ step.title }}</span>
        <span class="step-meta">{{ step.meta }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProcessTimeline",
  props: {
    steps: {
      type: Array,
      required: true,
      // [{ title: string, meta: string, done: boolean }]
    },
  },
};
</script>

<style scoped>
.timeline-wrapper {
  padding: 4px 0;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 22px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 24px;
  position: relative;
}

/* Vertical connector line */
.timeline-item:not(.last-item)::before {
  content: "";
  position: absolute;
  left: 11px;
  top: 26px;
  width: 2px;
  bottom: 0;
  background: #e5e7eb;
}

.timeline-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-dot.done {
  background: #e6f4ec;
  color: #2d7a4f;
}

.timeline-dot.pending {
  background: #f3f4f6;
  color: #9aa0ab;
  border: 2px solid #e5e7eb;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 2px;
}

.step-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1a2e;
}

.step-meta {
  font-size: 12px;
  color: #9aa0ab;
  line-height: 1.4;
}
</style>