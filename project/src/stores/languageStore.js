// src/stores/languageStore.js
import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: localStorage.getItem('language') || 'en'
  }),

  actions: {
    setLanguage(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
    }
  }
})