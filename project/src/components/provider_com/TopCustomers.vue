<template>
  <div class="top-customers-section">
    <!-- Header with Title and See All Button -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <button 
          v-if="showAllMode" 
          @click="backToTopCustomers" 
          class="btn btn-sm btn-outline-secondary"
          title="Back to Top Customers"
        >
          <i class="bi bi-arrow-left"></i> Back
        </button>
        <h5 class="mb-0 fw-bold">{{ showAllMode ? 'All Customers' : 'Top Customers' }}</h5>
      </div>
      <button v-if="!showAllMode" @click="showAllCustomers" class="btn btn-link btn-sm text-decoration-none">See All</button>
    </div>

    <!-- Search and Filter -->
    <div v-if="showAllMode" class="mb-4">
      <div class="row g-3">
        <div class="col-md-6">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control" 
            placeholder="Search by name or email..."
          />
        </div>
        <div class="col-md-3">
          <select v-model="sortBy" class="form-select">
            <option value="name">Sort by Name</option>
            <option value="orders">Sort by Orders</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
        <div class="col-md-3">
          <button @click="refreshCustomers" class="btn btn-primary w-100">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Customers Table -->
    <div v-if="!isLoading && displayedCustomers.length > 0" class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr class="border-bottom">
            <th class="text-muted small fw-semibold p-3">Customer</th>
            <th class="text-muted small fw-semibold p-3">Email</th>
            <th class="text-muted small fw-semibold p-3">Total Orders</th>
            <th class="text-muted small fw-semibold p-3">Total Items</th>
            <th class="text-muted small fw-semibold p-3">Total Amount</th>
            <th class="text-muted small fw-semibold p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in displayedCustomers" :key="customer.id" class="border-bottom">
            <td class="p-3">
              <div class="d-flex align-items-center gap-2">
                <img :src="customer.avatar" :alt="customer.name" class="rounded-circle" style="width: 35px; height: 35px;">
                <span class="fw-semibold">{{ customer.name }}</span>
              </div>
            </td>
            <td class="p-3 text-muted small">{{ customer.email }}</td>
            <td class="p-3">
              <span class="badge bg-light text-dark">{{ customer.totalOrders }}</span>
            </td>
            <td class="p-3">{{ customer.totalItems }}</td>
            <td class="p-3">
              <span class="fw-semibold text-success">${{ customer.totalAmount.toFixed(2) }}</span>
            </td>
            <td class="p-3">
              <button 
                @click="viewCustomerDetails(customer)" 
                class="btn btn-sm btn-view-orders"
              >
                {{ showAllMode ? 'View Details' : 'View Orders' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && displayedCustomers.length === 0" class="alert alert-info">
      No customers found.
    </div>

    <!-- Customer Details Modal -->
    <div 
      v-if="showModal" 
      class="modal fade show" 
      :style="{ display: 'block' }" 
      tabindex="-1" 
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <!-- Modal Header -->
          <div class="modal-header bg-gradient border-0 py-4">
            <div>
              <h5 class="modal-title fw-bold mb-0">{{ selectedCustomer?.name }}</h5>
              <p class="text-muted small mb-0">{{ selectedCustomer?.email }}</p>
            </div>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModal"
            ></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4">
            <!-- Customer Summary -->
            <div class="row mb-4">
              <div class="col-md-4 text-center">
                <div class="summary-item">
                  <p class="text-muted mb-2 small">Total Orders</p>
                  <p class="display-6 fw-bold text-success mb-0">{{ selectedCustomer?.totalOrders }}</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="summary-item">
                  <p class="text-muted mb-2 small">Total Items</p>
                  <p class="display-6 fw-bold text-info mb-0">{{ selectedCustomer?.totalItems }}</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="summary-item">
                  <p class="text-muted mb-2 small">Total Spent</p>
                  <p class="display-6 fw-bold text-primary mb-0">${{ selectedCustomer?.totalAmount.toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <hr class="my-4">

            <!-- Purchase History -->
            <h6 class="fw-bold mb-3">Purchase History</h6>
            <div class="orders-list">
              <div 
                v-for="order in selectedCustomer?.orders" 
                :key="order.id" 
                class="order-item mb-3 p-3 border rounded"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p class="mb-1 fw-semibold">Order ID: {{ order.id }}</p>
                    <p class="mb-0 text-muted small">{{ formatDate(order.date) }}</p>
                  </div>
                  <span class="badge" :class="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
                <div class="order-products mb-2">
                  <div v-for="product in order.products" :key="product.id" class="d-flex justify-content-between align-items-center py-1 border-bottom small">
                    <div class="product-info-row">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="text-muted ms-2">x{{ product.quantity }}</span>
                    </div>
                    <span class="fw-semibold">${{ product.price.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2">
                  <span class="text-muted small">Order Total:</span>
                  <span class="fw-bold text-success">${{ order.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer bg-light border-top py-3">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeModal"
            >
              Close
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
            >
              Export Customer CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  customers: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: null
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  showSort: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const showModal = ref(false)
const selectedCustomer = ref(null)
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref('name')
const showAllMode = ref(false) // Toggle between top customers and all customers view

// Mock data for demonstration
const mockCustomersData = [
  {
    id: 1,
    name: 'Jessica Kalove',
    email: 'jessikalove@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    totalOrders: 35,
    totalItems: 244.5,
    totalAmount: 1589.80,
    joinedDate: '2024-01-15',
    orders: [
      {
        id: 'U7yp84HiDi5e7i3kw339',
        date: '2024-01-23T10:30:00',
        status: 'Completed',
        products: [
          { id: 1, name: 'Korko', quantity: 1, price: 59.89 },
          { id: 2, name: 'Chicken Dumpling', quantity: 2, price: 18.20 }
        ],
        total: 96.29
      },
      {
        id: 'EVuYcdQKup7LZYDtBG5U',
        date: '2024-01-23T09:15:00',
        status: 'Completed',
        products: [
          { id: 3, name: 'Pork', quantity: 2, price: 11.36 },
          { id: 4, name: 'Fresh Vegetables Mix', quantity: 1, price: 8.75 }
        ],
        total: 31.47
      }
    ]
  },
  {
    id: 2,
    name: 'Nethi Pyarita',
    email: 'nethi@pyarita.gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    totalOrders: 1,
    totalItems: 4,
    totalAmount: 521.81,
    joinedDate: '2024-01-10',
    orders: [
      {
        id: 'PK92Lm4nO6p3q8r5s2t7',
        date: '2024-01-21T14:20:00',
        status: 'Completed',
        products: [
          { id: 7, name: 'Organic Cabbage', quantity: 4, price: 130.45 }
        ],
        total: 521.81
      }
    ]
  },
  {
    id: 3,
    name: 'Daali',
    email: 'daali@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    totalOrders: 27,
    totalItems: 30.5,
    totalAmount: 2239.98,
    joinedDate: '2024-01-08',
    orders: [
      {
        id: 'Z8x9c7v6b5m4n3o2p1l0',
        date: '2024-01-20T11:45:00',
        status: 'Completed',
        products: [
          { id: 8, name: 'Mixed Vegetables Bundle', quantity: 10, price: 85.00 }
        ],
        total: 850.00
      },
      {
        id: 'A1b2c3d4e5f6g7h8i9j0',
        date: '2024-01-19T16:30:00',
        status: 'In Progress',
        products: [
          { id: 9, name: 'Fresh Greens', quantity: 5, price: 45.50 }
        ],
        total: 227.50
      }
    ]
  },
  {
    id: 4,
    name: 'Admin Project',
    email: 'adminproject@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
    totalOrders: 96,
    totalItems: 228.5,
    totalAmount: 1286.83,
    joinedDate: '2024-01-05',
    orders: [
      {
        id: 'M5n6o7p8q9r0s1t2u3v4',
        date: '2024-01-18T13:00:00',
        status: 'Completed',
        products: [
          { id: 10, name: 'Premium Vegetables Set', quantity: 15, price: 64.00 }
        ],
        total: 960.00
      }
    ]
  },
  {
    id: 5,
    name: 'Pinpin',
    email: 'pinpin@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    totalOrders: 2,
    totalItems: 4,
    totalAmount: 531.49,
    joinedDate: '2024-01-12',
    orders: [
      {
        id: 'W9x8y7z6a5b4c3d2e1f0',
        date: '2024-01-17T10:10:00',
        status: 'Completed',
        products: [
          { id: 11, name: 'Specialty Vegetables', quantity: 4, price: 132.87 }
        ],
        total: 531.49
      }
    ]
  }
]

const topCustomers = ref([])

// Show only top N customers based on limit prop (null = show all)
const displayedCustomers = computed(() => {
  let filtered = props.customers.length > 0 ? props.customers : topCustomers.value

  // Search filter
  if ((props.showSearch || showAllMode.value) && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.email.toLowerCase().includes(query)
    )
  }

  // Sort
  if (props.showSort || showAllMode.value) {
    filtered = [...filtered].sort((a, b) => {
      switch(sortBy.value) {
        case 'orders':
          return b.totalOrders - a.totalOrders
        case 'amount':
          return b.totalAmount - a.totalAmount
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }

  // Apply limit only when NOT in "See All" mode
  if (!showAllMode.value && props.limit) {
    return filtered.slice(0, props.limit)
  }
  return filtered
})

onMounted(() => {
  if (props.customers.length === 0) {
    fetchTopCustomers()
  }
})

const fetchTopCustomers = async () => {
  isLoading.value = true
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/provider/customers/top')
    if (!response.ok) throw new Error('Failed to fetch customers')
    const data = await response.json()
    topCustomers.value = data
  } catch (err) {
    console.warn('API not available, loading mock data:', err.message)
    // Use mock data as fallback (no error shown to user)
    topCustomers.value = mockCustomersData
  } finally {
    isLoading.value = false
  }
}

const viewCustomerDetails = (customer) => {
  selectedCustomer.value = customer
  showModal.value = true
}

const viewCustomerOrders = (customer) => {
  selectedCustomer.value = customer
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCustomer.value = null
}

const showAllCustomers = () => {
  showAllMode.value = true
}

const backToTopCustomers = () => {
  showAllMode.value = false
  searchQuery.value = ''
}

const refreshCustomers = () => {
  if (props.customers.length === 0) {
    fetchTopCustomers()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'Completed':
      return 'bg-success'
    case 'In Progress':
      return 'bg-warning'
    case 'Cancelled':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}
</script>

<style scoped>
.top-customers-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

h5 {
  font-weight: 600;
  color: #212529;
  font-size: 1.1rem;
}

.btn-link {
  color: #0d6efd;
  font-weight: 500;
  font-size: 0.9rem;
}

.btn-link:hover {
  color: #0b5ed7;
}

.table {
  font-size: 0.95rem;
}

.table thead th {
  background-color: #f8f9fa;
  font-size: 0.85rem;
  padding: 1rem;
  border: none;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody td {
  vertical-align: middle;
  padding: 1rem;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  flex-shrink: 0;
}

.customer-avatar img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.customer-details p {
  font-size: 0.9rem;
}

.btn-view-orders {
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-view-orders:hover {
  background-color: #0b5ed7;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.25);
}

.badge {
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  font-weight: 500;
}

/* Modal Styles */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}

.modal-header .modal-title {
  color: white;
}

.modal-header .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.modal-body {
  background-color: #f8f9fa;
}

.summary-item {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 0.5rem;
}

.summary-item p:first-child {
  font-weight: 500;
}

.orders-list {
  max-height: 400px;
  overflow-y: auto;
}

.order-item {
  background: white;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.order-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-products {
  margin-bottom: 0.5rem;
}

.product-info-row {
  display: flex;
  align-items: center;
}

.product-name {
  font-weight: 500;
  color: #212529;
}

.modal-footer {
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn-primary {
  background-color: #2e7d32;
  border-color: #2e7d32;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #1e5a24;
  border-color: #1e5a24;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

/* Responsive */
@media (max-width: 768px) {
  .top-customers-section {
    padding: 1rem;
  }

  .table {
    font-size: 0.85rem;
  }

  .customer-details p {
    font-size: 0.8rem;
  }

  .btn-view-orders {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }

  .modal-dialog-lg {
    margin: 1rem;
  }

  .summary-item {
    padding: 1rem;
  }

  .display-6 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 480px) {
  .customer-info {
    gap: 0.5rem;
  }

  .customer-avatar img {
    width: 35px;
    height: 35px;
  }

  .table thead {
    display: none;
  }

  .table tbody tr {
    display: block;
    border-bottom: 2px solid #e9ecef;
    margin-bottom: 1rem;
    padding: 0.5rem;
  }

  .table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border: none;
  }

  .table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6c757d;
  }
}
</style>
