<template>
  <div class="providers-card">
    <div class="card-header">
      <h3 class="card-title">Elite Providers</h3>
      <a href="#" class="view-all">View All</a>
    </div>

    <div class="providers-list">
      <div v-for="(p, i) in providers" :key="p.id" class="provider-row">
        <!-- Rank icon -->
        <div :class="['rank-badge', `rank-badge--${i}`]">
          <i class="bi bi-award-fill" v-if="i === 0"></i>
          <span v-else>{{ i + 1 }}</span>
        </div>

        <!-- Info -->
        <div class="provider-info">
          <p class="provider-name">{{ p.name }}</p>
          <p class="provider-loc">{{ p.location }}</p>
        </div>

        <!-- Revenue + tag -->
        <div class="provider-rev">
          <p class="rev-amount">${{ p.revenue.toLocaleString() }}</p>
          <span :class="['rev-tag', `rev-tag--${p.tagType}`]">{{ p.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const providers = [
  { id: 1, name: 'Green Valley Farms',    location: 'Kampot Province', revenue: 12600, tag: 'Top Performer', tagType: 'top'     },
  { id: 2, name: 'Khmer Roots Collective',location: 'Siem Reap',       revenue: 9200,  tag: 'Stable Growth', tagType: 'stable'  },
  { id: 3, name: 'Mekong Organic Hub',    location: 'Kandal Province', revenue: 7850,  tag: 'Trending',      tagType: 'trending'},
]
</script>

<style scoped>
.providers-card {
  background: #fff; border: 1px solid #eaeaea;
  border-radius: 14px; padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05); flex: 1;
}

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.card-title { font-size: 14px; font-weight: 700; color: #111827; }
.view-all   { font-size: 11.5px; font-weight: 600; color: #2d6a4f; }

.providers-list { display: flex; flex-direction: column; gap: 2px; }

.provider-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f3;
}
.provider-row:last-child { border-bottom: none; }

/* Rank */
.rank-badge {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; flex-shrink: 0;
  background: #f3f4f6; color: #6b7280;
}
.rank-badge--0 { background: #fef3c7; color: #d97706; font-size: 15px; }
.rank-badge--1 { background: #f3f4f6; color: #6b7280; }
.rank-badge--2 { background: #fce7f3; color: #9d174d; }

/* Info */
.provider-info { flex: 1; min-width: 0; }
.provider-name { font-size: 12.5px; font-weight: 700; color: #111827; }
.provider-loc  { font-size: 11px; color: #9ca3af; margin-top: 1px; }

/* Revenue */
.provider-rev  { text-align: right; }
.rev-amount    { font-size: 13px; font-weight: 800; color: #111827; }
.rev-tag {
  display: inline-block; margin-top: 2px;
  font-size: 9.5px; font-weight: 700; border-radius: 4px; padding: 1px 6px;
}
.rev-tag--top     { background: #d1fae5; color: #065f46; }
.rev-tag--stable  { background: #dbeafe; color: #1e40af; }
.rev-tag--trending{ background: #ede9fe; color: #5b21b6; }
</style>