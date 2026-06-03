<template>
  <div class="users-management-viewport">
    
    <!-- Top Action Control Bar -->
    <header class="dashboard-header-block">
      <div class="brand-title-group">
        <h1 class="main-dashboard-title">Users Directory</h1>
        <p class="subtitle-text">Monitor operational roles, register core field operators, and manage active system profiles.</p>
      </div>

      <div class="interactive-actions-hub">
        <div class="search-input-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search name, email..."
            class="modern-search-field"
          />
          <button v-if="search" @click="search = ''" class="search-clear-btn">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <button class="action-btn-pill btn-outline-forest" @click="exportCSV">
          <i class="bi bi-download font-icon-left"></i> Export CSV
        </button>

        <button class="action-btn-pill btn-solid-forest" @click="openModal">
          <i class="bi bi-person-plus-fill font-icon-left"></i> Add User
        </button>
      </div>
    </header>

    <!-- Error Callout Banner Component -->
    <div v-if="errorMessage" class="error-notification-toast">
      <div class="error-toast-body">
        <i class="bi bi-exclamation-triangle-fill error-toast-icon"></i>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Core Dynamic Loading Placeholder -->
    <div v-if="loading" class="matrix-loading-screen">
      <div class="loading-spinner-circle"></div>
      <p class="loading-status-msg">Synchronizing real-time profile arrays...</p>
    </div>

    <div v-else class="dashboard-content-layer">
      
      <!-- Metrics KPI Layout Deck -->
      <section class="kpi-metrics-grid">
        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">Aggregate Profiles</span>
            <h2 class="kpi-counter-val">{{ totalUsers }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-total"><i class="bi bi-people"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">System Admins</span>
            <h2 class="kpi-counter-val text-forest">{{ totalAdmins }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-admin"><i class="bi bi-shield-lock"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">Staff Employees</span>
            <h2 class="kpi-counter-val text-ocean">{{ totalStaff }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-staff"><i class="bi bi-briefcase"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">Active Providers</span>
            <h2 class="kpi-counter-val text-amber">{{ totalProviders }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-provider"><i class="bi bi-shop-window"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">Registered Customers</span>
            <h2 class="kpi-counter-val text-purple">{{ totalCustomers }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-customer"><i class="bi bi-cart3"></i></div>
        </div>
      </section>

      <!-- Main Directory Table Module -->
      <div class="content-panel-card data-table-card shadow-sm-soft">
        <div class="table-scroll-viewport">
          <table class="modern-data-table">
            <thead>
              <tr>
                <th>Profile Identifier</th>
                <th>User Matrix Details</th>
                <th>Contact Line</th>
                <th>Assigned Role</th>
                <th>Registration Date</th>
                <th class="table-align-right">Control Desk</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty Dataset Placeholder -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="table-empty-row-state">
                  <div class="empty-state-pouch">
                    <i class="bi bi-person-x-fill empty-state-icon"></i>
                    <p class="empty-state-headline">No matching profiles identified</p>
                    <p class="empty-state-subtitle">Refine your search parameters or register a new profile entry.</p>
                  </div>
                </td>
              </tr>

              <!-- Iterative Record Row -->
              <tr v-for="user in filteredUsers" :key="user.id" class="table-row-interaction">
                <td class="table-cell-mono">#{{ user.id }}</td>
                <td>
                  <div class="profile-composite-identity">
                    <div class="profile-avatar-placeholder" :class="user.role">
                      {{ getAvatarInitials(user.name) }}
                    </div>
                    <div class="profile-text-stack">
                      <span class="identity-fullname-text">{{ user.name }}</span>
                      <span class="identity-email-subtext">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="table-contact-text">{{ user.phone || '—' }}</span>
                </td>
                <td>
                  <span class="badge-role-pill" :class="user.role">
                    <span class="role-badge-bullet"></span>
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="table-timestamp-text">{{ formatDate(user.created_at) }}</span>
                </td>
                <td class="table-align-right">
                  <button class="row-delete-action-btn" @click="deleteUser(user.id)" title="Remove user profile">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Management Modal Layer Template -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop-layer" @click.self="closeModal">
        <div class="modal-surface-container shadow-lg-sharp">
          
          <header class="modal-header-panel">
            <div class="modal-title-pouch">
              <div class="modal-icon-decor"><i class="bi bi-person-plus"></i></div>
              <div>
                <h3 class="modal-headline">Register Profile</h3>
                <p class="modal-subheadline">Instantiate a secure platform authorization entry.</p>
              </div>
            </div>
            <button class="modal-dismiss-btn" @click="closeModal"><i class="bi bi-x-lg"></i></button>
          </header>

          <form @submit.prevent="submitUser" class="modal-form-matrix">
            <div class="form-field-row">
              <label class="form-input-label">Account Owner Name</label>
              <input v-model="newUser.name" type="text" placeholder="e.g. Alexander Pierce" class="form-input-element" required />
            </div>

            <div class="form-field-row">
              <label class="form-input-label">Email Address Address</label>
              <input v-model="newUser.email" type="email" placeholder="name@domain.com" class="form-input-element" required />
            </div>

            <div class="form-grid-dual">
              <div class="form-field-row">
                <label class="form-input-label">Mobile Line</label>
                <input v-model="newUser.phone" type="text" placeholder="+1 (555) 000-0000" class="form-input-element" required />
              </div>
              
              <div class="form-field-row">
                <label class="form-input-label">Access Authorization Role</label>
                <select v-model="newUser.role" class="form-input-element select-menu-custom" required>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="provider">Provider</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>

            <div class="form-field-row">
              <label class="form-input-label">Access Core Password</label>
              <input v-model="newUser.password" type="password" placeholder="••••••••" class="form-input-element" required />
            </div>

            <footer class="modal-actions-footer">
              <button class="action-btn-pill btn-outline-gray" type="button" @click="closeModal">
                Cancel
              </button>
              <button class="action-btn-pill btn-solid-forest" type="submit" :disabled="submitting">
                <span v-if="submitting" class="inline-loading-dots">Saving profile entry...</span>
                <span v-else>Confirm & Save User</span>
              </button>
            </footer>
          </form>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/* COMPONENT INITIALIZATION STRATEGY */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_URL = `${BASE}/users`
const REGISTER_URL = `${BASE}/users/register`

/* CORE REACTIVE STATE LAYERS */
const users = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const errorMessage = ref('')
const showModal = ref(false)

const newUser = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer'
})

/* REMOTE REGISTRY EXTRACTION */
const fetchUsers = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(API_URL)
    users.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Fetch operation failure execution logs:', error)
    if (error.response) {
      errorMessage.value = error.response.data.message || `Server synchronization drop (${error.response.status})`
    } else if (error.request) {
      errorMessage.value = 'Network transmission failure. Backend stack unreachable.'
    } else {
      errorMessage.value = error.message || 'An unexpected structural exception occurred.'
    }
  } finally {
    loading.value = false
  }
}

/* DESTRUCTION MANAGEMENT HANDLERS */
const deleteUser = async (id) => {
  const confirmed = confirm('Are you sure you want to completely remove this user profile from active directories? This action cannot be undone.')
  if (!confirmed) return

  try {
    await axios.delete(`${API_URL}/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  } catch (error) {
    console.error('Destruction handling error payload:', error)
    alert(error.response?.data?.message || 'Failed to destroy profile entity.')
  }
}

/* INTERFACE CONTROL MODAL SCHEDULERS */
const openModal = () => {
  newUser.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitUser = async () => {
  submitting.value = true
  try {
    await axios.post(REGISTER_URL, newUser.value)
    showModal.value = false
    await fetchUsers()
  } catch (error) {
    console.error('Data pipeline write fault:', error)
    alert(error.response?.data?.message || 'Profile insertion rejected by data core validations.')
  } finally {
    submitting.value = false
  }
}

/* RECOMPILING TRANSFORM MATRICES */
const filteredUsers = computed(() => {
  const query = search.value.toLowerCase().trim()
  if (!query) return users.value

  return users.value.filter(u => {
    const matchName = (u.name || '').toLowerCase().includes(query)
    const matchEmail = (u.email || '').toLowerCase().includes(query)
    return matchName || matchEmail
  })
})

const totalUsers = computed(() => users.value.length)
const totalAdmins = computed(() => users.value.filter(u => u.role === 'admin').length)
const totalStaff = computed(() => users.value.filter(u => u.role === 'staff').length)
const totalProviders = computed(() => users.value.filter(u => u.role === 'provider').length)
const totalCustomers = computed(() => users.value.filter(u => u.role === 'customer').length)

/* UTILITY HELPERS */
const getAvatarInitials = (name) => {
  if (!name) return 'U'
  const segments = name.trim().split(' ')
  if (segments.length > 1) {
    return `${segments[0][0]}${segments[1][0]}`.toUpperCase()
  }
  return segments[0][0].toUpperCase()
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const exportCSV = () => {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Created At']
  const rows = users.value.map(u => [
    u.id,
    u.name,
    u.email,
    u.phone || '',
    u.role,
    new Date(u.created_at).toISOString()
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchUsers)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');

/* VIEWPORT ENGINE DESIGN CORES */
.users-management-viewport {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

/* TYPOGRAPHY UTILS */
.text-forest { color: #16a34a !important; }
.text-ocean { color: #2563eb !important; }
.text-amber { color: #d97706 !important; }
.text-purple { color: #7c3aed !important; }

/* UTILITY ACCENTS & SHADOW MATRIX */
.shadow-sm-soft { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05); }
.shadow-lg-sharp { box-shadow: 0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.1); }

/* STRUCTURE COMPONENT: HEADER CONTROL BLOCK */
.dashboard-header-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.main-dashboard-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0;
}

.subtitle-text {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.interactive-actions-hub {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* COMPONENT: SEARCH MATRIX FORM WRAPPERS */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 260px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
}

.modern-search-field {
  width: 100%;
  padding: 10px 38px 10px 38px;
  font-size: 14px;
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-search-field:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.08);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

/* COMPONENT: BUTTON SPECIFICATION INTERFACE */
.action-btn-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.font-icon-left {
  margin-right: 8px;
  font-size: 14px;
}

.btn-solid-forest {
  background-color: #16a34a;
  color: #ffffff;
}

.btn-solid-forest:hover {
  background-color: #15803d;
}

.btn-solid-forest:active {
  transform: scale(0.98);
}

.btn-outline-forest {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-outline-forest:hover {
  background-color: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-outline-gray {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-outline-gray:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

/* NOTIFICATION CALLOUT TOAST STYLING */
.error-notification-toast {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 18px;
}

.error-toast-body {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #991b1b;
}

.error-toast-icon {
  font-size: 16px;
  color: #dc2626;
}

/* METRICS DISTRIBUTION GRID MATRICES */
.kpi-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  background-color: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-meta-block {
  display: flex;
  flex-direction: column;
}

.kpi-label-muted {
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.1px;
}

.kpi-counter-val {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 6px;
  letter-spacing: -0.5px;
}

.kpi-icon-pod {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.bg-pod-total { background-color: #f1f5f9; color: #475569; }
.bg-pod-admin { background-color: #f0fdf4; color: #16a34a; }
.bg-pod-staff { background-color: #eff6ff; color: #2563eb; }
.bg-pod-provider { background-color: #fffbeb; color: #d97706; }
.bg-pod-customer { background-color: #f5f3ff; color: #7c3aed; }

/* DATA PANEL COMPONENTS ARCHITECTURE */
.content-panel-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}

.table-scroll-viewport {
  overflow-x: auto;
  width: 100%;
}

.modern-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.modern-data-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.modern-data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

.table-row-interaction {
  transition: background-color 0.15s ease;
}

.table-row-interaction:hover {
  background-color: #f8fafc;
}

.table-row-interaction:last-child td {
  border-bottom: none;
}

.table-cell-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
}

.table-align-right { text-align: right; }

/* IDENTITY MATRIX CHIPS DESIGN */
.profile-composite-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.profile-avatar-placeholder.admin { background: linear-gradient(135deg, #4ade80, #16a34a); }
.profile-avatar-placeholder.staff { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.profile-avatar-placeholder.provider { background: linear-gradient(135deg, #fbbf24, #d97706); }
.profile-avatar-placeholder.customer { background: linear-gradient(135deg, #a78bfa, #7c3aed); }

.profile-text-stack {
  display: flex;
  flex-direction: column;
}

.identity-fullname-text {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
}

.identity-email-subtext {
  font-size: 12px;
  color: #64748b;
  margin-top: 1px;
}

.table-contact-text {
  font-weight: 500;
  color: #475569;
}

.table-timestamp-text {
  color: #64748b;
  font-weight: 400;
}

/* SYSTEM BADGE ROLES CHIPS ENGINE */
.badge-role-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.role-badge-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-role-pill.admin { background-color: #f0fdf4; color: #166534; }
.badge-role-pill.admin .role-badge-bullet { background-color: #16a34a; }

.badge-role-pill.staff { background-color: #eff6ff; color: #1e40af; }
.badge-role-pill.staff .role-badge-bullet { background-color: #3b82f6; }

.badge-role-pill.provider { background-color: #fffbeb; color: #92400e; }
.badge-role-pill.provider .role-badge-bullet { background-color: #f59e0b; }

.badge-role-pill.customer { background-color: #f5f3ff; color: #5b21b6; }
.badge-role-pill.customer .role-badge-bullet { background-color: #8b5cf6; }

/* ACTION DESK ROW INTERACTION BUTTONS */
.row-delete-action-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 15px;
}

.row-delete-action-btn:hover {
  background-color: #fef2f2;
  color: #ef4444;
}

/* EMPTY BLANK CONTEXT DATA STATES */
.table-empty-row-state {
  padding: 60px !important;
  text-align: center;
}

.empty-state-pouch {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
  margin: 0 auto;
}

.empty-state-icon {
  font-size: 40px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-state-headline {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.empty-state-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.4;
}

/* DYNAMIC INTERFACE LOADING STATUS OVERLAYS */
.matrix-loading-screen {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner-circle {
  border: 3px solid #f1f5f9;
  border-top: 3px solid #16a34a;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin-around-clockwise 0.75s linear infinite;
  margin-bottom: 14px;
}

@keyframes spin-around-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-status-msg {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* STRUCTURE: SECURITY REGISTRY MODAL PLATFORM */
.modal-backdrop-layer {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.modal-surface-container {
  width: 100%;
  max-width: 460px;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.modal-header-panel {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-pouch {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon-decor {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.modal-headline {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.modal-subheadline {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.modal-dismiss-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s ease;
}

.modal-dismiss-btn:hover {
  color: #475569;
}

/* FORM ELEMENT INTERFACES */
.modal-form-matrix {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-grid-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-input-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
}

.form-input-element {
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  transition: all 0.15s ease;
}

.form-input-element:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.06);
}

.select-menu-custom {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  appearance: none;
  padding-right: 36px;
}

.modal-actions-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.inline-loading-dots {
  opacity: 0.85;
}

/* ANIMATION TRANSITION TRANSLATIONS */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-surface-container {
  animation: modal-pop-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop-up {
  from { transform: scale(0.94); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.dashboard-content-layer {
  animation: content-fade-in-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes content-fade-in-slide {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* RESPONSIVE LAYOUT MATRIX MEDIA ADJUSTMENTS */
@media (max-width: 960px) {
  .kpi-metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .users-management-viewport { padding: 20px; gap: 20px; }
  .dashboard-header-block { flex-direction: column; align-items: flex-start; }
  .interactive-actions-hub { width: 100%; }
  .search-input-wrapper { width: 100%; }
  .action-btn-pill { flex: 1; }
  .kpi-metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .form-grid-dual { grid-template-columns: 1fr; gap: 16px; }
}

@media (max-width: 480px) {
  .kpi-metrics-grid { grid-template-columns: 1fr; }
}
</style>