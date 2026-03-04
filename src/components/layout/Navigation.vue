<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-gray-100">CreditScore Pro</span>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === item.name }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.name }}
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <ThemeToggle />
          
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-white" />
              </div>
              <ChevronDown class="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 glass-effect rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-slide-down"
            >
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Admin User</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">admin@creditscore.com</p>
              </div>
              <div class="p-2">
                <button
                  @click="logout"
                  class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu class="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="showMobileMenu"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 animate-slide-down"
      >
        <div class="flex flex-col space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="mobile-nav-link"
            :class="{ 'mobile-nav-link-active': $route.name === item.name }"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  User,
  ChevronDown,
  LogOut,
  Menu
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings }
]

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-all duration-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700;
}

.nav-link-active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30;
}

.mobile-nav-link {
  @apply flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-all duration-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700;
}

.mobile-nav-link-active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30;
}
</style>
