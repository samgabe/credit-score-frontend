<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Credit Subject Detail</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">View and manage credit subject information</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>

    <div v-else-if="creditSubject" class="space-y-6">
      <!-- Subject Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <p class="text-gray-900 dark:text-gray-100">{{ creditSubject.full_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p class="text-gray-900 dark:text-gray-100">{{ creditSubject.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">National ID</label>
            <p class="text-gray-900 dark:text-gray-100">{{ creditSubject.national_id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <p class="text-gray-900 dark:text-gray-100">{{ creditSubject.phone_number }}</p>
          </div>
        </div>
      </div>

      <!-- Credit Scores -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Credit Scores</h2>
          <button
            @click="calculateCreditScore"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Calculator class="w-4 h-4 mr-2" />
            Calculate Score
          </button>
        </div>
        
        <div v-if="creditScores.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No credit scores available. Click "Calculate Score" to generate one.
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="score in creditScores"
            :key="score.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ score.score }}</span>
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getScoreCategoryClass(score.category)"
                  >
                    {{ score.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Calculated on {{ new Date(score.calculated_at).toLocaleDateString() }}
                </p>
              </div>
            </div>
            
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Repayment:</span>
                <span class="ml-2 font-medium">{{ score.factors.repayment_factor?.toFixed(1) || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">M-Pesa:</span>
                <span class="ml-2 font-medium">{{ score.factors.mpesa_factor?.toFixed(1) || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Consistency:</span>
                <span class="ml-2 font-medium">{{ score.factors.consistency_factor?.toFixed(1) || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Fines:</span>
                <span class="ml-2 font-medium">{{ score.factors.fine_factor?.toFixed(1) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-400">Credit subject not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Calculator } from 'lucide-vue-next'
import api from '@/utils/api'

const route = useRoute()
const loading = ref(false)
const creditSubject = ref(null)
const creditScores = ref([])

const getScoreCategoryClass = (category) => {
  const classes = {
    'Excellent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Poor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const fetchCreditSubject = async () => {
  loading.value = true
  try {
    const response = await api.get(`/credit-subjects/${route.params.id}`)
    creditSubject.value = response.data
  } catch (error) {
    console.error('Error fetching credit subject:', error)
  } finally {
    loading.value = false
  }
}

const fetchCreditScores = async () => {
  try {
    const response = await api.get(`/credit-subjects/${route.params.id}/scores`)
    creditScores.value = response.data
  } catch (error) {
    console.error('Error fetching credit scores:', error)
  }
}

const calculateCreditScore = async () => {
  try {
    await api.post(`/credit-subjects/${route.params.id}/calculate-score`)
    await fetchCreditScores()
  } catch (error) {
    console.error('Error calculating credit score:', error)
  }
}

onMounted(() => {
  fetchCreditSubject()
  fetchCreditScores()
})
</script>
