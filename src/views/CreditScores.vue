<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Credit Scores</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">View and manage credit scores for all subjects</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by subject name or email..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          v-model="categoryFilter"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>
    </div>

    <!-- Credit Scores Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Subject
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Score
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Calculated
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
            <tr v-else-if="filteredScores.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No credit scores found
              </td>
            </tr>
            <tr v-for="score in filteredScores" :key="score.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ score.credit_subject?.full_name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ score.credit_subject?.email }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {{ score.score }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getScoreCategoryClass(score.category)"
                >
                  {{ score.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(score.calculated_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/credit-subjects/${score.user_id}`"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-900"
                  >
                    <Eye class="w-4 h-4" />
                  </router-link>
                  <button
                    @click="viewScoreDetails(score)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900"
                  >
                    <BarChart3 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Score Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Score Details</h2>
        <div v-if="selectedScore" class="space-y-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ selectedScore.score }}</div>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getScoreCategoryClass(selectedScore.category)"
            >
              {{ selectedScore.category }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Repayment Factor:</span>
              <span class="font-medium">{{ selectedScore.repayment_factor.toFixed(1) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">M-Pesa Factor:</span>
              <span class="font-medium">{{ selectedScore.mpesa_factor.toFixed(1) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Consistency Factor:</span>
              <span class="font-medium">{{ selectedScore.consistency_factor.toFixed(1) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Fine Factor:</span>
              <span class="font-medium">{{ selectedScore.fine_factor.toFixed(1) }}</span>
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Calculated on {{ new Date(selectedScore.calculated_at).toLocaleString() }}
            </div>
          </div>
        </div>
        
        <button
          @click="showDetailsModal = false"
          class="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Eye, BarChart3 } from 'lucide-vue-next'
import api from '@/utils/api'

const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const creditScores = ref([])
const showDetailsModal = ref(false)
const selectedScore = ref(null)

const filteredScores = computed(() => {
  let filtered = creditScores.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(score => 
      score.credit_subject?.full_name?.toLowerCase().includes(query) ||
      score.credit_subject?.email?.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(score => score.category === categoryFilter.value)
  }

  return filtered
})

const getScoreCategoryClass = (category) => {
  const classes = {
    'Excellent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Poor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const fetchCreditScores = async () => {
  loading.value = true
  try {
    const response = await api.get('/credit-scores')
    creditScores.value = response.data
  } catch (error) {
    console.error('Error fetching credit scores:', error)
  } finally {
    loading.value = false
  }
}

const viewScoreDetails = (score) => {
  selectedScore.value = score
  showDetailsModal.value = true
}

onMounted(() => {
  fetchCreditScores()
})
</script>
