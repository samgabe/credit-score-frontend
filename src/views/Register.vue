<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
          <UserPlus class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
        <p class="text-gray-600 mt-2">Join CreditScore Pro today</p>
      </div>

      <!-- Registration Form -->
      <div class="glass-effect rounded-2xl p-8 animate-slide-up">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.fullname"
                type="text"
                required
                class="input-field pl-10"
                :class="{ 'border-red-500': errors.fullname }"
                placeholder="John Doe"
              />
            </div>
            <p v-if="errors.fullname" class="text-red-500 text-xs mt-1">{{ errors.fullname }}</p>
          </div>

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
                placeholder="john.doe@example.com"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              National ID
            </label>
            <div class="relative">
              <CreditCard class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.national_id"
                type="number"
                required
                class="input-field pl-10"
                :class="{ 'border-red-500': errors.national_id }"
                placeholder="12345678"
              />
            </div>
            <p v-if="errors.national_id" class="text-red-500 text-xs mt-1">{{ errors.national_id }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.phone_number"
                type="tel"
                required
                class="input-field pl-10"
                :class="{ 'border-red-500': errors.phone_number }"
                placeholder="+254712345678"
              />
            </div>
            <p v-if="errors.phone_number" class="text-red-500 text-xs mt-1">{{ errors.phone_number }}</p>
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

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="input-field pl-10 pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="•••••••••"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            class="w-full btn-primary"
            :disabled="loading"
          >
            <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign In
            </router-link>
          </p>
        </div>
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
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  fullname: '',
  email: '',
  national_id: '',
  phone_number: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  fullname: '',
  email: '',
  national_id: '',
  phone_number: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  errors.value = {
    fullname: '',
    email: '',
    national_id: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  }

  let isValid = true

  // Fullname validation
  if (!form.fullname.trim()) {
    errors.value.fullname = 'Full name is required'
    isValid = false
  } else if (form.fullname.length < 2) {
    errors.value.fullname = 'Full name must be at least 2 characters'
    isValid = false
  }

  // Email validation
  if (!form.email.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email'
    isValid = false
  }

  // National ID validation
  if (!form.national_id) {
    errors.value.national_id = 'National ID is required'
    isValid = false
  } else if (form.national_id.length < 6) {
    errors.value.national_id = 'National ID must be at least 6 digits'
    isValid = false
  }

  // Phone validation
  if (!form.phone_number.trim()) {
    errors.value.phone_number = 'Phone number is required'
    isValid = false
  } else if (!/^\+?[1-9]\d{6,14}$/.test(form.phone_number)) {
    errors.value.phone_number = 'Please enter a valid phone number'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.value.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const response = await api.post('/auth/register', {
      fullname: form.fullname,
      email: form.email,
      password: form.password,
      national_id: parseInt(form.national_id),
      phone_number: form.phone_number
    })
    
    notificationStore.success('Success', 'Account created successfully! Please sign in.')
    router.push('/login')
  } catch (error) {
    if (error.response?.status === 409) {
      notificationStore.error('Error', 'Email or National ID already exists')
    } else if (error.response?.status === 400) {
      notificationStore.error('Error', error.response.data.detail || 'Invalid registration data')
    } else {
      notificationStore.error('Error', 'Registration failed. Please try again.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
