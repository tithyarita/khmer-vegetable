<template>
  <div class="hero-card">
    <div class="slider-container">
      <div
        class="slider-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <div class="slide-bg" :style="{ backgroundImage: `url(${slide.image})` }"></div>
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <button class="btn" @click="shopNow(slide)">Shop Now</button>
          </div>
        </div>
      </div>

      <button class="arrow prev" @click="prevSlide">&#10094;</button>
      <button class="arrow next" @click="nextSlide">&#10095;</button>

      <div class="dots">
        <span
          v-for="(slide, index) in slides"
          :key="index"
          :class="['dot', { active: currentIndex === index }]"
          @click="goToSlide(index)"
        ></span>
      </div>

      <div class="progress">
        <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentIndex = ref(0)
const progressWidth = ref(0)
let autoSlide = null
let progressInterval = null
const SLIDE_DURATION = 4500
const PROGRESS_STEP = 50

const slides = [
  { tag: "Today's Pick", title: 'Organic Curly Kale', subtitle: 'Fresh & nutrient-packed greens', price: '2.50', originalPrice: '3.20', unit: 'bunch', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=95' },
  { tag: 'Best Seller', title: 'Heirloom Tomatoes', subtitle: 'Vine-ripened and full of flavor', price: '4.99', originalPrice: '6.50', unit: 'pack', image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=1600&q=95' },
  { tag: 'Superfood', title: 'Fresh Spinach Mix', subtitle: 'Iron-rich daily superfood', price: '3.75', originalPrice: '4.50', unit: 'bag', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=1600&q=95' },
  { tag: 'Seasonal', title: 'Asparagus Spears', subtitle: 'Spring harvest at its finest', price: '5.25', originalPrice: '6.99', unit: 'lb', image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=1600&q=95' },
]

function shopNow(slide) {
  const message = `Hi! I'm interested in ${slide.title}. Can you share some recipes or tips?`
  window.location.href = `/chat?message=${encodeURIComponent(message)}`
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
  resetProgress()
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
  resetProgress()
}

function goToSlide(index) {
  currentIndex.value = index
  resetProgress()
}

function resetProgress() { progressWidth.value = 0 }

function startProgress() {
  progressInterval = setInterval(() => {
    progressWidth.value += (PROGRESS_STEP / SLIDE_DURATION) * 100
    if (progressWidth.value >= 100) progressWidth.value = 100
  }, PROGRESS_STEP)
}

function stopProgress() { if (progressInterval) clearInterval(progressInterval) }

function startAutoSlide() {
  autoSlide = setInterval(() => nextSlide(), SLIDE_DURATION)
  startProgress()
}

function stopAutoSlide() {
  if (autoSlide) clearInterval(autoSlide)
  stopProgress()
}

onMounted(() => { startAutoSlide() })
onUnmounted(() => { stopAutoSlide() })
</script>

<style scoped>
.hero-card {
  width: 100%;
  position: relative;
  overflow: hidden;
  height: 500px;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slider-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
}

.slide-content {
  position: absolute;
  z-index: 2;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
}

.btn {
  background: white;
  color: #1a1a1a;
  border: none;
  padding: 12px 32px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.04);
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  z-index: 3;
  transition: background 0.2s;
}

.arrow:hover {
  background: rgba(255, 255, 255, 0.3);
}

.arrow.prev { left: 12px; }
.arrow.next { right: 12px; }

.dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 3;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: white;
  transform: scale(1.2);
}

.progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 3;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.05s linear;
}

@media (max-width: 700px) {
  .hero-card { min-height: 240px; }
  .btn { padding: 10px 24px; font-size: 13px; }
}
</style>
