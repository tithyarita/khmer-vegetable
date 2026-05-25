
<template>
  <header class="navbar">
    <div class="navbar-top">
      <div class="container">
        <div class="logo">
          <span class="logo-text"><img src="@/assets/images/Logo.png" alt="Logo" /></span>
        </div>
        <div class="search" @click="toSearch">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9CA3AF" stroke-width="1.6"/>
            <path d="M13.5 13.5L17 17" stroke="#9CA3AF" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <input v-model="query" type="text" :placeholder="t('searchPlaceholder')" @click.stop @keyup.enter="toSearch" />
        </div>
        <div class="nav-right">
          <div class="location">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="#555" stroke-width="1.5"/>
              <circle cx="10" cy="8" r="2" stroke="#555" stroke-width="1.5"/>
            </svg>
            <span>{{ location }}</span>
          </div>
          <template v-if="!isLoggedIn">
            <button class="btn-login" @click="goToLogin">{{ t('login') }}</button>
            <button class="btn-register" @click="goToRegister">{{ t('register') }}</button>
          </template>
          <div v-else class="profile-wrapper" ref="profileRef">
            <button class="profile-avatar" @click="toggleProfileMenu" :aria-expanded="profileMenuOpen">
              <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar-img" />
              <span v-else class="avatar-initials">{{ userInitials }}</span>
            </button>
            <transition name="dropdown">
              <div v-if="profileMenuOpen" class="profile-dropdown">
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
                <ul class="dropdown-menu-list">
                  <li @click="goToProfile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#2D7A3A" stroke-width="1.8"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2D7A3A" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    {{ t('myProfile') }}
                  </li>
                  <li @click="goToSettings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="#2D7A3A" stroke-width="1.8"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#2D7A3A" stroke-width="1.8"/>
                    </svg>
                    {{ t('settingsMenu') }}
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
                    {{ t('logout') }}
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
        <ul class="categories">
          <li
            v-for="(cat, index) in categories"
            :key="cat + index"
            :class="{ active: active === cat }"
            @click="setCategory(cat)"
          >
            {{ t(cat) }}
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

<script setup>
import { useCartStore } from '../../stores/cartStore'
import { useSearchStore } from '../../stores/searchStore'
import { useFavoriteStore } from '../../stores/favoriteStore'
import { useLanguageStore } from '@/stores/languageStore.js'
import { messages } from '@/lang/index.js'
import { ref, computed, onMounted } from 'vue'

const cartStore = useCartStore()
const searchStore = useSearchStore()
const favoriteStore = useFavoriteStore()
const languageStore = useLanguageStore()
const t = (key) => messages[languageStore.language][key] || key

const query = ref('')
const location = ref('Phnom Penh, Cambodia')
const active = ref('home')
const isFavorited = ref(false)
const profileMenuOpen = ref(false)
const categories = ['home', 'trackerOrders', 'myOrders']
const isLoggedIn = ref(false)
const user = ref({ name: '', email: '', avatar: '' })

const count = computed(() => cartStore.cartCount)
const favoriteCount = computed(() => favoriteStore.favoriteCount)
const userInitials = computed(() => {
  if (!user.value.name) return '?'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function setCategory(cat) {
  active.value = cat
  if (cat === 'home') window.location.href = '/'
  else if (cat === 'trackerOrders') window.location.href = '/order-tracker'
  else if (cat === 'myOrders') window.location.href = '/MyOrder'
}
function toSearch() {
  searchStore.open(query.value)
  window.location.href = '/search'
}
function goToCart() {
  window.location.href = '/cart'
}
function toggleFavorite() {
  window.location.href = '/favorites'
}
function goToLogin() {
  isLoggedIn.value = true
  user.value = { name: 'Sopheak Chan', email: 'sopheak@example.com', avatar: '' }
}
function goToRegister() {
  window.location.href = '/user/register'
}
function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}
function closeProfileMenu() {
  profileMenuOpen.value = false
}
function goToProfile() {
  closeProfileMenu()
  window.location.href = '/profile'
}
function goToSettings() {
  closeProfileMenu()
  window.location.href = '/settings'
}
function handleLogout() {
  closeProfileMenu()
  isLoggedIn.value = false
  window.location.href = '/'
}
function syncActiveCategory() {
  const path = window.location.pathname
  if (path === '/') active.value = 'home'
  else if (path.startsWith('/order-tracker')) active.value = 'trackerOrders'
  else if (path.startsWith('/MyOrder')) active.value = 'myOrders'
}
function handleOutsideClick(event) {
  const profileRef = document.querySelector('.profile-wrapper')
  if (profileRef && !profileRef.contains(event.target)) {
    closeProfileMenu()
  }
}
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  syncActiveCategory()
})
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
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 5px 5px;
  background: #f9fafb;
  margin: 0 25px;
}

.search-icon {
  cursor: pointer;
}

.search input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
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
  .profile-dropdown {
    right: -8px;
  }
}
</style>