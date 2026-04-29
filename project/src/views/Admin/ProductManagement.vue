<template>
    <div class="product-management-page">
        <div class="header-row">
            <div>
                <h1 class="title">Products Management</h1>
                <p class="subtitle">Manage all vegetable products from providers in your ecosystem.</p>
            </div>
            <div class="view-toggle">
                <button class="active">Grid View</button>
                <button>List View</button>
            </div>
        </div>
        <div class="summary-row">
            <div class="summary-card">
                <div class="icon-box"><span>🛒</span></div>
                <div>
                    <div class="summary-label">TOTAL PRODUCTS</div>
                    <div class="summary-value">1,284 <span class="summary-change">+12%</span></div>
                </div>
            </div>
            <div class="summary-card">
                <div class="icon-box"><span>✅</span></div>
                <div>
                    <div class="summary-label">ACTIVE PRODUCTS</div>
                    <div class="summary-value">1,150 <span class="summary-sub">90% Live</span></div>
                </div>
            </div>
            <div class="summary-card">
                <div class="icon-box"><span>⛔</span></div>
                <div>
                    <div class="summary-label">OUT OF STOCK</div>
                    <div class="summary-value out">134 <span class="summary-out">Needs Refill!</span></div>
                </div>
            </div>
        </div>
        <div class="filter-bar">
            <div class="filter-group">
                <label>Status:</label>
                <select v-model="status">
                    <option>All</option>
                    <option>Active</option>
                    <option>Out of Stock</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Provider:</label>
                <select v-model="provider">
                    <option>All Farms</option>
                    <option>Green Valley Organics</option>
                    <option>Root & Bloom Co.</option>
                    <option>Sunrise Vineyards</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Category:</label>
                <select v-model="category">
                    <option>All</option>
                    <option>Leafy Green</option>
                    <option>Root Vegetable</option>
                    <option>Fruit Vegetable</option>
                </select>
            </div>
            <div class="filter-actions">
                <button title="Export"><span>⬇️</span></button>
                <button title="Print"><span>🖨️</span></button>
            </div>
        </div>
        <div class="table-section">
            <table class="product-table">
                <thead>
                    <tr>
                        <th>PRODUCT INFO</th>
                        <th>CATEGORY</th>
                        <th>PROVIDER</th>
                        <th>INVENTORY</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in paginatedProducts" :key="product.id">
                        <td>
                            <div class="product-info">
                                <img :src="product.image" class="product-img" />
                                <div>
                                    <div class="product-name">{{ product.name }}</div>
                                    <div class="product-id">ID: PRD-{{ product.id }}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span :class="['category-badge', product.categoryClass]">{{ product.category }}</span>
                        </td>
                        <td>{{ product.provider }}</td>
                        <td>
                            <div class="inventory-info">
                                <span class="price">{{ product.price }}</span>
                                <span class="unit">/{{ product.unit }}</span>
                                <span :class="['inventory-left', { 'low': product.inventory < 10, 'out': product.inventory === 0 }]">
                                    {{ product.inventory === 0 ? '0 UNITS LEFT' : product.inventory + ' UNITS LEFT' }}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span :class="['status-badge', product.statusClass]">{{ product.status }}</span>
                        </td>
                        <td>
                            <button class="view-product-btn" @click="openProduct(product)">View Product</button>
                            <span class="action-icon" title="Edit"><svg width="18" height="18" fill="none"><rect x="3" y="13" width="12" height="2" rx="1" fill="#888"/><rect x="7" y="3" width="4" height="8" rx="2" fill="#888"/></svg></span>
                            <span class="action-icon" title="Delete"><svg width="18" height="18" fill="none"><rect x="4" y="4" width="10" height="10" rx="2" stroke="#888" stroke-width="2"/></svg></span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="pagination-row">
                <span>Showing {{ paginatedProducts.length }} of 1,284 products</span>
                <div class="pagination">
                    <button :disabled="page === 1" @click="page--">&lt;</button>
                    <button v-for="p in totalPages" :key="p" :class="{active: p === page}" @click="page = p">{{ p }}</button>
                    <button :disabled="page === totalPages" @click="page++">&gt;</button>
                </div>
            </div>
        </div>

        <!-- Product Preview Drawer -->
        <div v-if="showProduct" class="product-preview-drawer">
            <div class="drawer-header">
                <span class="drawer-title">Product Preview</span>
                <button class="update-btn">Update Info</button>
            </div>
            <img :src="selectedProduct.image" class="drawer-img" />
            <div class="drawer-id-row">
                <span class="drawer-id">ID: PRD-{{ selectedProduct.id }}</span>
                <span class="drawer-date">Created Oct 12, 2023</span>
            </div>
            <div class="drawer-product-name">{{ selectedProduct.name }}</div>
            <div class="drawer-desc">Grown without synthetic pesticides. Our kale is harvested daily to ensure maximum freshness and crispiness for your customers. High in vitamins A, K, and C.</div>
            <div class="drawer-info-row">
                <div class="drawer-info-box">
                    <div class="drawer-info-label">CATEGORY</div>
                    <div class="drawer-info-value">{{ selectedProduct.category }}</div>
                </div>
                <div class="drawer-info-box">
                    <div class="drawer-info-label">STOCK</div>
                    <div class="drawer-info-value">{{ selectedProduct.inventory }} Units</div>
                </div>
            </div>
            <div class="drawer-provider-box">
                <div class="drawer-info-label">PROVIDER INFORMATION</div>
                <div class="drawer-provider-name">{{ selectedProduct.provider }}</div>
                <div class="drawer-provider-location">Sonoma County, California</div>
            </div>
            <button class="drawer-close" @click="closeProduct">×</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const status = ref('All')
