<template>
  <div class="page-body">

    <PageBreadcrumb
      :crumbs="breadcrumbs"
      style="margin-bottom: 14px;"
      @navigate="(crumb) => $router.push(crumb.to)"
    />

    <!-- Loading / error -->
    <div v-if="loading" class="state-msg">Loading application…</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <template v-else-if="record">
      <div class="page-header-row">
        <div>
          <h1 class="page-title">Provider Review</h1>
          <p class="page-subtitle">
            Verify the identity and agricultural standards for {{ record.business_name }}.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-reject" @click="handleDecision('reject')">Not Accept</button>
          <button class="btn-accept" @click="handleDecision('accept')">Accept</button>
        </div>
      </div>

      <div class="two-col" style="margin-bottom: 16px;">
        <!-- ApplicantIdentityCard expects:
             { fullName, registrationId, email, phone, verificationNote } -->
        <ApplicantIdentityCard :applicant="applicantProps" />

        <!-- FarmDetailsCard expects:
             { address, acreage, crops, imageUrl, imageAlt } -->
        <FarmDetailsCard :farm="farmProps" />
      </div>

      <!-- UploadedDocuments expects:
           [{ name, meta, type: 'pdf'|'image'|'doc'|'other' }] -->
      <UploadedDocuments
        :documents="documentProps"
        style="margin-bottom: 16px;"
        @open="onOpenDoc"
        @action="onDocAction"
      />

      <div class="two-col bottom-col">
        <VerificationHealth :metrics="healthMetrics" />
        <ProcessTimeline :steps="timeline" />
      </div>
    </template>

    <div class="page-footer">
      <span>THE ORGANIC EDITORIAL SYSTEM V2.4</span>
      <span class="system-status">
        <i class="bi bi-circle-fill status-dot"></i> CLOUD SERVICES OPERATIONAL
      </span>
    </div>

  </div>
</template>

<script>
import PageBreadcrumb        from '../../components/Staff/Breadcrumb.vue'
import ApplicantIdentityCard from '../../components/Staff/Applicantidentitycard.vue'
import FarmDetailsCard       from '../../components/Staff/Farmdetailscard.vue'
import UploadedDocuments     from '../../components/Staff/Uploadeddocuments.vue'
import VerificationHealth    from '../../components/Staff/Verificationhealth.vue'
import ProcessTimeline       from '../../components/Staff/Processtimeline.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/** Guess a document type from its file-path extension */
function fileType(path) {
  if (!path) return null
  const ext = path.split('.').pop().toLowerCase()
  if (ext === 'pdf')                    return 'pdf'
  if (['jpg','jpeg','png'].includes(ext)) return 'image'
  if (['doc','docx'].includes(ext))     return 'doc'
  return 'other'
}

/** Build a public URL for a stored file path */
function fileUrl(path) {
  return path ? `${API_BASE}/${path}` : null
}

