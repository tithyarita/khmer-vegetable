<script setup>
import { ref, watch } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import axios from "axios"

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const store = useProviderStore()

// ===================================
// STATE
// ===================================

const bankEditing = ref(false)
const showQr = ref(null)

const localBanks = ref([])

const qrInputRefs = ref([])

// ===================================
// HELPERS
// ===================================

function fullUrl(path) {
  if (!path) return null

  if (path.startsWith("http")) {
    return path
  }

  return BASE + path
}

// ===================================
// SYNC BANKS
// ===================================

const syncBanks = () => {
  localBanks.value =
    (store.provider.banks ?? []).map((b) => ({
      ...b,
      qr: fullUrl(b.qr),
    }))
}

syncBanks()

watch(
  () => store.provider.banks,
  syncBanks,
  { deep: true }
)

// ===================================
// EDIT MODE
// ===================================

function startEdit() {
  syncBanks()
  bankEditing.value = true
}

function cancelEdit() {
  syncBanks()
  bankEditing.value = false
}

function addBank() {
  localBanks.value.push({
    name: "",
    account: "",
    qr: "",
  })
}

function removeBank(index) {
  localBanks.value.splice(index, 1)
}

// ===================================
// SAVE BANKS
// ===================================

async function saveBanks() {
  try {
    await store.updateProvider({
      banks: localBanks.value,
    })

    bankEditing.value = false

    alert("Bank accounts updated!")
  } catch (err) {
    console.error(err)

    alert(
      "Failed to save banks: " +
      (err.response?.data?.message || err.message)
    )
  }
}

// ===================================
// QR UPLOAD
// ===================================

async function handleQrUpload(e, index) {
  const file = e.target.files[0]

  if (!file) return

  try {
    const formData = new FormData()

    formData.append("qr", file)

    formData.append(
      "bank_index",
      String(index)
    )

    const res = await axios.put(
      `${BASE}/providers/${store.provider.user_id}/bank-qr`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    localBanks.value[index].qr =
      fullUrl(res.data.qr)

    alert("QR uploaded!")
  } catch (err) {
    console.error(err)

    alert(
      "QR upload failed: " +
      (err.response?.data?.message || err.message)
    )
  }
}
</script>

<template>
  <div class="card">
    <p class="section-title">Bank Accounts</p>

    <!-- VIEW MODE -->
    <template v-if="!bankEditing">
      <div v-if="!store.provider.banks?.length" class="empty-text">
        No bank accounts added yet.
      </div>

      <div
        v-for="(bank, i) in store.provider.banks"
        :key="i"
        class="bank-row"
      >
        <div class="bank-icon">🏦</div>
        <div class="bank-info">
          <p class="bank-name">{{ bank.name }}</p>
          <p class="bank-acct">{{ bank.account }}</p>
        </div>
        <button v-if="bank.qr" class="qr-btn" @click="showQr = showQr === i ? null : i">
          {{ showQr === i ? "Hide QR" : "Show QR" }}
        </button>
        <div v-if="showQr === i && bank.qr" class="qr-wrap">
          <img
            :src="fullUrl(bank.qr)"
            alt="QR code"
            class="qr-img"
            @error="e => e.target.style.display = 'none'"
          />
        </div>
      </div>

      <button class="btn-primary" style="margin-top: 14px" @click="startEdit">Add</button>
    </template>

    <!-- EDIT MODE -->
    <template v-else>
      <div
        v-for="(bank, i) in localBanks"
        :key="i"
        class="bank-add-row"
      >
        <div class="bank-fields">
          <div class="form-field">
            <label>Bank Name</label>
            <input v-model="bank.name" type="text" placeholder="e.g. ABA Bank" />
          </div>
          <div class="form-field">
            <label>Account Number</label>
            <input v-model="bank.account" type="text" placeholder="e.g. 001-234-567" />
          </div>
          <div class="form-field full">
            <label>QR Code Image</label>
            <div class="qr-upload-row">
              <input
                :ref="el => qrInputRefs[i] = el"
                type="file"
                accept="image/*"
                style="display: none"
                @change="e => handleQrUpload(e, i)"
              />
              <div v-if="bank.qr" class="qr-preview-wrap">
                <img
                  :src="bank.qr"
                  alt="QR Preview"
                  class="qr-preview-img"
                  @error="e => e.target.style.display = 'none'"
                />
                <button class="qr-change-btn" @click="qrInputRefs[i]?.click()">
                  Change QR
                </button>
              </div>
              <button v-else class="qr-upload-btn" @click="qrInputRefs[i]?.click()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload QR Image
              </button>
            </div>
          </div>
        </div>
        <button class="remove-btn" @click="removeBank(i)">✕ Remove</button>
      </div>

      <button class="add-bank-btn" @click="addBank">+ Add Bank</button>

      <div class="edit-btns">
        <button class="btn-primary" @click="saveBanks">Save</button>
        <button class="btn-cancel"  @click="cancelEdit">Cancel</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #2e7d32;
  margin: 0 0 18px;
}

.empty-text { font-size: 13px; color: #9ca3af; margin-bottom: 16px; }

/* VIEW MODE */
.bank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}
.bank-icon { font-size: 22px; }
.bank-info { flex: 1; }
.bank-name { font-size: 13px; font-weight: 600; color: #111827; margin: 0; }
.bank-acct { font-size: 12px; color: #6b7280; margin: 0; }

.qr-btn {
  font-size: 11px;
  font-weight: 600;
  color: #2e7d32;
  background: #f0f7f0;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.qr-wrap  { width: 100%; padding-top: 8px; }
.qr-img   { width: 120px; height: 120px; object-fit: contain; border-radius: 8px; border: 1px solid #e0e0e0; }

/* EDIT MODE */
.bank-add-row {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-field { display: flex; flex-direction: column; gap: 4px; }
.form-field.full { grid-column: 1 / -1; }

label { font-size: 11px; font-weight: 500; color: #6b7280; }

input[type="text"] {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  background: #fafafa;
  outline: none;
}
input[type="text"]:focus { border-color: #2e7d32; }

.qr-upload-row { display: flex; align-items: center; gap: 10px; }

.qr-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2e7d32;
  background: #f0f7f0;
  border: 1px dashed #81c784;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.qr-upload-btn:hover { background: #e8f5e9; }

.qr-preview-wrap { display: flex; align-items: center; gap: 10px; }
.qr-preview-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
}

.qr-change-btn {
  font-size: 11px;
  font-weight: 600;
  color: #2e7d32;
  background: #f0f7f0;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.remove-btn {
  align-self: flex-end;
  font-size: 11px;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.add-bank-btn {
  font-size: 12px;
  font-weight: 600;
  color: #2e7d32;
  background: #f0f7f0;
  border: 1px dashed #81c784;
  border-radius: 8px;
  padding: 8px 16px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.15s;
}
.add-bank-btn:hover { background: #e8f5e9; }

.edit-btns { display: flex; gap: 12px; }

.btn-primary {
  padding: 9px 22px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  background: #2e7d32;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.88; }

.btn-cancel {
  padding: 9px 22px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  background: #e5e7eb;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #d1d5db; }
</style>