<template>
  <div class="feedback-section">
    <div class="section-header">
      <div>
        <h2>Customer Reviews</h2>
        <p class="section-sub">Feedback from customers who purchased your products</p>
      </div>
      <div v-if="summary.total > 0" class="rating-summary">
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
          <span class="total-count">{{ summary.total }} review{{ summary.total !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading reviews...</span>
    </div>

    <div v-else-if="reviews.length === 0" class="empty-state">
      <span class="empty-icon">💬</span>
      <p>No reviews yet</p>
      <span>Customer feedback will appear here once they review your products</span>
    </div>

    <div v-else class="review-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="avatar" :style="{ background: review.color }">
              <span class="avatar-fallback">{{ review.initials }}</span>
            </div>
            <div>
              <strong>{{ review.author }}</strong>
              <span v-if="review.productName" class="product-tag">{{ review.productName }}</span>
              <span class="review-date">{{ review.date }}</span>
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
        <p v-if="review.feedback" class="review-comment">{{ review.feedback }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewStore } from '@/stores/reviewStore'

const reviewStore = useReviewStore()

const loading = computed(() => reviewStore.loading)
const reviews = computed(() => reviewStore.reviews)

const summary = computed(() => ({
  average_rating: Number(reviewStore.averageRating) || 0,
  total: reviewStore.reviewCount,
}))

onMounted(() => {
  reviewStore.fetchReviewsByProvider()
})
</script>

<style scoped>
.feedback-section {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8ecef;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.section-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 4px 0 0;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 0.5rem 1rem;
}

.big-rating {
  font-size: 1.75rem;
  font-weight: 700;
  color: #15803d;
  line-height: 1;
}

.stars-display { display: flex; gap: 1px; }
.star { font-size: 0.85rem; color: #d1d5db; }
.star.filled { color: #f59e0b; }
.total-count { font-size: 0.75rem; color: #6b7280; margin-top: 2px; display: block; }

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #9ca3af;
  justify-content: center;
  font-size: 0.875rem;
}

.spinner {
  width: 18px; height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #15803d;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #9ca3af;
}

.empty-icon { font-size: 2rem; display: block; margin-bottom: 0.75rem; }
.empty-state p { font-size: 0.95rem; color: #374151; font-weight: 600; margin: 0 0 4px; }
.empty-state span { font-size: 0.8rem; }

.review-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 420px;
  overflow-y: auto;
}

.review-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.review-card:hover {
  border-color: #bbf7d0;
  box-shadow: 0 2px 8px rgba(21,128,61,0.06);
}

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.avatar-fallback { font-weight: 700; color: #fff; font-size: 0.8rem; }
.reviewer-info strong { display: block; font-size: 0.875rem; color: #111827; }

.product-tag {
  display: inline-block;
  font-size: 0.7rem;
  color: #15803d;
  background: #f0fdf4;
  border-radius: 4px;
  padding: 1px 6px;
  margin-top: 2px;
}

.review-date { display: block; font-size: 0.72rem; color: #9ca3af; margin-top: 2px; }

.review-stars { display: flex; gap: 1px; }
.review-comment {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
  padding-left: 2.75rem;
}
</style>
