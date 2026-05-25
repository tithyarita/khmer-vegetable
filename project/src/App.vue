<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useLanguageStore } from '@/stores/languageStore'

const languageStore = useLanguageStore()

// Auto switch font based on language
watch(
  () => languageStore.language,
  (lang) => {
    if (lang === 'km') {
      document.body.classList.add('khmer-font')
    } else {
      document.body.classList.remove('khmer-font')
    }
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>

<style>

/* =========================
   RESET
========================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* =========================
   DEFAULT (ENGLISH)
========================= */

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f9f9f6;
  color: #1a2e1a;
}

/* =========================
   KHMER FONT MODE
========================= */

body.khmer-font {
  font-family: 'Kantumruy Pro', sans-serif;
}

/* =========================
   SMOOTH FONT SWITCH
========================= */

body,
button,
input,
select,
textarea {
  transition: font-family 0.2s ease;
}

</style>