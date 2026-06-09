<script setup>
import { ref, watch, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import axios from "axios"

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const store = useProviderStore()
const providerId = computed(() =>
  store.provider.user_id || store.provider.id || store.provider.user?.id || null
)

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
      type: b.type || 'aba',
      qr: fullUrl(b.qr),
    }))
}

syncBanks()

watch(
  () => store.provider.banks,
  syncBanks,
  { deep: true }
)

// ADD BANK
function addBank() {
  localBanks.value.push({
    name: '',
    account: '',
    qr: '',
    type: 'aba',
    holder_name: '',
  })
}
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

// ===================================
// SAVE BANKS
// ===================================

async function saveBanks() {
  console.log('localBanks:', JSON.stringify(localBanks.value))

  const invalid = localBanks.value.some(b => {
    if (!b.type) return true
    if (!b.account) return true
    if (!b.holder_name) return true
    return false
  })

  console.log('invalid:', invalid)

  if (invalid) {
    alert("Please fill in all required fields (type, account number, holder name)")
    return
  }

  const banksToSave = localBanks.value.map(b => ({
    ...b,
    qr: b.qr ? b.qr.replace(BASE, '') : null,
  }))

  console.log('banksToSave:', JSON.stringify(banksToSave)) // ADD THIS

  try {
    await store.updateProvider({ banks: banksToSave })
    bankEditing.value = false
    alert("Bank accounts updated!")
  } catch (err) {
    console.error('Full error:', err)
    console.error('Response data:', err.response?.data)   // ← ADD
    console.error('Response status:', err.response?.status) // ← ADD
    console.error('Response headers:', err.response?.headers) // ← ADD
    alert("Save failed: " + JSON.stringify(err.response?.data)) // ← CHANGE
  }
}
function removeBank(index) {
  localBanks.value.splice(index, 1)
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

    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined

    if (!providerId.value) {
      throw new Error('Provider ID is missing. Please refresh the page and try again.')
    }

    const res = await axios.put(
      `${BASE}/providers/${providerId.value}/bank-qr`,
      formData,
      { headers }
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
    <p class="section-sub">Payment details shown to customers at checkout</p>

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
            <label>Payment Type</label>

            <select v-model="bank.type">
              <option value="aba">ABA QR Payment</option>
              <option value="visa">Visa Card</option>
              <option value="mastercard">Master Card</option>
            </select>
          </div>

          <div class="form-field">
            <label>
              {{ bank.type === 'aba' ? 'Account Number' : 'Card Number' }}
            </label>
            <input
              v-model="bank.account"
              type="text"
              :placeholder="bank.type === 'aba' ? 'e.g. 001-234-567' : 'e.g. 4111 1111 1111 1111'"
            />
          </div>
          
          <div class="form-field">
            <label>Bank / Card Name</label>
            <input
              v-model="bank.name"
              type="text"
              placeholder="e.g. ABA Bank, Visa"
            />
          </div>
          <div class="form-field">
            <label>Holder Name</label>

            <input
              v-model="bank.holder_name"
              type="text"
              placeholder="John Doe"
            />
          </div>

          <div
            v-if="bank.type === 'aba'"
            class="form-field full"
          >
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
                />
              
                <button
                  class="qr-change-btn"
                  @click="qrInputRefs[i]?.click()"
                >
                  Change QR
                </button>
              </div>
            
              <button
                v-else
                class="qr-upload-btn"
                @click="qrInputRefs[i]?.click()"
              >
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
  border: 1px solid #e8ecef;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}
.section-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0 0 18px;
}

select {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  background: #fafafa;
  outline: none;
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