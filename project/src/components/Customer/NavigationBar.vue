<template>
  <header class="navbar">
    <div class="navbar-top">
      <div class="container">
        <div class="logo">
          <span class="logo-text"><img src="../../assets/images/Logo.png" alt="Logo" /></span>
        </div>

        <div class="search" ref="searchRef">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" @click="openDropdown">
            <circle cx="9" cy="9" r="6" stroke="#9CA3AF" stroke-width="1.6"/>
            <path d="M13.5 13.5L17 17" stroke="#9CA3AF" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <input v-model="query" type="text" placeholder="Search produce..." @focus="openDropdown" @keyup.enter="toSearch" />
          <SreachDropdown v-if="showDropdown" :query="query" @close="showDropdown = false" />
        </div>

        <div class="nav-right">
          <div class="location" :class="{ located: locationStore.activeLocation }" @click="showLocationModal = true" ref="locationRef">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              <circle v-if="locationStore.activeLocation" cx="10" cy="8" r="4" fill="#2D7A3A" opacity="0.3" class="pulse-dot"/>
            </svg>
            <span class="location-text">{{ locationDisplay }}</span>
          </div>
          <LocationModal v-if="showLocationModal" @close="showLocationModal = false" />

          <!-- Guest: show Login / Register -->
          <template v-if="!isLoggedIn">
            <button class="btn-login" @click="goToLogin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span class="btn-text">Login</span>
            </button>
            <button class="btn-register" @click="goToRegister">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
              </svg>
              <span class="btn-text">Register</span>
            </button>
          </template>

          <!-- Logged-in: show profile avatar with dropdown -->
          <div v-else class="profile-wrapper" ref="profileRef">
            <button class="profile-avatar" @click="toggleProfileMenu" :aria-expanded="profileMenuOpen">
              <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar-img" />
              <span v-else class="avatar-initials">{{ userInitials }}</span>
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown">
              <div v-if="profileMenuOpen" class="profile-dropdown">
                <!-- User info header -->
                <div class="dropdown-header">
                  <div class="dropdown-avatar">
                    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar-img" />
                    <span v-else class="avatar-initials">{{ userInitials }}</span>
                  </div>
                  <div class="dropdown-user-info">
                    <p class="dropdown-name">{{ user.name }}</p>
                    <p class="dropdown-email">{{ user.email }}</p>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <!-- Menu items -->
                <ul class="dropdown-menu-list">
                  <li @click="goToProfile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#2D7A3A" stroke-width="1.8"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2D7A3A" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    My Profile
                  </li>
                  <li @click="goToSettings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="#2D7A3A" stroke-width="1.8"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#2D7A3A" stroke-width="1.8"/>
                    </svg>
                    Settings
                  </li>
                </ul>

                <div class="dropdown-divider"></div>

                <ul class="dropdown-menu-list">
                  <li class="logout-item" @click="handleLogout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#e53e3e" stroke-width="1.8" stroke-linecap="round"/>
                      <polyline points="16 17 21 12 16 7" stroke="#e53e3e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="#e53e3e" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    Logout
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="navbar-bottom">
      <hr>
      <div class="container">
        <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <ul class="categories" :class="{ open: mobileMenuOpen }">
          <li
            v-for="(cat, index) in categories"
            :key="cat.label + index"
            :class="{ active: active === cat.label }"
            @click="setCategory(cat); mobileMenuOpen = false"
          >
            {{ cat.label }}
          </li>
        </ul>

        <div class="nav-actions">
          <div class="favorite" @click="toggleFavorite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
                :stroke="isFavorited ? 'transparent' : '#2D7A3A'"
                :fill="isFavorited ? '#2D7A3A' : 'none'"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="favoriteCount > 0" class="badge">{{ favoriteCount }}</span>
          </div>
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
    </div>
  </header>
</template>

<script>
import SreachDropdown from './Searchdropdown.vue'
import LocationModal from './LocationModal.vue'
import { useCartStore } from '../../stores/cartStore'
import { useSearchStore } from '../../stores/searchStore'
import { useUserStore } from '../../stores/userStore'
import { useLocationStore } from '../../stores/locationStore'

