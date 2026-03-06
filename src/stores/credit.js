import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useCreditStore = defineStore('credit', () => {
  const users = ref([])  // System users (for admin functionality)
  const clients = ref([])  // Credit subjects (for scoring) - renamed to "clients"
  const currentUser = ref(null)
  const creditScores = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/users')
      const usersData = response.data

      // Fetch credit scores for each user
      const usersWithScores = await Promise.all(
        usersData.map(async (user) => {
          try {
            const scoreResponse = await api.get(`/users/${user.id}/credit-score`)
            return {
              ...user,
              creditScore: scoreResponse.data
            }
          } catch (scoreError) {
            // User doesn't have a credit score yet
            return {
              ...user,
              creditScore: null
            }
          }
        })
      )

      users.value = usersWithScores
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  const fetchClients = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/credit-subjects')
      const subjectsData = response.data

      // Fetch credit scores for each client
      const clientsWithScores = await Promise.all(
        subjectsData.map(async (subject) => {
          try {
            const scoreResponse = await api.get(`/credit-subjects/${subject.id}/credit-score`)
            return {
              ...subject,
              creditScore: scoreResponse.data
            }
          } catch (scoreError) {
            // Client doesn't have a credit score yet
            return {
              ...subject,
              creditScore: null
            }
          }
        })
      )

      clients.value = clientsWithScores
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch clients'
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/users/${id}`)
      currentUser.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateCreditScore = async (userId) => {
    loading.value = true
    error.value = null
    try {
      console.log('Calculating credit score for userId:', userId, 'Type:', typeof userId)

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId)
        throw new Error(`Invalid UUID format: ${userId}`)
      }

      const response = await api.post(`/users/${userId}/credit-score`)
      console.log('Credit score response:', response.data)
      return response.data
    } catch (err) {
      console.error('Credit score calculation error:', err)
      error.value = err.response?.data?.message || 'Failed to calculate credit score'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCreditScore = async (userId) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/users/${userId}/credit-score`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to get credit score'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCreditScoreHistory = async (userId, startDate, endDate) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      const response = await api.get(`/users/${userId}/credit-score/history?${params}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to get credit score history'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAnalytics = async (period = '30d') => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/analytics?period=${period}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch analytics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getScoreDistribution = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/score-distribution')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch score distribution'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTopPerformers = async (limit = 5) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/analytics/top-performers?limit=${limit}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch top performers'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRecentActivity = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/recent-activity')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recent activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getScoreTrends = async (period = '30d') => {
    console.log('getScoreTrends called with period:', period)
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/analytics/score-trends?period=${period}`)
      console.log('getScoreTrends response:', response.data)
      return response.data
    } catch (err) {
      console.error('getScoreTrends error:', err)
      error.value = err.response?.data?.message || 'Failed to fetch score trends'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserActivity = async (userId) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/users/${userId}/activity`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    clients,
    currentUser,
    creditScores,
    loading,
    error,
    fetchUsers,
    fetchClients,
    fetchUser,
    calculateCreditScore,
    getCreditScore,
    getCreditScoreHistory,
    getAnalytics,
    getScoreDistribution,
    getTopPerformers,
    getRecentActivity,
    getScoreTrends,
    getUserActivity
  }
})
