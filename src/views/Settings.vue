<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600">Manage your application settings and preferences.</p>
    </div>

    <!-- Settings Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- General Settings -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
            <input
              v-model="settings.appName"
              type="text"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="settings.description"
              rows="3"
              class="input-field resize-y"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="glass-effect rounded-xl p-6 animate-slide-up" style="animation-delay: 100ms">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Email Notifications</label>
            <input 
              v-model="settings.emailNotifications"
              type="checkbox" 
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800" 
            />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">SMS Alerts</label>
            <input 
              v-model="settings.smsAlerts"
              type="checkbox" 
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800" 
            />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Risk Notifications</label>
            <input 
              v-model="settings.riskNotifications"
              type="checkbox" 
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div class="glass-effect rounded-xl p-6 mt-6 animate-slide-up" style="animation-delay: 200ms">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Security</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input 
            v-model="security.currentPassword"
            type="password" 
            class="input-field"
            :class="{ 'border-red-500': securityErrors.currentPassword }"
          />
          <p v-if="securityErrors.currentPassword" class="text-red-500 text-xs mt-1">{{ securityErrors.currentPassword }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            v-model="security.newPassword"
            type="password" 
            class="input-field"
            :class="{ 'border-red-500': securityErrors.newPassword }"
          />
          <p v-if="securityErrors.newPassword" class="text-red-500 text-xs mt-1">{{ securityErrors.newPassword }}</p>
        </div>
      </div>
    </div>

    <!-- CSV Upload Section -->
    <div class="glass-effect rounded-xl p-6 mt-6 animate-slide-up" style="animation-delay: 300ms">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        <Upload class="w-5 h-5 inline mr-2" />
        CSV Data Upload
      </h2>
      <p class="text-gray-600 mb-4">
        Upload CSV files to import user data, transactions, and payment records for credit score calculations.
      </p>
      <CSVUpload />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-8">
      <button 
        @click="resetSettings"
        class="px-6 py-2 rounded-lg transition-colors"
        style="background-color: #ffffff; color: #111827; border: 1px solid #9ca3af;"
        :disabled="loading"
      >
        Cancel
      </button>
      <button 
        @click="saveSettings"
        class="px-6 py-2 bg-primary-600 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-primary-700 dark:hover:bg-gray-200 transition-colors"
        :disabled="loading"
      >
        <div v-if="loading" class="flex items-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Saving...
        </div>
        <span v-else>Save Settings</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Settings as SettingsIcon, Bell, Shield, Database, Upload } from 'lucide-vue-next'
import CSVUpload from '@/components/CSVUpload.vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const loading = ref(false)

const settings = reactive({
  appName: 'CreditScore Pro',
  description: 'Credit score management system',
  emailNotifications: true,
  smsAlerts: false,
  riskNotifications: true
})

const security = reactive({
  currentPassword: '',
  newPassword: ''
})

const securityErrors = reactive({
  currentPassword: '',
  newPassword: ''
})

const loadSettings = async () => {
  try {
    // Load settings from backend or localStorage
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      Object.assign(settings, JSON.parse(savedSettings))
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const validateSecurity = () => {
  securityErrors.currentPassword = ''
  securityErrors.newPassword = ''
  
  let isValid = true
  
  if (security.currentPassword && security.currentPassword.length < 6) {
    securityErrors.currentPassword = 'Password must be at least 6 characters'
    isValid = false
  }
  
  if (security.newPassword && security.newPassword.length < 6) {
    securityErrors.newPassword = 'New password must be at least 6 characters'
    isValid = false
  }
  
  if (security.currentPassword && security.newPassword && security.currentPassword === security.newPassword) {
    securityErrors.newPassword = 'New password must be different from current password'
    isValid = false
  }
  
  return isValid
}

const saveSettings = async () => {
  if (security.currentPassword || security.newPassword) {
    if (!validateSecurity()) return
  }
  
  loading.value = true
  try {
    // Save general settings to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings))
    
    // Update password if provided
    if (security.currentPassword && security.newPassword) {
      await api.post('/auth/change-password', {
        current_password: security.currentPassword,
        new_password: security.newPassword
      })
      
      // Clear password fields
      security.currentPassword = ''
      security.newPassword = ''
      
      notificationStore.success('Success', 'Settings and password updated successfully')
    } else {
      notificationStore.success('Success', 'Settings saved successfully')
    }
  } catch (error) {
    if (error.response?.status === 401) {
      notificationStore.error('Error', 'Current password is incorrect')
      securityErrors.currentPassword = 'Current password is incorrect'
    } else {
      notificationStore.error('Error', 'Failed to save settings')
    }
  } finally {
    loading.value = false
  }
}

const resetSettings = () => {
  loadSettings()
  security.currentPassword = ''
  security.newPassword = ''
  securityErrors.currentPassword = ''
  securityErrors.newPassword = ''
}

onMounted(() => {
  loadSettings()
})
</script>
