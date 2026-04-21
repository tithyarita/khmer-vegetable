<template>
  <div v-if="product">
    <!-- Card Mode (for Dashboard) -->
    <div v-if="mode === 'card'" class="product-card">
      <div class="product-image">
        <img 
          :src="product.image" 
          :alt="product.name"
          @error="handleImageError" 
        />
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
          <img :src="product.image" :alt="product.name" @error="handleImageError" class="row-image" />
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
  if (e && e.target) {
    e.target.src = 'https://via.placeholder.com/300?text=Product'
  }
}
</script>

<style scoped>
/* Card Mode Styles */
.product-card {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-3px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #e9ecef;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
}

.product-price {
  margin: 8px 0 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
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
  border: 1px solid #daa520;
  background: white;
  color: #daa520;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.view-detail-btn:hover {
  background: #daa520;
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

</style>
