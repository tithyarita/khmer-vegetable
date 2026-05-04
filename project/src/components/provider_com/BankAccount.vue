<template>
  <div class="card">
    <div class="section-header">
      <p class="section-title">Bank Accounts</p>
      <span class="section-hint">Hover to preview QR code</span>
    </div>

    <div class="banks-list">

      <!-- BANK LIST -->
      <div
        v-for="(bank, index) in store.provider.banks"
        :key="index"
        class="bank-item"
        @mouseenter="hoveredBank = index"
        @mouseleave="hoveredBank = null"
      >
        <div class="bank-icon">
          {{ getBankIcon(bank.name) }}
        </div>

        <div class="bank-info">
          <p class="bank-name">{{ bank.name }}</p>
          <p class="bank-acc">{{ bank.account }}</p>
        </div>

        <!-- QR POPUP -->
        <div v-if="hoveredBank === index" class="qr-popup">
          <img :src="bank.qr || '/images/placeholder.png'" />
          <p class="qr-label">Scan to pay</p>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button class="delete-btn" @click="deleteBank(index)">
            Delete
          </button>
        </div>
      </div>

      <!-- ADD BANK -->
      <div class="bank-add" @click="openAddModal">
        <span class="add-circle">+</span>
        <span>Add another bank account</span>
      </div>

    </div>
  </div>

  <!-- MODAL -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h3>{{ isEditing ? "Edit Bank" : "Add Bank" }}</h3>

      <input v-model="form.name" placeholder="Bank name" />
      <input v-model="form.account" placeholder="Account number / Name" />

      <!-- UPLOAD QR -->
      <label class="upload-box">
        Upload QR Code
        <input type="file" accept="image/*" @change="handleQRUpload" hidden />
      </label>

      <!-- PREVIEW -->
      <img v-if="previewQR" :src="previewQR" class="preview-img" />

      <!-- ACTIONS -->
      <div class="modal-actions">
        <button class="cancel" @click="closeModal">Cancel</button>
        <button class="save" @click="saveBank">
          {{ isEditing ? "Update" : "Save" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useProviderStore } from "@/stores/providerStore"

const store = useProviderStore()

const hoveredBank = ref(null)
const showModal = ref(false)
const isEditing = ref(false)
const editingIndex = ref(null)

const form = ref({
  name: "",
  account: "",
  qr: ""
})

const previewQR = ref("")

const bankIcons = {
  "ABA Bank": "🏦",
  "ACLEDA": "🏛️",
}

function getBankIcon(name) {
  return bankIcons[name] ?? "🏦"
}

function openAddModal() {
  isEditing.value = false
  editingIndex.value = null

  form.value = { name: "", account: "", qr: "" }
  previewQR.value = ""

  showModal.value = true
}

function closeModal() {
  showModal.value = false
  previewQR.value = ""
  form.value = { name: "", account: "", qr: "" }
}

function handleQRUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    previewQR.value = reader.result
    form.value.qr = reader.result
  }
  reader.readAsDataURL(file)
}
function saveBank() {
  if (!form.value.name || !form.value.account || !form.value.qr) {
    alert("Please fill all fields and upload QR code")
    return
  }

  if (isEditing.value) {
    store.provider.banks[editingIndex.value] = { ...form.value }
  } else {
    store.provider.banks.push({ ...form.value })
  }

  store.saveProvider()
  closeModal()
}

function deleteBank(index) {
  if (!confirm("Delete this bank account?")) return

  store.provider.banks.splice(index, 1)
  store.saveProvider()
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 18px 20px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.section-hint {
  font-size: 10px;
  color: #9ca3af;
}

/* LIST */
.banks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafbfa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  position: relative;
}

.bank-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7f0;
  border-radius: 8px;
}

.bank-info {
  flex: 1;
}

.bank-name {
  margin: 0;
  font-weight: 600;
  color: #111827;
  font-size: 13px;
}

.bank-acc {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
}

/* QR */
.qr-popup {
  position: absolute;
  right: 70px;
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.qr-popup img {
  width: 80px;
  height: 80px;
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 6px;
}

.edit-btn {
  font-size: 12px;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn {
  font-size: 12px;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* ADD */
.bank-add {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px dashed #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  background: #fafbfa;
  transition: all 0.2s;
}

.bank-add:hover {
  border-color: #1a3d2a;
  background: #f0f7f0;
}

.add-circle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3d2a;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.upload-box {
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
}

.preview-img {
  width: 120px;
  margin: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel {
  padding: 8px 14px;
  background: #eee;
  border: none;
  border-radius: 8px;
}

.save {
  padding: 8px 14px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
}
</style>