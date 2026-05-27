<template>
  <div v-if="product">
    <!-- Card Mode (for Dashboard) -->
    <div v-if="mode === 'card'" class="product-card">
      <div class="product-image">
        <img 
          v-if="product.image"
          :src="product.image" 
          :alt="product.name"
          @error="handleImageError" 
        />
        <div v-else class="no-image">
          <i class="bi bi-image"></i>
          <p>No Image</p>
        </div>
      </div>
      <div class="product-info">
        <h6 class="product-name">{{ product.name }}</h6>
        <p class="product-price" v-if="product.price && product.unit">${{ product.price }}/{{ product.unit }}</p>
      </div>
    </div>

    <!-- Row Mode (for Product List Table) -->
    <tr v-if="mode === 'row'" class="product-row">
      <td class="id-col">{{ product.id }}</td>
      <td class="name-col">
        <div class="product-row-content">
          <img v-if="product.image" :src="product.image" :alt="product.name" @error="handleImageError" class="row-image" />
          <span v-else class="no-image-small">📷</span>
          <span>{{ product.name }}</span>
        </div>
      </td>
      <td class="price-col">${{ product.price }}</td>
      <td class="date-col">{{ product.addedDate || 'N/A' }}</td>
      <td class="stock-col">{{ product.stock || product.unit }}</td>
      <td class="action-col">
        <button class="view-detail-btn">View Detail</button>
      </td>
    </tr>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: false,
    default: null
  },
  mode: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'row'].includes(value)
  }
})

const handleImageError = (e) => {
  // Simply hide the image if it fails to load
  if (e && e.target) {
    e.target.style.display = 'none'
  }
}
</script>

<style scoped>
/* Card Mode Styles */
.product-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f3;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 14px 16px;
}

.product-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.product-price {
  margin: 6px 0 0 0;
  font-size: 11px;
  font-weight: 600;
  color: #2d6a4f;
}

/* Row Mode Styles */
.product-row {
  border-bottom: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
}

.product-row:hover {
  background-color: #f9f9f9;
}

.product-row td {
  padding: 12px;
  vertical-align: middle;
  color: #333;
  font-size: 0.9rem;
  border: none;
}

.id-col {
  font-weight: 500;
  color: #999;
  width: 12%;
  font-size: 0.85rem;
}

.name-col {
  width: 30%;
}

.product-row-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.row-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  background: #e9ecef;
  flex-shrink: 0;
}

.price-col {
  font-weight: 600;
  color: #212529;
  width: 12%;
  text-align: left;
}

.date-col {
  font-size: 0.9rem;
  color: #666;
  width: 18%;
}

.stock-col {
  font-weight: 500;
  width: 14%;
  text-align: center;
}

.action-col {
  text-align: center;
  width: 14%;
}

.view-detail-btn {
  padding: 6px 12px;
  border: 1px solid #1a3d2a;
  background: white;
  color: #1a3d2a;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.view-detail-btn:hover {
  background: #1a3d2a;
  color: white;
}

@media (max-width: 768px) {
  .product-image {
    height: 180px;
  }

  .product-row td {
    padding: 10px;
    font-size: 0.9rem;
  }

  .row-image {
    width: 40px;
    height: 40px;
  }
}

/* No Image Placeholder */
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f3;
  color: #999;
  gap: 8px;
}

.no-image i {
  font-size: 32px;
  color: #bbb;
}

.no-image p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.no-image-small {
  display: inline-block;
  font-size: 20px;
  width: 50px;
  text-align: center;
  flex-shrink: 0;
}

</style>
