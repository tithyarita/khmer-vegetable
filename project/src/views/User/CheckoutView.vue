<template>
  <div class="checkout-page">
    <NavigationBar />

    <!-- PROGRESS STEPS -->
    <div class="progress-bar">
      <div class="progress-track">
        <div 
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ 
            active: currentStep === index,
            completed: currentStep > index
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>
    </div>

    <!-- LOADING OVERLAY -->
    <transition name="fade">
      <div
        v-if="loading"
        class="loading-overlay"
      >
        <div class="loading-card">
          <div class="loading-spinner"></div>
          <h2>Processing Your Order</h2>
          <p>{{ loadingMessage }}</p>
          <div class="loading-progress">
            <div class="progress-bar-fill"></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- SUCCESS MODAL -->
    <transition name="fade">
      <div
        v-if="orderResult === 'success'"
        class="modal-overlay"
      >
        <div class="success-modal">
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#22c55e" stroke-width="4"/>
              <path d="M25 40L35 50L55 30" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p class="order-number">Order #{{ orderNumber }}</p>
          <p>{{ orderMessage }}</p>
          <div class="success-actions">
            <button class="btn-primary" @click="goToReceipt">
              View Receipt
            </button>
            <button class="btn-secondary" @click="router.push('/')">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ERROR MODAL -->
    <transition name="fade">
      <div
        v-if="orderResult === 'error'"
        class="modal-overlay"
      >
        <div class="error-modal">
          <div class="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#ef4444" stroke-width="4"/>
              <path d="M30 30L50 50M50 30L30 50" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Checkout Failed</h1>
          <p>{{ orderMessage }}</p>
          <div class="error-actions">
            <button class="btn-primary" @click="resetOrder">
              Try Again
            </button>
            <button class="btn-secondary" @click="router.push('/cart')">
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- EMPTY CART -->
    <main
      v-if="!loading && !orderResult && !orderItems.length"
      class="empty-state"
    >
      <div class="empty-card">
        <div class="empty-illustration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
            <path d="M40 50L55 65L80 40" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Your Cart Is Empty</h1>
        <p>Add some fresh vegetables to get started</p>
        <button class="btn-primary" @click="router.push('/')">
          Browse Products
        </button>
      </div>
    </main>

    <!-- CHECKOUT FORM -->
    <main
      v-if="!loading && !orderResult && orderItems.length"
      class="checkout-container"
    >
      <div class="checkout-grid">

        <!-- LEFT COLUMN -->
        <section class="checkout-main">

          <!-- SHIPPING ADDRESS -->
          <div class="form-section" :class="{ completed: isAddressValid }">
            <div class="section-header">
              <div class="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <div class="section-info">
                <h2>Shipping Address</h2>
                <p>Where should we deliver your order?</p>
              </div>
              <button 
                class="section-toggle"
                @click="toggleSection('address')"
              >
                {{ activeSection === 'address' ? '−' : '+' }}
              </button>
            </div>

            <transition name="slide">
              <div v-show="activeSection === 'address'" class="section-content">
                <div class="form-grid">
                  <div class="form-field">
                    <label>First Name *</label>
                    <input
                      v-model="shipping.firstName"
                      type="text"
                      placeholder="John"
                      :class="{ error: errors.firstName }"
                    />
                    <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
                  </div>

                  <div class="form-field">
                    <label>Last Name *</label>
                    <input
                      v-model="shipping.lastName"
                      type="text"
                      placeholder="Doe"
                      :class="{ error: errors.lastName }"
                    />
                    <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
                  </div>

                  <div class="form-field full-width">
                    <label>Street Address *</label>
                    <input
                      v-model="shipping.address"
                      type="text"
                      placeholder="123 Street Name"
                      :class="{ error: errors.address }"
                    />
                    <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
                  </div>

                  <div class="form-field">
                    <label>City *</label>
                    <input
                      v-model="shipping.city"
                      type="text"
                      placeholder="Phnom Penh"
                      :class="{ error: errors.city }"
                    />
                    <span v-if="errors.city" class="error-text">{{ errors.city }}</span>
                  </div>

                  <div class="form-field">
                    <label>Province *</label>
                    <input
                      v-model="shipping.state"
                      type="text"
                      placeholder="Phnom Penh"
                      :class="{ error: errors.state }"
                    />
                    <span v-if="errors.state" class="error-text">{{ errors.state }}</span>
                  </div>

                  <div class="form-field">
                    <label>ZIP Code *</label>
                    <input
                      v-model="shipping.zip"
                      type="text"
                      placeholder="12000"
                      :class="{ error: errors.zip }"
                    />
                    <span v-if="errors.zip" class="error-text">{{ errors.zip }}</span>
                  </div>

                  <div class="form-field">
                    <label>Country</label>
                    <input
                      v-model="shipping.country"
                      type="text"
                      placeholder="Cambodia"
                    />
                  </div>

                  <div class="form-field">
                    <label>Phone Number *</label>
                    <input
                      v-model="shipping.phone"
                      type="tel"
                      placeholder="+855 12 345 678"
                      :class="{ error: errors.phone }"
                    />
                    <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
                  </div>

                  <div class="form-field full-width">
                    <label>Email Address *</label>
                    <input
                      v-model="shipping.email"
                      type="email"
                      placeholder="you@example.com"
                      :class="{ error: errors.email }"
                    />
                    <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                  </div>
                </div>

                <button class="btn-continue" @click="validateAndNext('address')">
                  Continue to Payment
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              </div>
            </transition>
          </div>

          <!-- PAYMENT METHOD -->
          <div class="form-section" :class="{ completed: isPaymentValid }">
            <div class="section-header">
              <div class="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div class="section-info">
                <h2>Payment Method</h2>
                <p>Choose your preferred payment option</p>
              </div>
              <button 
                class="section-toggle"
                @click="toggleSection('payment')"
              >
                {{ activeSection === 'payment' ? '−' : '+' }}
              </button>
            </div>

            <transition name="slide">
              <div v-show="activeSection === 'payment'" class="section-content">
                <div class="payment-methods">
                  <label 
                    class="payment-option"
                    :class="{ active: paymentMethod === 'bank' }"
                  >
                    <input type="radio" v-model="paymentMethod" value="bank" />
                    <div class="payment-card">
                      <div class="payment-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="6" fill="#3b82f6"/>
                          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">ABA</text>
                        </svg>
                      </div>
                      <div class="payment-details">
                        <h4>ABA Bank</h4>
                        <p>Mobile banking transfer</p>
                      </div>
                      <div class="payment-check">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                          <path d="M6 10l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </label>

                  <label 
                    class="payment-option"
                    :class="{ active: paymentMethod === 'cash' }"
                  >
                    <input type="radio" v-model="paymentMethod" value="cash" />
                    <div class="payment-card">
                      <div class="payment-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="6" fill="#22c55e"/>
                          <path d="M8 16h16M8 12h16M8 20h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                      <div class="payment-details">
                        <h4>Cash on Delivery</h4>
                        <p>Pay when you receive</p>
                      </div>
                      <div class="payment-check">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                          <path d="M6 10l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </label>

                  <label 
                    class="payment-option"
                    :class="{ active: paymentMethod === 'card' }"
                  >
                    <input type="radio" v-model="paymentMethod" value="card" />
                    <div class="payment-card">
                      <div class="payment-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="6" fill="#8b5cf6"/>
                          <rect x="4" y="8" width="24" height="16" rx="2" stroke="white" stroke-width="2" fill="none"/>
                          <circle cx="10" cy="16" r="3" fill="white"/>
                          <circle cx="22" cy="16" r="3" fill="white"/>
                        </svg>
                      </div>
                      <div class="payment-details">
                        <h4>Credit / Debit Card</h4>
                        <p>Visa, Mastercard, JCB</p>
                      </div>
                      <div class="payment-check">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                          <path d="M6 10l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>

                <!-- CARD DETAILS -->
                <transition name="slide">
                  <div v-if="paymentMethod === 'card'" class="card-details">
                    <div class="form-grid">
                      <div class="form-field full-width">
                        <label>Card Number *</label>
                        <div class="input-with-icon">
                          <input
                            :value="card.number"
                            @input="handleCardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            maxlength="19"
                            :class="{ error: errors.card }"
                          />
                          <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="1" y="4" width="18" height="12" rx="2"/>
                            <line x1="1" y1="8" x2="19" y2="8"/>
                          </svg>
                        </div>
                        <span v-if="errors.card" class="error-text">{{ errors.card }}</span>
                      </div>

                      <div class="form-field">
                        <label>Expiry Date *</label>
                        <input
                          :value="card.expiry"
                          @input="handleExpiry"
                          type="text"
                          placeholder="MM/YY"
                          maxlength="5"
                        />
                      </div>

                      <div class="form-field">
                        <label>CVV *</label>
                        <input
                          v-model="card.cvv"
                          type="password"
                          placeholder="•••"
                          maxlength="4"
                        />
                      </div>

                      <div class="form-field full-width">
                        <label>Cardholder Name *</label>
                        <input
                          v-model="card.name"
                          type="text"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>
                </transition>

                <button class="btn-continue" @click="validateAndNext('payment')">
                  Review Order
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              </div>
            </transition>
          </div>

          <!-- ORDER REVIEW -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="2"/>
                  <path d="M9 14l2 2 4-4"/>
                </svg>
              </div>
              <div class="section-info">
                <h2>Order Review</h2>
                <p>Review your items before placing order</p>
              </div>
              <button 
                class="section-toggle"
                @click="toggleSection('review')"
              >
                {{ activeSection === 'review' ? '−' : '+' }}
              </button>
            </div>

            <transition name="slide">
              <div v-show="activeSection === 'review'" class="section-content">
                <div class="order-items">
                  <div 
                    v-for="item in orderItems" 
                    :key="item.id"
                    class="order-item"
                  >
                    <img :src="item.image" :alt="item.name" class="item-image" />
                    <div class="item-details">
                      <h4>{{ item.name }}</h4>
                      <p class="item-provider">{{ item.providerName || 'Marketplace' }}</p>
                      <div class="item-quantity">
                        <span class="quantity-badge">×{{ item.quantity }}</span>
                        <span class="item-price">${{ itemTotal(item).toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </section>

        <!-- RIGHT COLUMN - ORDER SUMMARY -->
        <aside class="checkout-sidebar">
          <div class="summary-card">
            <h2>Order Summary</h2>
            
            <div class="summary-items">
              <div class="summary-row">
                <span>Subtotal ({{ orderItems.length }} items)</span>
                <strong>${{ subtotal.toFixed(2) }}</strong>
              </div>
              
              <div class="summary-row">
                <span>Delivery Fee</span>
                <strong>${{ shippingFee.toFixed(2) }}</strong>
              </div>
              
              <div class="summary-row">
                <span>Service Fee</span>
                <strong>${{ serviceFee.toFixed(2) }}</strong>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-row total">
                <span>Total</span>
                <strong class="total-amount">${{ total.toFixed(2) }}</strong>
              </div>
            </div>

            <div class="promo-section">
              <div class="input-with-icon">
                <input 
                  v-model="couponCode" 
                  type="text" 
                  placeholder="Promo code" 
                />
                <button class="btn-apply" @click="applyCoupon">Apply</button>
              </div>
            </div>

            <button 
              class="btn-checkout"
              :disabled="!canCheckout"
              @click="confirmOrder"
            >
              <span v-if="loading">
                <svg class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="12" stroke-dashoffset="6">
                    <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Processing...
              </span>
              <span v-else>
                Place Order - ${{ total.toFixed(2) }}
              </span>
            </button>

            <div class="security-badges">
              <div class="badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M8 1l1 5h5l-4 3 1 5-3-3-3 3 1-5-4-3h5l1-5z"/>
                </svg>
                <span>SSL Secured</span>
              </div>
              <div class="badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M8 1L3 6v9h10V6L8 1z"/>
                  <path d="M8 11v2"/>
                  <circle cx="8" cy="8" r="1"/>
                </svg>
                <span>Safe Checkout</span>
              </div>
              <div class="badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 4l4 4 4-4"/>
                  <path d="M4 8l4 4 4-4"/>
                </svg>
                <span>Easy Returns</span>
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
const loadingMessage = ref('Validating your information...')
const orderResult = ref('')
const orderMessage = ref('')
const orderNumber = ref('')
const couponCode = ref('')

const steps = ['Address', 'Payment', 'Review']
const currentStep = ref(0)

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
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
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

const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / steps.length) * 100
})

