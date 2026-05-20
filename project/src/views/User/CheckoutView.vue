<template>
  <div class="checkout">
    <NavigationBar />
    <br />

    <div v-if="loading" class="status-screen">
      <div class="status-card loading-card">
        <div class="spinner"></div>
        <h2>Processing your order...</h2>
        <p>Please wait a moment while we confirm your purchase.</p>
      </div>
    </div>

    <div v-else-if="orderResult" class="status-screen">
      <div class="status-card" :class="orderResult">
        <div class="status-icon">
          <span v-if="orderResult === 'success'">✔</span>
          <span v-else>✖</span>
        </div>

        <h2>
          {{ orderResult === 'success'
            ? 'Order Confirmed'
            : 'Order Failed'
          }}
        </h2>

        <p>{{ orderMessage }}</p>

        <div class="status-actions">
          <button
            v-if="orderResult === 'success'"
            @click="goToReceipt"
            class="btn btn-primary"
          >
            View Receipt
          </button>

          <button
            v-else
            @click="resetOrder"
            class="btn btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <section class="section checkout-sections">
        <div class="section-inner">
          <div class="checkout-grid">

            <!-- LEFT COLUMN -->
            <div class="checkout-left">

              <!-- REVIEW ITEMS -->
              <div class="checkout-section">
                <h2>Review Items</h2>

                <div class="review-items">
                  <div
                    v-for="item in orderItems"
                    :key="item.id"
                    class="review-item"
                  >
                    <div class="item-image">
                      <img :src="item.image" :alt="item.name" />
                    </div>

                    <div class="item-info">
                      <h4>{{ item.name }}</h4>
                      <p>{{ item.quantity }} × ${{ item.price }}</p>
                    </div>

                    <div class="item-price">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- SHIPPING ADDRESS -->
              <div class="checkout-section">
                <div class="section-header">
                  <h2>Shipping Address</h2>
                  <button @click="goToAddress" class="edit-btn">EDIT</button>
                </div>

                <div class="address-display">
                  <p>
                    <strong>
                      {{ shipping.firstName }}
                      {{ shipping.lastName }}
                    </strong>
                  </p>

                  <p>{{ shipping.address }}</p>

                  <p>
                    {{ shipping.city }},
                    {{ shipping.state }}
                    {{ shipping.zip }}
                  </p>

                  <p>{{ shipping.country }}</p>
                  <p>{{ shipping.phone }}</p>
                  <p>{{ shipping.email }}</p>
                </div>
              </div>

              <!-- PAYMENT -->
              <div class="checkout-section">
                <h2>Payment Method</h2>

                <div class="payment-options">

                  <!-- BANK -->
                  <label class="payment-option">
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="bank"
                    />

                    <div class="option-content">
                      <div class="option-header">
                        <span class="option-name">
                          Local Bank Transfer
                        </span>
                      </div>

                      <div class="bank-content">
                        <div class="bank-info">
                          <p><strong>ABA Bank</strong></p>
                          <p>Account: 000 123 456</p>
                          <p>Name: Vegetable Market</p>

                          <p class="bank-note">
                            Please open your banking app and transfer to the
                            account above
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <!-- CASH -->
                  <label class="payment-option">
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="cash"
                    />

                    <div class="option-content">
                      <div class="option-header">
                        <span class="option-name">
                          Cash on Delivery
                        </span>
                      </div>

                      <div class="cash-content">
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  <!-- CARD -->
                  <label class="payment-option">
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="card"
                    />

                    <div class="option-content">
                      <div class="option-header">
                        <span class="option-name">
                          Visa/Mastercard
                        </span>

                        <div class="card-icons">
                          <span class="card-icon">VISA</span>
                          <span class="card-icon">MC</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  <!-- CARD DETAILS -->
                  <div
                    v-if="paymentMethod === 'card'"
                    class="card-details"
                  >
                    <div class="form-grid">

                      <div class="form-group full-width">
                        <label>Card Number</label>

                        <input
                          v-model="card.number"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>

                      <div class="form-group">
                        <label>Expiry Date</label>

                        <input
                          v-model="card.expiry"
                          type="text"
                          placeholder="MM/YY"
                        />
                      </div>

                      <div class="form-group">
                        <label>CVV</label>

                        <input
                          v-model="card.cvv"
                          type="text"
                          placeholder="123"
                        />
                      </div>

                      <div class="form-group full-width">
                        <label>Cardholder Name</label>

                        <input
                          v-model="card.name"
                          type="text"
                          placeholder="John Doe"
                        />
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>

            <!-- RIGHT COLUMN -->
            <div class="checkout-right">
              <div class="order-summary">

                <h2>Order Summary</h2>

                <div class="summary-totals">

                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>${{ calculateSubtotal() }}</span>
                  </div>

                  <div class="total-row">
                    <span>Delivery Fee</span>
                    <span>${{ getShippingCost() }}</span>
                  </div>

                  <div class="total-row">
                    <span>Service Fee</span>
                    <span>$1.00</span>
                  </div>

                  <div class="total-divider"></div>

                  <div class="total-row final">
                    <span>Total Amount</span>
                    <span>${{ calculateTotal() }}</span>
                  </div>

                </div>

                <button
                  class="confirm-order-btn"
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

          </div>
        </div>
      </section>

      <Footer />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '../../stores/cartStore'
