<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX class="w-10 h-10 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div class="space-y-3">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Home class="w-4 h-4 mr-2" />
          Go to Dashboard
        </router-link>
        <button
          @click="goBack"
          class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Go Back
        </button>
      </div>
      
      <div class="mt-8">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Here are some pages you might be looking for:
        </p>
        <div class="mt-3 space-y-2">
          <router-link
            v-for="item in availableRoutes"
            :key="item.name"
            :to="item.path"
            class="block text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getNavigationItems } from '@/utils/permissions'
import { SearchX, Home } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const availableRoutes = computed(() => {
  if (!authStore.isAuthenticated) {
    return [
      { name: 'Login', path: '/login' }
    ]
  }
  
  return getNavigationItems(authStore.userRole)
})

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>
