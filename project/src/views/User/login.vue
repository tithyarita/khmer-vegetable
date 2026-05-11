<template>
  <div class="login-page">

    <!-- LEFT -->
    <div class="login-left">

      <div class="brand">
        <h2>Organic Editorial</h2>
      </div>

      <template v-if="userStore.isLoggedIn">
        <h1>Welcome, {{ userStore.user?.name || userStore.user?.email }}</h1>
        <p class="subtitle">You are logged in as <b>{{ userStore.user?.email }}</b></p>
        <button class="login-btn" @click="userStore.logout()">Logout</button>
      </template>
      <template v-else>
        <h1>Welcome Back</h1>
        <p class="subtitle">
          Login to your account to manage your fresh harvest.
        </p>

        <!-- FORM -->
        <form class="login-form" @submit="handleLogin">

          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="name@example.com"
            required
          />

          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="********"
            required
          />

          <div class="form-options">
            <label>
              <input type="checkbox" />
              Remember Me
            </label>

            <a href="#" class="forgot">Forgot Password?</a>
          </div>

          <button class="login-btn" type="submit" :disabled="loading">
            {{ loading ? "Logging in..." : "Login" }}
          </button>

          <button class="register-btn" type="button">
            Register Account
          </button>

        </form>
      </template>

      <footer>
        <small>© 2024 The Digital Greenhouse</small>
      </footer>

    </div>

    <!-- RIGHT -->
    <div class="login-right">
      <h2>Supporting local Cambodian farmers since 2012</h2>
      <p>
        Join the most efficient organic marketplace.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

import { useRoute } from 'vue-router'

const route = useRoute()

async function handleLogin(e) {
  e.preventDefault()
  loading.value = true

  try {
    const res = await axios.post(
      "http://localhost:3000/auth/login",
      {
        email: email.value,
        password: password.value
      }
    )

    const user = res.data.user
    const token = res.data.access_token

    // ❗ safety check
    if (!user || !user.role) {
      throw new Error("Role missing from backend response")
    }

    // save session in store
    userStore.setUser(user, token)

    // 🚀 ROLE REDIRECT
    // If redirected here, only allow if role matches
    const redirectPath = route.query.redirect || null
    if (redirectPath) {
      if (
        (user.role === 'admin' && redirectPath.startsWith('/admin')) ||
        (user.role === 'provider' && redirectPath.startsWith('/provider'))
      ) {
        router.push(redirectPath)
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'provider') {
        router.push('/provider/dashboard')
      } else {
        router.push('/') // customer goes to homepage
      }
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else if (user.role === 'provider') {
      router.push('/provider/dashboard')
    } else {
      router.push('/') // customer goes to homepage
    }

  } catch (err) {
    console.error(err)
    alert("Login failed. Wrong email or password.")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  font-family: system-ui;
}

/* LEFT SIDE */
.login-left {
  flex: 1;
  background: #fff;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand h2 {
  color: #1a3c1a;
  margin-bottom: 40px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

/* FORM */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.forgot {
  color: #1a3c1a;
}

.login-btn {
  background: #1a3c1a;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-btn {
  background: transparent;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
}

/* RIGHT SIDE */
.login-right {
  flex: 1;
  background: linear-gradient(120deg, #e6f4e6, #f8f8f8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
}
</style>