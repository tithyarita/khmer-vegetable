<script setup>
import { ref, watch } from "vue"
import { useProviderStore } from "@/stores/providerStore"
import axios from "axios"

const store = useProviderStore()

const name     = ref("")
const farm     = ref("")
const location = ref("")
const story    = ref("")
const editing  = ref(false)

// Sync form when store loads
watch(
  () => store.provider,
  (p) => {
    if (!p) return
    name.value     = p.name
    farm.value     = p.farm
    location.value = p.location
    story.value    = p.story
  },
  { immediate: true, deep: true }
)

const startEdit = () => {
  editing.value = true
}

const cancelEdit = () => {
  // Reset fields to store values
  name.value     = store.provider.name
  farm.value     = store.provider.farm
  location.value = store.provider.location
  story.value    = store.provider.story
  editing.value = false
}

const saveProvider = async () => {
  try {
    // Update backend
    await axios.put(`http://localhost:3000/providers/${store.provider.id}`, {
      name: name.value,
      farm: farm.value,
      location: location.value,
      story: story.value,
    })
    store.updateProfile({
      name: name.value,
      farm: farm.value,
      location: location.value,
      story: story.value,
    })
    editing.value = false
    alert("Profile updated!")
  } catch (err) {
    alert("Failed to update profile: " + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div class="card">
    <p class="section-title">Profile Information</p>
    <div class="form-grid">
      <div class="form-field">
        <label for="name">Full Name</label>
        <input id="name" v-model="name" type="text" :readonly="!editing" placeholder="Enter your name" />
      </div>
      <div class="form-field">
        <label for="farm">Farm Name</label>
        <input id="farm" v-model="farm" type="text" :readonly="!editing" placeholder="Enter farm name" />
      </div>
      <div class="form-field">
        <label for="location">Location</label>
        <input id="location" v-model="location" type="text" :readonly="!editing" placeholder="City / Province" />
      </div>
      <div class="form-field">
        <label>Provider ID</label>
        <input :value="store.provider.id" type="text" readonly class="readonly" />
      </div>
      <div class="form-field full">
        <label for="story">Farm Story</label>
        <textarea id="story" v-model="story" :readonly="!editing" placeholder="Tell customers about your farm..." />
      </div>
    </div>
    <div class="edit-btns">
      <button v-if="!editing" class="edit-btn" @click="startEdit">Edit</button>
      <template v-else>
        <button class="save-btn" @click="saveProvider">Save</button>
        <button class="cancel-btn" @click="cancelEdit">Cancel</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e0e0e0;
  padding: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2e7d32;
  margin: 0 0 16px;
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
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 1rem;
  background: #fafafa;
  transition: border 0.2s;
}

input[readonly], textarea[readonly] {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.edit-btns {
  margin-top: 18px;
  display: flex;
  gap: 12px;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn {
  background: #2e7d32;
  color: #fff;
}

.save-btn {
  background: #388e3c;
  color: #fff;
}

.cancel-btn {
  background: #e0e0e0;
  color: #333;
}
</style>