<template>
  <div class="users-management-viewport">
    
    <header class="dashboard-header-block">
      <div class="brand-title-group">
        <h1 class="main-dashboard-title">{{ t('usersDirectory') }}</h1>
        <p class="subtitle-text">{{ t('usersSubtitle') }}</p>
      </div>

      <div class="interactive-actions-hub">
        <div class="search-input-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="search"
            type="text"
            :placeholder="t('searchUsersPlaceholder')"
            class="modern-search-field"
          />
          <button v-if="search" @click="search = ''" class="search-clear-btn">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <button class="action-btn-pill btn-outline-forest" @click="exportCSV">
          <i class="bi bi-download font-icon-left"></i> {{ t('exportCsv') }}
        </button>

        <button class="action-btn-pill btn-solid-forest" @click="openCreateModal">
          <i class="bi bi-person-plus-fill font-icon-left"></i> {{ t('addUser') }}
        </button>
      </div>
    </header>

    <div v-if="errorMessage" class="error-notification-toast">
      <div class="error-toast-body">
        <i class="bi bi-exclamation-triangle-fill error-toast-icon"></i>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <div v-if="loading" class="matrix-loading-screen">
      <div class="loading-spinner-circle"></div>
      <p class="loading-status-msg">{{ t('loadingUsers') }}</p>
    </div>

    <div v-else class="dashboard-content-layer">
      
      <section class="kpi-metrics-grid">
        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">{{ t('aggregateProfiles') }}</span>
            <h2 class="kpi-counter-val">{{ totalUsers }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-total"><i class="bi bi-people"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">{{ t('systemAdmins') }}</span>
            <h2 class="kpi-counter-val text-forest">{{ totalAdmins }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-admin"><i class="bi bi-shield-lock"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">{{ t('staffEmployees') }}</span>
            <h2 class="kpi-counter-val text-ocean">{{ totalStaff }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-staff"><i class="bi bi-briefcase"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">{{ t('activeProviders') }}</span>
            <h2 class="kpi-counter-val text-amber">{{ totalProviders }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-provider"><i class="bi bi-shop-window"></i></div>
        </div>

        <div class="kpi-card shadow-sm-soft">
          <div class="kpi-meta-block">
            <span class="kpi-label-muted">{{ t('registeredCustomers') }}</span>
            <h2 class="kpi-counter-val text-purple">{{ totalCustomers }}</h2>
          </div>
          <div class="kpi-icon-pod bg-pod-customer"><i class="bi bi-cart3"></i></div>
        </div>
      </section>

      <div class="content-panel-card data-table-card shadow-sm-soft">
        <div class="table-scroll-viewport">
          <table class="modern-data-table">
            <thead>
              <tr>
                <th>{{ t('colProfileId') }}</th>
                <th>{{ t('colUserDetails') }}</th>
                <th>{{ t('colContactLine') }}</th>
                <th>{{ t('colAssignedRole') }}</th>
                <th>{{ t('colRegistrationDate') }}</th>
                <th class="table-align-right">{{ t('colControlDesk') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="table-empty-row-state">
                  <div class="empty-state-pouch">
                    <i class="bi bi-person-x-fill empty-state-icon"></i>
                    <p class="empty-state-headline">{{ t('noMatchingProfiles') }}</p>
                    <p class="empty-state-subtitle">{{ t('noMatchingProfilesHint') }}</p>
                  </div>
                </td>
              </tr>

              <tr v-for="user in filteredUsers" :key="user.id" class="table-row-interaction">
                <td class="table-cell-mono">#{{ user.id }}</td>
                <td>
                  <div class="profile-composite-identity">
                    <div class="profile-avatar-placeholder" :class="user.role">
                      <img v-if="user.avatar" :src="resolveAvatar(user.avatar)" class="avatar-img" :alt="user.name" />
                      <span v-else>{{ getAvatarInitials(user.name) }}</span>
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
                    {{ translateRole(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="table-timestamp-text">{{ formatDate(user.created_at) }}</span>
                </td>
                <td class="table-align-right">
                  <div class="action-button-group">
                    <button class="row-action-btn view-btn" @click="openViewModal(user)" :title="t('viewDetails')">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="row-action-btn edit-btn" @click="openEditModal(user)" :title="t('editProfile')">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop-layer" @click.self="closeModal">
        <div class="modal-surface-container shadow-lg-sharp">
          
          <header class="modal-header-panel">
            <div class="modal-title-pouch">
              <div class="modal-icon-decor" :class="modalType">
                <i v-if="modalType === 'create'" class="bi bi-person-plus"></i>
                <i v-else-if="modalType === 'edit'" class="bi bi-pencil-square"></i>
                <i v-else class="bi bi-card-text"></i>
              </div>
              <div>
                <h3 class="modal-headline">
                  <span v-if="modalType === 'create'">{{ t('modalCreateTitle') }}</span>
                  <span v-else-if="modalType === 'edit'">{{ t('modalEditTitle') }}</span>
                  <span v-else>{{ t('modalViewTitle') }}</span>
                </h3>
                <p class="modal-subheadline">
                  <span v-if="modalType === 'create'">{{ t('modalCreateSub') }}</span>
                  <span v-else-if="modalType === 'edit'">{{ t('modalEditSub') }}</span>
                  <span v-else>{{ t('modalViewSub') }}</span>
                </p>
              </div>
            </div>
            <button class="modal-dismiss-btn" @click="closeModal"><i class="bi bi-x-lg"></i></button>
          </header>

          <form @submit.prevent="submitUser" class="modal-form-matrix">
            <div class="form-field-row">
              <label class="form-input-label">{{ t('accountOwnerName') }}</label>
              <input 
                v-model="formUser.name" 
                type="text" 
                :placeholder="t('placeholderName')" 
                class="form-input-element" 
                :disabled="modalType === 'view'"
                required 
              />
            </div>

            <div class="form-field-row">
              <label class="form-input-label">{{ t('emailAddress') }}</label>
              <input 
                v-model="formUser.email" 
                type="email" 
                :placeholder="t('placeholderEmail')" 
                class="form-input-element" 
                :disabled="modalType === 'view'"
                required 
              />
            </div>

            <div class="form-grid-dual">
              <div class="form-field-row">
                <label class="form-input-label">{{ t('mobileLine') }}</label>
                <input 
                  v-model="formUser.phone" 
                  type="text" 
                  :placeholder="t('placeholderPhone')" 
                  class="form-input-element" 
                  :disabled="modalType === 'view'"
                  required 
                />
              </div>
              
              <div class="form-field-row">
                <label class="form-input-label">{{ t('accessRole') }}</label>
                <select 
                  v-model="formUser.role" 
                  class="form-input-element select-menu-custom" 
                  :disabled="modalType === 'view'"
                  required
                >
                  <option value="admin">{{ t('roleAdmin') }}</option>
                  <option value="staff">{{ t('roleStaff') }}</option>
                  <option value="provider">{{ t('roleProvider') }}</option>
                  <option value="customer">{{ t('roleCustomer') }}</option>
                </select>
              </div>
            </div>

            <div v-if="modalType !== 'view'" class="form-field-row">
              <label class="form-input-label">
                {{ t('accessPassword') }}
                <span v-if="modalType === 'edit'" class="optional-tag">{{ t('passwordOptional') }}</span>
              </label>
              <input 
                v-model="formUser.password" 
                type="password" 
                :placeholder="t('placeholderPassword')" 
                class="form-input-element" 
                :required="modalType === 'create'" 
              />
            </div>

            <div v-if="modalType === 'view'" class="form-grid-dual metadata-view-block">
              <div class="form-field-row">
                <label class="form-input-label">{{ t('systemIdentityId') }}</label>
                <div class="static-view-value">#{{ formUser.id }}</div>
              </div>
              <div class="form-field-row">
                <label class="form-input-label">{{ t('createdAtTimestamp') }}</label>
                <div class="static-view-value">{{ formatDate(formUser.created_at) }}</div>
              </div>
            </div>

            <footer class="modal-actions-footer">
              <button class="action-btn-pill btn-outline-gray" type="button" @click="closeModal">
                {{ modalType === 'view' ? t('closeWindow') : t('cancel') }}
              </button>
              <button v-if="modalType !== 'view'" class="action-btn-pill btn-solid-forest" type="submit" :disabled="submitting">
                <span v-if="submitting" class="inline-loading-dots">{{ t('processing') }}</span>
                <span v-else-if="modalType === 'create'">{{ t('confirmSaveUser') }}</span>
                <span v-else>{{ t('applyChanges') }}</span>
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
import { useI18n } from '@/composables/useI18n'

const { t, languageStore } = useI18n()

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

// Modal structural layout managers
const showModal = ref(false)
const modalType = ref('create') // Can be 'create', 'edit', or 'view'

const formUser = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer',
  created_at: null
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
      errorMessage.value = error.response.data.message || t('serverSyncError').replace('{status}', error.response.status)
    } else if (error.request) {
      errorMessage.value = t('networkError')
    } else {
      errorMessage.value = error.message || t('unexpectedError')
    }
  } finally {
    loading.value = false
  }
}

/* INTERFACE CONTROL MODAL SCHEDULERS */
const openCreateModal = () => {
  modalType.value = 'create'
  formUser.value = {
    id: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    created_at: null
  }
  showModal.value = true
}

const openEditModal = (user) => {
  modalType.value = 'edit'
  formUser.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '', // Clear field out to prevent hashing confusion 
    role: user.role,
    created_at: user.created_at
  }
  showModal.value = true
}

const openViewModal = (user) => {
  modalType.value = 'view'
  formUser.value = { ...user }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitUser = async () => {
  submitting.value = true
  try {
    if (modalType.value === 'create') {
      // POST orchestration for registering a profile
      await axios.post(REGISTER_URL, formUser.value)
    } else if (modalType.value === 'edit') {
      // PUT optimization mapping targets cleanly to endpoint ID
      const payload = { ...formUser.value }
      if (!payload.password || !payload.password.trim()) {
        delete payload.password // Don't wipe clean database value if field skipped
      }
      await axios.put(`${API_URL}/${formUser.value.id}`, payload)
    }
    showModal.value = false
    await fetchUsers()
  } catch (error) {
    console.error('Data pipeline write fault:', error)
    alert(error.response?.data?.message || t('validationFailed'))
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
const resolveAvatar = (avatar) => {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  return `${BASE}/images/${avatar.replace(/^\/?(uploads\/)?/, '')}`
}

const getAvatarInitials = (name) => {
  if (!name) return 'U'
  const segments = name.trim().split(' ')
  if (segments.length > 1) {
    return `${segments[0][0]}${segments[1][0]}`.toUpperCase()
  }
  return segments[0][0].toUpperCase()
}

const translateRole = (role) => {
  const map = {
    admin: t('roleAdmin'),
    staff: t('roleStaff'),
    provider: t('roleProvider'),
    customer: t('roleCustomer'),
  }
  return map[role] || role
}

const formatDate = (date) => {
  if (!date) return '—'
  const locale = languageStore.language === 'km' ? 'km-KH' : 'en-US'
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const exportCSV = () => {
  const headers = [t('csvId'), t('csvName'), t('csvEmail'), t('csvPhone'), t('csvRole'), t('csvCreatedAt')]
  const rows = users.value.map(u => [
    u.id,
    u.name,
    u.email,
    u.phone || '',
    translateRole(u.role),
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

/* ACTION DESK ROW GRIDS */
.action-button-group {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.row-action-btn {
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
  font-size: 14px;
}

.row-action-btn:hover {
  background-color: #f1f5f9;
}

.view-btn:hover { color: #2563eb; background-color: #eff6ff; }
.edit-btn:hover { color: #d97706; background-color: #fffbeb; }
.delete-btn:hover { color: #ef4444; background-color: #fef2f2; }

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
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.modal-icon-decor.create { background-color: #f0fdf4; color: #16a34a; }
.modal-icon-decor.edit { background-color: #fffbeb; color: #d97706; }
.modal-icon-decor.view { background-color: #eff6ff; color: #2563eb; }

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

.optional-tag {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
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

.form-input-element:focus:not(:disabled) {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,0.06);
}

.form-input-element:disabled {
  background-color: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

.metadata-view-block {
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.static-view-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
  padding: 4px 0;
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