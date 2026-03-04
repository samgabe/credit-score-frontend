<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
      <button
        @click="$router.go(-1)"
        class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Users
      </button>
      
      <div v-if="user" class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <User class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ user.fullname }}</h1>
            <p class="text-gray-600">ID: {{ user.national_id }}</p>
            <p class="text-gray-500">{{ user.email || 'No email provided' }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            @click="editUser"
            class="btn-secondary"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            @click="calculateScore"
            class="btn-primary"
            :disabled="loading"
          >
            <Calculator class="w-4 h-4 mr-2" />
            Calculate Score
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loading-spinner w-12 h-12"></div>
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Credit Score Card -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Credit Score</h2>
          
          <div v-if="creditScore" class="text-center">
            <div class="relative inline-block mb-4">
              <div
                class="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl"
                :class="scoreInfo.gradient"
              >
                {{ creditScore.score }}
              </div>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
                  :class="scoreInfo.gradient"
                >
                  {{ scoreInfo.category }}
                </span>
              </div>
            </div>
            <p class="text-gray-600">Calculated on {{ formatDateTime(creditScore.calculated_at) }}</p>
          </div>
          
          <div v-else class="text-center py-8">
            <Calculator class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Credit Score</h3>
            <p class="text-gray-600 mb-4">Calculate a credit score to see detailed analysis</p>
            <button
              @click="calculateScore"
              class="btn-primary"
              :disabled="loading"
            >
              <Calculator class="w-4 h-4 mr-2" />
              Calculate Credit Score
            </button>
          </div>
        </div>

        <!-- Score Factors Breakdown -->
        <div v-if="creditScore" class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 100ms">
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

        <!-- Recent Activity -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 200ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="activity.iconBg"
              >
                <component :is="activity.icon" class="w-4 h-4" :class="activity.iconColor" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- User Info -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 300ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">User Information</h2>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Full Name</p>
              <p class="font-medium text-gray-900">{{ user.fullname }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">National ID</p>
              <p class="font-medium text-gray-900">{{ user.national_id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone Number</p>
              <p class="font-medium text-gray-900">{{ user.phone_number }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium text-gray-900">{{ user.email || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Member Since</p>
              <p class="font-medium text-gray-900">{{ formatDate(user.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 400ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div class="space-y-3">
            <button
              @click="viewScoreHistory"
              class="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <BarChart3 class="w-5 h-5 text-primary-600" />
              <span class="font-medium text-gray-900">Score History</span>
            </button>
            <button
              @click="exportReport"
              class="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <Download class="w-5 h-5 text-primary-600" />
              <span class="font-medium text-gray-900">Export Report</span>
            </button>
            <button
              @click="sendNotification"
              class="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <Mail class="w-5 h-5 text-primary-600" />
              <span class="font-medium text-gray-900">Send Notification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useNotificationStore } from '@/stores/notification'
import { getScoreCategory, formatDateTime, formatDate } from '@/utils/helpers'
import {
  ArrowLeft,
  User,
  Edit,
  Calculator,
  BarChart3,
  Download,
  Mail,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const creditStore = useCreditStore()
const notificationStore = useNotificationStore()

const userId = route.params.id
const user = ref(null)
const creditScore = ref(null)

// Debug logging
console.log('Route params:', route.params)
console.log('User ID from route:', userId)
console.log('User ID type:', typeof userId)
console.log('User ID length:', userId ? userId.length : 'undefined')
console.log('Full URL:', window.location.href)
console.log('Path:', window.location.pathname)

const loading = computed(() => creditStore.loading)

const scoreInfo = computed(() => {
  if (!creditScore.value) return null
  return getScoreCategory(creditScore.value.score)
})

const scoreFactors = computed(() => {
  if (!creditScore.value) return []
  
  return [
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
  ].sort((a, b) => b.value - a.value)
})

const recentActivity = ref([])

const calculateScore = async () => {
  try {
    // Validate that userId is a valid UUID format
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID format')
    }
    
    // Basic UUID validation (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format')
    }
    
    const result = await creditStore.calculateCreditScore(userId)
    creditScore.value = result
    notificationStore.success('Success', 'Credit score calculated successfully')
  } catch (error) {
    console.error('Calculate score error:', error)
    if (error.message.includes('Invalid user ID format')) {
      notificationStore.error('Error', 'Invalid user ID format')
    } else {
      notificationStore.error('Error', 'Failed to calculate credit score')
    }
  }
}

const editUser = () => {
  // Open edit modal
  notificationStore.info('Info', 'Edit functionality coming soon')
}

const viewScoreHistory = () => {
  router.push(`/credit-score/${userId}/history`)
}

const exportReport = () => {
  notificationStore.info('Info', 'Export functionality coming soon')
}

const sendNotification = () => {
  notificationStore.info('Info', 'Notification functionality coming soon')
}

const loadUserData = async () => {
  try {
    console.log('Loading user data with userId:', userId)
    user.value = await creditStore.fetchUser(userId)
    console.log('Fetched user:', user.value)
    if (user.value) {
      console.log('Fetched user ID:', user.value.id, 'Type:', typeof user.value.id)
    }
    
    const score = await creditStore.getCreditScore(userId)
    creditScore.value = score
    
    // Fetch user activity
    try {
      const activity = await creditStore.getUserActivity(userId)
      if (activity && activity.activities) {
        recentActivity.value = activity.activities.map(act => ({
          id: act.id,
          title: act.title || 'Activity logged',
          time: act.time || 'Recently',
          icon: getActivityIcon(act.type),
          iconBg: getActivityIconBg(act.type),
          iconColor: getActivityIconColor(act.type)
        }))
      }
    } catch (err) {
      // If activity fetch fails, just log it but don't break the page
      console.error('Failed to fetch activity:', err)
    }
  } catch (error) {
    notificationStore.error('Error', 'Failed to load user data')
  }
}

const getActivityIcon = (type) => {
  const iconMap = {
    'profile_updated': Edit,
    'score_calculated': CheckCircle,
    'risk_alert': AlertTriangle,
    'default': Activity
  }
  return iconMap[type] || iconMap.default
}

const getActivityIconBg = (type) => {
  const bgMap = {
    'profile_updated': 'bg-blue-100',
    'score_calculated': 'bg-success-100',
    'risk_alert': 'bg-warning-100',
    'default': 'bg-gray-100'
  }
  return bgMap[type] || bgMap.default
}

const getActivityIconColor = (type) => {
  const colorMap = {
    'profile_updated': 'text-blue-600',
    'score_calculated': 'text-success-600',
    'risk_alert': 'text-warning-600',
    'default': 'text-gray-600'
  }
  return colorMap[type] || colorMap.default
}

onMounted(() => {
  loadUserData()
})

watch(() => route.params.id, (newId) => {
  if (newId !== userId) {
    loadUserData()
  }
})
</script>
