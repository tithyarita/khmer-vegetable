import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Broccoli from '../assets/images/broccoli.png'
import Corn from '../assets/images/corn.png'
import Tomato from '../assets/images/Tomato3.png'

export const useOrderTrackerStore = defineStore('orderTracker', () => {
  // ================= STATE =================
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Sample order data (replace with API call)
  const mockOrders = {
    'EG-92841': {
      id: 'EG-92841',
      status: 'in-delivery',
      arrivalTime: 'Today, 5:00 PM',
      steps: [
        { label: 'Order Placed', time: '9:45 AM', state: 'done', icon: 'check' },
        { label: 'On the Way', time: 'Live tracking', state: 'active', icon: 'truck' },
        { label: 'Delivered', time: 'Pending', state: 'pending', icon: 'gift' },
      ],
      details: [
        { label: 'Assigned Courier', value: 'Vannak S.', sub: '<span style="color:#e9a830">★</span> 4.9 (2,400+ deliveries)', icon: 'user' },
        { label: 'Package Size', value: '2 Eco-Friendly Boxes', sub: 'Chilled packaging included', icon: 'box' },
      ],
      items: [
        { name: 'Organic Curly Kale', weight: '250g', tag: 'Farm Direct', price: 3.50, image: Broccoli },
        { name: 'Heirloom Carrots', weight: '500g', tag: 'Mixed Colors', price: 4.20, image: Corn },
        { name: 'Baby Bok Choy', weight: '300g', tag: 'Local Growth', price: 2.80, image: Broccoli },
      ],
      deliveryFee: 1.50,
      farmCoords: [11.4700, 104.8800],
      destCoords: [11.5564, 104.9282],
      riderName: 'Vannak S.',
      riderEmoji: '🛵',
    },
    'EG-81722': {
      id: 'EG-81722',
      status: 'delivered',
      arrivalTime: 'Oct 19, 2024, 3:45 PM',
      steps: [
        { label: 'Order Placed', time: '9:00 AM', state: 'done', icon: 'check' },
        { label: 'On the Way', time: '2:30 PM', state: 'done', icon: 'truck' },
        { label: 'Delivered', time: '3:45 PM', state: 'done', icon: 'gift' },
      ],
      details: [
        { label: 'Assigned Courier', value: 'Thea M.', sub: '<span style="color:#e9a830">★</span> 5.0 (1,200+ deliveries)', icon: 'user' },
        { label: 'Package Size', value: '3 Eco-Friendly Boxes', sub: 'Express delivery', icon: 'box' },
      ],
      items: [
        { name: 'Weekly Harvest Box', weight: '5kg', tag: 'Mixed Veggies', price: 24.00, image: Broccoli },
        { name: 'Artisan Sourdough', weight: '500g', tag: 'Local Bakery', price: 6.50, image: Tomato },
      ],
      deliveryFee: 2.00,
      farmCoords: [11.5100, 104.8600],
      destCoords: [11.5700, 104.9400],
      riderName: 'Thea M.',
      riderEmoji: '🛵',
    },
  }

  // ================= COMPUTED =================
  const subtotal = computed(() => {
    if (!currentOrder.value) return 0
    return currentOrder.value.items.reduce((sum, item) => sum + item.price, 0)
  })

  const total = computed(() => {
    if (!currentOrder.value) return 0
    return subtotal.value + currentOrder.value.deliveryFee
  })

  // ================= ACTIONS =================
  const fetchOrder = async (orderId) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // In real app, replace with actual API call
      if (mockOrders[orderId]) {
        currentOrder.value = mockOrders[orderId]
      } else {
        error.value = 'Order not found'
        currentOrder.value = null
      }
    } catch (err) {
      error.value = err.message
      currentOrder.value = null
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = (newStatus) => {
    if (currentOrder.value) {
      currentOrder.value.status = newStatus
    }
  }

  return {
    currentOrder,
    loading,
    error,
    subtotal,
    total,
    fetchOrder,
    updateOrderStatus,
  }
})
