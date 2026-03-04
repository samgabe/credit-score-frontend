<template>
  <div class="theme-toggle-wrapper">
    <!-- Simple Toggle Button -->
    <button
      @click="toggleTheme"
      class="theme-toggle-btn"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Sun 
        v-if="isDark" 
        class="w-5 h-5 text-yellow-500 transition-all duration-300"
      />
      <Moon 
        v-else 
        class="w-5 h-5 text-gray-600 transition-all duration-300"
      />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// Computed
const isDark = computed(() => themeStore.isDark)

// Methods
const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle-wrapper {
  position: relative;
  display: inline-block;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  background-color: rgb(var(--bg-tertiary));
  border: 1px solid rgb(var(--border-primary));
  color: rgb(var(--text-primary));
}

.theme-toggle-btn:hover {
  background-color: rgb(var(--border-secondary));
  transform: scale(1.05);
}

/* Icon animations */
.theme-toggle-btn svg {
  transition: all 0.3s ease;
}

.theme-toggle-btn:hover svg {
  transform: rotate(15deg) scale(1.1);
}
</style>
