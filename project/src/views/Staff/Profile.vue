<template>
    <div class="page-body">

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Profile Settings</h1>
        <p class="page-subtitle">Manage your account preferences and security protocols.</p>
      </div>

      <!-- Two-column layout -->
      <div class="settings-grid">

        <!-- Left: Profile form + Security -->
        <div class="left-col">
          <ProfileForm
            v-model="profile"
            @save="onSaveProfile"
            @change-avatar="onChangeAvatar"
          />
          <SecurityAccess
            :last-login="session.lastLogin"
            :location="session.location"
            @update-password="onUpdatePassword"
          />
        </div>

        <!-- Right: Notifications + 2FA -->
        <div class="right-col">
          <NotificationsCard
            v-model:notifications="notifications"
          />
          <TwoFactorAuth
            :enabled="twoFaEnabled"
            @enable="onEnable2FA"
          />
        </div>

      </div>

      <!-- Deactivate Account Footer -->
      <div class="deactivate-footer">
        <div>
          <span class="deactivate-label">Deactivate Account</span>
          <p class="deactivate-sub">Temporarily disable your access to the staff portal.</p>
        </div>
        <button class="btn-deactivate" @click="onDeactivate">Request Deactivation</button>
      </div>

    </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import ProfileForm       from '../../components/Staff/Profileform.vue'
import SecurityAccess    from '../../components/Staff/Securityaccess.vue'
import NotificationsCard from '../../components/Staff/Notificationscard.vue'
import TwoFactorAuth     from '../../components/Staff/Twofactorauth.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const COOLDOWN_DAYS = 7

export default {
  name: 'ProfileSettings',
  components: { ProfileForm, SecurityAccess, NotificationsCard, TwoFactorAuth },

  setup() {
    const userStore = useUserStore()
    return { userStore }
  },

  data() {
    const u = this.userStore?.user || {}
    return {
      profile: {
        fullName:   u.name       || '',
        email:      u.email      || '',
        department: u.department || '',
        role:       (u.role || 'staff').toUpperCase(),
        avatarUrl:  u.avatarUrl  || '',
      },
      session: {
        lastLogin: u.lastLogin || 'Unknown',
        location:  u.location  || '—',
      },
      twoFaEnabled: false,

      // Password cooldown ──────────────────────────────────────
      passwordCooldownUntil: null,   // Date | null

      notifications: [
        { key: 'email', title: 'Email Updates',  sub: 'Weekly digest of reports',  icon: 'bi bi-envelope-fill', iconClass: 'icon-blue',   enabled: true  },
        { key: 'push',  title: 'Push Alerts',    sub: 'Real-time stock alerts',    icon: 'bi bi-clock-fill',    iconClass: 'icon-orange', enabled: true  },
        { key: 'chat',  title: 'Staff Chat',      sub: 'Direct messages',          icon: 'bi bi-chat-fill',     iconClass: 'icon-gray',   enabled: false },
      ],
    }
  },

  computed: {
    // Key is per-user so different accounts don't share the cooldown
    cooldownKey() {
      return `pwdChangedAt_${this.userStore?.user?.id ?? 'staff'}`
    },

    // How many full days remain on the cooldown (0 = can change now)
    cooldownDaysLeft() {
      if (!this.passwordCooldownUntil) return 0
      const msLeft = this.passwordCooldownUntil - Date.now()
      if (msLeft <= 0) return 0
      return Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    },

    passwordLocked() {
      return this.cooldownDaysLeft > 0
    },
  },

  mounted() {
    this.loadCooldown()
  },

  methods: {
    // ── Cooldown helpers ──────────────────────────────────────────────────────
    loadCooldown() {
      const stored = localStorage.getItem(this.cooldownKey)
      if (!stored) return
      const until = new Date(stored)
      if (until > new Date()) {
        this.passwordCooldownUntil = until
      } else {
        localStorage.removeItem(this.cooldownKey)
      }
    },

    saveCooldown() {
      const until = new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
      this.passwordCooldownUntil = until
      localStorage.setItem(this.cooldownKey, until.toISOString())
    },

    // ── Password change ───────────────────────────────────────────────────────
    async onUpdatePassword({ currentPassword, newPassword }) {
      // Guard: cooldown active
      if (this.passwordLocked) {
        alert(`You can only change your password once every ${COOLDOWN_DAYS} days.\n${this.cooldownDaysLeft} day(s) remaining.`)
        return
      }

      // Guard: same password
      if (currentPassword === newPassword) {
        alert('New password must be different from your current password.')
        return
      }

      const userId = this.userStore?.user?.id
      if (!userId) {
        alert('User ID not found. Please re-login.')
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

        if (res.status === 401) {
          alert('Current password is incorrect.')
          return
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || `Server error (${res.status})`)
        }

        // Success — lock for 7 days
        this.saveCooldown()
        alert('Password updated successfully! You can change it again in 7 days.')

      } catch (err) {
        alert(`Failed to update password: ${err.message}`)
      }
    },

    // ── Other handlers ────────────────────────────────────────────────────────
    onSaveProfile() {
      alert('Profile changes saved!')
    },
    onChangeAvatar() {
      alert('Avatar upload dialog would open here.')
    },
    onEnable2FA() {
      this.twoFaEnabled = true
      alert('Two-Factor Authentication enabled!')
    },
    onDeactivate() {
      if (confirm('Are you sure you want to request account deactivation?')) {
        alert('Deactivation request submitted.')
      }
    },
  },
}
</script>

<style scoped>
.page-body { padding: 28px 32px; }

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

.left-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Deactivate Footer */
.deactivate-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
  gap: 16px;
}

.deactivate-label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #d63b6b;
  margin-bottom: 3px;
}

.deactivate-sub {
  font-size: 12px;
  color: #9aa0ab;
  margin: 0;
}

.btn-deactivate {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #d63b6b;
  cursor: pointer;
  padding: 9px 18px;
  border-radius: 8px;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
}

.btn-deactivate:hover { background: #fde8ef; }
</style>