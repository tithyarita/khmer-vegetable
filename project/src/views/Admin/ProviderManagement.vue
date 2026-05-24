<template>
  <div class="provider-management-page">

    <!-- HEADER -->
    <div class="header-row">
      <div>
        <h1 class="title">Providers Management</h1>
        <p class="subtitle">Manage and monitor all providers across the ecosystem.</p>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-row">
      <input class="search-input" type="text" placeholder="Search by name..." v-model="search" />
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
              <th>APPROVED BY</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in paginatedProviders"
              :key="p.id"
              @click="selectProvider(p)"
              :class="{ selected: selectedProvider?.id === p.id }"
              style="font-size:0.85rem;"
            >
              <td>#PR0-{{ p.id }}</td>
              <td>
                <div class="farm-owner">
                  <img
                    :src="p.profilePhotoUrl || fallbackAvatar(p.id)"
                    class="avatar"
                    style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid #e5e7eb;"
                    @error="e => e.target.src = fallbackAvatar(p.id)"
                  />
                  <div>
                    <div class="farm-name">{{ p.name }}</div>
                    <div class="owner-name">{{ p.businessName }}</div>
                  </div>
                </div>
              </td>
              <td>{{ p.email }}</td>
              <td>{{ p.phone }}</td>
              <td>{{ p.role }}</td>
              <td>{{ p.approvedBy }}</td>
              <td>
                <button class="edit-btn compact-edit" @click.stop="editProvider(p)">Edit</button>
              </td>
            </tr>
            <tr v-if="paginatedProviders.length === 0">
              <td colspan="7" style="text-align:center;color:#888;padding:20px;">No providers found</td>
            </tr>
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="pagination-row">
          <span>Showing {{ paginatedProviders.length }} of {{ filteredProviders.length }}</span>
          <div class="pagination">
            <button :disabled="page === 1" @click="page--">&lt;</button>
            <button
              v-for="n in totalPages" :key="n"
              :class="{ active: page === n }"
              @click="page = n"
            >{{ n }}</button>
            <button :disabled="page === totalPages" @click="page++">&gt;</button>
          </div>
        </div>
      </div>

      <!-- DETAILS PANEL -->
      <div class="details-section" v-if="selectedProvider">

        <!-- Profile card -->
        <div class="details-card">
          <div class="profile-header">
            <img
              :src="selectedProvider.profilePhotoUrl || fallbackAvatar(selectedProvider.id)"
              class="profile-avatar"
              @error="e => e.target.src = fallbackAvatar(selectedProvider.id)"
            />
            <div>
              <h3 style="margin:0 0 2px;color:#14532d;">{{ selectedProvider.name }}</h3>
              <div style="font-size:12px;color:#6b7280;">{{ selectedProvider.businessName }}</div>
            </div>
          </div>
          <div class="compact-row"><b>✉️</b> {{ selectedProvider.email }}</div>
          <div class="compact-row"><b>📞</b> {{ selectedProvider.phone }}</div>
          <div class="compact-row"><b>🧑‍💼</b> {{ selectedProvider.role }}</div>
          <div class="compact-row"><b>🆔</b> User ID: {{ selectedProvider.id }}</div>
          <div class="compact-row"><b>📊</b> {{ selectedProvider.status || 'N/A' }}</div>
          <div class="compact-row"><b>🏠</b> {{ selectedProvider.address || 'N/A' }}</div>
          <div class="compact-row"><b>✅</b> Approved by: <strong>{{ selectedProvider.approvedBy }}</strong></div>
        </div>

        <!-- Submitted documents (ID + profile photo) -->
        <div class="details-card" v-if="selectedProvider.appImages?.length">
          <h4 class="section-title">Submitted Documents</h4>
          <div class="doc-grid">
            <div
              v-for="img in selectedProvider.appImages"
              :key="img.url"
              class="doc-item"
              @click="openImage(img.url)"
            >
              <img
                v-if="img.type === 'image'"
                :src="img.url"
                class="doc-thumb"
                @error="e => e.target.style.display = 'none'"
              />
              <div v-else class="doc-file">
                <i class="bi bi-file-earmark-pdf" style="font-size:28px;color:#dc2626;"></i>
                <span style="font-size:11px;">{{ img.label }}</span>
              </div>
              <div class="doc-label">{{ img.label }}</div>
            </div>
          </div>
        </div>

        <!-- Farm photos -->
        <div class="details-card" v-if="selectedProvider.farmImages?.length">
          <h4 class="section-title">Farm Photos</h4>
          <div class="doc-grid">
            <div
              v-for="img in selectedProvider.farmImages"
              :key="img.url"
              class="doc-item"
              @click="openImage(img.url)"
            >
              <img
                :src="img.url"
                class="doc-thumb"
                @error="e => e.target.style.display = 'none'"
              />
              <div class="doc-label">{{ img.label }}</div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- EDIT MODAL -->
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
            <input v-model="editForm.phone" />
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API      = 'http://localhost:3000'
const IMG_BASE = `${API}/images`