import { useUserStore } from '@/stores/userStore'

import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const API_BASE_URL = 'http://localhost:3000'

const shipping = ref({
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Main Street',
  city: 'Phnom Penh',
  state: 'Phnom Penh',
  zip: '12000',
  country: 'Cambodia',
  phone: '+855 12 345 678',
  email: 'john.doe@example.com'
})

const paymentMethod = ref('bank')

const card = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const loading = ref(false)
const orderResult = ref('')
const orderMessage = ref('')
const orderItems = computed(() => cartStore.cartItems)

const calculateSubtotal = () => {
  return orderItems.value
    .reduce((total, item) => {
      return total + Number(item.unitPrice ?? item.price ?? 0) * item.quantity
    }, 0)
    .toFixed(2)
}

const getShippingCost = () => {
  return 2.0
}

const calculateTotal = () => {
  const subtotal = parseFloat(calculateSubtotal())
  const shipping = getShippingCost()
  const serviceFee = 1.0

  return (subtotal + shipping + serviceFee).toFixed(2)
}

const confirmOrder = async () => {
  if (!orderItems.value.length) {
    orderResult.value = 'error'
    orderMessage.value = 'Your cart is empty. Add products before placing an order.'
    return
  }

  const customerId = Number(userStore.user?.id ?? JSON.parse(localStorage.getItem('user') || 'null')?.id)
  if (!customerId) {
    orderResult.value = 'error'
    orderMessage.value = 'Please log in before placing an order.'
    return
  }

  if (paymentMethod.value === 'card') {
    const { number, expiry, cvv, name } = card.value

    if (!number || !expiry || !cvv || !name) {
      orderResult.value = 'error'
      orderMessage.value =
        'Please fill in all card details before confirming your order.'

      return
    }
  }

  loading.value = true
  orderResult.value = ''
  orderMessage.value = ''

  try {
    const groupedOrders = groupCartItemsByProvider(orderItems.value)

    const createdOrders = []
    for (const group of groupedOrders) {
      const response = await axios.post(`${API_BASE_URL}/orders`, {
        order_code: generateOrderNumber(),
        customer_id: customerId,
        provider_id: group.providerId,
        status: 'pending',
        total: group.items.reduce((sum, item) => {
          return sum + Number(item.unitPrice ?? item.price ?? 0) * item.quantity
        }, 0),
        item: group.items.reduce((sum, item) => sum + item.quantity, 0),
        items: group.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      })

      if (response.data?.error) {
        throw new Error(response.data.error)
      }

      createdOrders.push(response.data)
    }

    const orderData = {
      orderNumber: createdOrders.map(order => order?.data?.order_code || order?.order_code).filter(Boolean).join(', '),
      orderDate: new Date().toLocaleDateString(),
      paymentMethod: getPaymentMethodName(),
      customer: shipping.value,
      items: orderItems.value,
      estimatedDelivery: calculateEstimatedDelivery(),
      trackingNumber: generateTrackingNumber(),
      amount: calculateTotal(),
      backendOrders: createdOrders,
    }

    localStorage.setItem('lastOrder', JSON.stringify(orderData))
    saveTransaction(orderData)
    cartStore.clearCart()

    loading.value = false
    orderResult.value = 'success'
    orderMessage.value = `Order placed successfully and saved to the backend.`
  } catch (error) {
    loading.value = false
    orderResult.value = 'error'
    orderMessage.value = error.response?.data?.message || error.message || 'Payment processing error. Please try again.'
  }
}

