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
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ authStore.user?.full_name || 'User' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.user?.email }}</p>
                <div class="mt-1">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {{ authStore.user?.role || 'viewer' }}
                  </span>
                </div>
              </div>
              <div class="p-2">
                <router-link
                  to="/profile"
                  class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  @click="closeUserMenu"
                >
                  <User class="w-4 h-4" />
                  <span>Profile</span>
                </router-link>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { getNavigationItems } from '@/utils/permissions'
import {
  TrendingUp,
  LayoutDashboard,
  BarChart3,
  Users,
  Calculator,
  Upload,
  FileText,
  Shield,
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

// Dynamic navigation based on user role
const navigation = computed(() => {
  const userRole = authStore.userRole
  const items = getNavigationItems(userRole)
  
  // Map items to navigation format
  return items.map(item => ({
    name: item.name,
    href: item.path,
    icon: getIconComponent(item.icon)
  }))
})

// Icon mapping
const getIconComponent = (iconName) => {
  const iconMap = {
    'chart-bar': LayoutDashboard,
    'chart-line': BarChart3,
    'users': Users,
    'calculator': Calculator,
    'document-upload': Upload,
    'upload': FileText,
    'user-shield': Shield,
    'shield': Shield,
    'settings': Settings
  }
  return iconMap[iconName] || LayoutDashboard
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
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
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.nav-link-active {
  color: #2563eb;
  background-color: #eff6ff;
}

.dark .nav-link {
  color: #d1d5db;
}

.dark .nav-link:hover {
  color: #f3f4f6;
  background-color: #374151;
}

.dark .nav-link-active {
  color: #60a5fa;
  background-color: rgba(37, 99, 235, 0.3);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.mobile-nav-link-active {
  color: #2563eb;
  background-color: #eff6ff;
}

.dark .mobile-nav-link {
  color: #d1d5db;
}

.dark .mobile-nav-link:hover {
  color: #f3f4f6;
  background-color: #374151;
}

.dark .mobile-nav-link-active {
  color: #60a5fa;
  background-color: rgba(37, 99, 235, 0.3);
}
</style>
