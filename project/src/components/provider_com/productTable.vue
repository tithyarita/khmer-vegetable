<template>
  <div class="table-card">
    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th class="w-id">ID</th>
            <th class="w-name">Product Name</th>
            <th class="w-price text-end">Base Price</th>
            <th class="w-discount text-center">Discount</th>
            <th class="w-final text-end text-emerald">Price After Discount</th>
            <th class="w-date">Added Date</th>
            <th class="w-stock text-center">Stock Level</th>
            <th class="w-actions text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="table-row">
            <td class="cell-id">#{{ product.id }}</td>
            <td>
              <div class="product-profile">
                <div class="image-container">
                  <img 
                    :src="product.image || placeholderImage" 
                    @error="handleImageError"
                    class="product-thumb" 
                    :alt="product.name"
                  />
                </div>
                <span class="product-title-name">{{ product.name }}</span>
              </div>
            </td>
            <td class="text-end fw-semibold text-dark">${{ Number(product.price).toFixed(2) }}</td>
            <td class="text-center">
              <span v-if="product.discount" class="discount-pill">
                -{{ product.discount }}%
              </span>
              <span v-else class="text-muted small">-</span>
            </td>
            <td class="text-end fw-bold text-emerald">
              ${{ (product.priceAfterDiscount ?? product.price).toFixed(2) }}
            </td>
            
            <td class="text-muted font-monospace small">
              {{ product.formattedAddedDate || product.addedDate || 'N/A' }}
            </td>

            <td class="text-center">
              <span :class="['stock-status-badge', stockClass(product.stock)]">
                <span class="status-dot"></span>
                {{ stockLabel(product.stock) }}
              </span>
            </td>
            <td>
              <div class="action-trigger-group">
                <button class="action-btn btn-view" @click="$emit('view', product.id)" title="View Details">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn btn-edit" @click="$emit('edit', product)" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn btn-delete" @click="$emit('delete', product.id)" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="8" class="text-center py-5 text-muted">
              <i class="bi bi-inbox display-6 d-block mb-2 text-neutral"></i>
              No products available matching criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  products: { type: Array, required: true }
})
defineEmits(['view', 'edit', 'delete'])

const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 50%22%3E%3Crect width=%2250%22 height=%2250%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E'

const handleImageError = (event) => {
  if (event.target.src !== placeholderImage) {
    event.target.src = placeholderImage
  }
}

const stockClass = (stock) => {
  const value = Number(stock || 0)
  if (value <= 0) return 'is-out'
  if (value < 5) return 'is-low'
  return 'is-ok'
}

const stockLabel = (stock) => {
  const value = Number(stock || 0)
  if (value <= 0) return 'Out of stock'
  if (value < 5) return `${value} kg (Low)`
  return `${value} kg`
}
</script>

<style scoped>
.table-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.custom-table thead th {
  background: #f8fafc;
  padding: 16px 20px;
  font-weight: 600;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.custom-table tbody td {
  padding: 16px 20px;
  vertical-align: middle;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.table-row {
  transition: background-color 0.2s ease;
}
.table-row:hover {
  background-color: #f8fafc;
}

/* Explicit Width Mixes */
.w-id { width: 6%; }
.w-name { width: 24%; }
.w-price { width: 11%; }
.w-discount { width: 10%; }
.w-final { width: 15%; }
.w-date { width: 15%; } /* Expanded slightly to perfectly accommodate localized AM/PM stamps cleanly */
.w-stock { width: 11%; }
.w-actions { width: 10%; }

.cell-id {
  font-weight: 500;
  color: #94a3b8;
}

.product-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.image-container {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.product-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-title-name {
  font-weight: 500;
  color: #1e293b;
}

.text-emerald {
  color: #10b981 !important;
}

.discount-pill {
  background: #fef2f2;
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

/* Redesigned Stock Badges */
.stock-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 30px;
  font-weight: 500;
  font-size: 13px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.is-ok { background: #ecfdf5; color: #065f46; }
.is-ok .status-dot { background: #10b981; }

.is-low { background: #fffbeb; color: #92400e; }
.is-low .status-dot { background: #f59e0b; }

.is-out { background: #f1f5f9; color: #475569; }
.is-out .status-dot { background: #94a3b8; }

/* Dynamic Smooth Action Group */
.action-trigger-group {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #64748b;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-view:hover { background: #e0f2fe; color: #0369a1; }
.btn-edit:hover { background: #fef3c7; color: #b45309; }
.btn-delete:hover { background: #fee2e2; color: #b91c1c; }

@media (max-width: 992px) {
  .custom-table thead th, .custom-table tbody td { padding: 12px; }
  .image-container { width: 36px; height: 36px; }
}
</style>