const provider = ref('All Farms')
const category = ref('All')
const page = ref(1)
const pageSize = 3

const products = ref([
    {
        id: '88219',
        name: 'Organic Curly Kale',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=96&h=96',
        category: 'LEAFY GREEN',
        categoryClass: 'leafy',
        provider: 'Green Valley Organics',
        price: '$3.50',
        unit: 'bunch',
        inventory: 420,
        status: 'Active',
        statusClass: 'active',
    },
    {
        id: '44102',
        name: 'Heirloom Carrots',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=facearea&w=96&h=96',
        category: 'ROOT VEGETABLE',
        categoryClass: 'root',
        provider: 'Root & Bloom Co.',
        price: '$2.25',
        unit: 'lb',
        inventory: 2,
        status: 'Out of Stock',
        statusClass: 'out',
    },
    {
        id: '99321',
        name: 'Vine-Ripened Tomatoes',
        image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=96&h=96',
        category: 'FRUIT VEGETABLE',
        categoryClass: 'fruit',
        provider: 'Sunrise Vineyards',
        price: '$4.95',
        unit: 'pack',
        inventory: 124,
        status: 'Active',
        statusClass: 'active',
    },
])

const filteredProducts = computed(() => {
    let result = products.value
    if (status.value !== 'All') {
        if (status.value === 'Active') result = result.filter(p => p.status === 'Active')
        if (status.value === 'Out of Stock') result = result.filter(p => p.status === 'Out of Stock')
    }
    if (provider.value !== 'All Farms') {
        result = result.filter(p => p.provider === provider.value)
    }
    if (category.value !== 'All') {
        result = result.filter(p => p.category.toLowerCase().includes(category.value.toLowerCase()))
    }
    return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize))
const paginatedProducts = computed(() => {
    const start = (page.value - 1) * pageSize
    return filteredProducts.value.slice(start, start + pageSize)
})
// ...existing code...

const showProduct = ref(false)
const selectedProduct = ref({})

function openProduct(product) {
    selectedProduct.value = product
    showProduct.value = true
}
function closeProduct() {
    showProduct.value = false
}
</script>

