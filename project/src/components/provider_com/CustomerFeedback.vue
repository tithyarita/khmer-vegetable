<template>
  <div class="feedback-section">
    <div class="section-header">
      <h2>Customer Feedback</h2>
      <div class="rating-summary" v-if="summary.total > 0">
        <div class="big-rating">{{ summary.average_rating }}</div>
        <div class="rating-detail">
          <div class="stars-display">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="i <= Math.round(summary.average_rating) ? 'filled' : ''"
            >★</span>
          </div>
          <span class="total-count">{{ summary.total }} reviews</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading reviews...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="reviews.length === 0" class="empty-state">
      <span class="empty-icon">💬</span>
      <p>No reviews yet</p>
      <span>Customer feedback will appear here</span>
    </div>

    <!-- Review List -->
    <div v-else class="review-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="avatar">
              <img
                v-if="review.customer_avatar"
                :src="`http://localhost:3000${review.customer_avatar}`"
                :alt="review.customer_name"
              />
              <span v-else class="avatar-fallback">
                {{ (review.customer_name || 'A')[0].toUpperCase() }}
              </span>
            </div>
            <div>
              <strong>{{ review.customer_name || 'Anonymous' }}</strong>
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
            </div>
          </div>
          <div class="review-stars">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="i <= review.rating ? 'filled' : ''"
            >★</span>
          </div>
        </div>
        <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

interface Review {
  id: number
  customer_id: number
  customer_name: string
  customer_avatar: string
  rating: number
  comment: string
  created_at: string
}

const props = defineProps<{ providerId: number }>()

const reviews = ref<Review[]>([])
const loading = ref(false)
const summary = ref({ average_rating: 0, total: 0 })

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

async function fetchReviews() {
  if (!props.providerId) return
  loading.value = true
  try {
    const res = await axios.get(
      `http://localhost:3000/providers/${props.providerId}/feedbacks`,
    )
    reviews.value        = res.data.reviews        ?? []
    summary.value.average_rating = res.data.average_rating ?? 0
    summary.value.total          = res.data.total          ?? 0
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.providerId, fetchReviews)
onMounted(fetchReviews)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.feedback-section {
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.section-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fdf9;
  border-radius: 12px;
  padding: .6rem 1.2rem;
}
.big-rating {
  font-size: 2rem;
  font-weight: 700;
  color: #2d6a4f;
}
.stars-display { display: flex; gap: 2px; }
.star { font-size: 1rem; color: #d1d5db; }
.star.filled { color: #f59e0b; }
.total-count { font-size: .8rem; color: #888; margin-top: .2rem; display: block; }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: 2rem;
  color: #888;
  justify-content: center;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #e5e5e5;
  border-top-color: #2d6a4f;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #aaa;
}
.empty-icon { font-size: 2.5rem; display: block; margin-bottom: .8rem; }
.empty-state p { font-size: 1rem; color: #555; font-weight: 600; }

/* Review cards */
.review-list { display: flex; flex-direction: column; gap: 1rem; }

.review-card {
  border: 1.5px solid #f0f0f0;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  transition: border-color .2s;
}
.review-card:hover { border-color: #b7e4c7; }

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: .6rem;
  flex-wrap: wrap;
  gap: .5rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: .8rem;
}
.avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #d8f3dc;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { font-weight: 700; color: #2d6a4f; font-size: 1rem; }
.reviewer-info strong { display: block; font-size: .9rem; color: #1a1a1a; }
.review-date { font-size: .75rem; color: #aaa; }

.review-stars { display: flex; gap: 2px; }
.review-comment {
  font-size: .88rem;
  color: #555;
  line-height: 1.5;
  margin: 0;
  padding-left: 3rem;
}
</style>