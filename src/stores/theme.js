import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref('light')
  const systemPreference = ref('light')
  const isSystemTheme = ref(false)

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')
  const currentTheme = computed(() => theme.value)

  // Actions
  const setTheme = (newTheme) => {
    theme.value = newTheme
    isSystemTheme.value = false
    updateDOM()
    saveToLocalStorage()
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const setSystemTheme = () => {
    theme.value = systemPreference.value
    isSystemTheme.value = true
    updateDOM()
    saveToLocalStorage()
  }

  const updateDOM = () => {
    const root = document.documentElement
    const body = document.body

    if (theme.value === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
    }

    // Set data-theme for CSS targeting
    root.setAttribute('data-theme', theme.value)
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('theme', theme.value)
    localStorage.setItem('isSystemTheme', isSystemTheme.value.toString())
  }

  const loadFromLocalStorage = () => {
    const savedTheme = localStorage.getItem('theme')
    const savedIsSystemTheme = localStorage.getItem('isSystemTheme')

    if (savedTheme) {
      theme.value = savedTheme
      isSystemTheme.value = savedIsSystemTheme === 'true'
    }
  }

  const detectSystemPreference = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemPreference.value = 'dark'
    } else {
      systemPreference.value = 'light'
    }
  }

  const initializeTheme = () => {
    detectSystemPreference()
    loadFromLocalStorage()

    // If user hasn't set a preference, use system preference
    if (!localStorage.getItem('theme')) {
      setSystemTheme()
    } else {
      updateDOM()
    }

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        detectSystemPreference()
        if (isSystemTheme.value) {
          setSystemTheme()
        }
      })
    }
  }

  return {
    // State
    theme,
    systemPreference,
    isSystemTheme,

    // Getters
    isDark,
    isLight,
    currentTheme,

    // Actions
    setTheme,
    toggleTheme,
    setSystemTheme,
    initializeTheme
  }
})
