<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <img src="../../assets/images/Logo.png" alt="" class="footer-logo" />
            <p class="brand-desc">{{ t('brandDesc') }}</p>
            <div class="social-icons">
              <a href="#" class="social-icon" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-icon" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-icon" aria-label="Telegram"><i class="bi bi-telegram"></i></a>
              <a href="#" class="social-icon" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
              <a href="#" class="social-icon" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h3 class="col-title">{{ t('quickLinks') }}</h3>
            <ul class="col-links">
              <li><router-link to="/home">{{ t('home') }}</router-link></li>
              <li><router-link to="/products">{{ t('products') }}</router-link></li>
              <li><router-link to="/home#farmers">{{ t('farmers') }}</router-link></li>
              <li><router-link to="/products">{{ t('categories') }}</router-link></li>
              <li><a href="#">{{ t('blog') }}</a></li>
              <li><a href="#">{{ t('faqs') }}</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3 class="col-title">{{ t('support') }}</h3>
            <ul class="col-links">
              <li><a href="#">{{ t('helpCenter') }}</a></li>
              <li><a href="#">{{ t('shippingInfo') }}</a></li>
              <li><a href="#">{{ t('returnPolicy') }}</a></li>
              <li><a href="#">{{ t('privacyPolicy') }}</a></li>
              <li><a href="#">{{ t('termsConditions') }}</a></li>
              <li><a href="/application-form" @click="handleBecomeProvider">{{ t('becomeProvider') }}</a></li>
            </ul>
          </div>
          <div class="footer-col contact-col">
            <h3 class="col-title">{{ t('contact') }}</h3>
            <ul class="col-links contact-links">
              <li><i class="bi bi-geo-alt"></i> Phnom Penh, Cambodia</li>
              <li><i class="bi bi-telephone"></i> <a href="tel:+85512345678">+855 12 345 678</a></li>
              <li><i class="bi bi-envelope"></i> <a href="mailto:info@khmervegmarket.com">info@khmervegmarket.com</a></li>
            </ul>
            <div class="newsletter">
              <p class="newsletter-desc">{{ t('newsletterDesc') }}</p>
              <form class="newsletter-form" @submit.prevent="subscribe">
                <input
                  type="email"
                  v-model="email"
                  class="email-input"
                  :placeholder="t('emailPlaceholder')"
                  required
                />
                <button type="submit" class="btn-subscribe">{{ t('subscribe') }}</button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p class="copyright">{{ t('copyright') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()
const email = ref('')
const role = computed(() =>
  (userStore.user?.role || '').toLowerCase().replace(/\s+/g, '')
)
function handleBecomeProvider(e) {
  e.preventDefault()
  if (role.value === 'admin') {
    alert('You are an admin. You cannot become a provider.')
    return
  } else if (role.value === 'staff') {
    alert('You are a staff member. You cannot become a provider.')
    return
  } else if (role.value === 'provider') {
    router.push('/provider/dashboard')
  } else {
    router.push('/application-form')
  }
}
function subscribe() {
  if (!email.value) return
  alert(`Subscribed: ${email.value}`)
  email.value = ''
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.footer {
  background: #fff;
  color: #374151;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-main {
  padding: 56px 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
  gap: 40px;
}

.footer-col {
  min-width: 0;
}

.footer-logo {
  height: 40px;
  margin-bottom: 12px;
}

.brand-desc {
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0 0 24px;
}

.social-icons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.social-icon {
  width: 36px;
  height: 36px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f6;
  text-decoration: none;
  font-size: 18px;
  color: #6b7280;
  transition: all 0.2s;
}

.social-icon:hover {
  background: #2d7a3a;
  border-color: #2d7a3a;
  color: #fff;
}

.col-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.col-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-links a,
.col-links span {
  text-decoration: none;
  font-size: 13.5px;
  color: #6b7280;
  transition: color 0.2s;
  cursor: default;
}

.col-links a {
  cursor: pointer;
}

.col-links a:hover {
  color: #2d7a3a;
}

.contact-links li i {
  margin-right: 6px;
  color: #2d7a3a;
}

.contact-links a {
  display: inline-block;
}

.newsletter {
  margin-top: 24px;
}

.newsletter-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px;
  line-height: 1.5;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.email-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 13.5px;
  background: #fff;
  outline: none;
  color: #374151;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.email-input:focus {
  border-color: #2d7a3a;
}

.email-input::placeholder {
  color: #9ca3af;
}

.btn-subscribe {
  width: 100%;
  padding: 11px;
  background: #2d7a3a;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-subscribe:hover {
  background: #3a9e4a;
}

.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}



.footer-bottom {
  border-top: 1px solid #e5e7eb;
  padding: 20px 0;
  text-align: center;
}

.copyright {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
  .brand-col {
    grid-column: 1 / -1;
  }
  .contact-col {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .footer-main {
    padding: 40px 0 32px;
  }
}
</style>
