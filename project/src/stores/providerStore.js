import { defineStore } from 'pinia'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function fullUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return BASE + path
}

export const useProviderStore = defineStore('provider', {
  state: () => ({
    provider: {},
    feedbacks: [], // 1. Added state to hold the customer reviews array
  }),

  actions: {
    // ========================================
    // LOAD PROVIDER PROFILE & REVIEWS
    // ========================================
    async loadProvider(userId) {
      // Fetch the provider profile details
      const res = await axios.get(`${BASE}/providers/${userId}`)
      const d   = res.data

      this.provider = {
        ...d,
        avatar:     fullUrl(d.avatar),
        farm_image: fullUrl(d.farm_image),
        banks: (d.banks || []).map(b => ({
          ...b,
          qr: fullUrl(b.qr),
        })),
      }

      // 2. Automatically load feedbacks right after profile loads successfully
      await this.loadFeedbacks(userId)
    },

    // ========================================
    // LOAD CUSTOMER FEEDBACKS
    // ========================================
    async loadFeedbacks(providerId) {
      try {
        const res = await axios.get(`${BASE}/providers/${providerId}/feedbacks`)
        // Save the reviews array directly to the state
        this.feedbacks = res.data
      } catch (err) {
        console.error("Failed to load customer feedbacks:", err)
        this.feedbacks = [] // Fallback to empty list on failure
      }
    },

    getProviderId() {
      return this.provider.user_id || this.provider.id || this.provider.user?.id || null
    },

    // ========================================
    // UPDATE PROVIDER
    // ========================================
    async updateProvider(data) {
      const providerId = this.getProviderId()
      if (!providerId) {
        throw new Error('Provider ID is required to update provider data.')
      }

      const token = localStorage.getItem('token')
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : undefined

      const res = await axios.put(
        `${BASE}/providers/${providerId}`,
        data,
        { headers },
      )
      const d = res.data

      this.provider = {
        ...d,
        avatar:     fullUrl(d.avatar),
        farm_image: fullUrl(d.farm_image),
        banks: (d.banks || []).map(b => ({
          ...b,
          qr: fullUrl(b.qr),
        })),
      }
    },
  },
})