<template>
  <div class="checkout-page">
    <div class="bg-blur blur-1"></div>
    <div class="bg-blur blur-2"></div>

    <NavigationBar />

    <div class="checkout-container">
      <h1>Checkout</h1>
      
      <div v-if="loading" class="fullscreen-state">
        <div class="state-card glass-card">
          <div class="loader"></div>
          <p>Processing your order. Please wait...</p>
        </div>
      </div>

      <div v-else-if="orderResult === 'success'" class="fullscreen-state">
        <div class="state-card glass-card">
          <div class="result-icon">🎉</div>
          <h2>Success!</h2>
          <p>{{ orderMessage }}</p>
          <button @click="goToReceipt" class="primary-btn" style="margin-top: 16px;">View Receipt</button>
        </div>
      </div>

      <div v-else class="checkout-grid">
        
        <div class="checkout-left">
          
          <div class="glass-card collapse-card">
            <button @click="toggleSection('address')" class="collapse-header">
              <div class="collapse-left">
                <div class="collapse-icon green">📍</div>
                <div>
                  <h3>Shipping Address</h3>
                  <p>Where should we deliver your fresh vegetables?</p>
                </div>
              </div>
              <span class="arrow">{{ activeSection === 'address' ? '▲' : '▼' }}</span>
            </button>
            
            <transition name="expand">
              <div v-if="activeSection === 'address'" class="collapse-body">
                <div class="form-grid">
                  <div class="input-group full-width">
                    <label>Full Name</label>
                    <input v-model="shipping.name" type="text" placeholder="Receiver's name" />
                  </div>
                  <div class="input-group full-width">
                    <label>Street Address</label>
                    <input v-model="shipping.address" type="text" placeholder="House number, Street name, Commune" />
                  </div>
                  <div class="input-group">
                    <label>City / Town</label>
                    <input v-model="shipping.city" type="text" placeholder="Phnom Penh, etc." />
                  </div>
                  <div class="input-group">
                    <label>Province / State</label>
                    <input v-model="shipping.state" type="text" placeholder="Kandal, Siem Reap, etc." />
                  </div>
                  <div class="input-group">
                    <label>Phone Number</label>
                    <input v-model="shipping.phone" type="text" placeholder="012345678" />
                  </div>
                  <div class="input-group">
                    <label>Email Address</label>
                    <input v-model="shipping.email" type="email" placeholder="name@example.com" />
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div class="glass-card collapse-card">
            <button @click="toggleSection('payment')" class="collapse-header">
              <div class="collapse-left">
                <div class="collapse-icon blue">💳</div>
                <div>
                  <h3>Payment Method</h3>
                  <p>Choose your preferred payment gateway</p>
                </div>
              </div>
              <span class="arrow">{{ activeSection === 'payment' ? '▲' : '▼' }}</span>
            </button>

            <transition name="expand">
              <div v-if="activeSection === 'payment'" class="collapse-body">
                <!-- PAYMENT METHODS -->
                <div class="payment-list">
                
                  <div
                    @click="paymentMethod = 'qr'"
                    :class="['payment-card', { active: paymentMethod === 'qr' }]"
                  >
                    🏦
                    <div>
                      <strong>QR Payment (Recommended)</strong>
                      <p>Scan QR from provider</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'cash'"
                    :class="['payment-card', { active: paymentMethod === 'cash' }]"
                  >
                    🚚
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay when item arrives</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'visa'"
                    :class="['payment-card', { active: paymentMethod === 'visa' }]"
                  >
                    💳
                    <div>
                      <strong>Visa Card</strong>
                      <p>Pay using Visa</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'mastercard'"
                    :class="['payment-card', { active: paymentMethod === 'mastercard' }]"
                  >
                    💳
                    <div>
                      <strong>Mastercard</strong>
                      <p>Pay using Mastercard</p>
                    </div>
                  </div>
                
                </div>

                <div v-if="paymentMethod === 'qr'" class="aba-payment-box">
                  <h4 class="aba-title">Provider Payment Terminals</h4>
                  
                  <div v-if="providerPayments.length === 0" style="font-size: 13px; color: #64748b; padding: 10px 0;">
                    ⏳ Loading provider bank accounts...
                  </div>

                  <div v-else>
                    <p style="font-size: 12px; color: #475569; margin-bottom: 14px;">
                      Please scan and pay to the respective farm providers below:
                    </p>
                    
                    <div v-for="prov in providerPayments" :key="prov.providerId" class="provider-payment-card">
                      <h5 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">{{ prov.providerName }}</h5>
                      
                      <p v-if="!prov.banks || prov.banks.length === 0" style="font-size: 12px; color: #94a3b8; margin: 4px 0;">
                        No payment info provided by this vendor.
                      </p>

                      <div
                        v-for="bank in prov.banks.filter(
                          b => b.type === 'aba' && b.qr
                        )"
                        :key="bank.id"
                        class="bank-payment-item"
                      >
                        <img
                          :src="fullUrl(bank.qr)"
                          class="bank-qr"
                          alt="QR Payment"
                        />

                        <div class="bank-info-box">
                          <p>
                            <strong>Provider:</strong>
                            {{ prov.providerName }}
                          </p>
                        
                          <p>
                            <strong>Holder Name:</strong>
                            {{ bank.holder_name }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="receipt-upload">
                    <label style="font-size: 12px; font-weight: 600;">Upload Remittance Receipt Copy</label>
                    <input @change="handleReceiptUpload" type="file" accept="image/*" />
                  </div>
                  <div v-if="receiptPreview" class="receipt-preview-block">
                    <p style="font-size: 12px; color: #334155; margin: 12px 0 6px;">Saved receipt: {{ receiptFileName }}</p>
                    <img :src="receiptPreview" alt="Receipt preview" class="receipt-preview-img" />
                  </div>
                </div>

                <div v-if="paymentMethod === 'cash'" class="cash-payment-box">
                  <div class="cash-icon-wrapper">🍃</div>
                  <div class="cash-text-wrapper">
                    <h4>Cash Payment Verified</h4>
                    <p>Please prepare the exact amount of <strong>${{ total.toFixed(2) }}</strong> to deliver directly to our logistics driver during delivery execution.</p>
                  </div>
                </div>

                <div
                  v-if="paymentMethod === 'visa' || paymentMethod === 'mastercard'"
                  class="aba-payment-box"
                  style="margin-top: 16px;"
                >
                  <!-- Customer card input form -->
                  <div class="card-form" style="margin-bottom: 20px;">
                    <p style="font-size: 12px; font-weight: 700; color: #475569; margin: 0 0 12px;">
                      Your Card Details
                    </p>
                    <div class="form-grid">
                      <div class="input-group full-width">
                        <label>Cardholder Name</label>
                        <input v-model="card.name" type="text" placeholder="JOHN DOE" />
                      </div>
                      <div class="input-group full-width">
                        <label>Card Number</label>
                        <input
                          :value="card.number"
                          @input="handleCardNumber"
                          type="text"
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div class="input-group">
                        <label>Expiration</label>
                        <input
                          :value="card.expiry"
                          @input="handleExpiry"
                          type="text"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div class="input-group">
                        <label>CVV</label>
                        <input v-model="card.cvv" type="password" maxlength="4" placeholder="•••" />
                      </div>
                    </div>
                  </div>
                
                  <!-- Provider card info -->
                  <h4 class="aba-title">Provider Card Payment Details</h4>
                
                  <div v-if="providerPayments.length === 0" style="font-size: 13px; color: #64748b; padding: 10px 0;">
                    ⏳ Loading provider bank accounts...
                  </div>
                
                  <div v-else>

                    <p style="font-size: 12px; color: #475569; margin-bottom: 14px;">
                      Please transfer to the respective provider's card below:
                    </p>
                  
                    <div
                      v-for="prov in providerPayments"
                      :key="prov.providerId"
                      class="provider-payment-card"
                    >
                      <h5 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">
                        {{ prov.providerName }}
                      </h5>
                    
                      <p
                        v-if="!prov.banks.filter(b => b.type === paymentMethod).length"
                        style="font-size: 12px; color: #94a3b8;"
                      >
                        No {{ paymentMethod }} card info provided by this vendor.
                      </p>
                    
                      <div
                        v-for="bank in prov.banks.filter(b => b.type === paymentMethod)"
                        :key="bank.id"
                        class="bank-payment-item"
                      >
                        <div class="bank-info-box">
                          <p><strong>Provider:</strong> {{ prov.providerName }}</p>
                          <p><strong>Holder Name:</strong> {{ bank.holder_name }}</p>
                          <p><strong>Card Number:</strong> {{ bank.account }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                
                </div>

              </div>
            </transition>
          </div>

          <div class="glass-card collapse-card">
            <div class="review-list">
              <div v-for="item in orderItems" :key="item.id" class="review-item">
                <img :src="item.image ? `http://localhost:3000${item.image}` : '/images/placeholder.png'" class="review-image" alt="Vegetable" />
                <div>
                  <h4 style="margin: 0; font-size: 13px;">{{ item.name }}</h4>
                  <div class="review-meta">
                    <span class="qty-pill">Qty: {{ item.quantity }}</span>
                    <span>${{ Number(item.unitPrice || item.price).toFixed(2) }} / unit</span>
                  </div>
                </div>
                <div class="review-price">${{ itemTotal(item).toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="glass-card summary-card">
            <h3 style="margin: 0 0 14px; font-size: 15px;">Cost Summary</h3>
            <div class="summary-list">
              <div class="summary-row">
                <span style="color: #64748b;">Cart Subtotal</span>
                <strong>${{ subtotal.toFixed(2) }}</strong>
              </div>
              <div class="summary-row">
                <span style="color: #64748b;">Logistics/Shipping</span>
                <strong>${{ shippingFee.toFixed(2) }}</strong>
              </div>
              <div class="summary-row">
                <span style="color: #64748b;">Platform Service Fee</span>
                <strong>${{ serviceFee.toFixed(2) }}</strong>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <span>Grand Total</span>
                <span style="color: #16a34a;">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="Object.keys(errors).length > 0" class="error-box">
              <p v-for="(err, key) in errors" :key="key">⚠️ {{ err }}</p>
            </div>

            <button @click="confirmOrder" class="checkout-btn" style="margin-top: 18px;">
              Place Order (${{ total.toFixed(2) }})
            </button>

            <div class="security-box">
              <span class="security-item">🔒 End-to-End Encrypted Platform Connection</span>
              <span class="security-item">🌿 Directly Supporting Local Khmer Farmers</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'

import { useCartStore } from '../../stores/cartStore'
import { useUserStore } from '@/stores/userStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

/* --------------------------
    STATE
-------------------------- */
const loading = ref(false)
const orderResult = ref('')
const orderMessage = ref('')

const activeSection = ref('address')
const paymentMethod = ref('qr')

const shippingFee = ref(2)
const serviceFee = ref(1)

const providerPayments = ref([])
const paymentReceipt = ref(null)
const receiptPreview = ref('')
const receiptFileName = ref('')
const RECEIPT_STORAGE_KEY = 'checkoutReceipt'

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

/* --------------------------
    COMPUTED
-------------------------- */
const orderItems = computed(() => cartStore.cartItems || [])

const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + itemTotal(item)
  }, 0)
})

