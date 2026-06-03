<template>
  <div class="app-shell">

    <!-- ── Navbar ── -->
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="brand">
          <i class="bi bi-leaf-fill brand-icon"></i>
          <span class="brand-name">Provider Portal</span>
        </router-link>
        <nav class="nav-links">
          <a href="#" class="nav-link">Guidelines</a>
          <a href="#" class="nav-link">Help Center</a>
          <router-link to="/login" class="btn-signin">Sign In</router-link>
        </nav>
      </div>
    </header>

    <!-- ── Page Content ── -->
    <main class="page-content">

      <!-- Hero -->
      <div class="hero">
        <h1 class="hero-title">Join our ecosystem.</h1>
        <p class="hero-subtitle">
          We are looking for passionate growers who prioritize soil health and organic integrity.
          Complete the application below to begin your partnership with The Greenhouse.
        </p>
      </div>

      <!-- ── Success Banner ── -->
      <transition name="fade">
        <div v-if="submitSuccess" class="success-banner">
          <i class="bi bi-check-circle-fill"></i>
          <div>
            <strong>Application submitted!</strong>
            <p>We'll review it within 3–5 business days and contact you at {{ form.contactEmail }}.</p>
          </div>
        </div>
      </transition>

      <!-- ── Error Banner ── -->
      <transition name="fade">
        <div v-if="submitError" class="error-banner">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ submitError }}</span>
        </div>
      </transition>

      <div class="form-stack">

        <!-- ── Section 1: Business Information ── -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-number">1</span>
            <h2 class="section-title">Business Information</h2>
          </div>
          <div class="row-two">
            <div class="field-group">
              <label class="field-label">Business Name <span class="req">*</span></label>
              <input class="field-input" :class="{ 'input-error': errors.businessName }"
                type="text" placeholder="e.g. Verdant Valleys Farm"
                v-model="form.businessName" @blur="validateField('businessName')" />
              <span v-if="errors.businessName" class="field-error">{{ errors.businessName }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Owner Name <span class="req">*</span></label>
              <input class="field-input" :class="{ 'input-error': errors.ownerName }"
                type="text" placeholder="Full legal name"
                v-model="form.ownerName" @blur="validateField('ownerName')" />
              <span v-if="errors.ownerName" class="field-error">{{ errors.ownerName }}</span>
            </div>
          </div>
          <div class="row-two mt-14">
            <div class="field-group">
              <label class="field-label">Contact Email <span class="req">*</span></label>
              <input class="field-input" :class="{ 'input-error': errors.contactEmail }"
                type="email" v-model="form.contactEmail" readonly
                style="background:#f3f4f6;cursor:not-allowed;" />
              <span v-if="errors.contactEmail" class="field-error">{{ errors.contactEmail }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Phone Number <span class="req">*</span></label>
              <input
                class="field-input"
                :class="{ 'input-error': errors.phone }"
                type="tel"
                placeholder="012345678"
                v-model="form.phone"
                @blur="validateField('phone')"
                @input="form.phone = form.phone.replace(/\D/g, '')"
              />
              <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
           </div>
          </div>
        </div>

        <!-- ── Section 2: Farm Location ── -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-number">2</span>
            <h2 class="section-title">Farm Location</h2>
          </div>
          <div class="map-wrap">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=280&fit=crop"
              alt="Map" class="map-img"
            />
            <div class="map-pin-tooltip">
              <i class="bi bi-geo-alt-fill"></i>
              Pin your exact farm entrance
            </div>
            <div class="pin-marker"><i class="bi bi-geo-alt-fill"></i></div>
          </div>

          <!-- Cambodian address breakdown -->
          <div class="row-two mt-16">
            <div class="field-group">
              <label class="field-label">Village</label>
              <input class="field-input" type="text" placeholder="Village name"
                v-model="form.village" />
            </div>
            <div class="field-group">
              <label class="field-label">Commune / Sangkat</label>
              <input class="field-input" type="text" placeholder="Commune or Sangkat"
                v-model="form.commune" />
            </div>
          </div>
          <div class="row-two mt-14">
            <div class="field-group">
              <label class="field-label">District / Khan</label>
              <input class="field-input" type="text" placeholder="District or Khan"
                v-model="form.district" />
            </div>
            <div class="field-group">
              <label class="field-label">City / Province</label>
              <input class="field-input" type="text" placeholder="e.g. Phnom Penh, Siem Reap"
                v-model="form.cityProvince" />
            </div>
          </div>
        </div>

        <!-- ── Section 3: Products & Specialization ── -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-number">3</span>
            <h2 class="section-title">Products & Specialization</h2>
          </div>
          <div class="row-two">
            <div class="field-group">
              <label class="field-label">Primary Vegetable Input</label>
              <input class="field-input" type="text" placeholder="e.g. Heirloom Tomatoes, Kale"
                v-model="form.primaryVegetable" />
            </div>
            <div class="field-group">
             <label class="field-label">Farm Category</label>
             <div class="select-wrap">
               <select class="field-select" v-model="form.farmCategory">
                 <option value="" disabled>Select a category</option>
           
                 <option value="leafy-vegetables">Leafy Vegetables</option>
                 <option value="fruit-vegetables">Fruit Vegetables</option>
                 <option value="root-vegetables">Root Vegetables & Tubers</option>
                 <option value="herbs-spices">Herbs & Spices</option>
                 <option value="mushrooms">Mushrooms</option>
                 <option value="organic-produce">Organic Produce</option>
                 <option value="seasonal-products">Seasonal Products</option>
                 <option value="seeds-seedlings">Seeds & Seedlings</option>
                 <option value="mixed-farm-products">Mixed Farm Products</option>
                 <option value="other">Other</option>
               </select>
               <i class="bi bi-chevron-down select-arrow"></i>
             </div>
           </div>
          </div>
        </div>

        <!-- ── Section 4: Document Verification ── -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-number">4</span>
            <h2 class="section-title">Document Verification</h2>
          </div>
          <div
            class="dropzone"
            :class="{ 'dropzone-hover': isDragging, 'dropzone-has-file': idDocument }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png"
              class="hidden-input" @change="onFileChange" />

            <template v-if="!idDocument">
              <i class="bi bi-file-earmark-arrow-up dz-icon"></i>
              <p class="dz-title">National ID Card Upload</p>
              <p class="dz-subtitle">Drag and drop your PDF or high-res JPG (Max 5MB)</p>
              <button class="dz-browse" @click.stop="$refs.fileInput.click()">Browse files</button>
            </template>

            <template v-else>
              <div class="dz-uploaded">
                <i class="bi bi-file-earmark-check-fill dz-file-icon"></i>
                <div class="dz-file-info">
                  <span class="dz-file-name">{{ idDocument.name }}</span>
                  <span class="dz-file-size">{{ formatSize(idDocument.size) }}</span>
                </div>
                <button class="dz-remove" @click.stop="removeFile">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- ── Section 5: Farm Visuals ── -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-number">5</span>
            <h2 class="section-title">Farm Visuals</h2>
          </div>

          <!-- Profile photo -->
          <p class="sub-label">FARMER PROFILE PHOTO</p>
          <div class="profile-photo-row">
            <div class="profile-avatar-wrap">
              <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="Farmer" class="profile-avatar" />
              <div v-else class="profile-avatar-placeholder">
                <i class="bi bi-person-fill"></i>
              </div>
            </div>
            <div class="profile-photo-info">
              <p class="photo-title">Show us who you are.</p>
              <p class="photo-sub">
                A clear profile photo helps build trust with buyers. Ideally, take this at your
                farm in natural daylight.
              </p>
              <button class="btn-change-photo" @click="$refs.profileInput.click()">Change Photo</button>
              <input ref="profileInput" type="file" accept="image/*" class="hidden-input"
                @change="onProfilePhotoChange" />
            </div>
          </div>

          <!-- Farm angles -->
          <p class="sub-label mt-22">REQUIRED FARM DOCUMENTATION (3 ANGLES)</p>
          <div class="angles-grid">
            <div
              v-for="(angle, idx) in angles"
              :key="idx"
              class="angle-card"
              :class="{ 'angle-has-photo': angle.previewUrl }"
              @click="$refs['angleInput' + idx][0].click()"
            >
              <input
                :ref="'angleInput' + idx"
                type="file" accept="image/*"
                class="hidden-input"
                @change="onAnglePhotoChange($event, idx)"
              />
              <template v-if="angle.previewUrl">
                <img :src="angle.previewUrl" :alt="angle.label" class="angle-photo" />
                <div class="angle-label-overlay">
                  <span class="angle-overlay-title">{{ angle.label }}</span>
                  <span class="angle-overlay-sub">{{ angle.sublabel }}</span>
                </div>
                <div class="angle-check"><i class="bi bi-check-circle-fill"></i></div>
              </template>
              <template v-else>
                <i class="bi bi-camera angle-empty-icon"></i>
                <p class="angle-empty-label">{{ angle.label }}</p>
                <p class="angle-empty-sub">{{ angle.sublabel }}</p>
              </template>
            </div>
          </div>
        </div>

      </div><!-- /form-stack -->

      <!-- ── Footer: Privacy + Submit ── -->
      <div class="submit-bar">
        <div class="privacy-notice">
          <i class="bi bi-shield-check privacy-icon"></i>
          <div>
            <span class="privacy-title">Privacy & Safety</span>
            <p class="privacy-sub">
              By submitting, you agree to our Provider Terms of Service. Your data is stored
              securely and only used for verification purposes.
            </p>
          </div>
        </div>
        <button class="btn-submit" :disabled="submitting || submitSuccess" @click="handleSubmit">
          <span>{{ submitting ? 'Submitting…' : submitSuccess ? 'Submitted ✓' : 'Submit Application' }}</span>
          <i :class="submitting ? 'bi bi-arrow-repeat spin' : submitSuccess ? 'bi bi-check-lg' : 'bi bi-arrow-right'"></i>
        </button>
      </div>

      <!-- Site footer -->
      <footer class="site-footer">
        <span class="footer-copy">© 2024 The Greenhouse Organic Editorial. All rights reserved.</span>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Use</a>
          <a href="#" class="footer-link">Support</a>
        </div>
      </footer>

    </main>
  </div>
</template>

<script>
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const verifiedEmail = sessionStorage.getItem('app_verified_email') || '';

export default {
  name: "ProviderApplicationForm",
  data() {
    return {
      submitting: false,
      submitSuccess: false,
      submitError: null,
      isDragging: false,
      idDocument: null,
      profilePhotoFile: null,
      profilePhotoUrl: null,
      form: {
        businessName:     "",
        ownerName:        "",
        contactEmail:     verifiedEmail,
        phone:            "",
        village:          "",
        commune:          "",
        district:         "",
        cityProvince:     "",
        primaryVegetable: "",
        farmCategory:     "",
      },
      errors: {
        businessName: "",
        ownerName:    "",
        contactEmail: "",
        phone:        "",
        village:      "",
        commune:      "",
        district:     "",
        cityProvince: "",
        primaryVegetable: "",
        farmCategory: "",
      },
      angles: [
        { label: "ANGLE 1: OVERVIEW",       sublabel: "Wide landscape view of farm",      previewUrl: null, file: null },
        { label: "ANGLE 2: PRODUCE CLOSE-UP", sublabel: "Detailed view of growing crops", previewUrl: null, file: null },
        { label: "ANGLE 3: INFRASTRUCTURE",   sublabel: "Storage, Greenhouse, or Facilities", previewUrl: null, file: null },
      ],
    };
  },

  methods: {
    /* ── Validation ── */
    validateField(field) {
      const val = this.form[field]?.trim()
    
      if (field === 'businessName')
        this.errors.businessName = val ? '' : 'Business name is required.'
    
      if (field === 'ownerName')
        this.errors.ownerName = val ? '' : 'Owner name is required.'
    
      if (field === 'contactEmail') {
        if (!val)                          this.errors.contactEmail = 'Email is required.'
        else if (!/\S+@\S+\.\S+/.test(val)) this.errors.contactEmail = 'Enter a valid email.'
        else                               this.errors.contactEmail = ''
      }
    
      if (field === 'phone') {
        if (!val) {
          this.errors.phone = 'Phone number is required.'
        } else if (!/^\d+$/.test(val)) {
          this.errors.phone = 'Phone number must contain digits only — no letters or special characters.'
        } else if (val.length < 9 || val.length > 15) {
          this.errors.phone = 'Phone number must be between 9 and 15 digits.'
        } else {
          this.errors.phone = ''
        }
      }
    },
    validateAll() {
      ['businessName', 'ownerName', 'contactEmail', 'phone'].forEach(f => this.validateField(f));
      return !Object.values(this.errors).some(Boolean);
    },

    /* ── Document upload ── */
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) this.setIdDocument(file);
    },
    onDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) this.setIdDocument(file);
    },
    setIdDocument(file) {
      if (file.size > 5 * 1024 * 1024) { this.submitError = 'ID document must be under 5MB.'; return; }
      this.idDocument = file;
    },
    removeFile() {
      this.idDocument = null;
      this.$refs.fileInput.value = "";
    },
    formatSize(bytes) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    },

    /* ── Farm visuals ── */
    onProfilePhotoChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.profilePhotoFile = file;
      this.profilePhotoUrl = URL.createObjectURL(file);
    },
    onAnglePhotoChange(e, idx) {
      const file = e.target.files[0];
      if (!file) return;
      this.angles[idx].previewUrl = URL.createObjectURL(file);
      this.angles[idx].file = file;
    },

    /* ── Submit ── */
    async handleSubmit() {
      this.submitError = null;
      if (!this.validateAll()) {
        this.submitError = 'Please fix the highlighted fields before submitting.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      this.submitting = true;
      try {
        // Build multipart/form-data payload
        const fd = new FormData();

        // Text fields
        fd.append('business_name',     this.form.businessName.trim());
        fd.append('owner_name',        this.form.ownerName.trim());
        fd.append('contact_email',     this.form.contactEmail.trim());
        if (this.form.phone)           fd.append('phone',           this.form.phone.trim());
        if (this.form.village)         fd.append('village',         this.form.village.trim());
        if (this.form.commune)         fd.append('commune',         this.form.commune.trim());
        if (this.form.district)        fd.append('district',        this.form.district.trim());
        if (this.form.cityProvince)    fd.append('city_province',   this.form.cityProvince.trim());
        if (this.form.primaryVegetable) fd.append('primary_vegetable', this.form.primaryVegetable.trim());
        if (this.form.farmCategory)    fd.append('farm_category',   this.form.farmCategory);

        // File fields
        if (this.idDocument)          fd.append('id_document',   this.idDocument);
        if (this.profilePhotoFile)    fd.append('profile_photo', this.profilePhotoFile);
        this.angles.forEach((a, i) => {
          if (a.file) fd.append(`farm_angle${i + 1}`, a.file);
        });

        const res = await fetch(`${API_BASE}/api/applications`, {
          method: 'POST',
          body: fd,
          // Do NOT set Content-Type — browser sets it with boundary automatically
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message ?? `Server error: ${res.status}`);
        }

        this.submitSuccess = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Optionally navigate to success page:
        // this.$router.push('/apply/success');

      } catch (err) {
        this.submitError = err.message ?? 'Something went wrong. Please try again.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* ── Reset & Shell ── */
* { box-sizing: border-box; }

.app-shell {
  min-height: 100vh;
  background: #f3f4f6;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1a1a2e;
}

/* ── Navbar ── */
.navbar {
  background: #fff;
  border-bottom: 1px solid #e9ebee;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}
.navbar-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.brand-icon { font-size: 18px; color: #2d7a4f; }
.brand-name { font-size: 15px; font-weight: 700; color: #1a1a2e; }
.nav-links { display: flex; align-items: center; gap: 24px; }
.nav-link { font-size: 13.5px; color: #4b5563; text-decoration: none; font-weight: 500; transition: color 0.15s; }
.nav-link:hover { color: #1a1a2e; }
.btn-signin { background: #1f4e2e; color: #fff; border-radius: 999px; padding: 8px 20px; font-size: 13.5px; font-weight: 600; text-decoration: none; transition: background 0.15s; }
.btn-signin:hover { background: #2d7a4f; }

/* ── Page layout ── */
.page-content { max-width: 1200px; margin: 0 auto; padding: 0 24px 48px; }

/* ── Hero ── */
.hero { padding: 40px 0 28px; }
.hero-title { font-size: 36px; font-weight: 800; color: #1f4e2e; margin: 0 0 12px; line-height: 1.15; letter-spacing: -0.5px; }
.hero-subtitle { font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7; max-width: 460px; }

/* ── Banners ── */
.success-banner,
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  font-size: 13.5px;
  line-height: 1.55;
}
.success-banner {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}
.success-banner i { font-size: 18px; color: #059669; flex-shrink: 0; margin-top: 2px; }
.success-banner strong { display: block; font-weight: 700; margin-bottom: 3px; }
.success-banner p { margin: 0; color: #047857; }

.error-banner {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}
.error-banner i { font-size: 18px; color: #dc2626; flex-shrink: 0; margin-top: 1px; }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Form stack ── */
.form-stack { display: flex; flex-direction: column; gap: 20px; }

/* ── Section card ── */
.form-section { background: #fff; border-radius: 16px; border: 1px solid #e9ebee; padding: 28px 28px 24px; }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.section-number { width: 28px; height: 28px; background: #1f4e2e; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.section-title { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0; }

/* ── Field helpers ── */
.row-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.mt-14 { margin-top: 14px; }
.mt-16 { margin-top: 16px; }
.mt-22 { margin-top: 22px; }
.field-label { font-size: 12px; font-weight: 600; color: #374151; }
.req { color: #dc2626; }

.field-input,
.field-textarea,
.field-select {
  border: 1px solid #e2e5ea;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 13.5px;
  color: #1a1a2e;
  background: #fff;
  outline: none;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-input:focus, .field-textarea:focus, .field-select:focus {
  border-color: #2d7a4f;
  box-shadow: 0 0 0 3px rgba(45, 122, 79, 0.1);
}
.field-input::placeholder, .field-textarea::placeholder { color: #c4c9d4; }
.field-textarea { resize: vertical; min-height: 72px; }

.input-error { border-color: #dc2626 !important; }
.field-error { font-size: 11.5px; color: #dc2626; font-weight: 500; }

/* Select */
.select-wrap { position: relative; }
.field-select { appearance: none; cursor: pointer; padding-right: 38px; }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #9aa0ab; pointer-events: none; }

/* ── Map ── */
.map-wrap { position: relative; border-radius: 12px; overflow: hidden; height: 200px; background: #c8d8c0; cursor: crosshair; }
.map-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(0.7) hue-rotate(60deg); }
.map-pin-tooltip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 20px; padding: 7px 14px; font-size: 12.5px; font-weight: 600; color: #1a1a2e; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.14); pointer-events: none; white-space: nowrap; }
.map-pin-tooltip i { color: #2d7a4f; font-size: 14px; }
.pin-marker { position: absolute; top: 30%; left: 46%; font-size: 36px; color: #1f4e2e; transform: translateX(-50%); pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }

/* ── Dropzone ── */
.hidden-input { display: none; }
.dropzone { border: 1.5px dashed #d1d5db; border-radius: 12px; padding: 38px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; cursor: pointer; background: #fafbfc; transition: border-color 0.2s, background 0.2s; }
.dropzone:hover, .dropzone-hover { border-color: #2d7a4f; background: #f0f7f3; }
.dropzone-has-file { border-style: solid; border-color: #2d7a4f; background: #f0f7f3; padding: 20px 24px; }
.dz-icon { font-size: 28px; color: #9aa0ab; line-height: 1; margin-bottom: 4px; }
.dz-title { font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0; }
.dz-subtitle { font-size: 12.5px; color: #9aa0ab; margin: 0; }
.dz-browse { background: none; border: none; font-size: 13px; font-weight: 700; color: #2d7a4f; cursor: pointer; padding: 0; font-family: inherit; text-decoration: underline; margin-top: 4px; }
.dz-browse:hover { color: #1f4e2e; }
.dz-uploaded { display: flex; align-items: center; gap: 14px; width: 100%; }
.dz-file-icon { font-size: 28px; color: #2d7a4f; flex-shrink: 0; }
.dz-file-info { flex: 1; display: flex; flex-direction: column; gap: 2px; text-align: left; }
.dz-file-name { font-size: 13.5px; font-weight: 600; color: #1a1a2e; }
.dz-file-size { font-size: 11.5px; color: #9aa0ab; }
.dz-remove { background: #fde8ef; border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #c0392b; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
.dz-remove:hover { background: #fbd0da; }

/* ── Farm Visuals ── */
.sub-label { font-size: 10.5px; font-weight: 700; color: #9aa0ab; letter-spacing: 0.6px; text-transform: uppercase; margin: 0 0 14px; }
.profile-photo-row { display: flex; align-items: center; gap: 18px; }
.profile-avatar, .profile-avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #e5e7eb; display: block; object-fit: cover; }
.profile-avatar-placeholder { background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 34px; color: #c4c9d4; }
.photo-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0 0 5px; }
.photo-sub { font-size: 12.5px; color: #6b7280; margin: 0 0 12px; line-height: 1.6; }
.btn-change-photo { background: #fff; border: 1px solid #d1d5db; border-radius: 8px; padding: 7px 16px; font-size: 12.5px; font-weight: 600; color: #374151; cursor: pointer; font-family: inherit; transition: background 0.15s; }
.btn-change-photo:hover { background: #f9fafb; }

/* Angles grid */
.angles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.angle-card { border: 1.5px dashed #d1d5db; border-radius: 12px; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; cursor: pointer; background: #fafbfc; overflow: hidden; position: relative; transition: border-color 0.2s; }
.angle-card:hover { border-color: #2d7a4f; }
.angle-has-photo { border-style: solid; border-color: #e5e7eb; }
.angle-empty-icon { font-size: 22px; color: #c4c9d4; line-height: 1; }
.angle-empty-label { font-size: 11px; font-weight: 700; color: #9aa0ab; margin: 0; letter-spacing: 0.3px; text-transform: uppercase; padding: 0 10px; }
.angle-empty-sub { font-size: 10.5px; color: #c4c9d4; margin: 0; padding: 0 10px; line-height: 1.4; }
.angle-photo { width: 100%; height: 140px; object-fit: cover; display: block; }
.angle-label-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.65)); padding: 18px 10px 10px; display: flex; flex-direction: column; gap: 1px; }
.angle-overlay-title { font-size: 10px; font-weight: 700; color: #fff; letter-spacing: 0.4px; text-transform: uppercase; }
.angle-overlay-sub { font-size: 9.5px; color: rgba(255,255,255,0.75); }
.angle-check { position: absolute; top: 8px; right: 8px; font-size: 18px; color: #4ade80; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)); }

/* ── Submit bar ── */
.submit-bar { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 0 0; }
.privacy-notice { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.privacy-icon { font-size: 18px; color: #2d7a4f; flex-shrink: 0; margin-top: 2px; }
.privacy-title { display: block; font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 3px; }
.privacy-sub { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.55; }
.btn-submit { display: inline-flex; align-items: center; gap: 10px; background: #1f4e2e; color: #fff; border: none; border-radius: 50px; padding: 14px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; flex-shrink: 0; transition: background 0.15s, transform 0.1s; }
.btn-submit:hover:not(:disabled) { background: #2d7a4f; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* ── Site footer ── */
.site-footer { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 16px; border-top: 1px solid #e9ebee; margin-top: 24px; flex-wrap: wrap; gap: 10px; }
.footer-copy { font-size: 11.5px; color: #9aa0ab; }
.footer-links { display: flex; gap: 18px; }
.footer-link { font-size: 11.5px; color: #6b7280; text-decoration: none; font-weight: 500; transition: color 0.15s; }
.footer-link:hover { color: #1a1a2e; }
</style>