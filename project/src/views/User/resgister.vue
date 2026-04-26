<template>
  <div class="register-page">

    <!-- LEFT SIDE -->
    <div class="register-left">
      <div class="brand">
        <span class="brand-icon"><i class="bi bi-leaf"></i></span>
        <h2>Harvest Ledger</h2>
      </div>

      <h1>Create Your Account</h1>
      <p class="subtitle">Join our community of fresh produce enthusiasts.</p>

      <form class="register-form" @submit.prevent="handleRegister">
        <label>Full Name</label>
        <input type="text" v-model="name" placeholder="Sokha Mean" />

        <label>Email</label>
        <input type="email" v-model="email" placeholder="sokha@harvestledger.com" />

        <label>Phone Number</label>
        <input type="tel" v-model="phone" placeholder="+855 12 345 678" />

        <div class="password-row">
          <div>
            <label>Password</label>
            <input type="password" v-model="password" placeholder="********" />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" v-model="confirmPassword" placeholder="********" />
          </div>
        </div>

        <button class="register-btn" :disabled="loading">
          {{ loading ? 'Registering...' : 'Create Account' }}
        </button>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>

        <div class="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>

    <!-- RIGHT SIDE -->
    <div class="register-right">
      <div
        class="market-bg"
        :style="{ backgroundImage: `url(${registerImage})` }"
      >
        <div class="overlay">

          <div class="market-pill">Market Live Now</div>

          <div class="market-info">
            <div class="guarantee">
              <span class="icon"><i class="bi bi-patch-check-fill"></i></span>
              <div>
                <strong>FRESHNESS GUARANTEED</strong><br />
                Direct from Farmers
              </div>
            </div>

            <p>
              Experience the true taste of Cambodia. Our marketplace connects
              you directly with local farmers to ensure every vegetable is
              harvested at its peak.
            </p>

            <div class="stats">
              <div><strong>500+</strong><span>PARTNERS</span></div>
              <div><strong>2.4 Tons</strong><span>DAILY YIELD</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// ✅ IMAGE IMPORT
import registerImage from '../../assets/images/register-image.jpg'

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
    const res = await axios.post('http://localhost:3000/users/register', {
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
.register-page {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* LEFT */
.register-left {
  flex: 1;
  background: white;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 30px;
}

.brand-icon {
  font-size: 2rem;
  color: #256d25;
}

h1 {
  font-size: 2.2rem;
  color: #1a3c1a;
}

.subtitle {
  margin-bottom: 20px;
  color: #6b7a6b;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #d1e7dd;
}

.password-row {
  display: flex;
  gap: 10px;
}

.register-btn {
  background: #1a3c1a;
  color: white;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
}

.register-btn:hover {
  background: #256d25;
}

.error {
  color: red;
  text-align: center;
}

.success {
  color: green;
  text-align: center;
}

.login-link {
  text-align: center;
}

/* RIGHT */
.register-right {
  flex: 1.2;
  height: 100vh;
}

/* FULL IMAGE */
.market-bg {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
}

/* OVERLAY */
.overlay {
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  box-sizing: border-box;
  align-items: center;
}

/* TOP BADGE */
.market-pill {
  align-self: flex-end;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* INFO CARD */
.market-info {
  background: rgba(255,255,255,0.95);
  padding: 24px;
  border-radius: 16px;
  max-width: 380px;
  backdrop-filter: blur(8px);
}

.market-info p {
  color: #555;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>