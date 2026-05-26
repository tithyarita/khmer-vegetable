<template>
  <div class="checkout-page">
    <NavigationBar />

    <!-- BACKGROUND -->
    <div class="bg-blur blur-1"></div>
    <div class="bg-blur blur-2"></div>

    <!-- LOADING -->
    <transition name="fade">
      <div
        v-if="loading"
        class="fullscreen-state"
      >
        <div class="state-card glass-card">
          <div class="loader"></div>

          <h1>Processing Order</h1>

          <p>
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    </transition>

    <!-- RESULT -->
    <transition name="fade">
      <div
        v-if="orderResult"
        class="fullscreen-state"
      >
        <div
          class="state-card glass-card"
          :class="orderResult"
        >
          <div class="result-icon">
            {{ orderResult === 'success' ? '✓' : '✕' }}
          </div>

          <h1>
            {{
              orderResult === 'success'
                ? 'Order Confirmed'
                : 'Checkout Failed'
            }}
          </h1>

          <p>{{ orderMessage }}</p>

          <button
            v-if="orderResult === 'success'"
            class="primary-btn"
            @click="goToReceipt"
          >
            View Receipt
          </button>

          <button
            v-else
            class="secondary-btn"
            @click="resetOrder"
          >
            Try Again
          </button>
        </div>
      </div>
    </transition>

    <!-- EMPTY -->
    <main
      v-if="!loading && !orderResult && !orderItems.length"
      class="empty-wrapper"
    >
      <div class="glass-card empty-card">
        <div class="empty-icon">
          🛒
        </div>

        <h1>Your Cart Is Empty</h1>

        <p>
          Add items to continue shopping.
        </p>

        <button
          class="primary-btn"
          @click="router.push('/')"
        >
          Continue Shopping
        </button>
      </div>
    </main>

    <!-- CHECKOUT -->
    <main
      v-if="!loading && !orderResult && orderItems.length"
      class="checkout-container"
    >
      <div class="checkout-grid">

        <!-- LEFT -->
        <section class="checkout-left">

          <!-- ADDRESS COLLAPSE -->
          <div class="glass-card collapse-card">

            <button
              class="collapse-header"
              @click="toggleSection('address')"
            >
              <div class="collapse-left">
                <div class="collapse-icon green">
                  📦
                </div>

                <div>
                  <h3>Shipping Address</h3>

                  <p>
                    Delivery information
                  </p>
                </div>
              </div>

              <span class="arrow">
                {{
                  activeSection === 'address'
                    ? '−'
                    : '+'
                }}
              </span>
            </button>

            <transition name="expand">
              <div
                v-if="activeSection === 'address'"
                class="collapse-body"
              >
                <div class="form-grid">

                  <div class="input-group full-width">
                    <label>Name</label>
                    <input v-model="shipping.name" type="text" readonly />
                  </div>

                  <div class="input-group full-width">
                    <label>Street Address</label>

                    <input
                      v-model="shipping.address"
                      type="text"
                      placeholder="Street address"
                    />
                  </div>

                  <div class="input-group">
                    <label>City</label>

                    <input
                      v-model="shipping.city"
                      type="text"
                      placeholder="City"
                    />
                  </div>

                  <div class="input-group">
                    <label>State</label>

                    <input
                      v-model="shipping.state"
                      type="text"
                      placeholder="Province"
                    />
                  </div>



                  <div class="input-group">
                    <label>Country</label>

                    <input
                      v-model="shipping.country"
                      type="text"
                      placeholder="Cambodia"
                    />
                  </div>

                  <div class="input-group">
                    <label>Phone Number</label>
                    <input v-model="shipping.phone" type="text" readonly />
                  </div>
                  <div class="input-group full-width">
                    <label>Email Address</label>
                    <input v-model="shipping.email" type="email" readonly />
                  </div>
                </div>

                <div
                  v-if="Object.keys(errors).length"
                  class="error-box"
                >
                  <p
                    v-for="(error, key) in errors"
                    :key="key"
                  >
                    • {{ error }}
                  </p>
                </div>
              </div>
            </transition>
          </div>

          <!-- PAYMENT COLLAPSE -->
          <div class="glass-card collapse-card">

            <button
              class="collapse-header"
              @click="toggleSection('payment')"
            >
              <div class="collapse-left">
                <div class="collapse-icon blue">
                  💳
                </div>

                <div>
                  <h3>Payment Method</h3>

                  <p>
                    Secure payment options
                  </p>
                </div>
              </div>

              <span class="arrow">
                {{
                  activeSection === 'payment'
                    ? '−'
                    : '+'
                }}
              </span>
            </button>

            <transition name="expand">
              <div
                v-if="activeSection === 'payment'"
                class="collapse-body"
              >
                <div class="payment-list">

                  <!-- ABA -->
                  <label
                    class="payment-card"
                    :class="{
                      active:
                        paymentMethod === 'bank'
                    }"
                  >
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="bank"
                    />

                    <div class="payment-content">
                      <h4>
                        🏦 ABA Bank Transfer
                      </h4>

                      <p>
                        Pay using mobile banking.
                      </p>
                    </div>
                  </label>

                  <!-- COD -->
                  <label
                    class="payment-card"
                    :class="{
                      active:
                        paymentMethod === 'cash'
                    }"
                  >
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="cash"
                    />

                    <div class="payment-content">
                      <h4>
                        🚚 Cash On Delivery
                      </h4>

                      <p>
                        Pay after delivery.
                      </p>
                    </div>
                  </label>

                  <!-- CARD -->
                  <label
                    class="payment-card"
                    :class="{
                      active:
                        paymentMethod === 'card'
                    }"
                  >
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="card"
                    />

                    <div class="payment-content">
                      <h4>
                        💳 Credit / Debit Card
                      </h4>

                      <p>
                        Visa & Mastercard accepted.
                      </p>
                    </div>
                  </label>

                  <!-- CARD FORM -->
                  <transition name="expand">
                    <div
                      v-if="paymentMethod === 'card'"
                      class="card-form"
                    >
                      <div class="form-grid">

                        <div class="input-group full-width">
                          <label>Card Number</label>

                          <input
                            :value="card.number"
                            @input="handleCardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>

                        <div class="input-group">
                          <label>Expiry Date</label>

                          <input
                            :value="card.expiry"
                            @input="handleExpiry"
                            type="text"
                            placeholder="MM/YY"
                          />
                        </div>

                        <div class="input-group">
                          <label>CVV</label>

                          <input
                            v-model="card.cvv"
                            type="text"
                            maxlength="4"
                            placeholder="123"
                          />
                        </div>

                        <div class="input-group full-width">
                          <label>Cardholder Name</label>

                          <input
                            v-model="card.name"
                            type="text"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

            </transition>

            </div>

            <!-- RIGHT COLUMN -->
            <div class="checkout-right">
              <div class="order-summary">

                <h2>Order Summary</h2>

                <div class="summary-totals">

                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>${{ subtotal.toFixed(2) }}</span>
                  </div>

                  <div class="total-row">
                    <span>Delivery Fee</span>
                    <span>${{ shippingFee.toFixed(2) }}</span>
                  </div>

                  <div class="total-row">
                    <span>Service Fee</span>
                    <span>$1.00</span>
                  </div>

                  <div class="total-divider"></div>

                  <div class="total-row final">
                    <span>Total Amount</span>
                    <span>${{ total.toFixed(2) }}</span>
                  </div>

                </div>

                <button
                  class="confirm-order-btn"
                  :disabled="loading"
                  @click="confirmOrder"
                >
                  Confirm Order
                </button>

                <div class="security-info">

                  <div class="security-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#2D7A3A"
                    >
                      <path
                        d="M12 1L3 5v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                      />
                    </svg>

                    <span>Secure Checkout</span>
                  </div>

                  <div class="security-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#2D7A3A"
                    >
                      <path
                        d="M12 2C6.48 2 12 5.42 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
                      />
                    </svg>

                    <span>SSL Encrypted</span>
                  </div>

                </div>

              </div>
            </div>

          <!-- REVIEW ITEMS -->
          <div class="glass-card checkout-card">

            <div class="section-top">
              <div>
                <span class="section-badge">
                  Review Order
                </span>

                <h2>Your Items</h2>
              </div>

              <span class="item-count">
                {{ orderItems.length }} items
              </span>
            </div>

            <div class="review-list">

              <div
                v-for="item in orderItems"
                :key="item.id"
                class="review-item"
              >
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="review-image"
                />

                <div class="review-info">
                  <h4>{{ item.name }}</h4>

                  <div class="review-meta">
                    <span class="qty-pill">
                      ×{{ item.quantity }}
                    </span>

                    <span>
                      {{
                        item.providerName ||
                        'Marketplace Seller'
                      }}
                    </span>
                  </div>
                </div>

                <div class="review-price">
                  ${{ itemTotal(item).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT -->
        <aside class="checkout-right">

          <div class="glass-card summary-card">

            <div class="summary-top">
              <span class="section-badge">
                Payment Summary
              </span>

              <h2>Order Summary</h2>
            </div>

            <div class="summary-list">

              <div class="summary-row">
                <span>Subtotal</span>

                <strong>
                  ${{ subtotal.toFixed(2) }}
                </strong>
              </div>

              <div class="summary-row">
                <span>Delivery Fee</span>

                <strong>
                  ${{ shippingFee.toFixed(2) }}
                </strong>
              </div>

              <div class="summary-row">
                <span>Service Fee</span>

                <strong>
                  ${{ serviceFee.toFixed(2) }}
                </strong>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Total</span>

                <strong>
                  ${{ total.toFixed(2) }}
                </strong>
              </div>
            </div>

            <button
              class="checkout-btn"
              :disabled="loading"
              @click="confirmOrder"
            >
              {{
                loading
                  ? 'Processing...'
                  : 'Confirm Order'
              }}
            </button>

            <div class="security-box">
              <div class="security-item">
                🔒 SSL Encrypted
              </div>

              <div class="security-item">
                ✅ Secure Checkout
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import axios from 'axios'
import { useRouter } from 'vue-router'

import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'


import { useCartStore } from '../../stores/cartStore'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = 'http://localhost:3000'

const router = useRouter()

const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(false)

const orderResult = ref('')
const orderMessage = ref('')

const activeSection = ref('address')

const paymentMethod = ref('bank')

const shippingFee = ref(2)
const serviceFee = ref(1)

const errors = reactive({})

const card = reactive({
  number: '',
  expiry: '',
  cvv: '',
  name: '',
})

const shipping = reactive({
  name: '',
  address: '',
  city: '',
  state: '',

  country: '',
  phone: '',
  email: '',
})

const orderItems = computed(() => {
  return cartStore.cartItems || []
})

const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + itemTotal(item)
  }, 0)
})

