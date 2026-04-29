<template>
  <div class="product-table-wrapper">
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr class="table-light">
            <th class="id-header">ID</th>
            <th class="name-header">PRODUCT NAME</th>
            <th class="price-header">PRICE</th>
            <th class="discount-header">DISCOUNT (%)</th>
            <th class="date-header">ADDED DATE</th>
            <th class="stock-header">STOCK</th>
            <th class="action-header">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="product-row">
            <td class="id-col">{{ product.id }}</td>
            <td class="name-col">
              <div class="product-row-content">
                <img 
                  :src="product.image || placeholderImage" 
                  @error="handleImageError"
                  class="row-image rounded" 
                  :alt="product.name"
                  style="width: 50px; height: 50px; object-fit: cover;"
                />
                <span>{{ product.name }}</span>
              </div>
            </td>
            <td class="price-col">${{ product.price }}</td>
            <td class="discount-col">{{ product.discount || 0 }}%</td>
            <td class="date-col">{{ product.addedDate || 'N/A' }}</td>
            <td class="stock-col">{{ product.stock }}</td>
            <td class="action-col">
              <div class="action-buttons d-flex gap-2">
                <button class="btn btn-sm btn-info" @click="$emit('view', product.id)" title="View Details">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" @click="$emit('edit', product)" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="$emit('delete', product.id)" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete'])

// SVG placeholder image as data URI - no external requests
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 50%22%3E%3Crect width=%2250%22 height=%2250%22 fill=%22%23f0f0f0%22/%3E%3C/svg%3E'

const handleImageError = (event) => {
  // Prevent infinite error loop - only set placeholder once
  if (event.target.src !== placeholderImage) {
    event.target.src = placeholderImage
  }
}
</script>

<style scoped>
.product-table-wrapper {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.table-responsive {
  height: 100%;
  overflow-y: auto;
}

.table {
  font-size: 0.9rem;
}

.table thead th {
  background-color: #f5f5f5;
  border-bottom: 1px solid #d0d0d0;
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px;
  position: sticky;
  top: 0;
}

.id-header {
  width: 12%;
}

.name-header {
  width: 27%;
}

.price-header {
  width: 12%;
  text-align: left;
}

.discount-header {
  width: 15%;

}

.date-header {
  width: 16%;

}

.stock-header {
  width: 14%;

}

.action-header {
  width: 14%;
  
}

.product-row {
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.product-row:hover {
  background-color: #f9f9f9;
}

.product-row td {
  padding: 12px;
  vertical-align: middle;
  color: #333;
  border: none;
}

.id-col {
  font-weight: 500;
  color: #999;
  width: 12%;
  font-size: 0.85rem;
}

.name-col {
  width: 27%;
}

.product-row-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.row-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  background: #e9ecef;
  flex-shrink: 0;
}

.price-col {
  font-weight: 600;
  color: #212529;
  width: 12%;
  text-align: left;
}

.discount-col {
  font-weight: 600;
  color: #212529;
  width: 15%;
  text-align: left;
  /* padding: 12px 12px; */
}

.date-col {
  font-size: 0.9rem;
  color: #666;
  width: 16%;

}

.stock-col {
  font-weight: 600;
  color: #212529;
  width: 14%;

}

.action-col {
  text-align: center;
  width: 14%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.view-detail-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #daa520;
  background: white;
  color: #daa520;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.view-detail-btn:hover {
  background: #daa520;
  color: white;
}

@media (max-width: 768px) {
  .id-header, .name-header, .price-header, .date-header, .stock-header, .action-header {
    width: auto;
  }

  .table {
    font-size: 0.8rem;
  }

  .product-row td {
    padding: 8px;
  }

  .row-image {
    width: 40px;
    height: 40px;
  }

  .view-detail-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
