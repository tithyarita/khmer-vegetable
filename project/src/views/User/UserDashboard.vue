<template>
  <div class="dashboard-layout">
    <DashboardSidebar :activeMenu="activeMenu" @navigate="handleNavigate" />
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

      <!-- Dashboard Overview -->
      <template v-if="activeMenu === 'dashboard'">
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
            <div class="summary-value">{{ cartStore.cartCount }} <span class="summary-change">items waiting</span></div>
          </div>
        </section>

        <!-- Recent Orders Table -->
        <section class="recent-orders">
          <div class="section-header">
            <h3>Recent Orders</h3>
            <a class="view-all" @click="activeMenu = 'orders'">View All History</a>
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
      </template>

      <!-- Profile Section -->
      <template v-if="activeMenu === 'profile'">
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
      </template>


    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import DashboardSidebar from '@/components/Customer/sidebarUser.vue'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const activeMenu = ref('dashboard')
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

function logout() {
  userStore.logout()
  router.push('/user/login')
}

function handleNavigate(section) {
  if (section === 'orders') router.push('/myorder')
  else if (section === 'track') router.push('/myorder') 
  else activeMenu.value = section
}

async function saveProfile() {
  savingProfile.value = true
  try {
    // Replace with your actual backend endpoint
    const res = await axios.put(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/users/${user.id}`, editForm.value, {
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/users/${user.id}/orders`, {
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
  height: 100vh;
  overflow: hidden;
  width: 100%;
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
  overflow-y: auto;
  padding: 32px 48px;
  max-width: 1280px;
  width: 100%;
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
.view-all {
  color: #2d7a4f;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.view-all:hover {
  text-decoration: underline;
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

@media (max-width: 1024px) {
  .main-content {
    padding: 24px;
  }
  .order-summary {
    flex-wrap: wrap;
  }
  .summary-card {
    flex: 1 1 calc(50% - 12px);
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    padding: 12px 16px;
    border-right: none;
    border-bottom: 1px solid #e5e5e5;
  }
  .sidebar-header {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sidebar-header h3 {
    font-size: 14px;
    margin: 0;
  }
  .logo {
    width: 32px;
    margin-bottom: 0;
  }
  .subtitle {
    display: none;
  }
  .sidebar-nav {
    margin-left: auto;
  }
  .sidebar-nav ul {
    display: flex;
    gap: 4px;
  }
  .sidebar-nav li {
    padding: 8px 12px;
    font-size: 13px;
    border-left: none;
    border-bottom: 3px solid transparent;
    gap: 6px;
  }
  .sidebar-nav li.active, .sidebar-nav li:hover {
    border-left: none;
    border-bottom: 3px solid #7ca982;
  }
  .sidebar-nav li.active {
    background: #eaf5ee;
  }
  .sidebar-footer {
    display: none;
  }
  .main-content {
    padding: 16px;
  }
  .topbar {
    flex-wrap: wrap;
    gap: 12px;
  }
  .search {
    width: 100%;
  }
  .profile-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  .order-summary {
    flex-direction: column;
  }
  .summary-card {
    flex: 1 1 auto;
  }
  .recent-orders {
    padding: 16px;
    overflow-x: auto;
  }
  .orders-table {
    min-width: 600px;
  }
  .promo {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .sidebar-nav li {
    padding: 6px 8px;
    font-size: 12px;
  }
  .sidebar-nav li i {
    font-size: 14px;
  }
  .summary-card {
    padding: 16px 20px;
  }
  .summary-value {
    font-size: 18px;
  }
  .profile-avatar {
    width: 60px;
    height: 60px;
  }
  .profile-info h2 {
    font-size: 18px;
  }
  .edit-btn {
    width: 100%;
  }
  .edit-actions {
    flex-direction: column;
  }
}
</style>
