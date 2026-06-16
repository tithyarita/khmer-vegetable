<template>
  <div class="rating-modal-overlay" v-if="show" @click.self="$emit('close')">
    <div class="rating-modal">
      <button class="btn-close" @click="$emit('close')">×</button>

      <div class="modal-icon">⭐</div>
      <h2>Rate Your Order</h2>
      <p class="modal-sub">How was your experience with <strong>{{ providerName }}</strong>?</p>

      <!-- Star Selector -->
      <div class="star-selector">
        <span
          v-for="i in 5"
          :key="i"
          class="star-btn"
          :class="{ active: i <= hovered || i <= rating, hovered: i <= hovered }"
          @mouseenter="hovered = i"
          @mouseleave="hovered = 0"
          @click="rating = i"
        >★</span>
      </div>
      <p class="rating-label">{{ ratingLabel }}</p>

      <!-- Comment -->
      <div class="form-group">
        <label>Leave a comment <span class="optional">(optional)</span></label>
        <textarea
          v-model="comment"
          placeholder="Tell the provider what you think..."
          rows="4"
        ></textarea>
      </div>

      <button
        class="btn-submit"
        :disabled="rating === 0 || submitting"
        @click="submit"
      >
        {{ submitting ? 'Submitting...' : 'Submit Review' }}
      </button>

      <!-- Success -->
      <div v-if="submitted" class="success-msg">
        ✅ Thank you for your feedback!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps<{
  show: boolean
  orderId: number
  providerId: number
  providerName: string
  customerId: number
  customerName: string
  customerAvatar?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const rating    = ref(0)
const hovered   = ref(0)
const comment   = ref('')
const submitting = ref(false)
const submitted  = ref(false)

const ratingLabel = computed(() => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return labels[hovered.value || rating.value] ?? ''
})

async function submit() {
  if (rating.value === 0) return
  submitting.value = true
  try {
    await axios.post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/feedbacks`, {
      provider_id:     props.providerId,
      customer_id:     props.customerId,
      customer_name:   props.customerName,
      customer_avatar: props.customerAvatar ?? '',
      rating:          rating.value,
      comment:         comment.value,
      order_id:        props.orderId,
    })
    submitted.value = true
    emit('submitted')
    setTimeout(() => {
      submitted.value = false
      rating.value    = 0
      comment.value   = ''
      emit('close')
    }, 2000)
  } catch {
    alert('Failed to submit review. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.rating-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.rating-modal {
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: slideUp .25s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.btn-close {
  position: absolute; top: 1rem; right: 1rem;
  background: #f5f5f5; border: none;
  width: 32px; height: 32px; border-radius: 8px;
  font-size: 1.1rem; cursor: pointer; color: #555;
}

.modal-icon { font-size: 2.5rem; margin-bottom: .5rem; }
h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a1a; margin-bottom: .4rem; }
.modal-sub { font-size: .9rem; color: #888; margin-bottom: 1.5rem; }

.star-selector {
  display: flex;
  justify-content: center;
  gap: .4rem;
  margin-bottom: .4rem;
}
.star-btn {
  font-size: 2.5rem;
  cursor: pointer;
  color: #d1d5db;
  transition: transform .15s, color .15s;
  line-height: 1;
}
.star-btn.active  { color: #f59e0b; }
.star-btn.hovered { transform: scale(1.15); color: #fbbf24; }

.rating-label {
  font-size: .85rem;
  font-weight: 600;
  color: #2d6a4f;
  min-height: 1.2rem;
  margin-bottom: 1.2rem;
}

.form-group { text-align: left; margin-bottom: 1.2rem; }
.form-group label {
  display: block;
  font-size: .85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: .4rem;
}
.optional { color: #aaa; font-weight: 400; }
.form-group textarea {
  width: 100%;
  border: 1.5px solid #e5e5e5;
  border-radius: 12px;
  padding: .75rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  resize: none;
  outline: none;
  transition: border-color .2s;
  box-sizing: border-box;
}
.form-group textarea:focus { border-color: #2d6a4f; }

.btn-submit {
  width: 100%;
  background: #2d6a4f;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: .9rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background .2s;
}
.btn-submit:hover:not(:disabled) { background: #1b4332; }
.btn-submit:disabled { opacity: .5; cursor: not-allowed; }

.success-msg {
  margin-top: 1rem;
  background: #d8f3dc;
  color: #1b4332;
  border-radius: 10px;
  padding: .8rem;
  font-weight: 600;
  font-size: .9rem;
}
</style>