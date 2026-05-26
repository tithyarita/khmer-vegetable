<template>
  <div class="settings-page">

    <!-- Decorative Background -->
    <div class="leaf leaf-1"></div>
    <div class="leaf leaf-2"></div>

    <div class="settings-card">

      <!-- Header -->
      <div class="settings-header">
        <div class="logo-circle">🥬</div>

        <h1>{{ t('appName') }}</h1>
        <p>{{ t('settings') }}</p>
      </div>

      <!-- Location -->
      <div class="settings-group">

        <label for="location">
          📍 {{ t('location') }}
        </label>

        <select id="location" v-model="location">
          <option value="phnom_penh">Phnom Penh</option>
          <option value="siem_reap">Siem Reap</option>
          <option value="battambang">Battambang</option>
          <option value="other">Other</option>
        </select>

      </div>

      <!-- Language -->
      <div class="settings-group">

        <label for="language">
          🌐 {{ t('language') }}
        </label>

        <select id="language" v-model="language">
          <option value="en">English</option>
          <option value="km">Khmer</option>
        </select>

      </div>

      <!-- Notifications -->
      <div class="settings-group">

        <label>
          🔔 {{ t('notifications') }}
        </label>

        <!-- Email -->
        <div class="toggle-card">

          <span>{{ t('emailUpdates') }}</span>

          <label class="switch">
            <input
              type="checkbox"
              v-model="notification.email"
            />

            <span class="slider"></span>
          </label>

        </div>

        <!-- SMS -->
        <div class="toggle-card">

          <span>{{ t('smsPromotions') }}</span>

          <label class="switch">
            <input
              type="checkbox"
              v-model="notification.sms"
            />

            <span class="slider"></span>
          </label>

        </div>

        <!-- Push -->
        <div class="toggle-card">

          <span>{{ t('pushNotifications') }}</span>

          <label class="switch">
            <input
              type="checkbox"
              v-model="notification.push"
            />

            <span class="slider"></span>
          </label>

        </div>

      </div>

      <!-- Save -->
      <button
        class="save-btn"
        @click="saveSettings"
      >
        {{ t('save') }}
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { useI18n } from '@/composables/useI18n'

const { t, languageStore } = useI18n()

const location = ref('phnom_penh')

const language = ref(languageStore.language)

const notification = ref({
  email: true,
  sms: false,
  push: true
})

watch(language, (newLang) => {
  languageStore.setLanguage(newLang)
})

function saveSettings() {
  alert(t('saved'))
}
</script>

<style scoped>

/* =========================
   PAGE
========================= */

.settings-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #edf7e7,
    #d8f3c3
  );

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 30px;

  position: relative;
  overflow: hidden;

  font-family: 'Poppins', sans-serif;
}

/* =========================
   DECORATION
========================= */

.leaf {
  position: absolute;
  border-radius: 50%;
  background: rgba(67, 160, 71, 0.12);
}

.leaf-1 {
  width: 220px;
  height: 220px;

  top: -60px;
  left: -60px;
}

.leaf-2 {
  width: 280px;
  height: 280px;

  bottom: -100px;
  right: -100px;
}

/* =========================
   CARD
========================= */

.settings-card {
  width: 100%;
  max-width: 430px;

  background: white;

  border-radius: 28px;

  padding: 32px 28px;

  box-shadow: 0 10px 30px rgba(0,0,0,0.08);

  position: relative;
  z-index: 2;
}

/* =========================
   HEADER
========================= */

.settings-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-circle {
  width: 80px;
  height: 80px;

  background: linear-gradient(
    135deg,
    #43a047,
    #66bb6a
  );

  color: white;

  border-radius: 50%;

  margin: 0 auto 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 2rem;

  box-shadow: 0 6px 18px rgba(67,160,71,0.3);
}

.settings-header h1 {
  font-size: 1.6rem;
  color: #2e7d32;
  margin-bottom: 4px;
}

.settings-header p {
  color: #6b8f71;
  font-size: 0.95rem;
}

/* =========================
   GROUP
========================= */

.settings-group {
  margin-bottom: 24px;

  display: flex;
  flex-direction: column;

  gap: 10px;
}

.settings-group label {
  font-weight: 600;
  color: #2f4f2f;
  font-size: 0.95rem;
}

/* =========================
   SELECT
========================= */

.settings-group select {
  padding: 12px 14px;

  border-radius: 14px;

  border: 1px solid #d7e9d0;

  background: #f8fff4;

  font-size: 1rem;

  outline: none;

  transition: 0.2s;
}

.settings-group select:focus {
  border-color: #66bb6a;

  box-shadow: 0 0 0 4px rgba(
    102,
    187,
    106,
    0.15
  );
}

/* =========================
   TOGGLE
========================= */

.toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: #f7fff3;

  border: 1px solid #e1f0db;

  padding: 14px 16px;

  border-radius: 16px;

  margin-top: 8px;
}

/* =========================
   SWITCH
========================= */

.switch {
  position: relative;

  display: inline-block;

  width: 52px;
  height: 28px;
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

  background-color: #c8d6c1;

  border-radius: 30px;

  transition: 0.3s;
}

.slider::before {
  content: "";

  position: absolute;

  height: 22px;
  width: 22px;

  left: 3px;
  bottom: 3px;

  background: white;

  border-radius: 50%;

  transition: 0.3s;
}

.switch input:checked + .slider {
  background: #43a047;
}

.switch input:checked + .slider::before {
  transform: translateX(24px);
}

/* =========================
   BUTTON
========================= */

.save-btn {
  width: 100%;

  border: none;

  padding: 14px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #43a047,
    #66bb6a
  );

  color: white;

  font-size: 1rem;
  font-weight: 700;

  cursor: pointer;

  transition: 0.25s;

  box-shadow: 0 6px 18px rgba(
    67,
    160,
    71,
    0.25
  );
}

.save-btn:hover {
  transform: translateY(-2px);

  box-shadow: 0 10px 22px rgba(
    67,
    160,
    71,
    0.35
  );
}

</style>