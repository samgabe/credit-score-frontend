<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
          <TrendingUp class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">CreditScore Pro</h1>
        <p class="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <!-- Login Form -->
      <div class="glass-effect rounded-2xl p-8 animate-slide-up">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.email"
                type="email"
                required
                class="input-field pl-10"
                :class="{ 'border-red-500': errors.email }"
                placeholder="admin@creditscore.com"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pl-10 pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="•••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.remember"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-700 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            class="w-full btn-primary"
            :disabled="loading"
          >
            <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?
            <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign Up
            </router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
        <p>© 2026 CreditScore Pro. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import api from '@/utils/api'
import {
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  // Reset errors
  errors.email = ''
  errors.password = ''

  let isValid = true

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    // Call new system authentication API
    const response = await authStore.login({
      email: form.email,
      password: form.password
    })
    
    console.log('Login response:', response)
    
    notificationStore.success('Success', `Welcome back, ${response.user.full_name}!`)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    if (error.response?.status === 401) {
      notificationStore.error('Error', 'Invalid email or password')
    } else if (error.response?.status === 400) {
      notificationStore.error('Error', error.response.data.detail || 'Invalid credentials')
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      notificationStore.error('Error', 'Cannot connect to server. Please check if backend is running.')
    } else {
      notificationStore.error('Error', 'An unexpected error occurred. Please try again.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
