<template>
  <div class="checkout-page">
    <div class="bg-blur blur-1"></div>
    <div class="bg-blur blur-2"></div>
    <div class="bg-blur blur-3"></div>

    <NavigationBar />

    <div class="checkout-container">
      <header class="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Review your fresh items and complete your order to support local Khmer farmers.</p>
      </header>
      
      <div v-if="loading" class="fullscreen-state">
        <div class="state-card glass-card text-center">
          <div class="loader-wrapper">
            <div class="loader"></div>
          </div>
          <h3>Processing Order</h3>
          <p>Please wait while we establish a secure connection...</p>
        </div>
      </div>

      <div v-else-if="orderResult === 'success'" class="fullscreen-state">
        <div class="state-card glass-card success-card text-center">
          <div class="result-icon-wrapper">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p class="success-msg">{{ orderMessage }}</p>
          <button @click="goToReceipt" class="primary-btn">
            <span>View Receipt</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>

      <div v-else class="checkout-grid">
        
        <div class="checkout-left">
          
          <div :class="['glass-card collapse-card', { 'is-active': activeSection === 'address' }]">
            <div class="collapse-header-wrapper">
              <button @click="toggleSection('address')" class="collapse-header" type="button">
                <div class="collapse-left">
                  <div class="collapse-icon green">📍</div>
                  <div class="header-text">
                    <h3>Shipping Address</h3>
                    <p>Where should we deliver your fresh vegetables?</p>
                  </div>
                </div>
              </button>

              <div class="header-action-zone">
                <button 
                  v-if="shipping && shipping.address" 
                  @click="activeSection = 'address'" 
                  class="action-pill-btn edit-btn"
                  type="button"
                >
                  ✏️ Edit Location
                </button>
                <button 
                  v-else 
                  @click="activeSection = 'address'" 
                  class="action-pill-btn add-btn"
                  type="button"
                >
                  ➕ Add Address
                </button>

                <button @click="toggleSection('address')" class="arrow-icon-btn" :class="{ rotated: activeSection === 'address' }" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </div>
            
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

          <div :class="['glass-card collapse-card', { 'is-active': activeSection === 'payment' }]">
            <button @click="toggleSection('payment')" class="collapse-header" type="button">
              <div class="collapse-left">
                <div class="collapse-icon blue">💳</div>
                <div class="header-text">
                  <h3>Payment Method</h3>
                  <p>Choose your preferred payment gateway</p>
                </div>
              </div>
              <span class="arrow-icon" :class="{ rotated: activeSection === 'payment' }">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>

            <transition name="expand">
              <div v-if="activeSection === 'payment'" class="collapse-body">
                
                <div class="payment-grid">
                  <div
                    @click="paymentMethod = 'qr'"
                    :class="['payment-card', { active: paymentMethod === 'qr' }]"
                  >
                    <span class="pay-badge">Recommended</span>
                    <div class="pay-icon">🏦</div>
                    <div class="pay-meta">
                      <strong>QR Payment</strong>
                      <p>Scan provider QR directly</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'cash'"
                    :class="['payment-card', { active: paymentMethod === 'cash' }]"
                  >
                    <div class="pay-icon">🚚</div>
                    <div class="pay-meta">
                      <strong>Cash on Delivery</strong>
                      <p>Pay upon terminal delivery</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'visa'"
                    :class="['payment-card', { active: paymentMethod === 'visa' }]"
                  >
                    <div class="pay-icon">💳</div>
                    <div class="pay-meta">
                      <strong>Visa Card</strong>
                      <p>Process with Visa Engine</p>
                    </div>
                  </div>
                
                  <div
                    @click="paymentMethod = 'mastercard'"
                    :class="['payment-card', { active: paymentMethod === 'mastercard' }]"
                  >
                    <div class="pay-icon">🪪</div>
                    <div class="pay-meta">
                      <strong>Mastercard</strong>
                      <p>Process with Mastercard Engine</p>
                    </div>
                  </div>
                </div>

                <div v-if="paymentMethod === 'qr'" class="dynamic-payment-panel">
                  <h4 class="panel-subtitle">Provider Payment Terminals</h4>
                  
                  <div v-if="providerPayments.length === 0" class="panel-loader">
                    <span class="spinner-sm"></span> Loading provider bank details...
                  </div>

                  <div v-else class="provider-cards-wrapper">
                    <p class="panel-instructions">
                      Please scan and transfer exact matching segment items to corresponding vendor accounts below:
                    </p>
                    
                    <div v-for="prov in providerPayments" :key="prov.providerId" class="provider-payment-card">
                      <h5>{{ prov.providerName }}</h5>
                      
                      <p v-if="!prov.banks || prov.banks.length === 0" class="no-payment-info">
                        ⚠️ No payment credentials declared by this farm vendor.
                      </p>

                      <div
                        v-for="bank in prov.banks.filter(b => b.type === 'aba' && b.qr)"
                        :key="bank.id"
                        class="bank-payment-item"
                      >
                        <div class="qr-frame">
                          <img :src="fullUrl(bank.qr)" class="bank-qr" alt="Scan to pay" />
                        </div>

                        <div class="bank-info-box">
                          <p><span class="label">Vendor:</span> <strong class="val">{{ prov.providerName }}</strong></p>
                          <p><span class="label">Account Name:</span> <strong class="val uppercase">{{ bank.holder_name }}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="receipt-upload-container">
                    <label>Upload Remittance Receipt Copy</label>
                    <div class="file-dropzone">
                      <input @change="handleReceiptUpload" type="file" accept="image/*" id="receipt-file" />
                      <label for="receipt-file" class="dropzone-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span>{{ receiptFileName ? 'Change Receipt Copy' : 'Choose or Drop Image File' }}</span>
                      </label>
                    </div>
                  </div>
                  
                  <div v-if="receiptPreview" class="receipt-preview-block">
                    <p>Saved local context file: <span>{{ receiptFileName }}</span></p>
                    <img :src="receiptPreview" alt="Receipt preview" class="receipt-preview-img" />
                  </div>
                </div>

                <div v-if="paymentMethod === 'cash'" class="cash-payment-box">
                  <div class="cash-icon-wrapper">🍃</div>
                  <div class="cash-text-wrapper">
                    <h4>Cash Terms Authorized</h4>
                    <p>Please prepare the exact sum total of <span class="highlight-amt">${{ total.toFixed(2) }}</span> for processing hand-to-hand directly to our dispatch driver upon arrival.</p>
                  </div>
                </div>

                <div v-if="paymentMethod === 'visa' || paymentMethod === 'mastercard'" class="dynamic-payment-panel">
                  <div class="card-form">
                    <h4 class="panel-subtitle">Your Secure Card Details</h4>
                    <div class="form-grid">
                      <div class="input-group full-width">
                        <label>Cardholder Name</label>
                        <input v-model="card.name" type="text" placeholder="JOHN DOE" class="uppercase" />
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
                
                  <h4 class="panel-subtitle mt-6">Vendor Escrow Settlement Accounts</h4>
                
                  <div v-if="providerPayments.length === 0" class="panel-loader">
                    <span class="spinner-sm"></span> Loading routing targets...
                  </div>
                
                  <div v-else class="provider-cards-wrapper">
                    <p class="panel-instructions">Your single payment processing routes values down to respective segments:</p>
                  
                    <div v-for="prov in providerPayments" :key="prov.providerId" class="provider-payment-card plain">
                      <h5>{{ prov.providerName }}</h5>
                    
                      <p v-if="!prov.banks.filter(b => b.type === paymentMethod).length" class="no-payment-info">
                        ⚠️ No native card metrics provided by this merchant vendor.
                      </p>
                    
                      <div
                        v-for="bank in prov.banks.filter(b => b.type === paymentMethod)"
                        :key="bank.id"
                        class="bank-payment-item card-style"
                      >
                        <div class="bank-info-box horizontal">
                          <div><span class="lbl">Holder:</span> <span class="val bold uppercase">{{ bank.holder_name }}</span></div>
                          <div><span class="lbl">Route Account:</span> <span class="val monospace">{{ bank.account }}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </transition>
          </div>

          <div class="glass-card collapse-card review-items-card">
            <h3 class="section-title">Review Order Inventory</h3>
            <div class="review-list">
              <div v-for="item in orderItems" :key="item.id" class="review-item">
                <div class="img-wrapper">
                  <img :src="item.image ? `http://localhost:3000${item.image}` : '/images/placeholder.png'" class="review-image" alt="Item Snapshot" />
                </div>
                <div class="item-details">
                  <h4>{{ item.name }}</h4>
                  <div class="review-meta">
                    <span class="qty-pill">Qty: {{ item.quantity }}</span>
                    <span class="price-each">${{ Number(item.unitPrice || item.price).toFixed(2) }} / unit</span>
                  </div>
                </div>
                <div class="review-price">${{ itemTotal(item).toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="checkout-right-sticky">
          <div class="glass-card summary-card">
            <h3 class="summary-title">Cost Checkout Summary</h3>
            
            <div class="summary-list">
              <div class="summary-row">
                <span>Cart Subtotal</span>
                <strong>${{ subtotal.toFixed(2) }}</strong>
              </div>
              <div class="summary-row">
                <span>Logistics / Delivery</span>
                <strong class="free-tag">{{ shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}` }}</strong>
              </div>
              <div class="summary-row">
                <span>Platform Maintenance Fee</span>
                <strong>${{ serviceFee.toFixed(2) }}</strong>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-row total-row">
                <span>Grand Total</span>
                <span class="total-amount">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <transition name="fade">
              <div v-if="Object.keys(errors).length > 0" class="error-box">
                <div class="error-header">⚠️ Complete Required Metrics</div>
                <p v-for="(err, key) in errors" :key="key">{{ err }}</p>
              </div>
            </transition>

            <button @click="confirmOrder" class="checkout-btn" type="button">
              <span>Place Secure Order</span>
              <span class="btn-price">${{ total.toFixed(2) }}</span>
            </button>

            <div class="security-box">
              <div class="security-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>End-to-End Encrypted Platform Connection</span>
              </div>
              <div class="security-item success">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                <span>Directly Supporting Local Khmer Farmers</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
/* -------------------------------------------------------------
    CORE PAGE CONFIGURATIONS & GLASSMORPHISM SETUP
------------------------------------------------------------- */
.checkout-page {
  min-height: 100vh;
  background-color: #f6f9fc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* Sophisticated background blur elements */
.bg-blur {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.45;
  z-index: 1;
  pointer-events: none;
}
.blur-1 { width: 400px; height: 400px; background: #bbf7d0; top: -100px; left: -100px; }
.blur-2 { width: 500px; height: 500px; background: #bfdbfe; top: 25%; right: -150px; }
.blur-3 { width: 350px; height: 350px; background: #fef08a; bottom: -50px; left: 15%; }

.checkout-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 40px 24px 120px;
  position: relative;
  z-index: 2;
}

/* Header Context */
.checkout-header {
  margin-bottom: 36px;
}
.checkout-header h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0 0 8px 0;
}
.checkout-header p {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

/* Master Glassmorphic Card Engine */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 
              0 10px 15px -3px rgba(15, 23, 42, 0.04),
              0 20px 25px -5px rgba(15, 23, 42, 0.02);
  border-radius: 24px;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
              border-color 0.3s ease;
}

/* Layout Matrix Split Grid */
.checkout-grid {
  display: grid;
  grid-template-columns: 7fr 4fr;
  gap: 32px;
  align-items: start;
}

.checkout-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* -------------------------------------------------------------
    ACCORDION SYSTEM & DYNAMIC ACTION HEADER
------------------------------------------------------------- */
.collapse-card {
  padding: 24px;
}
.collapse-card.is-active {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(255, 255, 255, 0.85);
}

.collapse-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.collapse-header-wrapper .collapse-header {
  flex: 1;
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
  text-align: left;
}
.collapse-header:focus {
  outline: none;
}

.collapse-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.04);
}
.collapse-icon.green { background: #e8f5e9; color: #2e7d32; }
.collapse-icon.blue { background: #e3f2fd; color: #1565c0; }

.header-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.header-text p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

/* Dynamic Address Actions */
.header-action-zone {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-pill-btn {
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.edit-btn {
  background-color: #f1f5f9;
  color: #475569;
}
.edit-btn:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.add-btn {
  background-color: #dcfce7;
  color: #15803d;
}
.add-btn:hover {
  background-color: #bbf7d0;
  color: #166534;
}

.arrow-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.arrow-icon-btn.rotated {
  transform: rotate(-180deg);
  color: #22c55e;
}

.arrow-icon {
  color: #94a3b8;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.arrow-icon.rotated {
  transform: rotate(-180deg);
  color: #22c55e;
}

.collapse-body {
  margin-top: 24px;
  border-top: 1px dashed rgba(226, 232, 240, 0.8);
  padding-top: 24px;
}

/* -------------------------------------------------------------
    FORM INPUT SYSTEMS
------------------------------------------------------------- */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.full-width {
  grid-column: span 2;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  padding-left: 2px;
}
.input-group input {
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.2s ease;
}
.input-group input::placeholder {
  color: #94a3b8;
}
.input-group input:focus {
  outline: none;
  border-color: #22c55e;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

/* -------------------------------------------------------------
    PAYMENT SPECIFIC COMPONENTS
------------------------------------------------------------- */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.payment-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 2px solid #e2e8f0;
  background: rgba(255,255,255,0.5);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.payment-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}
.payment-card.active {
  border-color: #16a34a;
  background: rgba(240, 253, 244, 0.6);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.06);
}

.pay-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #16a34a;
  color: white;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-bottom-left-radius: 12px;
  letter-spacing: 0.05em;
}

.pay-icon {
  font-size: 24px;
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.pay-meta strong {
  display: block;
  font-size: 14px;
  color: #0f172a;
}
.pay-meta p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Extended Inner Panels */
.dynamic-payment-panel {
  margin-top: 20px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 20px;
}
.panel-subtitle {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}
.panel-instructions {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.5;
}

.provider-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.provider-payment-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 14px;
}
.provider-payment-card h5 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.bank-payment-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;
}
.qr-frame {
  background: #ffffff;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
.bank-qr {
  width: 80px;
  height: 80px;
  object-fit: contain;
  display: block;
}

.bank-info-box p {
  margin: 4px 0;
  font-size: 12px;
  color: #475569;
}
.bank-info-box .label { color: #64748b; }
.bank-info-box .val { color: #0f172a; }

/* Custom File Upload Styling */
.receipt-upload-container {
  margin-top: 18px;
}
.receipt-upload-container label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}
.file-dropzone {
  position: relative;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #ffffff;
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
}
.file-dropzone:hover {
  border-color: #22c55e;
  background: rgba(240, 253, 244, 0.3);
}
.file-dropzone input[type="file"] {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}
.dropzone-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
}
.dropzone-label svg { color: #94a3b8; }

.receipt-preview-block {
  margin-top: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}
.receipt-preview-block p {
  margin: 0 0 8px;
  font-size: 12px;
  color: #64748b;
}
.receipt-preview-block p span { font-weight: 600; color: #334155; }
.receipt-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

/* Cash on Delivery Box Variant */
.cash-payment-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  border-radius: 18px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.cash-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #bbf7d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.cash-text-wrapper h4 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #14532d; }
.cash-text-wrapper p { margin: 0; font-size: 13px; color: #166534; line-height: 1.5; }
.highlight-amt { font-weight: 700; color: #15803d; background: #dcfce7; padding: 1px 6px; border-radius: 6px; }

/* Credit card specific formatting */
.card-form { background: #ffffff; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0;}
.bank-payment-item.card-style { background: #ffffff; border: 1px solid #f1f5f9; padding: 12px;}
.bank-info-box.horizontal { display: flex; width: 100%; justify-content: space-between; font-size: 12px;}
.monospace { font-family: monospace; font-size: 13px; letter-spacing: 0.05em;}

/* -------------------------------------------------------------
    INVENTORY REVIEW SYSTEM
------------------------------------------------------------- */
.review-items-card { margin-top: 8px; }
.section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
.review-list { display: flex; flex-direction: column; }
.review-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.review-item:last-child { border-bottom: none; padding-bottom: 0; }
.review-item:first-child { padding-top: 0; }

.img-wrapper {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 4px;
}
.review-image { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; display: block; }
.item-details { flex: 1; }
.item-details h4 { margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; }

.review-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.qty-pill { background: #e8f5e9; color: #1b5e20; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.price-each { font-size: 12px; color: #64748b; }
.review-price { font-size: 15px; font-weight: 700; color: #0f172a; }

/* -------------------------------------------------------------
    STICKY SUMMARY SIDEBAR (Right Column)
------------------------------------------------------------- */
.checkout-right-sticky {
  position: sticky;
  top: 100px;
}
.summary-card {
  padding: 24px;
}
.summary-title {
  margin: 0 0 18px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #475569;
}
.summary-row strong { color: #0f172a; }
.summary-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0 10%, #e2e8f0 90%, transparent);
  margin: 6px 0;
}
.total-row {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.summary-row .total-amount {
  font-size: 24px;
  font-weight: 800;
  color: #16a34a;
  letter-spacing: -0.02em;
}

.free-tag {
  color: #15803d;
  font-weight: 700;
}

/* Diagnostic Action Error Box */
.error-box {
  margin-top: 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 14px;
}
.error-header {
  font-size: 12px;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.error-box p {
  margin: 3px 0;
  font-size: 12px;
  color: #b91c1c;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Action Primary Buttons */
.checkout-btn {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(22, 197, 94, 0.2);
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.checkout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(22, 197, 94, 0.3);
  background: linear-gradient(135deg, #23cb61, #159944);
}
.checkout-btn:active { transform: translateY(1px); }
.btn-price {
  background: rgba(0,0,0,0.12);
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 14px;
}

/* Security Meta Matrix */
.security-box {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}
.security-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
.security-item svg { color: #94a3b8; flex-shrink: 0; }
.security-item.success { color: #16a34a; }
.security-item.success svg { color: #22c55e; }

/* -------------------------------------------------------------
    FULLSCREEN STATES & UTILITIES
------------------------------------------------------------- */
.fullscreen-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.state-card {
  max-width: 480px;
  width: 100%;
  padding: 40px 32px;
}
.text-center { text-align: center; }

/* Elite Processing Loader */
.loader-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}
.state-card h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #0f172a; }
.state-card p { margin: 0; font-size: 14px; color: #64748b; }

/* Success State Variations */
.success-card { border-color: rgba(34,197,94,0.25); }
.result-icon-wrapper {
  font-size: 48px;
  margin-bottom: 20px;
  display: inline-block;
}
.success-msg { margin-bottom: 28px !important; }

.primary-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #0f172a;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.primary-btn:hover { background: #1e293b; transform: translateY(-1px); }

@keyframes spinner {
  to { transform: rotate(360deg); }
}
</style>
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

const shippingFee = ref(0)
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

const formatPaymentMethod = (method) => {
  const labels = {
    qr: 'Bank Transfer (QR)',
    cash: 'Cash on Delivery',
    visa: 'Visa Card',
    mastercard: 'Master Card',
  }
  return labels[method] || method
}

const splitShippingName = (name) => {
  const parts = String(name || '').trim().split(/\s+/)
  if (!parts[0]) return { firstName: 'Customer', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

const resolveItemImage = (image) => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`
}

const saveLastOrder = (orderResponse) => {
  const orders = orderResponse?.data?.data
  const orderCodes = Array.isArray(orders)
    ? orders.map(o => o.order_code).filter(Boolean)
    : []
  const orderNumber = orderCodes.length
    ? orderCodes.join(', ')
    : `ORD-${Date.now()}`

  const { firstName, lastName } = splitShippingName(shipping.name)
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)

  const snapshot = {
    orderNumber,
    orderDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    paymentMethod: formatPaymentMethod(paymentMethod.value),
    customer: {
      firstName,
      lastName,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip || '',
      country: shipping.country || 'Cambodia',
      phone: shipping.phone,
      email: shipping.email,
    },
    items: orderItems.value.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice || item.price || 0),
      price: Number(item.unitPrice || item.price || 0),
      image: resolveItemImage(item.image),
      providerName: item.providerName || item.provider?.provider_name || 'Unknown',
      providerId: item.providerId || item.provider_id || null,
    })),
    subtotal: subtotal.value,
    shippingFee: shippingFee.value,
    serviceFee: serviceFee.value,
    total: total.value,
    estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    trackingNumber: `TRK${Date.now().toString(36).toUpperCase()}`,
  }

  localStorage.setItem('lastOrder', JSON.stringify(snapshot))
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

    const text = await res.text()
    if (!text) return

    const data = JSON.parse(text)
    if (!data || !data.id) return

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim()
    if (fullName) shipping.name = fullName
    if (data.street) shipping.address = data.street
    if (data.city) shipping.city = data.city
    if (data.state) shipping.state = data.state
    if (data.country) shipping.country = data.country
    if (data.phone) shipping.phone = data.phone
    if (data.email) shipping.email = data.email
  } catch (err) {
    console.error(err)
  }
}

const saveShippingAddress = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const nameParts = shipping.name.trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  await axios.post(
    `${API_BASE_URL}/address`,
    {
      firstName,
      lastName,
      street: shipping.address,
      city: shipping.city,
      state: shipping.state,
      zip: '',
      country: shipping.country || 'Cambodia',
      phone: shipping.phone,
      email: shipping.email,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
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
        unit_price: Number(item.unitPrice || item.price || 0),
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

    await saveShippingAddress()

    const response = await axios.post(`${API_BASE_URL}/orders`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    saveLastOrder(response.data)
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
