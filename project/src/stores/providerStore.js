import { defineStore } from 'pinia'
import axios from 'axios'

const BASE = 'http://localhost:3000'

function fullUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return BASE + path
}

export const useProviderStore = defineStore('provider', {
  state: () => ({
    provider: {},
  }),

  actions: {
    async loadProvider(userId) {
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
    },

    async updateProvider(data) {
      const res = await axios.put(
        `${BASE}/providers/${this.provider.user_id}`,
        data
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