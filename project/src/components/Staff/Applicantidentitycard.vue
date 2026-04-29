<template>
  <div class="card">
    <!-- Card Header -->
    <div class="card-header-row">
      <div class="icon-wrap">
        <i class="bi bi-person-badge"></i>
      </div>
      <div>
        <h3 class="card-title">Applicant Identity</h3>
        <p class="card-subtitle">Personal profile and contact info</p>
      </div>
    </div>

    <!-- Fields Grid -->
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

    <!-- Verification Note -->
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
      // { fullName, registrationId, email, phone, verificationNote }
    },
  },
};
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

.icon-wrap {
  width: 42px;
  height: 42px;
  background: #f0f4f8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  flex-shrink: 0;
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