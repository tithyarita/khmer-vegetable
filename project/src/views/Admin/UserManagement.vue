<template>
  <div class="admin-users-page">
    <!-- HEADER -->
    <div class="header">
      <div>
        <h1 class="title">Users Management</h1>
        <p class="subtitle">Manage all registered users in the system</p>
      </div>

      <div class="actions">
        <input v-model="search" type="text" placeholder="Search users..." />
        <button class="btn primary" @click="addUser">+ Add User</button>
        <button class="btn outline" @click="exportCSV">Export CSV</button>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats">
      <div class="card">
        <h3>Total Users</h3>
        <p>{{ totalUsers }}</p>
      </div>
      <div class="card">
        <h3>Admins</h3>
        <p>{{ totalAdmins }}</p>
      </div>
      <div class="card">
        <h3>Staff</h3>
        <p>{{ totalStaff }}</p>
      </div>
      <div class="card">
        <h3>Providers</h3>
        <p>{{ totalProviders }}</p>
      </div>
      <div class="card">
        <h3>Customers</h3>
        <p>{{ totalCustomers }}</p>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.role }}</td>
            <td>{{ formatDate(user.createat) }}</td>
            <td>
              <button class="danger" @click="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal">
        <h2>Add User</h2>
        <form @submit.prevent="submitUser">
          <input v-model="newUser.name" placeholder="Name" required />
          <input v-model="newUser.email" placeholder="Email" required />
          <input v-model="newUser.phone" placeholder="Phone" required />
          <input v-model="newUser.password" type="password" placeholder="Password" required />
          <select v-model="newUser.role" required>
            <option disabled value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="provider">Provider</option>
            <option value="customer">Customer</option>
          </select>

          <div class="modal-actions">
            <button class="btn primary" type="submit">Save</button>
            <button class="btn" type="button" @click="showAddModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/users'
const REGISTER_URL = 'http://localhost:3000/users/register'

const users = ref([])
const search = ref('')
const showAddModal = ref(false)

const newUser = ref({ name: '', email: '', phone: '', password: '', role: '' })

const fetchUsers = async () => {
  const res = await axios.get(API_URL)
  users.value = res.data
}

const deleteUser = async (id) => {
  await axios.delete(`${API_URL}/${id}`)
  fetchUsers()
}

const filteredUsers = computed(() => {
  return users.value.filter(u =>
    (u.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.value.toLowerCase())
  )
})

const totalUsers = computed(() => users.value.length)
const totalAdmins = computed(() => users.value.filter(u => u.role === 'admin').length)
const totalStaff = computed(() => users.value.filter(u => u.role === 'staff').length)
const totalProviders = computed(() => users.value.filter(u => u.role === 'provider').length)
const totalCustomers = computed(() => users.value.filter(u => u.role === 'customer').length)

const formatDate = (d) => d ? new Date(d).toLocaleString() : ''

const addUser = () => {
  newUser.value = { name: '', email: '', phone: '', password: '', role: 'customer' }
  showAddModal.value = true
}

const submitUser = async () => {
  await axios.post(REGISTER_URL, newUser.value)
  showAddModal.value = false
  fetchUsers()
}

const exportCSV = () => {
  const header = ['ID','Name','Email','Phone','Role','Created']
  const rows = users.value.map(u => [u.id,u.name,u.email,u.phone,u.role,formatDate(u.createat)])

  const csv = [header,...rows]
    .map(r => r.map(v => `"${v}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'users.csv'
  link.click()
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-users-page{
  padding:30px;
  background:#f6f7fb;
  min-height:100vh;
  font-family:Arial;
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}

.title{color:#14532d;margin:0;font-size:28px}
.subtitle{color:#666;margin:4px 0 0}

.actions{display:flex;gap:10px;align-items:center}
.actions input{
  padding:10px;
  border-radius:8px;
  border:1px solid #ddd;
  width:220px;
}

.btn{
  padding:10px 14px;
  border-radius:8px;
  border:none;
  cursor:pointer;
}

.primary{background:#166534;color:white}
.outline{border:1px solid #166534;background:white;color:#166534}

.stats{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:15px;
  margin:20px 0;
}

.card{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
  text-align:center;
}

.card h3{margin:0;font-size:14px;color:#666}
.card p{font-size:22px;font-weight:bold;color:#14532d;margin-top:8px}

.table-wrapper{
  background:white;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
}

table{width:100%;border-collapse:collapse}
th,td{padding:12px;border-bottom:1px solid #eee;text-align:left}
th{background:#f3f4f6}

.danger{
  background:#dc2626;
  color:white;
  padding:6px 10px;
  border:none;
  border-radius:6px;
  cursor:pointer;
}

.modal-backdrop{
  position:fixed;top:0;left:0;right:0;bottom:0;
  background:rgba(0,0,0,0.4);
  display:flex;align-items:center;justify-content:center;
}

.modal{
  background:white;
  padding:20px;
  border-radius:12px;
  width:350px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.modal input, .modal select{
  padding:10px;
  border:1px solid #ddd;
  border-radius:8px;
}

.modal-actions{display:flex;justify-content:space-between;margin-top:10px}
</style>