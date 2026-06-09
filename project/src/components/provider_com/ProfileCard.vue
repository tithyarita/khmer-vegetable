<script setup>
import { ref, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import axios from "axios"

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const store = useProviderStore()
const token = localStorage.getItem("token")

const providerId = computed(() =>
  store.provider.user_id || store.provider.id || store.provider.user?.id || null
)

const avatarInput = ref(null)
const farmInput = ref(null)
const uploadingAvatar = ref(false)
const uploadingFarm = ref(false)

function fullUrl(path) {
  if (!path) return null
  if (path.startsWith("http")) return path
  return BASE + path
}

const avatarSrc = computed(() => fullUrl(store.provider.avatar))
const farmSrc = computed(() => fullUrl(store.provider.farm_image))

const initials = computed(() =>
  (store.provider.provider_name || store.provider.farm_name || "PR")
    .slice(0, 2)
    .toUpperCase()
)

const joinedDate = computed(() => {
  const raw = store.provider.created_at || store.provider.user?.created_at
  if (!raw) return "—"
  return new Date(raw).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  })
})

const statusLabel = computed(() => {
  const s = String(store.provider.status || "").toLowerCase()
  if (s === "active" || s === "approved") return { text: "Active", cls: "status-active" }
  if (s === "pending") return { text: "Pending", cls: "status-pending" }
  return { text: store.provider.status || "—", cls: "status-default" }
})

async function handleAvatar(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append("avatar", file)

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    if (!providerId.value) throw new Error('Provider ID is missing.')

    const res = await axios.put(
      `${BASE}/providers/${providerId.value}/avatar`,
      formData,
      { headers }
    )

    store.provider = {
      ...store.provider,
      avatar: fullUrl(res.data.avatar),
    }
  } catch (err) {
    alert("Avatar upload failed: " + (err.response?.data?.message || err.message))
  } finally {
    uploadingAvatar.value = false
    e.target.value = ""
  }
}

async function handleFarm(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadingFarm.value = true
  try {
    const formData = new FormData()
    formData.append("farm", file)

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    if (!providerId.value) throw new Error('Provider ID is missing.')

    const res = await axios.put(
      `${BASE}/providers/${providerId.value}/farm-image`,
      formData,
      { headers }
    )

    store.provider = {
      ...store.provider,
      farm_image: fullUrl(res.data.farm_image),
    }
  } catch (err) {
    alert("Farm image upload failed: " + (err.response?.data?.message || err.message))
  } finally {
    uploadingFarm.value = false
    e.target.value = ""
  }
}
</script>

<template>
  <div class="profile-hero">
    <!-- Avatar & identity -->
    <div class="identity-card">
      <div class="avatar-section">
        <div class="avatar-wrap" @click="avatarInput?.click()" :class="{ uploading: uploadingAvatar }">
          <div
            class="avatar-circle"
            :style="avatarSrc ? { backgroundImage: `url(${avatarSrc})` } : {}"
          >
            <span v-if="!avatarSrc">{{ initials }}</span>
          </div>
          <div class="avatar-edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div v-if="uploadingAvatar" class="upload-overlay">Uploading...</div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" hidden @change="handleAvatar" />

        <div class="identity-info">
          <div class="name-row">
            <h1>{{ store.provider.provider_name || "Your Name" }}</h1>
            <span class="status-badge" :class="statusLabel.cls">{{ statusLabel.text }}</span>
          </div>
          <p class="farm-label">{{ store.provider.farm_name || "Farm name not set" }}</p>
          <p class="location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {{ store.provider.location || "Location not set" }}
          </p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Provider ID</span>
          <span class="meta-value">#{{ providerId || "—" }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Email</span>
          <span class="meta-value">{{ store.provider.email || "—" }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ID Number</span>
          <span class="meta-value">{{ store.provider.id_number || "—" }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Member Since</span>
          <span class="meta-value">{{ joinedDate }}</span>
        </div>
      </div>
    </div>

    <!-- Farm image -->
    <div class="farm-card" @click="farmInput?.click()">
      <div class="farm-bg" :style="farmSrc ? { backgroundImage: `url(${farmSrc})` } : {}" />
      <div v-if="farmSrc" class="farm-overlay" />
      <div v-if="!farmSrc" class="farm-empty">
        <div class="upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <p>Upload farm photo</p>
        <span>JPG or PNG · click to browse</span>
      </div>
      <div v-if="farmSrc" class="farm-label-overlay">
        <p class="farm-name">{{ store.provider.farm_name || "My Farm" }}</p>
        <button class="change-photo-btn" @click.stop="farmInput?.click()">
          {{ uploadingFarm ? "Uploading..." : "Change photo" }}
        </button>
      </div>
      <input ref="farmInput" type="file" accept="image/*" hidden @change="handleFarm" />
    </div>
  </div>
</template>

<style scoped>
.profile-hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.identity-card {
  background: #fff;
  border: 1px solid #e8ecef;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar-wrap.uploading { pointer-events: none; opacity: 0.7; }

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0fdf4 center/cover no-repeat;
  border: 3px solid #15803d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #15803d;
  overflow: hidden;
  transition: opacity 0.2s;
}

.avatar-wrap:hover .avatar-circle { opacity: 0.85; }

.avatar-edit {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #15803d;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.identity-info { flex: 1; min-width: 0; }

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.identity-info h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}

.status-active { background: #dcfce7; color: #15803d; }
.status-pending { background: #fef9c3; color: #a16207; }
.status-default { background: #f3f4f6; color: #6b7280; }

.farm-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 4px 0 6px;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 18px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #9ca3af;
}

.meta-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  word-break: break-all;
}

/* Farm card */
.farm-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  min-height: 200px;
  border: 1px solid #e8ecef;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}

.farm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

.farm-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.35s ease;
}

.farm-card:hover .farm-bg { transform: scale(1.04); }

.farm-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%);
}

.farm-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f9fafb;
}

.farm-empty p { font-size: 0.875rem; color: #15803d; font-weight: 600; margin: 0; }
.farm-empty span { font-size: 0.75rem; color: #9ca3af; }

.upload-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0fdf4;
  border: 1px dashed #86efac;
  display: flex;
  align-items: center;
  justify-content: center;
}

.farm-label-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.farm-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.change-photo-btn {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.change-photo-btn:hover { background: rgba(255,255,255,0.35); }

@media (max-width: 768px) {
  .profile-hero { grid-template-columns: 1fr; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
}
</style>
