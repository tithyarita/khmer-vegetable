<template>
  <div>
    <!-- Modal -->
    <div class="modal fade" :class="{ show: isOpen }" :style="{ display: isOpen ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <!-- Header -->
          <div class="modal-header bg-gradient border-0 py-4">
            <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4">
            <!-- Validation Errors Display -->
            <div v-if="Object.keys(validationErrors).length > 0" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
              <strong>Please fix the following errors:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="(error, field) in validationErrors" :key="field">
                  {{ error }}
                </li>
              </ul>
              <button type="button" class="btn-close" @click="validationErrors = {}" aria-label="Close"></button>
            </div>

            <form @submit.prevent="saveProduct" class="product-form">
              <!-- Image Preview Section -->
              <div class="text-center mb-4">
                <div class="image-preview-wrapper position-relative d-inline-block">
                  <img 
                    :src="formData.image || 'https://via.placeholder.com/200?text=No+Image'" 
                    @error="handleImageError"
                    class="img-thumbnail rounded-3" 
                    style="width: 180px; height: 180px; object-fit: cover;"
                  />
                  <label class="image-upload-overlay">
                    <input type="file" accept="image/*" @change="handleImageUpload" style="display: none;">
                    <div class="upload-icon">
                      <i class="bi bi-cloud-upload"></i>
                    </div>
                  </label>
                </div>
                <p class="small text-muted mt-2">Click image to upload</p>
              </div>

              <!-- Product ID -->
              <div class="mb-3">
                <label for="productId" class="form-label fw-semibold">
                  <i class="bi bi-key"></i> Product ID
                </label>
                <input 
                  v-model="formData.id" 
                  type="text" 
                  class="form-control form-control-lg" 
                  id="productId" 
                  :disabled="isEditMode"
                  placeholder="Auto-generated"
                >
              </div>

              <!-- Product Name -->
              <div class="mb-3">
                <label for="productName" class="form-label fw-semibold">
                  <i class="bi bi-box"></i> Product Name
                </label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  :class="['form-control form-control-lg', { 'is-invalid': validationErrors.name }]"
                  id="productName" 
                  placeholder="e.g., Fresh Carrot"
                  required
                >
              </div>

              <!-- Price and Stock Row -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productPrice" class="form-label fw-semibold">
                    <i class="bi bi-currency-dollar"></i> Price
                  </label>
                  <input 
                    v-model.number="formData.price" 
                    type="number" 
                    step="0.01"
                    :class="['form-control form-control-lg', { 'is-invalid': validationErrors.price }]"
                    id="productPrice" 
                    placeholder="0.00"
                    required
                  >
                </div>

                <div class="col-md-6 mb-3">
                  <label for="productStock" class="form-label fw-semibold">
                    <i class="bi bi-bag"></i> Stock (kg)
                  </label>
                  <input 
                    v-model.number="formData.stock" 
                    type="number" 
                    step="0.01"
                    :class="['form-control form-control-lg', { 'is-invalid': validationErrors.stock }]"
                    id="productStock" 
                    placeholder="e.g., 100"
                    required
                  >
                </div>
              </div>

              <!-- Discount Row -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productDiscount" class="form-label fw-semibold">
                    <i class="bi bi-percent"></i> Discount (%)
                  </label>
                  <input 
                    v-model.number="formData.discount" 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="100"
                    :class="['form-control form-control-lg', { 'is-invalid': validationErrors.discount }]"
                    id="productDiscount" 
                    placeholder="0.00"
                  >
                </div>
              </div>

              <!-- Category and Date Row -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productCategory" class="form-label fw-semibold">
                    <i class="bi bi-tag"></i> Category
                  </label>
                  <select 
                    v-model="formData.category" 
                    :class="['form-select form-select-lg', { 'is-invalid': validationErrors.category }]"
                    id="productCategory" 
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="herbs">Herbs</option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="productDate" class="form-label fw-semibold">
                    <i class="bi bi-calendar"></i> Added Date
                  </label>
                  <input 
                    v-model="formData.addedDate" 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="productDate" 
                    placeholder="DD MMM YYYY"
                    required
                  >
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label for="productDescription" class="form-label fw-semibold">
                  <i class="bi bi-file-text"></i> Description
                </label>
                <textarea 
                  v-model="formData.description" 
                  class="form-control form-control-lg" 
                  id="productDescription" 
                  placeholder="Enter product description"
                  rows="4"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light border-top py-3">
            <button type="button" class="btn btn-secondary btn-lg" @click="closeModal">
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button type="button" class="btn btn-success btn-lg" @click="saveProduct">
              <i class="bi bi-check-circle"></i> {{ isEditMode ? 'Update' : 'Add' }} Product
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const validationErrors = ref({})