const providers        = ref([])
const selectedProvider = ref(null)
const search           = ref('')
const status           = ref('All Statuses')
const page             = ref(1)
const pageSize         = 5
const showEditModal    = ref(false)
const editForm         = ref({})

// ── Helpers ───────────────────────────────────────────────────────────────
const fallbackAvatar = (id) =>
  `https://randomuser.me/api/portraits/men/${(id ?? 0) % 100}.jpg`

function buildImageUrl(path) {
  if (!path) return null
  const clean = path.replace(/\\/g, '/').replace('uploads/', '')
  return `${IMG_BASE}/${clean}`
}

function guessType(path) {
  if (!path) return 'other'
  const ext = path.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' : 'pdf'
}

const openImage = (url) => { if (url) window.open(url, '_blank') }

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchProviders = async () => {
  try {
    const [usersRes, appsRes] = await Promise.all([
      axios.get(`${API}/users`, { params: { role: 'provider' } }),
      axios.get(`${API}/api/applications`),
    ])

    const approvedApps = appsRes.data.filter(
      a => a.application_status === 'approved'
    )

        // Build a map: email → latest approved application
    // (sort desc by submitted_at so the most recent wins)
    const latestAppByEmail = new Map()
    approvedApps
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .forEach(a => {
        if (!latestAppByEmail.has(a.contact_email)) {
          latestAppByEmail.set(a.contact_email, a)
        }
      })

    providers.value = usersRes.data.map(u => {
      const app = latestAppByEmail.get(u.email)
      const staff = app?.staff_reviewed_by

      // Real profile photo from application
      const profilePhotoUrl = app?.profile_photo_path
        ? buildImageUrl(app.profile_photo_path)
        : null

      // Submitted documents: ID card + profile photo
      const appImages = []
      if (app?.id_document_path) {
        appImages.push({
          label: 'ID Document',
          url:   buildImageUrl(app.id_document_path),
          type:  guessType(app.id_document_path),
        })
      }
      if (app?.profile_photo_path) {
        appImages.push({
          label: 'Profile Photo',
          url:   buildImageUrl(app.profile_photo_path),
          type:  'image',
        })
      }

      // Farm photos
      const farmImages = [
        { path: app?.farm_angle1_path, label: 'Farm Overview'    },
        { path: app?.farm_angle2_path, label: 'Produce Close-up' },
        { path: app?.farm_angle3_path, label: 'Infrastructure'   },
      ]
        .filter(f => f.path)
        .map(f => ({
          label: f.label,
          url:   buildImageUrl(f.path),
          type:  'image',
        }))

      return {
        ...u,
        profilePhotoUrl,
        appImages,
        farmImages,
        businessName: app?.business_name ?? u.name,
        approvedBy:   staff
          ? `${staff.name} (ID: ${staff.user_id})`
          : '—',
      }
    })

    selectedProvider.value = providers.value[0] || null
    
  } catch (err) {
    console.error('Error loading providers:', err)
  }
}

// ── Filter ────────────────────────────────────────────────────────────────
const filteredProviders = computed(() => {
  if (!search.value) return providers.value
  return providers.value.filter(p =>
    p.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.value.toLowerCase())
  )
})

// ── Pagination ────────────────────────────────────────────────────────────
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProviders.value.length / pageSize))
)

const paginatedProviders = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredProviders.value.slice(start, start + pageSize)
})