<style scoped>
.product-management-page {
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
}
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}
.title {
    color: #14532d;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
}
.subtitle {
    color: #64748b;
    font-size: 1rem;
}
.view-toggle {
    display: flex;
    gap: 0.5rem;
}
.view-toggle button {
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    color: #14532d;
    cursor: pointer;
}
.view-toggle button.active {
    background: #14532d;
    color: #fff;
}
.summary-row {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
}
.summary-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px #0001;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem 2rem;
    min-width: 260px;
}
.icon-box {
    background: #f1f5f9;
    border-radius: 12px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
}
.summary-label {
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 600;
}
.summary-value {
    color: #14532d;
    font-size: 1.5rem;
    font-weight: 700;
}
.summary-change {
    color: #22c55e;
    font-size: 1rem;
    margin-left: 0.5rem;
}
.summary-sub {
    color: #64748b;
    font-size: 1rem;
    margin-left: 0.5rem;
}
.summary-value.out {
    color: #dc2626;
}
.summary-out {
    color: #dc2626;
    font-size: 1rem;
    margin-left: 0.5rem;
}
.filter-bar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px #0001;
    padding: 1rem 2rem;
    margin-bottom: 1.5rem;
}
.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.filter-actions {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
}
.filter-actions button {
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.8rem;
    font-size: 1.1rem;
    cursor: pointer;
}
.table-section {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px #0001;
    padding: 1.5rem;
}
.product-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}
.product-table th {
    color: #64748b;
    font-weight: 600;
    padding: 0.7rem 0.5rem;
    text-align: left;
    font-size: 0.95rem;
}
.product-table td {
    padding: 0.7rem 0.5rem;
    vertical-align: middle;
    font-size: 1rem;
}
.product-info {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}
.product-img {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #e5e7eb;
}
.product-name {
    font-weight: 600;
    color: #14532d;
}
.product-id {
    color: #64748b;
    font-size: 0.95rem;
}
.category-badge {
    display: inline-block;
    padding: 0.2rem 0.8rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
}
.category-badge.leafy {
    background: #22c55e;
}
.category-badge.root {
    background: #a16207;
}
.category-badge.fruit {
    background: #e11d48;
}
.inventory-info {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}
.price {
    color: #14532d;
    font-weight: 700;
}
.unit {
    color: #64748b;
    font-size: 0.95rem;
}
.inventory-left {
    color: #22c55e;
    font-size: 0.95rem;
    font-weight: 600;
    margin-left: 0.5rem;
}
.inventory-left.low {
    color: #eab308;
}
.inventory-left.out {
    color: #dc2626;
}
.status-badge {
    display: inline-block;
    padding: 0.2rem 0.8rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
}
.status-badge.active {
    background: #22c55e;
}
.status-badge.out {
    background: #dc2626;
}
.action-icon {
    margin-right: 0.5rem;
    cursor: pointer;
    vertical-align: middle;
}
.pagination-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}
.pagination button {
    background: #fff;
    border: 1px solid #14532d;
    color: #14532d;
    border-radius: 6px;
    margin: 0 0.2rem;
    padding: 0.2rem 0.8rem;
    cursor: pointer;
}
.pagination button.active {
    background: #14532d;
    color: #fff;
}
/* ...existing styles... */

.view-product-btn {
    background: #14532d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    margin-right: 0.5rem;
    cursor: pointer;
}

.product-preview-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    background: #fff;
    box-shadow: -4px 0 24px #0002;
    z-index: 1000;
    padding: 2rem 2rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* Remove overflow-y: auto to prevent scrolling */
}

@keyframes slideInDrawer {
    from { right: -500px; }
    to { right: 0; }
}

.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
}

.drawer-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #222;
}

.update-btn {
    background: #14532d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
}

.drawer-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 18px;
    margin-bottom: 1.2rem;
}

.drawer-id-row {
    display: flex;
    justify-content: space-between;
    color: #64748b;
    font-size: 0.98rem;
    margin-bottom: 0.5rem;
}

.drawer-product-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: #14532d;
    margin-bottom: 0.5rem;
}

.drawer-desc {
    color: #222;
    font-size: 1rem;
    margin-bottom: 1.2rem;
}

.drawer-info-row {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
}

.drawer-info-box {
    background: #f1f5f9;
    border-radius: 10px;
    padding: 0.7rem 1.2rem;
    flex: 1;
}

.drawer-info-label {
    color: #64748b;
    font-size: 0.92rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
}

.drawer-info-value {
    color: #222;
    font-size: 1.1rem;
    font-weight: 600;
}

.drawer-provider-box {
    background: #f8fafc;
    border-radius: 10px;
    padding: 0.7rem 1.2rem;
    margin-bottom: 1.2rem;
}

.drawer-provider-name {
    color: #14532d;
    font-weight: 600;
    font-size: 1.05rem;
}

.drawer-provider-location {
    color: #64748b;
    font-size: 0.98rem;
}

.drawer-controls {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
}

.drawer-status {
    background: #22c55e;
    color: #fff;
    border-radius: 8px;
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
}

.drawer-status.out {
    background: #dc2626;
}

.disable-btn {
    background: #fff7ed;
    color: #dc2626;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}

.drawer-actions {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
}

.logs-btn, .delete-btn {
    flex: 1;
    background: #f1f5f9;
    color: #222;
    border: none;
    border-radius: 8px;
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}

.delete-btn {
    background: #fff1f2;
    color: #dc2626;
}

.drawer-close {
    position: absolute;
    top: 18px;
    right: 18px;
    background: none;
    border: none;
    font-size: 2rem;
    color: #64748b;
    cursor: pointer;
}
</style>