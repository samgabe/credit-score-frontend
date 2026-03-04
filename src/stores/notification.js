import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const current = ref(null)
  const timeout = ref(null)

  const show = (type, title, message = '', duration = 5000) => {
    // Clear existing notification
    if (timeout.value) {
      clearTimeout(timeout.value)
    }

    current.value = { type, title, message }

    // Auto-hide after duration
    if (duration > 0) {
      timeout.value = setTimeout(() => {
        clear()
      }, duration)
    }
  }

  const success = (title, message) => show('success', title, message)
  const error = (title, message) => show('error', title, message)
  const warning = (title, message) => show('warning', title, message)
  const info = (title, message) => show('info', title, message)

  const clear = () => {
    current.value = null
    if (timeout.value) {
      clearTimeout(timeout.value)
      timeout.value = null
    }
  }

  return {
    current,
    show,
    success,
    error,
    warning,
    info,
    clear
  }
})
