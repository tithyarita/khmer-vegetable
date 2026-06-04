<template>
  <div class="card">
    <h3 class="card-title">Security & Access</h3>
    <p class="card-subtitle">
      Manage your credentials and view your recent login activity across all devices.
    </p>

    <div class="security-meta">
      <span class="meta-badge">
        <i class="bi bi-circle-fill dot-green"></i>
        Last login: {{ lastLogin }}
      </span>
      <span class="meta-badge">
        <i class="bi bi-geo-alt"></i>
        {{ location }}
      </span>
    </div>

    <!-- Step 1: Locked — verify identity first -->
    <div v-if="step === 'idle'" class="verify-prompt">
      <div class="verify-info">
        <i class="bi bi-shield-lock verify-icon"></i>
        <div>
          <p class="verify-title">Change Password</p>
          <p class="verify-sub">
            A 6-digit code will be sent to your email to confirm it's you before any changes are made.
          </p>
        </div>
      </div>
      <button class="btn-update" @click="requestOtp" :disabled="sendingOtp">
        <i v-if="sendingOtp" class="bi bi-arrow-repeat spin"></i>
        {{ sendingOtp ? 'Sending code…' : 'Verify Identity to Change Password' }}
      </button>
      <p v-if="sendError" class="err-msg">{{ sendError }}</p>
    </div>

    <!-- Step 2: OTP input -->
    <div v-if="step === 'otp'" class="otp-section">
      <p class="otp-info">
        Enter the 6-digit code sent to <strong>{{ userEmail }}</strong>
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
        class="btn-update"
        @click="confirmOtp"
        :disabled="verifyingOtp || otpDigits.join('').length < 6"
      >
        <i v-if="verifyingOtp" class="bi bi-arrow-repeat spin"></i>
        {{ verifyingOtp ? 'Verifying…' : 'Confirm Code' }}
      </button>

      <button class="btn-ghost" @click="reset">← Cancel</button>
    </div>

    <!-- Step 3: Password form (unlocked after OTP) -->
    <div v-if="step === 'form'" class="password-section">
      <div class="verified-banner">
        <i class="bi bi-check-circle-fill"></i>
        Identity verified — you may now change your password.
      </div>

      <div class="password-fields">
        <div class="field-group">
          <label class="field-label">CURRENT PASSWORD</label>
          <div class="input-wrap">
            <input
              class="field-input"
              :type="showCurrent ? 'text' : 'password'"
              v-model="currentPassword"
              placeholder="••••••••"
            />
            <button class="eye-btn" @click="showCurrent = !showCurrent" tabindex="-1">
              <i :class="showCurrent ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">NEW PASSWORD</label>
          <div class="input-wrap">
            <input
              class="field-input"
              :type="showNew ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="Enter new password"
            />
            <button class="eye-btn" @click="showNew = !showNew" tabindex="-1">
              <i :class="showNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="newPassword" class="strength-row">
            <div class="strength-bar">
              <div class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></div>
            </div>
            <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
          </div>
        </div>
      </div>

      <button class="btn-update" @click="handleUpdate">Update Password</button>
      <button class="btn-ghost" @click="reset">Cancel</button>
    </div>

  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default {
  name: 'SecurityAccess',
  emits: ['update-password'],
  props: {
    lastLogin: { type: String, default: '2 hours ago' },
    location:  { type: String, default: 'Unknown' },
  },

  setup() {
    const userStore = useUserStore()
    return { userStore }
  },

  data() {
    return {
      step: 'idle',       // 'idle' | 'otp' | 'form'

      // OTP
      sendingOtp:  false,
      sendError:   '',
      otpDigits:   ['', '', '', '', '', ''],
      otpRefs:     [],
      otpError:    '',
      verifyingOtp: false,

      // Password
      currentPassword: '',
      newPassword:     '',
      showCurrent:     false,
      showNew:         false,
    }
  },

  computed: {
    userEmail() {
      return this.userStore?.user?.email || ''
    },

    passwordStrength() {
      const p = this.newPassword
      if (!p) return 0
      let score = 0
      if (p.length >= 8)         score++
      if (/[A-Z]/.test(p))       score++
      if (/[0-9]/.test(p))       score++
      if (/[^A-Za-z0-9]/.test(p)) score++
      return score
    },
    strengthClass() {
      return ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'][this.passwordStrength] || ''
    },
    strengthWidth() {
      return (this.passwordStrength / 4 * 100) + '%'
    },
    strengthLabel() {
      return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] || ''
    },
  },

  methods: {
    reset() {
      this.step            = 'idle'
      this.otpDigits       = ['', '', '', '', '', '']
      this.otpError        = ''
      this.sendError       = ''
      this.currentPassword = ''
      this.newPassword     = ''
    },

    // ── Step 1: Send OTP ───────────────────────────────────────────────────
    async requestOtp() {
      if (!this.userEmail) {
        this.sendError = 'No email found. Please re-login.'
        return
      }
      this.sendingOtp = true
      this.sendError  = ''
      try {
        const res  = await fetch(`${API_BASE}/api/verify/send`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: this.userEmail }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to send code')
        this.step = 'otp'
      } catch (err) {
        this.sendError = err.message
      } finally {
        this.sendingOtp = false
      }
    },

    // ── Step 2: OTP helpers ────────────────────────────────────────────────
    onOtpInput(i) {
      this.otpDigits[i] = this.otpDigits[i].replace(/\D/g, '').slice(0, 1)
      this.otpError = ''
      if (this.otpDigits[i] && i < 5) {
        this.$nextTick(() => this.otpRefs[i + 1]?.focus())
      }
    },
    onOtpBackspace(i) {
      if (!this.otpDigits[i] && i > 0) {
        this.otpDigits[i - 1] = ''
        this.$nextTick(() => this.otpRefs[i - 1]?.focus())
      }
    },
    onOtpPaste(e) {
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      text.split('').forEach((ch, i) => { this.otpDigits[i] = ch })
      this.$nextTick(() => this.otpRefs[Math.min(text.length, 5)]?.focus())
    },

    async confirmOtp() {
      this.otpError     = ''
      this.verifyingOtp = true
      const code = this.otpDigits.join('')
      try {
        const res  = await fetch(`${API_BASE}/api/verify/confirm`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: this.userEmail, code }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Invalid code')
        this.step = 'form'
      } catch (err) {
        this.otpError = err.message
      } finally {
        this.verifyingOtp = false
      }
    },

    // ── Step 3: Submit password change ────────────────────────────────────
    handleUpdate() {
      if (!this.currentPassword || !this.newPassword) {
        alert('Please fill in both password fields.')
        return
      }
      this.$emit('update-password', {
        currentPassword: this.currentPassword,
        newPassword:     this.newPassword,
      })
      this.reset()
    },
  },
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}
.card-title    { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 5px; }
.card-subtitle { font-size: 12.5px; color: #6b7280; margin: 0 0 16px; line-height: 1.55; }

.security-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.meta-badge    { display: inline-flex; align-items: center; gap: 5px; background: #f3f4f6; border-radius: 20px; padding: 5px 12px; font-size: 12px; color: #374151; font-weight: 500; }
.dot-green     { font-size: 7px; color: #2d7a4f; }

/* Verify prompt */
.verify-prompt { display: flex; flex-direction: column; gap: 14px; }
.verify-info   { display: flex; align-items: flex-start; gap: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; }
.verify-icon   { font-size: 22px; color: #16a34a; flex-shrink: 0; margin-top: 2px; }
.verify-title  { font-size: 13.5px; font-weight: 700; color: #1a1a2e; margin: 0 0 3px; }
.verify-sub    { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5; }

/* OTP */
.otp-section { display: flex; flex-direction: column; gap: 14px; }
.otp-info    { font-size: 13px; color: #374151; margin: 0; }
.otp-row     { display: flex; gap: 8px; justify-content: center; }
.otp-box     { width: 44px; height: 52px; border: 1.5px solid #e2e5ea; border-radius: 10px; text-align: center; font-size: 20px; font-weight: 700; color: #1a1a2e; outline: none; transition: border-color .15s; }
.otp-box:focus   { border-color: #2d7a4f; box-shadow: 0 0 0 3px rgba(45,122,79,.1); }
.otp-box.otp-error { border-color: #dc2626; }
.err-msg     { font-size: 12px; color: #dc2626; margin: 0; }

/* Verified banner */
.password-section   { display: flex; flex-direction: column; gap: 14px; }
.verified-banner    { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 12.5px; color: #166534; font-weight: 600; }

/* Password fields */
.password-fields { display: flex; flex-direction: column; gap: 14px; }
.field-group     { display: flex; flex-direction: column; gap: 5px; }
.field-label     { font-size: 10px; color: #9aa0ab; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
.input-wrap      { position: relative; display: flex; align-items: center; }
.field-input     { border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 38px 9px 12px; font-size: 13px; color: #1a1a2e; background: #fafafa; outline: none; font-family: inherit; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.field-input:focus { border-color: #2d7a4f; background: #fff; }
.field-input::placeholder { color: #c4c9d4; }
.eye-btn         { position: absolute; right: 10px; background: none; border: none; cursor: pointer; font-size: 14px; color: #9aa0ab; padding: 4px; }
.eye-btn:hover   { color: #374151; }

/* Strength */
.strength-row    { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.strength-bar    { flex: 1; height: 4px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.strength-fill   { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
.strength-label  { font-size: 11px; font-weight: 600; min-width: 40px; }
.strength-weak   { color: #d63b6b; background: #d63b6b; }
.strength-fair   { color: #f59e0b; background: #f59e0b; }
.strength-good   { color: #10b981; background: #10b981; }
.strength-strong { color: #2d7a4f; background: #2d7a4f; }

/* Buttons */
.btn-update { width: 100%; background: #1f4e2e; color: #fff; border: none; border-radius: 8px; padding: 11px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-update:hover:not(:disabled) { background: #2d7a4f; }
.btn-update:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost  { width: 100%; background: none; border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px; font-size: 13px; color: #6b7280; cursor: pointer; font-family: inherit; }
.btn-ghost:hover { background: #f9fafb; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin .7s linear infinite; }
</style>