import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)

  // Initialize user from localStorage
  const initializeUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && storedUser !== 'null') {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        console.error('Error parsing user data:', e)
        return null
      }
    }
    return null
  }

  const user = ref(initializeUser())
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  const login = (authToken, userData) => {
    token.value = authToken
    user.value = userData

    // Store in localStorage
    if (authToken && userData) {
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    token.value = null
    user.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    // State
    token,
    user,
    isAuthenticated,

    // Actions
    login,
    logout,
    updateUser
  }
})
