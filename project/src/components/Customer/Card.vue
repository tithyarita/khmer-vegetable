<template>
  <div class="product-grid">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
    >
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
        <!-- Discount Badge -->
        <span
          v-if="product.discount"
          class="badge badge-discount"
        >
          -{{ product.discount }}%
        </span>
        <div v-if="product.label" class="image-label">
          {{ product.label }}
        </div>
      </div>
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
import Tomato from '../../assets/images/Tomato3.png'
import { useCartStore } from '../../stores/cartStore'
export default {

  name: "ProductCards",

  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  },

  data() {
    return {
      products: [
        {
          id: 1,
          name: "Organic Curly Kale Bunch",
          category: "Leafy Greens",
          price: "2.50",
          originalPrice: "3.20",
          rating: 4.9,
          badge: "HOT",
          discount: 22,
          label: "ORGANIC\nSAFE WORK",
          image: Tomato
        },
        {
          id: 2,
          name: "Fresh Garden Radish (Bunch)",
          category: "Root Veg",
          price: "1.99",
          originalPrice: "2.50",
          rating: 4.8,
          badge: "SALE",
          discount: 20,
          label: null,
          image: Tomato
        },
        {
          id: 3,
          name: "Sweet Red Bell Peppers (3 Pack)",
          category: "Vegetables",
          price: "3.45",
          originalPrice: "4.00",
          rating: 4.5,
          badge: null,
          discount: 14,
          label: null,
          image: Tomato
        },
        {
          id: 4,
          name: "Organic Heirloom Broccoli Crown",
          category: "Cruciferous",
          price: "2.99",
          originalPrice: "3.50",
          rating: 5.0,
          badge: "NEW",
          label: null,
          image: Tomato
        },
          {
          id: 5,
          name: "Organic Heirloom Broccoli Crown",
          category: "Cruciferous",
          price: "2.99",
          originalPrice: "3.50",
          rating: 5.0,
          badge: "NEW",
          label: null,
          image: Tomato
        }
      ]
    };
  },

  methods: {
    badgeClass(badge) {
      return {
        "badge-hot": badge === "HOT",
        "badge-sale": badge === "SALE",
        "badge-new": badge === "NEW",
        "badge-discount": badge === "DISCOUNT"
      };
    },

    addToCart(product) {
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        if (window.confirm('You need to login or register before adding to cart.\nDo you want to login now?')) {
          this.$router.push('/user/login');
        }
        return;
      }
      this.cartStore.addToCart(product)
      console.log("Added to cart:", product.name)
    }
  }
};
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

/* CARD */
.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
  min-width: 0;
  padding: 20px;
  border-radius: 12px;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.1);
}

/* IMAGE */
.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 12px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.3s;
}

.product-card:hover img {
  transform: scale(1.08);
}

/* BADGE */
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.badge-hot  { background: #2D7A3A; color: #fff; }
.badge-sale { background: #F59E0B; color: #fff; }
.badge-new  { background: #6B7280; color: #fff; }
.badge-discount { background: #DC2626; color: #fff; }

/* LABEL */
.image-label {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  font-weight: 600;
  white-space: pre-line;
  text-align: right;
}

/* BODY */
.card-body {
  padding: 12px;
}

.category {
  font-size: 11px;
  color: #9ca3af;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  margin: 4px 0 6px;
  line-height: 1.3;
}

/* RATING */
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.rating-text {
  font-size: 12px;
  color: #8B6914;
}

/* PRICE */
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
  font-size: 16px;
  font-weight: 700;
  color: #2D7A3A;
}

.original-price {
  font-size: 11px;
  color: #9ca3af;
  text-decoration: line-through;
}

/* BUTTON */
.btn-add {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #e6f4ea;
  color: #2D7A3A;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.btn-add:hover {
  background: #d0ecda;
}

.plus {
  font-size: 14px;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>