const formData = ref({
  id: '',
  name: '',
  price: 0,
  stock: 0,
  category: '',
  addedDate: '',
  description: '',
  image: '', // preview/display URL (can be base64 or full URL)
  imageUrl: '', // backend stored URL
  imageFile: null, // actual file object
  discount: 0
})

// Watch for prop changes to update form data
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.isEditMode && props.product) {
    // Edit mode - load product data
    formData.value = { ...props.product }
    validationErrors.value = {}
  } else if (newVal && !props.isEditMode) {
    // Add mode - reset form
    resetForm()
    validationErrors.value = {}
  }
}, { immediate: true })

// Also watch the product prop directly for changes
watch(() => props.product, (newProduct) => {
  if (newProduct && props.isEditMode && props.isOpen) {
    formData.value = { ...newProduct }
  }
}, { deep: true })

const resetForm = () => {
  formData.value = {
    id: `PRD${Date.now()}`,
    name: '',
    price: 0,
    stock: 0,
    category: '',
    addedDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    description: '',
    image: '',
    imageUrl: '',
    imageFile: null,
    discount: 0
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Store the actual file object for API upload
    formData.value.imageFile = file
    
    // Also create a preview URL for display
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/200?text=Image+Error'
}

const closeModal = () => {
  emit('close')
}

const validateForm = () => {
  validationErrors.value = {}
  
  // Validate name
  if (!formData.value.name || formData.value.name.trim() === '') {
    validationErrors.value.name = 'Product name is required'
  }
  
  // Validate price
  if (formData.value.price === '' || formData.value.price === null || isNaN(formData.value.price)) {
    validationErrors.value.price = 'Price must be a valid number'
  } else if (formData.value.price <= 0) {
    validationErrors.value.price = 'Price must be greater than 0'
  }
  
  // Validate stock
  if (formData.value.stock === '' || formData.value.stock === null || isNaN(formData.value.stock)) {
    validationErrors.value.stock = 'Stock must be a valid number'
  } else if (formData.value.stock < 0) {
    validationErrors.value.stock = 'Stock cannot be negative'
  }
  
  // Validate discount
  if (formData.value.discount === '' || formData.value.discount === null || isNaN(formData.value.discount)) {
    validationErrors.value.discount = 'Discount must be a valid number'
  } else if (formData.value.discount < 0 || formData.value.discount > 100) {
    validationErrors.value.discount = 'Discount must be between 0 and 100'
  }
  
  // Validate category
  if (!formData.value.category) {
    validationErrors.value.category = 'Please select a category'
  }
  
  return Object.keys(validationErrors.value).length === 0
}

const saveProduct = () => {
  if (validateForm()) {
    emit('save', formData.value)
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem auto;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 3.5rem);
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  outline: 0;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #2d5016 0%, #3d6b20 100%);
  color: white;
}

.modal-title {
  margin-bottom: 0;
  line-height: 1.5;
  font-weight: 700;
  font-size: 1.35rem;
  color: white;
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 2rem 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-footer {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  gap: 1rem;
  background-color: #f8f9fa;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.btn-close {
  filter: invert(1);
}

/* Image Preview Styles */
.image-preview-wrapper {
  position: relative;
}

.image-preview-wrapper img {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-preview-wrapper:hover img {
  transform: scale(1.05);
}

.image-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.image-preview-wrapper:hover .image-upload-overlay {
  opacity: 1;
}

.upload-icon {
  color: white;
  font-size: 2rem;
  text-align: center;
}

/* Form Styles */
.product-form .form-label {
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.product-form .form-control,
.product-form .form-select {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
}

.product-form .form-control:focus,
.product-form .form-select:focus {
  border-color: #2d5016;
  box-shadow: 0 0 0 0.2rem rgba(45, 80, 22, 0.15);
}

.product-form .form-control:disabled,
.product-form .form-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.product-form textarea.form-control {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/* Button Styles */
.btn-lg {
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.modal-footer .btn {
  min-width: 120px;
  cursor: pointer;
}

.modal-footer .btn-success {
  background-color: #2d5016;
  border-color: #2d5016;
  color: white;
}

.modal-footer .btn-success:hover {
  background-color: #1e5a24;
  border-color: #1e5a24;
}

.modal-footer .btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.modal-footer .btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-dialog {
    max-width: 90%;
    margin: 0.5rem auto;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1.5rem 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .image-preview-wrapper img {
    width: 140px !important;
    height: 140px !important;
  }
}
</style>
