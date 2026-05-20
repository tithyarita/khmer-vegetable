<template>
  <div class="receipt">
    <NavigationBar />
    <br>

    <section class="section receipt-section">
      <div class="section-inner">
        <div class="receipt-container">
          <!-- Receipt Header -->
          <div class="receipt-header">
            <div class="success-badge">
              <div class="success-icon">✓</div>
              <h2>Order Confirmed</h2>
            </div>
            <p class="thank-you">Thank you for your purchase!</p>
          </div>

          <!-- Order Details -->
          <div class="receipt-details">
            <div class="detail-section">
              <h3>Order Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Order Number:</span>
                  <span class="value">{{ orderNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Order Date:</span>
                  <span class="value">{{ orderDate }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Payment Method:</span>
                  <span class="value">{{ paymentMethod }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="value status confirmed">Confirmed</span>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="detail-section">
              <h3>Customer Information</h3>
              <div class="customer-info">
                <p><strong>{{ customer.firstName }} {{ customer.lastName }}</strong></p>
                <p>{{ customer.address }}</p>
                <p>{{ customer.city }}, {{ customer.state }} {{ customer.zip }}</p>
                <p>{{ customer.country }}</p>
                <p>{{ customer.phone }}</p>
                <p>{{ customer.email }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="detail-section">
              <h3>Order Items</h3>
              <div class="items-list">
                <div v-for="item in orderItems" :key="item.id" class="receipt-item">
                  <div class="item-image">
                    <img :src="item.image" :alt="item.name" />
                  </div>
                  <div class="item-details">
                    <h4>{{ item.name }}</h4>
                    <p>Quantity: {{ item.quantity }}</p>
                    <p class="provider-line">
                      Provider: {{ item.providerName || 'Unknown' }}
                      <span v-if="item.providerId">(#{{ item.providerId }})</span>
                    </p>
                  </div>
                  <div class="item-price">
                    ${{ ((Number(item.unitPrice ?? item.price ?? 0)) * Number(item.quantity ?? 0)).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="detail-section">
              <h3>Price Breakdown</h3>
              <div class="price-breakdown">
                <div class="price-row">
                  <span>Subtotal</span>
                  <span>${{ calculateSubtotal() }}</span>
                </div>
                <div class="price-row">
                  <span>Delivery Fee</span>
                  <span>${{ getShippingCost() }}</span>
                </div>
                <div class="price-row">
                  <span>Service Fee</span>
                  <span>$1.00</span>
                </div>
                <div class="price-divider"></div>
                <div class="price-row total">
                  <span>Total Amount</span>
                  <span>${{ calculateTotal() }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="detail-section">
              <h3>Delivery Information</h3>
              <div class="delivery-info">
                <div class="detail-item">
                  <span class="label">Delivery Method:</span>
                  <span class="value">Standard Delivery</span>
                </div>
                <div class="detail-item">
                  <span class="label">Estimated Delivery:</span>
                  <span class="value">{{ estimatedDelivery }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Tracking Number:</span>
                  <span class="value">{{ trackingNumber }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="receipt-actions">
            <button @click="printReceipt" class="action-btn print-btn">
              🖨️ Print Receipt
            </button>
            <button @click="downloadReceipt" class="action-btn download-btn">
              📥 Download PDF
            </button>
            <button @click="goHome" class="action-btn home-btn">
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'

const router = useRouter()

// Receipt data
const orderNumber = ref('')
const orderDate = ref('')
const paymentMethod = ref('')
const customer = ref({})
const orderItems = ref([])
const estimatedDelivery = ref('')
const trackingNumber = ref('')

const UNKNOWN = 'Unknown'

const normalizeField = (value) => {
  const normalized = String(value ?? '').trim()
  return normalized || UNKNOWN
}

const splitName = (value) => {
  const name = String(value ?? '').trim()
  if (!name) {
    return { firstName: UNKNOWN, lastName: UNKNOWN }
  }
  const [firstName, ...rest] = name.split(/\s+/)
  return {
    firstName: normalizeField(firstName),
    lastName: normalizeField(rest.join(' ')),
  }
}

const getLoggedInUser = () => {
  return JSON.parse(localStorage.getItem('user') || 'null') || {}
}

// Generate order details on component mount
onMounted(() => {
  // Get order data from localStorage (in real app, this would come from API)
  const orderData = localStorage.getItem('lastOrder')
  if (orderData) {
    const data = JSON.parse(orderData)
    orderNumber.value = data.orderNumber || generateOrderNumber()
    orderDate.value = data.orderDate || new Date().toLocaleDateString()
    paymentMethod.value = data.paymentMethod || 'Bank Transfer'
    customer.value = data.customer || getCustomerData()
    orderItems.value = data.items || getSampleItems()
    estimatedDelivery.value = data.estimatedDelivery || calculateEstimatedDelivery()
    trackingNumber.value = data.trackingNumber || generateTrackingNumber()
  } else {
    // Generate sample data if no order data exists
    orderNumber.value = generateOrderNumber()
    orderDate.value = new Date().toLocaleDateString()
    paymentMethod.value = 'Bank Transfer'
    customer.value = getCustomerData()
    orderItems.value = getSampleItems()
    estimatedDelivery.value = calculateEstimatedDelivery()
    trackingNumber.value = generateTrackingNumber()
  }
})

const generateOrderNumber = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const generateTrackingNumber = () => {
  return 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase()
}

const getCustomerData = () => {
  const savedAddress = localStorage.getItem('shippingAddress')
  if (savedAddress) {
    const address = JSON.parse(savedAddress)
    return {
      firstName: normalizeField(address.firstName),
      lastName: normalizeField(address.lastName),
      address: normalizeField(address.address),
      city: normalizeField(address.city),
      state: normalizeField(address.state),
      zip: normalizeField(address.zip),
      country: normalizeField(address.country),
      phone: normalizeField(address.phone),
      email: normalizeField(address.email),
    }
  }

  const account = getLoggedInUser()
  const fullName = splitName(account.name || account.fullName)
  return {
    firstName: normalizeField(account.firstName || fullName.firstName),
    lastName: normalizeField(account.lastName || fullName.lastName),
    address: normalizeField(account.address || account.street || account.location),
    city: normalizeField(account.city),
    state: normalizeField(account.state || account.province),
    zip: normalizeField(account.zip || account.postalCode),
    country: normalizeField(account.country),
    phone: normalizeField(account.phone || account.phoneNumber),
    email: normalizeField(account.email),
  }
}

const getSampleItems = () => {
  return [
    {
      id: 1,
      name: 'Organic Curly Kale Bunch',
      price: 2.50,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&q=80'
    },
    {
      id: 2,
      name: 'Fresh Garden Radish (Bunch)',
      price: 1.99,
      quantity: 3,
      image: 'https://images.unsplash.com/photo-1585278407894-e2a1386378d9?w=400&q=80'
    },
    {
      id: 3,
      name: 'Sweet Red Bell Peppers (3 Pack)',
      price: 3.45,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1563565375-fc4c4e308637?w=400&q=80'
    }
  ]
}

const calculateEstimatedDelivery = () => {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5) // 5 days from now
  return deliveryDate.toLocaleDateString()
}

const calculateSubtotal = () => {
  return orderItems.value.reduce((total, item) => {
    return total + (Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 0))
  }, 0).toFixed(2)
}

const getShippingCost = () => {
  return '2.00'
}

const calculateTotal = () => {
  const subtotal = parseFloat(calculateSubtotal())
  const shipping = parseFloat(getShippingCost())
  const serviceFee = 1.00
  return (subtotal + shipping + serviceFee).toFixed(2)
}

const printReceipt = () => {
  window.print()
}

const downloadReceipt = () => {
  // In a real application, this would generate and download a PDF
  console.log('Downloading receipt as PDF...')
  
  // Create a simple text download for demo
  const receiptContent = generateReceiptText()
  const blob = new Blob([receiptContent], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${orderNumber.value}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const generateReceiptText = () => {
  return `
ORDER RECEIPT
===============

Order Number: ${orderNumber.value}
Order Date: ${orderDate.value}
Payment Method: ${paymentMethod.value}

Customer Information:
${customer.value.firstName} ${customer.value.lastName}
${customer.value.address}
${customer.value.city}, ${customer.value.state} ${customer.value.zip}
${customer.value.country}
${customer.value.phone}
${customer.value.email}

Order Items:
${orderItems.value.map(item => 
  `${item.name} - ${item.quantity} × $${item.price} = $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${calculateSubtotal()}
Delivery Fee: $${getShippingCost()}
Service Fee: $1.00
Total: $${calculateTotal()}

Estimated Delivery: ${estimatedDelivery.value}
Tracking Number: ${trackingNumber.value}

Thank you for your purchase!
  `.trim()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.receipt {
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
}

.receipt-section {
  flex: 1;
  padding: 40px 24px;
}

.receipt-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Receipt Header */
.receipt-header {
  text-align: center;
  margin-bottom: 40px;
}

.success-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.success-icon {
  width: 40px;
  height: 40px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.success-badge h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #166534;
  margin: 0;
}

.thank-you {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 32px;
}

.detail-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

.value {
  font-weight: 600;
  color: #1a2e1a;
}

.status.confirmed {
  color: #22c55e;
  font-weight: 600;
}

/* Customer Information */
.customer-info {
  line-height: 1.6;
  color: #374151;
}

.customer-info p {
  margin: 0 0 8px;
}

.customer-info strong {
  color: #1a2e1a;
}

/* Order Items */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.receipt-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 4px;
}

.item-details p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.item-price {
  font-weight: 600;
  color: #1a2e1a;
  font-size: 16px;
  text-align: right;
}

/* Price Breakdown */
.price-breakdown {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 15px;
}

.price-row span:first-child {
  color: #6b7280;
}

.price-row span:last-child {
  font-weight: 600;
  color: #1a2e1a;
}

.price-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

.price-row.total {
  font-size: 18px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.price-row.total span:last-child {
  color: #2D7A3A;
  font-size: 20px;
}

/* Delivery Information */
.delivery-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Action Buttons */
.receipt-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #e5e7eb;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-btn {
  background: #6b7280;
  color: white;
}

.print-btn:hover {
  background: #4b5563;
}

.download-btn {
  background: #2D7A3A;
  color: white;
}

.download-btn:hover {
  background: #1a5c27;
}

.home-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-btn:hover {
  background: #e5e7eb;
}

/* Print Styles */
@media print {
  .receipt-actions {
    display: none;
  }
  
  .receipt-container {
    box-shadow: none;
    border: 1px solid #000;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .receipt-section {
    padding: 24px 16px;
  }
  
  .receipt-container {
    padding: 24px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .receipt-item {
    grid-template-columns: 50px 1fr auto;
    gap: 12px;
  }
  
  .item-image {
    width: 50px;
    height: 50px;
  }
  
  .receipt-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
.provider-line {
  font-size: 12px;
  color: #475569;
  margin-top: 4px;
}
</style>
