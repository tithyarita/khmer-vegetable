<template>
  <div class="orders-management-page">
    <div class="header-row">
      <div>
        <h1 class="title">Orders Management</h1>
        <p class="subtitle">Track and manage all customer orders in your ecosystem.</p>
      </div>
      <div class="header-actions">
        <button class="time-btn active">All Time</button>
        <button class="time-btn">Last 30 Days</button>
        <button class="export-btn">Export Report</button>
      </div>
    </div>
    <div class="summary-row">
      <div class="summary-card">
        <div class="icon-box"><span>📦</span></div>
        <div>
          <div class="summary-label">TOTAL ORDERS</div>
          <div class="summary-value">2,482 <span class="summary-change">+12%</span></div>
        </div>
      </div>
      <div class="summary-card">
        <div class="icon-box"><span>⏳</span></div>
        <div>
          <div class="summary-label">PENDING ORDERS</div>
          <div class="summary-value pending">128 <span class="summary-pending">Queueing</span></div>
        </div>
      </div>
      <div class="summary-card">
        <div class="icon-box"><span>✅</span></div>
        <div>
          <div class="summary-label">COMPLETED</div>
          <div class="summary-value">2,240 <span class="summary-sub">90.2%</span></div>
        </div>
      </div>
      <div class="summary-card revenue">
        <div class="icon-box"><span>💰</span></div>
        <div>
          <div class="summary-label">TOTAL REVENUE</div>
          <div class="summary-value">$124,500</div>
        </div>
      </div>
    </div>
    <div class="filter-bar">
      <select v-model="status" class="status-filter">
        <option>All Statuses</option>
        <option>Delivered</option>
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Shipped</option>
        <option>Cancelled</option>
      </select>
      <input type="text" class="date-filter" placeholder="Oct 01, 2023 - Oct 31, 2023" />
      <button class="clear-filter-btn">Clear Filters</button>
    </div>
    <div class="main-content">
      <div class="table-section">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>PROVIDER</th>
              <th>TOTAL PRICE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.id" :class="{selected: order.id === selectedOrder.id}" @click="selectOrder(order)">
              <td><span class="order-id">#ORD-{{ order.id }}</span></td>
              <td>
                <div class="customer-cell">
                  <span class="customer-avatar" :style="{background: order.customerColor}">{{ order.customerInitials }}</span>
                  <span>{{ order.customer }}</span>
                </div>
              </td>
              <td>{{ order.provider }}</td>
              <td>{{ order.price }}</td>
              <td><span :class="['status-badge', order.statusClass]">{{ order.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-row">
          <span>SHOWING 1-10 OF 2,482</span>
          <div class="pagination">
            <button :disabled="page === 1" @click="page--">&lt;</button>
            <button v-for="p in totalPages" :key="p" :class="{active: p === page}" @click="page = p">{{ p }}</button>
            <button :disabled="page === totalPages" @click="page++">&gt;</button>
          </div>
        </div>
      </div>
      <div class="details-section" v-if="selectedOrder">
        <div class="details-card">
          <div class="details-header">
            <span class="details-order-id">#ORD-{{ selectedOrder.id }}</span>
            <span class="details-date">Oct 24, 2023 at 2:45 PM</span>
            <span class="details-status delivered">DELIVERED</span>
          </div>
          <div class="details-customer">
            <span class="customer-avatar" :style="{background: selectedOrder.customerColor}">{{ selectedOrder.customerInitials }}</span>
            <div>
              <div class="customer-name">{{ selectedOrder.customer }}</div>
              <div class="customer-phone">+1 555-0123</div>
              <div class="customer-address">123 Maple St, Harvest Village</div>
            </div>
          </div>
          <div class="details-provider">
            <span class="provider-label">FARM PROVIDER</span>
            <span class="provider-name">{{ selectedOrder.provider }}</span>
          </div>
          <div class="details-items">
            <div class="item-row" v-for="item in selectedOrder.items" :key="item.name">
              <span>{{ item.name }}</span>
              <span>{{ item.qty }} x {{ item.price }}</span>
              <span class="item-total">${{ (item.qty * parseFloat(item.price.replace('$',''))).toFixed(2) }}</span>
            </div>
          </div>
          <div class="details-total-row">
            <span>Total</span>
            <span class="details-total">${{ selectedOrder.items.reduce((sum, item) => sum + item.qty * parseFloat(item.price.replace('$','')), 0).toFixed(2) }}</span>
          </div>
          <div class="details-timeline">
            <div class="timeline-label">JOURNEY TIMELINE</div>
            <ul>
              <li><b>Ordered</b> <span>Oct 24 - 2:45 PM</span></li>
              <li><b>Shipped</b> <span>Oct 25 - 9:00 AM</span></li>
              <li class="delivered"><b>Delivered</b> <span>Oct 26 - 4:30 PM</span></li>
            </ul>
          </div>
          <div class="details-actions">
            <button class="print-btn">Print</button>
            <button class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const status = ref('All Statuses')
const page = ref(1)
const pageSize = 10

const orders = ref([
  {
    id: '5521',
    customer: 'Jane Doe',
    customerInitials: 'JD',
    customerColor: '#e0e7ff',
    provider: 'Green Valley Organics',
    price: '$25.00',
    status: 'Delivered',
    statusClass: 'delivered',
    items: [
      { name: 'Kale', qty: 2, price: '$5.00' },
      { name: 'Carrots', qty: 5, price: '$3.00' }
    ]
  },
  {
    id: '5522',
    customer: 'Mark Smith',
    customerInitials: 'MS',
    customerColor: '#fef9c3',
    provider: 'Sun-Kissed Farms',
    price: '$42.50',
    status: 'Pending',
    statusClass: 'pending',
    items: [
      { name: 'Tomatoes', qty: 10, price: '$2.50' },
      { name: 'Lettuce', qty: 3, price: '$4.00' }
    ]
  },
  {
    id: '5523',
    customer: 'Rose Lee',
    customerInitials: 'RL',
    customerColor: '#bbf7d0',
    provider: 'Orchard Lane',
    price: '$118.00',
    status: 'Confirmed',
    statusClass: 'confirmed',
    items: [
      { name: 'Apples', qty: 20, price: '$3.00' },
      { name: 'Pears', qty: 10, price: '$4.80' }
    ]
  },
  {
    id: '5524',
    customer: 'Bill Brown',
    customerInitials: 'BB',
    customerColor: '#fca5a5',
    provider: 'Root & Stem',
    price: '$12.20',
    status: 'Shipped',
    statusClass: 'shipped',
    items: [
      { name: 'Spinach', qty: 4, price: '$2.50' }
    ]
  },
  {
    id: '5525',
    customer: 'Tom Cook',
    customerInitials: 'TC',
    customerColor: '#fbcfe8',
    provider: 'Green Valley Organics',
    price: '$65.40',
    status: 'Cancelled',
    statusClass: 'cancelled',
    items: [
      { name: 'Cabbage', qty: 8, price: '$4.00' },
      { name: 'Carrots', qty: 10, price: '$2.50' }
    ]
  }
])

const filteredOrders = computed(() => {
  let result = orders.value
  if (status.value !== 'All Statuses') {
    result = result.filter(o => o.status === status.value)
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))
const paginatedOrders = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const selectedOrder = ref(orders.value[0])
function selectOrder(order) {
  selectedOrder.value = order
}
</script>

<style scoped>
.orders-management-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.title {
  color: #14532d;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.subtitle {
  color: #64748b;
  font-size: 1rem;
}
.header-actions {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}
.time-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #14532d;
  cursor: pointer;
}
.time-btn.active {
  background: #14532d;
  color: #fff;
}
.export-btn {
  background: #14532d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
}
.summary-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.summary-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2rem;
  min-width: 260px;
}
.summary-card.revenue {
  background: #14532d;
  color: #fff;
}
.icon-box {
  background: #f1f5f9;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
}
.summary-label {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}
.summary-card.revenue .summary-label {
  color: #fff;
}
.summary-value {
  color: #14532d;
  font-size: 1.5rem;
  font-weight: 700;
}
.summary-card.revenue .summary-value {
  color: #fff;
}
.summary-change {
  color: #22c55e;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.summary-pending {
  color: #f59e42;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.summary-value.pending {
  color: #f59e42;
}
.summary-sub {
  color: #64748b;
  font-size: 1rem;
  margin-left: 0.5rem;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
}
.status-filter, .date-filter {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  color: #14532d;
}
.clear-filter-btn {
  background: #fff1f2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
}
.main-content {
  display: flex;
  gap: 2rem;
}
.table-section {
  flex: 2;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.orders-table th {
  color: #64748b;
  font-weight: 600;
  padding: 0.7rem 0.5rem;
  text-align: left;
  font-size: 0.95rem;
}
.orders-table td {
  padding: 0.7rem 0.5rem;
  vertical-align: middle;
  font-size: 1rem;
}
.orders-table tr.selected {
  background: #f1f5f9;
}
.order-id {
  font-weight: 600;
  color: #14532d;
}
.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #222;
  margin-right: 0.5rem;
}
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}
.status-badge.delivered {
  background: #22c55e;
}
.status-badge.pending {
  background: #f59e42;
}
.status-badge.confirmed {
  background: #2563eb;
}
.status-badge.shipped {
  background: #fbbf24;
  color: #222;
}
.status-badge.cancelled {
  background: #dc2626;
}
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.pagination button {
  background: #fff;
  border: 1px solid #14532d;
  color: #14532d;
  border-radius: 6px;
  margin: 0 0.2rem;
  padding: 0.2rem 0.8rem;
  cursor: pointer;
}
.pagination button.active {
  background: #14532d;
  color: #fff;
}
.details-section {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.details-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.details-order-id {
  font-weight: 700;
  color: #14532d;
  font-size: 1.1rem;
}
.details-date {
  color: #64748b;
  font-size: 0.98rem;
}
.details-status {
  background: #22c55e;
  color: #fff;
  border-radius: 8px;
  padding: 0.3rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
}
.details-customer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.customer-name {
  font-weight: 700;
  color: #14532d;
}
.customer-phone, .customer-address {
  color: #64748b;
  font-size: 0.98rem;
}
.details-provider {
  margin-bottom: 1.2rem;
}
.provider-label {
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
.provider-name {
  color: #14532d;
  font-weight: 600;
  font-size: 1.05rem;
}
.details-items {
  margin-bottom: 1.2rem;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}
.item-total {
  font-weight: 600;
  color: #14532d;
}
.details-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
}
.details-total {
  color: #14532d;
}
.details-timeline {
  margin-bottom: 1.2rem;
}
.timeline-label {
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.details-timeline ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.details-timeline li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
  color: #222;
}
.details-timeline li.delivered {
  color: #22c55e;
  font-weight: 700;
}
.details-actions {
  display: flex;
  gap: 1.2rem;
}
.print-btn, .cancel-btn {
  flex: 1;
  background: #f1f5f9;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.cancel-btn {
  background: #fff1f2;
  color: #dc2626;
}
</style>