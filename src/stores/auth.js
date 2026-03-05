import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { getRolePermissions } from '@/utils/permissions'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref(null)

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
  const userRole = computed(() => user.value?.role)
  const userPermissions = computed(() => {
    if (!user.value?.role) return []
    return getRolePermissions(user.value.role)
  })

  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post('/system-auth/login', credentials)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      // Store in localStorage
      if (access_token && userData) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      token.value = null
      user.value = null
      error.value = null

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Remove authorization header
      delete api.defaults.headers.common['Authorization']

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const getCurrentUser = async () => {
    try {
      if (!token.value) return null

      isLoading.value = true

      const response = await api.get('/system-auth/me')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))

      return response.data
    } catch (err) {
      // Token might be invalid, clear it
      await logout()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setAuth = (authData) => {
    token.value = authData.token
    user.value = authData.user

    if (authData.token) {
      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify(authData.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

      // Try to get current user if we don't have user data
      if (!user.value) {
        getCurrentUser().catch(() => {
          // If getting current user fails, clear auth
          clearAuth()
        })
      }
    }
  }

  return {
    // State
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    userPermissions,

    // Actions
    login,
    logout,
    updateUser,
    getCurrentUser,
    setAuth,
    clearAuth,
    initializeAuth
  }
})
