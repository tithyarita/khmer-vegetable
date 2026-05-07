<template>
<NavigationBar />
  <div class="app">
    <!-- Topbar -->
    <nav class="topbar">
      <span class="topbar__crumb">Orders</span>
      <span class="topbar__sep">›</span>
      <span class="topbar__id">#{{ orderTrackerStore.currentOrder?.id }}</span>
    </nav>

    <main class="page">
      <header class="page-header" v-if="orderTrackerStore.currentOrder">
        <div>
          <h1 class="page-title">Track Your Freshness</h1>
          <p class="page-subtitle">
            Order <strong>#{{ orderTrackerStore.currentOrder.id }}</strong> is on its way to your kitchen.
          </p>
        </div>
        <div class="arrival-badge">
          <span class="arrival-badge__dot" />
          {{ orderTrackerStore.currentOrder.arrivalTime }}
        </div>
      </header>

      <div class="grid">
        <!-- LEFT -->
        <div class="col-left">

          <!-- Stepper -->
          <div class="card stepper-card">
            <div class="stepper">
              <div
                v-for="(step, i) in orderTrackerStore.currentOrder?.steps || []"
                :key="step.label"
                class="stepper__item"
              >
                <div :class="['step', step.state]">
                  <div class="step__icon">
                    <component :is="getIconComponent(step.icon)" />
                  </div>
                  <span class="step__label">{{ step.label }}</span>
                  <span class="step__time">{{ step.time }}</span>
                </div>
                <div
                  v-if="i < (orderTrackerStore.currentOrder?.steps.length || 0) - 1"
                  :class="['connector', connectorState(i)]"
                />
              </div>
            </div>
          </div>

          <!-- Real Leaflet Map -->
          <div class="card map-card">
            <div ref="mapEl" class="map-el" />

            <!-- Status pill -->
            <div class="map-status" :class="mapStatusClass">
              <span class="map-status__dot" />
              {{ mapStatusText }}
            </div>

            <!-- Chat button -->
            <button class="chat-btn">
              <IconSend />
              Chat with Rider
            </button>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="col-right">

          <!-- Delivery details -->
          <div class="card detail-card">
            <h2 class="section-title">Delivery Details</h2>
            <div class="detail-list">
              <div class="detail-row" v-for="d in orderTrackerStore.currentOrder?.details || []" :key="d.label">
                <div class="detail-row__icon">
                  <component :is="getIconComponent(d.icon)" />
                </div>
                <div class="detail-row__body">
                  <span class="detail-row__label">{{ d.label }}</span>
                  <span class="detail-row__value">{{ d.value }}</span>
                  <span class="detail-row__sub" v-html="d.sub" />
                </div>
              </div>
            </div>
          </div>

          <!-- Basket -->
          <div class="card basket-card">
            <div class="basket-header">
              <h2 class="section-title">Your Basket</h2>
              <span class="basket-count">{{ (orderTrackerStore.currentOrder?.items || []).length }} Items</span>
            </div>

            <div
              v-for="(item, i) in orderTrackerStore.currentOrder?.items || []"
              :key="item.name"
              class="basket-item"
              :style="{ animationDelay: `${i * 0.08}s` }"
            >
              <div class="basket-item__img">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="basket-item__info">
                <span class="basket-item__name">{{ item.name }}</span>
                <span class="basket-item__sub">{{ item.weight }} · {{ item.tag }}</span>
              </div>
              <span class="basket-item__price">${{ item.price.toFixed(2) }}</span>
            </div>

            <div class="totals">
              <div class="totals__row">
                <span>Subtotal</span><span>${{ orderTrackerStore.subtotal.toFixed(2) }}</span>
              </div>
              <div class="totals__row">
                <span>Delivery Fee</span><span>${{ (orderTrackerStore.currentOrder?.deliveryFee || 0).toFixed(2) }}</span>
              </div>
              <div class="totals__row totals__row--grand">
                <span>Total</span>
                <span class="totals__grand-price">${{ orderTrackerStore.total.toFixed(2) }}</span>
              </div>
            </div>

            <button class="download-btn">
              <IconDownload />
              Download Receipt
            </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavigationBar from '@/components/Customer/NavigationBar.vue'
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderTrackerStore } from '@/stores/orderTrackerStore'

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IconCheck = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '20 6 9 17 4 12' })
  ])
})
const IconTruck = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '1', y: '3', width: '15', height: '13' }),
    h('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
    h('circle', { cx: '5.5', cy: '18.5', r: '2.5' }),
    h('circle', { cx: '18.5', cy: '18.5', r: '2.5' }),
  ])
})
const IconGift = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '20 12 20 22 4 22 4 12' }),
    h('rect', { x: '2', y: '7', width: '20', height: '5' }),
    h('line', { x1: '12', y1: '22', x2: '12', y2: '7' }),
    h('path', { d: 'M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z' }),
    h('path', { d: 'M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' }),
  ])
})
const IconSend = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '22', y1: '2', x2: '11', y2: '13' }),
    h('polygon', { points: '22 2 15 22 11 13 2 9 22 2' }),
  ])
})
const IconUser = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ])
})
const IconBox = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '21 8 21 21 3 21 3 8' }),
    h('rect', { x: '1', y: '3', width: '22', height: '5' }),
    h('line', { x1: '10', y1: '12', x2: '14', y2: '12' }),
  ])
})
const IconDownload = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' }),
    h('polyline', { points: '7 10 12 15 17 10' }),
    h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
  ])
})

