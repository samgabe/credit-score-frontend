<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p class="text-gray-600">Manage and monitor all user accounts</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn-primary mt-4 sm:mt-0"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add User
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="glass-effect rounded-xl p-6 mb-6 animate-slide-up">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name, ID, or email..."
              class="input-field pl-10"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <select
            v-model="filterStatus"
            class="input-field"
          >
            <option value="">All Status</option>
            <option value="has-score">Has Credit Score</option>
            <option value="no-score">No Credit Score</option>
          </select>
          <button
            @click="refreshUsers"
            class="btn-secondary"
            :disabled="loading"
          >
            <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="glass-effect rounded-xl overflow-hidden animate-slide-up" style="animation-delay: 100ms">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                National ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit Score
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <User class="w-5 h-5 text-white" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.fullname }}</div>
                    <div class="text-sm text-gray-500">{{ user.email || 'No email' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.national_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  v-if="user.creditScore"
                  class="text-lg font-bold"
                  :class="getScoreTextColor(user.creditScore.score)"
                >
                  {{ user.creditScore.score }}
                </div>
                <span v-else class="text-sm text-gray-500">Not calculated</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="user.creditScore"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getScoreBadgeClass(user.creditScore.score)"
                >
                  {{ getScoreCategory(user.creditScore.score).category }}
                </span>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="viewUser(user.id)"
                    class="text-primary-600 hover:text-primary-900 transition-colors"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="calculateScore(user.id)"
                    class="text-success-600 hover:text-success-900 transition-colors"
                    title="Calculate Credit Score"
                    :disabled="loading"
                  >
                    <Calculator class="w-4 h-4" />
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-gray-600 hover:text-gray-900 transition-colors"
                    title="Edit User"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="text-center py-12">
        <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Create User Modal -->
    <CreateUserModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleUserCreated"
    />

    <!-- Edit User Modal -->
    <EditUserModal
      v-if="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useNotificationStore } from '@/stores/notification'
import { getScoreCategory, formatDate } from '@/utils/helpers'
import {
  Plus,
  Search,
  RefreshCw,
  User,
  Eye,
  Calculator,
  Edit,
  Users
} from 'lucide-vue-next'
import CreateUserModal from '@/components/modals/CreateUserModal.vue'
import EditUserModal from '@/components/modals/EditUserModal.vue'

const router = useRouter()
const creditStore = useCreditStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const filterStatus = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref(null)

const loading = computed(() => creditStore.loading)

const filteredUsers = computed(() => {
  let users = creditStore.users || []

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(user =>
      user.fullname.toLowerCase().includes(query) ||
      user.national_id.toString().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (filterStatus.value === 'has-score') {
    users = users.filter(user => user.creditScore)
  } else if (filterStatus.value === 'no-score') {
    users = users.filter(user => !user.creditScore)
  }

  return users
})

const refreshUsers = async () => {
  await creditStore.fetchUsers()
  console.log('Users after fetch:', creditStore.users)
  if (creditStore.users.length > 0) {
    console.log('First user ID:', creditStore.users[0].id)
    console.log('First user ID type:', typeof creditStore.users[0].id)
  }
  notificationStore.success('Success', 'Users refreshed successfully')
}

const viewUser = (userId) => {
  console.log('viewUser called with userId:', userId)
  console.log('userId type:', typeof userId)
  console.log('userId length:', userId ? userId.length : 'undefined')
  router.push(`/users/${userId}`)
}

const calculateScore = async (userId) => {
  try {
    // Validate that userId is a valid UUID format
    if (!userId || typeof userId !== 'string') {
      notificationStore.error('Error', 'Invalid user ID format')
      return
    }
    
    // Basic UUID validation (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      notificationStore.error('Error', 'Invalid user ID format')
      return
    }
    
    await creditStore.calculateCreditScore(userId)
    notificationStore.success('Success', 'Credit score calculated successfully')
    // Refresh users to show updated scores
    await refreshUsers()
  } catch (error) {
    console.error('Calculate score error:', error)
    notificationStore.error('Error', 'Failed to calculate credit score')
  }
}

const editUser = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const handleUserCreated = () => {
  showCreateModal.value = false
  refreshUsers()
}

const handleUserUpdated = () => {
  showEditModal.value = false
  refreshUsers()
}

const getScoreTextColor = (score) => {
  const category = getScoreCategory(score)
  return `text-${category.color}-600`
}

const getScoreBadgeClass = (score) => {
  const category = getScoreCategory(score)
  return `bg-${category.color}-300 text-${category.color}-500`
}

onMounted(() => {
  refreshUsers()
})
</script>
