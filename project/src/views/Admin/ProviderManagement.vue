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
        <div class="details-panel-header">
          <span class="details-panel-title">Provider Details</span>
          <button class="export-btn" @click="openPreview" :disabled="isGeneratingPreview">
            <span v-if="isGeneratingPreview">Loading...</span>
            <span v-else>Preview PDF</span>
          </button>
        </div>

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
          <div class="compact-row"><b>📊</b> {{ selectedProvider.providerStatus }}</div>
          <div class="compact-row"><b>🏠</b> {{ selectedProvider.farmAddress }}</div>
          <div class="compact-row"><b>✅</b> Approved by: <strong>{{ selectedProvider.approvedBy }}</strong></div>
        </div>

        <!-- Submitted documents -->
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

    <!-- ── HIDDEN PDF SOURCE CARD ─────────────────────────────────────── -->
    <div
      id="export-card"
      v-if="selectedProvider"
      style="position:fixed;left:-9999px;top:0;width:700px;background:#fff;font-family:sans-serif;padding:32px;box-sizing:border-box;"
    >
      <div style="background:#14532d;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:16px;">
        <img
          :src="selectedProvider.profilePhotoUrl || fallbackAvatar(selectedProvider.id)"
          style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #fff;flex-shrink:0;"
          crossorigin="anonymous"
        />
        <div style="flex:1;">
          <div style="font-size:20px;font-weight:700;line-height:1.2;">{{ selectedProvider.name }}</div>
          <div style="font-size:13px;opacity:0.85;margin-top:2px;">{{ selectedProvider.businessName }}</div>
          <div style="font-size:12px;opacity:0.7;margin-top:2px;">Provider ID: #PRO-{{ selectedProvider.id }}</div>
        </div>
        <div style="text-align:right;font-size:11px;opacity:0.75;line-height:1.6;">
          Khmer Vegetable Market<br/>
          Exported: {{ new Date().toLocaleDateString() }}
        </div>
      </div>

      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;">
        <div style="font-size:11px;font-weight:700;color:#14532d;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">Provider Information</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:7px 0;color:#6b7280;width:130px;">Email</td>
            <td style="padding:7px 0;color:#111827;font-weight:500;">{{ selectedProvider.email }}</td>
            <td style="padding:7px 0;color:#6b7280;width:130px;">Phone</td>
            <td style="padding:7px 0;color:#111827;font-weight:500;">{{ selectedProvider.phone }}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Role</td>
            <td style="padding:7px 0;color:#111827;font-weight:500;border-top:1px solid #f3f4f6;">{{ selectedProvider.role }}</td>
            <td style="padding:7px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Status</td>
            <td style="padding:7px 0;color:#111827;font-weight:500;border-top:1px solid #f3f4f6;">{{ selectedProvider.providerStatus }}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Farm Address</td>
            <td colspan="3" style="padding:7px 0;color:#111827;font-weight:500;border-top:1px solid #f3f4f6;">{{ selectedProvider.farmAddress }}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Approved By</td>
            <td colspan="3" style="padding:7px 0;color:#111827;font-weight:500;border-top:1px solid #f3f4f6;">{{ selectedProvider.approvedBy }}</td>
          </tr>
        </table>
      </div>

      <div v-if="selectedProvider.appImages?.length" style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;">
        <div style="font-size:11px;font-weight:700;color:#14532d;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;">Submitted Documents</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div v-for="img in selectedProvider.appImages" :key="img.url" :style="img.label === 'ID Document' ? 'flex:2;min-width:0;' : 'flex:1;min-width:0;'">
            <div style="font-size:11px;color:#6b7280;margin-bottom:5px;font-weight:600;">{{ img.label }}</div>
            <img
              v-if="img.type === 'image'"
              :src="img.url"
              crossorigin="anonymous"
              style="width:100%;height:180px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;display:block;"
              @error="e => e.target.style.display = 'none'"
            />
            <div v-else style="width:100%;height:180px;background:#fef2f2;border-radius:6px;border:1px solid #e5e7eb;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
              <span style="font-size:32px;">📄</span>
              <span style="font-size:11px;color:#6b7280;">PDF Document</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedProvider.farmImages?.length" style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px;">
        <div style="font-size:11px;font-weight:700;color:#14532d;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;">Farm Photos</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div v-for="img in selectedProvider.farmImages" :key="img.url" style="flex:1;min-width:140px;max-width:200px;">
            <div style="font-size:11px;color:#6b7280;margin-bottom:5px;font-weight:600;">{{ img.label }}</div>
            <img
              :src="img.url"
              crossorigin="anonymous"
              style="width:100%;height:180px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;display:block;"
              @error="e => e.target.style.display = 'none'"
            />
          </div>
        </div>
      </div>

      <div style="margin-top:16px;text-align:center;font-size:11px;color:#9ca3af;">
        This document is auto-generated by Khmer Vegetable Market Admin System. For official use only.
      </div>
    </div>

    <!-- ── PDF PREVIEW MODAL ──────────────────────────────────────────── -->
    <div v-if="showPreviewModal" class="preview-overlay" @click.self="closePreview">
      <div class="preview-modal">

        <div class="preview-modal-header">
          <span class="preview-modal-title">PDF Preview — #PRO-{{ selectedProvider?.id }}</span>
          <button class="preview-close-btn" @click="closePreview">✕</button>
        </div>

        <div class="preview-modal-body">
          <!-- Page-like container -->
          <div class="preview-page-wrap">
            <img
              v-if="previewDataUrl"
              :src="previewDataUrl"
              class="preview-img"
              alt="PDF preview"
            />
            <div v-else class="preview-loading">Generating preview…</div>
          </div>
        </div>

        <div class="preview-modal-footer">
          <span class="preview-note">Looks good? Click Download to save.</span>
          <div style="display:flex;gap:8px;">
            <button class="preview-cancel-btn" @click="closePreview">Cancel</button>
            <button class="preview-download-btn" @click="downloadFromPreview" :disabled="isExporting || !previewDataUrl">
              <span v-if="isExporting">⏳ Saving...</span>
              <span v-else>⬇️ Download PDF</span>
            </button>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API      = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const IMG_BASE = `${API}/images`

