<template>
  <div class="snapshot-card">
    <div class="card-header">
      <div>
        <h3 class="card-title">Recent Orders Snapshot</h3>
        <p class="card-sub">Real-time performance tracking.</p>
      </div>
    </div>

    <!-- Column headings -->
    <div class="col-head">
      <span class="col col-id">Order ID</span>
      <span class="col col-prov">Provider</span>
      <span class="col col-vol">Volume</span>
      <span class="col col-price">Total Price</span>
      <span class="col col-fresh">Freshness</span>
      <span class="col col-status">Status</span>
    </div>

    <!-- Rows -->
    <div class="table-body">
      <div v-for="order in orders" :key="order.id" class="order-row">
        <span class="col col-id order-id">{{ order.id }}</span>
        <span class="col col-prov order-prov">{{ order.provider }}</span>
        <span class="col col-vol order-vol">{{ order.volume }}</span>
        <span class="col col-price order-price">${{ order.price.toFixed(2) }}</span>

        <!-- Freshness bar -->
        <div class="col col-fresh fresh-cell">
          <div class="fresh-track">
            <div
              class="fresh-fill"
              :style="{ width: order.freshness + '%', background: freshColor(order.freshness) }"
            ></div>
          </div>
        </div>

        <div class="col col-status">
          <span :class="['status-badge', `status--${order.status.toLowerCase()}`]">
            {{ order.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const orders = [
  { id: '#ORG-9284', provider: 'Green Valley Farms', volume: '120kg', price: 420,    freshness: 88, status: 'Delivered'  },
  { id: '#ORG-9285', provider: 'Khmer Roots',        volume: '85kg',  price: 180.50, freshness: 74, status: 'Processing' },
  { id: '#ORG-9286', provider: 'Mekong Organic',     volume: '240kg', price: 1120,   freshness: 91, status: 'Delivered'  },
]

function freshColor(pct) {
  if (pct >= 85) return '#2d6a4f'
  if (pct >= 70) return '#16a34a'
  return '#f59e0b'
}
</script>

<style scoped>
.snapshot-card {
  background: #fff; border: 1px solid #eaeaea;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.card-header { padding: 16px 20px 10px; border-bottom: 1px solid #f3f4f3; }
.card-title  { font-size: 14px; font-weight: 700; color: #111827; }
.card-sub    { font-size: 11px; color: #9ca3af; margin-top: 2px; }

/* Column layout */
.col { display: flex; align-items: center; }
.col-id     { flex: 1.0; }
.col-prov   { flex: 1.4; }
.col-vol    { flex: 0.8; }
.col-price  { flex: 1.0; }
.col-fresh  { flex: 1.2; }
.col-status { flex: 0.9; }

.col-head {
  display: flex; padding: 8px 20px;
  background: #f8f9f8; border-bottom: 1px solid #eee;
}
.col-head .col {
  font-size: 9.5px; font-weight: 700;
  letter-spacing: .5px; text-transform: uppercase; color: #9ca3af;
}

.order-row {
  display: flex; align-items: center; padding: 12px 20px;
  border-bottom: 1px solid #f3f4f3; transition: background .11s;
}
.order-row:last-child { border-bottom: none; }
.order-row:hover { background: #f9fafb; }

.order-id    { font-size: 12px; font-weight: 800; color: #111827; font-family: monospace; }
.order-prov  { font-size: 12.5px; color: #374151; font-weight: 500; }
.order-vol   { font-size: 12px; color: #6b7280; }
.order-price { font-size: 13px; font-weight: 700; color: #111827; }

.fresh-track {
  width: 80%; height: 6px; background: #e5e7eb;
  border-radius: 99px; overflow: hidden;
}
.fresh-fill { height: 100%; border-radius: 99px; transition: width .4s; }

.status-badge {
  padding: 4px 10px; border-radius: 20px;
  font-size: 10.5px; font-weight: 700;
}
.status--delivered  { background: #d1fae5; color: #065f46; }
.status--processing { background: #dbeafe; color: #1e40af; }
.status--pending    { background: #f3f4f6; color: #6b7280; }
.status--cancelled  { background: #fee2e2; color: #991b1b; }
</style>