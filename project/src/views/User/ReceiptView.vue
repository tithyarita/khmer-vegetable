<template>
  <div class="receipt">
    <NavigationBar />
    <br>

    <section class="section receipt-section">
      <div class="section-inner">
        <div v-if="!hasOrder" class="no-order-card">
          <div class="no-order-icon">🧾</div>
          <h2>No Receipt Found</h2>
          <p>Complete a checkout first to generate your order receipt.</p>
          <button @click="goHome" class="action-btn home-btn">Browse Products</button>
        </div>

        <div v-else ref="receiptContainer" class="receipt-container">
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
                    <img v-if="item.image" :src="item.image" :alt="item.name" />
                    <div v-else class="item-placeholder">{{ (item.name || '?')[0] }}</div>
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
                  <span :class="{ 'free-label': fees.shipping === 0 }">
                    {{ fees.shipping === 0 ? 'Free' : `$${fees.shipping.toFixed(2)}` }}
                  </span>
                </div>
                <div class="price-row">
                  <span>Service Fee</span>
                  <span>${{ fees.service.toFixed(2) }}</span>
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

        <div v-if="hasOrder" ref="receiptExport" class="receipt-export" aria-hidden="true">
          <div class="export-header">
            <div>
              <p class="export-kicker">Khmer Vegetable Market</p>
              <h1>Receipt</h1>
            </div>
            <div class="export-status">Confirmed</div>
          </div>

          <div class="export-meta">
            <div>
              <span>Order Number</span>
              <strong>{{ orderNumber }}</strong>
            </div>
            <div>
              <span>Order Date</span>
              <strong>{{ orderDate }}</strong>
            </div>
            <div>
              <span>Payment Method</span>
              <strong>{{ paymentMethod }}</strong>
            </div>
            <div>
              <span>Tracking Number</span>
              <strong>{{ trackingNumber }}</strong>
            </div>
          </div>

          <div class="export-section">
            <h2>Customer</h2>
            <p><strong>{{ customer.firstName }} {{ customer.lastName }}</strong></p>
            <p>{{ customer.address }}</p>
            <p>{{ customer.city }}, {{ customer.state }} {{ customer.zip }}</p>
            <p>{{ customer.country }}</p>
            <p>{{ customer.phone }} | {{ customer.email }}</p>
          </div>

          <div class="export-section">
            <h2>Items</h2>
            <table class="export-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="center">Qty</th>
                  <th class="right">Unit Price</th>
                  <th class="right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.id">
                  <td>
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-provider">{{ item.providerName || 'Unknown' }}</div>
                  </td>
                  <td class="center">{{ item.quantity }}</td>
                  <td class="right">${{ Number(item.unitPrice ?? item.price ?? 0).toFixed(2) }}</td>
                  <td class="right">${{ (Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 0)).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="export-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>${{ calculateSubtotal() }}</strong>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <strong :class="{ 'free-label': fees.shipping === 0 }">
                {{ fees.shipping === 0 ? 'Free' : `$${fees.shipping.toFixed(2)}` }}
              </strong>
            </div>
            <div class="summary-row">
              <span>Service Fee</span>
              <strong>${{ fees.service.toFixed(2) }}</strong>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <strong>${{ calculateTotal() }}</strong>
            </div>
          </div>

          <div class="export-section export-footer">
            <p>Estimated Delivery: {{ estimatedDelivery }}</p>
            <p>Thank you for your purchase.</p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import html2pdf from 'html2pdf.js'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const orderNumber = ref('')
const orderDate = ref('')
const paymentMethod = ref('')
const customer = ref({})
const orderItems = ref([])
const estimatedDelivery = ref('')
const trackingNumber = ref('')
const hasOrder = ref(false)
const receiptContainer = ref(null)
const receiptExport = ref(null)

const fees = reactive({
  subtotal: 0,
  shipping: 0,
  service: 1,
  total: 0,
})

const UNKNOWN = 'Unknown'

const normalizeField = (value) => {
  const normalized = String(value ?? '').trim()
  return normalized || UNKNOWN
}

const splitName = (value) => {
  const name = String(value ?? '').trim()
  if (!name) return { firstName: UNKNOWN, lastName: '' }
  const [firstName, ...rest] = name.split(/\s+/)
  return {
    firstName: normalizeField(firstName),
    lastName: normalizeField(rest.join(' ')),
  }
}

const getLoggedInUser = () => {
  return JSON.parse(localStorage.getItem('user') || 'null') || {}
}

const resolveImage = (image) => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE}${image.startsWith('/') ? image : `/${image}`}`
}

const loadFromStorage = () => {
  const raw = localStorage.getItem('lastOrder')
  if (!raw) return false

  try {
    const data = JSON.parse(raw)
    if (!data.items?.length) return false

    orderNumber.value = data.orderNumber || `ORD-${Date.now()}`
    orderDate.value = data.orderDate || new Date().toLocaleDateString()
    paymentMethod.value = data.paymentMethod || 'Bank Transfer'
    customer.value = data.customer || buildCustomerFromUser()
    orderItems.value = data.items.map(item => ({
      ...item,
      image: resolveImage(item.image),
    }))
    estimatedDelivery.value = data.estimatedDelivery || getEstimatedDelivery()
    trackingNumber.value = data.trackingNumber || generateTrackingNumber()

    fees.subtotal = Number(data.subtotal ?? calculateSubtotalFromItems())
    fees.shipping = Number(data.shippingFee ?? 0)
    fees.service = Number(data.serviceFee ?? 1)
    fees.total = Number(data.total ?? (fees.subtotal + fees.shipping + fees.service))

    hasOrder.value = true
    return true
  } catch {
    return false
  }
}

const buildCustomerFromUser = () => {
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
      country: normalizeField(address.country || 'Cambodia'),
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
    country: normalizeField(account.country || 'Cambodia'),
    phone: normalizeField(account.phone || account.phoneNumber),
    email: normalizeField(account.email),
  }
}

const generateTrackingNumber = () => {
  return 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase()
}

const getEstimatedDelivery = () => {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)
  return deliveryDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const calculateSubtotalFromItems = () => {
  return orderItems.value.reduce((total, item) => {
    return total + (Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 0))
  }, 0)
}

onMounted(() => {
  loadFromStorage()
})

const calculateSubtotal = () => {
  if (fees.subtotal > 0) return fees.subtotal.toFixed(2)
  return calculateSubtotalFromItems().toFixed(2)
}

const calculateTotal = () => {
  if (fees.total > 0) return fees.total.toFixed(2)
  const subtotal = parseFloat(calculateSubtotal())
  return (subtotal + fees.shipping + fees.service).toFixed(2)
}

const printReceipt = () => {
  window.print()
}

const downloadReceipt = async () => {
  await nextTick()

  if (!receiptExport.value) {
    alert('Receipt is not ready to download yet.')
    return
  }

  const filename = `receipt-${orderNumber.value || 'order'}.pdf`
  const exportClone = receiptExport.value.cloneNode(true)
  const exportWrapper = document.createElement('div')

  exportClone.classList.remove('receipt-export')
  exportClone.style.width = '210mm'
  exportClone.style.padding = '18mm'
  exportClone.style.background = '#ffffff'
  exportClone.style.color = '#102016'
  exportClone.style.fontFamily = "Georgia, 'Times New Roman', serif"
  exportClone.style.boxSizing = 'border-box'

  exportWrapper.style.position = 'fixed'
  exportWrapper.style.left = '0'
  exportWrapper.style.top = '0'
  exportWrapper.style.width = '210mm'
  exportWrapper.style.background = '#ffffff'
  exportWrapper.style.zIndex = '-1'
  exportWrapper.style.pointerEvents = 'none'
  exportWrapper.style.opacity = '1'
  exportWrapper.appendChild(exportClone)
  document.body.appendChild(exportWrapper)

  const options = {
    margin: [10, 8, 10, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css'] },
  }

  try {
    await html2pdf().set(options).from(exportClone).save()
  } finally {
    document.body.removeChild(exportWrapper)
  }
}

const generateReceiptText = () => {
  const deliveryLabel = fees.shipping === 0 ? 'Free' : `$${fees.shipping.toFixed(2)}`
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
  `${item.name} - ${item.quantity} × $${Number(item.unitPrice ?? item.price ?? 0).toFixed(2)} = $${(Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 0)).toFixed(2)}`
).join('\n')}

Subtotal: $${calculateSubtotal()}
Delivery Fee: ${deliveryLabel}
Service Fee: $${fees.service.toFixed(2)}
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

.receipt-export {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 210mm;
  padding: 18mm;
  background: #ffffff;
  color: #102016;
  font-family: Georgia, 'Times New Roman', serif;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  border-bottom: 3px solid #2d7a3a;
  padding-bottom: 16px;
  margin-bottom: 18px;
}

.export-kicker {
  margin: 0 0 4px;
  color: #2d7a3a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 700;
}

.export-header h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
}

.export-status {
  border: 1px solid #2d7a3a;
  color: #2d7a3a;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.export-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
  margin-bottom: 18px;
}

.export-meta div,
.export-section,
.export-summary {
  border: 1px solid #d9e2d9;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fbfdfb;
}

.export-meta span {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #607264;
  margin-bottom: 4px;
}

.export-meta strong,
.export-section p,
.summary-row strong,
.export-table,
.export-table th,
.export-table td {
  font-size: 13px;
}

.export-section {
  margin-bottom: 16px;
}

.export-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  color: #17301d;
}

.export-section p {
  margin: 0 0 6px;
  color: #324436;
}

.export-table {
  width: 100%;
  border-collapse: collapse;
}

.export-table th,
.export-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e4ece4;
  vertical-align: top;
}

.export-table th {
  text-align: left;
  color: #607264;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
}

.export-table .center {
  text-align: center;
}

.export-table .right {
  text-align: right;
}

.item-name {
  font-weight: 700;
  color: #102016;
}

.item-provider {
  margin-top: 2px;
  color: #607264;
  font-size: 12px;
}

.export-summary {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row.total {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 2px solid #2d7a3a;
  font-size: 15px;
}

.summary-row.total strong {
  color: #2d7a3a;
  font-size: 16px;
}

.export-footer {
  text-align: center;
  background: #f6faf6;
}

.export-footer p:last-child {
  margin-bottom: 0;
  font-weight: 700;
  color: #17301d;
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

.free-label {
  color: #15803d;
  font-weight: 700;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
  font-size: 18px;
  border-radius: 8px;
}

.no-order-card {
  max-width: 480px;
  margin: 60px auto;
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
}

.no-order-icon { font-size: 48px; margin-bottom: 16px; }
.no-order-card h2 { font-size: 1.25rem; color: #111827; margin: 0 0 8px; }
.no-order-card p { color: #6b7280; margin: 0 0 24px; font-size: 0.9rem; }
</style>
