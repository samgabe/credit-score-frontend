<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
      <p class="text-gray-600">Comprehensive insights and performance metrics</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-96">
      <div class="loading-spinner w-12 h-12"></div>
    </div>

    <div v-else>
      <!-- Time Period Selector -->
      <div class="glass-effect rounded-xl p-6 mb-6 animate-slide-up">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Time Period</h2>
          <div class="flex items-center space-x-2">
            <button
              v-for="period in timePeriods"
              :key="period.value"
              @click="selectedPeriod = period.value; loadAnalytics()"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="selectedPeriod === period.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="metric in keyMetrics"
          :key="metric.title"
          class="glass-effect rounded-xl p-6 card-hover animate-slide-up"
          :style="{ animationDelay: `${metric.delay}ms` }"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ metric.title }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ metric.value }}</p>
              <div class="flex items-center mt-2">
                <component :is="metric.trendIcon" class="w-4 h-4 mr-1" :class="metric.trendColor" />
                <p class="text-xs" :class="metric.trendColor">{{ metric.trend }}</p>
              </div>
            </div>
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="metric.iconBg"
            >
              <component :is="metric.icon" class="w-6 h-6" :class="metric.iconColor" />
            </div>
          </div>
        </div>
      </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Score Distribution Chart -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 400ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Score Distribution</h2>
        <div class="h-80">
          <Doughnut
            :data="scoreDistributionData"
            :options="doughnutOptions"
            class="w-full h-full"
          />
        </div>
      </div>

      <!-- Score Trends Chart -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 500ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Score Trends</h2>
        <div class="h-80">
          <Line
            :data="scoreTrendsData"
            :options="lineOptions"
            class="w-full h-full"
          />
        </div>
      </div>
    </div>

    <!-- Risk Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 600ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Risk Analysis</h2>
        <div class="space-y-4">
          <div
            v-for="risk in riskAnalysis"
            :key="risk.level"
            class="p-4 rounded-lg border"
            :style="themeStore.isDark ? risk.darkCardStyle : risk.lightCardStyle"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold" :style="{ color: themeStore.isDark ? risk.darkTextColor : risk.lightTextColor }">{{ risk.level }}</span>
              <span class="text-2xl font-extrabold" :style="{ color: themeStore.isDark ? risk.darkTextColor : risk.lightTextColor }">{{ risk.count }}</span>
            </div>
            <p class="text-xs mb-2 font-medium" :style="{ color: themeStore.isDark ? risk.darkSubTextColor : risk.lightSubTextColor }">{{ risk.percentage }}% of risk-profiled users</p>
            <div
              class="w-full rounded-full h-2"
              :style="themeStore.isDark ? { backgroundColor: '#374151' } : { backgroundColor: '#e5e7eb' }"
            >
              <div
                class="h-2 rounded-full transition-all duration-500"
                :style="{ width: `${risk.percentage}%`, backgroundColor: themeStore.isDark ? risk.darkBarColor : risk.lightBarColor }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 700ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Top Performers</h2>
        <div class="space-y-3">
          <div
            v-for="(performer, index) in topPerformers"
            :key="performer.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            @click="goToUser(performer.id)"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ performer.name }}</p>
              <p class="text-sm text-gray-500">Score: {{ performer.score }}</p>
            </div>
            <Trophy class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 800ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div class="space-y-3">
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

    <!-- Detailed Tables -->
    <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 900ms">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previous Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="metric in performanceMetrics"
              :key="metric.name"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ metric.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ metric.current }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ metric.previous }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center">
                  <component :is="metric.changeIcon" class="w-4 h-4 mr-1" :class="metric.changeColor" />
                  <span :class="metric.changeColor">{{ metric.change }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  AlertTriangle,
  Trophy,
  CheckCircle,
  Activity,
  UserCheck,
  DollarSign
} from 'lucide-vue-next'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const router = useRouter()
const creditStore = useCreditStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

const selectedPeriod = ref('30d')
const loading = ref(true)

const timePeriods = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' }
]

