<template>
  <div class="profile-page-wrapper">
    <div class="dashboard-card">
      
      <div class="sidebar-panel">
        <div class="brand-zone">
          <h1>FreshHarvest</h1>
          <p class="subtitle">Vendor Management Hub</p>
        </div>

        <div class="avatar-section">
          <div class="avatar-wrapper">
<img
  :src="previewImage || getAvatarUrl()"
  class="avatar"
  alt="Admin Profile"
/>
            <label class="upload-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <input type="file" hidden @change="onImageChange" accept="image/*" />
            </label>
          </div>
          <div class="user-meta">
            <h2>{{ adminData.name || 'Store Manager' }}</h2>
            <span class="role-badge">{{ adminData.role || userStore.user?.role || 'Admin' }}</span>
          </div>
        </div>

        <div class="sidebar-footer">
          <button v-if="!isEditing" class="edit-btn" @click="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
            Edit Profile Details
          </button>
          <button type="button" class="logout-btn" @click="logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out Hub
          </button>
        </div>
      </div>

      <div class="main-panel">
        <div class="panel-header">
          <h3>Account & Distribution Security</h3>
          <p>Review or adjust administrative locations, tokens, and store contacts.</p>
        </div>

        <form v-if="isEditing" @submit.prevent="saveProfile" class="workspace-content">
          <div class="form-grid">
            <div class="field">
              <label>Full Name</label>
              <input v-model="form.name" type="text" required placeholder="Green Grocer" />
            </div>

            <div class="field">
              <label>Email Address</label>
              <input v-model="form.email" type="email" required placeholder="manager@freshharvest.com" />
            </div>

            <div class="field text-only-field">
              <label>Phone Number</label>
              <input v-model="form.phone" type="tel" placeholder="+1 (555) 019-2834" />
            </div>

            <div class="field full">
              <label>New Security Password</label>
              <input v-model="form.password" type="password" placeholder="Leave blank to preserve current credentials" />
            </div>
          </div>

          <div class="actions">
            <button type="submit" class="save-btn" :disabled="submitting">
              {{ submitting ? 'Committing...' : 'Commit Changes' }}
            </button>
            <button type="button" class="cancel-btn" @click="cancelEdit">Dismiss</button>
          </div>
        </form>

        <div v-else class="workspace-content">
          <div class="info-grid">
            <div class="info-card">
              <label>Full Name</label>
              <p>{{ adminData.name || 'Not Configured' }}</p>
            </div>

            <div class="info-card">
              <label>Email Address</label>
              <p>{{ adminData.email || 'Not Configured' }}</p>
            </div>

            <div class="info-card">
              <label>Phone Number</label>
              <p>{{ adminData.phone || 'No active phone setup' }}</p>
            </div>

            <div class="info-card">
              <label>Privilege Tier</label>
              <p style="text-transform: capitalize;">{{ adminData.role || userStore.user?.role || 'Admin' }}</p>
            </div>
          </div>
          
          <div class="view-placeholder-graphics">
            <div class="organic-leaf-watermark">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e1ebe5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"></path>
                <path d="M9.8 6.1C7.5 11.7 7.4 12.5 4 15c2.5-1 3.5-2.5 5.8-8.9Z"></path>
              </svg>
              <span>Fresh Products Active Management Nodes</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const userStore = useUserStore()

const userId = ref(userStore.user?.id || 1)
const defaultAvatar =
  'https://cdn-icons-png.flaticon.com/512/149/149071.png'

const adminData = ref({})
const form = ref({ name: '', email: '', phone: '', password: '' })

const isEditing = ref(false)
const submitting = ref(false)

const selectedFile = ref(null)
const previewImage = ref(null)

// =========================
// GET AVATAR (FIXED LOGIC)
// =========================
const getAvatarUrl = () => {
  if (!adminData.value.avatar) return defaultAvatar

  // already full URL
  if (adminData.value.avatar.startsWith('http')) {
    return adminData.value.avatar
  }

  // backend path
  return `${BASE}${adminData.value.avatar}`
}

// =========================
// IMAGE SELECT
// =========================
const onImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

// =========================
// LOAD PROFILE
// =========================
const loadProfileData = async () => {
  try {
    const res = await axios.get(`${BASE}/users/${userId.value}`)

    adminData.value = res.data

    form.value = {
      name: res.data.name || '',
      email: res.data.email || '',
      phone: res.data.phone || '',
      password: '',
    }
  } catch (err) {
    console.error('LOAD ERROR:', err)
  }
}

// =========================
// EDIT MODE
// =========================
const startEdit = () => (isEditing.value = true)

const cancelEdit = () => {
  isEditing.value = false
  selectedFile.value = null
  previewImage.value = null
}

// =========================
// SAVE PROFILE
// =========================
const saveProfile = async () => {
  submitting.value = true

  try {
    const formData = new FormData()

    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)

    if (form.value.password?.trim()) {
      formData.append('password', form.value.password)
    }

    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value)
    }

    const res = await axios.put(
      `${BASE}/users/${userId.value}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    )

    adminData.value = res.data

    // reset UI
    isEditing.value = false
    selectedFile.value = null
    previewImage.value = null
  } catch (err) {
    console.error('UPDATE ERROR:', err)
    alert(err.response?.data?.message || 'Update failed')
  } finally {
    submitting.value = false
  }
}

// =========================
// LOGOUT
// =========================
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

onMounted(loadProfileData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.profile-page-wrapper {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-sizing: border-box;
  padding: 20px 40px 40px 40px;
  overflow: hidden; 
}

.dashboard-card {
  background: #ffffff;
  width: 100%;
  height: 100%;
  min-height: 540px;
  max-height: calc(100vh - 140px);
  border-radius: 20px;
  border: 1px solid #e1ebe4;
  box-shadow: 0 10px 30px -15px rgba(23, 43, 30, 0.04);
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
}

.sidebar-panel {
  background: #fafdfb;
  border-right: 1px solid #e1ebe4;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-zone h1 {
  font-size: 22px;
  font-weight: 800;
  color: #112214;
  margin: 0 0 2px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 12px;
  color: #5b7363;
  margin: 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin: auto 0;
}

.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 2px #10b981;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(16, 34, 20, 0.65);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.avatar-wrapper:hover .upload-overlay {
  opacity: 1;
}

.user-meta h2 {
  font-size: 18px;
  font-weight: 700;
  color: #112214;
  margin: 0 0 4px 0;
}

.role-badge {
  background: #e6f7ed;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 99px;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn:hover { background: #059669; }

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  color: #dc2626;
  border: 1px solid #e1ebe4;
  padding: 9px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.main-panel {
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #112214;
  margin: 0 0 2px 0;
}

.panel-header p {
  font-size: 13px;
  color: #5b7363;
  margin: 0;
}

.workspace-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-grid, .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: auto 0;
  padding: 10px 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field.full { grid-column: span 2; }

.field label {
  font-size: 11px;
  font-weight: 700;
  color: #3b5243;
  text-transform: uppercase;
}

.field input {
  padding: 10px 14px;
  border: 1px solid #cbd6cf;
  border-radius: 8px;
  font-size: 14px;
  color: #112214;
  outline: none;
  background: #fbfdfc;
}

.field input:focus {
  border-color: #10b981;
  background: #ffffff;
}

.info-card {
  background: #f6faf7;
  border: 1px solid #edf3ef;
  padding: 16px;
  border-radius: 10px;
}

.info-card label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b8273;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-card p {
  font-size: 14px;
  font-weight: 600;
  color: #112214;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}

.save-btn {
  background: #112214;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f0f4f1;
  color: #3b5243;
  border: 1px solid #cbd6cf;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.view-placeholder-graphics {
  margin-top: auto;
  border-top: 1px dashed #e1ebe4;
  padding-top: 12px;
}

.organic-leaf-watermark {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #93a89a;
  font-size: 12px;
  font-weight: 500;
}
</style>