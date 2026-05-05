<template>
  <div class="staff-page">
    <!-- STAFF SUMMARY CARD (like Elite Providers) -->
    <div class="staff-summary-card">
      <div class="card-header">
        <h3 class="card-title">Top Staff</h3>
        <a href="#" class="view-all">View All</a>
      </div>
      <div class="staff-list">
        <div v-for="(s, i) in topStaff" :key="s.id" class="staff-row-summary">
          <div :class="['rank-badge', `rank-badge--${i}`]">
            <i class="bi bi-award-fill" v-if="i === 0"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="staff-info">
            <p class="staff-name">{{ s.name }}</p>
            <p class="staff-role">{{ s.role }}</p>
          </div>
          <div class="staff-status">
            <span :class="['status-tag', `status-tag--${s.status.toLowerCase()}`]">{{ s.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- HEADER -->
    <div class="header">
      <h1>Staff Management</h1>
      <p>Manage staff accounts and permissions</p>
    </div>

    <!-- FILTER -->
    <div class="filter-bar">
      <input v-model="search" placeholder="Search staff..." />
    </div>

    <!-- MAIN -->
    <div class="layout">

      <!-- LEFT: LIST -->
      <div class="list-card">

        <div class="list-header">STAFF</div>

        <div
          v-for="s in filteredStaff"
          :key="s.id"
          class="staff-row"
        >
          <div class="staff-left">
            <img :src="s.avatar" />
            <div>
              <div class="name">{{ s.name }}</div>
              <div class="email">{{ s.email }}</div>
            </div>
          </div>

          <div class="role">{{ s.role }}</div>

          <div class="actions">
            <button @click="viewStaff(s)">View</button>
            <button @click="openEdit(s)">Edit</button>
          </div>
        </div>

      </div>

      <!-- RIGHT: PROFILE -->
      <div v-if="selected" class="profile">

        <div class="profile-card">
          <img :src="selected.avatar" class="avatar-large" />

          <h3>{{ selected.name }}</h3>
          <p>{{ selected.email }}</p>

          <div class="badges">
            <span>{{ selected.role }}</span>
            <span>{{ selected.status }}</span>
          </div>
        </div>

        <div class="info-card">
          <h4>Activity</h4>
          <p><b>Last Login:</b> 2 hours ago</p>
          <p><b>Orders Managed:</b> 15 today</p>
          <p><b>Access:</b> Full</p>
        </div>

        <div class="danger-card">
          <h4>Security</h4>
          <p>Revoke access or reset permissions</p>
          <button>Revoke Access</button>
        </div>

      </div>

    </div>

    <!-- EDIT MODAL -->
    <!-- VIEW MODAL -->
    <div v-if="showView" class="modal">
      <div class="modal-box">
        <h3>Staff Information</h3>
        <div class="view-staff-info">
          <img :src="viewStaffData.avatar" class="avatar-large" style="margin-bottom: 1rem;" />
          <div><b>Name:</b> {{ viewStaffData.name }}</div>
          <div><b>Email:</b> {{ viewStaffData.email }}</div>
          <div><b>Role:</b> {{ viewStaffData.role }}</div>
          <div><b>Status:</b> {{ viewStaffData.status }}</div>
        </div>
        <div class="modal-actions">
          <button @click="showView=false">Close</button>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEdit" class="modal">
      <div class="modal-box">
        <h3>Edit Staff</h3>
        <input v-model="editForm.name" placeholder="Name" />
        <input v-model="editForm.email" placeholder="Email" />
        <input v-model="editForm.role" placeholder="Role" />
        <div class="modal-actions">
          <button @click="saveEdit">Save</button>
          <button @click="showEdit=false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const staff = ref([])
const selected = ref(null)

const search = ref('')
const showEdit = ref(false)
const showView = ref(false)
const editForm = ref({})
const viewStaffData = ref({})

// Top staff logic (e.g., by status or custom sort)
const topStaff = computed(() => {
  // Example: top 3 active staff, sorted by name (customize as needed)
  return staff.value
    .filter(s => s.status === 'Active')
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 3)
})

// FETCH
const fetchStaff = async () => {
  const res = await axios.get('http://localhost:3000/users', {
    params: { role: 'staff' }
  })

  staff.value = res.data.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roleKey || 'Staff',
    status: u.status || 'Active',
    avatar: `https://randomuser.me/api/portraits/men/${u.id % 100}.jpg`
  }))

  selected.value = staff.value[0]
}

