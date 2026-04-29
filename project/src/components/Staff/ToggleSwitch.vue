<template>
  <div
    class="toggle"
    :class="{ 'toggle-on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    tabindex="0"
    @click="$emit('update:modelValue', !modelValue)"
    @keydown.space.prevent="$emit('update:modelValue', !modelValue)"
    @keydown.enter.prevent="$emit('update:modelValue', !modelValue)"
  >
    <div class="toggle-thumb"></div>
  </div>
</template>

<script>
export default {
  name: "ToggleSwitch",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.toggle {
  width: 42px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  outline: none;
}

.toggle:focus-visible {
  box-shadow: 0 0 0 3px rgba(45, 122, 79, 0.3);
}

.toggle-on {
  background: #2d7a4f;
}

.toggle-thumb {
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}

.toggle-on .toggle-thumb {
  transform: translateX(18px);
}
</style>