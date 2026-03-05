import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Import stores for initialization
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme before mounting to avoid a flash of wrong theme
const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()

// Initialize auth store to check for existing tokens
const authStore = useAuthStore(pinia)
authStore.initializeAuth()

app.mount('#app')