const providers             = ref([])
const selectedProvider      = ref(null)
const search                = ref('')
const status                = ref('All Statuses')
const page                  = ref(1)
const pageSize              = 5
const showEditModal         = ref(false)
const editForm              = ref({})
const isExporting           = ref(false)
const isGeneratingPreview   = ref(false)
const showPreviewModal      = ref(false)
const previewDataUrl        = ref(null)   
let   cachedCanvas          = null   

// ── Helpers ───────────────────────────────────────────────────────────────
const fallbackAvatar = (id) =>
  `https://randomuser.me/api/portraits/men/${(id ?? 0) % 100}.jpg`

function buildImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const clean = path.replace(/\\/g, '/').replace('uploads/', '')
  return `${IMG_BASE}/${clean}`
}

function guessType(path) {
  if (!path) return 'other'
  const ext = path.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image' : 'pdf'
}

const openImage = (url) => { if (url) window.open(url, '_blank') }

// ── Shared canvas renderer ────────────────────────────────────────────────
const renderExportCanvas = async () => {
  await nextTick()
  const el     = document.getElementById('export-card')
  const images = el.querySelectorAll('img[crossorigin]')

  await Promise.all(
    [...images].map(img => new Promise(resolve => {
      if (img.complete && img.naturalWidth > 0) { resolve(); return }
      img.onload  = resolve
      img.onerror = resolve
    }))
  )

  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth:  el.scrollWidth,
    windowHeight: el.scrollHeight,
  })
}

// ── Preview ───────────────────────────────────────────────────────────────
const openPreview = async () => {
  if (!selectedProvider.value || isGeneratingPreview.value) return
  isGeneratingPreview.value = true
  previewDataUrl.value      = null
  cachedCanvas              = null
  showPreviewModal.value    = true

  try {
    cachedCanvas         = await renderExportCanvas()
    previewDataUrl.value = cachedCanvas.toDataURL('image/png')
  } catch (err) {
    console.error('Preview failed:', err)
    alert('Could not generate preview.')
    showPreviewModal.value = false
  } finally {
    isGeneratingPreview.value = false
  }
}

const closePreview = () => {
  showPreviewModal.value = false
  previewDataUrl.value   = null
  cachedCanvas           = null
}

