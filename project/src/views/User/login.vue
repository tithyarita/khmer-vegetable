<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand">
        <!-- <img src="/src/assets/img-provider/logo.png" alt="Organic Editorial Logo" class="logo" /> -->
        <h2>Organic Editorial</h2>
      </div>
      <h1>Welcome Back</h1>
      <p class="subtitle">Login to your account to manage your fresh harvest.</p>
      <div class="login-toggle">
        <button :class="{ active: userType === 'customer' }" @click="userType = 'customer'">Login as Customer</button>
        <button :class="{ active: userType === 'provider' }" @click="userType = 'provider'">Login as Provider</button>
      </div>
      <form class="login-form">
        <label>Email</label>
        <input type="email" placeholder="name@example.com" />
        <label>Password</label>
        <input type="password" placeholder="********" />
        <div class="form-options">
          <label><input type="checkbox" /> Remember Me</label>
          <a href="#" class="forgot">Forgot Password?</a>
        </div>
        <button class="login-btn">Login</button>
        <button class="register-btn" type="button">Register Account</button>
      </form>
      <footer>
        <small>© 2024 The Digital Greenhouse. All rights reserved.</small>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
    <div class="login-right">
      <div class="market-pill">MARKET PULSE <span>Vibrant & High Stock</span></div>
      <div class="market-img">
        <!-- <img src="/src/assets/img-provider/market.png" alt="Market" /> -->
      </div>
      <div class="market-info">
        <div class="joined">
          <span class="icon"><i class="bi bi-people-fill"></i></span>
          Joined by 500+ local providers
        </div>
        <h2>Supporting local Cambodian farmers since 2012.</h2>
        <p>Join the most efficient digital marketplace for organic produce. Connecting fresh harvests directly to your table with transparent pricing and real-time vitality tracking.</p>
        <div class="stats">
          <div><strong>12k+</strong><span>DAILY ORDERS</span></div>
          <div><strong>98%</strong><span>FRESHNESS RATE</span></div>
          <div><strong>24h</strong><span>MAX DELIVERY</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const userType = ref('customer');
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #f8f8f8;
}
.login-left {
  flex: 1;
  background: #fff;
  padding: 48px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 400px;
  max-width: 480px;
  box-shadow: 2px 0 16px 0 rgba(0,0,0,0.04);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.logo {
  width: 40px;
  height: 40px;
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
.login-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.login-toggle button {
  flex: 1;
  padding: 10px 0;
  border: 1px solid #d1e7dd;
  background: #f6fff6;
  color: #1a3c1a;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.login-toggle button.active {
  background: #1a3c1a;
  color: #fff;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.login-form label {
  font-size: 0.98rem;
  color: #1a3c1a;
  margin-bottom: 2px;
}
.login-form input[type="email"],
.login-form input[type="password"] {
  padding: 10px;
  border: 1px solid #d1e7dd;
  border-radius: 6px;
  font-size: 1rem;
  background: #f6fff6;
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  margin-bottom: 8px;
}
.forgot {
  color: #1a3c1a;
  text-decoration: underline;
  cursor: pointer;
}
.login-btn {
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
.login-btn:hover {
  background: #256d25;
}
.register-btn {
  background: #f6fff6;
  color: #1a3c1a;
  border: 1px solid #d1e7dd;
  padding: 12px 0;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}
footer {
  margin-top: auto;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7a6b;
}
.footer-links {
  margin-top: 4px;
}
.footer-links a {
  color: #6b7a6b;
  margin: 0 8px;
  text-decoration: underline;
}
.login-right {
  flex: 1.2;
  background: linear-gradient(120deg, #e6f4e6 60%, #f8f8f8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 48px 32px;
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
.market-pill span {
  background: #e6f4e6;
  color: #256d25;
  border-radius: 12px;
  padding: 2px 10px;
  margin-left: 8px;
  font-size: 0.95rem;
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
.joined {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #256d25;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1rem;
}
.joined .icon {
  font-size: 1.2rem;
}
.market-info h2 {
  font-size: 1.3rem;
  margin-bottom: 8px;
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
</style>
