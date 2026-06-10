<template>
  <div class="scene">
    <div class="bg-image" />

    <div class="card">
      <div class="logo">
        <img src="../../assets/images/Logo.png" alt="Logo" class="logo-icon" />
        <span class="logo-name">Emerald Grove</span>
      </div>

      <h1 class="heading">Verify OTP</h1>
      <p class="subtext">Enter the 6-digit code sent to {{ contact }}</p>

      <div class="form-wrap">
        <div class="field">
          <label for="otp">One-Time Password</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
            <input
              id="otp"
              v-model="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              autocomplete="off"
              @keyup.enter="handleVerify"
            />
          </div>
          <span v-if="error" class="error-msg">{{ error }}</span>
        </div>

        <button class="btn-login" :disabled="loading" @click="handleVerify">
          <span>{{ loading ? 'Verifying…' : 'Verify Code' }}</span>
          <span v-if="loading" class="spinner" />
        </button>
      </div>

      <p class="back-row">
        <a href="#" @click.prevent="router.push('/forgot-password')">&larr; Back to Forgot Password</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const contact = ref(route.query.contact || '')
const otp = ref('')
const loading = ref(false)
const error = ref('')

async function handleVerify() {
  const code = otp.value.trim()
  if (!code || code.length !== 6) {
    error.value = 'Please enter a valid 6-digit code.'
    return
  }

  loading.value = true
  error.value = ''

  const isEmail = /\S+@\S+\.\S+/.test(contact.value)
  const isPhone = /^\+?\d{7,}$/.test(contact.value)
  const payload = isPhone
    ? { phone: contact.value, otp: code }
    : { email: contact.value, otp: code }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/verify-otp`, payload)
    router.push(`/reset-password?token=${res.data.reset_token}`)
  } catch (e) {
    error.value = e.response?.data?.message || 'Invalid or expired code. Try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.scene {
  --green-deep:   #1a3a2a;
  --green-mid:    #2d6a4f;
  --green-accent: #52b788;
  --cream:        #f4f1eb;
  --card-bg:      rgba(244, 241, 235, 0.93);
  --text-dark:    #1a2e22;
  --text-muted:   #5a7a65;
  --border:       rgba(45, 106, 79, 0.18);
  --error:        #c0392b;

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(26,58,42,0.82) 0%, rgba(26,58,42,0.45) 50%, rgba(26,58,42,0.78) 100%),
    url('../../assets/images/background.png') center / cover no-repeat;
  filter: saturate(1.1);
  z-index: 0;
}

.card {
  position: relative;
  z-index: 1;
  background: var(--card-bg);
  backdrop-filter: blur(18px) saturate(1.3);
  border: 1px solid rgba(255,255,255,0.55);
  border-radius: 24px;
  padding: 48px 52px 44px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 32px 80px rgba(26,58,42,0.22);
  animation: cardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}
.logo img { width: 120px; height: auto; display: block; }
.logo-icon   { width: 64px; height: 64px; border-radius: 16px; }
.logo-name   { font-family: 'Cormorant Garamond', serif; font-size: 1.65rem; font-weight: 600; color: var(--green-deep); letter-spacing: 0.02em; }

.heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.1rem;
  font-weight: 600;
  color: var(--green-deep);
  text-align: center;
}

.subtext {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 300;
  margin: 8px 0 32px;
  word-break: break-all;
}

.form-wrap { margin-bottom: 0; }

.field        { margin-bottom: 20px; }
.field label  { display: block; font-size: 0.82rem; font-weight: 500; color: var(--text-dark); margin-bottom: 8px; letter-spacing: 0.02em; }

.input-wrap   { position: relative; display: flex; align-items: center; }

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  width: 17px; height: 17px;
  pointer-events: none;
  transition: color 0.2s;
}

.input-wrap:focus-within .input-icon { color: var(--green-mid); }

input[type="text"] {
  width: 100%;
  padding: 13px 14px 13px 42px;
  background: rgba(255,255,255,0.72);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

input::placeholder { color: #a0b4a8; }

input:focus {
  border-color: var(--green-accent);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 0 0 3px rgba(82,183,136,0.14);
}

.error-msg { font-size: 0.78rem; color: var(--error); margin-top: 5px; display: block; }

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--green-mid) 0%, #1f5c3f 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.97rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
  box-shadow: 0 4px 20px rgba(45,106,79,0.35);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(45,106,79,0.45);
  filter: brightness(1.08);
}

.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.back-row {
  text-align: center;
  margin-top: 28px;
  font-size: 0.88rem;
}

.back-row a {
  color: var(--green-mid);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.back-row a:hover { color: var(--green-deep); }
</style>
