<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <h2 class="modal-title">Order Details</h2>
            <p class="modal-subtitle">{{ order.id }}</p>
          </div>
          <button class="modal-close-btn" @click="close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="info-card card-customer">
            <h3 class="card-title">Customer Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{{ order.customerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Customer ID</span>
                <span class="info-value">{{ order.customerId }}</span>
              </div>
            </div>
          </div>

          <div class="info-card card-order">
            <h3 class="card-title">Order Summary</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Order Code</span>
                <span class="info-value">{{ order.orderCode }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Order Status</span>
                <span class="info-value">{{ order.status }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Provider</span>
                <span class="info-value">{{ order.providerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Status</span>
                <span class="info-value">{{ order.paymentStatus }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Method</span>
                <span class="info-value" style="text-transform: uppercase; font-weight: 700; color: #1e3a8a;">
                  {{ order.paymentMethod }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Items</span>
                <span class="info-value">{{ order.item }}</span>
              </div>
            </div>
          </div>

          <div v-if="order.paymentMethod === 'bank'" class="info-card card-receipt">
            <h3 class="card-title">Customer Remittance Receipt</h3>
            <div class="receipt-wrapper">
              <div v-if="order.receiptUrl" class="receipt-container">
                <img 
                  :src="order.receiptUrl.startsWith('http') ? order.receiptUrl : `${API_BASE_URL}${order.receiptUrl}`" 
                  class="receipt-preview-img" 
                  alt="Customer Payment Receipt"
                  @click="openReceipt(order.receiptUrl)"
                />
                <p class="receipt-hint">💡 Click image to open file layout full size</p>
              </div>
              <div v-else class="no-receipt-error">
                <span>⚠️ No receipt image attached by customer.</span>
              </div>
            </div>
          </div>

          <div class="info-card card-items" v-if="order.items?.length">
            <h3 class="card-title">Order Items</h3>
            <div class="items-table">
              <div class="items-row items-header">
                <span>Product</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div class="items-row" v-for="item in order.items" :key="item.name">
                <span>{{ item.name }}</span>
                <span>{{ item.qty }}</span>
                <span>{{ item.price }}</span>
                <span>{{ item.total }}</span>
              </div>
            </div>
          </div>

          <div class="info-card summary-card">
            <div class="summary-row total">
              <span class="summary-label">Total</span>
              <span class="summary-value">${{ order.total?.toFixed(2) }}</span>
            </div>
          </div>

          <div class="modal-status-bar">
            <span class="status-label">Status</span>
            <span class="status-badge" :class="`badge-${order.status}`">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const close = () => {
  emit('close')
}

const openReceipt = (url) => {
  const full = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  window.open(full, '_blank')
}

const getStatusLabel = (status) => {
  const map = { pending: 'Pending', delivering: 'Delivering', completed: 'Completed' }
  return map[status] || status
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
  animation: modalSlideIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
  border-radius: 14px 14px 0 0;
}

.modal-title-section { flex: 1; }
.modal-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 3px 0; }
.modal-subtitle { font-size: 0.8rem; color: #999; margin: 0; font-family: 'Courier New', monospace; font-weight: 600; }

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  border-radius: 8px;
  padding: 0;
  flex-shrink: 0;
}

.modal-close-btn:hover { background: #ebebeb; color: #1a1a1a; }
.modal-close-btn svg { width: 16px; height: 16px; }

.modal-body {
  background: #f8f9fb;
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 0 0 14px 14px;
}

.info-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8eaed;
  border-left: 3px solid #e8eaed;
}

.card-customer { border-left-color: #4CAF50; }
.card-order    { border-left-color: #2196F3; }
.card-receipt  { border-left-color: #1e3a8a; }

.card-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; gap: 3px; }
.info-label { font-size: 0.68rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; }

.card-items { border-left-color: #4A90E2; }
.items-table { display: grid; gap: 10px; }
.items-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f1f5; align-items: center; }
.items-header { color: #666; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
.items-row:last-child { border-bottom: none; }
.items-row span { font-size: 0.9rem; color: #1a1a1a; }

.info-value { font-size: 0.9rem; color: #1a1a1a; font-weight: 500; }

.receipt-wrapper {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.receipt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.receipt-preview-img {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  background: #fff;
  transition: transform 0.2s ease;
}

.receipt-preview-img:hover {
  transform: scale(1.02);
}

.receipt-hint {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.no-receipt-error {
  padding: 12px;
  background: #fff1f2;
  border: 1px dashed #fecdd3;
  color: #be123c;
  font-size: 13px;
  border-radius: 8px;
  text-align: center;
}

.summary-card { background: #ffffff; border-left: none !important; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; }
.summary-row.total { border-top: 1.5px solid #e8eaed; padding-top: 12px; }
.summary-label { color: #666; font-weight: 500; font-size: 0.88rem; }
.summary-row.total .summary-label { font-weight: 700; color: #1a1a1a; font-size: 0.95rem; }
.summary-value { font-weight: 600; color: #1a1a1a; font-size: 0.9rem; }
.summary-row.total .summary-value { font-weight: 700; color: #4CAF50; font-size: 1rem; }

.modal-status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.status-label { font-size: 0.72rem; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.status-badge { display: inline-block; padding: 5px 12px; border-radius: 14px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.badge-pending    { background: #fff3e0; color: #e65100; }
.badge-delivering { background: #e3f2fd; color: #1565c0; }
.badge-completed  { background: #e8f5e9; color: #2e7d32; }

.modal-enter-active, .modal-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
