<template>
  <div class="staff-page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Staff Management</h1>
        <p class="page-sub">Manage staff accounts and permissions across the marketplace ecosystem.</p>
      </div>
      <button class="btn-add" @click="showAddModal = true">
        <i class="bi bi-plus-lg me-1"></i> Add Staff Member
      </button>
    </div>

    <!-- Two-column layout: table | detail panel -->
    <div class="staff-body">

      <!-- Left: Staff list table -->
      <div class="table-col">
        <StaffListTable
          :staff="staffList"
          :selected="selectedMember"
          @select="selectedMember = $event"
        />
      </div>

      <!-- Right: Detail panel -->
      <div class="detail-col">
        <StaffDetailPanel :member="selectedMember" />
      </div>

    </div>

    <!-- Simple Add Modal (scaffold) -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Add Staff Member</h2>
          <button class="modal-close" @click="showAddModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="newStaff.name" type="text" placeholder="e.g. Sarah Greenfield" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="newStaff.email" type="email" placeholder="e.g. sarah@digitalgreen.com" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="newStaff.roleKey">
              <option value="reviewer">Staff Reviewer</option>
              <option value="lead">Review Lead</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddModal = false">Cancel</button>
          <button class="btn-confirm" @click="addStaff">Add Member</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import StaffListTable   from '../../components/Admin/Stafflisttable .vue'
import StaffDetailPanel from '../../components/Admin/Staffdetailpanel.vue'

const showAddModal  = ref(false)
const selectedMember = ref(null)

const newStaff = ref({ name: '', email: '', roleKey: 'reviewer' })

/* ── Sample data ── */
const roleLabels = {
  reviewer: 'Staff Reviewer',
  lead:     'Review Lead',
  manager:  'Manager',
  admin:    'Admin',
}
const staffList = ref([
  {
    id: 1, staffId: '#MSR-4921',
    name: 'Marcus Thorne', email: 'm.thorne@digitalgreen.com',
    role: 'Staff Reviewer', roleKey: 'reviewer',
    status: 'active', statusLabel: 'Staff Reviewer',
    avatar: '',
    lastLogin: '2 hours ago',
    managedOrders: '15 orders today',
    permissionLevel: 'Full Operational Access',
    recentLogs: [
      'Approved 5 new inventory arrivals from Green Valley Farms.',
      'Updated price listings for Organic Kale.',
    ],
  },
  {
    id: 2, staffId: '#MSR-3310',
    name: 'Elena Rodriguez', email: 'e.rodriguez@digitalgreen.com',
    role: 'Review Lead', roleKey: 'lead',
    status: 'active', statusLabel: 'Active',
    avatar: '',
    lastLogin: '30 minutes ago',
    managedOrders: '28 orders today',
    permissionLevel: 'Full Operational Access',
    recentLogs: [
      'Reviewed and approved Khmer Roots Collective onboarding.',
      'Flagged 2 SKUs for quality inspection.',
    ],
  },
  {
    id: 3, staffId: '#MSR-2884',
    name: 'Simon Hayes', email: 's.hayes@digitalgreen.com',
    role: 'Staff Reviewer', roleKey: 'reviewer',
    status: 'inactive', statusLabel: 'Inactive',
    avatar: '',
    lastLogin: '3 days ago',
    managedOrders: '0 orders today',
    permissionLevel: 'Read-Only Access',
    recentLogs: [
      'No recent activity.',
    ],
  },
  {
    id: 4, staffId: '#MSR-1102',
    name: 'Amara Osei', email: 'a.osei@digitalgreen.com',
    role: 'Manager', roleKey: 'manager',
    status: 'active', statusLabel: 'Active',
    avatar: '',
    lastLogin: '1 hour ago',
    managedOrders: '42 orders today',
    permissionLevel: 'Full Operational Access',
    recentLogs: [
      'Approved bulk order from Mekong Organic Hub.',
      'Generated weekly provider report.',
    ],
  },
])

/* Select first member by default */
selectedMember.value = staffList.value[0]

function addStaff() {
  if (!newStaff.value.name || !newStaff.value.email) return
  const id = staffList.value.length + 1
  staffList.value.push({
    id,
    staffId: `#MSR-${1000 + id}`,
    name: newStaff.value.name,
    email: newStaff.value.email,
    role: roleLabels[newStaff.value.roleKey],
    roleKey: newStaff.value.roleKey,
    status: 'active', statusLabel: 'Active',
    avatar: '',
    lastLogin: 'Just now',
    managedOrders: '0 orders today',
    permissionLevel: 'Read-Only Access',
    recentLogs: ['Account created.'],
  })
  newStaff.value = { name: '', email: '', roleKey: 'reviewer' }
  showAddModal.value = false
}
</script>

<style scoped>
/* Page wrapper */
.staff-page { display: flex; flex-direction: column; gap: 20px; }

/* Header */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
}
.page-title {
  font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -.4px;
}
.page-sub { font-size: 12.5px; color: #6b7280; margin-top: 4px; }

.btn-add {
  display: flex; align-items: center; gap: 4px;
  background: #1a3d2a; color: #fff;
  border: none; border-radius: 10px;
  padding: 10px 20px; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  transition: background .14s;
}
.btn-add:hover { background: #2d6a4f; }

/* Two-column body */
.staff-body {
  display: flex; gap: 20px; align-items: flex-start;
}
.table-col  { flex: 1; min-width: 0; }
.detail-col { width: 280px; flex-shrink: 0; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.4); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.modal-box {
  background: #fff; border-radius: 16px;
  width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,.2);
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid #f3f4f3;
}
.modal-title { font-size: 16px; font-weight: 800; color: #111827; }
.modal-close {
  border: none; background: none; font-size: 16px;
  color: #6b7280; cursor: pointer; padding: 4px;
}
.modal-close:hover { color: #111827; }

.modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 12px; font-weight: 600; color: #374151; }
.form-group input, .form-group select {
  height: 38px; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 0 12px; font-size: 13px; color: #111827;
  background: #f9fafb; outline: none;
  transition: border-color .14s, box-shadow .14s;
}
.form-group input:focus, .form-group select:focus {
  border-color: #2d6a4f; box-shadow: 0 0 0 3px rgba(45,106,79,.1);
  background: #fff;
}

.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 14px 22px; border-top: 1px solid #f3f4f3;
}
.btn-cancel {
  padding: 9px 18px; border: 1.5px solid #e5e7eb;
  border-radius: 8px; background: #fff;
  font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; transition: background .12s;
}
.btn-cancel:hover { background: #f3f4f6; }
.btn-confirm {
  padding: 9px 20px; border: none; border-radius: 8px;
  background: #1a3d2a; color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background .12s;
}
.btn-confirm:hover { background: #2d6a4f; }
</style>