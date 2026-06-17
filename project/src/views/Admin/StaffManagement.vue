<template>
  <div class="staff-page">

    <!-- TOP STAFF CARD -->
    <div class="staff-summary-card">
      <div class="card-header">
        <h3 class="card-title">Top Staff</h3>
      </div>
      <div class="staff-list">
        <div v-for="(s, i) in topStaff" :key="s.id" class="staff-row-summary">
          <div :class="['rank-badge', `rank-badge--${i}`]">
            <i class="bi bi-award-fill" v-if="i === 0"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="staff-info">
            <p class="staff-name">{{ s.name }}</p>
            <p class="staff-role">ID: #{{ s.id }} · {{ s.role }}</p>
          </div>
          <div class="top-stats">
            <span class="top-stat approved"> {{ s.approved }}</span>
            <span class="top-stat rejected"> {{ s.rejected }}</span>
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

    <!-- TABLE -->
    <div class="list-card">
      <table class="staff-table">
        <thead>
          <tr>
            <th>STAFF ID</th>
            <th>NAME & EMAIL</th>
            <th>ROLE</th>
            <th>STATUS</th>
            <th style="text-align:center;">APPROVED</th>
            <th style="text-align:center;">REJECTED</th>
            <th style="text-align:center;">TOTAL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredStaff" :key="s.id" @click="selected = s" :class="{ selected: selected?.id === s.id }">
            <td class="id-cell">#{{ s.id }}</td>
            <td>
              <div class="name-email">
                <img :src="resolveAvatar(s.avatar)" @error="e => e.target.style.display='none'" class="row-avatar" />
                <div>
                  <div class="name">{{ s.name }}</div>
                  <div class="email">{{ s.email }}</div>
                </div>
              </div>
            </td>
            <td><span class="role-tag">{{ s.role }}</span></td>
            <td>
              <span :class="['status-tag', `status-tag--${s.status.toLowerCase()}`]">{{ s.status }}</span>
            </td>
            <td style="text-align:center;">
              <span class="count-badge approved">{{ s.approved }}</span>
            </td>
            <td style="text-align:center;">
              <span class="count-badge rejected">{{ s.rejected }}</span>
            </td>
            <td style="text-align:center;">
              <span class="count-badge total">{{ s.total }}</span>
            </td>
            <td>
              <div class="actions">
                <button @click.stop="viewStaff(s)">View</button>
                <button @click.stop="openEdit(s)">Edit</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredStaff.length === 0">
            <td colspan="8" style="text-align:center;color:#888;padding:20px;">No staff found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showView" class="modal">
      <div class="modal-box">
        <h3>Staff Information</h3>
        <div class="view-staff-info">
          <img :src="resolveAvatar(viewStaffData.avatar)" class="avatar-large" style="margin-bottom:1rem;" @error="e=>e.target.style.display='none'" />
          <div><b>Staff ID:</b> #{{ viewStaffData.id }}</div>
          <div><b>Name:</b> {{ viewStaffData.name }}</div>
          <div><b>Email:</b> {{ viewStaffData.email }}</div>
          <div><b>Role:</b> {{ viewStaffData.role }}</div>
          <div><b>Status:</b> {{ viewStaffData.status }}</div>
          <div><b>Approved:</b> {{ viewStaffData.approved }}</div>
          <div><b>Rejected:</b> {{ viewStaffData.rejected }}</div>
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

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const resolveAvatar = (avatar) => {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  return `${API}${avatar.startsWith('/') ? '' : '/'}${avatar}`
}

const staff       = ref([])
const selected    = ref(null)
const search      = ref('')
const showEdit    = ref(false)
const showView    = ref(false)
const editForm    = ref({})
const viewStaffData = ref({})

// Top 3 staff by name
const topStaff = computed(() =>
  [...staff.value]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
)

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchStaff = async () => {
  const [staffRes, appsRes] = await Promise.all([
    axios.get(`${API}/users`, { params: { role: 'staff' } }),
    axios.get(`${API}/api/applications`),
  ])

  const apps = appsRes.data

  staff.value = staffRes.data.map(u => {
    const staffApps = apps.filter(a => a.staff_reviewed_by?.user_id === u.id)
    const approved  = staffApps.filter(a => a.application_status === 'approved').length
    const rejected  = staffApps.filter(a => a.application_status === 'rejected').length

    return {
      id:     u.id,
      name:   u.name,
      email:  u.email,
      role:   u.role || 'staff',
      status: u.status || 'Active',
      avatar: u.avatar || '',
      approved,
      rejected,
      total:    approved + rejected,
    }
  })

  if (staff.value.length > 0) selected.value = staff.value[0]
}

// ── Filter ────────────────────────────────────────────────────────────────
const filteredStaff = computed(() =>
  staff.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase()) ||
    s.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

// ── View ──────────────────────────────────────────────────────────────────
const viewStaff = (s) => {
  viewStaffData.value = { ...s }
  showView.value = true
  selected.value = s
}

// ── Edit ──────────────────────────────────────────────────────────────────
const openEdit = (s) => {
  editForm.value = { ...s }
  showEdit.value = true
}

const saveEdit = async () => {
  try {
    // Use the correct PUT /users/:id endpoint
    await axios.put(`${API}/users/${editForm.value.id}`, {
      name:  editForm.value.name,
      email: editForm.value.email,
    })
    await fetchStaff()
    showEdit.value = false
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save')
  }
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
/* TABLE */
.staff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.87rem;
}
.staff-table th {
  background: #f6f6f6;
  color: #374151;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  text-align: left;
  white-space: nowrap;
}
.staff-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.staff-table tr:hover   { background: #f9fafb; cursor: pointer; }
.staff-table tr.selected { background: #f0fdf4; }

.id-cell { color: #6b7280; font-size: 0.82rem; white-space: nowrap; }

.name-email { display: flex; align-items: center; gap: 10px; }
.row-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #e2f8ec; }

.role-tag {
  background: #e2f8ec; color: #14532d;
  padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; white-space: nowrap;
}

.count-badge {
  display: inline-block;
  min-width: 28px;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.82rem;
  text-align: center;
}
.count-badge.approved { background: #dcfce7; color: #15803d; }
.count-badge.rejected { background: #fee2e2; color: #dc2626; }
.count-badge.total    { background: #e0e7ff; color: #3730a3; }

/* TOP STAFF */
.top-stats { display: flex; gap: 8px; margin-right: 12px; }
.top-stat  { font-size: 0.82rem; font-weight: 600; }
.top-stat.approved { color: #15803d; }
.top-stat.rejected { color: #dc2626; }
</style>