import { useLanguageStore } from '@/stores/languageStore'
import { messages } from '@/lang'

export function useI18n() {

  const languageStore = useLanguageStore()

  const t = (key) => {
    return messages[languageStore.language][key] || key
  }

  return {
    t,
    languageStore
  }
}