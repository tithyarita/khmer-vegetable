<script setup>
import { ref, watch } from "vue"
import { useProviderStore } from "@/stores/providerStore"

const store = useProviderStore()

const provider_name = ref("")
const farm_name     = ref("")
const location      = ref("")
const story         = ref("")
const id_number     = ref("")
const editing       = ref(false)

watch(
  () => store.provider,
  (p) => {
    if (!p) return

    provider_name.value = p.provider_name || ""
    farm_name.value     = p.farm_name || ""
    location.value      = p.location || ""
    story.value         = p.story || ""
    id_number.value     = p.id_number || ""
  },
  { immediate: true, deep: true }
)

const startEdit = () => {
  editing.value = true
}

const cancelEdit = () => {
  provider_name.value = store.provider.provider_name || ""
  farm_name.value     = store.provider.farm_name || ""
  location.value      = store.provider.location || ""
  story.value         = store.provider.story || ""
  id_number.value     = store.provider.id_number || ""

  editing.value = false
}

const saveProvider = async () => {
  try {
    await store.updateProvider({
      provider_name: provider_name.value,
      farm_name: farm_name.value,
      location: location.value,
      story: story.value,
      id_number: id_number.value,
    })

    // update local store immediately
    store.provider.id_number = id_number.value

    editing.value = false

    alert("Profile updated!")
  } catch (err) {
    alert(
      "Failed to update profile: " +
      (err.response?.data?.message || err.message)
    )
  }
}
</script>

<template>
  <div class="card">
    <p class="section-title">Profile Information</p>

    <div class="form-grid">

      <!-- Full Name -->
      <div class="form-field">
        <label>Full Name</label>

        <input
          v-model="provider_name"
          type="text"
          :readonly="!editing"
          placeholder="Enter your name"
        />
      </div>

      <!-- Farm Name -->
      <div class="form-field">
        <label>Farm Name</label>

        <input
          v-model="farm_name"
          type="text"
          :readonly="!editing"
          placeholder="Enter farm name"
        />
      </div>

      <!-- Location -->
      <div class="form-field">
        <label>Location</label>

        <input
          v-model="location"
          type="text"
          :readonly="!editing"
          placeholder="City / Province"
        />
      </div>

      <!-- Provider ID -->
      <div class="form-field">
        <label>Provider ID</label>

        <input
          :value="store.provider.user_id || store.provider.id || store.provider.user?.id"
          type="text"
          readonly
          class="readonly-input"
        />
      </div>

      <!-- ID Number -->
      <div class="form-field">
        <label>ID Number</label>

        <input
          v-model="id_number"
          type="text"
          :readonly="!editing"
          placeholder="Enter ID number"
        />
      </div>

      <!-- Farm Story -->
      <div class="form-field full">
        <label>Farm Story</label>

        <textarea
          v-model="story"
          :readonly="!editing"
          placeholder="Tell customers about your farm..."
        />
      </div>

    </div>

    <div class="edit-btns">

      <button
        v-if="!editing"
        class="btn-primary"
        @click="startEdit"
      >
        Edit
      </button>

      <template v-else>

        <button
          class="btn-primary"
          @click="saveProvider"
        >
          Save
        </button>

        <button
          class="btn-cancel"
          @click="cancelEdit"
        >
          Cancel
        </button>

      </template>

    </div>
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field.full {
  grid-column: 1 / -1;
}

label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

input,
textarea {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.95rem;
  background: #fafafa;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

input:focus,
textarea:focus {
  border-color: #2e7d32;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

input[readonly],
textarea[readonly] {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.readonly-input {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.edit-btns {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

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

.btn-primary:hover {
  opacity: 0.88;
}

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

.btn-cancel:hover {
  background: #d1d5db;
}
</style>