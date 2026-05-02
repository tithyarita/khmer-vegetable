<template>
  <div class="product-grid">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
    >
      <!-- Image -->
      <div class="card-image">
        <img :src="product.image" :alt="product.name" />

        <!-- Badge -->
        <span
          v-if="product.badge"
          class="badge"
          :class="badgeClass(product.badge)"
        >
          {{ product.badge }}
        </span>

        <!-- Label -->
        <div v-if="product.label" class="image-label">
          {{ product.label }}
        </div>
      </div>

      <!-- Body -->
      <div class="card-body">
        <p class="category">{{ product.category }}</p>
        <h3 class="product-name">{{ product.name }}</h3>

        <!-- Rating -->
        <div class="rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B6914">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="rating-text">({{ product.rating }})</span>
        </div>

        <!-- Price + Button -->
        <div class="price-row">
          <div class="prices">
            <span class="price">${{ product.price }}</span>
            <span class="original-price">${{ product.originalPrice }}</span>
          </div>

          <button class="btn-add" @click="addToCart(product)">
            <span class="plus">+</span> Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../../stores/productStore'

export default {
  name: "ProductCards",

  setup() {
    const productStore = useProductStore()
    const products = ref([])

    onMounted(async () => {
      try {
        // Fetch products from API
        if (!productStore.products || productStore.products.length === 0) {
          await productStore.fetchAllProducts()
        }
        // Transform products for display
        products.value = productStore.products.slice(0, 8).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          originalPrice: p.price * 1.2, // Add markup for display
          rating: 4.5,
          badge: p.discount > 0 ? "SALE" : "HOT",
          image: p.image || 'https://via.placeholder.com/300',
        }))
      } catch (error) {
        console.error('Error loading products:', error)
      }
    })

    const badgeClass = (badge) => {
      return badge === 'HOT' ? 'badge-hot' : badge === 'SALE' ? 'badge-sale' : 'badge-new'
    }

    const addToCart = (product) => {
      console.log('Added to cart:', product.name)
      // TODO: Implement cart functionality
    }

    return {
      products,
      badgeClass,
      addToCart,
    }
  }
}
</script>

<style scoped>
.product-grid {
  display: flex;
  gap: 28px;
  padding: 40px 32px;
  max-width: 1320px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.product-card {
  flex: 1 1 260px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  width: 80%;
  aspect-ratio: 1 / 1;
  margin: 0 auto;              /* center horizontally */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #f9fafb;
  border-radius: 16px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product-card:hover img {
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge-hot  { background: #2D7A3A; color: #fff; }
.badge-sale { background: #F59E0B; color: #fff; }
.badge-new  { background: #9CA3AF; color: #fff; }

.image-label {
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: 10px;
  color: rgba(255,255,255,0.75);
  font-weight: 600;
  white-space: pre-line;
  text-align: right;

}

.card-body {
  padding: 16px 18px 18px;
}

.category {
  font-size: 12px;
  color: #9ca3af;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 6px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.rating-text {
  font-size: 13px;
  color: #8B6914;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prices {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 22px;
  font-weight: 700;
  color: #2D7A3A;
}

.original-price {
  font-size: 13px;
  color: #9ca3af;
  text-decoration: line-through;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e6f4ea;
  color: #2D7A3A;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-add:hover {
  background: #d0ecda;
}

.plus {
  font-size: 16px;
}

@media (max-width: 768px) {
  .product-card {
    flex: 1 1 45%;
  }
}

@media (max-width: 480px) {
  .product-card {
    flex: 1 1 100%;
  }
}
</style>