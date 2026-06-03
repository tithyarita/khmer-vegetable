<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Choose your location</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="current-location-section">
            <p class="section-desc">Set your location to see delivery options and product availability</p>
            <button class="detect-btn" @click="detectLocation" :disabled="detecting">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span v-if="detecting">Detecting...</span>
              <span v-else>Use current location</span>
            </button>
            <div v-if="currentLocation" class="detected-location">
              <span class="loc-name">{{ currentLocation }}</span>
              <button class="save-btn" @click="saveCurrentLocation">Save</button>
            </div>
          </div>

          <div class="divider"><span>or</span></div>

          <div class="add-location-section">
            <div class="section-title">Add a new address</div>
            <div class="add-row">
              <input v-model="newLocationName" placeholder="Label (e.g. Home, Office)" @keyup.enter="addNewLocation" />
              <input v-model="newLocationAddress" placeholder="Street, city, district..." @keyup.enter="addNewLocation" />
              <button class="add-btn" @click="addNewLocation" :disabled="!newLocationName.trim() || !newLocationAddress.trim()">
                Add address
              </button>
            </div>
          </div>

          <div class="saved-locations-section" v-if="locationStore.savedLocations.length">
            <div class="section-title">Saved addresses</div>
            <div
              v-for="loc in locationStore.savedLocations"
              :key="loc.id"
              class="saved-location-item"
              :class="{ active: locationStore.activeLocation?.id === loc.id }"
              @click="locationStore.setActiveLocation(loc)"
            >
              <div class="loc-info">
                <strong>{{ loc.name }}</strong>
                <span class="loc-address">{{ loc.address }}</span>
              </div>
              <div class="loc-actions">
                <span v-if="locationStore.activeLocation?.id === loc.id" class="active-badge">Active</span>
                <button class="remove-btn" @click.stop="locationStore.removeLocation(loc.id)" title="Remove">&times;</button>
              </div>
            </div>
          </div>

          <div v-if="!locationStore.savedLocations.length" class="empty-state">
            <p>No saved addresses yet</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useLocationStore } from '@/stores/locationStore'

const emit = defineEmits(['close', 'location-set'])
const locationStore = useLocationStore()

const detecting = ref(false)
const currentLocation = ref(null)
const currentCoords = ref(null)
const newLocationName = ref('')
const newLocationAddress = ref('')

function detectLocation() {
  if (detecting.value) return
  detecting.value = true
  currentLocation.value = null
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      currentCoords.value = { latitude, longitude }
      currentLocation.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      detecting.value = false
      reverseGeocode(latitude, longitude)
    },
    () => {
      currentLocation.value = 'Location unavailable'
      detecting.value = false
    },
    { enableHighAccuracy: true }
  )
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await res.json()
    if (data.display_name) {
      const parts = data.display_name.split(', ')
      currentLocation.value = parts.slice(0, 3).join(', ')
    }
  } catch {
    // keep coordinates
  }
}

function saveCurrentLocation() {
  if (!currentLocation.value) return
  const loc = {
    name: 'Current Location',
    address: currentLocation.value,
    coords: currentCoords.value,
  }
  locationStore.addLocation(loc)
  locationStore.setActiveLocation(loc)
  emit('location-set', loc)
}

function addNewLocation() {
  const name = newLocationName.value.trim()
  const address = newLocationAddress.value.trim()
  if (!name || !address) return
  const loc = { name, address, coords: null }
  locationStore.addLocation(loc)
  locationStore.setActiveLocation(loc)
  newLocationName.value = ''
  newLocationAddress.value = ''
  emit('location-set', loc)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  width: 440px;
  max-width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.close-btn:hover { color: #333; }

.modal-body {
  padding: 16px 20px 20px;
}

.section-desc {
  font-size: 13px;
  color: #777;
  margin: 0 0 12px;
}

.detect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1px solid #2D7A3A;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #2D7A3A;
}

.detect-btn:hover:not(:disabled) {
  background: #f0f9f2;
}

.detect-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.detected-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 10px 14px;
  background: #f0f9f2;
  border: 1px solid #d5e8da;
  border-radius: 8px;
}

.loc-name {
  font-size: 13px;
  color: #333;
}

.save-btn {
  background: #2D7A3A;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.save-btn:hover { background: #1a5c27; }

.divider {
  text-align: center;
  color: #bbb;
  font-size: 12px;
  margin: 14px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 44%;
  height: 1px;
  background: #eee;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.add-location-section {
  margin-bottom: 4px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.add-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-row input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.add-row input:focus {
  border-color: #2D7A3A;
}

.add-row input::placeholder {
  color: #bbb;
}

.add-btn {
  background: #2D7A3A;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:hover:not(:disabled) { background: #1a5c27; }
.add-btn:disabled { opacity: 0.4; cursor: default; }

.saved-locations-section {
  margin-top: 16px;
}

.saved-location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
}

.saved-location-item:hover {
  background: #f9fafb;
}

.saved-location-item.active {
  background: #f0f9f2;
  border-color: #2D7A3A;
}

.loc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loc-info strong {
  font-size: 13px;
  color: #222;
}

.loc-address {
  font-size: 12px;
  color: #999;
}

.loc-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-badge {
  font-size: 11px;
  color: #2D7A3A;
  background: #e0f0e4;
  padding: 2px 8px;
  border-radius: 4px;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #ccc;
  cursor: pointer;
  padding: 0 4px;
}

.remove-btn:hover { color: #e53e3e; }

.empty-state {
  text-align: center;
  padding: 24px 0 8px;
}

.empty-state p {
  font-size: 13px;
  color: #999;
  margin: 0;
}
</style>