// FILTER
const filteredStaff = computed(() =>
  staff.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

// VIEW
const viewStaff = (s) => {
  viewStaffData.value = { ...s }
  showView.value = true
  selected.value = s
}

// EDIT
const openEdit = (s) => {
  editForm.value = { ...s }
  showEdit.value = true
}

const saveEdit = async () => {
  await axios.post(`http://localhost:3000/users/update/${editForm.value.id}`, editForm.value)
  await fetchStaff()
  showEdit.value = false
}

onMounted(fetchStaff)
</script>

<style scoped>
/* View Modal */
.view-staff-info {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.staff-summary-card {
  background: #fff;
  border-radius: 14px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px #0001;
  padding: 1.2rem 1.5rem 1.2rem 1.5rem;
}
.staff-summary-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.staff-summary-card .card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #14532d;
}
.staff-summary-card .view-all {
  font-size: 0.95rem;
  color: #10b981;
  text-decoration: underline;
  cursor: pointer;
}
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.staff-row-summary {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.staff-row-summary:last-child {
  border-bottom: none;
}
.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2f8ec;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 1rem;
  color: #14532d;
  font-size: 1rem;
}
.rank-badge--0 {
  background: #10b981;
  color: #fff;
}
.staff-info {
  flex: 1;
  min-width: 0;
}
.staff-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}
.staff-role {
  font-size: 0.9rem;
  color: #64748b;
}
.staff-status {
  text-align: right;
}
.status-tag {
  font-size: 0.85rem;
  padding: 0.2rem 0.7rem;
  border-radius: 8px;
  background: #e0e7ef;
  color: #374151;
  font-weight: 500;
}
.status-tag--active {
  background: #d1fae5;
  color: #059669;
}
.status-tag--inactive {
  background: #fee2e2;
  color: #dc2626;
}
.staff-page {
  padding: 2rem;
  background: #f8fafc;
}

/* HEADER */
.header h1 {
  color: #14532d;
}
.header p {
  color: #64748b;
}

/* FILTER */
.filter-bar {
  margin: 1rem 0;
}
.filter-bar input {
  width: 300px;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* LAYOUT */
.layout {
  display: flex;
  gap: 2rem;
}

/* LIST */
.list-card {
  flex: 1.2;
  background: white;
  border-radius: 12px;
  padding: 1rem;
}

.list-header {
  font-weight: bold;
  margin-bottom: 1rem;
}

.staff-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
}

.staff-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.staff-left img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.name {
  font-weight: 600;
}

.email {
  font-size: 0.8rem;
  color: #888;
}

.role {
  font-size: 0.8rem;
  background: #e2f8ec;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.actions button {
  margin-left: 5px;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.actions button:first-child {
  background: #14532d;
  color: white;
}

.actions button:last-child {
  background: #f59e42;
  color: white;
}

/* PROFILE */
.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-card {
  background: linear-gradient(135deg, #064e3b, #065f46);
  color: white;
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
}

.avatar-large {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}

.badges span {
  background: #10b981;
  padding: 0.2rem 0.6rem;
  margin: 0.2rem;
  border-radius: 6px;
  display: inline-block;
}

/* INFO */
.info-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
}

/* DANGER */
.danger-card {
  background: #fff1f2;
  padding: 1rem;
  border-radius: 12px;
}
.danger-card button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
}

/* MODAL */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  width: 300px;
}

.modal-box input {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>