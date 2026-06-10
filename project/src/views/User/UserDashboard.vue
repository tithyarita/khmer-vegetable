<template>
  <div class="dashboard-layout">
    <DashboardSidebar :activeMenu="activeMenu" @navigate="handleNavigate" />

    <main class="main-content">
      <header class="topbar">
        <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
          <i class="bi bi-list"></i>
        </button>
        <div class="topbar-title">
          <h1>My Profile</h1>
          <p>Manage your account details and delivery address</p>
        </div>
      </header>

      <!-- Profile Hero -->
      <section class="profile-hero">
        <div class="hero-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="avatar-img" />
          <span v-else class="avatar-initials">{{ userInitials }}</span>
          <label v-if="editingAvatar" class="avatar-upload-btn" for="avatar-input">
            <i class="bi bi-camera"></i>
          </label>
          <input id="avatar-input" type="file" accept="image/*" @change="onAvatarChange" hidden />
        </div>
        <div class="hero-info">
          <h2>{{ user?.name || 'Customer' }}</h2>
          <span class="role-badge"><i class="bi bi-patch-check-fill"></i> Verified Customer</span>
          <p class="hero-email">{{ user?.email }}</p>
        </div>
        <button v-if="!editingAvatar" class="ghost-btn" type="button" @click="editingAvatar = true">
          <i class="bi bi-camera"></i> Change Photo
        </button>
        <div v-else class="avatar-actions">
          <button class="primary-btn sm" type="button" :disabled="savingAvatar" @click="saveAvatar">
            {{ savingAvatar ? 'Saving...' : 'Save Photo' }}
          </button>
          <button class="ghost-btn sm" type="button" @click="cancelAvatarEdit">Cancel</button>
        </div>
      </section>

      <div v-if="toast.message" :class="['toast', toast.type]">{{ toast.message }}</div>

      <!-- Info Cards -->
      <div class="profile-grid">
        <!-- Personal Info -->
        <section class="info-card">
          <div class="card-header">
            <div class="card-title">
              <i class="bi bi-person-circle"></i>
              <div>
                <h3>Personal Information</h3>
                <p>Your name and contact number</p>
              </div>
            </div>
            <button
              v-if="!editingPersonal"
              class="edit-link"
              type="button"
              @click="startPersonalEdit"
            >
              <i class="bi bi-pencil"></i> Edit
            </button>
          </div>

          <div v-if="!editingPersonal" class="card-body">
            <div class="info-row">
              <span class="label">Full Name</span>
              <span class="value">{{ user?.name || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value locked">
                {{ user?.email || '—' }}
                <span class="lock-tag"><i class="bi bi-lock-fill"></i> Cannot be changed</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Phone</span>
              <span class="value">{{ user?.phone || '—' }}</span>
            </div>
          </div>

          <form v-else class="card-body edit-form" @submit.prevent="savePersonal">
            <div class="field">
              <label for="profile-name">Full Name</label>
              <input id="profile-name" v-model="personalForm.name" type="text" placeholder="Your full name" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input :value="user?.email" type="email" disabled class="disabled-input" />
              <small class="hint">Email address is linked to your account and cannot be changed.</small>
            </div>
            <div class="field">
              <label for="profile-phone">Phone Number</label>
              <input id="profile-phone" v-model="personalForm.phone" type="tel" placeholder="012 345 678" required />
            </div>
            <div class="form-actions">
              <button class="primary-btn" type="submit" :disabled="savingPersonal">
                {{ savingPersonal ? 'Saving...' : 'Save Changes' }}
              </button>
              <button class="ghost-btn" type="button" @click="cancelPersonalEdit">Cancel</button>
            </div>
          </form>
        </section>

        <!-- Address -->
        <section class="info-card">
          <div class="card-header">
            <div class="card-title">
              <i class="bi bi-geo-alt"></i>
              <div>
                <h3>Shipping Address</h3>
                <p>Where we deliver your orders</p>
              </div>
            </div>
            <button
              v-if="!editingAddress"
              class="edit-link"
              type="button"
              @click="startAddressEdit"
            >
              <i class="bi bi-pencil"></i> Edit
            </button>
          </div>

          <div v-if="!editingAddress" class="card-body">
            <div v-if="hasAddress" class="address-display">
              <p class="address-line">{{ addressDisplay.street }}</p>
              <p class="address-line muted">
                {{ [addressDisplay.city, addressDisplay.state, addressDisplay.zip].filter(Boolean).join(', ') }}
              </p>
              <p v-if="addressDisplay.country" class="address-line muted">{{ addressDisplay.country }}</p>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-house"></i>
              <p>No address saved yet</p>
              <button class="primary-btn sm" type="button" @click="startAddressEdit">Add Address</button>
            </div>
          </div>

          <form v-else class="card-body edit-form" @submit.prevent="saveAddress">
            <div class="field">
              <label for="addr-street">Street Address</label>
              <input id="addr-street" v-model="addressForm.street" type="text" placeholder="House no., street, commune" required />
            </div>
            <div class="field-row">
              <div class="field">
                <label for="addr-city">City</label>
                <input id="addr-city" v-model="addressForm.city" type="text" placeholder="Phnom Penh" required />
              </div>
              <div class="field">
                <label for="addr-state">Province / State</label>
                <input id="addr-state" v-model="addressForm.state" type="text" placeholder="Kandal" />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="addr-zip">ZIP / Postal</label>
                <input id="addr-zip" v-model="addressForm.zip" type="text" placeholder="12000" />
              </div>
              <div class="field">
                <label for="addr-country">Country</label>
                <select id="addr-country" v-model="addressForm.country">
                  <option value="Cambodia">Cambodia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Laos">Laos</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="primary-btn" type="submit" :disabled="savingAddress">
                {{ savingAddress ? 'Saving...' : 'Save Address' }}
              </button>
              <button class="ghost-btn" type="button" @click="cancelAddressEdit">Cancel</button>
            </div>
          </form>
        </section>
      </div>

      <!-- Password -->
      <section class="info-card security-card">
        <div class="card-header">
          <div class="card-title">
            <i class="bi bi-shield-lock"></i>
            <div>
              <h3>Password & Security</h3>
              <p>Update your login password</p>
            </div>
          </div>
          <button
            v-if="!editingPassword"
            class="edit-link"
            type="button"
            @click="editingPassword = true"
          >
            <i class="bi bi-key"></i> Change Password
          </button>
        </div>

        <div v-if="!editingPassword" class="card-body">
          <p class="security-hint">Your password is hidden for security. Click "Change Password" to update it.</p>
        </div>

        <form v-else class="card-body edit-form" @submit.prevent="savePassword">
          <div class="field">
            <label for="current-pw">Current Password</label>
            <input id="current-pw" v-model="passwordForm.current" type="password" placeholder="Enter current password" required />
          </div>
          <div class="field-row">
            <div class="field">
              <label for="new-pw">New Password</label>
              <input id="new-pw" v-model="passwordForm.new" type="password" placeholder="At least 6 characters" required minlength="6" />
            </div>
            <div class="field">
              <label for="confirm-pw">Confirm New Password</label>
              <input id="confirm-pw" v-model="passwordForm.confirm" type="password" placeholder="Repeat new password" required />
            </div>
          </div>
          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          <div class="form-actions">
            <button class="primary-btn" type="submit" :disabled="savingPassword">
              {{ savingPassword ? 'Updating...' : 'Update Password' }}
            </button>
            <button class="ghost-btn" type="button" @click="cancelPasswordEdit">Cancel</button>
          </div>
        </form>
      </section>

      <!-- Quick Stats -->
      <section class="stats-row">
        <div class="stat-card">
          <span class="stat-label">Total Orders</span>
          <span class="stat-value">{{ orders.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pending</span>
          <span class="stat-value warn">{{ orders.filter(o => o.status === 'pending').length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Delivered</span>
          <span class="stat-value ok">{{ orders.filter(o => o.status === 'delivered').length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Cart Items</span>
          <span class="stat-value">{{ cartStore.cartCount }}</span>
        </div>
      </section>

      <section v-if="orders.length" class="recent-orders">
        <div class="section-header">
          <h3>Recent Orders</h3>
          <router-link to="/myorder" class="view-all">View all</router-link>
        </div>
        <div class="orders-list">
          <div v-for="order in orders.slice(0, 3)" :key="order.id" class="order-item">
            <div>
              <span class="order-id">#ORD-{{ order.id }}</span>
              <p class="order-products">{{ order.products.map(p => p.name).join(', ') }}</p>
            </div>
            <div class="order-meta">
              <span :class="['status', order.status]">{{ order.status }}</span>
              <span class="order-total">${{ order.totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import DashboardSidebar from '@/components/Customer/sidebarUser.vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const activeMenu = ref('dashboard')
const user = computed(() => userStore.user)
const orders = ref([])

const userInitials = computed(() => {
  if (!user.value?.name) return '?'
  return user.value.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

const avatarUrl = computed(() => {
  const src = editingAvatar.value && avatarPreview.value
    ? avatarPreview.value
    : user.value?.avatar
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return `${API_BASE_URL}${src}`
})

const isSidebarOpen = ref(false)
const closeSidebar = () => { isSidebarOpen.value = false }
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
provide('isSidebarOpen', isSidebarOpen)
provide('closeSidebar', closeSidebar)

const toast = reactive({ message: '', type: 'success' })
let toastTimer = null

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.message = '' }, 3500)
}

// Avatar
const editingAvatar = ref(false)
const savingAvatar = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref('')

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

function cancelAvatarEdit() {
  editingAvatar.value = false
  avatarFile.value = null
  avatarPreview.value = ''
}

async function saveAvatar() {
  if (!avatarFile.value) {
    showToast('Please select a photo first', 'error')
    return
  }
  savingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('name', user.value.name)
    formData.append('avatar', avatarFile.value)
    const res = await axios.put(`${API_BASE_URL}/users/${user.value.id}`, formData, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    })
    userStore.setUser(res.data, userStore.token)
    cancelAvatarEdit()
    showToast('Profile photo updated')
  } catch {
    showToast('Failed to update photo', 'error')
  } finally {
    savingAvatar.value = false
  }
}

// Personal info
const editingPersonal = ref(false)
const savingPersonal = ref(false)
const personalForm = ref({ name: '', phone: '' })

function startPersonalEdit() {
  personalForm.value = {
    name: user.value?.name || '',
    phone: user.value?.phone || '',
  }
  editingPersonal.value = true
}

function cancelPersonalEdit() {
  editingPersonal.value = false
}

async function savePersonal() {
  savingPersonal.value = true
  try {
    const formData = new FormData()
    formData.append('name', personalForm.value.name.trim())
    formData.append('phone', personalForm.value.phone.trim())
    const res = await axios.put(`${API_BASE_URL}/users/${user.value.id}`, formData, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    })
    userStore.setUser(res.data, userStore.token)
    editingPersonal.value = false
    showToast('Personal information updated')
  } catch {
    showToast('Failed to update profile', 'error')
  } finally {
    savingPersonal.value = false
  }
}

// Address
const editingAddress = ref(false)
const savingAddress = ref(false)
const addressForm = ref({
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Cambodia',
})
const addressDisplay = ref({
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
})

const hasAddress = computed(() => Boolean(addressDisplay.value.street?.trim()))

async function loadAddress() {
  const token = userStore.token || localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetch(`${API_BASE_URL}/address`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return

    const text = await res.text()
    if (!text) return

    const data = JSON.parse(text)
    if (!data?.id) return

    addressDisplay.value = {
      street: data.street || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: data.country || '',
    }
  } catch (err) {
    console.error('Failed to load address:', err)
  }
}

function startAddressEdit() {
  addressForm.value = { ...addressDisplay.value, country: addressDisplay.value.country || 'Cambodia' }
  editingAddress.value = true
}

function cancelAddressEdit() {
  editingAddress.value = false
}

async function saveAddress() {
  savingAddress.value = true
  try {
    const nameParts = (user.value?.name || '').trim().split(/\s+/)
    const token = userStore.token || localStorage.getItem('token')

    const res = await axios.post(
      `${API_BASE_URL}/address`,
      {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        street: addressForm.value.street.trim(),
        city: addressForm.value.city.trim(),
        state: addressForm.value.state.trim(),
        zip: addressForm.value.zip.trim(),
        country: addressForm.value.country,
        phone: user.value?.phone || '',
        email: user.value?.email || '',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    addressDisplay.value = {
      street: res.data.street || addressForm.value.street,
      city: res.data.city || addressForm.value.city,
      state: res.data.state || addressForm.value.state,
      zip: res.data.zip || addressForm.value.zip,
      country: res.data.country || addressForm.value.country,
    }
    editingAddress.value = false
    showToast('Address saved successfully')
  } catch {
    showToast('Failed to save address', 'error')
  } finally {
    savingAddress.value = false
  }
}

// Password
const editingPassword = ref(false)
const savingPassword = ref(false)
const passwordError = ref('')
const passwordForm = ref({ current: '', new: '', confirm: '' })

function cancelPasswordEdit() {
  editingPassword.value = false
  passwordError.value = ''
  passwordForm.value = { current: '', new: '', confirm: '' }
}

async function savePassword() {
  passwordError.value = ''

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = 'New passwords do not match'
    return
  }
  if (passwordForm.value.new.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  savingPassword.value = true
  try {
    await axios.patch(
      `${API_BASE_URL}/users/${user.value.id}/password`,
      {
        currentPassword: passwordForm.value.current,
        newPassword: passwordForm.value.new,
      },
      { headers: { Authorization: `Bearer ${userStore.token}` } },
    )
    cancelPasswordEdit()
    showToast('Password updated successfully')
  } catch (err) {
    passwordError.value = err.response?.data?.message || 'Failed to update password'
  } finally {
    savingPassword.value = false
  }
}

function handleNavigate(section) {
  if (section === 'orders') router.push('/myorder')
  else if (section === 'track') router.push('/order-tracker')
  else activeMenu.value = section
}

async function loadOrders() {
  if (!user.value?.id) return
  try {
    const res = await axios.get(`${API_BASE_URL}/users/${user.value.id}/orders`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    })
    orders.value = res.data.map(order => {
      const items = Array.isArray(order.order_items) ? order.order_items : []
      const products = items.map(item => ({
        id: item.product?.id,
        name: item.product?.name || 'Product',
        quantity: item.quantity || 1,
      }))
      return {
        id: order.id,
        products,
        totalPrice: Number(order.total || 0),
        status: order.status || 'pending',
        createdAt: order.created_at || new Date(),
      }
    })
  } catch {
    orders.value = []
  }
}

onMounted(async () => {
  if (!user.value?.id) {
    router.push('/user/login?redirect=/profile')
    return
  }
  await Promise.all([loadAddress(), loadOrders(), cartStore.fetchCartFromBackend()])
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
  background: #f4f7f5;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #555;
  cursor: pointer;
  padding: 4px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 40px 48px;
  max-width: 1500px;
  width: 100%;
}

.topbar {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}

.topbar-title h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a2e1f;
}

.topbar-title p {
  margin: 4px 0 0;
  color: #6b7c72;
  font-size: 0.92rem;
}

/* Hero */
.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #2d7a3a 0%, #4a9e5c 100%);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(45, 122, 58, 0.2);
}

.hero-avatar {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.avatar-upload-btn {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.4rem;
}

.hero-info {
  flex: 1;
  min-width: 180px;
}

.hero-info h2 {
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 700;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.hero-email {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.avatar-actions {
  display: flex;
  gap: 8px;
}

/* Toast */
.toast {
  padding: 12px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.toast.success {
  background: #e8f5ec;
  color: #2d7a3a;
  border: 1px solid #b8dfc4;
}

.toast.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Cards */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.security-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
  gap: 12px;
}

.card-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.card-title > i {
  font-size: 1.4rem;
  color: #2d7a3a;
  margin-top: 2px;
}

.card-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2e1f;
}

.card-title p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #8a9a90;
}

.edit-link {
  background: none;
  border: none;
  color: #2d7a3a;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.15s;
  white-space: nowrap;
}

.edit-link:hover {
  background: #eaf5ee;
}

.card-body {
  padding: 16px 24px 24px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f4f1;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8a9a90;
}

.info-row .value {
  font-size: 0.95rem;
  color: #1a2e1f;
  font-weight: 500;
}

.info-row .value.locked {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.lock-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #8a9a90;
  background: #f4f7f5;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.address-display .address-line {
  margin: 0 0 4px;
  font-size: 0.95rem;
  color: #1a2e1f;
}

.address-display .address-line.muted {
  color: #6b7c72;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #8a9a90;
}

.empty-state i {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
  color: #c5d4ca;
}

.empty-state p {
  margin: 0 0 14px;
  font-size: 0.9rem;
}

.security-hint {
  margin: 0;
  color: #6b7c72;
  font-size: 0.9rem;
}

/* Forms */
.edit-form .field {
  margin-bottom: 14px;
}

.edit-form .field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.edit-form label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5c50;
  margin-bottom: 6px;
}

.edit-form input,
.edit-form select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #dde5df;
  border-radius: 10px;
  font-size: 0.92rem;
  color: #1a2e1f;
  background: #fafcfa;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.edit-form input:focus,
.edit-form select:focus {
  outline: none;
  border-color: #2d7a3a;
  box-shadow: 0 0 0 3px rgba(45, 122, 58, 0.12);
}

.disabled-input {
  background: #f0f4f1 !important;
  color: #8a9a90 !important;
  cursor: not-allowed;
}

.hint {
  display: block;
  margin-top: 5px;
  font-size: 0.75rem;
  color: #8a9a90;
}

.error-text {
  color: #b91c1c;
  font-size: 0.85rem;
  margin: 0 0 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

/* Buttons */
.primary-btn {
  background: #2d7a3a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.primary-btn:hover:not(:disabled) {
  background: #246830;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn.sm {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}

.ghost-btn.sm {
  padding: 8px 14px;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.info-card .ghost-btn,
.form-actions .ghost-btn {
  background: #f4f7f5;
  color: #4a5c50;
  border-color: #dde5df;
}

.info-card .ghost-btn:hover,
.form-actions .ghost-btn:hover {
  background: #eaf0eb;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #e8ede9;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.78rem;
  color: #8a9a90;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1f;
}

.stat-value.warn { color: #d97706; }
.stat-value.ok { color: #2d7a3a; }

/* Recent orders */
.recent-orders {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ede9;
  padding: 22px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2e1f;
}

.view-all {
  color: #2d7a3a;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f9fbf9;
  border-radius: 12px;
  gap: 12px;
}

.order-id {
  font-weight: 700;
  color: #2d7a3a;
  font-size: 0.88rem;
}

.order-products {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #6b7c72;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-total {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a2e1f;
}

.status {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: #f0f4f1;
  color: #6b7c72;
}

.status.delivered {
  background: #e8f5ec;
  color: #2d7a3a;
}

.status.pending {
  background: #fef3c7;
  color: #d97706;
}

.status.shipped {
  background: #dbeafe;
  color: #2563eb;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-content {
    padding: 20px 16px 32px;
  }

  .profile-hero {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
  }

  .avatar-actions {
    width: 100%;
    justify-content: center;
  }

  .edit-form .field-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .primary-btn,
  .form-actions .ghost-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