const isAddressValid = computed(() => {
  return shipping.firstName && shipping.lastName && 
         shipping.address && shipping.city && shipping.state && 
         shipping.zip && shipping.phone && shipping.email.includes('@')
})

const isPaymentValid = computed(() => {
  if (paymentMethod.value === 'card') {
    return card.number.replace(/\s/g, '').length >= 16
  }
  return paymentMethod.value !== ''
})

const canCheckout = computed(() => {
  return isAddressValid.value && isPaymentValid.value && orderItems.value.length > 0
})

onMounted(() => {
  loadUserData()
})

const toggleSection = section => {
  activeSection.value = activeSection.value === section ? '' : section
}

const validateAndNext = (section) => {
  clearErrors()
  
  if (section === 'address') {
    if (!shipping.firstName) errors.firstName = 'First name is required'
    if (!shipping.lastName) errors.lastName = 'Last name is required'
    if (!shipping.address) errors.address = 'Address is required'
    if (!shipping.city) errors.city = 'City is required'
    if (!shipping.state) errors.state = 'Province is required'
    if (!shipping.zip) errors.zip = 'ZIP code is required'
    if (!shipping.phone) errors.phone = 'Phone number is required'
    if (!shipping.email.includes('@')) errors.email = 'Valid email is required'
    
    if (Object.keys(errors).length === 0) {
      currentStep.value = 1
      activeSection.value = 'payment'
    }
  }
  
  if (section === 'payment') {
    if (paymentMethod.value === 'card') {
      if (card.number.replace(/\s/g, '').length < 16) {
        errors.card = 'Invalid card number'
      }
    }
    
    if (Object.keys(errors).length === 0) {
      currentStep.value = 2
      activeSection.value = 'review'
    }
  }
}

