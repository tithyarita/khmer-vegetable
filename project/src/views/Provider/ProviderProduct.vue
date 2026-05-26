<template>
  <div class="provider-product">

    <div class="product-container">

      <!-- SIDEBAR -->
      <div class="sidebar-wrapper">
        <SideBar />
      </div>

      <!-- MAIN -->
      <div class="main-content">

        <!-- ALERT -->
        <transition name="slide-down">
          <div
            v-if="alertMessage"
            :class="[
              'alert-bar',
              isSuccess ? 'alert-success' : 'alert-error'
            ]"
          >
            <div class="alert-content">

              <div class="d-flex align-items-center gap-2">

                <i
                  :class="
                    isSuccess
                      ? 'bi bi-check-circle-fill'
                      : 'bi bi-exclamation-circle-fill'
                  "
                ></i>

                <span>{{ alertMessage }}</span>

              </div>

              <button
                class="alert-close"
                @click="clearAlert"
              >
                <i class="bi bi-x"></i>
              </button>

            </div>
          </div>
        </transition>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="loading-wrapper"
        >
          <div class="spinner-border text-success"></div>
        </div>

        <template v-else>

          <!-- HEADER -->
          <PageHeader title="All Products" />

          <!-- FILTER -->
          <div class="filter-bar">

            <div class="row g-3 align-items-center">

              <!-- SEARCH -->
              <div class="col-md-3">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Search product..."
                />
              </div>

              <!-- SORT -->
              <div class="col-md-3">
                <select
                  v-model="sortBy"
                  class="form-select"
                >
                  <option value="popular">
                    Most Popular
                  </option>

                  <option value="price-low">
                    Price Low → High
                  </option>

                  <option value="price-high">
                    Price High → Low
                  </option>

                  <option value="stock-low">
                    Low Stock
                  </option>
                </select>
              </div>

              <!-- CATEGORY -->
              <div class="col-md-3">
                <select
                  v-model="selectedCategory"
                  class="form-select"
                >
                  <option value="">
                    All Categories
                  </option>

                  <option value="vegetables">
                    Vegetables
                  </option>

                  <option value="fruits">
                    Fruits
                  </option>

                  <option value="herbs">
                    Herbs
                  </option>
                </select>
              </div>

              <!-- BUTTON -->
              <div class="col-md-3 text-end">
                <button
                  class="btn btn-success"
                  @click="openAddModal"
                >
                  <i class="bi bi-plus-circle"></i>
                  បន្ថែមផលិតផល
                </button>
              </div>

            </div>
          </div>

          <!-- TABLE -->
          <div class="table-wrapper">

            <ProductTable
              :products="paginatedProducts"
              @view="viewProduct"
              @edit="openEditModal"
              @delete="removeProduct"
            />

          </div>

          <!-- PAGINATION -->
          <div class="pagination-wrapper">

            <ul class="pagination">

              <li
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
              >
                <button
                  class="page-link"
                  @click="prevPage"
                >
                  Prev
                </button>
              </li>

              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button
                  class="page-link"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </li>

              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button
                  class="page-link"
                  @click="nextPage"
                >
                  Next
                </button>
              </li>

            </ul>

          </div>

        </template>

      </div>

    </div>

    <!-- POPUP -->
    <PopupCard
      :is-open="showModal"
      :is-edit-mode="isEditMode"
      :product="selectedProduct"
      @close="closeModal"
      @save="saveProduct"
    />

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted
} from 'vue'

import { useRouter } from 'vue-router'

import { useProductStore }
from '../../stores/productStore'

import SideBar
from '../../components/provider_com/sideBar.vue'

import PageHeader
from '../../components/provider_com/PageHeader.vue'

import ProductTable
from '../../components/provider_com/productTable.vue'

import PopupCard
from '../../components/provider_com/popupCard.vue'

const router = useRouter()

const productStore = useProductStore()

/* -------------------------------- */
/* STATE */
/* -------------------------------- */

const loading = ref(false)

const searchQuery = ref('')

const sortBy = ref('popular')

const selectedCategory = ref('')

const currentPage = ref(1)

const itemsPerPage = ref(10)

const showModal = ref(false)

const isEditMode = ref(false)

const selectedProduct = ref(null)

const alertMessage = ref('')

const isSuccess = ref(true)

/* -------------------------------- */
/* ALERT */
/* -------------------------------- */

const showAlert = (
  message,
  success = true
) => {

  alertMessage.value = message

  isSuccess.value = success

  setTimeout(() => {

    alertMessage.value = ''

  }, 3000)
}

const clearAlert = () => {

  alertMessage.value = ''
}

/* -------------------------------- */
/* FILTER PRODUCTS */
/* -------------------------------- */

const filteredProducts = computed(() => {

  let products = [
    ...productStore.products
  ]

  /* SEARCH */
  if (searchQuery.value) {

    const query =
      searchQuery.value.toLowerCase()

    products = products.filter(
      product =>
        product.name
          ?.toLowerCase()
          .includes(query)
    )
  }

  /* CATEGORY */
  if (selectedCategory.value) {

    products = products.filter(
      product =>
        product.category ===
        selectedCategory.value
    )
  }

  /* SORT */
  switch (sortBy.value) {

    case 'price-low':

      products.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      )

      break

    case 'price-high':

      products.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      )

      break

    case 'stock-low':

      products.sort(
        (a, b) =>
          Number(a.stock) -
          Number(b.stock)
      )

      break

    default:
      break
  }

  return products
})

/* -------------------------------- */
/* PAGINATION */
/* -------------------------------- */

