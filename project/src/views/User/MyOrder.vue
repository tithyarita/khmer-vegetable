<template>
<div>
<NavigationBar />
  <div class="my-orders">
    
    <div class="page-header">
      <h1>My Orders</h1>
      <p>Track and manage your boutique market deliveries</p>
    </div>
    <div class="orders-grid">
      <div
        v-for="(order, i) in orders"
        :key="order.id"
        class="order-card"
      >
        <div class="card-top">
          <div>
            <div class="card-top-left">
              <span class="order-number">Order #{{ order.id }}</span>

              <span
                :class="[
                  'badge',
                  order.status === 'IN PROGRESS'
                    ? 'badge-progress'
                    : 'badge-delivered'
                ]"
              >
                <span
                  v-if="order.status === 'IN PROGRESS'"
                  class="pulse-dot"
                ></span>
                {{ order.status }}
              </span>
            </div>

            <div class="order-meta">{{ order.meta }}</div>
          </div>

          <div class="order-price">${{ order.price }}</div>
        </div>
        <div class="items-preview">
          <div class="item-images">
            <div
              class="item-img"
              v-for="(image, idx) in order.images"
              :key="idx"
            >
              <img :src="image" :alt="order.itemsLabel" />
            </div>

            <div class="item-count-bubble">
              +{{ order.extraCount }}
            </div>
          </div>

          <div class="items-text">
            <div class="items-name">
              {{ order.itemsLabel }}
            </div>
            <div class="items-farm">{{ order.farm }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button
            class="btn btn-primary"
            @click="handlePrimary(order)"
          >
            {{ order.status === 'IN PROGRESS'
              ? 'Track Delivery'
              : 'Reorder' }}
          </button>

          <button
            class="btn btn-secondary"
            @click="viewDetails(order)"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import NavigationBar from '@/components/Customer/NavigationBar.vue';
import Tomato from '../../assets/images/Tomato3.png'
import Broccoli from '../../assets/images/broccoli.png'
import Corn from '../../assets/images/corn.png'
export default {
  name: "MyOrders",
  data() {
    return {
      orders: [
        {
          id: "EG-92841",
          status: "IN PROGRESS",
          meta:
            "Placed on Oct 24, 2024 • Expected Arrival: Today, 5:00 PM",
          price: "42.80",
          images: [
            Broccoli,
            Tomato,
          ],
          extraCount: 4,
          itemsLabel:
            "Organic Kale, Heirloom Carrots + 4 more items",
          farm: "From Willow Creek Family Farm",
        },
        {
          id: "EG-81722",
          status: "DELIVERED",
          meta:
            "Placed on Oct 18, 2024 • Delivered on Oct 19, 2024",
          price: "89.15",
          images: [
            Tomato,
            Corn,
          ],
          extraCount: 8,
          itemsLabel:
            "Weekly Harvest Box, Artisan Sourdough + 8 items",
          farm: "Multiple Partner Farms",
        },
        {
          id: "EG-71604",
          status: "DELIVERED",
          meta:
            "Placed on Oct 04, 2024 • Delivered on Oct 05, 2024",
          price: "35.40",
          images: [
            Tomato,
            Broccoli,
          ],
          extraCount: 2,
          itemsLabel:
            "Vine-Ripened Tomatoes, Fresh Basil + 2 items",
          farm: "Emerald Grove Greenhouses",
        },
      ],
    };
  },
  methods: {
    handlePrimary(order) {
      alert(
        order.status === "IN PROGRESS"
          ? `Tracking order #${order.id}`
          : `Reordering #${order.id}`
      );
    },
    viewDetails(order) {
      alert(`Viewing order #${order.id}`);
    },
  },
};
</script>

<style scoped>
/* Layout */
.my-orders {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  font-family: "DM Sans", sans-serif;
}

/* Header */
.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-family: "Fraunces", serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: #1a4a2e;
}

.page-header p {
  color: #5a7060;
  font-size: 1rem;
}

/* GRID (2 columns) */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

/* Card */
.order-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #e8ede9;
  box-shadow: 0 4px 18px rgba(30, 80, 45, 0.08);
  transition: 0.25s ease;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(30, 80, 45, 0.15);
}

/* Top */
.card-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.card-top-left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.order-number {
  font-weight: 700;
}

.order-meta {
  font-size: 0.85rem;
  color: #8fa896;
  margin-top: 4px;
}

.order-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d7a4f;
}

/* Badge */
.badge {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-progress {
  background: #fffbeb;
  color: #f59e0b;
}

.badge-delivered {
  background: #e8f5ee;
  color: #2d7a4f;
}

/* Items */
.items-preview {
  display: flex;
  gap: 12px;
  background: #f7faf8;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 14px;
}

.item-images {
  display: flex;
}

.item-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-img + .item-img {
  margin-left: -8px;
}

.item-count-bubble {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #1a4a2e;
  color: white;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
}

/* Text */
.items-name {
  font-weight: 600;
}

.items-farm {
  font-size: 0.85rem;
  color: #8fa896;
  margin-top: 3px;
}

/* Buttons */
.card-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #1a4a2e;
  color: #fff;
}

.btn-primary:hover {
  background: #2d7a4f;
}

.btn-secondary {
  border: 1px solid #e8ede9;
  background: transparent;
  color: #5a7060;
}

.btn-secondary:hover {
  background: #e8f5ee;
}

/* Pulse */
.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
  display: inline-block;
  margin-right: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.7); opacity: 0.5; }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
}
</style>