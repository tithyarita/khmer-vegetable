<template>
  <div class="gate-shell">
    <div class="gate-card">

      <div class="brand">
        <i class="bi bi-leaf-fill brand-icon"></i>
        <span class="brand-name">Staff Console</span>
      </div>

      <div class="shield-wrap">
        <i class="bi bi-shield-lock-fill shield-icon"></i>
      </div>

      <h2 class="card-title">Two-Factor Verification</h2>
      <p class="card-sub">
        Enter the 6-digit code sent to <strong>{{ email }}</strong>
      </p>

      <div class="otp-row">
        <input
          v-for="(_, i) in otpDigits"
          :key="i"
          :ref="el => otpRefs[i] = el"
          v-model="otpDigits[i]"
          class="otp-box"
          :class="{ 'otp-error': otpError }"
          type="text"
          inputmode="numeric"
          maxlength="1"
          @input="onOtpInput(i)"
          @keydown.backspace="onOtpBackspace(i)"
          @paste.prevent="onOtpPaste($event)"
        />
      </div>

      <p v-if="otpError" class="err-msg">{{ otpError }}</p>

      <button
        class="btn-primary"
        @click="verify"
        :disabled="verifying || otpDigits.join('').length < 6"
      >
        <i v-if="verifying" class="bi bi-arrow-repeat spin"></i>
        {{ verifying ? 'Verifying…' : 'Confirm & Enter' }}
      </button>

      <button class="btn-resend" @click="resend" :disabled="cooldown > 0 || resending">
        {{ cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code' }}
      </button>

      <button class="btn-logout" @click="logout">← Logout instead</button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const API_BASE  = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const router    = useRouter()
const userStore = useUserStore()

const email      = ref(userStore.user?.email || '')
const otpDigits  = ref(['', '', '', '', '', ''])
const otpRefs    = ref([])
const otpError   = ref('')
const verifying  = ref(false)
const resending  = ref(false)
const cooldown   = ref(0)
let cooldownTimer = null

function startCooldown() {
  cooldown.value = 60
  cooldownTimer  = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function sendCode() {
  await fetch(`${API_BASE}/api/verify/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value }),
  })
  startCooldown()
}

onMounted(() => sendCode())
onUnmounted(() => clearInterval(cooldownTimer))

function onOtpInput(i) {
  otpDigits.value[i] = otpDigits.value[i].replace(/\D/g, '').slice(0, 1)
  otpError.value = ''
  if (otpDigits.value[i] && i < 5) otpRefs.value[i + 1]?.focus()
}
function onOtpBackspace(i) {
  if (!otpDigits.value[i] && i > 0) {
    otpDigits.value[i - 1] = ''
    otpRefs.value[i - 1]?.focus()
  }
}
function onOtpPaste(e) {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((ch, i) => { otpDigits.value[i] = ch })
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}

async function verify() {
  otpError.value = ''
  verifying.value = true
  const code = otpDigits.value.join('')
  try {
    const res  = await fetch(`${API_BASE}/api/verify/confirm`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid code')

    // Mark 2FA as done for this session
    sessionStorage.setItem('staff_2fa_ok', 'true')
    router.replace('/staff/dashboard')
  } catch (err) {
    otpError.value = err.message
  } finally {
    verifying.value = false
  }
}

async function resend() {
  resending.value = true
  otpDigits.value = ['', '', '', '', '', '']
  otpError.value  = ''
  await sendCode()
  resending.value = false
}

function logout() {
  userStore.logout()
  router.replace('/user/login')
}
</script>

<style scoped>
.gate-shell { min-height: 100vh; background: linear-gradient(135deg, #0f2d1a, #1a3d2a); display: flex; align-items: center; justify-content: center; padding: 24px; }
.gate-card  { background: #fff; border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 400px; box-shadow: 0 16px 60px rgba(0,0,0,.3); display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }

.brand { display: flex; align-items: center; gap: 8px; }
.brand-icon { font-size: 20px; color: #2d7a4f; }
.brand-name { font-size: 15px; font-weight: 700; color: #1a1a2e; }

.shield-wrap  { background: #f0fdf4; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.shield-icon  { font-size: 30px; color: #16a34a; }
.card-title   { font-size: 22px; font-weight: 800; color: #1a1a2e; margin: 0; }
.card-sub     { font-size: 13.5px; color: #6b7280; margin: 0; line-height: 1.6; }

.otp-row  { display: flex; gap: 10px; justify-content: center; }
.otp-box  { width: 46px; height: 54px; border: 1.5px solid #e2e5ea; border-radius: 10px; text-align: center; font-size: 22px; font-weight: 700; color: #1a1a2e; outline: none; transition: border-color .15s; }
.otp-box:focus    { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,.1); }
.otp-box.otp-error { border-color: #dc2626; }
.err-msg  { font-size: 12px; color: #dc2626; margin: 0; }

.btn-primary { width: 100%; background: #1f4e2e; color: #fff; border: none; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary:hover:not(:disabled) { background: #2d7a4f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-resend  { background: #f3f4f6; border: none; border-radius: 10px; padding: 10px; width: 100%; font-size: 13px; color: #374151; cursor: pointer; font-family: inherit; }
.btn-resend:disabled { opacity: 0.5; cursor: default; }

.btn-logout  { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; font-family: inherit; }
.btn-logout:hover { color: #dc2626; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin .7s linear infinite; }
</style>