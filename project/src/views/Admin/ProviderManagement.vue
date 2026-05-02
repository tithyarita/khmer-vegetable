<template>
  <div class="provider-management-page">

    <!-- HEADER -->
    <div class="header-row">
      <div>
        <h1 class="title">Providers Management</h1>
        <p class="subtitle">
          Manage and monitor all providers across the ecosystem.
        </p>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-row">
      <input
        class="search-input"
        type="text"
        placeholder="Search by name..."
        v-model="search"
      />

      <div class="status-filter">
        <label>Status:</label>

        <select v-model="status">
          <option>All Statuses</option>
          <option>provider</option>
        </select>
      </div>
    </div>

    <!-- MAIN -->
    <div class="main-content">

      <!-- TABLE -->
      <div class="table-section">

        <table class="provider-table compact-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>FARM & OWNER</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>ROLE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in paginatedProviders"
              :key="p.id"
              @click="selectProvider(p)"
              :class="{ selected: selectedProvider?.id === p.id }"
              style="font-size:0.85rem; height:32px;"
            >
              <td>#PR0-{{ p.id }}</td>
              <td>
                <div class="farm-owner" style="gap:0.3rem;">
                  <img :src="p.avatar" class="avatar" style="width:22px;height:22px;" />
                  <div>
                    <div class="farm-name" style="font-size:0.9em;">{{ p.name }}</div>
                    <div class="owner-name" style="font-size:0.8em; color:#888;">{{ p.role }}</div>
                  </div>
                </div>
              </td>
              <td>{{ p.email }}</td>
              <td>{{ p.phone }}</td>
              <td>{{ p.role }}</td>
              <td>
                <button class="edit-btn compact-edit" @click.stop="editProvider(p)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="pagination-row">
          <span>
            Showing {{ paginatedProviders.length }} of {{ filteredProviders.length }}
          </span>

          <div class="pagination">
            <button :disabled="page === 1" @click="page--">&lt;</button>

            <button
              v-for="n in totalPages"
              :key="n"
              :class="{ active: page === n }"
              @click="page = n"
            >
              {{ n }}
            </button>

            <button :disabled="page === totalPages" @click="page++">&gt;</button>
          </div>
        </div>

      </div>

      <!-- DETAILS -->
      <div class="details-section" v-if="selectedProvider">

        <div class="details-card compact-details">
          <h3>Provider</h3>
          <div class="compact-row"><b>👤</b> {{ selectedProvider.name }}</div>
          <div class="compact-row"><b>✉️</b> {{ selectedProvider.email }}</div>
          <div class="compact-row"><b>📞</b> {{ selectedProvider.phone }}</div>
          <div class="compact-row"><b>🧑‍💼</b> {{ selectedProvider.role }}</div>
          <div class="compact-row"><b>🆔</b> {{ selectedProvider.id }}</div>
          <div class="compact-row"><b>📊</b> {{ selectedProvider.status || 'N/A' }}</div>
          <div class="compact-row"><b>🏠</b> {{ selectedProvider.address || 'N/A' }}</div>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="modal-overlay compact-modal">
          <div class="modal-content compact-modal-content">
            <h4>Edit Provider</h4>
            <form @submit.prevent="submitEdit">
              <div class="form-row">
                <label>Name</label>
                <input v-model="editForm.name" required />
              </div>
              <div class="form-row">
                <label>Email</label>
                <input v-model="editForm.email" required />
              </div>
              <div class="form-row">
                <label>Phone</label>
                <input v-model="editForm.phone" required />
              </div>
              <div class="form-row">
                <label>Role</label>
                <input v-model="editForm.role" required />
              </div>
              <div class="form-row">
                <label>Address</label>
                <input v-model="editForm.address" />
              </div>
              <div class="modal-actions compact-actions">
                <button type="submit">Save</button>
                <button type="button" @click="showEditModal = false">Cancel</button>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// ================= STATE =================
const providers = ref([])
const selectedProvider = ref(null)

const search = ref('')
const status = ref('All Statuses')
const page = ref(1)
const pageSize = 5

// ================= FETCH PROVIDERS =================
const fetchProviders = async () => {
  try {
    const res = await axios.get('http://localhost:3000/users', {
      params: { role: 'provider' }
    })

    providers.value = res.data.map(u => ({
      ...u,
      avatar: `https://randomuser.me/api/portraits/men/${u.id % 100}.jpg`
    }))

    selectedProvider.value = providers.value[0] || null

  } catch (err) {
    console.error('Error loading providers:', err)
  }
}

// ================= FILTER =================
const filteredProviders = computed(() => {
  let data = providers.value

  if (search.value) {
    data = data.filter(p =>
      p.name?.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  return data
})

// ================= PAGINATION =================
const totalPages = computed(() =>
  Math.ceil(filteredProviders.value.length / pageSize)
)

const paginatedProviders = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredProviders.value.slice(start, start + pageSize)
})

// ================= SELECT =================

const showEditModal = ref(false)
const editForm = ref({})

const selectProvider = (p) => {
  selectedProvider.value = p
}

// ================= EDIT =================
const editProvider = (p) => {
  editForm.value = { ...p }
  showEditModal.value = true
}

const submitEdit = async () => {
  try {
    const id = editForm.value.id
    const res = await axios.post(`http://localhost:3000/users/update/${id}`, editForm.value)
    // Update local provider list
    const idx = providers.value.findIndex(pr => pr.id === id)
    if (idx !== -1) {
      providers.value[idx] = { ...editForm.value }
    }
    if (selectedProvider.value && selectedProvider.value.id === id) {
      selectedProvider.value = { ...editForm.value }
    }
    showEditModal.value = false
    alert('Provider updated!')
  } catch (err) {
    alert('Failed to update provider!')
  }
}

