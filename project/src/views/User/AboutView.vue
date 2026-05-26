<template>
  <div class="about">
    <h1>{{ t('aboutPage') }}</h1>
  </div>
</template>

<script setup>
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'
const languageStore = useLanguageStore()
const t = (key) => messages[languageStore.language][key] || key
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