export default {
  name: 'NavigationBar',
  components: {
    SreachDropdown,
    LocationModal,
    CategoryIcon: {
      props: ['icon'],
      template: `
        <svg v-if="icon === 'vegetables'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z"/>
          <path d="M8 8c-2 1-4 3-4 6 0 4 4 8 8 8s8-4 8-8c0-3-2-5-4-6"/>
        </svg>
        <svg v-else-if="icon === 'greens'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22c4 0 8-4 8-8 0-3-2-5.5-4-7"/>
          <path d="M12 22c-4 0-8-4-8-8 0-3 2-5.5 4-7"/>
          <path d="M12 2v20"/>
          <path d="M8 8c2 1 4 1 4 1s2 0 4-1"/>
        </svg>
        <svg v-else-if="icon === 'tubers'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="12" cy="14" rx="8" ry="6"/>
          <path d="M12 8V2"/>
          <path d="M8 14c0 2 1.8 4 4 4s4-1.8 4-4"/>
          <circle cx="10" cy="5" r="1.5" fill="currentColor"/>
          <circle cx="14" cy="4" r="1" fill="currentColor"/>
        </svg>
        <svg v-else-if="icon === 'rootveg'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v12"/>
          <path d="M8 6c0 4 4 10 4 10s4-6 4-10"/>
          <path d="M4 8c2 2 8 2 8 2s6 0 8-2"/>
          <path d="M3 16c3-1 9-1 9-1s6 0 9 1"/>
        </svg>
        <svg v-else-if="icon === 'cruciferous'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8 2 5 5 5 9c0 3 1.5 5.5 3 7"/>
          <path d="M12 2c4 0 7 3 7 7 0 3-1.5 5.5-3 7"/>
          <path d="M12 2v12"/>
          <path d="M8 14c0 3 1.8 6 4 6s4-3 4-6"/>
          <path d="M7 10c1 .5 5 .5 5 .5s4 0 5-.5"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>
      `
    }
  },
  setup() {
    const cartStore = useCartStore()
    const searchStore = useSearchStore()
    const userStore = useUserStore()
    const locationStore = useLocationStore()
    return { cartStore, searchStore, userStore, locationStore }
  },
  data() {
    return {
      query: '',
      showDropdown: false,
      location: 'Phnom Penh, Cambodia',
      showLocationModal: false,
      mobileMenuOpen: false,
      active: 'Home',
      isFavorited: false,
      profileMenuOpen: false,
      categories: [
        { label: 'Home', icon: '', route: '/' },
        { label: 'Vegetables', icon: '', route: '/category/vegetables' },
        { label: 'Greens', icon: '', route: '/category/greens' },
        { label: 'Tubers', icon: '', route: '/category/tubers' },
        { label: 'Root Veg', icon: '', route: '/category/root%20veg' },
        { label: 'Cruciferous', icon: '', route: '/category/cruciferous' },
      ],
    }
  },
  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    user() {
      return this.userStore.user || { name: '', email: '', avatar: '' }
    },
    count() {
      return this.cartStore.cartCount
    },
    favoriteCount() {
      return 0
    },
    userInitials() {
      if (!this.user.name) return '?'
      return this.user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    },
    locationDisplay() {
      const active = this.locationStore.activeLocation
      if (!active) return this.location
      const parts = (active.address || '').split(', ').filter(Boolean)
      const filtered = parts.filter(p => !/^\d+$/.test(p.trim()) && p.trim().toLowerCase() !== 'cambodia')
      return filtered.slice(-2).join(', ')
    },
  },
  methods: {
    setCategory(cat) {
      this.active = cat.label
      this.$router.push(cat.route)
    },
    openDropdown() {
      this.showDropdown = true
    },
    toSearch() {
      this.searchStore.open(this.query)
      this.$router.push('/search')
    },
    goToCart() {
      this.$router.push('/cart')
    },
    toggleFavorite() {
      this.$router.push('/favorites')
    },
    goToLogin() {
      this.$router.push('/user/login')
    },
    goToRegister() {
      this.$router.push('/user/register')
    },
    toggleProfileMenu() {
      this.profileMenuOpen = !this.profileMenuOpen
    },
    closeProfileMenu() {
      this.profileMenuOpen = false
    },
    goToProfile() {
      this.closeProfileMenu()
      this.$router.push('/profile')
    },
    goToSettings() {
      this.closeProfileMenu()
      this.$router.push('/settings')
    },
    handleLogout() {
      this.closeProfileMenu()
      this.userStore.logout()
      this.$router.push('/')
    },

    syncActiveCategory() {
      const path = this.$route.path
      if (path === '/') this.active = 'Home'
      const cat = this.categories.find(c => c.route === path)
      if (cat) this.active = cat.label
    },

    // Close dropdown when clicking outside
    handleOutsideClick(event) {
      if (this.$refs.profileRef && !this.$refs.profileRef.contains(event.target)) {
        this.closeProfileMenu()
      }
      if (this.$refs.searchRef && !this.$refs.searchRef.contains(event.target)) {
        this.showDropdown = false
      }
    },
  },
  watch: {
    '$route'() {
      this.syncActiveCategory()
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
    this.syncActiveCategory()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
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
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0px;
}

.navbar-top {
  width: 100%;
  padding: 2px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 5px;
}

.logo-text {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
}

.logo-text img {
  width: 120px;
  height: auto;
  display: block;
}

.search {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  pointer-events: auto;
  z-index: 1;
}

.search input {
  width: 100%;
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 24px;
  padding: 0 1rem 0 2.2rem;
  font-size: 14px;
  background: #fafaf8;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search input:focus {
  border-color: #1e4d2b;
  box-shadow: 0 0 0 3px rgba(30, 77, 43, 0.08);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  transition: background 0.2s, color 0.2s;
  color: #555;
  position: relative;
}

.location.located {
  color: #555;
}

.you-are-here {
  font-size: 10px;
  font-weight: 600;
  color: #2D7A3A;
  background: #d0ecda;
  padding: 1px 7px;
  border-radius: 10px;
  white-space: nowrap;
}

.pulse-dot {
  animation: pulseLocation 1.5s ease-in-out infinite;
}

@keyframes pulseLocation {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
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
  padding: 6px 15px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
}

/* ---- Profile Avatar ---- */
.profile-wrapper {
  position: relative;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2D7A3A;
  border: 2px solid #d0ecda;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.profile-avatar:hover,
.profile-avatar[aria-expanded="true"] {
  border-color: #2D7A3A;
  box-shadow: 0 0 0 3px rgba(45, 122, 58, 0.18);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  user-select: none;
}

/* ---- Dropdown ---- */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
  z-index: 999;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f6fbf7;
}

.dropdown-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2D7A3A;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.dropdown-user-info {
  overflow: hidden;
}

.dropdown-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-email {
  margin: 2px 0 0;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
}

.dropdown-menu-list {
  list-style: none;
  margin: 0;
  padding: 6px 0;
}

.dropdown-menu-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-menu-list li:hover {
  background: #f6fbf7;
  color: #2D7A3A;
}

.logout-item {
  color: #e53e3e !important;
}

.logout-item:hover {
  background: #fff5f5 !important;
  color: #c53030 !important;
}

/* ---- Dropdown animation ---- */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---- Bottom nav ---- */
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
  padding: 0px 10px;
  cursor: pointer;
  color: #6b7280;
}

