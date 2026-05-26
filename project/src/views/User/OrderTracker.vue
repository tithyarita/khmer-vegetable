<template>
  <div class="dashboard-layout">
    <DashboardSidebar activeMenu="track" @navigate="onNavigate" />
    <main class="main-content">
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

          </div>

          <!-- Actions -->
          <div class="card actions-card">
            <button class="action-btn action-btn--primary" @click="$router.push('/myorder')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to My Orders
            </button>
            <button class="action-btn action-btn--secondary" @click="contactSupport">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.574 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import DashboardSidebar from '../../components/Customer/sidebarUser.vue'
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderTrackerStore } from '../../stores/orderTrackerStore'

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
// ── Fixed Phnom Penh coordinates ──────────────────────────────────────────────
// Default coordinates (will be overridden by store data)
let FARM_COORDS = [11.4700, 104.8800]
let DEST_COORDS = [11.5564, 104.9282]

// ── Map refs & state ──────────────────────────────────────────────────────────
const mapEl       = ref(null)
const mapStatus   = ref('locating') 
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

function contactSupport() {
  alert('Contacting support for order #' + orderTrackerStore.currentOrder?.id)
}

// ── Store and state setup ────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const orderTrackerStore = useOrderTrackerStore()

function onNavigate(section) {
  if (section === 'dashboard') router.push('/profile')
  else if (section === 'orders') router.push('/myorder')
}

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
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  width: 100%;
  background: #f7f9fa;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px 48px;
  min-width: 0;
}
.dashboard-layout :deep(.sidebar) {
  background: #fff;
}
.sep { color: #c8d5cc; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 20px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a2e1a;
  margin: 0;
}
.page-subtitle { margin-top: 4px; font-size: 15px; color: #5a7060; margin: 0; }
.page-subtitle strong { color: #2d6a4f; font-weight: 600; }

.arrival-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e8f5ee;
  border-radius: 50px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 14px;
  color: #2d6a4f;
  white-space: nowrap;
}
.arrival-badge__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #2d6a4f;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}
.col-left, .col-right { display: flex; flex-direction: column; gap: 18px; }

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.stepper-card { padding: 24px; }
.stepper { display: flex; align-items: center; }
.stepper__item { display: flex; align-items: center; flex: 1; }
.stepper__item:last-child { flex: 0; }
.step { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }

.step__icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.step__icon :deep(svg) { width: 20px; height: 20px; }

.step.done .step__icon {
  background: #2d6a4f;
}
.step.done .step__icon :deep(svg) { stroke: white; }

.step.active .step__icon {
  background: #40916c;
  animation: icon-pulse 2s ease-in-out infinite;
}
.step.active .step__icon :deep(svg) { stroke: white; }
@keyframes icon-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(45,106,79,.3); }
  50% { box-shadow: 0 0 0 8px rgba(45,106,79,.1); }
}