export default {
  name: 'ProviderReviewDetail',
  components: {
    PageBreadcrumb, ApplicantIdentityCard, FarmDetailsCard,
    UploadedDocuments, VerificationHealth, ProcessTimeline,
  },

  data() {
    return {
      loading: true,
      error:   null,
      record:  null,   // raw ProviderApplication from the API
    }
  },

  computed: {
    // ── Route param ──────────────────────────────────────────────────────────
    applicationId() {
      return this.$route.params.id
    },

    breadcrumbs() {
      return [
        { label: 'Applications', to: '/staff/applications' },
        { label: `Review #APP-${String(this.applicationId).padStart(7, '0')}` },
      ]
    },

    // ── Prop shapes expected by child components ──────────────────────────────

    /** ApplicantIdentityCard */
    applicantProps() {
      const r = this.record
      return {
        fullName:         r.owner_name     ?? '—',
        registrationId:   `APP-${String(r.id).padStart(7, '0')}`,
        email:            r.contact_email  ?? '—',
        phone:            r.phone          ?? '—',
        verificationNote: r.village || r.commune || r.district
          ? `Farm located in ${[r.village, r.commune, r.district, r.city_province].filter(Boolean).join(', ')}.`
          : 'No additional notes.',
      }
    },

    /** FarmDetailsCard */
    farmProps() {
      const r = this.record
      const address = [r.village, r.commune, r.district, r.city_province]
        .filter(Boolean).join(', ') || '—'
      return {
        address,
        acreage:  r.farm_category ?? '—',
        crops:    r.primary_vegetable
          ? r.primary_vegetable.split(',').map(s => s.trim())
          : [],
        imageUrl: fileUrl(r.farm_angle1_path)
          ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=180&fit=crop',
        imageAlt: `${r.business_name} farm`,
      }
    },

    /** UploadedDocuments — only include files that were actually uploaded */
    documentProps() {
      const r = this.record
      const files = [
        { path: r.id_document_path,   label: 'ID Document',     meta: 'NATIONAL ID' },
        { path: r.profile_photo_path, label: 'Profile Photo',   meta: 'PROFILE'     },
        { path: r.farm_angle1_path,   label: 'Farm Overview',   meta: 'ANGLE 1'     },
        { path: r.farm_angle2_path,   label: 'Produce Close-up',meta: 'ANGLE 2'     },
        { path: r.farm_angle3_path,   label: 'Infrastructure',  meta: 'ANGLE 3'     },
      ]
      return files
        .filter(f => f.path)
        .map(f => ({
          name: f.label,
          // show filename from path as a subtitle
          meta: `${f.meta} · ${f.path.split('/').pop()}`,
          type: fileType(f.path),
          url:  fileUrl(f.path),   // available for onOpenDoc
        }))
    },

    healthMetrics() {
      return [
        { label: 'IDENTITY INTEGRITY', value: this.record.id_document_path ? 98 : 40 },
        { label: 'FARM DOCUMENTATION', value: this.photoCount * 25 },
      ]
    },

    photoCount() {
      const r = this.record
      return [r.farm_angle1_path, r.farm_angle2_path, r.farm_angle3_path]
        .filter(Boolean).length
    },

    timeline() {
      const r = this.record
      const submitted = r.submitted_at
        ? new Date(r.submitted_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '—'
      return [
        {
          title: 'Application Submitted',
          meta:  submitted,
          done:  !!r.submitted_at,
        },
        {
          title: 'Documents Scanned & Indexed',
          meta:  r.submitted_at ? 'Processed automatically' : 'Not yet submitted',
          done:  !!r.id_document_path,
        },
        {
          title: 'Awaiting Final Staff Review',
          meta:  r.application_status === 'approved' || r.application_status === 'rejected'
            ? 'Review complete'
            : 'Pending review',
          done:  ['approved', 'rejected'].includes(r.application_status),
        },
      ]
    },
  },

  async created() {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${this.applicationId}`)
      if (!res.ok) throw new Error(`Application not found (${res.status})`)
      this.record = await res.json()
    } catch (err) {
      this.error = err.message
    } finally {
      this.loading = false
    }
  },

  methods: {
    async handleDecision(type) {
      const status = type === 'accept' ? 'approved' : 'rejected'
      try {
        const res = await fetch(
          `${API_BASE}/api/applications/${this.applicationId}/status`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          }
        )
        if (!res.ok) throw new Error('Failed to update status')
        this.record = { ...this.record, application_status: status }
        alert(type === 'accept' ? '✅ Application Accepted!' : '❌ Application Not Accepted.')
      } catch (err) {
        alert(`Error: ${err.message}`)
      }
    },

    onOpenDoc(doc) {
      if (doc.url) window.open(doc.url, '_blank')
    },

    onDocAction(doc) {
      if (doc.url) window.open(doc.url, '_blank')
    },
  },
}
</script>

<style scoped>
.page-body { padding: 24px 32px; }

.state-msg        { padding: 40px; text-align: center; font-size: 13.5px; color: #6b7280; }
.state-msg--error { color: #dc2626; }

.page-header-row  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 16px; }
.page-title       { font-size: 26px; font-weight: 800; color: #1a1a2e; margin: 0 0 4px; }
.page-subtitle    { font-size: 13px; color: #6b7280; margin: 0; max-width: 400px; }

.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.btn-reject     { background: #fff; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; font-family: inherit; transition: background .15s; }
.btn-reject:hover { background: #f9fafb; }
.btn-accept     { background: #1f4e2e; color: #fff; border: none; border-radius: 8px; padding: 10px 24px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .15s; }
.btn-accept:hover { background: #2d7a4f; }

.two-col        { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bottom-col     { grid-template-columns: 1fr 1.5fr; margin-bottom: 28px; }

.page-footer    { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #e5e7eb; }
.page-footer span { font-size: 10px; color: #b0b7c3; letter-spacing: .5px; text-transform: uppercase; }
.system-status  { display: flex; align-items: center; gap: 6px; }
.status-dot     { font-size: 8px; color: #2d7a4f; }
</style>