const total = computed(() => {
  return (
    subtotal.value +
    shippingFee.value +
    serviceFee.value
  )
})

onMounted(() => {
  loadUserData()
})

const toggleSection = section => {
  activeSection.value =
    activeSection.value === section
      ? ''
      : section
}


// Load user info and address from backend if exists
const loadUserData = async () => {
  const user = userStore.user
  if (!user || !user.id) {
    router.push('/user/login?redirect=/checkout')
    return
  }
  shipping.name = user.name || ''
  shipping.phone = user.phone || ''
  shipping.email = user.email || ''
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const response = await fetch('http://localhost:3000/address', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return
    const data = await response.json()
    if (data) {
      shipping.address = data.street || ''
      shipping.city = data.city || ''
      shipping.state = data.state || ''

      shipping.country = data.country || 'Cambodia'
    }
  } catch (error) {
    // fallback: do nothing
  }
}

const itemTotal = item => {
  return (
    Number(item.unitPrice ?? item.price ?? 0) *
    item.quantity
  )
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

const validateForm = () => {
  clearErrors()

  if (!shipping.name) {
    errors.name = 'Name is required'
  }

  if (!shipping.address) {
    errors.address =
      'Address is required'
  }

  if (!shipping.phone) {
    errors.phone =
      'Phone number required'
  }

  if (!shipping.email.includes('@')) {
    errors.email =
      'Valid email required'
  }

  if (paymentMethod.value === 'card') {
    if (
      card.number.replace(/\s/g, '')
        .length < 16
    ) {
      errors.card =
        'Invalid card number'
    }
  }

  return !Object.keys(errors).length
}

const handleCardNumber = event => {
  card.number = event.target.value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 19)
}