// ── Download from preview (reuses cached canvas) ──────────────────────────
const downloadFromPreview = async () => {
  if (!cachedCanvas || isExporting.value) return
  isExporting.value = true

  try {
    const canvas  = cachedCanvas
    const imgData = canvas.toDataURL('image/png')
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW   = pdf.internal.pageSize.getWidth()
    const pageH   = pdf.internal.pageSize.getHeight()
    const margin  = 10
    const printW  = pageW - margin * 2
    const printH  = (canvas.height * printW) / canvas.width

    if (printH <= pageH - margin * 2) {
      const yOffset = (pageH - printH) / 2
      pdf.addImage(imgData, 'PNG', margin, yOffset, printW, printH)
    } else {
      const pageCanvasH = Math.floor((canvas.width * (pageH - margin * 2)) / printW)
      let ySource = 0

      while (ySource < canvas.height) {
        const sliceH              = Math.min(pageCanvasH, canvas.height - ySource)
        const sliceCanvas         = document.createElement('canvas')
        sliceCanvas.width         = canvas.width
        sliceCanvas.height        = sliceH
        sliceCanvas.getContext('2d').drawImage(
          canvas, 0, ySource, canvas.width, sliceH,
          0, 0, canvas.width, sliceH
        )
        const sliceData   = sliceCanvas.toDataURL('image/png')
        const slicePrintH = (sliceH * printW) / canvas.width

        if (ySource > 0) pdf.addPage()
        pdf.addImage(sliceData, 'PNG', margin, margin, printW, slicePrintH)
        ySource += sliceH
      }
    }

    pdf.save(`PRO-${selectedProvider.value.id}_profile.pdf`)
    closePreview()

  } catch (err) {
    console.error('Download failed:', err)
    alert('Download failed. Please try again.')
  } finally {
    isExporting.value = false
  }
}

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

    const latestAppByEmail = new Map()
    approvedApps
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .forEach(a => {
        if (!latestAppByEmail.has(a.contact_email)) {
          latestAppByEmail.set(a.contact_email, a)
        }
      })

    providers.value = usersRes.data.map(u => {
      const app   = latestAppByEmail.get(u.email)
      const staff = app?.staff_reviewed_by

      const profilePhotoUrl = app?.profile_photo_path
        ? buildImageUrl(app.profile_photo_path)
        : null

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
        businessName:   app?.business_name ?? u.name,
        approvedBy:     staff ? `${staff.name} (ID: ${staff.user_id})` : '—',
        farmAddress:    app
          ? [app.village, app.commune, app.district, app.city_province]
              .filter(Boolean).join(', ') || '—'
          : '—',
        providerStatus: u.status || 'active',
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
  flex: 2; background: #fff; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 1.2rem;
}
.provider-table.compact-table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
.provider-table.compact-table th {
  color: #374151; font-weight: 600; background: #f6f6f6;
  padding: 0.5rem 0.6rem; text-align: left;
}
.provider-table.compact-table td {
  padding: 0.5rem 0.6rem; vertical-align: middle; border-bottom: 1px solid #f3f4f6;
}
.provider-table.compact-table tr:hover    { background: #f9fafb; cursor: pointer; }
.provider-table.compact-table tr.selected { background: #f0fdf4; }

.farm-owner { display: flex; align-items: center; gap: 0.5rem; }
.farm-name  { font-weight: 600; font-size: 0.88rem; color: #111827; }
.owner-name { font-size: 0.78rem; color: #888; }

.edit-btn.compact-edit {
  background: #f59e42; color: #fff; border: none; border-radius: 4px;
  padding: 0.2rem 0.6rem; font-size: 0.82rem; cursor: pointer; transition: background 0.2s;
}
.edit-btn.compact-edit:hover { background: #e07b1a; }

/* PAGINATION */
.pagination-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem; font-size: 13px; color: #6b7280;
}
.pagination button {
  background: #fff; border: 1px solid #14532d; color: #14532d;
  border-radius: 6px; margin: 0 2px; padding: 0.2rem 0.7rem;
  cursor: pointer; font-size: 13px;
}
.pagination button.active   { background: #14532d; color: #fff; }
.pagination button:disabled { opacity: 0.4; cursor: default; }

/* DETAILS */
.details-section {
  flex: 1.1; display: flex; flex-direction: column; gap: 1rem;
  max-height: calc(100vh - 180px); overflow-y: auto;
}
.details-panel-header {
  display: flex; align-items: center; justify-content: space-between; padding: 0 0 0.2rem;
}
.details-panel-title {
  font-size: 13px; font-weight: 700; color: #374151;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.export-btn {
  display: flex; align-items: center; gap: 5px;
  background: #14532d; color: #fff; border: none; border-radius: 6px;
  padding: 0.3rem 0.85rem; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.2s, opacity 0.2s;
}
.export-btn:hover    { background: #166534; }
.export-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.details-card {
  background: #fff; border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 1rem 1.1rem;
}
.profile-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6;
}
.profile-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  object-fit: cover; border: 2px solid #e5e7eb; flex-shrink: 0;
}
.compact-row {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 6px; font-size: 13px; color: #374151;
}
.section-title {
  margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #14532d;
  text-transform: uppercase; letter-spacing: 0.4px;
}

/* DOCUMENT GRID */
.doc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.doc-item {
  cursor: pointer; border-radius: 8px; overflow: hidden;
  border: 1px solid #e5e7eb; transition: box-shadow 0.15s, transform 0.15s;
}
.doc-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: translateY(-1px); }
.doc-thumb { width: 100%; height: 90px; object-fit: cover; display: block; background: #f9fafb; }
.doc-file {
  width: 100%; height: 90px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background: #fef2f2; gap: 4px; color: #6b7280;
}
.doc-label {
  font-size: 11px; color: #6b7280; padding: 4px 6px; background: #f9fafb;
  text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── PDF PREVIEW MODAL ───────────────────────────────────────────────── */
.preview-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  padding: 20px;
}
.preview-modal {
  background: #fff;
  border-radius: 12px;
  width: min(780px, 100%);
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.preview-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.preview-modal-title {
  font-size: 14px; font-weight: 700; color: #14532d;
}
.preview-close-btn {
  background: none; border: none; font-size: 16px; cursor: pointer;
  color: #6b7280; padding: 2px 6px; border-radius: 4px; line-height: 1;
}
.preview-close-btn:hover { background: #f3f4f6; color: #111827; }

.preview-modal-body {
  flex: 1;
  overflow-y: auto;
  background: #e5e7eb;
  padding: 24px;
  display: flex;
  justify-content: center;
}
.preview-page-wrap {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 700px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  display: block;
}
.preview-loading {
  color: #6b7280; font-size: 14px; padding: 40px;
}

.preview-modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: #f9fafb;
}
.preview-note {
  font-size: 12px; color: #6b7280;
}
.preview-cancel-btn {
  padding: 0.35rem 1rem; border-radius: 6px; border: 1px solid #d1d5db;
  background: #fff; color: #374151; cursor: pointer; font-size: 13px; font-weight: 600;
}
.preview-cancel-btn:hover { background: #f3f4f6; }
.preview-download-btn {
  padding: 0.35rem 1.1rem; border-radius: 6px; border: none;
  background: #14532d; color: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
  transition: background 0.2s, opacity 0.2s;
}
.preview-download-btn:hover    { background: #166534; }
.preview-download-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* EDIT MODAL */
.modal-overlay.compact-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content.compact-modal-content {
  background: #fff; padding: 1.2rem 1.4rem; border-radius: 10px;
  width: 280px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.compact-modal-content h4 { margin: 0 0 0.8rem; color: #14532d; font-size: 1rem; }
.form-row              { margin-bottom: 0.6rem; }
.form-row label        { display: block; font-size: 12px; font-weight: 600; margin-bottom: 3px; color: #555; }
.form-row input        { width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none; }
.form-row input:focus  { border-color: #14532d; }
.modal-actions.compact-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 0.8rem; }
.modal-actions.compact-actions button {
  padding: 0.35rem 1rem; border-radius: 6px; border: none;
  background: #14532d; color: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
}
.modal-actions.compact-actions button:last-child { background: #e5e7eb; color: #374151; }
.modal-actions.compact-actions button:hover { opacity: 0.88; }
</style>