<template>
  <div class="hero-card">
    <div class="hero-left">
      <h1 class="hero-title">
        Your Daily Dose<br>of<br>Fresh Vegetables
      </h1>
      <p class="hero-sub">
        Sign up for the daily newsletter and get
        <strong>up to 50% off</strong> on your first vegetable box.
      </p>
      <div v-if="subscribed" class="success-msg">
        ✅ Thanks! Check your inbox for your discount.
      </div>
      <div v-else class="hero-form">
        <input
          v-model="email"
          type="email"
          placeholder="Your email address"
          @keyup.enter="subscribe"
        />
        <button class="btn-subscribe" @click="subscribe">
          Subscribe
        </button>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="hero-right">
      <img
        src="https://images.unsplash.com/photo-1542838132-92c53300491e"
        alt="Vegetables"
      />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!email.value.includes('@')) {
    alert('Please enter a valid email')
    return
  }
  subscribed.value = true
  email.value = ''
}
</script>

<style scoped>
.hero-card {
  width: 100%;
  max-width: 1000px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

/* LEFT */
.hero-left {
  background: #1d5c35;
  color: white;
  padding: 50px;
}

.hero-title {
  font-size: 40px;
  margin-bottom: 20px;
}

.hero-sub {
  margin-bottom: 30px;
}

.hero-form {
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 50px;
  padding: 5px;
}

.hero-form input {
  flex: 1;
  border: none;
  background: transparent;
  color: white;
  padding: 10px;
  outline: none;
}

.btn-subscribe {
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
}

.success-msg {
  background: rgba(255,255,255,0.2);
  padding: 12px;
  border-radius: 50px;
}

/* RIGHT */
.hero-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* RESPONSIVE */
@media (max-width: 700px) {
  .hero-card {
    grid-template-columns: 1fr;
  }
}
</style>