<template>
  <div class="page-header bg-success text-white d-flex align-items-center">
    <h5 class="mb-0 fw-bold">{{ title }}</h5>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.page-header {
  min-height: 70px;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  background-color: #2d5016 !important;
}

.page-header h5 {
  font-size: 1.25rem;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .page-header {
    min-height: 60px;
    padding: 0 1rem;
  }

  .page-header h5 {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .page-header {
    min-height: 55px;
    padding: 0 0.75rem;
  }

  .page-header h5 {
    font-size: 0.95rem;
  }
}
</style>
