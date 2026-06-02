import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', () => {
  const savedLocations = ref(
    JSON.parse(localStorage.getItem('savedLocations') || '[]')
  )

  const activeLocation = ref(
    JSON.parse(localStorage.getItem('activeLocation') || 'null')
  )

  function saveLocations() {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
  }

  function saveActiveLocation() {
    localStorage.setItem('activeLocation', JSON.stringify(activeLocation.value))
  }

  function addLocation(loc) {
    const exists = savedLocations.value.some(l => l.name === loc.name && l.address === loc.address)
    if (!exists) {
      savedLocations.value.push({ ...loc, id: Date.now() })
      saveLocations()
    }
  }

  function removeLocation(id) {
    savedLocations.value = savedLocations.value.filter(l => l.id !== id)
    saveLocations()
  }

  function setActiveLocation(loc) {
    activeLocation.value = loc
    saveActiveLocation()
  }

  return { savedLocations, activeLocation, addLocation, removeLocation, setActiveLocation }
})
