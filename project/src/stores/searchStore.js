import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', () => {
  const isOpen = ref(false)
  const query = ref('')

  function open(q = '') {
    query.value = q
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    query.value = ''
  }

  return { isOpen, query, open, close }
})