.categories li.active {
  color: #2D7A3A;
  font-weight: 600;
  border-bottom: 2px solid #2D7A3A;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.favorite {
  position: relative;
  width: 30px;
  height: 30px;
  background: #e6f4ea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.favorite:hover { background: #d0ecda; }

.cart {
  position: relative;
  width: 30px;
  height: 30px;
  background: #e6f4ea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.cart:hover { background: #d0ecda; }

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

.cat-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .navbar-top .container {
    flex-wrap: nowrap;
    gap: 4px;
  }

  .logo-text img {
    width: 80px;
  }

  .search {
    flex: 1;
    min-width: 0;
    margin: 0 4px;
  }

  .search input {
    height: 34px;
    font-size: 12px;
    padding: 0 0.6rem 0 1.8rem;
  }

  .search-icon {
    left: 6px;
    width: 13px;
    height: 13px;
  }

  .location-text,
  .you-are-here {
    display: none;
  }

  .location {
    padding: 6px 8px;
  }

  .location svg {
    width: 18px;
    height: 18px;
  }

  .btn-text {
    display: none;
  }

  .btn-login svg,
  .btn-register svg {
    display: block;
  }

  .btn-login,
  .btn-register {
    padding: 6px 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    min-height: 34px;
  }

  .btn-login {
    color: #2D7A3A;
    background: #e6f4ea;
  }

  .btn-register {
    background: #1a5c27;
    color: #fff;
  }

  .navbar-bottom .container {
    position: relative;
    gap: 0;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #e6f4ea;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: #2D7A3A;
  }

  .categories {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    z-index: 99;
    padding: 8px 0;
  }

  .categories.open {
    display: flex;
  }

  .categories li {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
  }

  .categories li:last-child {
    border-bottom: none;
  }

  .categories li.active {
    color: #2D7A3A;
    font-weight: 700;
    background: #f6fbf7;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-actions {
    gap: 4px;
  }

  .nav-actions .favorite,
  .nav-actions .cart {
    width: 28px;
    height: 28px;
  }

  .profile-dropdown {
    right: -8px;
  }
}

@media (min-width: 769px) {
  .menu-toggle {
    display: none;
  }
}
</style>