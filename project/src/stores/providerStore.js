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
    loading: false,
  }),

  actions: {
    async loadProvider(userId) {
      this.loading = true
      try {
        const res = await axios.get(`${BASE}/providers/${userId}`)
        const d = res.data

        this.provider = {
          ...d,
          avatar: fullUrl(d.avatar),
          farm_image: fullUrl(d.farm_image),
          banks: (d.banks || []).map(b => ({
            ...b,
            qr: fullUrl(b.qr),
          })),
        }
      } finally {
        this.loading = false
      }
    },

    getProviderId() {
      return this.provider.user_id || this.provider.id || this.provider.user?.id || null
    },

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
        avatar: fullUrl(d.avatar),
        farm_image: fullUrl(d.farm_image),
        banks: (d.banks || []).map(b => ({
          ...b,
          qr: fullUrl(b.qr),
        })),
      }
    },
  },
})
