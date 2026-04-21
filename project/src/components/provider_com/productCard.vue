<template>
  <div v-if="product" class="product-card">
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
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: false,
    default: null
  }
})

const handleImageError = (e) => {
  if (e && e.target) {
    e.target.src = 'https://via.placeholder.com/300?text=Product'
  }
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .product-image {
    height: 180px;
  }
}
</style>