const keyMetrics = ref([
  {
    title: 'Total Users',
    value: '0',
    trend: '+0%',
    trendColor: 'text-success-600',
    trendIcon: TrendingUp,
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    delay: 0
  },
  {
    title: 'Avg Credit Score',
    value: '0',
    trend: '+0 points',
    trendColor: 'text-success-600',
    trendIcon: TrendingUp,
    icon: BarChart3,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    delay: 100
  },
  {
    title: 'High Risk Users',
    value: '0',
    trend: '+0%',
    trendColor: 'text-success-600',
    trendIcon: TrendingDown,
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    delay: 200
  },
  {
    title: 'New Scores',
    value: '0',
    trend: '+0%',
    trendColor: 'text-success-600',
    trendIcon: TrendingUp,
    icon: UserCheck,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    delay: 300
  }
])

const riskAnalysis = ref([
  {
    level: 'Low Risk',
    count: 0,
    percentage: 0,
    lightCardStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#86efac',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
    },
    darkCardStyle: {
      backgroundColor: 'rgba(6, 78, 59, 0.22)',
      borderColor: 'rgba(16, 185, 129, 0.35)'
    },
    lightTextColor: '#059669',
    lightSubTextColor: '#047857',
    lightBarColor: '#10b981',
    darkTextColor: '#6ee7b7',
    darkSubTextColor: '#34d399',
    darkBarColor: '#34d399'
  },
  {
    level: 'Medium Risk',
    count: 0,
    percentage: 0,
    lightCardStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#fcd34d',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
    },
    darkCardStyle: {
      backgroundColor: 'rgba(120, 53, 15, 0.22)',
      borderColor: 'rgba(245, 158, 11, 0.35)'
    },
    lightTextColor: '#d97706',
    lightSubTextColor: '#b45309',
    lightBarColor: '#f59e0b',
    darkTextColor: '#fcd34d',
    darkSubTextColor: '#fbbf24',
    darkBarColor: '#fbbf24'
  },
  {
    level: 'High Risk',
    count: 0,
    percentage: 0,
    lightCardStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#fca5a5',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
    },
    darkCardStyle: {
      backgroundColor: 'rgba(127, 29, 29, 0.24)',
      borderColor: 'rgba(239, 68, 68, 0.35)'
    },
    lightTextColor: '#dc2626',
    lightSubTextColor: '#b91c1c',
    lightBarColor: '#ef4444',
    darkTextColor: '#fca5a5',
    darkSubTextColor: '#f87171',
    darkBarColor: '#f87171'
  }
])

const topPerformers = ref([])

const recentActivity = ref([])

const performanceMetrics = ref([
  {
    name: 'Credit Score Calculations',
    current: '0',
    previous: '0',
    change: '+0%',
    changeColor: 'text-success-600',
    changeIcon: TrendingUp
  },
  {
    name: 'User Registrations',
    current: '0',
    previous: '0',
    change: '+0%',
    changeColor: 'text-success-600',
    changeIcon: TrendingUp
  },
  {
    name: 'Average Score',
    current: '0',
    previous: '0',
    change: '+0%',
    changeColor: 'text-success-600',
    changeIcon: TrendingUp
  },
  {
    name: 'Risk Alerts',
    current: '0',
    previous: '0',
    change: '+0%',
    changeColor: 'text-success-600',
    changeIcon: TrendingDown
  }
])

const scoreDistributionData = computed(() => ({
  labels: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'],
  datasets: [{
    data: [
      scoreDistribution.value?.excellent || 0,
      scoreDistribution.value?.good || 0,
      scoreDistribution.value?.fair || 0,
      scoreDistribution.value?.poor || 0,
      scoreDistribution.value?.very_poor || 0
    ],
    backgroundColor: [
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ],
    borderWidth: 0
  }]
}))

const scoreDistribution = ref({
  excellent: 0,
  good: 0,
  fair: 0,
  poor: 0,
  very_poor: 0
})

const scoreTrendsData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Average Score',
      data: scoreTrends.value.avgScores || [0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'New Users',
      data: scoreTrends.value.newUsers || [0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      yAxisID: 'y1'
    }
  ]
}))

