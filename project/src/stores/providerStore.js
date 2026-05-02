import { defineStore } from 'pinia'

const STORAGE_KEY = "khmer_provider"

export const useProviderStore = defineStore('provider', {
  state: () => ({
    provider: {
      name: "",
      farm: "",
      location: "",
      story: "",
      id: "",
      joined: "",
      idNumber: "",
      banks: [],
      // Added fields for persistence
      avatar: null, 
      farmImage: null 
    }
  }),

  actions: {
    loadProvider() {
      const stored = localStorage.getItem(STORAGE_KEY)

      if (stored) {
        this.provider = JSON.parse(stored)
      } else {
        // Set default initial data
        this.provider = {
          name: "Sok Min",
          farm: "Ta Min Farm",
          location: "Phnom Penh",
          story: "TA MIN Farms began as a three-acre project dedicated to heirloom vegetable varieties.",
          id: "#V-10293",
          joined: "Oct 12, 2023",
          idNumber: "1578234899",
          banks: [
            { name: "ABA Bank", account: "001 234 567", qr: "" },
            { name: "ACLEDA", account: "987 654 321", qr: "" }
          ],
          avatar: null,
          farmImage: null
        }
        this.saveProvider()
      }
    },

    saveProvider() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.provider))
    },

    // New helper to handle image updates specifically
    updateImage(key, base64Data) {
      this.provider[key] = base64Data
      this.saveProvider()
    },

    updateProfile(newData) {
      this.provider = { ...this.provider, ...newData }
      this.saveProvider()
    }
  }
})