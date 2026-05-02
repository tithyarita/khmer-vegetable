<template>
  <div class="reports-page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports &amp; Analytics</h1>
        <p class="page-sub">Monitor system performance and business insights.</p>
      </div>
      <div class="header-actions">
        <button class="btn-export">
          <i class="bi bi-download me-1"></i> Export PDF
        </button>
        <button class="btn-csv">
          <i class="bi bi-file-earmark-spreadsheet me-1"></i> Full Report CSV
        </button>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="period-tabs">
        <button
          v-for="tab in periodTabs" :key="tab"
          :class="['period-tab', activePeriod === tab && 'period-tab--active']"
          @click="activePeriod = tab"
        >{{ tab }}</button>
      </div>

      <div class="filter-selects">
        <select class="filter-select">
          <option>All Providers</option>
          <option>Green Valley Farms</option>
          <option>Khmer Roots Collective</option>
          <option>Mekong Organic Hub</option>
        </select>
        <select class="filter-select">
          <option>Filter Category</option>
          <option>Vegetables</option>
          <option>Fruits</option>
          <option>Dairy</option>
          <option>Herbs</option>
        </select>
      </div>
    </div>

    <!-- ── 1. Summary metric cards ── -->
    <div class="metrics-row">
      <ReportMetricCard
        label="Total Revenue"
        value="$42,850"
        trend="+7.1%"
        trendLabel="vs last period"
        :trendUp="true"
      />
      <ReportMetricCard
        label="Total Orders"
        value="1,284"
        trend="+8.4%"
        trendLabel="vs last period"
        :trendUp="true"
        :showBars="true"
      />
      <ReportMetricCard
        label="Total Users"
        value="8,421"
        trend="Target 1%"
        trendLabel=""
        :trendUp="true"
        :showPeople="true"
        extraInfo="On Track"
        extraType="neutral"
      />
      <ReportMetricCard
        label="Total Providers"
        value="146"
        trend="+2"
        trendLabel="this period"
        :trendUp="true"
        :showProviders="true"
        extraInfo="2 Pending"
        extraType="warning"
      />
    </div>

    <!-- ── 2. Charts row ── -->
    <div class="charts-row">
      <div class="chart-left">
        <RevenueTrendChart />
      </div>
      <div class="chart-right">
        <OrderDistributionChart />
      </div>
    </div>

    <!-- ── 3. Providers + Trending Produce ── -->
    <div class="mid-row">
      <EliteProvidersList />

      <!-- Trending Produce -->
      <div class="trending-card">
        <div class="card-header">
          <h3 class="card-title">Trending Produce</h3>
          <a href="#" class="card-link">Full Inventory</a>
        </div>
        <div class="trending-items">
          <div v-for="item in trendingProduce" :key="item.id" class="trending-item">
            <div class="produce-img" :style="{ background: item.bg }">
              <i :class="['bi', item.icon]"></i>
            </div>
            <div class="produce-info">
              <p class="produce-name">{{ item.name }}</p>
              <p class="produce-sub">{{ item.sales }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4. Recent Orders Snapshot ── -->
    <RecentOrdersSnapshot />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReportMetricCard      from '../../components/Admin/Reportmetriccard.vue'
import RevenueTrendChart     from '../../components/Admin/Revenuetrendchart.vue'
import OrderDistributionChart from '../../components/Admin/Orderdistributionchart.vue'
import EliteProvidersList    from '../../components/Admin/Eliteproviderslist.vue'
import RecentOrdersSnapshot  from '../../components/Admin/Recentorderssnapshot.vue'

const periodTabs  = ['Daily', 'Weekly', 'Monthly', 'Custom']
const activePeriod = ref('Monthly')

const trendingProduce = [
  { id: 1, name: 'Organic Bok Choy',   sales: '470kg sold this week', icon: 'bi-leaf',      bg: '#d1fae5' },
  { id: 2, name: 'Heirloom Tomatoes',  sales: '115kg sold this week', icon: 'bi-circle-fill',bg: '#fee2e2' },
]
</script>

<style scoped>
/* ── Page wrapper ── */
.reports-page { display: flex; flex-direction: column; gap: 18px; }

/* Header */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
}
.page-title {
  font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -.4px;
}
.page-sub { font-size: 12.5px; color: #6b7280; margin-top: 4px; }

.header-actions { display: flex; gap: 10px; }
.btn-export {
  display: flex; align-items: center; gap: 4px;
  padding: 9px 16px; border: 1.5px solid #e5e7eb;
  border-radius: 9px; background: #fff;
  font-size: 12.5px; font-weight: 700; color: #374151;
  cursor: pointer; transition: background .12s;
}
.btn-export:hover { background: #f3f4f6; }
.btn-csv {
  display: flex; align-items: center; gap: 4px;
  padding: 9px 16px; border: none; border-radius: 9px;
  background: #1a3d2a; color: #fff;
  font-size: 12.5px; font-weight: 700;
  cursor: pointer; transition: background .12s;
}
.btn-csv:hover { background: #2d6a4f; }

/* Filter bar */
.filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.period-tabs { display: flex; gap: 2px; }
.period-tab {
  padding: 6px 14px; border: 1px solid #e5e7eb;
  border-radius: 6px; background: #fff;
  font-size: 12px; font-weight: 600; color: #6b7280;
  cursor: pointer; transition: background .12s, color .12s;
}
.period-tab:hover { border-color: #2d6a4f; color: #2d6a4f; }
.period-tab--active { background: #1a3d2a; border-color: #1a3d2a; color: #fff; }

.filter-selects { display: flex; gap: 8px; margin-left: 8px; }
.filter-select {
  height: 34px; border: 1px solid #e5e7eb; border-radius: 7px;
  padding: 0 10px; font-size: 12px; color: #374151;
  background: #f9fafb; outline: none; cursor: pointer;
}

/* ── 1. Metrics row ── */
.metrics-row {
  display: flex; gap: 12px; align-items: stretch;
}

/* ── 2. Charts row ── */
.charts-row {
  display: flex; 
  gap: 14px; 
  /* This ensures the containers (.chart-left/right) are the same height */
  align-items: stretch; 
}

.chart-left, .chart-right {
  display: flex;
  flex-direction: column;
}

/* Target the white card divs inside these containers */
.chart-left > div, 
.chart-right > div {
  flex: 1; /* This forces the cards to stretch vertically to match the tallest one */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.chart-left { flex: 1; min-width: 0; }
.chart-right { width: 240px; flex-shrink: 0; }

/* ── 3. Mid row ── */
.mid-row {
  display: flex; gap: 14px; align-items: stretch;
}

/* Trending card */
.trending-card {
  width: 240px; flex-shrink: 0;
  background: #fff; border: 1px solid #eaeaea;
  border-radius: 14px; padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.card-title  { font-size: 14px; font-weight: 700; color: #111827; }
.card-link   { font-size: 11.5px; font-weight: 600; color: #2d6a4f; }

.trending-items { display: flex; flex-direction: column; gap: 12px; }
.trending-item  { display: flex; gap: 12px; align-items: center; }
.produce-img {
  width: 60px; height: 60px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.produce-name { font-size: 12.5px; font-weight: 700; color: #111827; }
.produce-sub  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
</style>