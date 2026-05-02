<template>
  <div class="admin-users-page">
    <!-- HEADER -->
    <div class="header-row">
      <div>
        <h1 class="page-title">Users Management</h1>
        <p class="subtitle">
          Manage all registered users stored in MySQL database.
        </p>
      </div>
      <div class="search-bar">
        <input
          v-model="search"
          type="text"
          placeholder="Search by name or email..."
        />
        <button class="btn-green" @click="addUser">
          Add User
        </button>
        <button class="btn-outline" @click="exportCSV">
          Export CSV
        </button>
      </div>
    </div>
    <!-- TABLE -->
    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>PHONE</th>
            <th>ROLE</th>
            <th>CREATEAT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.role }}</td>
            <td>{{ formatDate(user.createat)}}</td>
            <td>
              <button class="btn-table" @click="deleteUser(user.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Add User Modal -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal animate-modal">
        <button class="modal-close" @click="showAddModal = false">×</button>
        <h2>Add New User</h2>
        <form @submit.prevent="submitUser">
          <input v-model="newUser.name" type="text" placeholder="Name" required />
          <input v-model="newUser.email" type="email" placeholder="Email" required />
          <input v-model="newUser.phone" type="text" placeholder="Phone" required />
          <input v-model="newUser.password" type="password" placeholder="Password" required />
          <select v-model="newUser.role" required>
            <option value="" disabled>Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="provider">Provider</option>
            <option value="customer">Customer</option>
          </select>
          <div class="modal-actions">
            <button type="submit" class="btn-green">Add</button>
            <button type="button" @click="showAddModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/users'
const REGISTER_URL = 'http://localhost:3000/users/register'

const users = ref([])
const search = ref('')

// =====================
// GET USERS FROM MYSQL
// =====================
const fetchUsers = async () => {
  try {
    const res = await axios.get(API_URL)
    users.value = res.data
  } catch (err) {
    console.error('Fetch error:', err)
  }
}
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}


// =====================
// DELETE USER
// =====================
const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`)
    await fetchUsers()
  } catch (err) {
    console.error('Delete error:', err)
  }
}

// =====================
// SEARCH FILTER
// =====================
const filteredUsers = computed(() => {
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.value.toLowerCase())
  )
})

// LOAD DATA
onMounted(() => {
  fetchUsers()
})

// Add User Modal
const showAddModal = ref(false)
const newUser = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: ''
})

function addUser() {
  showAddModal.value = true
  newUser.value = { name: '', email: '', phone: '', password: '', role: 'customer' }
}

async function submitUser() {
  try {
    const res = await axios.post(REGISTER_URL, newUser.value)
    showAddModal.value = false
    await fetchUsers()
    // Show success message
    alert(res.data?.message || 'User added successfully!')
  } catch (err) {
    alert('Failed to add user')
    console.error(err)
  }
}

// Export users to CSV
function exportCSV() {
  if (!users.value.length) {
    alert('No users to export.');
    return;
  }
  const header = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Created At'];
  const rows = users.value.map(u => [
    u.id,
    u.name,
    u.email,
    u.phone ? `="${u.phone}"` : '',
    u.role,
    formatDate(u.createat)
  ]);
  const csvContent = [header, ...rows]
    .map(e => e.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'users.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
<style scoped>
.admin-users-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding: 32px 40px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title {
  color: #17603a;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.subtitle {
  color: #4b5563;
  font-size: 1rem;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-bar input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 18px;
  width: 320px;
  font-size: 1rem;
}
.btn-green {
  background: #17603a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-green:hover {
  background: #14532d;
}
.btn-outline {
  border: 1.5px solid #17603a;
  color: #17603a;
  background: #fff;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 12px;
}
.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.filters {
  display: flex;
  gap: 8px;
}
.filter-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}
.filter-btn.active {
  background: #17603a;
  color: #fff;
}
.actions {
  display: flex;
  gap: 10px;
}
.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px 0 #0001;
  padding: 24px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.stat-label {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #17603a;
}
.stat-change {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 4px;
}
.stat-change.positive {
  color: #22c55e;
}
.stat-change.negative {
  color: #ef4444;
}
.user-table {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px 0 #0001;
  margin-bottom: 32px;
  overflow: hidden;
}
.user-table table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th, .user-table td {
  padding: 16px 18px;
  text-align: left;
}
.user-table th {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.user-table tr:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  color: #17603a;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-name {
  font-weight: 600;
  color: #222;
}
.user-role {
  font-size: 0.9rem;
  color: #6b7280;
}
.user-phone {
  font-size: 0.9rem;
  color: #6b7280;
}
.status-badge {
  display: inline-block;
  padding: 4px 18px;
  border-radius: 999px;
  font-size: 0.95em;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.status-badge.active {
  background: #e7f9ef;
  color: #22c55e;
}
.status-badge.blocked {
  background: #fbeaea;
  color: #ef4444;
}
.btn-table {
  background: #f3f4f6;
  color: #17603a;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 4px;
}
.btn-table.active, .btn-table:hover {
  background: #17603a;
  color: #fff;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: #f3f4f6;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}
.audit-cta {
  background: #e7f9ef;
  border-radius: 18px;
  padding: 32px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.audit-cta h2 {
  color: #17603a;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.audit-cta p {
  color: #374151;
  font-size: 1rem;
}

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(120, 120, 120, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  /* margin-top: 50px; */
  /* height: 80vh; */
  z-index: 1000;

}
.modal {
  background: #fff;
  margin-top: 40px;
  height: 80vh;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  min-width: 340px;
  max-width: 30vw;
  box-shadow: 0 8px 40px #0003;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  align-items: center;
  justify-content: center;
}
.animate-modal {
  animation: modalIn 0.18s cubic-bezier(.4,0,.2,1);
}
@keyframes modalIn {
  from { transform: translateY(40px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.modal-close {
  position: absolute;
  top: 14px;
  right: 18px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.modal input, .modal select {
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 1rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>