const totalPages = computed(() => {

  return Math.max(
    1,

    Math.ceil(
      filteredProducts.value.length /
      itemsPerPage.value
    )
  )
})

const paginatedProducts = computed(() => {

  const start =
    (currentPage.value - 1) *
    itemsPerPage.value

  return filteredProducts.value.slice(
    start,
    start + itemsPerPage.value
  )
})

const goToPage = page => {

  currentPage.value = page
}

const nextPage = () => {

  if (
    currentPage.value <
    totalPages.value
  ) {

    currentPage.value++
  }
}

const prevPage = () => {

  if (currentPage.value > 1) {

    currentPage.value--
  }
}

/* RESET PAGE */
watch(
  [
    searchQuery,
    selectedCategory,
    sortBy
  ],

  () => {

    currentPage.value = 1
  }
)

/* -------------------------------- */
/* FETCH PRODUCTS */
/* -------------------------------- */

const loadProducts = async () => {

  loading.value = true

  try {

    await productStore.fetchAllProducts()

  } catch (error) {

    console.error(error)

    showAlert(
      'Failed to load products',
      false
    )

  } finally {

    loading.value = false
  }
}

onMounted(() => {

  loadProducts()
})

/* -------------------------------- */
/* MODAL */
/* -------------------------------- */

const openAddModal = () => {

  isEditMode.value = false

  selectedProduct.value = null

  showModal.value = true
}

const openEditModal = product => {

  isEditMode.value = true

  selectedProduct.value = {
    ...product
  }

  showModal.value = true
}

const closeModal = () => {

  showModal.value = false

  selectedProduct.value = null
}

/* -------------------------------- */
/* STOCK ALERT */
/* -------------------------------- */

const checkStockStatus = product => {

  if (product.stock <= 0) {

    showAlert(
      `${product.name} is OUT OF STOCK`,
      false
    )

  } else if (product.stock <= 5) {

    showAlert(
      `${product.name} stock is LOW`,
      false
    )
  }
}

/* -------------------------------- */
/* SAVE PRODUCT */
/* -------------------------------- */

const saveProduct = async productData => {

  try {

    /* CONVERT NUMBERS */
    const formattedProduct = {

      ...productData,

      price:
        Number(productData.price) || 0,

      discount:
        Number(productData.discount) || 0,

      stock:
        Number(productData.stock) || 0
    }

    console.log(
      'Formatted Product:',
      formattedProduct
    )

    /* VALIDATION */
    if (
      !formattedProduct.name ||
      formattedProduct.price <= 0
    ) {

      showAlert(
        'Please fill all required fields',
        false
      )

      return
    }

    /* UPDATE */
    if (isEditMode.value) {

      await productStore.updateProduct(
        formattedProduct.id,
        formattedProduct
      )

      showAlert(
        'Product updated successfully'
      )

    } else {

      await productStore.createProduct(
        formattedProduct
      )

      showAlert(
        'Product added successfully'
      )
    }

    /* CHECK STOCK */
    checkStockStatus(
      formattedProduct
    )

    /* RELOAD */
    await loadProducts()

    closeModal()

  } catch (error) {

    console.error(error)

    showAlert(
      error.response?.data?.message ||
      error.message ||
      'Failed to save product',
      false
    )
  }
}

/* -------------------------------- */
/* DELETE */
/* -------------------------------- */

const removeProduct = async productId => {

  const confirmed = confirm(
    'Delete this product?'
  )

  if (!confirmed) return

  try {

    await productStore.deleteProduct(
      productId
    )

    showAlert(
      'Product deleted successfully'
    )

    await loadProducts()

  } catch (error) {

    console.error(error)

    showAlert(
      'Failed to delete product',
      false
    )
  }
}

/* -------------------------------- */
/* VIEW */
/* -------------------------------- */

const viewProduct = productId => {

  router.push({

    name: 'productDetail',

    params: {
      id: productId
    }
  })
}
</script>

<style scoped>
.provider-product{
  width:100%;
  height:100vh;
  overflow:hidden;
  background:#f5f5f5;
}

.product-container{
  display:flex;
  height:100%;
}

.sidebar-wrapper{
  width:250px;
  background:white;
  border-right:1px solid #ddd;
}

.main-content{
  flex:1;
  display:flex;
  flex-direction:column;
  overflow-y:auto;
}

.filter-bar{
  padding:20px;
  background:white;
  border-bottom:1px solid #eee;
}

.table-wrapper{
  flex:1;
  overflow:auto;
}

.pagination-wrapper{
  padding:15px;
  background:white;
  display:flex;
  justify-content:center;
}

.loading-wrapper{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
}

.alert-bar{
  position:fixed;
  top:20px;
  left:50%;
  transform:translateX(-50%);
  z-index:9999;

  min-width:300px;

  padding:14px 20px;

  border-radius:10px;

  color:white;

  box-shadow:0 4px 15px rgba(0,0,0,.2);
}

.alert-success{
  background:#16a34a;
}

.alert-error{
  background:#dc2626;
}

.alert-content{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
}

.alert-close{
  border:none;
  background:none;
  color:white;
  font-size:18px;
}

.slide-down-enter-active,
.slide-down-leave-active{
  transition:.3s;
}

.slide-down-enter-from,
.slide-down-leave-to{
  opacity:0;
  transform:
    translateX(-50%)
    translateY(-20px);
}

@media(max-width:768px){

  .product-container{
    flex-direction:column;
  }

  .sidebar-wrapper{
    width:100%;
  }
}
</style>