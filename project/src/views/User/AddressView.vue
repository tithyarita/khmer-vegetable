<template>
  <div class="address">
    <NavigationBar />
    <br>
    <section class="section address-section">
      <div class="section-inner">
        <div class="address-container">
          <div class="address-header">
            <h2>{{ t('manageShippingAddress') }}</h2>
            <button @click="goBack" class="back-btn">← {{ t('backToCheckout') }}</button>
          </div>
          <!-- Address Form -->
          <div class="address-form">
            <div class="form-grid">
              <!-- First Name -->
              <div class="form-group">
                <label>{{ t('firstName') }} {{ t('required') }}</label>
                <input 
                  v-model="address.firstName" 
                  type="text" 
                  :placeholder="t('enterFirstName')"
                  required
                />
              </div>
              <!-- Last Name -->
              <div class="form-group">
                <label>{{ t('lastName') }} {{ t('required') }}</label>
                <input 
                  v-model="address.lastName" 
                  type="text" 
                  :placeholder="t('enterLastName')"
                  required
                />
              </div>
              <!-- Address Line -->
              <div class="form-group full-width">
                <label>{{ t('streetAddress') }} {{ t('required') }}</label>
                <input 
                  v-model="address.street" 
                  type="text" 
                  :placeholder="t('enterStreet')"
                  required
                />
              </div>
              <!-- City -->
              <div class="form-group">
                <label>{{ t('city') }} {{ t('required') }}</label>
                <input 
                  v-model="address.city" 
                  type="text" 
                  :placeholder="t('enterCity')"
                  required
                />
              </div>

              <!-- State/Province -->
              <div class="form-group">
                <label>{{ t('stateProvince') }} {{ t('required') }}</label>
                <input 
                  v-model="address.state" 
                  type="text" 
                  :placeholder="t('enterState')"
                  required
                />
              </div>
              <!-- ZIP Code -->
              <div class="form-group">
                <label>{{ t('zipPostal') }} {{ t('required') }}</label>
                <input 
                  v-model="address.zip" 
                  type="text" 
                  :placeholder="t('enterZip')"
                  required
                />
              </div>
              <!-- Country -->
              <div class="form-group">
                <label>{{ t('country') }} {{ t('required') }}</label>
                <select v-model="address.country" class="form-select">
                  <option value="">{{ t('selectCountry') }}</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Laos">Laos</option>
                  <option value="Myanmar">Myanmar</option>
                </select>
              </div>
              <!-- Phone -->
              <div class="form-group">
                <label>{{ t('phoneNumber') }} {{ t('required') }}</label>
                <input 
                  v-model="address.phone" 
                  type="tel" 
                  placeholder="+855 12 345 678"
                  required
                />
              </div>
              <!-- Email -->
              <div class="form-group full-width">
                <label>{{ t('emailAddress') }} {{ t('required') }}</label>
                <input 
                  v-model="address.email" 
                  type="email" 
                  :placeholder="t('enterEmail')"
                  required
                />
              </div>

            </div>
          </div>

          <!-- Save Button -->
          <div class="form-actions">
            <button @click="saveAddress" class="save-btn" :disabled="!isFormValid">
              Save Address
            </button>
          </div>

          <!-- Success Message -->
          <div v-if="showSuccess" class="success-message">
            <div class="success-icon">✓</div>
            <h3>Address Saved Successfully!</h3>
            <p>Your shipping address has been updated.</p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()

import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Footer from '../../components/Customer/Footer.vue'

const router = useRouter()

const address = ref({
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  email: '',
})

const showSuccess = ref(false)

const isFormValid = computed(() => {
  return (
    address.value.firstName.trim() &&
    address.value.lastName.trim() &&
    address.value.street.trim() &&
    address.value.city.trim() &&
    address.value.state.trim() &&
    address.value.zip.trim() &&
    address.value.country.trim() &&
    address.value.phone.trim() &&
    address.value.email.trim()
  )
})

const saveAddress = async () => {
  if (!isFormValid.value) {
    alert('Please fill all required fields')
    return
  }

  try {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first')
      router.push('/login')
      return
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/address`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          firstName: address.value.firstName,
          lastName: address.value.lastName,
          street: address.value.street,
          city: address.value.city,
          state: address.value.state,
          zip: address.value.zip,
          country: address.value.country,
          phone: address.value.phone,
          email: address.value.email,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to save address')
    }

    const data = await response.json()

    console.log('Saved Address:', data)

    localStorage.setItem(
      'shippingAddress',
      JSON.stringify(data),
    )

    showSuccess.value = true

    setTimeout(() => {
      router.push('/checkout')
    }, 2000)
  } catch (error) {
    console.error('Error saving address:', error)

    alert('Failed to save address')
  }
}

const goBack = () => {
  router.push('/checkout')
}

const loadSavedAddress = async () => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/address`,
      {
        method: 'GET',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      return
    }

    const text = await response.text()
    if (!text) {
      return
    }

    const data = JSON.parse(text)

    if (data && data.id) {
      address.value = {
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        country: data.country || '',
        phone: data.phone || '',
        email: data.email || '',
      }
    }
  } catch (error) {
    console.error('Failed to load address:', error)
  }
}

loadSavedAddress()
</script>

<style scoped>
.address {
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
}

/* Main Address Section */
.address-section {
  flex: 1;
  padding: 40px 24px;
}

.address-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.address-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1a;
  margin: 0;
}
.address-header h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: #2D7A3A;
  border-radius: 2px;
  margin-top: 8px;
}

.back-btn {
  background: none;
  border: 1px solid #2D7A3A;
  color: #2D7A3A;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #2D7A3A;
  color: white;
}

/* Form Styles */
.address-form {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2D7A3A;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath d='M7 10l5 5 5-5z' stroke='%236b7280' stroke-width='2' stroke-linecap='round'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* Form Actions */
.form-actions {
  text-align: center;
  margin-top: 32px;
}

.save-btn {
  padding: 14px 32px;
  background: #2D7A3A;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 160px;
}

.save-btn:hover:not(:disabled) {
  background: #1a5c27;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: 40px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  margin-top: 24px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.success-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 8px;
}

.success-message p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .address-section {
    padding: 24px 16px;
  }
  
  .address-container {
    padding: 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .back-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
