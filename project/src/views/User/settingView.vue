<template>
  <div class="settings-page">
    <div class="settings-bg-pattern"></div>

    <div class="settings-container">
      <!-- Header -->
      <header class="settings-hero">
        <div class="hero-icon">🥬</div>
        <div class="hero-text">
          <h1>{{ t('settings') }}</h1>
          <p>{{ t('settingsSubtitle') }}</p>
        </div>
      </header>

      <!-- Language — prominent toggle -->
      <section class="settings-section language-section">
        <div class="section-header">
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
            {{ t('english') }}
          </button>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: language === 'km' }"
            @click="setLanguage('km')"
          >
            <span class="lang-flag">🇰🇭</span>
            {{ t('khmer') }}
          </button>
        </div>
      </section>

      <!-- Location -->
      <section class="settings-section">
        <div class="section-header">
          <span class="section-icon">📍</span>
          <h2>{{ t('location') }}</h2>
        </div>

        <div class="location-grid">
          <button
            v-for="loc in locations"
            :key="loc.value"
            type="button"
            class="location-chip"
            :class="{ active: location === loc.value }"
            @click="location = loc.value"
          >
            {{ loc.label }}
          </button>
        </div>
      </section>

      <!-- Notifications -->
      <section class="settings-section">
        <div class="section-header">
          <span class="section-icon">🔔</span>
          <h2>{{ t('notifications') }}</h2>
        </div>

        <div class="toggle-list">
          <div v-for="item in notificationItems" :key="item.key" class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">{{ item.label }}</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="notification[item.key]" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Save -->
      <button class="save-btn" @click="saveSettings">
        <span v-if="!saved">{{ t('save') }}</span>
        <span v-else class="saved-state">✓ {{ t('saved') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, languageStore } = useI18n()

const location = ref(localStorage.getItem('deliveryLocation') || 'phnom_penh')
const language = ref(languageStore.language)
const saved = ref(false)

const storedNotifications = (() => {
  try {
    return JSON.parse(localStorage.getItem('notifications') || '')
  } catch {
    return null
  }
})()

const notification = ref({
  email: storedNotifications?.email ?? true,
  sms: storedNotifications?.sms ?? false,
  push: storedNotifications?.push ?? true,
})

const locations = computed(() => [
  { value: 'phnom_penh', label: t('locationPhnomPenh') },
  { value: 'siem_reap', label: t('locationSiemReap') },
  { value: 'battambang', label: t('locationBattambang') },
  { value: 'other', label: t('locationOther') },
])

const notificationItems = computed(() => [
  { key: 'email', label: t('emailUpdates') },
  { key: 'sms', label: t('smsPromotions') },
  { key: 'push', label: t('pushNotifications') },
])

function setLanguage(lang) {
  language.value = lang
  languageStore.setLanguage(lang)
}

watch(language, (newLang) => {
  languageStore.setLanguage(newLang)
})

function saveSettings() {
  localStorage.setItem('deliveryLocation', location.value)
  localStorage.setItem('notifications', JSON.stringify(notification.value))
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 40%, #fffde7 100%);
  padding: 40px 20px 60px;
  position: relative;
  overflow: hidden;
}

.settings-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 195, 74, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.settings-container {
  max-width: 560px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.settings-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #43a047, #66bb6a);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 8px 24px rgba(67, 160, 71, 0.25);
  flex-shrink: 0;
}

.hero-text h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1b5e20;
  letter-spacing: -0.5px;
}

.hero-text p {
  color: #558b2f;
  font-size: 0.92rem;
  margin-top: 2px;
}

/* Sections */
.settings-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.language-section {
  border: 2px solid rgba(76, 175, 80, 0.2);
  background: linear-gradient(135deg, #ffffff, #f9fdf7);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 1.3rem;
  line-height: 1;
  margin-top: 2px;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #2e7d32;
}

.section-hint {
  font-size: 0.8rem;
  color: #81c784;
  margin-top: 2px;
}

/* Language toggle */
.lang-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 2px solid #e8f5e9;
  background: #fafafa;
  font-size: 0.95rem;
  font-weight: 600;
  color: #546e7a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.lang-btn:hover {
  border-color: #a5d6a7;
  background: #f1f8e9;
}

.lang-btn.active {
  border-color: #43a047;
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  color: #1b5e20;
  box-shadow: 0 4px 14px rgba(67, 160, 71, 0.15);
}

.lang-flag {
  font-size: 1.1rem;
}

/* Location chips */
.location-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.location-chip {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #e8f5e9;
  background: #fafafa;
  font-size: 0.88rem;
  font-weight: 500;
  color: #455a64;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: center;
}

.location-chip:hover {
  border-color: #a5d6a7;
}

.location-chip.active {
  border-color: #43a047;
  background: #e8f5e9;
  color: #1b5e20;
  font-weight: 600;
}

/* Toggle list */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f8e9;
}

.toggle-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.toggle-label {
  font-size: 0.92rem;
  font-weight: 500;
  color: #37474f;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background-color: #cfd8dc;
  border-radius: 30px;
  transition: 0.3s;
}

.slider::before {
  content: "";
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.switch input:checked + .slider {
  background: #43a047;
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}

/* Save button */
.save-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #388e3c, #43a047);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(56, 142, 60, 0.3);
  font-family: inherit;
  margin-top: 4px;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(56, 142, 60, 0.35);
}

.saved-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

@media (max-width: 480px) {
  .settings-hero {
    flex-direction: column;
    text-align: center;
  }

  .location-grid {
    grid-template-columns: 1fr;
  }
}
</style>
