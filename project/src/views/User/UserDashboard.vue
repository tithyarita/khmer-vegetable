<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <!-- <img src="../logo.png" alt="Khmer Veg" class="logo" /> -->
        <h3>Khmer Veg<br /><span class="subtitle">HARVEST LEDGER</span></h3>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li :class="{active: activeMenu === 'dashboard'}"><i class="bi bi-grid"></i> Dashboard</li>
          <li><i class="bi bi-person"></i> My Profile</li>
          <li><i class="bi bi-bag"></i> My Orders</li>
          <li><i class="bi bi-cart"></i> Cart</li>
          <li><i class="bi bi-heart"></i> Wishlist</li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn"><i class="bi bi-box-arrow-right"></i> Logout</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <header class="topbar">
        <input class="search" placeholder="Search orders, vegetables..." />
        <div class="user-info">
          <img class="avatar" :src="user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" />
          <div>
            <div class="name">{{ user?.name || user?.email }}</div>
            <div class="role">Verified Customer</div>
          </div>
        </div>
      </header>

      <!-- Profile Card -->
      <section class="profile-card">
        <img class="profile-avatar" :src="user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" />
        <div class="profile-info">
          <template v-if="!editingProfile">
            <h2>{{ user?.name || user?.email }}</h2>
            <div class="email">{{ user?.email }}</div>
            <div class="phone">{{ user?.phone || '-' }}</div>
            <div class="address">{{ user?.address || '-' }}</div>
            <button class="edit-btn" @click="editingProfile = true">Edit Profile</button>
          </template>
          <template v-else>
            <form @submit.prevent="saveProfile" class="edit-profile-form">
              <input v-model="editForm.name" name="name" id="profile-name" placeholder="Name" autocomplete="name" />
              <input v-model="editForm.email" name="email" id="profile-email" placeholder="Email" type="email" autocomplete="email" />
              <input v-model="editForm.phone" name="phone" id="profile-phone" placeholder="Phone" autocomplete="tel" />
              <input v-model="editForm.address" name="address" id="profile-address" placeholder="Address" autocomplete="street-address" />
              <div class="edit-actions">
                <button class="edit-btn" type="submit" :disabled="savingProfile">Save</button>
                <button class="edit-btn cancel" type="button" @click="cancelEdit" :disabled="savingProfile">Cancel</button>
              </div>
            </form>
          </template>
        </div>
      </section>

      <!-- Order Summary Cards -->
      <section class="order-summary">
        <div class="summary-card">
          <div class="summary-title">Total Orders</div>
          <div class="summary-value">{{ orders.length }} <span class="summary-change up">+2</span></div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Pending Orders</div>
          <div class="summary-value">{{ orders.filter(o => o.status === 'pending').length }} <span class="summary-change warn">Requires Action</span></div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Completed Orders</div>
          <div class="summary-value">{{ orders.filter(o => o.status === 'delivered').length }} <span class="summary-change ok">HEALTHY</span></div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Items in Cart</div>
          <div class="summary-value">{{ userStore.cart.length }} <span class="summary-change">items waiting</span></div>
        </div>
      </section>

      <!-- Recent Orders Table -->
      <section class="recent-orders">
        <div class="section-header">
          <h3>Recent Orders</h3>
          <a href="#" class="view-all">View All History</a>
        </div>
        <table class="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>PRODUCTS</th>
              <th>QUANTITY</th>
              <th>TOTAL PRICE</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders.slice(0,3)" :key="order.id">
              <td class="order-id">#ORD-{{ order.id }}</td>
              <td>
                {{ order.products.map(p => p.name).join(', ') }}<br />
                <span class="product-desc">{{ order.products[0]?.description || '' }}</span>
              </td>
              <td>{{ order.products.reduce((sum, p) => sum + (p.quantity || 1), 0) }} kg</td>
              <td>${{ order.totalPrice.toFixed(2) }}</td>
              <td>
                <span :class="['status', order.status]">
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
              </td>
              <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Promo Section -->
      <section class="promo">
        <div class="promo-content">
          <h4>Exclusive Seasonal Harvests</h4>
          <p>Based on your previous orders, we've reserved fresh Battambang Lotus Roots just for you. Grab them before they sell out!</p>
        </div>
        <button class="promo-btn">Explore Today's Fresh Picks</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'

const activeMenu = ref('dashboard')
const userStore = useUserStore()
const user = userStore.user
const orders = ref([])
const loading = ref(true)

// Profile editing state
const editingProfile = ref(false)
const savingProfile = ref(false)
const editForm = ref({ name: '', email: '', phone: '', address: '' })

function startEdit() {
  editForm.value = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  }
  editingProfile.value = true
}

function cancelEdit() {
  editingProfile.value = false
}

async function saveProfile() {
  savingProfile.value = true
  try {
    // Replace with your actual backend endpoint
    const res = await axios.put(`http://localhost:3000/users/${user.id}`, editForm.value, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    // Update user in store
    userStore.setUser(res.data, userStore.token)
    editingProfile.value = false
  } catch (e) {
    alert('Failed to update profile')
  }
  savingProfile.value = false
}

onMounted(async () => {
  if (user && user.id) {
    try {
      // Replace with your actual backend endpoint
      const res = await axios.get(`http://localhost:3000/users/${user.id}/orders`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      orders.value = res.data
    } catch (e) {
      orders.value = []
    }
  }
  loading.value = false
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f7f9fa;
}
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 24px 0 0 0;
}
.sidebar-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo {
  width: 48px;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 12px;
  color: #7ca982;
  font-weight: 400;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-nav li {
  padding: 12px 32px;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s, border-color 0.2s;
}
.sidebar-nav li.active, .sidebar-nav li:hover {
  background: #eaf5ee;
  border-left: 4px solid #7ca982;
}
.sidebar-footer {
  margin-top: auto;
  padding: 24px 32px;
}
.logout-btn {
  background: none;
  border: none;
  color: #e53;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}
.main-content {
  flex: 1;
  padding: 32px 48px;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.search {
  width: 320px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 15px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.name {
  font-weight: 600;
  font-size: 16px;
}
.role {
  font-size: 13px;
  color: #7ca982;
}
.profile-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 32px;
}
.profile-info {
  flex: 1;
}
.profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
}
.profile-info .email, .profile-info .phone, .profile-info .address {
  font-size: 15px;
  color: #666;
  margin-bottom: 2px;
}
.edit-btn {
  background: #7ca982;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  cursor: pointer;
}
.order-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 28px;
  flex: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.summary-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}
.summary-value {
  font-size: 22px;
  font-weight: 700;
}
.summary-change {
  font-size: 13px;
  margin-left: 8px;
}
.summary-change.up {
  color: #4caf50;
}
.summary-change.warn {
  color: #e53;
}
.summary-change.ok {
  color: #7ca982;
}
.recent-orders {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
}
.orders-table th, .orders-table td {
  padding: 12px 8px;
  text-align: left;
  font-size: 15px;
}
.orders-table th {
  color: #888;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}
.orders-table .order-id {
  color: #7ca982;
  font-weight: 600;
}
.orders-table .product-desc {
  color: #888;
  font-size: 13px;
}
.status {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}
.status.delivered {
  background: #eaf5ee;
  color: #4caf50;
}
.status.shipped {
  background: #e3eafc;
  color: #1976d2;
}
.promo {
  background: #eaf5ee;
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.promo-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
}
.promo-content p {
  color: #666;
  font-size: 15px;
  margin: 0;
}
.promo-btn {
  background: #7ca982;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  cursor: pointer;
}
</style>
