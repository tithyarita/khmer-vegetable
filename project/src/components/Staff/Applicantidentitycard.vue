<template>
  <div class="card">
    <div class="card-header-row">
      <div class="avatar-wrap">
        <img
          v-if="applicant.profilePhotoUrl"
          :src="applicant.profilePhotoUrl"
          :alt="applicant.fullName"
          class="avatar-img"
          @error="onImgError"
        />
        <i v-else class="bi bi-person-fill avatar-fallback"></i>
      </div>
      <div>
        <h3 class="card-title">Applicant Identity</h3>
        <p class="card-subtitle">Personal profile and contact info</p>
      </div>
    </div>

    <div class="identity-grid">
      <div class="field-group">
        <label class="field-label">FULL NAME</label>
        <span class="field-value">{{ applicant.fullName }}</span>
      </div>
      <div class="field-group">
        <label class="field-label">REGISTRATION ID</label>
        <span class="field-value mono">{{ applicant.registrationId }}</span>
      </div>
      <div class="field-group">
        <label class="field-label">EMAIL ADDRESS</label>
        <span class="field-value">{{ applicant.email }}</span>
      </div>
      <div class="field-group">
        <label class="field-label">PHONE</label>
        <span class="field-value">{{ applicant.phone }}</span>
      </div>
    </div>

    <div class="verification-note">
      <span class="note-label">INTERNAL VERIFICATION NOTE</span>
      <p class="note-text">{{ applicant.verificationNote }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApplicantIdentityCard",
  props: {
    applicant: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      imgError: false,
    }
  },
  methods: {
    onImgError() {
      this.imgError = true
    },
  },
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 22px 24px;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.avatar-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-fallback {
  font-size: 26px;
  color: #9aa0ab;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
}

.card-subtitle {
  font-size: 12px;
  color: #9aa0ab;
  margin: 0;
}

.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.field-label {
  font-size: 10px;
  color: #9aa0ab;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.field-value {
  font-size: 13.5px;
  color: #1a1a2e;
  font-weight: 500;
}

.field-value.mono {
  font-family: monospace;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.verification-note {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
}

.note-label {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  color: #9aa0ab;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 7px;
}

.note-text {
  font-size: 12.5px;
  color: #374151;
  margin: 0;
  font-style: italic;
  line-height: 1.65;
}
</style>