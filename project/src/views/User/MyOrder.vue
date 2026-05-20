<template>
  <div class="home">
    <NavigationBar />
    <div class="my-orders-page">
      <nav class="breadcrumb">
        <a href="/">Home</a><span class="sep">›</span>
        <span class="cur">My Orders</span>
      </nav>
      <div class="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your deliveries</p>
      </div>

      <div v-if="loading" class="empty-state">Loading orders...</div>
      <div v-else-if="error" class="empty-state">{{ error }}</div>
      <div v-else-if="orders.length === 0" class="empty-state">No orders found yet.</div>

      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="card-top">
          <div>
            <div class="card-top-left">
              <span class="order-number">Order #{{ order.orderCode }}</span>
              <span :class="['badge', order.statusClass]">
                <span v-if="order.status === 'pending'" class="pulse-dot"></span>
                {{ order.statusLabel }}
              </span>
            </div>
            <div class="order-meta">{{ order.meta }}</div>
          </div>
          <div class="order-price">${{ order.price }}</div>
        </div>

        <div class="items-preview">
          <div class="item-images">
            <div class="item-img" v-for="(item, idx) in order.previewItems" :key="idx">{{ item }}</div>
            <div class="item-count-bubble">+{{ order.extraCount }}</div>
          </div>
          <div class="items-text">
            <div class="items-name">{{ order.itemsLabel }}</div>
            <div class="items-farm">{{ order.providerName }}</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary" @click="handlePrimary(order)">
            <svg v-if="order.status === 'pending'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            {{ order.status === 'pending' ? 'Track Delivery' : 'Reorder' }}
          </button>
          <button class="btn btn-secondary" @click="viewDetails(order)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import { useCustomerOrderStore } from '@/stores/customerOrderStore'

export default {
  name: 'MyOrder',
  components: { NavigationBar },
  data() {
    return {
      customerOrderStore: useCustomerOrderStore(),
    }
  },
  computed: {
    orders() {
      return this.customerOrderStore.orders
    },
    loading() {
      return this.customerOrderStore.loading
    },
    error() {
      return this.customerOrderStore.error
    },
  },
  async mounted() {
    await this.customerOrderStore.fetchCustomerOrders()
  },
  methods: {
    handlePrimary(order) {
      if (order.status === 'pending') {
        this.$router.push('/order-tracker')
      } else {
        alert(`Reordering #${order.orderCode}…`)
      }
    },
    viewDetails(order) {
      alert(`Viewing details for order #${order.orderCode}`)
    }
  }
}
</script>

<style scoped>
.breadcrumb { display: flex; gap: 6px; font-size: 13px; color: #8fa896; margin-bottom: 20px; }
.breadcrumb a { color: #5a7060; text-decoration: none; }
.breadcrumb .cur { color: #8fa896; }
.sep { color: #c8d5cc; }

.home {
  background: #edf4ef;
  min-height: 100vh;
}

.my-orders-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-family: 'Fraunces', serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a4a2e;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

.page-header p {
  color: #5a7060;
  margin-top: 6px;
  font-size: 1rem;
}

.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 12px rgba(30, 80, 45, 0.07);
  border: 1px solid #e8ede9;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.order-card:hover {
  box-shadow: 0 4px 24px rgba(30, 80, 45, 0.12);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.card-top-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.order-number {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a2e1f;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-progress {
  background: #fffbeb;
  color: #f59e0b;
  border: 1px solid #fde68a;
}

.badge-delivered {
  background: #e8f5ee;
  color: #2d7a4f;
  border: 1px solid #bbf0d0;
}

.order-price {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 1.4rem;
  color: #2d7a4f;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.order-meta {
  font-size: 0.85rem;
  color: #8fa896;
  margin-top: 4px;
}

.items-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f7faf8;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
  border: 1px solid #e8ede9;
}

.item-images {
  display: flex;
  align-items: center;
}

.item-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-img + .item-img {
  margin-left: -10px;
}

.item-count-bubble {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #1a4a2e;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -10px;
  border: 2px solid white;
  flex-shrink: 0;
}

.items-text {
  flex: 1;
  min-width: 0;
}

.items-name {
  font-size: 1rem;
  font-weight: 500;
  color: #1a2e1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.items-farm {
  font-size: 0.85rem;
  color: #8fa896;
  margin-top: 2px;
  font-style: italic;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 99px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #1a4a2e;
  color: #fff;
}

.btn-primary:hover {
  background: #2d7a4f;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(30, 80, 45, 0.25);
}

.btn-secondary {
  background: transparent;
  color: #5a7060;
  border: 1.5px solid #e8ede9;
}

.btn-secondary:hover {
  background: #e8f5ee;
  border-color: #3db870;
  color: #1a4a2e;
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  margin-right: 5px;
  animation: pulse 1.6s ease infinite;
  vertical-align: middle;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}
</style>
