<script setup>
import { ref, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"

const store = useProviderStore()

const avatarSrc   = ref(null)
const farmSrc     = ref(null)
const avatarInput = ref(null)
const farmInput   = ref(null)

const initials = computed(() =>
  store.provider.name?.slice(0, 2).toUpperCase() || "SM"
)

function triggerAvatar() { avatarInput.value?.click() }
function triggerFarm()   { farmInput.value?.click()   }

function handleAvatar(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { avatarSrc.value = ev.target.result }
  reader.readAsDataURL(file)
}

function handleFarm(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { farmSrc.value = ev.target.result }
  reader.readAsDataURL(file)
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
        <div class="avatar-wrap" @click="triggerAvatar">
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

        <div class="provider-info">
          <p class="provider-name">{{ store.provider.name }}</p>
          <p class="provider-sub">📍 {{ store.provider.location }}</p>
          <div class="green-badge">
            <span class="badge-dot" />
            Organic Certified
          </div>
        </div>
      </div>

      <div class="id-meta">
        <div class="meta-item">
          <span class="meta-lbl">Provider ID</span>
          <span class="meta-val">{{ store.provider.id }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-lbl">Joined</span>
          <span class="meta-val">{{ store.provider.joined }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-lbl">ID Number</span>
          <span class="meta-val">{{ store.provider.idNumber }}</span>
        </div>
      </div>

      <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatar" />
    </div>

    <!-- ── Farm Card ── -->
    <div class="farm-card" @click="triggerFarm">

      <!-- Full-bleed background image -->
      <div
        class="farm-bg"
        :style="farmSrc ? { backgroundImage: `url(${farmSrc})` } : {}"
      />

      <!-- Gradient overlay — only when image loaded -->
      <div v-if="farmSrc" class="farm-gradient" />

      <!-- Empty state -->
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

      <!-- Floating text over image -->
      <div class="farm-content">
        <div class="farm-badge-float">
          <span class="farm-badge-dot" />
          Active since 1984
        </div>
        <p class="farm-name-float">{{ store.provider.farm }}</p>
        <p class="farm-loc-float">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {{ store.provider.location }}
        </p>
      </div>

      <!-- Change photo — visible on hover -->
      <button v-if="farmSrc" class="change-btn" @click.stop="triggerFarm">
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
  background: linear-gradient(145deg, #f9fdf9 0%, #e8f5e9 100%);
  border: 1px solid #c8e6c9;
  border-radius: 14px;
  padding: 22px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.provider-card::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 20px solid rgba(46, 125, 50, 0.07);
  pointer-events: none;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #2e7d32;
  margin-bottom: 16px;
}

.verified-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.25);
}

.provider-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  border: 3px solid #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  color: #1b5e20;
  overflow: hidden;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2e7d32;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.provider-info { flex: 1; }

.provider-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.provider-sub {
  font-size: 11.5px;
  color: #6b7280;
}

.green-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  margin-top: 6px;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4caf50;
}

.id-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-top: 1px solid #c8e6c9;
  padding-top: 14px;
  margin-top: auto;
}

.meta-item { display: flex; flex-direction: column; gap: 3px; }

.meta-lbl {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #9ca3af;
}

.meta-val {
  font-size: 11.5px;
  font-weight: 600;
  color: #1a1a1a;
  font-family: 'DM Mono', monospace;
}

/* ── Farm Card ── */
.farm-card {
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}

.farm-card:hover {
  box-shadow: 0 0 0 2px #4caf50;
}

.farm-bg {
  position: absolute;
  inset: 0;
  background: #d1e8d1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  image-rendering: auto;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.farm-card:hover .farm-bg {
  transform: scale(1.05);
}

.farm-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.08) 0%,
    rgba(0, 0, 0, 0.18) 40%,
    rgba(0, 0, 0, 0.62) 100%
  );
}

/* Empty state */
.farm-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f0f7f0;
  border: 2px dashed #a5d6a7;
  border-radius: 14px;
}

.farm-empty p {
  font-size: 12.5px;
  color: #4caf50;
  font-weight: 500;
}

.farm-empty span {
  font-size: 11px;
  color: #9ca3af;
}

.upload-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fff;
  border: 1.5px dashed #a5d6a7;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating content */
.farm-content {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.farm-badge-float {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 20px;
  width: fit-content;
  margin-bottom: 4px;
}

.farm-badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #69f0ae;
}

.farm-name-float {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.farm-loc-float {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Change photo btn */
.change-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: none;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 7px;
  padding: 5px 11px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}

.farm-card:hover .change-btn {
  display: block;
}

.change-btn:hover {
  background: rgba(0, 0, 0, 0.55);
}
</style>