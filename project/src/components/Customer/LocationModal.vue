<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Choose your location</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="add-location-section">
            <div class="section-title">Add a new address</div>
            <div class="add-row">
              <input v-model="newLocationName" placeholder="Label (e.g. Home, Office)" @keyup.enter="addNewLocation" />
              <div class="address-row">
                <input v-model="newLocationAddress" placeholder="Street, city, district..." @keyup.enter="addNewLocation" />
                <button class="map-btn" @click="openMap" title="Pick on map">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </button>
              </div>
              <div v-if="showMap" ref="mapEl" class="map-picker"></div>
              <button v-if="showMap && pickedAddress" class="confirm-map-btn" @click="confirmMap">Use this location</button>
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
import { ref, nextTick, onUnmounted } from 'vue'
import { useLocationStore } from '@/stores/locationStore'

const emit = defineEmits(['close', 'location-set'])
const locationStore = useLocationStore()

const newLocationName = ref('')
const newLocationAddress = ref('')
const showMap = ref(false)
const mapEl = ref(null)
const pickedAddress = ref('')
const pickedCoords = ref(null)
let mapInstance = null
let mapMarker = null

onUnmounted(() => {
  if (mapInstance) mapInstance.remove()
})

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    js.onload = resolve
    document.head.appendChild(js)
  })
}

async function openMap() {
  showMap.value = true
  pickedAddress.value = ''
  pickedCoords.value = null
  await nextTick()
  await loadLeaflet()
  const L = window.L
  if (mapInstance) mapInstance.remove()
  mapInstance = L.map(mapEl.value, { zoomControl: true }).setView([11.5564, 104.9282], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapInstance)
  mapInstance.on('click', onMapClick)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        mapInstance.setView([latitude, longitude], 15)
        placeMarker(latitude, longitude)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 7000 }
    )
  }
}

function onMapClick(e) {
  placeMarker(e.latlng.lat, e.latlng.lng)
}

function placeMarker(lat, lng) {
  const L = window.L
  pickedCoords.value = { latitude: lat, longitude: lng }
  if (mapMarker) mapMarker.setLatLng([lat, lng])
  else {
    mapMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance)
    mapMarker.on('dragend', () => {
      const pos = mapMarker.getLatLng()
      pickedCoords.value = { latitude: pos.lat, longitude: pos.lng }
      reverseGeocode(pos.lat, pos.lng)
    })
  }
  reverseGeocode(lat, lng)
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await res.json()
    if (data.display_name) {
      const parts = data.display_name.split(', ')
      pickedAddress.value = parts.slice(0, -1).slice(-3).join(', ')
    }
  } catch {
    pickedAddress.value = 'Address unavailable'
  }
}

function confirmMap() {
  if (pickedAddress.value) newLocationAddress.value = pickedAddress.value
  showMap.value = false
  if (mapInstance) { mapInstance.remove(); mapInstance = null; mapMarker = null }
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

.address-row {
  display: flex;
  gap: 6px;
}

.address-row input {
  flex: 1;
}

.map-btn {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #2D7A3A;
  border-radius: 6px;
  background: #fff;
  color: #2D7A3A;
  cursor: pointer;
}

.map-btn:hover { background: #f0f9f2; }

.map-picker {
  height: 200px;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.confirm-map-btn {
  background: #2D7A3A;
  color: #fff;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-map-btn:hover { background: #1a5c27; }

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
