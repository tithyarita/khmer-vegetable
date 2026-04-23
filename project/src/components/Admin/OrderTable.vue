<template>
  <!--
    Props:
      orders  – Array of order objects
      title   – card/section title (optional)
    Emits:
      export  – when Export CSV is clicked
  -->
  <div class="orders-table-card">
    <!-- Optional header slot -->
    <div v-if="title || showExport" class="table-topbar">
      <h3 class="table-title">{{ title }}</h3>
      <button v-if="showExport" class="btn-export" @click="$emit('export')">
        <i class="bi bi-download me-1"></i> Export CSV
      </button>
    </div>

    <!-- Column headings -->
    <div class="col-row col-row--head">
      <span class="col col-id">Order ID</span>
      <span class="col col-name">Customer Name</span>
      <span class="col col-price">Total Price</span>
      <span class="col col-status">Status</span>
      <span class="col col-date">Date</span>
    </div>

    <!-- Data rows -->
    <div class="table-body">
      <div v-for="order in orders" :key="order.id" class="col-row col-row--data">

        <!-- Order ID -->
        <span class="col col-id order-id">{{ order.id }}</span>

        <!-- Customer avatar + name -->
        <div class="col col-name customer-cell">
          <div
            class="avatar"
            :style="{ background: avatarBg(order.customerName) }"
          >{{ initials(order.customerName) }}</div>
          <span class="customer-name">{{ order.customerName }}</span>
        </div>

        <!-- Price -->
        <span class="col col-price price-text">${{ order.price.toFixed(2) }}</span>

        <!-- Status badge -->
        <div class="col col-status">
          <span :class="['status-badge', `status--${order.status.toLowerCase().replace(' ', '-')}`]">
            {{ order.status }}
          </span>
        </div>

        <!-- Date -->
        <span class="col col-date date-text">{{ order.date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  orders:     { type: Array,   default: () => [] },
  title:      { type: String,  default: '' },
  showExport: { type: Boolean, default: true },
})
defineEmits(['export'])

// Derive initials from full name
function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// Consistent soft colour per name
const palette = [
  '#d1fae5', '#a7f3d0', '#bbf7d0', '#cffafe', '#dbeafe',
  '#ede9fe', '#fce7f3', '#fef3c7', '#fee2e2',
]
const textPalette = [
  '#065f46', '#047857', '#065f46', '#0e7490', '#1e40af',
  '#5b21b6', '#9d174d', '#92400e', '#991b1b',
]
function avatarBg(name) {
  const idx = name.charCodeAt(0) % palette.length
  return palette[idx]
}
// expose for text colour if needed — kept simple here
</script>

<style scoped>
.orders-table-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

/* Header strip */
.table-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #f3f4f3;
}
.table-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.btn-export {
  display: flex;
  align-items: center;
  background: #1a3d2a;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 6px 14px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-export:hover { background: #2d6a4f; }

/* Column layout */
.col-row {
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.col { display: flex; align-items: center; }
.col-id     { flex: 1.2; }
.col-name   { flex: 2.0; }
.col-price  { flex: 1.2; }
.col-status { flex: 1.3; }
.col-date   { flex: 1.2; }

/* Head row */
.col-row--head {
  background: #f8f9f8;
  height: 38px;
  border-bottom: 1px solid #eee;
}
.col-row--head .col {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .6px;
  text-transform: uppercase;
  color: #9ca3af;
}

/* Data rows */
.col-row--data {
  height: 64px;
  border-bottom: 1px solid #f3f4f3;
  transition: background .11s;
}
.col-row--data:last-child { border-bottom: none; }
.col-row--data:hover { background: #f9fafb; }

/* Order ID */
.order-id {
  font-size: 12px;
  font-weight: 800;
  color: #111827;
  font-family: 'Courier New', monospace;
}

/* Customer */
.customer-cell { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #065f46;
  flex-shrink: 0;
}
.customer-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

/* Price */
.price-text {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

/* Status badges */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.status--delivered  { background: #d1fae5; color: #065f46; }
.status--in-transit { background: #dbeafe; color: #1e40af; }
.status--pending    { background: #f3f4f6; color: #6b7280; }
.status--cancelled  { background: #fee2e2; color: #991b1b; }

/* Date */
.date-text {
  font-size: 12px;
  color: #6b7280;
}
</style>