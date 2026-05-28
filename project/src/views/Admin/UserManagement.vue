<template>
  <div class="admin-users-page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h1 class="title">Users Management</h1>
        <p class="subtitle">
          Manage all registered users
        </p>
      </div>

      <div class="actions">

        <input
          v-model="search"
          type="text"
          placeholder="Search users..."
        />

        <button
          class="btn primary"
          @click="openModal"
        >
          + Add User
        </button>

        <button
          class="btn outline"
          @click="exportCSV"
        >
          Export CSV
        </button>

      </div>

    </div>

    <!-- ERROR -->
    <div
      v-if="errorMessage"
      class="error-box"
    >
      {{ errorMessage }}
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="loading"
    >
      Loading users...
    </div>

    <!-- STATS -->
    <div
      v-if="!loading"
      class="stats"
    >

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
    <div
      v-if="!loading"
      class="table-wrapper"
    >

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

          <tr v-if="filteredUsers.length === 0">
            <td colspan="7" class="empty">
              No users found
            </td>
          </tr>

          <tr
            v-for="user in filteredUsers"
            :key="user.id"
          >
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <span class="role">
                {{ user.role }}
              </span>
            </td>
            <td>
              {{ formatDate(user.created_at) }}
            </td>

            <td>
              <button
                class="danger"
                @click="deleteUser(user.id)"
              >
                Delete
              </button>
            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- MODAL -->
   <!-- MODAL -->
<transition name="fade">
  <div
    v-if="showModal"
    class="modal-overlay"
    @click.self="closeModal"
  >

    <div class="modal-box">

      <div class="modal-header">
        <h2>Add New User</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="submitUser" class="modal-form">

        <input v-model="newUser.name" type="text" placeholder="Full Name" required />
        <input v-model="newUser.email" type="email" placeholder="Email Address" required />
        <input v-model="newUser.phone" type="text" placeholder="Phone Number" required />
        <input v-model="newUser.password" type="password" placeholder="Password" required />

        <select v-model="newUser.role" required>
          <option disabled value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="provider">Provider</option>
          <option value="customer">Customer</option>
        </select>

        <div class="modal-actions">

          <button class="btn primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save User' }}
          </button>

          <button class="btn outline" type="button" @click="closeModal">
            Cancel
          </button>

        </div>

      </form>

    </div>

  </div>
</transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_URL = `${BASE}/users`
const REGISTER_URL = `${BASE}/users/register`

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const users = ref([])

const loading = ref(false)
const submitting = ref(false)

const search = ref('')

const errorMessage = ref('')

const showModal = ref(false)

const newUser = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer'
})

/*
|--------------------------------------------------------------------------
| FETCH USERS
|--------------------------------------------------------------------------
*/

