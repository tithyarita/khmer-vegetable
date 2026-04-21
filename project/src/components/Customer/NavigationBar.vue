<template>
  <header class="navbar">
    <div class="navbar-top">
      <div class="container">
        <div class="logo">
          <span class="logo-text">Logo</span>
        </div>

        <div class="search">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9CA3AF" stroke-width="1.6"/>
            <path d="M13.5 13.5L17 17" stroke="#9CA3AF" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <input v-model="query" type="text" placeholder="Search for fresh vegetables..." />
        </div>
        <div class="nav-right">
          <div class="location">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="#555" stroke-width="1.5"/>
              <circle cx="10" cy="8" r="2" stroke="#555" stroke-width="1.5"/>
            </svg>
            <span>{{ location }}</span>
          </div>

          <button class="btn-login">Login</button>
          <button class="btn-register">Register</button>
        </div>

      </div>
    </div>

    <div class="divider"></div>

    <!-- Bottom row -->
    <div class="navbar-bottom">
      <div class="container">

        <ul class="categories">
          <li
            v-for="(cat, index) in categories"
            :key="cat + index"
            :class="{ active: active === cat }"
            @click="setCategory(cat)"
          >
            {{ cat }}
          </li>
        </ul>

        <div class="cart" @click="goToCart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#2D7A3A" stroke-width="1.8"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#2D7A3A" stroke-width="1.8"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#2D7A3A" stroke-width="1.8"/>
          </svg>
          <span v-if="count > 0" class="badge">{{ count }}</span>
        </div>

      </div>
    </div>

  </header>
</template>

<script>
export default {
  name: 'NavigationBar',
  data() {
    return {
      query: '',
      location: 'Phnom Penh, Cambodia',
      active: 'Leafy Greens',
      count: 2,
      categories: ['Leafy Greens', 'Root Veg', 'Cruciferous', 'Seasonal'],
    }
  },
  methods: {
    setCategory(cat) {
      this.active = cat
    },
    goToCart() {
      console.log("Go to cart page")
    }
  }
}
</script>

<style scoped>

:global(body) {
  margin: 0;
  overflow-x: hidden;
}
.navbar {
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

/* CENTER CONTENT */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* TOP */
.navbar-top {
  width: 100%;
  padding: 12px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.search {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 8px 16px;
  background: #f9fafb;
  margin: 0 20px;
}

.search input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
}

/* RIGHT */
.nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.location {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-login {
  background: none;
  border: none;
  color: #2D7A3A;
  font-weight: 600;
  cursor: pointer;
}

.btn-register {
  background: #1a5c27;
  border: none;
  color: white;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
}


.divider {
  height: 1px;
  background: #e5e7eb;
}

.navbar-bottom {
  width: 100%;
}

.categories {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.categories li {
  padding: 12px 16px;
  cursor: pointer;
  color: #6b7280;
}

.categories li.active {
  color: #2D7A3A;
  font-weight: 600;
  border-bottom: 2px solid #2D7A3A;
}

.cart {
  position: relative;
  width: 36px;
  height: 36px;
  background: #e6f4ea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #2D7A3A;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-top .container,
.navbar-bottom .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
@media (max-width: 768px) {
  .navbar-top .container {
    flex-wrap: wrap;
    gap: 10px;
  }

  .search {
    width: 100%;
    margin: 10px 0;
  }

  .categories {
    overflow-x: auto;
  }
}

</style>