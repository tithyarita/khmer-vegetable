<template>
  <div class="card twofa-card">
    <div class="twofa-content">
      <div class="twofa-text">
        <h3 class="twofa-title">Two-Factor Auth</h3>
        <p class="twofa-sub">{{ description }}</p>
      </div>

      <button
        v-if="!enabled"
        class="btn-enable"
        @click="$emit('enable')"
      >
        ENABLE NOW
      </button>

      <div v-else class="enabled-badge">
        <i class="bi bi-shield-check"></i> ENABLED
      </div>
    </div>

    <!-- Decorative icon -->
    <i class="bi bi-shield-lock-fill twofa-deco"></i>
  </div>
</template>

<script>
export default {
  name: "TwoFactorAuth",
  emits: ["enable"],
  props: {
    enabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "Add an extra layer of security to your portal account.",
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

.twofa-card {
  background: #1f4e2e;
  border-color: #1f4e2e;
  position: relative;
  overflow: hidden;
}

.twofa-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.twofa-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.twofa-sub {
  font-size: 12.5px;
  color: #a8c5b0;
  margin: 0;
  line-height: 1.55;
}

.btn-enable {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  letter-spacing: 0.5px;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-enable:hover {
  background: rgba(255, 255, 255, 0.24);
}

.enabled-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: rgba(168, 240, 198, 0.2);
  border: 1px solid rgba(168, 240, 198, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 700;
  color: #a8f0c6;
  letter-spacing: 0.5px;
}

/* Decorative background icon */
.twofa-deco {
  position: absolute;
  right: -12px;
  bottom: -14px;
  font-size: 88px;
  color: rgba(255, 255, 255, 0.06);
  pointer-events: none;
  line-height: 1;
}
</style>