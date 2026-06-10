<template>
  <div class="settings-page">
    <div class="settings-container">
      
      <header class="settings-header">
        <div class="header-icon">🥬</div>
        <div class="header-text">
          <h1>{{ t('settings') }}</h1>
          <p>{{ t('settingsSubtitle') }}</p>
        </div>
      </header>

      <div class="settings-content">
        <section class="settings-section">
          <div class="section-meta">
            <span class="section-icon">🌐</span>
            <div>
              <h2>{{ t('language') }}</h2>
              <p class="section-hint">{{ t('languageHint') }}</p>
            </div>
          </div>

          <div class="lang-toggle-group">
            <button
              type="button"
              class="lang-btn"
              :class="{ active: language === 'en' }"
              @click="setLanguage('en')"
            >
              <span class="lang-flag">🇬🇧</span>
              <span>{{ t('english') }}</span>
            </button>
            <button
              type="button"
              class="lang-btn"
              :class="{ active: language === 'km' }"
              @click="setLanguage('km')"
            >
              <span class="lang-flag">🇰🇭</span>
              <span>{{ t('khmer') }}</span>
            </button>
          </div>
        </section>
      </div>

      <footer class="settings-footer">
        <button class="save-btn" @click="saveSettings">
          <span v-if="!saved">{{ t('save') }}</span>
          <span v-else class="saved-state">✓ {{ t('saved') }}</span>
        </button>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, languageStore } = useI18n()
const language = ref(languageStore.language)
const saved = ref(false)

function setLanguage(lang) {
  language.value = lang
  languageStore.setLanguage(lang)
}

watch(language, (newLang) => {
  languageStore.setLanguage(newLang)
})

function saveSettings() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<style scoped>
/* Main clean workspace container */
.settings-page {
  min-height: 100vh;
  background: #f4f7f5;
  padding: 48px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header/Hero Component */
.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 8px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background-color: #f4fbf6;
  border: 1px solid #e1f5e7;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-text p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 4px 0 0 0;
}

/* Core Settings Layout */
.settings-content {
  display: flex;
  flex-direction: column;
}

.settings-section {
  background: #ffffff;
  padding-bottom: 8px;
}

/* Section Metadata */
.section-meta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 1.25rem;
  display: inline-block;
  margin-top: 2px;
}

.section-meta h2 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.section-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

/* Language Selection Grid */
.lang-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.lang-btn.active {
  border-color: #10b981;
  background-color: #f0fdf4;
  color: #047857;
  font-weight: 600;
}

.lang-flag {
  font-size: 1.2rem;
}

/* Save Action Footer Layouts */
.settings-footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;

}

.save-btn {
  width: 30%;
  border: none;
  text-align: center;
  padding: 16px;
  border-radius: 12px;
  background-color: #2d7a3a;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.save-btn:hover {
  background-color: #276031;
}

.saved-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

@media (max-width: 576px) {
  .settings-page {
    padding: 32px 16px;
  }
  .lang-toggle-group {
    grid-template-columns: 1fr;
  }
}
</style>