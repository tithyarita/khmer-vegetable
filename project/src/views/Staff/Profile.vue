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
import ProfileForm        from "../../components/Staff/ProfileForm.vue";
import SecurityAccess     from "../../components/Staff/Securityaccess.vue";
import NotificationsCard  from "../../components/Staff/Notificationscard.vue";
import TwoFactorAuth      from "../../components/Staff/Twofactorauth.vue";

export default {
  name: "ProfileSettings",
  components: {
    ProfileForm,
    SecurityAccess,
    NotificationsCard,
    TwoFactorAuth,
  },
  data() {
    return {
      profile: {
        fullName:   "Alexander Thorne",
        email:      "a.thorne@thegreenhouseuse.com",
        department: "Inventory & Procurement",
        role:       "VALIDATOR",
        avatarUrl:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
      },
      session: {
        lastLogin: "2 hours ago",
        location:  "London, UK",
      },
      twoFaEnabled: false,
      notifications: [
        {
          key:       "email",
          title:     "Email Updates",
          sub:       "Weekly digest of reports",
          icon:      "bi bi-envelope-fill",
          iconClass: "icon-blue",
          enabled:   true,
        },
        {
          key:       "push",
          title:     "Push Alerts",
          sub:       "Real-time stock alerts",
          icon:      "bi bi-clock-fill",
          iconClass: "icon-orange",
          enabled:   true,
        },
        {
          key:       "chat",
          title:     "Staff Chat",
          sub:       "Direct messages",
          icon:      "bi bi-chat-fill",
          iconClass: "icon-gray",
          enabled:   false,
        },
      ],
    };
  },
  methods: {
    onSaveProfile() {
      alert("Profile changes saved!");
    },
    onChangeAvatar() {
      alert("Avatar upload dialog would open here.");
    },
    onUpdatePassword({ currentPassword, newPassword }) {
      console.log("Password update requested", { currentPassword, newPassword });
      alert("Password updated successfully!");
    },
    onEnable2FA() {
      this.twoFaEnabled = true;
      alert("Two-Factor Authentication enabled!");
    },
    onDeactivate() {
      if (confirm("Are you sure you want to request account deactivation?")) {
        alert("Deactivation request submitted.");
      }
    },
  },
};
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