const total = computed(() => {
  return subtotal.value + shippingFee.value + serviceFee.value
})

/* --------------------------
    HELPERS
-------------------------- */
const itemTotal = (item) => {
  return (
    Number(item.unitPrice || item.price || 0) *
    Number(item.quantity || 1)
  )
}

const toggleSection = (section) => {
  activeSection.value = activeSection.value === section ? '' : section
}

const fullUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}

const dataURLToBlob = (dataUrl) => {
  const parts = dataUrl.split(',')
  const matches = parts[0].match(/:(.*?);/)
  const mime = matches ? matches[1] : ''
  const binary = atob(parts[1])
  const len = binary.length
  const buffer = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    buffer[i] = binary.charCodeAt(i)
  }
  return new Blob([buffer], { type: mime })
}

const restoreReceiptFromStorage = () => {
  const stored = localStorage.getItem(RECEIPT_STORAGE_KEY)
  if (!stored) return

  try {
    const parsed = JSON.parse(stored)
    if (!parsed?.dataUrl) return

    const blob = dataURLToBlob(parsed.dataUrl)
    paymentReceipt.value = new File([blob], parsed.name || 'receipt.png', {
      type: parsed.type || 'image/png',
    })
    receiptPreview.value = parsed.dataUrl
    receiptFileName.value = parsed.name || ''
    paymentMethod.value = 'qr'
  } catch (err) {
    console.error('Unable to restore saved receipt:', err)
  }
}

