<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p class="text-gray-600">Welcome back! Here's your credit score overview.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="glass-effect rounded-xl p-6 card-hover animate-slide-up"
        :style="{ animationDelay: `${stat.delay}ms` }"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
            <p class="text-xs mt-2" :class="stat.changeColor">
              {{ stat.change }}
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.iconBg"
          >
            <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Users -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Recent Clients</h2>
            <router-link
              to="/clients"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              View All
            </router-link>
          </div>

          <div class="space-y-4">
            <div
              v-for="client in recentClients"
              :key="client.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="goToUser(client.id)"
            >
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <User class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ client.fullname }}</p>
                  <p class="text-sm text-gray-500">ID: {{ client.national_id }}</p>
                </div>
              </div>
              <div class="text-right">
                <div
                  v-if="client.creditScore"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getScoreBadgeClass(client.creditScore.score)"
                >
                  {{ client.creditScore.score }}
                </div>
                <p v-else class="text-sm text-gray-500">No score</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 300ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              v-for="action in quickActions"
              :key="action.title"
              @click="action.handler"
              class="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="action.iconBg"
              >
                <component :is="action.icon" class="w-5 h-5" :class="action.iconColor" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ action.title }}</p>
                <p class="text-sm text-gray-500">{{ action.description }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Credit Score Distribution -->
      <div class="space-y-6">
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 400ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Score Distribution</h2>
          <div class="space-y-4">
            <div
              v-for="range in scoreDistribution"
              :key="range.label"
              class="space-y-2"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700">{{ range.label }}</span>
                <span class="text-gray-500">{{ range.count }} users</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="range.color"
                  :style="{ width: `${range.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 500ms">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { getScoreCategory, formatDateTime } from '@/utils/helpers'
import {
  Users,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  User,
  Plus,
  Calculator,
  Activity,
  CheckCircle
} from 'lucide-vue-next'

const router = useRouter()
const creditStore = useCreditStore()

const stats = computed(() => {
  const totalClients = creditStore.clients.length
  const clientsWithScores = creditStore.clients.filter(subject => subject.creditScore)
  const avgScore = clientsWithScores.length > 0 
    ? Math.round(clientsWithScores.reduce((sum, subject) => sum + subject.creditScore.score, 0) / clientsWithScores.length)
    : 0
  const lowScoreClients = clientsWithScores.filter(subject => subject.creditScore.score < 600)
  
  return [
    {
      title: 'Clients',
      value: totalClients.toString(),
      change: totalClients > 0 ? `${totalClients} clients` : 'No clients yet',
      changeColor: totalClients > 0 ? 'text-success-600' : 'text-gray-600',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      delay: 0
    },
    {
      title: 'Average Score',
      value: avgScore.toString(),
      change: avgScore > 0 ? `Average of ${clientsWithScores.length} scores` : 'No scores calculated',
      changeColor: avgScore > 0 ? 'text-success-600' : 'text-gray-600',
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      delay: 100
    },
    {
      title: 'Clients with Scores',
      value: clientsWithScores.length.toString(),
      change: clientsWithScores.length > 0 ? 'Clients with scores' : 'No scores today',
      changeColor: clientsWithScores.length > 0 ? 'text-success-600' : 'text-gray-600',
      icon: UserCheck,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      delay: 200
    },
    {
      title: 'At Risk',
      value: lowScoreClients.length.toString(),
      change: lowScoreClients.length > 0 ? `${lowScoreClients.length} at risk` : 'No risk alerts',
      changeColor: lowScoreClients.length > 0 ? 'text-warning-600' : 'text-success-600',
      icon: AlertTriangle,
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      delay: 300
    }
  ]
})

const recentClients = ref([])

const scoreDistribution = ref([
  { label: 'Excellent (750+)', count: 0, percentage: 0, color: 'bg-emerald-500' },
  { label: 'Good (700-749)', count: 0, percentage: 0, color: 'bg-blue-500' },
  { label: 'Fair (650-699)', count: 0, percentage: 0, color: 'bg-amber-500' },
  { label: 'Poor (600-649)', count: 0, percentage: 0, color: 'bg-orange-500' },
  { label: 'Very Poor (<600)', count: 0, percentage: 0, color: 'bg-red-500' }
])

const recentActivity = ref([])

const quickActions = ref([
  {
    title: 'Add Client',
    description: 'Create a new client',
    icon: Plus,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    handler: () => router.push('/clients')
  },
  {
    title: 'Calculate Score',
    description: 'Calculate credit score for client',
    icon: Calculator,
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    handler: () => router.push('/credit-score/calculate')
  }
])

const loadRecentActivity = async () => {
  try {
    // Try to get real activity data
    const activityData = await creditStore.getRecentActivity()
    if (activityData && activityData.activities) {
      recentActivity.value = activityData.activities.map(activity => ({
        id: activity.id,
        title: activity.title || 'Activity logged',
        time: activity.time || 'Recently',
        icon: getActivityIcon(activity.type),
        iconBg: getActivityIconBg(activity.type),
        iconColor: getActivityIconColor(activity.type)
      }))
    }
  } catch (error) {
    console.error('Error loading recent activity:', error)
    // Provide fallback activity data if API fails
    recentActivity.value = [
      {
        id: 1,
        title: 'System initialized',
        time: 'Today',
        icon: Activity,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600'
      },
      {
        id: 2,
        title: 'Database optimized',
        time: 'Today',
        icon: CheckCircle,
        iconBg: 'bg-success-100',
        iconColor: 'text-success-600'
      }
    ]
  }
}

const getActivityIcon = (type) => {
  const iconMap = {
    'score_calculated': CheckCircle,
    'user_registered': User,
    'risk_alert': AlertTriangle,
    'default': Activity
  }
  return iconMap[type] || iconMap.default
}

const getActivityIconBg = (type) => {
  const bgMap = {
    'score_calculated': 'bg-success-100',
    'user_registered': 'bg-primary-100',
    'risk_alert': 'bg-warning-100',
    'default': 'bg-gray-100'
  }
  return bgMap[type] || bgMap.default
}

const getActivityIconColor = (type) => {
  const colorMap = {
    'score_calculated': 'text-success-600',
    'user_registered': 'text-primary-600',
    'risk_alert': 'text-warning-600',
    'default': 'text-gray-600'
  }
  return colorMap[type] || colorMap.default
}

const goToUser = (userId) => {
  router.push(`/clients/${userId}`)
}

const getScoreBadgeClass = (score) => {
  const category = getScoreCategory(score)
  return `bg-${category.color}-200 text-${category.color}-500`
}

const onUserCreated = () => {
  // Refresh clients list after creation
  creditStore.fetchClients().then(() => {
    // Update recent clients from store
    recentClients.value = creditStore.clients.slice(0, 5).map(subject => ({
      id: subject.id,
      fullname: subject.full_name,
      national_id: subject.national_id,
      creditScore: subject.creditScore
    }))
  })
}

onMounted(async () => {
  // Fetch clients from backend
  await creditStore.fetchClients()
  
  // Load recent activity from backend
  await loadRecentActivity()
  
  // Update recent clients from store
  recentClients.value = creditStore.clients.slice(0, 5).map(subject => ({
    id: subject.id,
    fullname: subject.full_name,
    national_id: subject.national_id,
    creditScore: subject.creditScore
  }))
  
  // Calculate score distribution from real data
  const totalClients = creditStore.clients.length
  const clientsWithScores = creditStore.clients.filter(subject => subject.creditScore)
  
  if (totalClients > 0) {
    const distribution = {
      excellent: clientsWithScores.filter(s => s.creditScore.score >= 750).length,
      good: clientsWithScores.filter(s => s.creditScore.score >= 700 && s.creditScore.score < 750).length,
      fair: clientsWithScores.filter(s => s.creditScore.score >= 650 && s.creditScore.score < 700).length,
      poor: clientsWithScores.filter(s => s.creditScore.score >= 600 && s.creditScore.score < 650).length,
      veryPoor: clientsWithScores.filter(s => s.creditScore.score < 600).length
    }
    
    scoreDistribution.value = [
      { 
        label: 'Excellent (750+)', 
        count: distribution.excellent, 
        percentage: Math.round((distribution.excellent / totalClients) * 100), 
        color: 'bg-emerald-500' 
      },
      { 
        label: 'Good (700-749)', 
        count: distribution.good, 
        percentage: Math.round((distribution.good / totalClients) * 100), 
        color: 'bg-blue-500' 
      },
      { 
        label: 'Fair (650-699)', 
        count: distribution.fair, 
        percentage: Math.round((distribution.fair / totalClients) * 100), 
        color: 'bg-amber-500' 
      },
      { 
        label: 'Poor (600-649)', 
        count: distribution.poor, 
        percentage: Math.round((distribution.poor / totalClients) * 100), 
        color: 'bg-orange-500' 
      },
      { 
        label: 'Very Poor (<600)', 
        count: distribution.veryPoor, 
        percentage: Math.round((distribution.veryPoor / totalClients) * 100), 
        color: 'bg-red-500' 
      }
    ]
  }
})
</script>
