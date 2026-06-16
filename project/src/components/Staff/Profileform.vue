<template>
  <div class="card">
    <div class="card-head">
      <div>
        <h3 class="card-title">Profile Settings</h3>
        <p class="card-subtitle">Update your public information and avatar.</p>
      </div>
      <i class="bi bi-person head-icon"></i>
    </div>

    <div class="profile-body">
      <!-- Avatar -->
      <div class="avatar-wrap">
        <div
          class="avatar-img-box"
          @click="$refs.avatarInput.click()"
          :class="{ uploading: uploadingAvatar }"
        >
          <img
            v-if="modelValue.avatarUrl"
            :src="modelValue.avatarUrl"
            alt="Profile photo"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="avatar-edit-btn">
            <i class="bi bi-pencil-fill"></i>
          </div>
          <div v-if="uploadingAvatar" class="upload-overlay">Uploading...</div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" hidden @change="handleAvatar" />
        <span class="role-badge">{{ modelValue.role || 'STAFF' }}</span>
      </div>

      <!-- Fields -->
      <div class="fields-area">
        <div class="fields-row">
          <div class="field-group">
            <label class="field-label">FULL NAME</label>
            <input
              class="field-input"
              type="text"
              :value="modelValue.fullName"
              @input="update('fullName', $event.target.value)"
              placeholder="Your full name"
            />
          </div>
          <div class="field-group">
            <label class="field-label">EMAIL ADDRESS</label>
            <input
              class="field-input field-input--readonly"
              type="email"
              :value="modelValue.email"
              readonly
            />
            <span class="field-hint">Email cannot be changed</span>
          </div>
        </div>
        <div class="field-group" style="margin-top: 14px;">
          <label class="field-label">DEPARTMENT</label>
          <input
            class="field-input"
            type="text"
            :value="modelValue.department"
            @input="update('department', $event.target.value)"
            placeholder="e.g. Inventory & Procurement"
          />
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button class="btn-save" @click="$emit('save')" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default {
  name: 'ProfileForm',
  emits: ['update:modelValue', 'save'],
  props: {
    modelValue: { type: Object, required: true },
    saving:     { type: Boolean, default: false },
    userId:     { type: Number, required: true },
  },
  data() {
    return { uploadingAvatar: false }
  },
  methods: {
    update(field, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [field]: value })
    },
    async handleAvatar(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploadingAvatar = true
      try {
        const formData = new FormData()
        formData.append('avatar', file)
        const token = localStorage.getItem('token')
        const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
      
        const res = await axios.patch(
          `${BASE}/users/${this.userId}/avatar`,
          formData,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
      
        const raw = res.data.avatarUrl || ''
        const resolved = raw.startsWith('http')
          ? raw
          : `${BASE}/images/${raw.replace(/^\/?(uploads\/)?/, '')}`
      
        this.$emit('update:modelValue', {
          ...this.modelValue,
          avatarUrl: resolved,
        })
      } catch (err) {
        alert('Avatar upload failed: ' + (err.response?.data?.message || err.message))
      } finally {
        this.uploadingAvatar = false
        e.target.value = ''
      }
    },
  },
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title  { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 3px; }
.card-subtitle { font-size: 12px; color: #9aa0ab; margin: 0; }
.head-icon   { font-size: 22px; color: #d1d5db; }

.profile-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* Avatar */
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar-img-box {
  width: 72px;
  height: 72px;
  position: relative;
}

.avatar-img {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid #e5e7eb;
  display: block;
}

.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #c4c9d4;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #1f4e2e;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}

.avatar-edit-btn:hover { background: #2d7a4f; }

.role-badge {
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* Fields */
.fields-area { flex: 1; min-width: 0; }

.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-group { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 10px;
  color: #9aa0ab;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.field-input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 12px;
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

/* Footer */
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-save {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 22px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-save:hover { background: #e5e7eb; }

.avatar-img-box {
  position: relative;
  cursor: pointer;
  width: 72px;
  height: 72px;
}
.avatar-img-box.uploading { opacity: 0.7; pointer-events: none; }

.upload-overlay {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.field-input--readonly {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.field-hint {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>