const handleExpiry = event => {
  card.expiry = event.target.value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .slice(0, 5)
}

const confirmOrder = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Save/update address to backend before placing order
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Please login before checkout.')
    const addressRes = await fetch('http://localhost:3000/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: shipping.name,
        street: shipping.address,
        city: shipping.city,
        state: shipping.state,

        country: shipping.country,
        phone: shipping.phone,
        email: shipping.email,
      }),
    })
    if (!addressRes.ok) throw new Error('Failed to save address')

    // Place order as before
    const customer = JSON.parse(localStorage.getItem('user') || 'null')
    if (!customer?.id) throw new Error('Please login before checkout.')
    const groupedOrders = groupItemsByProvider(orderItems.value)
    const responses = await Promise.all(
      groupedOrders.map(group => {
        return axios.post(
          `${API_BASE_URL}/orders`,
          {
            order_code: generateOrderCode(),
            customer_id: customer.id,
            status: 'pending',
            total: group.total,
            item: group.items.length,
            items: group.items.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
          }
        )
      })
    )

    const receipt = {
      orderNumber: generateOrderCode(),
      customer: { ...shipping },
      items: orderItems.value,
      total: total.value,
      paymentMethod: paymentMethod.value,

      backendOrders:
        responses.map(r => r.data),
    }

    localStorage.setItem(
      'lastOrder',
      JSON.stringify(receipt)
    )

    cartStore.clearCart()

    orderResult.value = 'success'

    orderMessage.value =
      'Your order has been placed successfully.'
  }
  catch (error) {
    orderResult.value = 'error'

    orderMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Checkout failed.'
  }
  finally {
    loading.value = false
  }
}

