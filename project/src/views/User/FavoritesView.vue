<template>
  <div class="favorites">
    <NavigationBar />
    <br>
    <section class="section favorites-section">
      <div class="section-inner">
        <div class="section-header">
          <h2 class="section-title">{{ t('myFavorites') }}</h2>
          <span class="item-count">{{ favoriteStore.favoriteCount }} {{ t('items') }}</span>
        </div>
        <div v-if="favoriteStore.favoriteCount > 0" class="favorites-grid">
          <Card :products="favoriteStore.favoriteItems" />
        </div>
        <div v-else class="empty-state">
          <p>{{ t('noFavorites') }}</p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavigationBar from '../../components/Customer/NavigationBar.vue'
import Card from '../../components/Customer/Card.vue'
import Footer from '../../components/Customer/Footer.vue'
import { useFavoriteStore } from '../../stores/favoriteStore'
import { useI18n } from '@/composables/useI18n'

const favoriteStore = useFavoriteStore()
const { t } = useI18n()

onMounted(async () => {
  await favoriteStore.fetchFavoritesFromBackend()
})
</script>

<style scoped>
.item-count {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-state p {
  font-size: 1.1rem;
}

.favorites {
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f6;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ── SECTION ── */
.section {
  width: 100%;
  padding: 48px 24px;
  box-sizing: border-box;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── HEADER ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2e1a;
}

.favorites-grid {
  margin-top: 20px;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .section {
    padding: 32px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
