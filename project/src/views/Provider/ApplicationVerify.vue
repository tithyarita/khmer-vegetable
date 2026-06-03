<template>
  <div class="verify-shell">

    <div class="verify-card">

      <!-- Logo -->
      <div class="brand">
        <i class="bi bi-leaf-fill brand-icon"></i>
        <span class="brand-name">Provider Portal</span>
      </div>

      <!-- Step 1: Enter email -->
      <template v-if="step === 1">
        <h2 class="card-title">Verify your email</h2>
        <p class="card-sub">
          We'll send a 6-digit code to confirm you're a real person before you
          can access the application form.
        </p>

        <div class="field-group">
          <label class="field-label">Email Address <span class="req">*</span></label>
          <input
            v-model="email"
            class="field-input"
            :class="{ 'input-error': emailError }"
            type="email"
            placeholder="hello@yourfarm.com"
            @keydown.enter="sendOtp"
            :disabled="sending"
          />
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>

        <button class="btn-primary" @click="sendOtp" :disabled="sending">
          <i v-if="sending" class="bi bi-arrow-repeat spin"></i>
          <span>{{ sending ? 'Sending code…' : 'Send verification code' }}</span>
          <i v-if="!sending" class="bi bi-arrow-right"></i>
        </button>

        <div v-if="sendError" class="alert alert-error">{{ sendError }}</div>
      </template>

      <!-- Step 2: Enter OTP -->
      <template v-if="step === 2">
        <h2 class="card-title">Enter the code</h2>
        <p class="card-sub">
          We sent a 6-digit code to <strong>{{ email }}</strong>.
          It expires in 10 minutes.
        </p>

        <!-- 6 individual boxes -->
        <div class="otp-row">
          <input
            v-for="(_, i) in otpDigits"
            :key="i"
            :ref="el => otpRefs[i] = el"
            v-model="otpDigits[i]"
            class="otp-box"
            :class="{ 'input-error': otpError }"
            type="text"
            inputmode="numeric"
            maxlength="1"
            @input="onOtpInput(i)"
            @keydown.backspace="onOtpBackspace(i)"
            @paste.prevent="onOtpPaste($event)"
          />
        </div>

        <span v-if="otpError" class="field-error" style="text-align:center;display:block;">
          {{ otpError }}
        </span>

        <button class="btn-primary" @click="verifyOtp" :disabled="verifying || otpDigits.join('').length < 6">
          <i v-if="verifying" class="bi bi-arrow-repeat spin"></i>
          <span>{{ verifying ? 'Verifying…' : 'Confirm & continue' }}</span>
          <i v-if="!verifying" class="bi bi-check-lg"></i>
        </button>

        <button class="btn-ghost" @click="resendOtp" :disabled="resendCooldown > 0">
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
        </button>

        <button class="btn-text" @click="step = 1">← Use a different email</button>

        <div v-if="otpError" class="alert alert-error">{{ otpError }}</div>
      </template>

    </div>

  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const router   = useRouter()

// ── State ──────────────────────────────────────────────────────────────────
const step    = ref(1)
const email   = ref('')

const sending   = ref(false)
const sendError = ref('')
const emailError = ref('')

const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs   = ref([])
const otpError  = ref('')
const verifying = ref(false)

const resendCooldown = ref(0)
let cooldownTimer = null

// ── Send OTP ───────────────────────────────────────────────────────────────
async function sendOtp() {
  emailError.value = ''
  sendError.value  = ''

  const val = email.value.trim()
  if (!val) { emailError.value = 'Email is required.'; return }
  if (!/\S+@\S+\.\S+/.test(val)) { emailError.value = 'Enter a valid email address.'; return }

  sending.value = true
  try {
    const res  = await fetch(`${API_BASE}/api/verify/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: val }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to send code')

    step.value = 2
    startCooldown()
  } catch (err) {
    sendError.value = err.message
  } finally {
    sending.value = false
  }
}

// ── Resend ─────────────────────────────────────────────────────────────────
function startCooldown() {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function resendOtp() {
  otpDigits.value = ['', '', '', '', '', '']
  otpError.value  = ''
  await sendOtp()
}

// ── OTP input helpers ──────────────────────────────────────────────────────
function onOtpInput(i) {
  const val = otpDigits.value[i]
  // Allow only one digit
  otpDigits.value[i] = val.replace(/\D/g, '').slice(0, 1)
  if (otpDigits.value[i] && i < 5) {
    otpRefs.value[i + 1]?.focus()
  }
  otpError.value = ''
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

// ── Verify OTP ─────────────────────────────────────────────────────────────
async function verifyOtp() {
  otpError.value  = ''
  verifying.value = true

  const code = otpDigits.value.join('')
  try {
    const res  = await fetch(`${API_BASE}/api/verify/confirm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.value.trim(), code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Invalid code')

    // Store verified state in sessionStorage so form knows it's allowed
    sessionStorage.setItem('app_verified_email', email.value.trim())
    router.replace('/application-form')

  } catch (err) {
    otpError.value = err.message
  } finally {
    verifying.value = false
  }
}

onUnmounted(() => clearInterval(cooldownTimer))
</script>

<style scoped>
.verify-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7f0, #e8f5e8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.verify-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 40px rgba(0,0,0,.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Brand */
.brand { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.brand-icon { font-size: 20px; color: #2d7a4f; }
.brand-name { font-size: 15px; font-weight: 700; color: #1a1a2e; }

/* Titles */
.card-title { font-size: 22px; font-weight: 800; color: #1a1a2e; margin: 0; }
.card-sub   { font-size: 13.5px; color: #6b7280; margin: 0; line-height: 1.6; }

/* Field */
.field-group  { display: flex; flex-direction: column; gap: 6px; }
.field-label  { font-size: 12px; font-weight: 600; color: #374151; }
.req          { color: #dc2626; }
.field-input  {
  border: 1.5px solid #e2e5ea;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  width: 100%;
}
.field-input:focus { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,.1); }
.input-error  { border-color: #dc2626 !important; }
.field-error  { font-size: 12px; color: #dc2626; font-weight: 500; }

/* OTP boxes */
.otp-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.otp-box {
  width: 48px;
  height: 56px;
  border: 1.5px solid #e2e5ea;
  border-radius: 10px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.otp-box:focus { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,.1); }
.otp-box.input-error { border-color: #dc2626; }

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1f4e2e;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 13px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
  width: 100%;
}
.btn-primary:hover:not(:disabled) { background: #2d7a4f; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  padding: 11px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}
.btn-ghost:disabled { opacity: 0.5; cursor: default; }

.btn-text {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
}
.btn-text:hover { color: #1a1a2e; }

/* Alert */
.alert { border-radius: 10px; padding: 12px 14px; font-size: 13px; }
.alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin .7s linear infinite; }
</style>