const groupCartItemsByProvider = (items) => {
  const groups = new Map()

  items.forEach((item) => {
    const providerId = Number(item.providerId ?? item.provider_id ?? 0) || null
    const key = providerId ?? `product-${item.id}`

    if (!groups.has(key)) {
      groups.set(key, {
        providerId,
        items: [],
      })
    }

    groups.get(key).items.push(item)
  })

  return Array.from(groups.values())
}

const processPayment = async () => {
  const totalAmount = calculateTotal()
  const transactionId = generateTransactionId()

  // Simulate different payment processing based on method
  switch (paymentMethod.value) {
    case 'card':
      return processCardPayment(totalAmount, transactionId)
    case 'bank':
      return processBankTransfer(totalAmount, transactionId)
    case 'cash':
      return processCashOnDelivery(totalAmount, transactionId)
    default:
      return { success: false, message: 'Invalid payment method' }
  }
}

const processCardPayment = async (amount, transactionId) => {
  // Simulate card payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate validation (in real app, this would be actual payment gateway)
  const { number, expiry, cvv } = card.value
  
  if (number.length < 13 || expiry.length < 5 || cvv.length < 3) {
    return { success: false, message: 'Invalid card details' }
  }

  // Simulate occasional payment failure (10% chance)
  if (Math.random() < 0.1) {
    return { success: false, message: 'Card declined by bank' }
  }

  return {
    success: true,
    transactionId,
    method: 'Credit Card',
    status: 'completed',
    timestamp: new Date().toISOString()
  }
}

const processBankTransfer = async (amount, transactionId) => {
  // Simulate bank transfer processing
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    success: true,
    transactionId,
    method: 'Bank Transfer',
    status: 'pending',
    message: 'Please complete the bank transfer within 24 hours',
    timestamp: new Date().toISOString()
  }
}

const processCashOnDelivery = async (amount, transactionId) => {
  // Simulate cash on delivery processing
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    transactionId,
    method: 'Cash on Delivery',
    status: 'pending',
    message: 'Payment will be collected upon delivery',
    timestamp: new Date().toISOString()
  }
}

const generateOrderNumber = () => {
  return 'ORD-' + Date.now().toString(36).toUpperCase()
}

const generateTransactionId = () => {
  return 'TXN-' + Math.random().toString(36).substr(2, 12).toUpperCase()
}

const generateTrackingNumber = () => {
  return 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase()
}

const calculateEstimatedDelivery = () => {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)
  return deliveryDate.toLocaleDateString()
}

const getPaymentMethodName = () => {
  const methods = {
    'card': 'Credit Card',
    'bank': 'Bank Transfer',
    'cash': 'Cash on Delivery'
  }
  return methods[paymentMethod.value] || 'Unknown'
}

const saveTransaction = (orderData) => {
  // Save to transaction history
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
  transactions.push({
    ...orderData,
    timestamp: new Date().toISOString(),
    type: 'purchase'
  })
  localStorage.setItem('transactions', JSON.stringify(transactions))
}

const resetOrder = () => {
  orderResult.value = ''
  orderMessage.value = ''
}

const goHome = () => {
  router.push('/')
}

const goToReceipt = () => {
  router.push('/receipt')
}

const goToAddress = () => {
  router.push('/address')
}
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
}

.checkout-sections {
  flex: 1;
  padding: 40px 24px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.checkout-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.checkout-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1a;
  margin: 0 0 24px;
}

.confirm-order-btn {
  width: 100%;
  padding: 16px;
  background: #2d7a3a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
}

.confirm-order-btn:hover {
  background: #1a5c27;
}

.status-screen {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-card {
  width: min(560px, 100%);
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
}

.spinner {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  border: 6px solid #e5e7eb;
  border-top-color: #2d7a3a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
}

@media (max-width: 768px) {
  .checkout-sections {
    padding: 24px 16px;
  }

  .checkout-section {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>