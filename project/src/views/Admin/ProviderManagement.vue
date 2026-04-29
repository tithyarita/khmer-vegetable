
<template>
    <div class="provider-management-page">
        <div class="header-row">
            <div>
                <h1 class="title">Providers Management</h1>
                <p class="subtitle">Manage and monitor all providers across the digital greenhouse ecosystem.</p>
            </div>
            <button class="add-provider-btn">+ Add Provider</button>
        </div>
        <div class="filter-row">
            <input class="search-input" type="text" placeholder="Search by farm name or owner..." v-model="search" />
            <div class="status-filter">
                <label for="status">STATUS:</label>
                <select id="status" v-model="status">
                    <option>All Statuses</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Suspended</option>
                </select>
                <button class="apply-filter-btn">Apply Filters</button>
            </div>
        </div>
        <div class="main-content">
            <div class="table-section">
                <table class="provider-table">
                    <thead>
                        <tr>
                            <th>PROVIDER ID</th>
                            <th>FARM & OWNER</th>
                            <th>LOCATION</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="provider in paginatedProviders" :key="provider.id" :class="{selected: provider.id === selectedProvider.id}" @click="selectProvider(provider)">
                            <td>#PR0-{{ provider.id }}</td>
                            <td>
                                <div class="farm-owner">
                                    <img :src="provider.avatar" class="avatar" />
                                    <div>
                                        <div class="farm-name">{{ provider.farm }}</div>
                                        <div class="owner-name">{{ provider.owner }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{{ provider.location }}</td>
                            <td>
                                <span :class="['status-badge', provider.status.toLowerCase()]">{{ provider.status }}</span>
                            </td>
                            <td>
                                <span class="action-icon" title="View"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#888"/><circle cx="9" cy="9" r="3" fill="#888"/></svg></span>
                                <span class="action-icon" title="Edit"><svg width="18" height="18" fill="none"><rect x="3" y="13" width="12" height="2" rx="1" fill="#888"/><rect x="7" y="3" width="4" height="8" rx="2" fill="#888"/></svg></span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination-row">
                    <span>Showing {{ paginatedProviders.length }} of {{ providers.length }} Providers</span>
                    <div class="pagination">
                        <button :disabled="page === 1" @click="page--">&lt;</button>
                        <button v-for="p in totalPages" :key="p" :class="{active: p === page}" @click="page = p">{{ p }}</button>
                        <button :disabled="page === totalPages" @click="page++">&gt;</button>
                    </div>
                </div>
            </div>
            <div class="details-section" v-if="selectedProvider">
                <div class="details-card">
                    <div class="details-header">
                        <h2>Provider Details</h2>
                        <span class="edit-icon" title="Edit"><svg width="18" height="18" fill="none"><rect x="3" y="13" width="12" height="2" rx="1" fill="#888"/><rect x="7" y="3" width="4" height="8" rx="2" fill="#888"/></svg></span>
                    </div>
                    <img :src="selectedProvider.avatar" class="details-avatar" />
                    <div class="details-title-row">
                        <div class="details-title">{{ selectedProvider.farm }}</div>
                        <span class="elite-badge">ELITE PROVIDER</span>
                    </div>
                    <div class="details-owner-info">
                        <div class="owner-label">OWNER INFORMATION</div>
                        <div class="owner-info-row"><b>👤</b> {{ selectedProvider.owner }}</div>
                        <div class="owner-info-row"><b>✉️</b> {{ selectedProvider.email }}</div>
                        <div class="owner-info-row"><b>📞</b> {{ selectedProvider.phone }}</div>
                    </div>
                    <div class="about-label">ABOUT THE FARM</div>
                    <div class="about-text">{{ selectedProvider.about }}</div>
                    <div class="inventory-label">FEATURED INVENTORY</div>
                    <div class="inventory-tags">
                        <span v-for="item in selectedProvider.inventory" :key="item" class="inventory-tag">{{ item }}</span>
                    </div>
                    <button class="modify-status-btn">✓ Modify Status</button>
                    <button class="full-history-btn">View Full History</button>
                </div>
                <div class="vitality-card">
                    <div class="vitality-header">PROVIDER VITALITY <span class="vitality-icon">↗</span></div>
                    <div class="vitality-desc">Provider score is in the top 5% of the marketplace for quality and delivery speed.</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const providers = ref([
    {
        id: '1189',
        farm: 'Urban Greens Tech',
        owner: 'Alice Chen',
        location: 'New York, USA',
        status: 'Approved',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        email: 'alice@urbangreens.com',
        phone: '+1 (555) 123-4567',
        about: 'Urban Greens Tech is a leader in vertical farming, providing fresh greens to the city.',
        inventory: ['Kale', 'Heirloom Carrots', 'Wild Arugula', 'Swiss Chard']
    },
    {
        id: '8821',
        farm: 'Green Valley Organics',
        owner: 'Marcus Sterling',
        location: 'Vermont, USA',
        status: 'Suspended',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        email: 'm.sterling@greenvalley.co',
        phone: '+1 (555) 092-1234',
        about: 'Specializing in regenerative agriculture techniques to produce the highest nutrient-density leafy greens in the Vermont valley.',
        inventory: ['Kale', 'Heirloom Carrots', 'Wild Arugula', 'Swiss Chard']
    },
    {
        id: '9912',
        farm: 'Roots & Shoots Collective',
        owner: 'Sarah Jenkins',
        location: 'Oregon, USA',
        status: 'Pending',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        email: 'sarah@rootsandshoots.com',
        phone: '+1 (555) 987-6543',
        about: 'Roots & Shoots Collective brings together small organic farms for a big impact.',
        inventory: ['Kale', 'Heirloom Carrots']
    }
])

const search = ref('')
const status = ref('All Statuses')
const page = ref(1)
const pageSize = 4
const selectedProvider = ref(providers.value[1])

const filteredProviders = computed(() => {
    let result = providers.value
    if (search.value) {
        result = result.filter(p =>
            p.farm.toLowerCase().includes(search.value.toLowerCase()) ||
            p.owner.toLowerCase().includes(search.value.toLowerCase())
        )
    }
    if (status.value !== 'All Statuses') {
        result = result.filter(p => p.status === status.value)
    }
    return result
})

const totalPages = computed(() => Math.ceil(filteredProviders.value.length / pageSize))
const paginatedProviders = computed(() => {
    const start = (page.value - 1) * pageSize
    return filteredProviders.value.slice(start, start + pageSize)
})

function selectProvider(provider) {
    selectedProvider.value = provider
}
</script>

<style scoped>
.provider-management-page {
    padding: 2rem 2rem 2rem 2rem;
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
.add-provider-btn {
    background: #14532d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
}
.filter-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.search-input {
    flex: 1;
    padding: 0.7rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
}
.status-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.apply-filter-btn {
    background: #e5e7eb;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
}
.main-content {
    display: flex;
    gap: 2rem;
}
.table-section {
    flex: 2;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px #0001;
    padding: 1.5rem;
}
.provider-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}
.provider-table th {
    color: #64748b;
    font-weight: 600;
    padding: 0.7rem 0.5rem;
    text-align: left;
    font-size: 0.95rem;
}
.provider-table td {
    padding: 0.7rem 0.5rem;
    vertical-align: middle;
    font-size: 1rem;
}
.provider-table tr.selected {
    background: #f1f5f9;
}
.farm-owner {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}
.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e5e7eb;
}
.farm-name {
    font-weight: 600;
    color: #14532d;
}
.owner-name {
    color: #64748b;
    font-size: 0.95rem;
}
.status-badge {
    display: inline-block;
    padding: 0.2rem 0.8rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
}
.status-badge.approved {
    background: #22c55e;
}
.status-badge.pending {
    background: #a3a3a3;
    color: #333;
}
.status-badge.suspended {
    background: #ef4444;
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
.details-section {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}
.details-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px #0001;
    padding: 1.5rem;
    margin-bottom: 1rem;
}
.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}
.details-avatar {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    margin: 0 auto 1rem auto;
    display: block;
}
.details-title-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 0.5rem;
    justify-content: center;
}
.details-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #14532d;
}
.elite-badge {
    background: #e0f2fe;
    color: #0284c7;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 8px;
    padding: 0.2rem 0.7rem;
}
.details-owner-info {
    margin: 1rem 0 0.7rem 0;
}
.owner-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
}
.owner-info-row {
    color: #222;
    font-size: 1rem;
    margin-bottom: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.about-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 0.7rem;
}
.about-text {
    color: #222;
    font-size: 1rem;
    margin-bottom: 0.7rem;
}
.inventory-label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
}
.inventory-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
.inventory-tag {
    background: #f1f5f9;
    color: #222;
    border-radius: 8px;
    padding: 0.2rem 0.7rem;
    font-size: 0.95rem;
    font-weight: 500;
}
.modify-status-btn {
    background: #14532d;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.7rem;
    width: 100%;
    cursor: pointer;
}
.full-history-btn {
    background: #f1f5f9;
    color: #222;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
}
.vitality-card {
    background: #7c2d12;
    color: #fff;
    border-radius: 12px;
    padding: 1rem 1.2rem;
    font-size: 0.98rem;
    margin-top: 0.5rem;
}
.vitality-header {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.vitality-icon {
    font-size: 1.1rem;
}
.vitality-desc {
    font-size: 0.95rem;
    color: #f3f3f3;
}
.edit-icon {
    cursor: pointer;
}
</style>