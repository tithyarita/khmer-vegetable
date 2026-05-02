<template>
  <nav class="breadcrumb">
    <span
      v-for="(crumb, idx) in crumbs"
      :key="idx"
      class="crumb-item"
    >
      <span
        class="crumb-link"
        :class="{ 'crumb-current': idx === crumbs.length - 1 }"
        @click="idx < crumbs.length - 1 && $emit('navigate', crumb)"
      >{{ crumb.label }}</span>
      <i v-if="idx < crumbs.length - 1" class="bi bi-chevron-right crumb-sep"></i>
    </span>
  </nav>
</template>

<script>
export default {
  name: "PageBreadcrumb",
  emits: ["navigate"],
  props: {
    crumbs: {
      type: Array,
      required: true,
      // e.g. [{ label: 'Applications', to: '/staff/applications' }, { label: 'Review #APP-2024-082' }]
    },
  },
};
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 12.5px;
}

.crumb-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.crumb-link {
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s;
  padding: 2px 0;
}

.crumb-link:hover:not(.crumb-current) {
  color: #2d7a4f;
  text-decoration: underline;
}

.crumb-current {
  color: #1a1a2e;
  font-weight: 600;
  cursor: default;
}

.crumb-sep {
  font-size: 9px;
  color: #c4c9d4;
  margin: 0 2px;
}
</style>