<template>
  <div class="dashboard-overview">

    <!-- ── 1. Summary Cards ── -->
    <div class="summary-row">
      <SummaryCard
        label="Total Active Users"
        value="12,482"
        icon="bi-person"
        trend="+8.4%"
        trendLabel="vs last month"
        :trendUp="true"
      />
      <SummaryCard
        label="Local Providers"
        value="418"
        icon="bi-shop"
        trend="+12.1%"
        trendLabel="vs last month"
        :trendUp="true"
      />
      <SummaryCard
        label="Monthly Orders"
        value="8,104"
        icon="bi-receipt"
        trend="+4.2%"
        trendLabel="vs last month"
        :trendUp="true"
      />
      <SummaryCard
        label="Net Revenue (MTD)"
        value="$142.6k"
        icon="bi-wallet2"
        trend="+18.5%"
        trendLabel="highest ever peak"
        :trendUp="true"
        :dark="true"
      />
    </div>

    <!-- ── 2. Mid row: Chart + Alerts/Partners ── -->
    <div class="mid-row">
      <!-- Market Vitality Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h2 class="chart-title">Market Vitality Overview</h2>
            <p class="chart-sub">Real-time tracking of orders vs revenue growth</p>
          </div>
          <div class="chart-tabs">
            <button
              v-for="tab in chartTabs"
              :key="tab"
              :class="['chart-tab', activeTab === tab && 'chart-tab--active']"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>
        </div>

        <!-- SVG chart (bar + line) -->
        <div class="chart-area">
          <svg viewBox="0 0 460 140" class="chart-svg" preserveAspectRatio="none">
            <!-- Background grid lines -->
            <line v-for="y in [30,70,110]" :key="y" :x1="0" :y1="y" x2="460" :y2="y"
              stroke="#f0f0f0" stroke-width="1" />

            <!-- Bars -->
            <rect v-for="(bar, i) in bars" :key="'b'+i"
              :x="bar.x" :y="140 - bar.h" :width="28" :height="bar.h"
              :fill="bar.highlight ? '#2d6a4f' : '#d1fae5'"
              rx="4"
            />

            <!-- Line -->
            <polyline
              :points="linePoints"
              fill="none"
              stroke="#2d6a4f"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Dots on line -->
            <circle v-for="(pt, i) in lineCoords" :key="'d'+i"
              :cx="pt.x" :cy="pt.y" r="3.5"
              fill="#2d6a4f" stroke="#fff" stroke-width="2"
            />

            <!-- X labels -->
            <text v-for="(bar, i) in bars" :key="'l'+i"
              :x="bar.x + 14" y="135" text-anchor="middle"
              font-size="7" fill="#9ca3af"
            >{{ bar.label }}</text>
          </svg>

          <!-- Axis labels -->
          <div class="chart-x-labels">
            <span>Orders frequency (weekly)</span>
            <span>Revenue Trajectory</span>
          </div>
        </div>
      </div>

      <!-- Right column: Critical Alerts + Partner Pulse -->
      <div class="right-col">

        <!-- Critical Alerts -->
        <div class="panel-card">
          <div class="panel-header">
            <h3 class="panel-title">Critical Alerts</h3>
            <span class="badge-new">2 NEW</span>
          </div>
          <div class="alert-list">
            <div v-for="alert in criticalAlerts" :key="alert.id" class="alert-item">
              <div class="alert-icon" :style="{ background: alert.iconBg }">
                <i :class="['bi', alert.icon]" :style="{ color: alert.iconColor }"></i>
              </div>
              <div class="alert-text">
                <p class="alert-title">{{ alert.title }}</p>
                <p class="alert-body">{{ alert.body }}</p>
                <a href="#" class="alert-link">{{ alert.cta }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Partner Pulse -->
        <div class="panel-card">
          <div class="panel-header">
            <h3 class="panel-title">Partner Pulse</h3>
            <a href="#" class="panel-link">VIEW ALL</a>
          </div>
          <div class="partner-list">
            <div v-for="partner in partners" :key="partner.id" class="partner-item">
              <div class="partner-logo">
                <i class="bi bi-shop"></i>
              </div>
              <div class="partner-info">
                <p class="partner-name">{{ partner.name }}</p>
                <p class="partner-sub">{{ partner.sub }}</p>
              </div>
              <span :class="['partner-badge', `partner-badge--${partner.status}`]">
                {{ partner.statusLabel }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── 3. Bottom row: Activity Stream + Orders Table ── -->
    <div class="bottom-row">

      <!-- Live Activity Stream -->
      <div class="activity-card">
        <h3 class="section-title">Live Activity Stream</h3>
        <div class="activity-list">
          <div v-for="(item, i) in activityItems" :key="i" class="activity-item">
            <div class="activity-dot" :style="{ background: item.color }"></div>
            <div class="activity-text">
              <p class="activity-msg">{{ item.message }}</p>
              <p class="activity-time">{{ item.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Latest Marketplace Orders -->
      <div class="orders-wrap">
        <OrdersTable
          title="Latest Marketplace Orders"
          :orders="recentOrders"
          :showExport="true"
          @export="onExport"
        />
      </div>
    </div>

    <!-- ── 4. Freshness + Console Tip ── -->
    <div class="bottom2-row">

      <!-- Market Freshness Index -->
      <div class="freshness-card">
        <h3 class="section-title">Market Freshness Index</h3>
        <p class="section-sub">Weighted average of inventory shelf life across all active providers in the local region.</p>
        <div class="freshness-list">
          <div v-for="item in freshnessItems" :key="item.label" class="freshness-row">
            <span class="freshness-label">{{ item.label }}</span>
            <div class="freshness-track">
              <div
                class="freshness-fill"
                :style="{ width: item.pct + '%', background: freshnessColor(item.pct) }"
              ></div>
            </div>
            <span class="freshness-pct">{{ item.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Console Tip -->
      <div class="tip-card">
        <div class="tip-header">
          <div class="tip-icon"><i class="bi bi-terminal"></i></div>
          <span class="tip-label">CONSOLE TIP</span>
        </div>
        <p class="tip-body">Optimize your morning provider reach-out.</p>
        <p class="tip-detail">
          Data suggests that reaching out to providers between 5 AM and 7 AM results in a 40% faster stock update response rate.
        </p>
        <button class="btn-schedule">Schedule Reminders</button>
      </div>

    </div>

    <!-- ── FAB: Add New Item ── -->
    <button class="fab">
      <i class="bi bi-plus-lg me-1"></i> Add New Item
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SummaryCard from '../../components/Admin/SummaryCard.vue'
import OrdersTable from '../../components/Admin/OrderTable.vue'

/* ── Chart ── */
const chartTabs = ['Daily', 'Weekly', 'Monthly']
const activeTab = ref('Weekly')

// Raw bar heights (0–120 range) and line y-coords
const rawBars = [40,55,30,70,90,48,80,110,65,45,75,55,95,70,50]
const bars = rawBars.map((h, i) => ({
  x: 8 + i * 31,
  h,
  label: ['M','T','W','T','F','S','S','M','T','W','T','F','S','S','S'][i] ?? '',
  highlight: i === 7,  // tallest bar darkened
}))

// Line roughly follows an upward trend
const lineRaw = [100,88,105,80,60,95,70,40,75,95,55,80,45,62,85]
const lineCoords = lineRaw.map((y, i) => ({ x: 22 + i * 31, y }))
const linePoints = computed(() =>
  lineCoords.map(p => `${p.x},${p.y}`).join(' ')
)

/* ── Critical Alerts ── */
const criticalAlerts = [
  {
    id: 1,
    icon: 'bi-person-check',
    iconBg: '#d1fae5',
    iconColor: '#065f46',
    title: 'New Provider Application',
    body: '"Oaktown Farms" is requesting to sell organic heirloom tomatoes.',
    cta: 'Review Application',
  },
  {
    id: 2,
    icon: 'bi-headset',
    iconBg: '#dbeafe',
    iconColor: '#1e40af',
    title: 'Support Request #8291',
    body: 'Customer cannot apply "FRND10" discount code in checkout.',
    cta: 'Respond',
  },
]

/* ── Partners ── */
const partners = [
  { id: 1, name: 'Sunvalley Organics', sub: 'Published 2 days ago', status: 'active',   statusLabel: 'ACTIVE' },
  { id: 2, name: 'Green Roots Ltd.',   sub: 'Published 4 days ago', status: 'inactive', statusLabel: 'INACTIVE' },
]

/* ── Activity Stream ── */
const activityItems = [
  { message: 'Sarah Jenkins placed a new order for Organic Costa Rica', time: 'Today at 14:22 PM', color: '#22c55e' },
  { message: 'New Provider Application received from Windy Hill Growers', time: 'Today at 12:05 PM', color: '#3b82f6' },
  { message: 'Stock alert: Brussels Sprouts dropped below 10kg threshold', time: 'Yesterday at 22:30 PM', color: '#f59e0b' },
]

/* ── Orders ── */
const recentOrders = [
  { id: '#ORD-28192', customerName: 'Sarah Jenkins',  price: 124.50, status: 'Delivered',  date: 'Today, 14:24' },
  { id: '#ORD-28188', customerName: 'Kevin Miller',   price: 42.00,  status: 'In Transit',  date: 'Today, 11:02' },
  { id: '#ORD-28185', customerName: 'Laura Palmer',   price: 18.90,  status: 'Pending',     date: 'Yesterday, 19:45' },
  { id: '#ORD-28182', customerName: 'Dale Cooper',    price: 215.10, status: 'Delivered',  date: 'Yesterday, 16:12' },
]

function onExport() {
  console.log('Export CSV triggered')
}

/* ── Freshness Index ── */
const freshnessItems = [
  { label: 'Root Vegetables', pct: 94 },
  { label: 'Leafy Greens',    pct: 76 },
  { label: 'Seasonal Fruit',  pct: 81 },
]
function freshnessColor(pct) {
  if (pct >= 85) return '#2d6a4f'
  if (pct >= 70) return '#16a34a'
  return '#f59e0b'
}
</script>

<style scoped>
/* ── Layout scaffolding ── */
.dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  padding-bottom: 70px;
}

/* ── 1. Summary row: equal-height cards ── */
.summary-row {
  display: flex;
  gap: 12px;
  align-items: stretch;  
}

/* ── 2. Mid row: chart + right panel SAME height ── */
.mid-row {
  display: flex;
  gap: 14px;
  align-items: stretch;   
}

.chart-card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  padding: 18px 20px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column; 
}
.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.chart-title { font-size: 14px; font-weight: 700; color: #111827; }
.chart-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.chart-tabs { display: flex; gap: 4px; }
.chart-tab {
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  background: #fff;
  cursor: pointer;
  transition: background .12s, color .12s, border-color .12s;
}
.chart-tab:hover { border-color: #2d6a4f; color: #2d6a4f; }
.chart-tab--active { background: #1a3d2a; color: #fff; border-color: #1a3d2a; }

/* Chart area takes all remaining vertical space */
.chart-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chart-svg {
  flex: 1;         
  width: 100%;
  display: block;
  min-height: 120px;
}
.chart-x-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: #9ca3af;
  margin-top: 6px;
  padding: 0 4px;
  flex-shrink: 0;
}


.right-col {
  width: 230px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.panel-card {
  flex: 1;           
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.panel-title { font-size: 13px; font-weight: 700; color: #111827; }
.panel-link  { font-size: 9.5px; font-weight: 700; color: #2d6a4f; letter-spacing: .4px; }
.badge-new   {
  font-size: 9px; font-weight: 800; letter-spacing: .4px;
  background: #fee2e2; color: #991b1b; border-radius: 4px; padding: 2px 6px;
}


.alert-list  { display: flex; flex-direction: column; gap: 14px; }
.alert-item  { display: flex; gap: 10px; }
.alert-icon  {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.alert-title { font-size: 11.5px; font-weight: 700; color: #111827; line-height: 1.2; }
.alert-body  { font-size: 10.5px; color: #6b7280; margin-top: 3px; line-height: 1.4; }
.alert-link  { font-size: 10px; font-weight: 700; color: #2d6a4f; margin-top: 4px; display: inline-block; }

.partner-list  { display: flex; flex-direction: column; gap: 12px; }
.partner-item  { display: flex; align-items: center; gap: 10px; }
.partner-logo  {
  width: 32px; height: 32px; border-radius: 7px;
  background: #d1fae5; display: flex; align-items: center;
  justify-content: center; font-size: 14px; color: #065f46;
  flex-shrink: 0;
}
.partner-name   { font-size: 11.5px; font-weight: 600; color: #111827; }
.partner-sub    { font-size: 10px; color: #9ca3af; margin-top: 1px; }
.partner-badge  {
  margin-left: auto;
  font-size: 9px; font-weight: 800; letter-spacing: .4px;
  border-radius: 4px; padding: 2px 7px;
}
.partner-badge--active   { background: #d1fae5; color: #065f46; }
.partner-badge--inactive { background: #f3f4f6; color: #6b7280; }

.bottom-row {
  display: flex;
  gap: 14px;
  align-items: stretch;  
}

/* Activity stream */
.activity-card {
  width: 230px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 12px;
  flex: 1;
}
/* Evenly space activity items to fill card height */
.activity-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex: 1;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.activity-item:last-child { border-bottom: none; padding-bottom: 0; }
.activity-dot  {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; margin-top: 4px;
}
.activity-msg  { font-size: 11.5px; color: #111827; line-height: 1.4; font-weight: 500; }
.activity-time { font-size: 10px; color: #9ca3af; margin-top: 3px; }

.orders-wrap { flex: 1; min-width: 0; }

.bottom2-row {
  display: flex;
  gap: 14px;
  align-items: stretch;   
}

.freshness-card {
  flex: 1;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
}
.freshness-list {
  display: flex;
  flex-direction: column;
  justify-content: space-around;   
  flex: 1;
  margin-top: 16px;
  gap: 12px;
}
.freshness-row  { display: flex; align-items: center; gap: 12px; }
.freshness-label { font-size: 11.5px; font-weight: 600; color: #374151; min-width: 120px; }
.freshness-track {
  flex: 1; height: 7px; background: #e5e7eb; border-radius: 99px; overflow: hidden;
}
.freshness-fill  { height: 100%; border-radius: 99px; transition: width .4s ease; }
.freshness-pct   { font-size: 11.5px; font-weight: 700; color: #374151; min-width: 36px; text-align: right; }

.tip-card {
  width: 230px;
  flex-shrink: 0;
  background: #1a3d2a;
  border-radius: 14px;
  padding: 20px 22px 22px;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.tip-icon   {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
}
.tip-label  { font-size: 9px; font-weight: 800; letter-spacing: .6px; color: #a8c8b0; }
.tip-body   { font-size: 15px; font-weight: 800; line-height: 1.3; margin-bottom: 10px; }
.tip-detail { font-size: 11px; color: #a8c8b0; line-height: 1.5; flex: 1; }
.btn-schedule {
  background: rgba(255,255,255,.14);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,.25);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  transition: background .15s;
}
.btn-schedule:hover { background: rgba(255,255,255,.22); }

.section-title { font-size: 13.5px; font-weight: 700; color: #111827; flex-shrink: 0; }
.section-sub   { font-size: 11px; color: #9ca3af; margin-top: 3px; flex-shrink: 0; }

.fab {
  position: fixed;
  bottom: 24px;
  right: 28px;
  background: #1a3d2a;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 11px 22px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,.25);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background .15s, box-shadow .15s;
  z-index: 100;
}
.fab:hover { background: #2d6a4f; box-shadow: 0 6px 20px rgba(0,0,0,.3); }
</style>