.step.pending .step__icon {
  background: #ede8e0;
  border: 2px dashed #c8d5cc;
}
.step.pending .step__icon :deep(svg) { stroke: #a0b0a8; }

.step__label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: #4a5e52; }
.step.pending .step__label { color: #a0b0a8; }

.step__time { font-size: 11px; color: #8fa896; margin-top: 2px; }

.connector { flex: 1; height: 2px; margin-bottom: 28px; }
.connector.done { background: #2d6a4f; }
.connector.pending { background: #ede8e0; }
.connector.half { background: linear-gradient(90deg, #2d6a4f 55%, #ede8e0 55%); }

.map-card { position: relative; height: 320px; }
.map-el { width: 100%; height: 100%; border-radius: 12px; }

:deep(.leaflet-popup-content-wrapper) { border-radius: 10px; font-size: 13px; }
:deep(.leaflet-popup-tip) { background: white; }
:deep(.leaflet-control-attribution) { font-size: 10px; }

.map-status {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,.92);
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
  pointer-events: none;
}
.map-status__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.map-status--locating .map-status__dot { background: #f59e0b; }
.map-status--live .map-status__dot { background: #2d6a4f; }
.map-status--denied .map-status__dot { background: #a0b0a8; }

.chat-btn {
  position: absolute;
  right: 12px; bottom: 12px;
  z-index: 500;
  background: #1a3d2b;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 10px 18px;
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(26,61,43,.35);
  transition: background .2s;
}
.chat-btn:hover { background: #2d6a4f; }
.chat-btn :deep(svg) { width: 14px; height: 14px; stroke: white; }

.detail-card { padding: 20px; }
.section-title { font-size: 16px; font-weight: 700; color: #1a2e1a; margin-bottom: 14px; }
.detail-list { display: flex; flex-direction: column; }
.detail-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #ede8e0;
}
.detail-row:first-child { padding-top: 0; }
.detail-row:last-child { border-bottom: none; padding-bottom: 0; }
.detail-row__icon {
  width: 36px; height: 36px;
  background: #e8f5ee;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.detail-row__icon :deep(svg) { width: 16px; height: 16px; stroke: #2d6a4f; }
.detail-row__body { display: flex; flex-direction: column; gap: 2px; }
.detail-row__label { font-size: 10px; color: #8fa896; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.detail-row__value { font-weight: 600; font-size: 14px; color: #1a2e1a; }
.detail-row__sub { font-size: 12px; color: #8fa896; }

.basket-card { padding: 18px; }
.basket-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.basket-header .section-title { margin-bottom: 0; }
.basket-count {
  font-size: 12px; font-weight: 600;
  color: #2d6a4f;
  background: #e8f5ee;
  padding: 3px 8px; border-radius: 18px;
}
.basket-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #ede8e0;
}
.basket-item:last-of-type { border-bottom: none; }
.basket-item__img {
  width: 44px; height: 44px; border-radius: 10px;
  background: #e8f5ee;
  flex-shrink: 0; overflow: hidden;
}
.basket-item__img img { width: 100%; height: 100%; object-fit: cover; }
.basket-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.basket-item__name { font-weight: 600; font-size: 14px; color: #1a2e1a; }
.basket-item__sub { font-size: 12px; color: #8fa896; }
.basket-item__price { font-weight: 700; font-size: 14px; color: #2d6a4f; }

.totals {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid #ede8e0;
  display: flex; flex-direction: column; gap: 6px;
}
.totals__row { display: flex; justify-content: space-between; font-size: 13px; color: #8fa896; }
.totals__row--grand {
  font-size: 17px; font-weight: 700;
  color: #1a2e1a;
  padding-top: 8px; margin-top: 4px;
  border-top: 2px solid #e8f5ee;
}
.totals__grand-price { color: #2d6a4f; }

.actions-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.action-btn--primary { background: #1a3d2b; color: #fff; }
.action-btn--primary:hover { background: #2d6a4f; }
.action-btn--secondary { background: transparent; color: #5a7060; border: 1.5px solid #ede8e0; }
.action-btn--secondary:hover { background: #e8f5ee; border-color: #74c69d; color: #1a3d2b; }
.action-btn svg { flex-shrink: 0; }

@media (max-width: 1100px) {
  .grid { grid-template-columns: 1fr 280px; gap: 16px; }
}
@media (max-width: 768px) {
  .main-content { padding: 20px 16px 32px; }
  .breadcrumb { font-size: 11px; margin-bottom: 12px; }
  .page-title { font-size: 22px; }
  .page-header { flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .grid { grid-template-columns: 1fr; gap: 16px; }
  .map-card { height: 220px; }
  .stepper-card { padding: 14px; }
  .detail-card { padding: 14px; }
  .basket-card { padding: 12px; }
}
@media (max-width: 480px) {
  .main-content { padding: 14px 12px 24px; }
  .page-title { font-size: 20px; }
  .stepper-card { padding: 12px; }
}
</style>