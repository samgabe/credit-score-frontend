<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
      <button
        @click="$router.go(-1)"
        class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Credit Score Analysis</h1>
      <p class="text-gray-600" v-if="user">For {{ user.fullname }}</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loading-spinner w-12 h-12"></div>
    </div>

    <!-- Calculate Score Mode -->
    <div v-else-if="isCalculateMode" class="space-y-8">
      <div class="glass-effect rounded-xl p-8 animate-slide-up">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Calculate Credit Score</h2>
        <p class="text-gray-600 mb-6">Select a user to calculate their credit score</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select 
              v-model="selectedUserId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a user...</option>
              <option 
                v-for="user in availableUsers" 
                :key="user.id" 
                :value="user.id"
              >
                {{ user.fullname }} (ID: {{ user.national_id }})
              </option>
            </select>
          </div>
          
          <button
            @click="calculateNewScore"
            class="btn-primary w-full"
            :disabled="!selectedUserId || loading"
          >
            <Calculator class="w-4 h-4 mr-2" />
            Calculate Credit Score
          </button>
        </div>
      </div>
    </div>

    <!-- View Score Mode -->
    <div v-else-if="!isCalculateMode && creditScore" class="space-y-8">
      <!-- Score Display -->
      <div class="glass-effect rounded-xl p-8 animate-slide-up">
        <div class="text-center">
          <div class="relative inline-block">
            <div
              class="w-48 h-48 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl"
              :class="scoreInfo.gradient"
            >
              {{ creditScore.score }}
            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span
                class="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
                :class="scoreInfo.gradient"
              >
                {{ scoreInfo.category }}
              </span>
            </div>
          </div>
          <p class="mt-6 text-gray-600">Calculated on {{ formatDateTime(creditScore.calculated_at) }}</p>
        </div>
      </div>

      <!-- Score Factors -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 100ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Score Factors</h2>
          <div class="space-y-4">
            <div
              v-for="factor in scoreFactors"
              :key="factor.name"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ factor.name }}</span>
                <span class="text-sm font-bold text-gray-900">{{ factor.value }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="factor.color"
                  :style="{ width: `${factor.percentage}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500">{{ factor.description }}</p>
            </div>
          </div>
        </div>

        <!-- Score Tips -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 200ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Improvement Tips</h2>
          <div class="space-y-4">
            <div
              v-for="tip in scoreTips"
              :key="tip.title"
              class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
            >
              <Lightbulb class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-blue-900">{{ tip.title }}</p>
                <p class="text-xs text-blue-700 mt-1">{{ tip.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score History Chart -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 300ms">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Score History</h2>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshHistory"
              class="btn-secondary"
              :disabled="historyLoading"
            >
              <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': historyLoading }" />
              Refresh
            </button>
          </div>
        </div>

        <div v-if="scoreHistory.length > 0" class="h-80">
          <Line
            :data="chartData"
            :options="chartOptions"
            class="w-full h-full"
          />
        </div>

        <div v-else class="text-center py-12">
          <TrendingUp class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No History Available</h3>
          <p class="text-gray-500">Credit score history will appear here once available</p>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 400ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Detailed Breakdown</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="detail in scoreDetails"
            :key="detail.label"
            class="text-center p-4 bg-gray-50 rounded-lg"
          >
            <div
              class="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
              :class="detail.iconBg"
            >
              <component :is="detail.icon" class="w-6 h-6" :class="detail.iconColor" />
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ detail.value }}</p>
            <p class="text-sm text-gray-600">{{ detail.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Score State -->
    <div v-else-if="!loading" class="text-center py-12">
      <Calculator class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No Credit Score Available</h3>
      <p class="text-gray-600 mb-6">Calculate a credit score for this user to get started</p>
      <button
        @click="calculateNewScore"
        class="btn-primary"
        :disabled="loading"
      >
        <Calculator class="w-4 h-4 mr-2" />
        Calculate Credit Score
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useNotificationStore } from '@/stores/notification'
import { getScoreCategory, formatDateTime } from '@/utils/helpers'
import {
  ArrowLeft,
  TrendingUp,
  RefreshCw,
  Calculator,
  Lightbulb,
  CreditCard,
  Calendar,
  TrendingDown,
  DollarSign
} from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const route = useRoute()
const router = useRouter()
const creditStore = useCreditStore()
const notificationStore = useNotificationStore()

// Check if we're in calculate mode or viewing a specific user's score
const isCalculateMode = computed(() => route.name === 'CalculateCreditScore')
const userId = computed(() => isCalculateMode.value ? null : route.params.id)
const user = ref(null)
const creditScore = ref(null)
const scoreHistory = ref([])
const historyLoading = ref(false)
const selectedUserId = ref('')
const availableUsers = ref([])

const loading = computed(() => creditStore.loading)

const scoreInfo = computed(() => {
  if (!creditScore.value) return null
  return getScoreCategory(creditScore.value.score)
})

const scoreFactors = computed(() => {
  if (!creditScore.value) return []
  
  const factors = [
    {
      name: 'Repayment History',
      value: creditScore.value.repayment_factor,
      percentage: (creditScore.value.repayment_factor / 100) * 100,
      color: 'bg-emerald-500',
      description: 'Based on on-time payments and repayment consistency'
    },
    {
      name: 'M-Pesa Activity',
      value: creditScore.value.mpesa_factor,
      percentage: (creditScore.value.mpesa_factor / 100) * 100,
      color: 'bg-blue-500',
      description: 'Based on transaction volume and frequency'
    },
    {
      name: 'Payment Consistency',
      value: creditScore.value.consistency_factor,
      percentage: (creditScore.value.consistency_factor / 100) * 100,
      color: 'bg-purple-500',
      description: 'Based on regular payment patterns'
    },
    {
      name: 'Fine History',
      value: creditScore.value.fine_factor,
      percentage: (creditScore.value.fine_factor / 100) * 100,
      color: 'bg-orange-500',
      description: 'Based on unpaid fines and penalties'
    }
  ]
  
  return factors.sort((a, b) => b.value - a.value)
})

const scoreTips = computed(() => {
  const tips = []
  
  if (creditScore.value?.repayment_factor < 80) {
    tips.push({
      title: 'Improve Payment Timeliness',
      description: 'Focus on making all payments on time to boost your repayment score'
    })
  }
  
  if (creditScore.value?.mpesa_factor < 70) {
    tips.push({
      title: 'Increase Transaction Activity',
      description: 'Regular M-Pesa usage can positively impact your credit score'
    })
  }
  
  if (creditScore.value?.fine_factor < 60) {
    tips.push({
      title: 'Clear Outstanding Fines',
      description: 'Pay off any unpaid fines to improve your overall score'
    })
  }
  
  if (tips.length === 0) {
    tips.push({
      title: 'Maintain Good Habits',
      description: 'Continue your current financial practices to maintain your excellent score'
    })
  }
  
  return tips
})

const scoreDetails = computed(() => {
  if (!creditScore.value) return []
  
  return [
    {
      label: 'Total Score',
      value: creditScore.value.score,
      icon: TrendingUp,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      label: 'Repayment Factor',
      value: creditScore.value.repayment_factor,
      icon: CreditCard,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Last Updated',
      value: formatDate(creditScore.value.calculated_at),
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ]
})

const chartData = computed(() => {
  return {
    labels: scoreHistory.value.map(item => formatDate(item.calculated_at)),
    datasets: [
      {
        label: 'Credit Score',
        data: scoreHistory.value.map(item => item.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 300,
        max: 850,
        ticks: {
          stepSize: 50
        }
      }
    }
  }
})

const calculateNewScore = async () => {
  // Handle both calculate mode and view mode
  if (isCalculateMode.value) {
    // Calculate mode: use selected user from dropdown
    if (!selectedUserId.value) {
      notificationStore.error('Error', 'Please select a user')
      return
    }
    
    try {
      await creditStore.calculateCreditScore(selectedUserId.value)
      notificationStore.success('Success', 'Credit score calculated successfully')
      selectedUserId.value = '' // Reset selection
    } catch (error) {
      notificationStore.error('Error', 'Failed to calculate credit score')
    }
  } else {
    // View mode: calculate for current user
    try {
      const result = await creditStore.calculateCreditScore(userId.value)
      creditScore.value = result
      notificationStore.success('Success', 'Credit score calculated successfully')
    } catch (error) {
      notificationStore.error('Error', 'Failed to calculate credit score')
    }
  }
}

const refreshHistory = async () => {
  historyLoading.value = true
  try {
    const history = await creditStore.getCreditScoreHistory(userId)
    scoreHistory.value = history.scores || []
  } catch (error) {
    notificationStore.error('Error', 'Failed to load score history')
  } finally {
    historyLoading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const loadUserAndScore = async () => {
  // Don't load user data if we're in calculate mode
  if (isCalculateMode.value) {
    return
  }
  
  try {
    user.value = await creditStore.fetchUser(userId)
    const score = await creditStore.getCreditScore(userId)
    creditScore.value = score
    await refreshHistory()
  } catch (error) {
    notificationStore.error('Error', 'Failed to load user data')
  }
}

const loadAvailableUsers = async () => {
  try {
    await creditStore.fetchUsers()
    availableUsers.value = creditStore.users
  } catch (error) {
    notificationStore.error('Error', 'Failed to load users')
  }
}

onMounted(() => {
  if (isCalculateMode.value) {
    loadAvailableUsers()
  } else {
    loadUserAndScore()
  }
})

watch(() => route.params.id, (newId) => {
  if (!isCalculateMode.value && newId !== userId) {
    loadUserAndScore()
  }
})
</script>
