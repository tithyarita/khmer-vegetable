<template>
  <div class="sd-overlay" @click="$emit('close')" />
  <div class="sd-dropdown" @click.stop>
    <div class="sd-section" v-if="filteredItems.length">
      <div class="sd-label">Products</div>
      <div v-for="item in filteredItems" :key="item.id" class="sd-row" @mousedown.prevent="goToProduct(item)">
        <div class="sd-thumb">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <span v-else>🛒</span>
        </div>
        <div class="sd-info">
          <div class="sd-name">{{ item.name }}</div>
          <div class="sd-sub">{{ item.category }}</div>
        </div>
        <div class="sd-price">${{ item.price }}</div>
      </div>
      <div v-if="!filteredItems.length" class="sd-empty">No products found</div>
    </div>

    <div class="sd-section">
      <div class="sd-label">Farmers</div>
      <div class="sd-farms">
        <div v-for="f in filteredFarmers" :key="f.id" class="sd-farm" @mousedown.prevent="goToFarmer(f)">
          <div class="sd-farm-avatar">{{ f.initials }}</div>
          <div class="sd-farm-name">{{ f.name }}</div>
        </div>
      </div>
    </div>

    <div class="sd-section">
      <div class="sd-label">Popular categories</div>
      <div class="sd-tags">
        <span v-for="tag in popularTags" :key="tag" class="sd-tag" @mousedown.prevent="searchTag(tag)">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { useProductStore } from '../../stores/productStore'
export default {
  name: 'SearchDropdown',
  props: { query: { type: String, required: true } },
  emits: ['close'],
  setup() { return { productStore: useProductStore() } },
  data() {
    return {
      exampleProducts: [
        { id: 1, name: 'Fresh Kale', category: 'Leafy Greens', price: 4.99, image: null },
        { id: 2, name: 'Bok Choy', category: 'Cruciferous', price: 3.50, image: null },
        { id: 3, name: 'Red Radishes', category: 'Root Veg', price: 2.75, image: null },
        { id: 4, name: 'Oyster Mushrooms', category: 'Fungi', price: 7.50, image: null },
        { id: 5, name: 'Sunflower Shoots', category: 'Leafy Greens', price: 5.25, image: null },
        { id: 6, name: 'Sweet Turnips', category: 'Root Veg', price: 3.20, image: null },
      ],
      farmers: [
        { id: 1, name: 'Dara Farm', initials: '🧑‍🌾', location: 'Takeo Province' },
        { id: 2, name: 'Green Valley Farm', initials: '👩‍🌾', location: 'Kampong Speu' },
        { id: 3, name: 'Mekong Harvest', initials: '🧑‍🌾', location: 'Kampong Cham' },
      ],
      popularTags: ['Leafy Greens', 'Microgreens', 'Heirloom', 'Organic', 'Herbs'],
    }
  },
  computed: {
    filteredItems() {
      if (!this.productStore.products.length) return []
      if (!this.query.trim()) return this.productStore.products.slice(0, 4)
      const q = this.query.toLowerCase()
      return this.productStore.products.filter(p => (p.name||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q)).slice(0, 4)
    },
    filteredFarmers() {
      if (!this.query.trim()) return this.farmers
      const q = this.query.toLowerCase()
      return this.farmers.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3)
    },
  },
  methods: {
    goToProduct(item) { this.$router.push(`/product/${item.id}`); this.$emit('close') },
    goToFarmer(f) { this.$router.push(`/search?farmer=${f.id}`); this.$emit('close') },
    searchTag(tag) { this.$emit('close') },
  },
  mounted() { if (!this.productStore.products.length) this.productStore.fetchAllProducts() },
}
</script>
<style scoped>
.sd-overlay { position: fixed; top:0; left:0; width:100%; height:100%; z-index:198; background:transparent; }
.sd-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; min-width:320px; background:#fff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.10); z-index:199; overflow:hidden; max-height:400px; overflow-y:auto; }
.sd-section { padding:0.75rem 1rem 0.7rem; border-bottom:0.5px solid #f0ebe2; }
.sd-section:last-child { border-bottom:none; }
.sd-label { font-size:9px; font-weight:500; letter-spacing:0.08em; color:#aaa; text-transform:uppercase; margin-bottom:0.6rem; }
.sd-row { display:flex; align-items:center; gap:8px; padding:5px 0; cursor:pointer; border-radius:6px; transition:background 0.1s; }
.sd-row:hover { background:#f7f5f0; padding:5px 6px; margin:0 -6px; }
.sd-thumb { width:30px; height:30px; border-radius:6px; background:#eef5ee; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; overflow:hidden; }
.sd-thumb img { width:100%; height:100%; object-fit:cover; }
.sd-thumb span { font-size:14px; }
.sd-info { flex:1; min-width:0; }
.sd-name { font-size:12px; font-weight:500; color:#1a1a1a; }
.sd-sub { font-size:10px; color:#aaa; margin-top:1px; }
.sd-price { font-size:12px; font-weight:500; color:#1e4d2b; white-space:nowrap; }
.sd-empty { padding:8px 0; text-align:center; font-size:11px; color:#aaa; }
.sd-farms { display:flex; gap:10px; }
.sd-farm { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; }
.sd-farm-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#a8d5b0,#4a9e5c); display:flex; align-items:center; justify-content:center; font-size:14px; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.08); }
.sd-farm-name { font-size:10px; color:#666; }
.sd-tags { display:flex; flex-wrap:wrap; gap:4px; }
.sd-tag { font-size:11px; color:#1e4d2b; background:#eef5ee; border:0.5px solid #c5dfc9; padding:3px 10px; border-radius:20px; cursor:pointer; transition:background 0.15s; }
.sd-tag:hover { background:#d8eddb; }
</style>