// ── Fixed Phnom Penh coordinates ──────────────────────────────────────────────
// Default coordinates (will be overridden by store data)
let FARM_COORDS = [11.4700, 104.8800]
let DEST_COORDS = [11.5564, 104.9282]

// ── Map refs & state ──────────────────────────────────────────────────────────
const mapEl       = ref(null)
const mapStatus   = ref('locating') // 'locating' | 'live' | 'denied'
let leafletMap    = null
let riderMarker   = null
let riderTimer    = null

const mapStatusText = computed(() => ({
  locating: 'Getting your location…',
  live:     'Live — your location detected',
  denied:   'Showing delivery route',
}[mapStatus.value]))

const mapStatusClass = computed(() => ({
  locating: 'map-status--locating',
  live:     'map-status--live',
  denied:   'map-status--denied',
}[mapStatus.value]))

// ── Icon factory ──────────────────────────────────────────────────────────────
function emojiIcon(emoji, bg) {
  const L = window.L
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};width:44px;height:44px;border-radius:50%;
      border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.22);
      display:flex;align-items:center;justify-content:center;font-size:20px;
    ">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  })
}

function riderIcon() {
  const L = window.L
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2d6a4f" width="32" height="32">
    <path d="M8 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9-14H1v2h15V2zm6 6h-6v13c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-5h-2v-8z" />
  </svg>`
  
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#2d6a4f;width:50px;height:50px;border-radius:50%;
      border:3px solid #fff;box-shadow:0 4px 18px rgba(45,106,79,.55);
      display:flex;align-items:center;justify-content:center;
    ">${svgIcon}</div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -30],
  })
}

// ── Build map ─────────────────────────────────────────────────────────────────
function buildMap(userCoords) {
  const L = window.L

  // Centre between farm and dest
  const midLat = (FARM_COORDS[0] + DEST_COORDS[0]) / 2
  const midLng = (FARM_COORDS[1] + DEST_COORDS[1]) / 2

  leafletMap = L.map(mapEl.value, { zoomControl: true })
    .setView([midLat, midLng], 12)

  // OSM tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(leafletMap)

  // Dashed route line: farm → dest
  L.polyline([FARM_COORDS, DEST_COORDS], {
    color: '#40916c',
    weight: 3,
    opacity: 0.75,
    dashArray: '10 7',
  }).addTo(leafletMap)

  // Animated rider along route
  riderMarker = L.marker(FARM_COORDS, { icon: riderIcon() })
    .addTo(leafletMap)
    .bindPopup(`<b>${orderTrackerStore.currentOrder?.riderName || 'Rider'} — On the Way!</b><br>Your order is almost there.`)

  let progress = 0.3 // start mid-route
  riderTimer = setInterval(() => {
    progress = (progress + 0.0015) % 1
    const lat = FARM_COORDS[0] + (DEST_COORDS[0] - FARM_COORDS[0]) * progress
    const lng = FARM_COORDS[1] + (DEST_COORDS[1] - FARM_COORDS[1]) * progress
    riderMarker.setLatLng([lat, lng])
  }, 50)

  // Fit all visible points
  const bounds = userCoords
    ? [FARM_COORDS, DEST_COORDS, userCoords]
    : [FARM_COORDS, DEST_COORDS]
  leafletMap.fitBounds(window.L.latLngBounds(bounds), { padding: [36, 36] })
}

// ── Lazy-load Leaflet then init ───────────────────────────────────────────────
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return }

    const css = document.createElement('link')
    css.rel  = 'stylesheet'
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(css)

    const js = document.createElement('script')
    js.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    js.onload = resolve
    document.head.appendChild(js)
  })
}

onMounted(async () => {
  // Get order ID from route params
  const route = useRoute()
  const orderId = route.params.id || 'EG-92841'

  // Fetch order data
  await orderTrackerStore.fetchOrder(orderId)

  // Update coordinates from store
  if (orderTrackerStore.currentOrder) {
    FARM_COORDS = orderTrackerStore.currentOrder.farmCoords
    DEST_COORDS = orderTrackerStore.currentOrder.destCoords
  }

  // Initialize map with order coordinates
  await loadLeaflet()

  if (!navigator.geolocation) {
    mapStatus.value = 'denied'
    buildMap(null)
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      mapStatus.value = 'live'
      buildMap([pos.coords.latitude, pos.coords.longitude])
    },
    () => {
      mapStatus.value = 'denied'
      buildMap(null)
    },
    { timeout: 7000, maximumAge: 60000, enableHighAccuracy: true }
  )
})

onUnmounted(() => {
  clearInterval(riderTimer)
  if (leafletMap) leafletMap.remove()
})

// ── Store and state setup ────────────────────────────────────────────────────
const route = useRoute()
const orderTrackerStore = useOrderTrackerStore()

// ── Helper function to get icon components ───────────────────────────────────
function getIconComponent(iconName) {
  const iconMap = {
    'check': IconCheck,
    'truck': IconTruck,
    'gift': IconGift,
    'user': IconUser,
    'box': IconBox,
  }
  return iconMap[iconName] || IconCheck
}

// ── Connector state based on store data ─────────────────────────────────────
const connectorState = (i) => {
  const steps = orderTrackerStore.currentOrder?.steps || []
  if (steps[i]?.state === 'done' && steps[i + 1]?.state === 'active') return 'half'
  if (steps[i]?.state === 'done') return 'done'
  return 'pending'
}
</script>

<style scoped>
/* ── Tokens ──────────────────────────────────────────────────────────────────*/
.app {
  --green-deep:   #1a3d2b;
  --green-mid:    #2d6a4f;
  --green-bright: #40916c;
  --green-light:  #74c69d;
  --green-pale:   #d8f3dc;
  --cream:        #f8f5f0;
  --sand:         #ede8e0;
  --text-dark:    #1c2b22;
  --text-mid:     #4a5e52;
  --text-soft:    #7a9080;
  --white:        #ffffff;
  --gold:         #e9a830;
  --radius:       16px;
  --shadow:       0 4px 24px rgba(26,61,43,.10);
  --shadow-lg:    0 8px 40px rgba(26,61,43,.13);

  font-family: 'DM Sans', sans-serif;
  color: var(--text-dark);
  background: var(--cream);
  min-height: 100vh;
}

/* ── Topbar ──────────────────────────────────────────────────────────────────*/
.topbar {
  background: var(--white);
  border-bottom: 1px solid var(--sand);
  padding: 12px 28px;
  font-size: 13px;
  color: var(--text-soft);
  display: flex;
  align-items: center;
  gap: 6px;
}
.topbar__sep { margin: 0 2px; }
.topbar__id  { color: var(--green-mid); font-weight: 600; }

/* ── Page ────────────────────────────────────────────────────────────────────*/
.page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

/* ── Header ──────────────────────────────────────────────────────────────────*/
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
}
.page-title {
  font-family: 'Fraunces', serif;
  font-size: 44px;
  font-weight: 700;
  color: var(--green-deep);
  letter-spacing: -1px;
  line-height: 1.1;
}
.page-subtitle { margin-top: 6px; font-size: 15px; color: var(--text-mid); }
.page-subtitle strong { color: var(--green-mid); font-weight: 600; }

.arrival-badge {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--white);
  border: 1.5px solid var(--green-pale);
  border-radius: 50px;
  padding: 11px 20px;
  font-weight: 600;
  font-size: 15px;
  color: var(--green-deep);
  box-shadow: var(--shadow);
  white-space: nowrap;
  animation: badge-pulse 2.5s ease-in-out infinite;
}
.arrival-badge__dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--green-bright);
  flex-shrink: 0;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(64,145,108,.20); }
  50%       { box-shadow: 0 0 0 7px rgba(64,145,108,.07); }
}
@keyframes badge-pulse {
  0%, 100% { box-shadow: var(--shadow); }
  50%       { box-shadow: 0 4px 30px rgba(64,145,108,.20); }
}

/* ── Grid ────────────────────────────────────────────────────────────────────*/
.grid {
  display: grid;
  grid-template-columns: 1fr minmax(260px, 320px);
  gap: 20px;
  align-items: start;
}
.col-left, .col-right { display: flex; flex-direction: column; gap: 18px; }

/* ── Card base ───────────────────────────────────────────────────────────────*/
.card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* ── Stepper ─────────────────────────────────────────────────────────────────*/
.stepper-card { padding: 24px 28px 22px; }
.stepper      { display: flex; align-items: center; }
.stepper__item { display: flex; align-items: center; flex: 1; }
.stepper__item:last-child { flex: 0; }
.step { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }

.step__icon {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}
.step__icon :deep(svg) { width: 22px; height: 22px; }

.step.done .step__icon {
  background: var(--green-bright);
  box-shadow: 0 4px 16px rgba(64,145,108,.30);
}
.step.done .step__icon :deep(svg) { stroke: white; }

.step.active .step__icon {
  background: var(--green-mid);
  box-shadow: 0 4px 20px rgba(45,106,79,.35);
  animation: icon-pulse 2s ease-in-out infinite;
}
.step.active .step__icon :deep(svg) { stroke: white; }
@keyframes icon-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(45,106,79,.35); }
  50%       { box-shadow: 0 6px 28px rgba(45,106,79,.55); }
}

.step.pending .step__icon {
  background: var(--sand);
  border: 2px dashed #c8d5cc;
}
.step.pending .step__icon :deep(svg) { stroke: #a0b0a8; }

.step__label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.step.done .step__label, .step.active .step__label { color: var(--green-mid); }
.step.pending .step__label { color: #a0b0a8; }

.step__time { font-size: 12px; color: var(--text-soft); margin-top: 3px; }
.step.active .step__time { color: var(--green-bright); font-family: 'Fraunces', serif; font-style: italic; }

.connector { flex: 1; height: 3px; margin-bottom: 32px; }
.connector.done    { background: var(--green-bright); }
.connector.pending { background: var(--sand); }
.connector.half    { background: linear-gradient(90deg, var(--green-bright) 55%, var(--sand) 55%); }

/* ── Map card ────────────────────────────────────────────────────────────────*/
.map-card { position: relative; height: 340px; }

.map-el {
  width: 100%;
  height: 100%;
  border-radius: var(--radius);
}

/* Leaflet popup tweaks */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}
:deep(.leaflet-popup-tip) { background: white; }
:deep(.leaflet-control-attribution) { font-size: 10px; }

/* Status pill */
.map-status {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  padding: 7px 14px;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 2px 12px rgba(0,0,0,.12);
  color: var(--text-dark);
  pointer-events: none;
}
.map-status__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.map-status--locating .map-status__dot { background: #f0a500; animation: dot-pulse 1s infinite; }
.map-status--live     .map-status__dot { background: var(--green-bright); animation: dot-pulse 2s infinite; }
.map-status--denied   .map-status__dot { background: #a0b0a8; }

/* Chat button */
.chat-btn {
  position: absolute;
  right: 14px; bottom: 14px;
  z-index: 500;
  background: var(--green-deep);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex; align-items: center; gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(26,61,43,.4);
  transition: background .2s, transform .2s, box-shadow .2s;
}
.chat-btn:hover {
  background: var(--green-mid);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(26,61,43,.5);
}
.chat-btn :deep(svg) { width: 15px; height: 15px; stroke: white; }

/* ── Detail card ─────────────────────────────────────────────────────────────*/
.detail-card { padding: 20px; }
.section-title {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600;
  color: var(--green-deep);
  margin-bottom: 14px;
}
.detail-list { display: flex; flex-direction: column; }
.detail-row {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 0; border-bottom: 1px solid var(--sand);
}
.detail-row:first-child { padding-top: 0; }
.detail-row:last-child  { border-bottom: none; padding-bottom: 0; }
.detail-row__icon {
  width: 40px; height: 40px;
  background: var(--green-pale);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.detail-row__icon :deep(svg) { width: 18px; height: 18px; stroke: var(--green-mid); }
.detail-row__body { display: flex; flex-direction: column; gap: 2px; }
.detail-row__label { font-size: 10px; color: var(--text-soft); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.detail-row__value { font-weight: 600; font-size: 15px; color: var(--text-dark); }
.detail-row__sub   { font-size: 12px; color: var(--text-soft); }

/* ── Basket ──────────────────────────────────────────────────────────────────*/
.basket-card { padding: 18px; }
.basket-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.basket-header .section-title { margin-bottom: 0; }
.basket-count {
  font-size: 12px; font-weight: 600;
  color: var(--green-bright);
  background: var(--green-pale);
  padding: 3px 8px; border-radius: 18px;
}
.basket-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--sand);
  animation: slide-in .4s ease both;
}
.basket-item:last-of-type { border-bottom: none; }
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
.basket-item__img {
  width: 46px; height: 46px; border-radius: 12px;
  background: var(--green-pale);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}

.basket-item__img img {
  width: 100%; height: 100%; object-fit: cover;
}
.basket-item__info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.basket-item__name { font-weight: 600; font-size: 14px; color: var(--text-dark); }
.basket-item__sub  { font-size: 12px; color: var(--text-soft); }
.basket-item__price { font-weight: 700; font-size: 15px; color: var(--green-mid); }

/* ── Totals ──────────────────────────────────────────────────────────────────*/
.totals {
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--sand);
  display: flex; flex-direction: column; gap: 8px;
}
.totals__row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-soft); }
.totals__row--grand {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 700;
  color: var(--green-deep);
  padding-top: 10px; margin-top: 4px;
  border-top: 2px solid var(--green-pale);
}
.totals__grand-price { color: var(--green-bright); }

/* ── Download ────────────────────────────────────────────────────────────────*/
.download-btn {
  width: 100%; margin-top: 14px;
  background: var(--sand);
  border: 1.5px solid #d0c8bc;
  border-radius: 12px; padding: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  color: var(--text-mid);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s, border-color .2s, color .2s;
}
.download-btn:hover {
  background: var(--green-pale);
  border-color: var(--green-light);
  color: var(--green-deep);
}
.download-btn :deep(svg) { width: 16px; height: 16px; stroke: currentColor; }

/* ── Responsive ──────────────────────────────────────────────────────────────*/
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .page { padding: 24px 20px 40px; }
  .topbar { padding: 12px 20px; }
  .page-title { font-size: 32px; }
  .page-header { flex-direction: column; gap: 16px; }
  .map-card { height: 300px; }
}
</style>