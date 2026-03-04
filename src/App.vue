<template>
  <div id="app" class="min-h-screen transition-colors duration-300">
    <Navigation v-if="$route.meta.requiresAuth" />
    <main :class="{ 'pt-16': $route.meta.requiresAuth }">
      <router-view />
    </main>
    
    <!-- Notification Toast -->
    <NotificationToast />
  </div>
</template>

<script setup>
import Navigation from '@/components/layout/Navigation.vue'
import NotificationToast from '@/components/ui/NotificationToast.vue'
</script>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
