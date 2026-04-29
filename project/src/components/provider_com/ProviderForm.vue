<script setup>
import { ref, watch } from "vue"
import { useProviderStore } from "@/stores/providerStore"

const store = useProviderStore()

const name     = ref("")
const farm     = ref("")
const location = ref("")
const story    = ref("")

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

const saveProvider = () => {
  store.updateProfile({
    name:     name.value,
    farm:     farm.value,
    location: location.value,
    story:    story.value,
  })
  alert("Profile updated!")
}
</script>

<template>
  <div class="card">
    <p class="section-title">Edit Profile Information</p>

    <div class="form-grid">

      <div class="form-field">
        <label for="name">Full Name</label>
        <input id="name" v-model="name" type="text" placeholder="Enter your name" />
      </div>

      <div class="form-field">
        <label for="farm">Farm Name</label>
        <input id="farm" v-model="farm" type="text" placeholder="Enter farm name" />
      </div>

      <div class="form-field">
        <label for="location">Location</label>
        <input id="location" v-model="location" type="text" placeholder="City / Province" />
      </div>

      <div class="form-field">
        <label>Provider ID</label>
        <input
          :value="store.provider.id"
          type="text"
          readonly
          class="readonly"
        />
      </div>

      <div class="form-field full">
        <label for="story">Farm Story</label>
        <textarea
          id="story"
          v-model="story"
          placeholder="Tell customers about your farm..."
        />
      </div>

    </div>

    <button class="save-btn" @click="saveProvider">Save Changes</button>
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
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 13px;
  font-size: 14px;
  font-family: inherit;
  color: #1a1a1a;
  background: #fafafa;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  resize: none;
}

input:focus,
textarea:focus {
  border-color: #2e7d32;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.08);
}

input.readonly {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea {
  min-height: 90px;
  line-height: 1.6;
}

.save-btn {
  margin-top: 18px;
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 11px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover {
  background: #1b5e20;
}
</style>