const fetchUsers = async () => {

  loading.value = true
  errorMessage.value = ''

  try {

    const response = await axios.get(API_URL)

    console.log('Users:', response.data)

    users.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {

    console.error('Fetch users failed:', error)

    if (error.response) {

      console.log(
        'Backend Error:',
        error.response.data
      )

      errorMessage.value =
        error.response.data.message ||
        `Server Error (${error.response.status})`

    } else if (error.request) {

      errorMessage.value =
        'Cannot connect to backend server.'

    } else {

      errorMessage.value =
        error.message || 'Unknown error.'

    }

  } finally {

    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

const deleteUser = async (id) => {

  const confirmed = confirm(
    'Delete this user?'
  )

  if (!confirmed) return

  try {

    await axios.delete(`${API_URL}/${id}`)

    users.value = users.value.filter(
      user => user.id !== id
    )

  } catch (error) {

    console.error('Delete failed:', error)

    alert(
      error.response?.data?.message ||
      'Delete failed'
    )
  }
}

/*
|--------------------------------------------------------------------------
| ADD USER
|--------------------------------------------------------------------------
*/

const openModal = () => {
   console.log("CLICKED")

  newUser.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitUser = async () => {

  submitting.value = true

  try {

    const response = await axios.post(
      REGISTER_URL,
      newUser.value
    )

    console.log(
      'User created:',
      response.data
    )

    showModal.value = false

    await fetchUsers()

  } catch (error) {

    console.error(
      'Create user failed:',
      error
    )

    alert(
      error.response?.data?.message ||
      'Failed to create user'
    )

  } finally {

    submitting.value = false
  }
}

/*
|--------------------------------------------------------------------------
| FILTER USERS
|--------------------------------------------------------------------------
*/

const filteredUsers = computed(() => {

  const keyword = search.value.toLowerCase()

  return users.value.filter(user => {

    const name =
      (user.name || '').toLowerCase()

    const email =
      (user.email || '').toLowerCase()

    return (
      name.includes(keyword) ||
      email.includes(keyword)
    )
  })
})


/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

const totalUsers = computed(() =>
  users.value.length
)

const totalAdmins = computed(() =>
  users.value.filter(
    user => user.role === 'admin'
  ).length
)

const totalStaff = computed(() =>
  users.value.filter(
    user => user.role === 'staff'
  ).length
)

const totalProviders = computed(() =>
  users.value.filter(
    user => user.role === 'provider'
  ).length
)

const totalCustomers = computed(() =>
  users.value.filter(
    user => user.role === 'customer'
  ).length
)

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

  if (!date) return '-'

  return new Date(date).toLocaleString()
}

/*
|--------------------------------------------------------------------------
| EXPORT CSV
|--------------------------------------------------------------------------
*/

const exportCSV = () => {

  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Role',
    'Created'
  ]

  const rows = users.value.map(user => [
    user.id,
    user.name,
    user.email,
    user.phone,
    user.role,
    formatDate(user.created_at)
  ])

  const csv = [headers, ...rows]
    .map(row =>
      row.map(col => `"${col}"`).join(',')
    )
    .join('\n')

  const blob = new Blob(
    [csv],
    {
      type: 'text/csv;charset=utf-8;'
    }
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url
  link.download = 'users.csv'

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
}

/*
|--------------------------------------------------------------------------
| ON MOUNT
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await fetchUsers()
})
</script>

<style scoped>

.admin-users-page{
  padding:30px;
  background:#f5f7fb;
  min-height:100vh;
  font-family:Arial,sans-serif;
}

/* HEADER */

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:25px;
  gap:20px;
}

.title{
  margin:0;
  font-size:28px;
  color:#166534;
}

.subtitle{
  margin-top:6px;
  color:#666;
}

/* ACTIONS */

.actions{
  display:flex;
  gap:10px;
  align-items:center;
}

.actions input{
  width:220px;
  padding:10px;
  border:1px solid #ddd;
  border-radius:8px;
}

/* BUTTONS */

.btn{
  border:none;
  padding:10px 16px;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
}

.primary{
  background:#166534;
  color:white;
}

.outline{
  background:white;
  color:#166534;
  border:1px solid #166534;
}

.danger{
  background:#dc2626;
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:6px;
  cursor:pointer;
}

/* ERROR */

.error-box{
  background:#fee2e2;
  color:#991b1b;
  padding:14px;
  border-radius:10px;
  margin-bottom:20px;
}

/* LOADING */

.loading{
  background:white;
  padding:30px;
  border-radius:12px;
  text-align:center;
}

/* STATS */

.stats{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:15px;
  margin-bottom:25px;
}

.card{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
}

.card h3{
  margin:0;
  font-size:14px;
  color:#666;
}

.card p{
  margin-top:10px;
  font-size:24px;
  font-weight:bold;
  color:#166534;
}

/* TABLE */

.table-wrapper{
  background:white;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
}

table{
  width:100%;
  border-collapse:collapse;
}

th,
td{
  padding:14px;
  border-bottom:1px solid #eee;
  text-align:left;
}

th{
  background:#f3f4f6;
}

.role{
  background:#ecfdf5;
  color:#166534;
  padding:4px 10px;
  border-radius:999px;
  font-size:13px;
}

.empty{
  text-align:center;
  color:#888;
}

/* MODAL */
/* BACKDROP */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

/* MODAL BOX */
.modal-box {
  width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  animation: pop 0.2s ease;
}

/* HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h2 {
  font-size: 18px;
  margin: 0;
  color: #166534;
}

/* CLOSE BUTTON */
.close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #666;
}

/* FORM */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-form input,
.modal-form select {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: 0.2s;
}

.modal-form input:focus,
.modal-form select:focus {
  border-color: #166534;
  box-shadow: 0 0 0 2px rgba(22,101,52,0.15);
}

/* ACTIONS */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

/* BUTTONS */
.btn {
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.primary {
  background: #166534;
  color: white;
}

.outline {
  background: white;
  border: 1px solid #166534;
  color: #166534;
}

/* ANIMATION */
@keyframes pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-backdrop{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.5);

  display:flex;
  justify-content:center;
  align-items:center;

  z-index:9999;
}

.modal{
  background:white;
  width:420px;
  max-width:95%;
  padding:28px;
  border-radius:18px;

  box-shadow:
    0 10px 25px rgba(0,0,0,0.15);

  animation:popup 0.2s ease;
}

.modal form{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.modal input,
.modal select{
  padding:12px;
  border:1px solid #ddd;
  border-radius:8px;
}

.modal-actions{
  display:flex;
  justify-content:space-between;
  margin-top:10px;
}
.admin-users-page{
  position:relative;
  overflow:visible;
}


/* RESPONSIVE */
@keyframes popup{

  from{
    opacity:0;
    transform:scale(0.9);
  }

  to{
    opacity:1;
    transform:scale(1);
  }
}

@media(max-width:1000px){

  .stats{
    grid-template-columns:repeat(2,1fr);
  }

  .header{
    flex-direction:column;
    align-items:flex-start;
  }

  .actions{
    width:100%;
    flex-wrap:wrap;
  }
}

</style>