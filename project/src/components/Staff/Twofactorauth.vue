<template>
  <div class="card twofa-card">

    <!-- OTP verification -->
    <div class="twofa-content">
      <div class="twofa-text">
        <h3 class="twofa-title">Two-Factor Verification</h3>
        <p class="twofa-sub">Enter the 6-digit code sent to <strong style="color:#fff;">{{ userEmail }}</strong></p>
      </div>

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

      <p v-if="otpError" class="err-msg-light">{{ otpError }}</p>

      <button
        class="btn-enable"
        @click="confirmOtp"
        :disabled="verifyingOtp || otpDigits.join('').length < 6"
      >
        <i v-if="verifyingOtp" class="bi bi-arrow-repeat spin"></i>
        {{ verifyingOtp ? 'Verifying…' : 'Confirm & Sign In' }}
      </button>
    </div>

    <i class="bi bi-shield-lock-fill twofa-deco"></i>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default {
  name: 'TwoFactorAuth',
  emits: ['verified'],

  setup() {
    const userStore = useUserStore()
    return { userStore }
  },

  data() {
    return {
      otpDigits:    ['', '', '', '', '', ''],
      otpRefs:      [],
      otpError:     '',
      verifyingOtp: false,
    }
  },

  computed: {
    userEmail() { return this.userStore?.user?.email || '' },
  },

  methods: {
    onOtpInput(i) {
      this.otpDigits[i] = this.otpDigits[i].replace(/\D/g, '').slice(0, 1)
      this.otpError = ''
      if (this.otpDigits[i] && i < 5) this.$nextTick(() => this.otpRefs[i + 1]?.focus())
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
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.userEmail, code }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Invalid code')

        this.$emit('verified')
      } catch (err) {
        this.otpError = err.message
        this.otpDigits = ['', '', '', '', '', '']
        this.$nextTick(() => this.otpRefs[0]?.focus())
      } finally {
        this.verifyingOtp = false
      }
    },
  },
}
</script>

<style scoped>
.card { border-radius: 14px; border: 1px solid transparent; padding: 22px 24px; }
.twofa-card { background: #1f4e2e; border-color: #1f4e2e; position: relative; overflow: hidden; }
.twofa-content { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
.twofa-title { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.twofa-sub   { font-size: 12.5px; color: #a8c5b0; margin: 0; line-height: 1.55; }

.otp-row  { display: flex; gap: 7px; }
.otp-box  { width: 40px; height: 48px; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 8px; text-align: center; font-size: 18px; font-weight: 700; color: #fff; background: rgba(255,255,255,0.1); outline: none; transition: border-color .15s; }
.otp-box:focus     { border-color: #fff; }
.otp-box.otp-error { border-color: #f87171; }
.err-msg-light { font-size: 12px; color: #fca5a5; margin: 0; }

.btn-enable {
  align-self: flex-start;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.24);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  letter-spacing: 0.5px;
  font-family: inherit;
  transition: background 0.15s;
  display: flex; align-items: center; gap: 8px;
}
.btn-enable:hover:not(:disabled) { background: rgba(255,255,255,0.24); }
.btn-enable:disabled { opacity: 0.6; cursor: not-allowed; }

.twofa-deco { position: absolute; right: -12px; bottom: -14px; font-size: 88px; color: rgba(255,255,255,0.06); pointer-events: none; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin .7s linear infinite; }
</style>