const scoreTrends = ref({
  avgScores: [0, 0, 0, 0, 0, 0],
  newUsers: [0, 0, 0, 0, 0, 0]
})

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: themeStore.isDark ? '#cbd5e1' : '#374151'
      }
    }
  }
}))

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: themeStore.isDark ? '#cbd5e1' : '#374151'
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      ticks: {
        color: themeStore.isDark ? '#9ca3af' : '#6b7280'
      },
      grid: {
        color: themeStore.isDark ? 'rgba(75,85,99,0.5)' : 'rgba(229,231,235,0.8)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      ticks: {
        color: themeStore.isDark ? '#9ca3af' : '#6b7280'
      },
      grid: {
        color: themeStore.isDark ? 'rgba(75,85,99,0.5)' : 'rgba(229,231,235,0.8)',
        drawOnChartArea: false,
      },
    }
  }
}))

const loadAnalytics = async () => {
  loading.value = true
  try {
    // Fetch analytics data
    const analyticsData = await creditStore.getAnalytics(selectedPeriod.value)
    
    // Update key metrics
    if (analyticsData.metrics) {
      keyMetrics.value[0].value = analyticsData.metrics.total_users?.toString() || '0'
      keyMetrics.value[1].value = analyticsData.metrics.avg_score?.toString() || '0'
      keyMetrics.value[2].value = analyticsData.metrics.high_risk_users?.toString() || '0'
      keyMetrics.value[3].value = analyticsData.metrics.new_scores?.toString() || '0'
      
      keyMetrics.value[0].trend = `${analyticsData.metrics.users_trend || '+0'}%`
      keyMetrics.value[1].trend = `${analyticsData.metrics.score_trend || '+0'} points`
      keyMetrics.value[2].trend = `${analyticsData.metrics.risk_trend || '+0'}%`
      keyMetrics.value[3].trend = `${analyticsData.metrics.scores_trend || '+0'}%`
    }

    // Fetch score distribution
    const distData = await creditStore.getScoreDistribution()
    if (distData) {
      scoreDistribution.value = distData
      riskAnalysis.value[0].count = distData.low_risk || 0
      riskAnalysis.value[1].count = distData.medium_risk || 0
      riskAnalysis.value[2].count = distData.high_risk || 0
      
      const total = (distData.low_risk || 0) + (distData.medium_risk || 0) + (distData.high_risk || 0)
      if (total > 0) {
        riskAnalysis.value[0].percentage = Math.round((distData.low_risk / total) * 100)
        riskAnalysis.value[1].percentage = Math.round((distData.medium_risk / total) * 100)
        riskAnalysis.value[2].percentage = Math.round((distData.high_risk / total) * 100)
      }
    }

    // Fetch top performers
    const performersData = await creditStore.getTopPerformers(5)
    if (performersData && performersData.performers) {
      topPerformers.value = performersData.performers.map((p, idx) => ({
        id: p.id?.toString() || idx.toString(),
        name: p.fullname || 'Unknown',
        score: p.creditScore?.score || 0
      }))
    }

    // Fetch recent activity
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

    // Update performance metrics if provided
    if (analyticsData.metrics?.performance) {
      performanceMetrics.value[0].current = analyticsData.metrics.performance.calculations?.toString() || '0'
      performanceMetrics.value[1].current = analyticsData.metrics.performance.registrations?.toString() || '0'
      performanceMetrics.value[2].current = analyticsData.metrics.performance.avg_score?.toString() || '0'
      performanceMetrics.value[3].current = analyticsData.metrics.performance.alerts?.toString() || '0'
    }

  } catch (error) {
    console.error('Error loading analytics:', error)
    notificationStore.error('Error', 'Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

const getActivityIcon = (type) => {
  const iconMap = {
    'score_calculated': CheckCircle,
    'user_registered': Users,
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
  router.push(`/users/${userId}`)
}

onMounted(() => {
  loadAnalytics()
})
</script>
