<script setup>
import { ref, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import axios from "axios"

const BASE = "http://localhost:3000"

const store = useProviderStore()

const token = localStorage.getItem("token")

const avatarInput = ref(null)
const farmInput = ref(null)

function fullUrl(path) {
  if (!path) return null

  if (path.startsWith("http")) {
    return path
  }

  return BASE + path
}

const avatarSrc = computed(() =>
  fullUrl(store.provider.avatar)
)

const farmSrc = computed(() =>
  fullUrl(store.provider.farm_image)
)

const initials = computed(() =>
  store.provider.provider_name
    ?.slice(0, 2)
    .toUpperCase() || "SM"
)

// ===================================
// UPLOAD AVATAR
// ===================================

async function handleAvatar(e) {
  const file = e.target.files[0]

  if (!file) return

  try {
    const formData = new FormData()

    formData.append("avatar", file)

    const res = await axios.put(
      `${BASE}/providers/${store.provider.user_id}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    store.provider = {
      ...store.provider,
      avatar: res.data.avatar,
    }

    alert("Avatar uploaded!")
  } catch (err) {
    console.error(err)

    alert(
      "Avatar upload failed: " +
      (err.response?.data?.message || err.message)
    )
  }
}

// ===================================
// UPLOAD FARM IMAGE
// ===================================

async function handleFarm(e) {
  const file = e.target.files[0]

  if (!file) return

  try {
    const formData = new FormData()

    formData.append("farm", file)

    const res = await axios.put(
      `${BASE}/providers/${store.provider.user_id}/farm-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    store.provider = {
      ...store.provider,
      farm_image: res.data.farm_image,
    }

    alert("Farm image uploaded!")
  } catch (err) {
    console.error(err)

    alert(
      "Farm image upload failed: " +
      (err.response?.data?.message || err.message)
    )
  }
}
</script>

<template>
  <div class="profile-grid">

    <!-- ── Provider Card ── -->
    <div class="provider-card">
      <div class="verified-badge">
        <span class="verified-dot" />
        Verified Provider
      </div>

      <div class="provider-top">
        <div class="avatar-wrap" @click="avatarInput?.click()">
          <div
            class="avatar-circle"
            :style="avatarSrc
              ? { backgroundImage: `url(${avatarSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}"
          >
            <span v-if="!avatarSrc">{{ initials }}</span>
          </div>
          <div class="avatar-edit">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatar" />

        <div class="provider-info">
          <p class="provider-name">{{ store.provider.provider_name || "—" }}</p>
          <p class="provider-sub">📍 {{ store.provider.location || "—" }}</p>
          <div class="green-badge">
            <span class="badge-dot" />
            Organic Certified
          </div>
        </div>
      </div>

      <div class="id-meta">
        <div class="meta-item">
          <span class="meta-lbl">Provider ID</span>
          <span class="meta-val">{{ store.provider.user_id || "—" }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-lbl">Joined</span>
          <span class="meta-val">
            {{ store.provider.user?.created_at
              ? new Date(store.provider.user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—" }}
          </span>
        </div>
        <div class="meta-item">
          <span class="meta-lbl">ID Number</span>
          <span class="meta-val">{{ store.provider.id_number || "—" }}</span>
        </div>
      </div>
    </div>

    <!-- ── Farm Card ── -->
    <div class="farm-card" @click="farmInput?.click()">
      <div
        class="farm-bg"
        :style="farmSrc ? { backgroundImage: `url(${farmSrc})` } : {}"
      />
      <div v-if="farmSrc" class="farm-gradient" />
      <div v-if="!farmSrc" class="farm-empty">
        <div class="upload-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p>Upload farm photo</p>
        <span>JPG or PNG recommended</span>
      </div>

      <div class="farm-content">
        <div class="farm-badge-float">
          <span class="farm-badge-dot" />
          Active since {{ store.provider.user?.created_at
            ? new Date(store.provider.user.created_at).getFullYear()
            : "—" }}
        </div>
        <p class="farm-name-float">{{ store.provider.farm_name || "—" }}</p>
        <p class="farm-loc-float">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {{ store.provider.location || "—" }}
        </p>
      </div>

      <button v-if="farmSrc" class="change-btn" @click.stop="farmInput?.click()">
        Change photo
      </button>
      <input ref="farmInput" type="file" accept="image/*" style="display:none" @click.stop @change="handleFarm" />
    </div>

  </div>
</template>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ── Provider Card ── */
.provider-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #1a3d2a;
  margin-bottom: 14px;
}
.verified-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1a3d2a;
}

.provider-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.avatar-wrap { position: relative; flex-shrink: 0; cursor: pointer; }
.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f7f0;
  border: 2px solid #1a3d2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #2d6a4f;
  overflow: hidden;
  transition: opacity 0.2s;
}
.avatar-wrap:hover .avatar-circle { opacity: 0.82; }
.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1a3d2a;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.provider-info { flex: 1; }
.provider-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 3px; }
.provider-sub  { font-size: 11px; color: #9ca3af; margin-bottom: 6px; }

.green-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0f7f0;
  color: #1a3d2a;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}
.badge-dot { width: 4px; height: 4px; border-radius: 50%; background: #1a3d2a; }

.id-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-top: 1px solid #e8e8e8;
  padding-top: 14px;
  margin-top: auto;
}
.meta-item { display: flex; flex-direction: column; gap: 3px; }
.meta-lbl {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #9ca3af;
}
.meta-val { font-size: 11px; font-weight: 700; color: #111827; }

/* ── Farm Card ── */
.farm-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}
.farm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

.farm-bg {
  position: absolute;
  inset: 0;
  background: #f3f4f3;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.35s ease;
}
.farm-card:hover .farm-bg { transform: scale(1.05); }

.farm-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.62) 100%);
}

.farm-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fafbfa;
}
.farm-empty p    { font-size: 12px; color: #2d6a4f; font-weight: 600; }
.farm-empty span { font-size: 10px; color: #9ca3af; }

.upload-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f7f0;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.farm-content {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding: 16px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.farm-badge-float {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
  margin-bottom: 2px;
}
.farm-badge-dot { width: 4px; height: 4px; border-radius: 50%; background: #69f0ae; }
.farm-name-float {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
  line-height: 1.2;
}
.farm-loc-float {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  gap: 3px;
}

.change-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: none;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.farm-card:hover .change-btn { display: block; }
.change-btn:hover { background: rgba(0,0,0,0.55); }

@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
}
</style>