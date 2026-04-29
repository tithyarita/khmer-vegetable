<template>
    <div class="page-body">

      <PageBreadcrumb
        :crumbs="breadcrumbs"
        style="margin-bottom: 14px;"
        @navigate="(crumb) => $router.push(crumb.to)"
      />

      <div class="page-header-row">
        <div>
          <h1 class="page-title">Provider Review</h1>
          <p class="page-subtitle">
            Verify the identity and agricultural standards for Green Valley Organic Farms.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-reject" @click="handleDecision('reject')">Not Accept</button>
          <button class="btn-accept" @click="handleDecision('accept')">Accept</button>
        </div>
      </div>

      <div class="two-col" style="margin-bottom: 16px;">
        <ApplicantIdentityCard :applicant="applicant" />
        <FarmDetailsCard :farm="farm" />
      </div>

      <UploadedDocuments
        :documents="documents"
        style="margin-bottom: 16px;"
        @open="onOpenDoc"
        @action="onDocAction"
      />

      <div class="two-col bottom-col">
        <VerificationHealth :metrics="healthMetrics" />
        <ProcessTimeline :steps="timeline" />
      </div>

      <div class="page-footer">
        <span>THE ORGANIC EDITORIAL SYSTEM V2.4</span>
        <span class="system-status">
          <i class="bi bi-circle-fill status-dot"></i> CLOUD SERVICES OPERATIONAL
        </span>
      </div>

    </div>
</template>

<script>
import PageBreadcrumb         from "../../components/Staff/Breadcrumb.vue";
import ApplicantIdentityCard  from "../../components/Staff/Applicantidentitycard.vue";
import FarmDetailsCard        from "../../components/Staff/Farmdetailscard.vue";
import UploadedDocuments      from "../../components/Staff/Uploadeddocuments.vue";
import VerificationHealth     from "../../components/Staff/Verificationhealth.vue";
import ProcessTimeline        from "../../components/Staff/Processtimeline.vue";

export default {
  name: "ProviderReview",
  components: {
    PageBreadcrumb,
    ApplicantIdentityCard,
    FarmDetailsCard,
    UploadedDocuments,
    VerificationHealth,
    ProcessTimeline,
  },
  data() {
    return {
      breadcrumbs: [
        { label: "Applications", to: "/staff/applications" },
        { label: "Review #APP-2024-082" },
      ],
      applicant: {
        fullName:         "Silas Thorne",
        registrationId:   "USR-8829-THO",
        email:            "silas.thorne@greenvalley.com",
        phone:            "+1 (555) 234-9981",
        verificationNote: '"Applicant has 12 years of experience in hydroponics. Identity verified via national registry. Background check returned clean."',
      },
      farm: {
        address:  "422 Willow Creek Road, Sonoma, CA",
        acreage:  "45 Acres (Organic Certified)",
        crops:    ["Kale", "Heirloom Carrots", "Radishes"],
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=180&fit=crop",
        imageAlt: "Farm aerial view",
      },
      documents: [
        { name: "Organic_Cert_2024.pdf",    meta: "USDA VERIFIED · 2.1 MB",  type: "pdf"   },
        { name: "Business_License.pdf",      meta: "STATE ISSUED · 1.3 MB",   type: "doc"   },
        { name: "Facility_Inspection_1.jpg", meta: "SITE PHOTO · 4.8 MB",     type: "image" },
        { name: "Insurance_Policy.pdf",      meta: "LIABILITY · 3.2 MB",      type: "doc"   },
      ],
      healthMetrics: [
        { label: "IDENTITY INTEGRITY",  value: 98 },
        { label: "CERT DOCUMENTATION",  value: 85 },
      ],
      timeline: [
        { title: "Application Submitted",       meta: "Aug 12, 2024 • 09:14 AM",         done: true  },
        { title: "Documents Scanned & Indexed", meta: "Aug 12, 2024 • 11:30 AM",         done: true  },
        { title: "Awaiting Final Staff Review",  meta: "Currently assigned to: Admin_04", done: false },
      ],
    };
  },
  methods: {
    handleDecision(type) {
      alert(type === "accept" ? "✅ Application Accepted!" : "❌ Application Not Accepted.");
    },
    onOpenDoc(doc)   { console.log("Open doc:", doc.name); },
    onDocAction(doc) { console.log("Action on:", doc.name); },
  },
};
</script>

<style scoped>
.page-body { padding: 24px 32px; }

.page-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.btn-reject {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-reject:hover { background: #f9fafb; }

.btn-accept {
  background: #1f4e2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-accept:hover { background: #2d7a4f; }

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.bottom-col {
  grid-template-columns: 1fr 1.5fr;
  margin-bottom: 28px;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

.page-footer span {
  font-size: 10px;
  color: #b0b7c3;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.system-status { display: flex; align-items: center; gap: 6px; }
.status-dot    { font-size: 8px; color: #2d7a4f; }
</style>