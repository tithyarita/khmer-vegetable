<template>
  <div class="register-page">
    <div class="register-left">
      <div class="brand">
        <span class="brand-icon"><i class="bi bi-leaf"></i></span>
        <h2>Harvest Ledger</h2>
      </div>
      <h1>Create Your Account</h1>
      <p class="subtitle">Join our community of fresh produce enthusiasts.</p>
      <form class="register-form">
        <label>Full Name</label>
        <input type="text" placeholder="Sokha Mean" v-model="name" />
        <label>Email</label>
        <input type="email" placeholder="sokha@harvestledger.com" v-model="email" />
        <label>Phone Number</label>
        <input type="tel" placeholder="+855 12 345 678" v-model="phone" />
        <div class="password-row">
          <div>
            <label>Password</label>
            <input type="password" placeholder="********" v-model="password" />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" placeholder="********" v-model="confirmPassword" />
          </div>
        </div>
        <button class="register-btn" :disabled="loading" @click="handleRegister">{{ loading ? 'Registering...' : 'Create Account' }}</button>
        <div v-if="error" style="color: #c00; text-align:center; margin-bottom:8px;">{{ error }}</div>
        <div v-if="success" style="color: #256d25; text-align:center; margin-bottom:8px;">{{ success }}</div>
        <div class="login-link">Already have an account? <a href="/login">Login</a></div>
      </form>
    </div>
    <div class="register-right">
      <div class="market-pill">Market Live Now</div>
      <div class="market-img">
        <!-- <img src="/src/assets/img-provider/market.png" alt="Market" /> -->
      </div>
      <div class="market-info">
        <div class="guarantee">
          <span class="icon"><i class="bi bi-patch-check-fill"></i></span>
          <div>
            <strong>FRESHNESS GUARANTEED</strong><br />Direct from Farmers
          </div>
        </div>
        <p>Experience the true taste of Cambodia. Our marketplace connects you directly with local farmers to ensure every vegetable is harvested at its peak.</p>
        <div class="stats">
          <div><strong>500+</strong><span>PARTNERS</span></div>
          <div><strong>2.4 Tons</strong><span>DAILY YIELD</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleRegister = async (e) => {
  e.preventDefault();
  error.value = '';
  success.value = '';
  if (!name.value || !email.value || !phone.value || !password.value || !confirmPassword.value) {
    error.value = 'All fields are required.';
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  loading.value = true;
  try {
    const res = await axios.post('http://localhost:3000/users/register', {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    });
    // Notify backend (for dev: log to backend console)
    console.log('User registered:', res.data.user || { name: name.value, email: email.value });
    success.value = res.data.message || 'Registration successful!';
    name.value = email.value = phone.value = password.value = confirmPassword.value = '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
html, body {
  height: 100vh;
  margin: 0;
  overflow: hidden;
}
.register-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: #f8f8f8;
}
.register-left {
  flex: 1;
  background: #fff;
  padding: 48px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  box-shadow: 2px 0 16px 0 rgba(0,0,0,0.04);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.brand-icon {
  font-size: 2rem;
  color: #256d25;
}
h1 {
  font-size: 2.2rem;
  margin-bottom: 8px;
  color: #1a3c1a;
}
.subtitle {
  color: #6b7a6b;
  margin-bottom: 24px;
}
.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.register-form label {
  font-size: 0.98rem;
  color: #1a3c1a;
  margin-bottom: 2px;
}
.register-form input[type="text"],
.register-form input[type="email"],
.register-form input[type="tel"],
.register-form input[type="password"] {
  padding: 10px;
  border: 1px solid #d1e7dd;
  border-radius: 6px;
  font-size: 1rem;
  background: #f6fff6;
}
.password-row {
  display: flex;
  gap: 12px;
}
.password-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.register-btn {
  background: #1a3c1a;
  color: #fff;
  border: none;
  padding: 12px 0;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.register-btn:hover {
  background: #256d25;
}
.login-link {
  text-align: center;
  color: #6b7a6b;
  font-size: 0.98rem;
}
.login-link a {
  color: #1a3c1a;
  text-decoration: underline;
}
.register-right {
  flex: 1.2;
  background: linear-gradient(120deg, #e6f4e6 60%, #f8f8f8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 48px 32px;
  height: 100vh;
  min-width: 0;
  max-width: none;
}
.market-pill {
  position: absolute;
  top: 32px;
  right: 48px;
  background: #fff;
  color: #1a3c1a;
  border-radius: 24px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 8px;
}
.market-img {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 32px auto;
}
.market-img img {
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
}
.market-info {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 32px 28px;
  max-width: 420px;
  margin: 0 auto;
  text-align: left;
}
.guarantee {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #256d25;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1rem;
}
.guarantee .icon {
  font-size: 1.2rem;
}
.market-info strong {
  font-size: 1.1rem;
  color: #1a3c1a;
}
.market-info p {
  color: #6b7a6b;
  margin-bottom: 18px;
}
.stats {
  display: flex;
  gap: 24px;
  justify-content: space-between;
}
.stats div {
  text-align: center;
}
.stats strong {
  font-size: 1.2rem;
  color: #1a3c1a;
}
.stats span {
  display: block;
  font-size: 0.9rem;
  color: #6b7a6b;
}
@media (max-width: 900px) {
  .register-page {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  .register-left, .register-right {
    max-width: 100vw;
    min-width: unset;
    padding: 32px 12px;
    height: auto;
  }
  .market-img, .market-info {
    max-width: 100vw;
  }
  .market-pill {
    position: static;
    margin-bottom: 16px;
  }
}
</style>