const loadUserData = () => {
  const localUser = JSON.parse(localStorage.getItem('user') || 'null')
  const user = userStore.user || localUser || {}

  const names = String(user.name || '').split(' ')

  shipping.firstName = user.firstName || names[0] || ''
  shipping.lastName = user.lastName || names.slice(1).join('') || ''
  shipping.address = user.address || ''
  shipping.city = user.city || ''
  shipping.state = user.state || ''
  shipping.zip = user.zip || ''
  shipping.country = user.country || 'Cambodia'
  shipping.phone = user.phone || ''
  shipping.email = user.email || ''
}

const itemTotal = item => {
  return Number(item.unitPrice ?? item.price ?? 0) * item.quantity
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
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

const applyCoupon = () => {
  console.log('Applying coupon:', couponCode.value)
}

const confirmOrder = async () => {
  if (!canCheckout.value) {
    return
  }

  loading.value = true
  loadingMessage.value = 'Validating your information...'
  
  setTimeout(() => {
    loadingMessage.value = 'Processing payment...'
  }, 1000)
  
  setTimeout(() => {
    loadingMessage.value = 'Confirming your order...'
  }, 2000)

  try {
    const customer = JSON.parse(localStorage.getItem('user') || 'null')

    if (!customer?.id) {
      throw new Error('Please login before checkout.')
    }

    const groupedOrders = groupItemsByProvider(orderItems.value)

    const responses = await Promise.all(
      groupedOrders.map(group => {
        return axios.post(`${API_BASE_URL}/orders`, {
          order_code: generateOrderCode(),
          customer_id: customer.id,
          provider_id: group.providerId,
          status: 'pending',
          total: group.total,
          item: group.items.length,
          items: group.items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        })
      })
    )

    const receipt = {
      orderNumber: generateOrderCode(),
      customer: { ...shipping },
      items: orderItems.value,
      total: total.value,
      paymentMethod: paymentMethod.value,
      backendOrders: responses.map(r => r.data),
    }

    localStorage.setItem('lastOrder', JSON.stringify(receipt))
    orderNumber.value = receipt.orderNumber
    cartStore.clearCart()

    orderResult.value = 'success'
    orderMessage.value = 'Your order has been placed successfully. You will receive a confirmation email shortly.'
  }
  catch (error) {
    orderResult.value = 'error'
    orderMessage.value = error.response?.data?.message || error.message || 'Checkout failed. Please try again.'
  }
  finally {
    loading.value = false
  }
}

const groupItemsByProvider = items => {
  const map = new Map()

  items.forEach(item => {
    const providerId = item.providerId || item.provider_id || null

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
  return `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

const goToReceipt = () => {
  router.push('/receipt')
}

const resetOrder = () => {
  orderResult.value = ''
  orderMessage.value = ''
  currentStep.value = 0
  activeSection.value = 'address'
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Progress Bar */
.progress-bar {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.progress-track {
  max-width: 800px;
  margin: 0 auto 16px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.5s ease;
}

.steps {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #22c55e;
  color: white;
  box-shadow: 0 0 0 4px rgba(34,197,94,0.2);
}

.step.completed .step-number {
  background: #16a34a;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label {
  color: #22c55e;
  font-weight: 600;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #22c55e;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.loading-progress {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 20px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #22c55e;
  width: 0%;
  animation: progress 3s ease-in-out;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 50%; }
  100% { width: 100%; }
}

.loading-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1f2937;
}

.loading-card p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.success-modal,
.error-modal {
  background: white;
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon,
.error-icon {
  margin: 0 auto 24px;
}

.success-modal h1,
.error-modal h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #1f2937;
}

.success-modal .order-number {
  margin: 0 0 16px;
  font-size: 16px;
  color: #22c55e;
  font-weight: 600;
}

.success-modal p,
.error-modal p {
  margin: 0 0 32px;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
}

.success-actions,
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34,197,94,0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Empty State */
.empty-state {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-card {
  background: white;
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.empty-illustration {
  margin: 0 auto 24px;
}

.empty-card h1 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #1f2937;
}

.empty-card p {
  margin: 0 0 32px;
  color: #6b7280;
  font-size: 16px;
}

/* Checkout Container */
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 100px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}

.checkout-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-section.completed {
  border: 2px solid #22c55e;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-info h2 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
}

.section-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.section-toggle {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.section-toggle:hover {
  background: #f3f4f6;
}

.section-content {
  padding: 24px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-field input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-field input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
}

.form-field input.error {
  border-color: #ef4444;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-right: 48px;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.btn-continue {
  margin-top: 24px;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34,197,94,0.3);
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  cursor: pointer;
}

.payment-option input {
  display: none;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.2s ease;
  background: white;
}

.payment-card:hover {
  border-color: #22c55e;
}

.payment-option.active .payment-card {
  border-color: #22c55e;
  background: #f0fdf4;
}

.payment-icon {
  flex-shrink: 0;
}

.payment-details h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.payment-details p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.payment-check {
  margin-left: auto;
  color: #22c55e;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.payment-option.active .payment-check {
  opacity: 1;
  transform: scale(1);
}

/* Card Details */
.card-details {
  margin-top: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 16px;
  align-items: center;
}

.item-image {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.item-provider {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-badge {
  background: #dcfce7;
  color: #166534;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.item-price {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

/* Sidebar */
.checkout-sidebar {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.summary-card h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.summary-items {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #6b7280;
}

.summary-row strong {
  color: #1f2937;
  font-weight: 600;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

.summary-row.total {
  padding-top: 16px;
  font-size: 18px;
}

.total-amount {
  color: #22c55e;
  font-size: 24px;
  font-weight: 700;
}

/* Promo Section */
.promo-section {
  margin-bottom: 20px;
}

.promo-section .input-with-icon {
  display: flex;
  gap: 8px;
}

.promo-section input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
}

.btn-apply {
  padding: 12px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-apply:hover {
  background: #e5e7eb;
}

/* Checkout Button */
.btn-checkout {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34,197,94,0.4);
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Security Badges */
.security-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.badge svg {
  color: #22c55e;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .checkout-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 20px 16px 120px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .step-label {
    font-size: 11px;
  }

  .summary-card {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  }

  .summary-card h2 {
    display: none;
  }

  .security-badges {
    display: none;
  }
}
</style>