// ================= INIT =================
onMounted(fetchProviders)
</script>
<style scoped>
.provider-management-page {
    padding: 2rem 2rem 2rem 2rem;
    background: #f8fafc;
    min-height: 100vh;
}
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}
.title {
    color: #14532d;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
}
.subtitle {
    color: #64748b;
    font-size: 1rem;
}
/* Compact Table Styles */
/* Extra Compact Table Styles */
.provider-table.compact-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  margin-bottom: 0.5rem;
  font-size: 0.87rem;
}
.provider-table.compact-table th, .provider-table.compact-table td {
  padding: 0.18rem 0.3rem;
  text-align: left;
}
.provider-table.compact-table th {
  color: #333;
  font-weight: 600;
  background: #f6f6f6;
  font-size: 0.92em;
}
.provider-table.compact-table td {
  vertical-align: middle;
}
.edit-btn.compact-edit {
  background: #f59e42;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.12rem 0.55rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn.compact-edit:hover {
  background: #e07b1a;
}
.apply-filter-btn {
    background: #e5e7eb;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
}
.main-content {
    display: flex;
    gap: 2rem;
}
.table-section {
    flex: 2;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px #0001;
    padding: 1.5rem;
}
.provider-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}
.provider-table th {
    color: #64748b;
    font-weight: 600;
    padding: 0.7rem 0.5rem;
    text-align: left;
    font-size: 0.95rem;
}
.provider-table td {
    padding: 0.7rem 0.5rem;

.view-btn, .edit-btn {
  margin: 0 0.25rem;
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}
.view-btn {
  background: #38bdf8;
  color: #fff;
}
.edit-btn {
  background: #f59e42;
  color: #fff;
}
    vertical-align: middle;
    font-size: 1rem;
}
.provider-table tr.selected {
    background: #f1f5f9;
}
.farm-owner {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}
.status-badge.approved {
    background: #22c55e;
}
.status-badge.pending {
    background: #a3a3a3;
    color: #333;
}
.status-badge.suspended {
    background: #ef4444;
}
.action-icon {
    margin-right: 0.5rem;
    cursor: pointer;
    vertical-align: middle;
}
.pagination-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}
.pagination button {
    background: #fff;
    border: 1px solid #14532d;
    color: #14532d;
    border-radius: 6px;
    margin: 0 0.2rem;
    padding: 0.2rem 0.8rem;
    cursor: pointer;
}
.pagination button.active {
    background: #14532d;
    color: #fff;
}
.details-section {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}
/* Compact Details Card */
/* Extra Compact Details Card */
.details-card.compact-details {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px #0001;
  padding: 0.7rem 0.8rem;
  margin-bottom: 0.4rem;
  font-size: 0.87rem;
}
.compact-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.18rem;
}
.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}
.details-avatar {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    margin: 0 auto 1rem auto;
    display: block;
}
.details-title-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 0.5rem;
    justify-content: center;
}
.details-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #14532d;
}
.elite-badge {
    background: #e0f2fe;
    color: #0284c7;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 8px;
    padding: 0.2rem 0.7rem;
}
.details-owner-info {
    margin: 1rem 0 0.7rem 0;
}
.owner-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
}
.owner-info-row {
    color: #222;
    font-size: 1rem;
    margin-bottom: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.about-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 0.7rem;
}
.about-text {
    color: #222;
    font-size: 1rem;
    margin-bottom: 0.7rem;
}
.inventory-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
}
.inventory-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
.inventory-tag {
    background: #f1f5f9;
    color: #222;
    border-radius: 8px;
    padding: 0.2rem 0.7rem;
    font-size: 0.95rem;
    font-weight: 500;
}
.modify-status-btn {
    background: #14532d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.7rem;
    width: 100%;
    cursor: pointer;
}
.full-history-btn {
    background: #f1f5f9;
    color: #222;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
}
.vitality-card {
    background: #7c2d12;
    color: #fff;
    border-radius: 12px;
    padding: 1rem 1.2rem;
    font-size: 0.98rem;
    margin-top: 0.5rem;
}
.vitality-header {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.vitality-icon {
    font-size: 1.1rem;
}
.vitality-desc {
    font-size: 0.95rem;
    color: #f3f3f3;
}
.edit-icon {
    cursor: pointer;
}
</style>

/* Modal styles */
/* Compact Modal Styles */
/* Extra Compact Modal Styles */
.modal-overlay.compact-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content.compact-modal-content {
  background: #fff;
  padding: 0.7rem 0.9rem;
  border-radius: 5px;
  min-width: 180px;
  box-shadow: 0 1px 4px #0002;
  font-size: 0.87rem;
}
.compact-modal-content h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
}
.form-row {
  margin-bottom: 0.3rem;
}
.form-row label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.1rem;
  font-size: 0.89em;
}
.form-row input {
  width: 100%;
  padding: 0.18rem 0.35rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.87rem;
}
.modal-actions.compact-actions {
  margin-top: 0.3rem;
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}
.modal-actions.compact-actions button {
  padding: 0.13rem 0.6rem;
  font-size: 0.87rem;
  border-radius: 4px;
  border: none;
  background: #f59e42;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-actions.compact-actions button:hover {
  background: #e07b1a;
}