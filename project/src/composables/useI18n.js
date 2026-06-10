import { useLanguageStore } from '@/stores/languageStore'
import { messages } from '@/lang'
import { computed } from 'vue'

export function useI18n() {
  const languageStore = useLanguageStore()

  const currentLanguage = computed(() => languageStore.language)

  const t = (key) => {
    // Access currentLanguage.value to establish reactive dependency
    const lang = currentLanguage.value
    return messages[lang][key] || key
  }

  return {
    t,
    languageStore,
    currentLanguage
  }
}