const groupItemsByProvider = items => {
  const map = new Map()

  items.forEach(item => {
    const providerId =
      item.providerId ||
      item.provider_id ||
      null

    if (!map.has(providerId)) {
      map.set(providerId, {
        providerId,
        items: [],
        total: 0,
      })
    }

    const group = map.get(providerId)

    group.items.push(item)

    group.total += itemTotal(item)
  })

  return Array.from(map.values())
}

const generateOrderCode = () => {
  return `ORD-${crypto.randomUUID()
    .slice(0, 8)
    .toUpperCase()}`
}

const goToReceipt = () => {
  router.push('/receipt')
}

const resetOrder = () => {
  orderResult.value = ''
  orderMessage.value = ''
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(34,197,94,0.08),
      transparent 30%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(59,130,246,0.08),
      transparent 30%
    ),
    #f8fafc;

  overflow-x: hidden;

  position: relative;

  font-family:
    Inter,
    sans-serif;
}

.bg-blur {
  position: absolute;

  border-radius: 999px;

  filter: blur(90px);

  opacity: 0.4;
}

.blur-1 {
  width: 220px;
  height: 220px;

  background: #86efac;

  top: -100px;
  left: -100px;
}

.blur-2 {
  width: 220px;
  height: 220px;

  background: #93c5fd;

  bottom: -100px;
  right: -100px;
}

.checkout-container {
  max-width: 1320px;

  margin: auto;

  padding: 26px 16px 100px;

  position: relative;
  z-index: 2;
}

.checkout-grid {
  display: grid;

  grid-template-columns: 1fr 340px;

  gap: 20px;
}

.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.glass-card {
  background: rgba(255,255,255,0.7);

  backdrop-filter: blur(18px);

  border: 1px solid rgba(255,255,255,0.5);

  box-shadow:
    0 10px 30px rgba(15,23,42,0.05);

  border-radius: 20px;
}

.checkout-card,
.summary-card,
.collapse-card {
  padding: 18px;
}

.summary-card {
  position: sticky;
  top: 100px;
}

.collapse-header {
  width: 100%;

  border: none;

  background: transparent;

  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;

  padding: 0;
}

.collapse-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-icon {
  width: 42px;
  height: 42px;

  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 18px;
}

.collapse-icon.green {
  background: #dcfce7;
}

.collapse-icon.blue {
  background: #dbeafe;
}

.collapse-header h3 {
  margin: 0;

  font-size: 14px;
  font-weight: 700;
}

.collapse-header p {
  margin: 4px 0 0;

  font-size: 12px;

  color: #64748b;
}

.arrow {
  font-size: 22px;

  color: #64748b;
}

.collapse-body {
  margin-top: 18px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 18px;
}

