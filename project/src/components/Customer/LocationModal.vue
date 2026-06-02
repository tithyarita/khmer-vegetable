<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Your Location</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Detect current location -->
          <div class="current-location-section">
            <button class="detect-btn" @click="detectLocation" :disabled="detecting">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span v-if="detecting">Detecting...</span>
              <span v-else>Detect current location</span>
            </button>
            <div v-if="currentLocation" class="detected-location">
              <span class="loc-name">{{ currentLocation }}</span>
              <button class="save-btn" @click="saveCurrentLocation">Save</button>
            </div>
          </div>

          <!-- Add new location manually -->
          <div class="add-location-section">
            <div class="section-title">Add new location</div>
            <div class="add-row">
              <input v-model="newLocationName" placeholder="Location name (e.g. Home, Office)" @keyup.enter="addNewLocation" />
              <input v-model="newLocationAddress" placeholder="Address" @keyup.enter="addNewLocation" />
              <button class="add-btn" @click="addNewLocation">Add</button>
            </div>
          </div>

          <!-- Saved locations -->
          <div class="saved-locations-section" v-if="locationStore.savedLocations.length">
            <div class="section-title">Saved locations</div>
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
                <button class="remove-btn" @click.stop="locationStore.removeLocation(loc.id)">&times;</button>
              </div>
            </div>
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
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a2e1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
  padding: 0 4px;
}

.close-btn:hover { color: #333; }

.modal-body {
  padding: 16px 20px;
}

.detect-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  background: #fafaf8;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}

.detect-btn:hover:not(:disabled) {
  border-color: #2D7A3A;
  color: #2D7A3A;
  background: #e6f4ea;
}

.detect-btn:disabled { opacity: 0.6; cursor: default; }

.detected-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 14px;
  background: #e6f4ea;
  border-radius: 10px;
}

.loc-name {
  font-size: 13px;
  color: #1a2e1a;
  font-weight: 500;
}

.save-btn {
  background: #2D7A3A;
  color: #fff;
  border: none;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn:hover { background: #1a5c27; }

.add-location-section {
  margin-top: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-row input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}

.add-row input:focus {
  border-color: #2D7A3A;
}

.add-btn {
  align-self: flex-end;
  background: #1a5c27;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
}

.add-btn:hover { background: #2D7A3A; }

.saved-locations-section {
  margin-top: 16px;
}

.saved-location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.saved-location-item:hover { background: #f6fbf7; }

.saved-location-item.active {
  background: #e6f4ea;
  border: 1px solid #2D7A3A;
}

.loc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loc-info strong {
  font-size: 13px;
  color: #1a2e1a;
}

.loc-address {
  font-size: 11px;
  color: #888;
}

.loc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-badge {
  font-size: 10px;
  font-weight: 600;
  color: #2D7A3A;
  background: #d0ecda;
  padding: 2px 8px;
  border-radius: 10px;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #ccc;
  cursor: pointer;
  padding: 0 2px;
}

.remove-btn:hover { color: #e53e3e; }
</style>
