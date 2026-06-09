<script setup>
import { ref, watch, computed } from "vue"
import { useProviderStore } from "@/stores/providerStore"

const store = useProviderStore()

const provider_name = ref("")
const farm_name = ref("")
const location = ref("")
const story = ref("")
const id_number = ref("")
const editing = ref(false)
const saving = ref(false)

watch(
  () => store.provider,
  (p) => {
    if (!p || !Object.keys(p).length) return
    provider_name.value = p.provider_name || ""
    farm_name.value = p.farm_name || ""
    location.value = p.location || ""
    story.value = p.story || ""
    id_number.value = p.id_number || ""
  },
  { immediate: true, deep: true }
)

const email = computed(() => store.provider.email || "—")
const status = computed(() => store.provider.status || "—")
const providerId = computed(() =>
  store.provider.user_id || store.provider.id || store.provider.user?.id || "—"
)

const joinedDate = computed(() => {
  const raw = store.provider.created_at || store.provider.user?.created_at
  if (!raw) return "—"
  return new Date(raw).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  })
})

const startEdit = () => { editing.value = true }

const cancelEdit = () => {
  provider_name.value = store.provider.provider_name || ""
  farm_name.value = store.provider.farm_name || ""
  location.value = store.provider.location || ""
  story.value = store.provider.story || ""
  id_number.value = store.provider.id_number || ""
  editing.value = false
}

const saveProvider = async () => {
  saving.value = true
  try {
    await store.updateProvider({
      provider_name: provider_name.value,
      farm_name: farm_name.value,
      location: location.value,
      story: story.value,
      id_number: id_number.value,
    })
    editing.value = false
  } catch (err) {
    alert("Failed to update profile: " + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div>
        <h2 class="section-title">Profile Information</h2>
        <p class="section-sub">Manage your public provider details</p>
      </div>
      <button v-if="!editing" class="btn-edit" @click="startEdit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Edit
      </button>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Full Name</label>
        <input v-model="provider_name" type="text" :readonly="!editing" placeholder="Your full name" />
      </div>

      <div class="form-field">
        <label>Farm Name</label>
        <input v-model="farm_name" type="text" :readonly="!editing" placeholder="Your farm name" />
      </div>

      <div class="form-field">
        <label>Location</label>
        <input v-model="location" type="text" :readonly="!editing" placeholder="City / Province" />
      </div>

      <div class="form-field">
        <label>ID Number</label>
        <input v-model="id_number" type="text" :readonly="!editing" placeholder="National ID or business ID" />
      </div>

      <div class="form-field">
        <label>Email</label>
        <input :value="email" type="email" readonly class="readonly-field" />
      </div>

      <div class="form-field">
        <label>Account Status</label>
        <input :value="status" type="text" readonly class="readonly-field status-field" />
      </div>

      <div class="form-field">
        <label>Provider ID</label>
        <input :value="providerId" type="text" readonly class="readonly-field" />
      </div>

      <div class="form-field">
        <label>Member Since</label>
        <input :value="joinedDate" type="text" readonly class="readonly-field" />
      </div>

      <div class="form-field full">
        <label>Farm Story</label>
        <textarea
          v-model="story"
          :readonly="!editing"
          placeholder="Tell customers about your farm, growing methods, and what makes your produce special..."
          rows="4"
        />
        <span class="char-hint">{{ story.length }} characters</span>
      </div>
    </div>

    <div v-if="editing" class="edit-actions">
      <button class="btn-save" :disabled="saving" @click="saveProvider">
        {{ saving ? "Saving..." : "Save Changes" }}
      </button>
      <button class="btn-cancel" :disabled="saving" @click="cancelEdit">Cancel</button>
    </div>
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

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.section-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 4px 0 0;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-edit:hover { background: #dcfce7; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field.full { grid-column: 1 / -1; }

label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

input, textarea {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
  color: #111827;
}

input:focus, textarea:focus { border-color: #15803d; background: #fff; }

input[readonly], textarea[readonly] {
  background: #f9fafb;
  color: #374151;
  cursor: default;
  border-color: #f0f0f0;
}

.readonly-field {
  background: #f9fafb !important;
  color: #6b7280 !important;
  cursor: not-allowed;
}

.status-field { text-transform: capitalize; }

textarea { resize: vertical; min-height: 100px; line-height: 1.5; }

.char-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  text-align: right;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-save {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  background: #15803d;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:hover:not(:disabled) { opacity: 0.9; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover:not(:disabled) { background: #f9fafb; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
