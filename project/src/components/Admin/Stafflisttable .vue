<template>
  <!--
    StaffListTable
    Props:   staff[]  – array of staff objects
    Emits:   select   – emitted with the clicked staff object
  -->
  <div class="staff-table-card">
    <!-- Search + filters -->
    <div class="table-controls">
      <div class="search-wrap">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search by name, email or ID..."
        />
      </div>
      <div class="filter-wrap">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <button class="filter-btn" title="Advanced filters">
          <i class="bi bi-sliders"></i>
        </button>
      </div>
    </div>

    <!-- Column headings -->
    <div class="col-head">
      <span class="col col-id">Staff ID</span>
      <span class="col col-name">Name &amp; Email</span>
      <span class="col col-role">Role</span>
    </div>

    <!-- Rows -->
    <div class="table-body">
      <div
        v-for="member in filtered"
        :key="member.id"
        :class="['staff-row', selected?.id === member.id && 'staff-row--active']"
        @click="$emit('select', member)"
      >
        <span class="col col-id staff-id">{{ member.staffId }}</span>

        <div class="col col-name name-cell">
          <div class="avatar" :style="{ background: avatarBg(member.name) }">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
            <span v-else>{{ initials(member.name) }}</span>
          </div>
          <div>
            <p class="member-name">{{ member.name }}</p>
            <p class="member-email">{{ member.email }}</p>
          </div>
        </div>

        <div class="col col-role">
          <span :class="['role-badge', `role-badge--${member.roleKey}`]">
            {{ member.role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="table-footer">
      <span class="footer-count">Showing {{ filtered.length }} of {{ staff.length }}</span>
      <div class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="page--">Previous</button>
        <button class="page-btn" :disabled="page * pageSize >= filtered.length" @click="page++">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  staff:    { type: Array,  default: () => [] },
  selected: { type: Object, default: null },
})
defineEmits(['select'])

const search       = ref('')
const statusFilter = ref('all')
const page         = ref(1)
const pageSize     = 8

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return props.staff.filter(m => {
    const matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.staffId.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || m.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

// Avatar helpers
const bgPalette = ['#d1fae5','#dbeafe','#fce7f3','#fef3c7','#ede9fe','#ffedd5']
function avatarBg(name) { return bgPalette[name.charCodeAt(0) % bgPalette.length] }
function initials(name)  { return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() }
</script>

<style scoped>
.staff-table-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

/* Controls */
.table-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f3f4f3;
}
.search-wrap { flex: 1; position: relative; }
.search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: #b0b8b0; font-size: 12px; pointer-events: none;
}
.search-input {
  width: 100%; height: 34px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 0 12px 0 30px; font-size: 12.5px; color: #374151;
  background: #f9fafb; outline: none;
  transition: border-color .14s, box-shadow .14s;
}
.search-input:focus { border-color: #2d6a4f; box-shadow: 0 0 0 3px rgba(45,106,79,.1); background: #fff; }
.search-input::placeholder { color: #b0b8b0; }

.filter-wrap { display: flex; gap: 8px; }
.filter-select {
  height: 34px; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 0 10px; font-size: 12px; color: #374151;
  background: #f9fafb; outline: none; cursor: pointer;
}
.filter-btn {
  width: 34px; height: 34px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #f9fafb; display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: #6b7280; cursor: pointer; transition: background .12s;
}
.filter-btn:hover { background: #f0f7f0; color: #1a3d1a; }

/* Column layout */
.col { display: flex; align-items: center; }
.col-id   { flex: 0 0 90px; }
.col-name { flex: 1; min-width: 0; }
.col-role { flex: 0 0 110px; }

/* Head row */
.col-head {
  display: flex;
  padding: 8px 20px;
  background: #f8f9f8;
  border-bottom: 1px solid #eee;
}
.col-head .col {
  font-size: 10px; font-weight: 700;
  letter-spacing: .6px; text-transform: uppercase; color: #9ca3af;
}

/* Staff rows */
.staff-row {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f3;
  cursor: pointer;
  transition: background .11s;
}
.staff-row:last-child { border-bottom: none; }
.staff-row:hover { background: #f9fafb; }
.staff-row--active { background: #f0f7f0; border-left: 3px solid #2d6a4f; }
.staff-row--active .staff-id { color: #1a3d1a; }

.staff-id {
  font-size: 11px; font-weight: 700;
  color: #9ca3af; font-family: monospace; letter-spacing: .3px;
}

.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #374151;
  flex-shrink: 0; overflow: hidden; border: 1.5px solid #e5e7eb;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.member-name  { font-size: 13px; font-weight: 600; color: #111827; }
.member-email { font-size: 11px; color: #9ca3af; margin-top: 1px; }

/* Role badges */
.role-badge {
  padding: 4px 9px; border-radius: 6px;
  font-size: 10.5px; font-weight: 700;
}
.role-badge--reviewer { background: #d1fae5; color: #065f46; }
.role-badge--lead     { background: #dbeafe; color: #1e40af; }
.role-badge--admin    { background: #ede9fe; color: #5b21b6; }
.role-badge--manager  { background: #fef3c7; color: #92400e; }
.role-badge--default  { background: #f3f4f6; color: #374151; }

/* Footer */
.table-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid #f3f4f3; background: #fafafa;
}
.footer-count { font-size: 11.5px; color: #9ca3af; }
.pagination { display: flex; gap: 6px; }
.page-btn {
  padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 6px;
  background: #fff; font-size: 11.5px; font-weight: 600;
  color: #374151; cursor: pointer; transition: background .11s;
}
.page-btn:hover:not(:disabled) { background: #f0f7f0; border-color: #2d6a4f; color: #1a3d1a; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
</style>