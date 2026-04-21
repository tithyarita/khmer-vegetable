<template>
  <div class="recent-order-wrapper card border-0 shadow-sm">
    <div class="card-header bg-white border-bottom py-3 px-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">Recent Order</h5>
        <button class="btn btn-link btn-sm">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr class="table-light">
              <th class="order-id-header px-4 py-3">ORDER ID</th>
              <th class="product-header px-4 py-3">PRODUCT</th>
              <th class="quantity-header px-4 py-3">QUANTITY</th>
              <th class="date-header px-4 py-3">DATE</th>
              <th class="status-header px-4 py-3">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="recent-order-row">
              <td class="order-id-col px-4 py-3">
                <span class="fw-bold text-primary">{{ order.id }}</span>
              </td>
              <td class="product-col px-4 py-3">{{ order.product }}</td>
              <td class="quantity-col px-4 py-3">{{ order.quantity }}</td>
              <td class="date-col px-4 py-3">{{ order.date }}</td>
              <td class="status-col px-4 py-3">
                <span class="badge" :class="`bg-${order.statusColor}`">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  {
    id: '#001',
    product: 'Tomato',
    quantity: '1kg',
    date: '18 Apr 2021',
    status: 'Completed',
    statusColor: 'success'
  },
  {
    id: '#002',
    product: 'Cabbage',
    quantity: '5kg',
    date: '18 Apr 2021',
    status: 'Completed',
    statusColor: 'success'
  },
  {
    id: '#003',
    product: 'Carrot',
    quantity: '2kg',
    date: '20 May 2021',
    status: 'Completed',
    statusColor: 'success'
  },
  {
    id: '#004',
    product: 'Potato',
    quantity: '3kg',
    date: '12 Jul 2021',
    status: 'Completed',
    statusColor: 'success'
  }
])
</script>

<style scoped>
.recent-order-wrapper {
  border-radius: 8px;
}

.table {
  font-size: 0.9rem;
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #6c757d;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.recent-order-row {
  border-bottom: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.recent-order-row:hover {
  background-color: #f9f9f9;
}

.recent-order-row td {
  border: none;
  vertical-align: middle;
  color: #495057;
}

.order-id-header {
  width: 15%;
}

.product-header {
  width: 25%;
}

.quantity-header {
  width: 20%;
}

.date-header {
  width: 25%;
}

.status-header {
  width: 15%;
}

.order-id-col {
  font-weight: 600;
  width: 15%;
}

.product-col {
  width: 25%;
}

.quantity-col {
  width: 20%;
}

.date-col {
  font-size: 0.9rem;
  color: #6c757d;
  width: 25%;
}

.status-col {
  width: 15%;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .table {
    font-size: 0.8rem;
  }

  .table thead th {
    padding: 0.5rem 0.25rem !important;
  }

  .recent-order-row td {
    padding: 0.5rem 0.25rem !important;
  }

  .order-id-header,
  .product-header,
  .quantity-header,
  .date-header,
  .status-header {
    width: auto;
  }

  .order-id-col,
  .product-col,
  .quantity-col,
  .date-col,
  .status-col {
    width: auto;
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .table {
    font-size: 0.75rem;
  }

  .table thead th {
    padding: 0.4rem 0.15rem !important;
    font-size: 0.7rem;
  }

  .recent-order-row td {
    padding: 0.4rem 0.15rem !important;
  }
}
</style>
