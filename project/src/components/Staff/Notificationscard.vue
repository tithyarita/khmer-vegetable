<template>
  <div class="card">
    <h3 class="card-title">Notifications</h3>

    <div
      v-for="item in notifications"
      :key="item.key"
      class="notif-row"
    >
      <div class="notif-icon" :class="item.iconClass">
        <i :class="item.icon"></i>
      </div>

      <div class="notif-info">
        <span class="notif-title">{{ item.title }}</span>
        <span class="notif-sub">{{ item.sub }}</span>
      </div>

      <ToggleSwitch
        :model-value="item.enabled"
        @update:model-value="toggle(item.key, $event)"
      />
    </div>
  </div>
</template>

<script>
import ToggleSwitch from "./ToggleSwitch.vue";

export default {
  name: "NotificationsCard",
  components: { ToggleSwitch },
  emits: ["update:notifications"],
  props: {
    notifications: {
      type: Array,
      required: true,
      // [{ key, title, sub, icon, iconClass, enabled }]
    },
  },
  methods: {
    toggle(key, value) {
      const updated = this.notifications.map((n) =>
        n.key === key ? { ...n, enabled: value } : n
      );
      this.$emit("update:notifications", updated);
    },
  },
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 18px;
}

.notif-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px solid #f5f5f5;
}

.notif-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notif-row:first-of-type {
  padding-top: 0;
}

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

/* Icon colour classes — add more as needed */
.icon-blue   { background: #dbeafe; color: #1d4ed8; }
.icon-orange { background: #fff3cd; color: #856404; }
.icon-gray   { background: #f3f4f6; color: #9aa0ab; }
.icon-green  { background: #d4edda; color: #276541; }
.icon-red    { background: #fde8ef; color: #c0392b; }

.notif-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
}

.notif-sub {
  font-size: 11.5px;
  color: #9aa0ab;
}
</style>