const saveReceiptToStorage = (file, dataUrl) => {
  try {
    localStorage.setItem(
      RECEIPT_STORAGE_KEY,
      JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      }),
    )
  } catch (err) {
    console.warn('Unable to persist receipt to localStorage:', err)
  }
}

const clearStoredReceipt = () => {
  paymentReceipt.value = null
  receiptPreview.value = ''
  receiptFileName.value = ''
  localStorage.removeItem(RECEIPT_STORAGE_KEY)
}

/* --------------------------
    USER DATA
-------------------------- */
const loadUserData = async () => {
  try {
    const user = userStore.user

    if (!user || !user.id) {
      router.push('/user/login?redirect=/checkout')
      return
    }

    shipping.name = user.name || ''
    shipping.phone = user.phone || ''
    shipping.email = user.email || ''

    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${API_BASE_URL}/address`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) return

    const data = await res.json()

    shipping.address = data.street || ''
    shipping.city = data.city || ''
    shipping.state = data.state || ''
    shipping.country = data.country || 'Cambodia'
  } catch (err) {
    console.error(err)
  }
}

/* --------------------------
    PROVIDER PAYMENTS
-------------------------- */
const loadProviderPayments = async () => {
  try {
    if (!orderItems.value || orderItems.value.length === 0) {
      return
    }

    const providerIds = [
      ...new Set(
        orderItems.value
          .map(
            item =>
              item.provider_id ||
              item.providerId ||
              item.provider?.user_id ||
              item.provider?.id ||
              item.provider?.provider_id
          )
          .filter(Boolean)
      ),
    ]

    const responses = await Promise.all(
      providerIds.map(async (id) => {
        try {
          const res = await axios.get(`${API_BASE_URL}/providers/${id}`)
          return res.data
        } catch (e) {
          console.error(`Failed to load payment details for provider ${id}`, e)
          return null
        }
      })
    )

    providerPayments.value = responses
      .filter(Boolean)
      .map(data => ({
        providerId: data.user_id,
        providerName: data.provider_name,
        banks: (data.banks || []).map((bank) => ({
          ...bank,
          qr: fullUrl(bank.qr),
        })),
      }))
  } catch (err) {
    console.error("Failed to load provider payments:", err)
  }
}

/* --------------------------
    VALIDATION
-------------------------- */
const clearErrors = () => {
  Object.keys(errors).forEach(k => delete errors[k])
}

const validateForm = () => {
  clearErrors()

  if (!shipping.name) errors.name = 'Name is required'
  if (!shipping.address) errors.address = 'Address is required'
  if (!shipping.city) errors.city = 'City is required'
  if (!shipping.phone) errors.phone = 'Phone is required'
  if (!shipping.email) errors.email = 'Email is required'

  if (shipping.email && !shipping.email.includes('@')) {
    errors.email = 'Invalid email'
  }

  if (paymentMethod.value === 'visa' || paymentMethod.value === 'mastercard') {
    if (card.number.replace(/\s/g, '').length < 16) {
      errors.card = 'Invalid card number'
    }
    if (!card.expiry) errors.expiry = 'Expiry required'
    if (!card.cvv) errors.cvv = 'CVV required'
    if (!card.name) errors.cardName = 'Name required'
  }

  return Object.keys(errors).length === 0
}

/* --------------------------
    FORMATTERS
-------------------------- */
const handleCardNumber = (e) => {
  card.number = e.target.value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 19)
}

const handleExpiry = (e) => {
  card.expiry = e.target.value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .slice(0, 5)
}

/* --------------------------
    RECEIPT
-------------------------- */
const handleReceiptUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result
    if (!dataUrl || typeof dataUrl !== 'string') return

    paymentReceipt.value = file
    receiptPreview.value = dataUrl
    receiptFileName.value = file.name
    saveReceiptToStorage(file, dataUrl)
  }
  reader.readAsDataURL(file)
}

/* --------------------------
    ORDER SUBMISSION (PROVIDER SPLIT LOGIC)
-------------------------- */
const confirmOrder = async () => {
  if (!validateForm()) return

  if (paymentMethod.value === 'qr' && !paymentReceipt.value) {
    errors.receipt = 'Please upload payment receipt'
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem('token')

    // Group items dynamically by their provider ID to structure your `ProviderOrders` layout
    const providerGroups = orderItems.value.reduce((groups, item) => {
      const pId = Number(
        item.provider_id ||
        item.providerId ||
        item.provider?.user_id ||
        item.provider?.id ||
        item.provider?.provider_id ||
        0,
      )
      if (!pId) return groups

      if (!groups[pId]) {
        groups[pId] = {
          provider_id: pId,
          subtotal: 0,
          items: []
        }
      }

      const itemCost = itemTotal(item)
      groups[pId].subtotal += itemCost
      groups[pId].items.push({
        product_id: Number(item.id || item.product_id || item.productId || 0),
        quantity: Number(item.quantity || 0),
      })

      return groups
    }, {})

    // Convert object to flat array for easy backend loop consumption
    const providerOrdersPayload = Object.values(providerGroups)

    if (providerOrdersPayload.length === 0) {
      errors.providerOrders = 'Unable to determine provider for cart items. Please refresh your cart or re-add items.'
      loading.value = false
      return
    }

    const formData = new FormData()
    formData.append('shipping', JSON.stringify(shipping))
    formData.append('payment_method', paymentMethod.value)
    formData.append('total', total.value)
    formData.append('subtotal', subtotal.value)
    formData.append('shippingFee', shippingFee.value)
    formData.append('serviceFee', serviceFee.value)
    
    // Pass standard global list & mapped vendor suborders for backend processing
    formData.append('items', JSON.stringify(orderItems.value))
    formData.append('providerOrders', JSON.stringify(providerOrdersPayload))

    const customerId = Number(userStore.user?.id ?? userStore.user?.user_id ?? 0)
    if (!customerId) {
      throw new Error('Unable to determine authenticated customer id.')
    }
    formData.append('customer_id', String(customerId))

    if (paymentMethod.value === 'qr' && paymentReceipt.value) {
      formData.append('receipt', paymentReceipt.value)
    } else if (paymentMethod.value === 'visa' || paymentMethod.value === 'mastercard') {
      formData.append('card', JSON.stringify(card))
    }

    await axios.post(`${API_BASE_URL}/orders`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    orderResult.value = 'success'
    orderMessage.value = 'Order placed successfully!'
    clearStoredReceipt()
    cartStore.clearCart()
  } catch (err) {
    console.error(err)
    console.error('Response data:', err.response?.data)  // ← shows exact backend error
    orderResult.value = 'error'
    orderMessage.value = err.response?.data?.message || 'Order execution failed.'
  } finally {
    loading.value = false
  }
}

const goToReceipt = () => {
  router.push('/receipt')
}

/* --------------------------
    LIFECYCLE & WATCHERS
-------------------------- */
watch(paymentMethod, async (newMethod) => {
  if (
    ['qr', 'visa', 'mastercard'].includes(newMethod) &&
    providerPayments.value.length === 0
  ) {
    await loadProviderPayments()
  }
})

watch(
  () => orderItems.value,
  async (newItems) => {
    if (newItems && newItems.length > 0 && paymentMethod.value === 'qr') {
      await loadProviderPayments()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await loadUserData()
  restoreReceiptFromStorage()
  await cartStore.fetchCartFromBackend()  // ← ADD THIS
  await loadProviderPayments()
  
})
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

.receipt-preview-block {
  margin-top: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.22);
  padding: 12px;
}

.receipt-preview-img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: 12px;
  margin-top: 8px;
  display: block;
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
  box-shadow: 0 10px 30px rgba(15,23,42,0.05);
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
  box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
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

.card-form {
  background: rgba(248,250,252,0.9);
  border-radius: 16px;
  padding: 16px;
}

.cash-payment-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(240, 253, 244, 0.9);
  border: 1px solid #bbf7d0;
}

.cash-icon-wrapper {
  width: 46px;
  height: 46px;
  background: #bbf7d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.cash-text-wrapper h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #14532d;
}

.cash-text-wrapper p {
  margin: 0;
  font-size: 12px;
  color: #166534;
  line-height: 1.5;
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
.primary-btn {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 13px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.checkout-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
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

.fullscreen-state {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.state-card {
  max-width: 460px;
  width: 100%;
  padding: 36px;
  text-align: center;
}

.result-icon {
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.aba-payment-box {
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(248,250,252,0.9);
  border: 1px solid #e2e8f0;
}

.aba-title {
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 700;
}

.provider-payment-card {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.bank-payment-item {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 12px;
}

.bank-qr {
  width: 130px;
  height: 130px;
  object-fit: contain;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: white;
}

.bank-info-box p {
  margin: 6px 0;
  font-size: 13px;
}

.receipt-upload {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receipt-upload input {
  border: 1px solid #dbe4ee;
  border-radius: 12px;
  padding: 10px;
  background: white;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .summary-card { position: static; }
}

@media (max-width: 768px) {
  .checkout-container { padding: 16px 12px 120px; }
  .form-grid { grid-template-columns: 1fr; }
  .review-item { grid-template-columns: 60px 1fr; }
  .review-price { grid-column: 2; justify-self: end; }
  .summary-card {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    border-radius: 24px 24px 0 0;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
}
</style>