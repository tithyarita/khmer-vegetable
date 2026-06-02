<template>
  <div class="scene">
    <div class="bg-image" />
    <div class="split-container">
      <div class="split-image" />
      <div class="card">
        <div class="logo">
          <img src="../../assets/images/Logo.png">
        </div>

        <h1 class="heading">Create Account</h1>
        <p class="subtext">Join our community of fresh produce enthusiasts.</p>

        <form class="form-wrap" @submit.prevent="handleRegister">

          <div class="field">
            <label for="name">Full Name</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input id="name" v-model="name" type="text" placeholder="Sokha Mean" autocomplete="name" />
            </div>
          </div>

          <div class="field">
            <label for="email">Email</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              <input id="email" v-model="email" type="email" placeholder="sokha@emeraldgrove.com" autocomplete="email" />
            </div>
          </div>

          <div class="field">
            <label for="phone">Phone Number</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input id="phone" v-model="phone" type="tel" placeholder="+855 12 345 678" autocomplete="tel" />
            </div>
          </div>

          <div class="row-fields">
            <div class="field">
              <label for="password">Password</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="new-password" />
              </div>
            </div>

            <div class="field">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password" />
              </div>
            </div>
          </div>

          <div v-if="error" class="error-msg form-error">{{ error }}</div>
          <div v-if="success" class="success-msg">{{ success }}</div>

          <button class="btn-login" type="submit" :disabled="loading">
            <span>{{ loading ? 'Creating Account…' : 'Create Account' }}</span>
            <span v-if="loading" class="spinner" />
          </button>
        </form>

        <p class="signup-row">
          Already have an account? <a href="#" @click.prevent="$router.push('/login')">Log In</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (!name.value || !email.value || !phone.value || !password.value || !confirmPassword.value) {
    error.value = 'All fields are required.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/users/register`, {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    })

    success.value = res.data.message || 'Registration successful!'

    name.value = ''
    email.value = ''
    phone.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.'
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
  padding: 36px 40px 32px;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

.logo { display: flex; justify-content: center; margin-bottom: 24px; }
.logo img { width: 100px; height: auto; }

.heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 600;
  color: var(--green-deep);
  text-align: center;
  margin: 0;
}
.subtext { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin: 6px 0 24px; }



.field { margin-bottom: 14px; }
.field label { display: block; font-size: 0.82rem; font-weight: 500; color: var(--text-dark); margin-bottom: 5px; letter-spacing: 0.02em; }

.input-wrap { position: relative; display: flex; align-items: center; }

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  width: 16px; height: 16px;
  pointer-events: none;
  transition: color 0.2s;
}
.input-wrap:focus-within .input-icon { color: var(--green-mid); }

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"] {
  width: 100%;
  padding: 11px 14px 11px 42px;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}

input::placeholder { color: #a0b4a8; }

input:focus {
  border-color: var(--green-accent);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 0 0 3px rgba(82,183,136,0.14);
}

.row-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.row-fields .field { margin-bottom: 0; }

.error-msg { font-size: 0.78rem; color: var(--error); display: block; }

.form-error, .success-msg {
  font-size: 0.85rem;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 4px;
  text-align: center;
}
.form-error  { background: #f8d7da; color: #721c24; }
.success-msg { background: #d4edda; color: #155724; }

.btn-login {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, var(--green-mid) 0%, #1f5c3f 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 4px 16px rgba(45,106,79,0.4);
  margin-top: 6px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(45,106,79,0.5);
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

.signup-row { text-align: center; margin-top: 20px; font-size: 0.87rem; color: var(--text-muted); }
.signup-row a { color: var(--green-mid); font-weight: 500; text-decoration: none; }

@media (max-width: 768px) {
  .split-container { flex-direction: column; margin: 16px; }
  .split-image { display: none; }
  .card { padding: 28px 20px; }
  .row-fields { grid-template-columns: 1fr; }
}
</style>
