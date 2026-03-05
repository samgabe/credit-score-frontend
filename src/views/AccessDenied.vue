<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX class="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to access this page.
        </p>
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            <strong>Your Role:</strong> {{ authStore.user?.role || 'Unknown' }}
          </p>
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <strong>Required Permission:</strong> {{ requiredPermission || 'Unknown' }}
          </p>
        </div>
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
      
      <div class="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>If you believe this is an error, please contact your system administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ShieldX, Home } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const requiredPermission = computed(() => {
  // Get the required permission from the route meta if available
  return router.currentRoute.value.meta.permission
})

const goBack = () => {
  router.go(-1)
}
</script>
