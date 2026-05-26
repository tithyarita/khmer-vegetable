<template>
  <header class="topbar">

    <!-- Search -->
    <div class="topbar-search" ref="searchWrap">
      <i class="bi bi-search search-icon"></i>
      <input
        v-model="query"
        type="text"
        placeholder="Search applications by ID or name…"
        class="search-input"
        @input="onInput"
        @focus="showResults = results.length > 0"
        autocomplete="off"
      />
      <i v-if="searching" class="bi bi-arrow-repeat spin search-spin"></i>

            <!-- Results panel — replace the existing one -->
      <transition name="drop">
        <div v-if="showResults" class="results-panel">
        
          <div v-if="results.length === 0 && !searching" class="results-empty">
            <i class="bi bi-inbox" style="font-size:20px; display:block; margin-bottom:6px;"></i>
            No applications found for "{{ query }}"
          </div>
        
          <div
            v-for="app in results"
            :key="app.id"
            class="result-row"
            @mousedown.prevent="goToApp(app)"
          >
            <div class="result-left">
              <span class="result-id">APP-{{ String(app.id).padStart(7, '0') }}</span>
              <span class="result-name">{{ app.business_name }}</span>
            </div>
            <div class="result-right">
              <span class="result-owner">{{ app.owner_name }}</span>
              <span :class="['result-badge', `badge--${app.application_status}`]">
                {{ app.application_status }}
              </span>
            </div>
          </div>
        
        </div>
      </transition>
    </div>

    <!-- Right: bell + user -->
    <div class="topbar-actions">
      <button class="icon-btn" aria-label="Notifications">
        <i class="bi bi-bell"></i>
        <span class="notif-dot"></span>
      </button>

      <router-link to="/staff/profile" class="user-chip">
        <div class="user-info">
          <span class="user-name">{{ displayName }}</span>
          <span class="user-role">{{ displayRole }}</span>
        </div>
        <div class="user-avatar">
          <i class="bi bi-person-fill"></i>
        </div>
      </router-link>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const router    = useRouter()
const userStore = useUserStore()

// ── User display ─────────────────────────────────────────────────────────────
const displayName = computed(() =>
  userStore.user?.name || userStore.user?.email || 'Unknown'
)
const displayRole = computed(() =>
  (userStore.user?.role || 'STAFF').toUpperCase()
)

// ── Search state ─────────────────────────────────────────────────────────────
const query       = ref('')
const results     = ref([])
const searching   = ref(false)
const showResults = ref(false)
const searchWrap  = ref(null)

let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  const q = query.value.trim()

  if (!q) {
    results.value     = []
    showResults.value = false
    return
  }

  debounceTimer = setTimeout(() => fetchResults(q), 350)
}

async function fetchResults(q) {
  searching.value = true
  try {
    const res  = await fetch(`${API_BASE}/api/applications?search=${encodeURIComponent(q)}`)
    if (!res.ok) throw new Error('Search failed')
    const data = await res.json()
    results.value     = Array.isArray(data) ? data : (data.data ?? [])
    showResults.value = true
  } catch {
    results.value     = []
    showResults.value = true   
  } finally {
    searching.value = false
  }
}

function goToApp(app) {
  showResults.value = false
  query.value       = ''
  results.value     = []
  router.push(`/staff/details/${app.id}`)
}

function onClickOutside(e) {
  if (searchWrap.value && !searchWrap.value.contains(e.target)) {
    showResults.value = false
  }
}

onMounted(()        => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(()  => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.topbar {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #ebebeb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
  position: relative;   
  z-index: 100;
}

/* ── Search ── */
.topbar-search {
  flex: 1;
  max-width: 420px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b8b0;
  font-size: 12px;
  pointer-events: none;
  z-index: 1;
}
.search-spin {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #52b788;
  font-size: 13px;
}
.spin { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

.search-input {
  width: 100%;
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 32px 0 30px;
  font-size: 12.5px;
  color: #374151;
  background: #f9fafb;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: #52b788;
  box-shadow: 0 0 0 3px rgba(82,183,136,.12);
  background: #fff;
}

/* ── Results panel ── */
.results-panel {
  position: fixed;
  top: 52px;                /* stick to bottom of topbar */
  left: 0;
  right: 0;
  max-height: 50vh;
  overflow-y: auto;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 12px 32px rgba(0,0,0,.10);
  z-index: 999;
}

.results-empty {
  padding: 28px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background .12s;
  gap: 16px;
}
.result-row:last-child { border-bottom: none; }
.result-row:hover { background: #f0fdf4; }

.result-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.result-id {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: .4px;
}
.result-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.result-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.result-owner {
  font-size: 12px;
  color: #6b7280;
}

.result-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: .4px;
}
.badge--pending  { background: #fef9c3; color: #854d0e; }
.badge--approved { background: #dcfce7; color: #166534; }
.badge--rejected { background: #fee2e2; color: #991b1b; }

/* Panel animation */
.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Right actions ── */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.icon-btn {
  width: 32px; height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #f8f9f8;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #6b7280; cursor: pointer;
  position: relative; transition: background .13s;
}
.icon-btn:hover { background: #f0f7f0; color: #1a3d1a; }
.notif-dot {
  width: 6px; height: 6px; background: #ef4444;
  border-radius: 50%; position: absolute; top: 5px; right: 5px;
  border: 1.5px solid #fff;
}
.user-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 3px 5px 3px 10px;
  border: 1px solid #e5e7eb; border-radius: 20px;
  cursor: pointer; transition: background .13s;
}
.user-chip:hover { background: #f0f7f0; }
.user-info { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; }
.user-name { font-size: 12px; font-weight: 700; color: #111827; }
.user-role { font-size: 9.5px; color: #6b7280; letter-spacing: .3px; }
.user-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #1a3d2a; color: #fff; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
</style>