// ── Select / Edit ─────────────────────────────────────────────────────────
const selectProvider = (p) => { selectedProvider.value = p }

const editProvider = (p) => {
  editForm.value      = { ...p }
  showEditModal.value = true
}

const submitEdit = async () => {
  try {
    await axios.put(`${API}/users/${editForm.value.id}`, {
      name:    editForm.value.name,
      email:   editForm.value.email,
      phone:   editForm.value.phone,
      address: editForm.value.address,
    })
    await fetchProviders()
    showEditModal.value = false
    alert('Provider updated!')
  } catch {
    alert('Failed to update provider!')
  }
}

onMounted(fetchProviders)
</script>

<style scoped>
.provider-management-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* HEADER */
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.title      { color: #14532d; font-size: 2rem; font-weight: 700; margin-bottom: 0.2rem; }
.subtitle   { color: #64748b; font-size: 1rem; }

/* FILTER */
.filter-row    { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.2rem; }
.search-input  { padding: 0.45rem 0.8rem; border: 1px solid #ddd; border-radius: 8px; width: 240px; font-size: 13px; }
.status-filter { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.status-filter select { padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 8px; }

/* LAYOUT */
.main-content { display: flex; gap: 1.5rem; align-items: flex-start; }

/* TABLE */
.table-section {
  flex: 2;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.2rem;
}
.provider-table.compact-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.87rem;
}
.provider-table.compact-table th {
  color: #374151;
  font-weight: 600;
  background: #f6f6f6;
  padding: 0.5rem 0.6rem;
  text-align: left;
}
.provider-table.compact-table td {
  padding: 0.5rem 0.6rem;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}
.provider-table.compact-table tr:hover { background: #f9fafb; cursor: pointer; }
.provider-table.compact-table tr.selected { background: #f0fdf4; }

.farm-owner  { display: flex; align-items: center; gap: 0.5rem; }
.farm-name   { font-weight: 600; font-size: 0.88rem; color: #111827; }
.owner-name  { font-size: 0.78rem; color: #888; }

.edit-btn.compact-edit {
  background: #f59e42;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn.compact-edit:hover { background: #e07b1a; }

/* PAGINATION */
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 13px;
  color: #6b7280;
}
.pagination button {
  background: #fff;
  border: 1px solid #14532d;
  color: #14532d;
  border-radius: 6px;
  margin: 0 2px;
  padding: 0.2rem 0.7rem;
  cursor: pointer;
  font-size: 13px;
}
.pagination button.active   { background: #14532d; color: #fff; }
.pagination button:disabled { opacity: 0.4; cursor: default; }

/* DETAILS */
.details-section {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}
.details-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem 1.1rem;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}
.compact-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #374151;
}
.section-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #14532d;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* DOCUMENT GRID */
.doc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.doc-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.15s, transform 0.15s;
}
.doc-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}
.doc-thumb {
  width: 100%;
  height: 90px;
  object-fit: cover;
  display: block;
  background: #f9fafb;
}
.doc-file {
  width: 100%;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  gap: 4px;
  color: #6b7280;
}
.doc-label {
  font-size: 11px;
  color: #6b7280;
  padding: 4px 6px;
  background: #f9fafb;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* MODAL */
.modal-overlay.compact-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content.compact-modal-content {
  background: #fff;
  padding: 1.2rem 1.4rem;
  border-radius: 10px;
  width: 280px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.compact-modal-content h4 {
  margin: 0 0 0.8rem;
  color: #14532d;
  font-size: 1rem;
}
.form-row              { margin-bottom: 0.6rem; }
.form-row label        { display: block; font-size: 12px; font-weight: 600; margin-bottom: 3px; color: #555; }
.form-row input        { width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none; }
.form-row input:focus  { border-color: #14532d; }
.modal-actions.compact-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 0.8rem;
}
.modal-actions.compact-actions button {
  padding: 0.35rem 1rem;
  border-radius: 6px;
  border: none;
  background: #14532d;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.modal-actions.compact-actions button:last-child {
  background: #e5e7eb;
  color: #374151;
}
.modal-actions.compact-actions button:hover { opacity: 0.88; }
</style>