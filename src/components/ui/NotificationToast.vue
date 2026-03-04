<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="notification"
      class="fixed top-36 sm:top-20 right-4 z-[80] w-[calc(100vw-2rem)] sm:w-auto max-w-sm rounded-xl shadow-2xl border border-l-4 p-4"
      :class="notificationBorderClass"
      :style="toastStyle"
    >
      <div class="flex items-start space-x-3">
        <component :is="notificationIcon" class="w-5 h-5 flex-shrink-0 mt-0.5" :style="iconStyle" />
        <div class="flex-1">
          <p class="text-sm font-semibold" :style="titleStyle">{{ notification.title }}</p>
          <p v-if="notification.message" class="text-sm mt-1" :style="messageStyle">{{ notification.message }}</p>
        </div>
        <button
          @click="closeNotification"
          class="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          :style="closeButtonStyle"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-vue-next'

const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

const notification = computed(() => notificationStore.current)

const notificationBorderClass = computed(() => {
  if (!notification.value) return 'border-l-primary-500'

  const borderClasses = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
    info: 'border-l-primary-500'
  }

  return borderClasses[notification.value.type] || borderClasses.info
})

const palette = computed(() => {
  const type = notification.value?.type || 'info'

  const lightPalette = {
    success: { icon: '#16a34a', title: '#166534' },
    error: { icon: '#dc2626', title: '#991b1b' },
    warning: { icon: '#d97706', title: '#92400e' },
    info: { icon: '#2563eb', title: '#1e3a8a' }
  }

  const darkPalette = {
    success: { icon: '#86efac', title: '#bbf7d0' },
    error: { icon: '#fca5a5', title: '#fecaca' },
    warning: { icon: '#fcd34d', title: '#fde68a' },
    info: { icon: '#93c5fd', title: '#bfdbfe' }
  }

  return themeStore.isDark
    ? (darkPalette[type] || darkPalette.info)
    : (lightPalette[type] || lightPalette.info)
})

const toastStyle = computed(() => ({
  backgroundColor: themeStore.isDark ? '#1f2937' : '#ffffff',
  borderColor: themeStore.isDark ? '#374151' : '#cbd5e1',
  boxShadow: themeStore.isDark
    ? '0 12px 30px rgba(0, 0, 0, 0.35)'
    : '0 12px 30px rgba(15, 23, 42, 0.16)'
}))

const iconStyle = computed(() => ({ color: palette.value.icon }))

const titleStyle = computed(() => ({ color: palette.value.title }))

const messageStyle = computed(() => ({
  color: themeStore.isDark ? '#d1d5db' : '#1f2937'
}))

const closeButtonStyle = computed(() => ({
  color: themeStore.isDark ? '#9ca3af' : '#475569'
}))

const notificationIcon = computed(() => {
  if (!notification.value) return Info

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  return icons[notification.value.type] || Info
})

const closeNotification = () => {
  notificationStore.clear()
}
</script>
