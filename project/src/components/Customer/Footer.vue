<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="container">

        <!-- Brand Column -->
        <div class="footer-col brand-col">
          <h2 class="brand-name">Nest Mart</h2>
          <p class="brand-desc">Cultivating freshness daily. Direct from local sustainable farms to your kitchen.</p>
          <div class="social-icons">
            <a href="#" class="social-icon" aria-label="Medal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="15" r="5" stroke="#2D7A3A" stroke-width="1.6"/>
                <path d="M8.5 9.5L7 4h10l-1.5 5.5" stroke="#2D7A3A" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M9 4l3 6 3-6" stroke="#2D7A3A" stroke-width="1.6" stroke-linejoin="round"/>
              </svg>
            </a>
            <a href="#" class="social-icon" aria-label="Message">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="13" rx="2" stroke="#2D7A3A" stroke-width="1.6"/>
                <path d="M3 8l9 5 9-5" stroke="#2D7A3A" stroke-width="1.6"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Company Column -->
        <div class="footer-col">
          <h3 class="col-title">Company</h3>
          <ul class="col-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Farmers</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>

        <!-- Services Column -->
        <div class="footer-col">
          <h3 class="col-title">Services</h3>
          <ul class="col-links">
            <li><a href="#">Delivery Info</a></li>
            <li><a href="#">Bulk Orders</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Gift Cards</a></li>
          </ul>
        </div>

        <!-- Support Column -->
        <div class="footer-col">
          <h3 class="col-title">Support</h3>
          <ul class="col-links">
            <li><a href="#">Contact Support</a></li>
            <li><a href="#">Returns Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>

        <!-- Newsletter Column -->
        <div class="footer-col newsletter-col">
          <h3 class="col-title">Join the Community</h3>
          <p class="newsletter-desc">Subscribe for seasonal updates and exclusive organic offers.</p>
          <div class="newsletter-form">
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              class="email-input"
            />
            <button class="btn-join" @click="handleJoin">Join</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="container bottom-inner">
        <p class="copyright">© 2024 Nest Mart. All rights reserved. Cultivating freshness daily.</p>
        <div class="bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookies Settings</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterSection',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    handleJoin() {
      console.log('Subscribe:', this.email)
      this.email = ''
    }
  }
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.footer {
  background: #f3f4f6;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* MAIN SECTION */
.footer-main {
  padding: 48px 0 40px;
}

.footer-main .container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* COLUMNS */
.footer-col {
  flex: 1;
}

.brand-col {
  flex: 1.2;
}

.newsletter-col {
  flex: 1.4;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
}

.brand-desc {
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 20px;
}

.social-icons {
  display: flex;
  gap: 10px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: border-color 0.2s;
}

.social-icon:hover {
  border-color: #2D7A3A;
}

.col-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 18px;
}

.col-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-links a {
  text-decoration: none;
  font-size: 13.5px;
  color: #6b7280;
  transition: color 0.2s;
}

.col-links a:hover {
  color: #2D7A3A;
}

/* NEWSLETTER */
.newsletter-desc {
  font-size: 13.5px;
  color: #6b7280;
  margin: 0 0 16px;
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
  border-color: #2D7A3A;
}

.email-input::placeholder {
  color: #9ca3af;
}

.btn-join {
  width: 100%;
  padding: 11px;
  background: #2D7A3A;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-join:hover {
  background: #1a5c27;
}

/* BOTTOM BAR */
.footer-bottom {
  border-top: 1px solid #d1d5db;
  padding: 18px 0;
}

.bottom-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.copyright {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.bottom-links {
  display: flex;
  gap: 20px;
}

.bottom-links a {
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.2s;
}

.bottom-links a:hover {
  color: #2D7A3A;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .footer-main .container {
    flex-wrap: wrap;
    gap: 28px;
  }
  .footer-col {
    flex: 1 1 40%;
  }
  .brand-col, .newsletter-col {
    flex: 1 1 100%;
  }
}

@media (max-width: 560px) {
  .footer-col {
    flex: 1 1 100%;
  }
  .bottom-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>