.section-badge {
  display: inline-flex;

  padding: 6px 12px;

  border-radius: 999px;

  background: rgba(34,197,94,0.08);

  color: #16a34a;

  font-size: 10px;
  font-weight: 700;

  margin-bottom: 8px;
}

h1 {
  margin: 0;

  font-size: 30px;
}

h2 {
  margin: 0;

  font-size: 20px;

  color: #0f172a;
}

h4 {
  margin: 0;

  font-size: 13px;
}

p {
  font-size: 12px;

  color: #64748b;

  line-height: 1.5;
}

.form-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 14px;
}

.full-width {
  grid-column: 1 / -1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 11px;

  font-weight: 600;

  color: #475569;
}

.input-group input {
  border: 1px solid #dbe4ee;

  background: rgba(255,255,255,0.9);

  border-radius: 14px;

  padding: 11px 13px;

  font-size: 12px;

  transition: 0.2s ease;
}

.input-group input:focus {
  outline: none;

  border-color: #22c55e;

  box-shadow:
    0 0 0 4px rgba(34,197,94,0.1);
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  padding: 14px;

  cursor: pointer;

  transition: 0.2s ease;
}

.payment-card:hover {
  border-color: #22c55e;
}

.payment-card.active {
  border-color: #16a34a;

  background: rgba(240,253,244,0.7);
}

.payment-card input {
  width: 16px;
  height: 16px;
}

.payment-content h4 {
  margin-bottom: 4px;
}

.card-form {
  background: rgba(248,250,252,0.9);

  border-radius: 16px;

  padding: 16px;
}

.review-list {
  display: flex;
  flex-direction: column;
}

.review-item {
  display: grid;

  grid-template-columns: 65px 1fr auto;

  gap: 14px;

  align-items: center;

  padding: 14px 0;

  border-bottom: 1px solid #eef2f7;
}

.review-item:last-child {
  border-bottom: none;
}

.review-image {
  width: 65px;
  height: 65px;

  object-fit: cover;

  border-radius: 16px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-top: 6px;

  font-size: 11px;

  color: #64748b;
}

.qty-pill {
  background: #dcfce7;

  color: #166534;

  padding: 3px 10px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 700;
}

.review-price {
  font-size: 14px;
  font-weight: 700;
}

.item-count {
  font-size: 11px;

  color: #64748b;
}

.summary-list {
  margin-top: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;

  padding: 10px 0;

  font-size: 13px;
}

.summary-divider {
  height: 1px;

  background: #e2e8f0;

  margin: 10px 0;
}

.total-row {
  font-size: 18px;
  font-weight: 800;
}

.checkout-btn,
.primary-btn,
.secondary-btn {
  width: 100%;

  border: none;

  border-radius: 16px;

  padding: 13px;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.checkout-btn,
.primary-btn {
  background:
    linear-gradient(
      135deg,
      #22c55e,
      #16a34a
    );

  color: white;
}

.checkout-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  background: #e2e8f0;
}

.security-box {
  margin-top: 16px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.security-item {
  font-size: 11px;

  color: #16a34a;

  font-weight: 600;
}

.error-box {
  margin-top: 16px;

  background: rgba(254,242,242,0.9);

  border: 1px solid #fecaca;

  border-radius: 14px;

  padding: 12px;
}

.error-box p {
  margin: 4px 0;

  color: #dc2626;
}

.fullscreen-state,
.empty-wrapper {
  min-height: 80vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.state-card,
.empty-card {
  max-width: 460px;
  width: 100%;

  padding: 36px;

  text-align: center;
}

.result-icon,
.empty-icon {
  width: 85px;
  height: 85px;

  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255,255,255,0.8);

  margin: 0 auto 20px;

  font-size: 34px;
}

.loader {
  width: 55px;
  height: 55px;

  margin: 0 auto 20px;

  border-radius: 999px;

  border: 5px solid #e2e8f0;
  border-top-color: #16a34a;

  animation: spin 1s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 16px 12px 120px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .review-item {
    grid-template-columns: 60px 1fr;
  }

  .review-price {
    grid-column: 2;
    justify-self: end;
  }

  .summary-card {
    position: fixed;

    bottom: 0;
    left: 0;
    right: 0;

    z-index: 50;

    border-radius: 24px 24px 0 0;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 18px;
  }
}
</style>