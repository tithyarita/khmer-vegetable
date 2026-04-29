<template>
  <div class="card">
    <h3 class="card-title">Security & Access</h3>
    <p class="card-subtitle">
      Manage your credentials and view your recent login activity across all devices.
    </p>

    <div class="security-meta">
      <span class="meta-badge">
        <i class="bi bi-circle-fill dot-green"></i>
        Last login: {{ lastLogin }}
      </span>
      <span class="meta-badge">
        <i class="bi bi-geo-alt"></i>
        {{ location }}
      </span>
    </div>

    <div class="password-fields">
      <div class="field-group">
        <label class="field-label">CURRENT PASSWORD</label>
        <div class="input-wrap">
          <input
            class="field-input"
            :type="showCurrent ? 'text' : 'password'"
            v-model="currentPassword"
            placeholder="••••••••"
          />
          <button class="eye-btn" @click="showCurrent = !showCurrent" tabindex="-1">
            <i :class="showCurrent ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">NEW PASSWORD</label>
        <div class="input-wrap">
          <input
            class="field-input"
            :type="showNew ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="Enter new password"
          />
          <button class="eye-btn" @click="showNew = !showNew" tabindex="-1">
            <i :class="showNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <!-- Strength indicator -->
        <div v-if="newPassword" class="strength-row">
          <div class="strength-bar">
            <div class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></div>
          </div>
          <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
        </div>
      </div>
    </div>

    <button class="btn-update" @click="handleUpdate">Update Password</button>
  </div>
</template>

<script>
export default {
  name: "SecurityAccess",
  emits: ["update-password"],
  props: {
    lastLogin: { type: String, default: "2 hours ago" },
    location:  { type: String, default: "London, UK" },
  },
  data() {
    return {
      currentPassword: "",
      newPassword: "",
      showCurrent: false,
      showNew: false,
    };
  },
  computed: {
    passwordStrength() {
      const p = this.newPassword;
      if (!p) return 0;
      let score = 0;
      if (p.length >= 8)  score++;
      if (/[A-Z]/.test(p)) score++;
      if (/[0-9]/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      return score;
    },
    strengthClass() {
      return ["", "strength-weak", "strength-fair", "strength-good", "strength-strong"][this.passwordStrength] || "";
    },
    strengthWidth() {
      return (this.passwordStrength / 4 * 100) + "%";
    },
    strengthLabel() {
      return ["", "Weak", "Fair", "Good", "Strong"][this.passwordStrength] || "";
    },
  },
  methods: {
    handleUpdate() {
      if (!this.currentPassword || !this.newPassword) {
        alert("Please fill in both password fields.");
        return;
      }
      this.$emit("update-password", {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      });
      this.currentPassword = "";
      this.newPassword = "";
    },
  },
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}

.card-title    { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 5px; }
.card-subtitle { font-size: 12.5px; color: #6b7280; margin: 0 0 16px; line-height: 1.55; }

.security-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.dot-green { font-size: 7px; color: #2d7a4f; }

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.field-group { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 10px;
  color: #9aa0ab;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 38px 9px 12px;
  font-size: 13px;
  color: #1a1a2e;
  background: #fafafa;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #2d7a4f;
  background: #fff;
}

.field-input::placeholder { color: #c4c9d4; }

.eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #9aa0ab;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.eye-btn:hover { color: #374151; }

/* Strength bar */
.strength-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.strength-label {
  font-size: 11px;
  font-weight: 600;
  min-width: 40px;
}

.strength-weak   .strength-fill,
.strength-weak   { color: #d63b6b; background: #d63b6b; }

.strength-fair   .strength-fill,
.strength-fair   { color: #f59e0b; background: #f59e0b; }

.strength-good   .strength-fill,
.strength-good   { color: #10b981; background: #10b981; }

.strength-strong .strength-fill,
.strength-strong { color: #2d7a4f; background: #2d7a4f; }

.btn-update {
  width: 100%;
  background: #1f4e2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 11px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-update:hover { background: #2d7a4f; }
</style>