import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Import theme store for initialization
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme before mounting to avoid a flash of wrong theme
const themeStore = useThemeStore(pinia)
themeStore.initializeTheme()

app.mount('#app')
