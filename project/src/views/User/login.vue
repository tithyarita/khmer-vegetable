<template>
  <div class="login-page">

    <!-- LEFT PANEL -->
    <div class="login-card">

      <div class="brand">
        <h1>🌿 Organic Editorial</h1>
        <p>Admin & Provider Dashboard</p>
      </div>

      <!-- LOGGED IN STATE -->
      <div v-if="userStore?.isLoggedIn" class="logged-in">
        <h2>Welcome back 👋</h2>

        <p class="email">
          {{ userStore?.user?.name || userStore?.user?.email }}
        </p>

        <small>
          Role: <b>{{ userStore?.user?.role }}</b>
        </small>

        <button class="btn logout" @click="userStore.logout()">
          Logout
        </button>
      </div>

      <!-- LOGIN FORM -->
      <form v-else class="form" @submit.prevent="handleLogin">

        <h2>Sign in</h2>
        <p class="sub">Enter your credentials to continue</p>

        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" required />

        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" required />

<<<<<<< HEAD
        <div class="row">
          <label class="remember">
            <input type="checkbox" />
            Remember me
          </label>
=======
          <button class="register-btn" type="button" @click="router.push('/register')">
            Register Account
          </button>
>>>>>>> 20c47a3818bb09dac006de01bb4facc5c29a33ad

          <a href="#" class="forgot">Forgot?</a>
        </div>

        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>

        <button class="btn ghost" type="button">
          Create account
        </button>

      </form>

      <footer>
        <small>© 2026 Digital Greenhouse System</small>
      </footer>

    </div>

    <!-- RIGHT PANEL -->
    <div class="hero">
      <div class="overlay">
        <h2>Smart Agricultural Marketplace</h2>
        <p>
          Manage users, providers, orders and products in one unified system.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
<<<<<<< HEAD
    const { data } = await axios.post('http://localhost:3000/auth/login', {
      email: email.value,
      password: password.value
    })
=======
    const res = await axios.post(
      "http://localhost:3001/auth/login",
      {
        email: email.value,
        password: password.value
      }
    )
>>>>>>> 20c47a3818bb09dac006de01bb4facc5c29a33ad

    const user = data?.user
    const token = data?.token || data?.access_token

    if (!user || !token) {
      throw new Error('Invalid login response')
    }


    // Normalize role robustly
    let role = user.role
    if (typeof role === 'string') {
      role = role.toLowerCase().replace(/\s+/g, '')
    } else {
      role = ''
    }

    // Extra debug logging
    console.log('[LOGIN DEBUG] user:', user)
    console.log('[LOGIN DEBUG] role:', role)
    console.log('[LOGIN DEBUG] redirect:', route.query.redirect)

    userStore.setUser(user, token)

    // SAFE redirect handling
    const redirect = route.query.redirect

    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      if (
        (role === 'admin' && redirect.startsWith('/admin')) ||
        (role === 'provider' && redirect.startsWith('/provider')) ||
        (role === 'staff' && redirect.startsWith('/staff'))
      ) {
        console.log('[LOGIN DEBUG] Redirecting to:', redirect)
        router.replace(redirect)
        return
      }
    }

    // default routing
    if (role === 'admin') {
      console.log('[LOGIN DEBUG] Default admin redirect')
      router.replace('/admin/dashboard')
    } else if (role === 'provider') {
      console.log('[LOGIN DEBUG] Default provider redirect')
      router.replace('/provider/dashboard')
    } else if (role === 'staff') {
      console.log('[LOGIN DEBUG] Default staff redirect')
      router.replace('/staff/dashboard')
    } else {
      console.log('[LOGIN DEBUG] Default home redirect')
      router.replace('/home')
    }

  } catch (err) {
    console.error(err)
    alert(err?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: grid;
  grid-template-columns: 420px 1fr;
  font-family: system-ui;
}

/* LEFT CARD */
.login-card {
  background: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #eee;
}

/* BRAND */
.brand h1 {
  font-size: 22px;
  margin: 0;
}

.brand p {
  font-size: 13px;
  color: #777;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form h2 {
  margin-bottom: 0;
}

.sub {
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
}

input {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
}

input:focus {
  border-color: #16a34a;
}

/* ROW */
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.forgot {
  color: #16a34a;
  text-decoration: none;
}

/* BUTTONS */
.btn {
  padding: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.primary {
  background: #16a34a;
  color: white;
}

.logout {
  background: #ef4444;
  color: white;
  margin-top: 10px;
}

.ghost {
  background: #f3f4f6;
}

/* LOGGED IN */
.logged-in {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.email {
  font-weight: bold;
}

/* RIGHT HERO */
.hero {
  background: linear-gradient(135deg, #16a34a, #14532d);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  text-align: center;
  max-width: 400px;
  padding: 20px;
}

.overlay h2 {
  font-size: 28px;
}
</style>