<template>
  <div class="dashboard">

    <!-- METRICS -->
    <div class="metrics">
      <SummaryCard label="Revenue" :value="money(summary.totalRevenue)" icon="bi-cash-stack" />
      <SummaryCard label="Profit" :value="money(summary.adminProfit)" icon="bi-graph-up" />
      <SummaryCard label="Orders" :value="summary.totalOrders" icon="bi-receipt" />
      <SummaryCard label="Providers" :value="summary.totalProviders" icon="bi-people" />
    </div>

    <!-- LIVE STATUS -->
    <div class="live">
      <span class="dot"></span>
      Live Dashboard
    </div>

    <!-- CONTENT -->
    <div class="main">

      <div class="panel">
        <h3>Provider Performance</h3>

        <div v-for="p in providerReports" :key="p.providerName" class="row">
          <strong>{{ p.providerName }}</strong>
          <span>{{ p.totalOrders }} orders</span>
          <span>{{ money(p.revenue) }}</span>
        </div>
      </div>

      <div class="panel">
        <OrdersTable
          title="Recent Orders"
          :orders="recentOrders"
        />
      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SummaryCard from '@/components/Admin/SummaryCard.vue'
import OrdersTable from '@/components/Admin/OrderTable.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const {
  summary,
  providerReports,
  recentOrders,
  initDashboard,
} = useAdminDashboard()

onMounted(() => {
  initDashboard()
})

function money(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(v || 0)
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.live {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #16a34a;
}

.dot {
  width: 8px;
  height: 8px;
  background: #16a34a;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.panel {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 14px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}
</style>