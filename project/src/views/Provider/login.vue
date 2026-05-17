<template>
  <div class="login-page">
    <div class="login-left">
      <h2>Provider Login</h2>
      <form class="login-form" @submit="handleLogin">
        <label>Email</label>
        <input v-model="email" type="email" required />
        <label>Password</label>
        <input v-model="password" type="password" required />
        <button type="submit" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useProviderStore } from '@/stores/providerStore'

const router = useRouter()
const store = useProviderStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin(e) {
  e.preventDefault()
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('http://localhost:3000/auth/login', {
      email: email.value,
      password: password.value
    })
    const user = res.data.user
    if (!user || user.role !== 'provider') {
      throw new Error('Not a provider account')
    }
    // Save provider info to store and localStorage
    store.updateProfile({
      name: user.name,
      location: user.location || '',
      id: user.id || '',
      joined: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      idNumber: user.idNumber || '',
      // Add more fields as needed
    })
    router.push('/provider/profile')
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; height: 100vh; }
.login-left { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.error { color: red; margin-top: 1rem; }
</style>
