<template>
  <div class="provider-management-page">

    <!-- HEADER -->
    <div class="header-row">
      <div>
        <h1 class="title">Staff Management</h1>
        <p class="subtitle">
          Manage staff accounts and permissions across the marketplace ecosystem.
        </p>
      </div>

      <button class="apply-filter-btn" @click="showAddModal = true">
        + Add Staff Member
      </button>
    </div>

    <!-- MAIN -->
    <div class="main-content">

      <!-- TABLE -->
      <div class="table-section">

        <table class="provider-table compact-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>STAFF</th>
              <th>EMAIL</th>
              <th>ROLE</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="s in staffList"
              :key="s.id"
              @click="selectStaff(s)"
              :class="{ selected: selectedMember?.id === s.id }"
              style="font-size:0.85rem; height:32px;"
            >
              <td>{{ s.staffId }}</td>

              <td>
                <div class="farm-owner" style="gap:0.3rem;">
                  <img :src="s.avatar" class="avatar" />
                  <div>
                    <div class="farm-name">{{ s.name }}</div>
                    <div class="owner-name">{{ s.role }}</div>
                  </div>
                </div>
              </td>

              <td>{{ s.email }}</td>
              <td>{{ s.role }}</td>
            </tr>
          </tbody>
        </table>

      </div>

      <!-- DETAILS -->
      <div class="details-section" v-if="selectedMember">

        <div class="details-card compact-details">
          <h3>Staff Details</h3>

          <div class="compact-row"><b>👤</b> {{ selectedMember.name }}</div>
          <div class="compact-row"><b>✉️</b> {{ selectedMember.email }}</div>
          <div class="compact-row"><b>🧑‍💼</b> {{ selectedMember.role }}</div>
          <div class="compact-row"><b>📞</b> {{ selectedMember.phone }}</div>
          <div class="compact-row"><b>📊</b> {{ selectedMember.status }}</div>
          <div class="compact-row"><b>🏠</b> {{ selectedMember.address }}</div>

        </div>

      </div>

    </div>

    <!-- ADD MODAL -->
    <div v-if="showAddModal" class="modal-overlay compact-modal">
      <div class="modal-content compact-modal-content">

        <h4>Add Staff Member</h4>

        <form @submit.prevent="addStaff">

          <div class="form-row">
            <label>Name</label>
            <input v-model="newStaff.name" required />
          </div>

          <div class="form-row">
            <label>Email</label>
            <input v-model="newStaff.email" required />
          </div>

          <div class="form-row">
            <label>Role</label>
            <select v-model="newStaff.roleKey">
              <option value="reviewer">Staff Reviewer</option>
              <option value="lead">Review Lead</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="modal-actions compact-actions">
            <button type="submit">Save</button>
            <button type="button" @click="showAddModal = false">Cancel</button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// STATE
const staffList = ref([])
const selectedMember = ref(null)
const showAddModal = ref(false)

const newStaff = ref({
  name: '',
  email: '',
  roleKey: 'reviewer'
})

// ROLE MAP
const roleLabels = {
  reviewer: 'Staff Reviewer',
  lead: 'Review Lead',
  manager: 'Manager',
  admin: 'Admin'
}

// FETCH STAFF (ONLY role = staff)
const fetchStaff = async () => {
  try {
    const res = await axios.get('http://localhost:3000/users', {
      params: { role: 'staff' }
    })

    staffList.value = res.data.map(u => ({
      id: u.id,
      staffId: `#STF-${1000 + u.id}`,
      name: u.name,
      phone: u.phone || 'N/A',
      email: u.email,
      role: roleLabels[u.roleKey] || u.role,
      roleKey: u.roleKey,
      address: u.address || 'N/A',
      status: u.status || 'Active',
      avatar: u.imageUrl || `https://randomuser.me/api/portraits/men/${u.id % 100}.jpg`
    }))

    selectedMember.value = staffList.value[0] || null

  } catch (err) {
    console.error(err)
  }
}

// SELECT
const selectStaff = (s) => {
  selectedMember.value = s
}

// ADD STAFF
const addStaff = async () => {
  try {
    await axios.post('http://localhost:3000/users', {
      ...newStaff.value,
      role: 'staff'
    })

    await fetchStaff()

    newStaff.value = { name: '', email: '', roleKey: 'reviewer' }
    showAddModal.value = false

  } catch (err) {
    alert('Failed to add staff')
  }
}

onMounted(fetchStaff)
</script>

<style scoped>
/* SAME DESIGN SYSTEM AS PROVIDER PAGE */

/* PAGE */
.provider-management-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* HEADER */
.header-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #14532d;
}

.subtitle {
  color: #64748b;
}

/* BUTTON */
.apply-filter-btn {
  background: #14532d;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

/* LAYOUT */
.main-content {
  display: flex;
  gap: 2rem;
}

.table-section {
  flex: 2;
  background: white;
  padding: 1rem;
  border-radius: 12px;
}

.details-section {
  flex: 1;
}

/* TABLE */
.provider-table {
  width: 100%;
  border-collapse: collapse;
}

.provider-table th {
  text-align: left;
  padding: 0.5rem;
  color: #64748b;
}

.provider-table td {
  padding: 0.5rem;
}

.provider-table tr.selected {
  background: #f1f5f9;
}

/* USER CELL */
.farm-owner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

/* DETAILS */
.details-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  width: 300px;
}

/* FORM */
.form-row {
  margin-bottom: 0.5rem;
}

input, select {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>