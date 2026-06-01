<template>
  <div class="scene">
    <div class="bg-image" />
    <div class="split-container">
      <div class="split-image" />
      <div class="card" :class="{ shake: shaking }">
        <div class="logo">
          <img src="@/assets/images/Logo.png" alt="Logo" class="logo-icon" />
        </div>

        <h1 class="heading">Welcome Back</h1>
        <p class="subtext">Please enter your details to access your account.</p>

        <div class="field">
          <label for="email">Phone Number or Email</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
            <input id="email" v-model="email" type="email" placeholder="Enter your email" autocomplete="email" />
          </div>
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input id="password" v-model="password" :type="showPw ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" />
            <button class="eye-btn" type="button" @click="showPw = !showPw" :aria-label="showPw ? 'Hide password' : 'Show password'">
              <svg v-if="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div class="meta-row">
          <label class="remember">
            <input type="checkbox" v-model="remember" />
            Remember Me
          </label>
          <router-link to="/forgot-password" class="forgot">Forgot Password?</router-link>
        </div>

        <button class="btn-login" :disabled="loading" @click="handleLogin">
          <span>{{ loading ? 'Signing in…' : 'Log In' }}</span>
          <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <span v-else class="spinner" />
        </button>

        <div class="divider"><span>OR CONTINUE WITH</span></div>

        <div class="socials">
          <button class="btn-social" @click="handleSocial('Google')">
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Google
          </button>
          <button class="btn-social" @click="handleSocial('Facebook')">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" />
            Facebook
          </button>
        </div>

        <p class="signup-row">
          Don't have an account? <a href="#" @click.prevent="router.push('/register')">Sign Up</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email    = ref('')
const password = ref('')
const remember = ref(false)
const showPw   = ref(false)
const loading  = ref(false)
const shaking  = ref(false)

const errors = reactive({ email: '', password: '' })

function triggerShake () { shaking.value = true; setTimeout(() => (shaking.value = false), 450) }

function validate () {
  errors.email = ''; errors.password = ''
  let valid = true
  if (!email.value.trim()) { errors.email = 'Email or phone number is required.'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(email.value) && !/^\+?\d{7,}$/.test(email.value)) { errors.email = 'Please enter a valid email or phone number.'; valid = false }
  if (!password.value) { errors.password = 'Password is required.'; valid = false }
  else if (password.value.length < 6) { errors.password = 'Password must be at least 6 characters.'; valid = false }
  return valid
}

async function handleLogin() {
  if (!validate()) { triggerShake(); return }
  loading.value = true
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/login`, { email: email.value, password: password.value })
    const user = data?.user; const token = data?.token || data?.access_token
    if (!user || !token) throw new Error('Invalid login response')
    let role = user.role
    if (typeof role === 'string') role = role.toLowerCase().replace(/\s+/g, '')
    else role = ''
    userStore.setUser(user, token)
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      if ((role === 'admin' && redirect.startsWith('/admin')) || (role === 'provider' && redirect.startsWith('/provider')) || (role === 'staff' && redirect.startsWith('/staff'))) {
        router.replace(redirect); return
      }
    }
    if (role === 'admin') router.replace('/admin/dashboard')
    else if (role === 'provider') router.replace('/provider/dashboard')
    else if (role === 'staff') router.replace('/staff/dashboard')
    else router.replace('/home')
  } catch (err) {
    console.error(err); errors.email = 'Invalid credentials. Please try again.'; triggerShake()
  } finally { loading.value = false }
}

function handleSocial (provider) { console.log('Continue with', provider) }
</script>

<style scoped>
.scene {
  --green-deep:   #1a3a2a;
  --green-mid:    #2d6a4f;
  --green-accent: #52b788;
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

.split-container {
  position: relative;
  z-index: 1;
  display: flex;
  max-width: 900px;
  width: 100%;
  margin: 0 24px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(26,58,42,0.22);
  animation: cardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.split-image {
  flex: 1;
  background: url('../../assets/images/pic.png') center / cover no-repeat;
}

.card {
  flex: 1;
  background: rgba(244, 241, 235, 0.95);
  backdrop-filter: blur(18px) saturate(1.3);
  padding: 44px 44px 40px;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}
.shake { animation: shake 0.4s ease; }

.logo { display: flex; justify-content: center; margin-bottom: 28px; }
.logo-icon { width: 100px; height: auto; }

.heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 600;
  color: var(--green-deep);
  text-align: center;
  margin: 0;
}
.subtext { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin: 6px 0 28px; }

.field { margin-bottom: 18px; }
.field label { display: block; font-size: 0.82rem; font-weight: 500; color: var(--text-dark); margin-bottom: 6px; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute; left: 14px; color: var(--text-muted);
  width: 17px; height: 17px; pointer-events: none;
}
.input-wrap:focus-within .input-icon { color: var(--green-mid); }

input[type="email"], input[type="password"], input[type="text"] {
  width: 100%; padding: 12px 14px 12px 42px;
  background: #f4f6f5; border: 1.5px solid #e2e8e6; border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.93rem; color: var(--text-dark);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}
input::placeholder { color: #a0b4a8; }
input:focus { border-color: var(--green-accent); background: #fff; box-shadow: 0 0 0 3px rgba(82,183,136,0.14); }

.error-msg { font-size: 0.78rem; color: var(--error); margin-top: 4px; display: block; }

.eye-btn {
  position: absolute; right: 12px; background: none; border: none;
  cursor: pointer; color: var(--text-muted); display: flex; padding: 0;
}

.meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }

.remember { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; color: var(--text-muted); }
.remember input[type="checkbox"] {
  appearance: none; width: 17px; height: 17px;
  border: 1.5px solid #d0d8d2; border-radius: 5px; background: #f4f6f5;
  cursor: pointer; padding: 0; position: relative;
}
.remember input[type="checkbox"]:checked { background: var(--green-mid); border-color: var(--green-mid); }
.remember input[type="checkbox"]:checked::after {
  content: ''; position: absolute; left: 4px; top: 1px;
  width: 5px; height: 9px; border: 2px solid #fff; border-top: none; border-left: none; transform: rotate(45deg);
}

.forgot { font-size: 0.85rem; color: var(--green-mid); text-decoration: none; font-weight: 500; }

.btn-login {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, var(--green-mid) 0%, #1f5c3f 100%);
  color: #fff; border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 4px 16px rgba(45,106,79,0.4);
}
.btn-login:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,106,79,0.4); }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.divider span { font-size: 0.82rem; font-weight: 400; letter-spacing: 0.1em; color: var(--text-muted); }

.socials { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-social {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; background: rgba(255,255,255,0.72); border: 1.5px solid var(--border); border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.87rem; font-weight: 500; color: var(--text-dark);
  cursor: pointer; transition: background 0.2s, border-color 0.2s;
}
.btn-social:hover { background: rgba(255,255,255,0.92); border-color: rgba(45,106,79,0.3); }
.btn-social img { width: 17px; height: 17px; }

.signup-row { text-align: center; margin-top: 24px; font-size: 0.87rem; color: var(--text-muted); }
.signup-row a { color: var(--green-mid); font-weight: 500; text-decoration: none; }

@media (max-width: 768px) {
  .split-container { flex-direction: column; margin: 16px; }
  .split-image { display: none; }
  .card { padding: 32px 24px; }
}
</style>
