<template>
  <div class="page-body">

    <div class="page-header">
      <h1 class="page-title">Profile Settings</h1>
      <p class="page-subtitle">Manage your account preferences and security protocols.</p>
    </div>

    <div class="settings-grid">

      <div class="left-col">
        <ProfileForm
          v-model="profile"
          :saving="saving"
          :user-id="userStore.user?.id"
          @save="onSaveProfile"
        />
      </div>
      
      <div class="right-col">
        <SecurityAccess
          :last-login="session.lastLogin"
          :location="session.location"
          @update-password="onUpdatePassword"
        />

      </div>
      <div class="twofa-info-card">
        <i class="bi bi-shield-check-fill twofa-icon"></i>
        <div>
          <p class="twofa-title">Two-Factor Auth is Active</p>
          <p class="twofa-sub">
            Every login requires email verification. This cannot be disabled for staff accounts.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import ProfileForm       from '../../components/Staff/Profileform.vue'
import SecurityAccess    from '../../components/Staff/Securityaccess.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default {
  name: 'ProfileSettings',
  components: { ProfileForm, SecurityAccess },

  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  
  data() {
    const u = this.userStore?.user || {}
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
    
    function resolveImage(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `${BASE}/images/${path.replace(/^\/?(uploads\/)?/, '')}`
    }
    return {
      saving: false,
      profile: {
        fullName:   u.name       || '',
        email:      u.email      || '',
        department: u.department || '',
        role:       (u.role || 'staff').toUpperCase(),
        avatarUrl:  resolveImage(u.avatar || u.avatarUrl || ''),
      },
      session: {
        lastLogin: u.lastLogin || 'Unknown',
        location:  u.location  || '—',
      },
      notifications: [
        { key: 'email', title: 'Email Updates',  sub: 'Weekly digest of reports',  icon: 'bi bi-envelope-fill', iconClass: 'icon-blue',   enabled: true  },
        { key: 'push',  title: 'Push Alerts',    sub: 'Real-time stock alerts',    icon: 'bi bi-clock-fill',    iconClass: 'icon-orange', enabled: true  },
        { key: 'chat',  title: 'Staff Chat',      sub: 'Direct messages',          icon: 'bi bi-chat-fill',     iconClass: 'icon-gray',   enabled: false },
      ],
    }
  },

async mounted() {
  const userId = this.userStore?.user?.id
  if (!userId) return

  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const userRes  = await fetch(`${API_BASE}/users/${userId}`, { headers })
    const userData = await userRes.json()
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

    function resolveImage(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return `${BASE}/images/${path.replace(/^\/?(uploads\/)?/, '')}`
    }
    this.profile = {
      fullName:   userData.name  || '',
      email:      userData.email || '',
      department: '',
      role:       (userData.role || 'staff').toUpperCase(),
      avatarUrl:  resolveImage(userData.avatar) || '',
    }

    const staffRes  = await fetch(`${API_BASE}/staff/${userId}/profile`, { headers })
    const staffData = await staffRes.json()
    this.profile.department = staffData.department || ''

  } catch (err) {
    console.error('Failed to load profile:', err)
  }
},
  methods: {
    async onUpdatePassword({ currentPassword, newPassword }) {
      const userId = this.userStore?.user?.id
      if (!userId) { alert('User session not found. Please re-login.'); return }
      if (currentPassword === newPassword) { 
        alert('New password must be different from your current password.')
        return 
      }
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE}/users/${userId}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        const body = await res.json().catch(() => ({}))
      
        if (!res.ok) {
          alert(body.message || 'Failed to update password.')
          return
        }
        alert('Password updated successfully!')
      } catch (err) {
        alert(`Failed to update password: ${err.message}`)
      }
    },
  
    async onSaveProfile() {
      const userId = this.userStore?.user?.id
      if (!userId) { alert('Session not found.'); return }
      this.saving = true
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE}/staff/${userId}/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name:       this.profile.fullName,
            department: this.profile.department || '',
          }),
        })
        if (!res.ok) throw new Error('Failed to save')
        this.userStore.setUser({
          ...this.userStore.user,
          name: this.profile.fullName,
        }, localStorage.getItem('token'))
        alert('Profile saved!')
      } catch (err) {
        alert('Failed to save: ' + err.message)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.page-body     { padding: 28px 32px; }
.page-header   { margin-bottom: 24px; }
.page-title    { font-size: 26px; font-weight: 800; color: #1a1a2e; margin: 0 0 4px; }
.page-subtitle { font-size: 13.5px; color: #6b7280; margin: 0; }

.settings-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
  margin-bottom: 20px;
  align-items: start;
}
.left-col, .right-col { display: flex; flex-direction: column; gap: 16px; }

/* 2FA info card */
.twofa-info-card {
  background: #1f4e2e;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  color: #fff;
}
.twofa-icon  { font-size: 24px; color: #4ade80; flex-shrink: 0; margin-top: 2px; }
.twofa-title { font-size: 14px; font-weight: 700; margin: 0 0 5px; color: #fff; }
.twofa-sub   { font-size: 12.5px; color: #a8c5b0; margin: 0; line-height: 1.55; }

/* Deactivate footer */
.deactivate-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 18px; border-top: 1px solid #e5e7eb; gap: 16px;
}
.deactivate-label { display: block; font-size: 13.5px; font-weight: 700; color: #d63b6b; margin-bottom: 3px; }
.deactivate-sub   { font-size: 12px; color: #9aa0ab; margin: 0; }
.btn-deactivate   {
  background: none; border: none; font-size: 13px; font-weight: 700; color: #d63b6b;
  cursor: pointer; padding: 9px 18px; border-radius: 8px; font-family: inherit;
  white-space: nowrap; flex-shrink: 0; transition: background 0.15s;
}
.btn-deactivate:hover { background: #fde8ef; }
</style>