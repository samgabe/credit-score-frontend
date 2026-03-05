<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Information</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  v-model="profileForm.full_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <div class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getRoleClass(profileForm.role)"
                >
                  {{ profileForm.role }}
                </span>
              </div>
            </div>
            
            <div class="pt-4">
              <button
                type="submit"
                :disabled="updating"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="updating" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
                <span v-else>Update Profile</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                v-model="passwordForm.current_password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                v-model="passwordForm.new_password"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                v-model="passwordForm.confirm_password"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div class="pt-4">
              <button
                type="submit"
                :disabled="changingPassword"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="changingPassword" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing Password...
                </div>
                <span v-else>Change Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- User Info Card -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ profileForm.full_name }}</h3>
            <p class="text-gray-500 dark:text-gray-400">{{ profileForm.email }}</p>
            
            <div class="mt-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getRoleClass(profileForm.role)"
              >
                {{ profileForm.role }}
              </span>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Account Status</span>
                <span class="text-green-600 dark:text-green-400">Active</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Member Since</span>
                <span class="text-gray-900 dark:text-gray-100">{{ formatDate(user?.created_at) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Last Login</span>
                <span class="text-gray-900 dark:text-gray-100">{{ formatDate(new Date()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { User } from 'lucide-vue-next'
import api from '@/utils/api'

const authStore = useAuthStore()
const updating = ref(false)
const changingPassword = ref(false)

const profileForm = ref({
  full_name: '',
  email: '',
  role: ''
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const user = ref(null)

const getRoleClass = (role) => {
  const classes = {
    'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'operator': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return classes[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const updateProfile = async () => {
  updating.value = true
  try {
    await api.put('/system-auth/profile', {
      full_name: profileForm.value.full_name
    })
    
    // Update local user data
    authStore.updateUser({ full_name: profileForm.value.full_name })
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    alert('New passwords do not match')
    return
  }
  
  changingPassword.value = true
  try {
    await api.post('/system-auth/change-password', {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password
    })
    
    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
    
    alert('Password changed successfully')
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Error changing password. Please check your current password.')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    profileForm.value = {
      full_name: authStore.user.full_name,
      email: authStore.user.email,
      role: authStore.user.role
    }
    user.value = authStore.user
  }
})
</script>
