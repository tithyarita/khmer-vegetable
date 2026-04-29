<template>
  <div class="cart">
    <NavigationBar />
    <br>

    <section class="section cart-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">My Cart</h2>
          <a href="#" class="see-all">Continue Shopping →</a>
        </div>
        
        <!-- Cart Items -->
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p>{{ item.category }}</p>
              <p class="unit-price">${{ item.unitPrice }}/{{ item.unit }}</p>
            </div>
            <div class="item-quantity">
              <div class="quantity-controls">
                <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
              </div>
            </div>
            <div class="item-price">
              <p>${{ (item.unitPrice * item.quantity).toFixed(2) }}</p>
              <button @click="removeItem(item)" class="remove-btn">Remove</button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ calculateSubtotal() }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${{ shippingCost }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ calculateTotal() }}</span>
          </div>
        </div>

        <!-- Coupon Section -->
        <div class="coupon-section">
          <div class="coupon-input">
            <input v-model="couponCode" type="text" placeholder="Enter coupon code" />
            <button @click="applyCoupon" class="apply-coupon-btn">Apply</button>
          </div>
        </div>

        <!-- Checkout Button -->
        <div class="checkout-section">
          <button class="checkout-btn" @click="proceedToCheckout">Proceed to Checkout</button>
        </div>
      </div>
    </section>

    <!-- Related Products -->
    <section class="section related-products">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">You May Also Like</h2>
          <a href="#" class="see-all">View All →</a>
        </div>
        <Card />
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavigationBar from '../components/Customer/NavigationBar.vue'
import Card from '../components/Customer/Card.vue'
import Footer from '../components/Customer/Footer.vue'

const couponCode = ref('')
const shippingCost = ref('2.00')

const cartItems = ref([
  {
    id: 1,
    name: 'Organic Curly Kale Bunch',
    category: 'Leafy Greens',
    unit: 'per bunch',
    unitPrice: '2.50',
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&q=80'
  },
  {
    id: 2,
    name: 'Fresh Garden Radish (Bunch)',
    category: 'Root Veg',
    unit: 'per bunch',
    unitPrice: '1.99',
    quantity: 3,
    image: 'https://images.unsplash.com/photo-1585278407894-e2a1386378d9?w=400&q=80'
  },
  {
    id: 3,
    name: 'Sweet Red Bell Peppers (3 Pack)',
    category: 'Peppers',
    unit: 'per pack',
    unitPrice: '3.45',
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1563565375-fc4c4e308637?w=400&q=80'
  }
])

const calculateSubtotal = () => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity)
  }, 0).toFixed(2)
}

const calculateTotal = () => {
  const subtotal = parseFloat(calculateSubtotal())
  const shipping = parseFloat(shippingCost.value)
  return (subtotal + shipping).toFixed(2)
}

const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = (item) => {
  const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
  }
}

const applyCoupon = () => {
  console.log('Applying coupon:', couponCode.value)
}

const proceedToCheckout = () => {
  console.log('Proceeding to checkout')
}
</script>

<style scoped>
.see-all {
  font-family: "DM Serif Display", serif;
  color: rgb(101, 142, 101);
  text-decoration: none;
  font-size: 1.2rem;
}

.cart {
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ── SECTION ── */
.section {
  width: 100%;
  padding: 48px 24px;
  box-sizing: border-box;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── HEADER ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1a;
}

/* ── CART ITEMS ── */
.cart-items {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
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
  margin: 0 0 4px;
}

.unit-price {
  color: #9ca3af;
  font-size: 13px;
}

.item-quantity {
  text-align: right;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background: #e5e7eb;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.item-price {
  text-align: right;
}

.item-price p {
  font-size: 16px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
}

.remove-btn:hover {
  background: #fef2f2;
}

/* ── CART SUMMARY ── */
.cart-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 15px;
}

.summary-row span:first-child {
  color: #6b7280;
}

.summary-row span:last-child {
  font-weight: 600;
  color: #1a2e1a;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

.summary-row.total {
  font-size: 18px;
  margin-top: 8px;
}

.summary-row.total span:last-child {
  color: #2D7A3A;
}

/* ── COUPON SECTION ── */
.coupon-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.coupon-input {
  display: flex;
  gap: 12px;
}

.coupon-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.coupon-input input:focus {
  border-color: #2D7A3A;
}

.apply-coupon-btn {
  padding: 12px 24px;
  background: #2D7A3A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-coupon-btn:hover {
  background: #1a5c27;
}

/* ── CHECKOUT SECTION ── */
.checkout-section {
  text-align: center;
  margin-bottom: 32px;
}

.checkout-btn {
  padding: 16px 48px;
  background: #2D7A3A;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 200px;
}

.checkout-btn:hover {
  background: #1a5c27;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .section {
    padding: 32px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 16px;
    padding: 16px 0;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-quantity,
  .item-price {
    grid-column: 1 / -1;
    margin-top: 12px;
  }

  .item-price {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .coupon-input {
    flex-direction: column;
  }

  .apply-coupon-btn {
    width: 100%;
  }
}
</style>
