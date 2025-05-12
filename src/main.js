import './assets/main.css'
import './assets/darkmode.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { fetchNgrokUrl } from './api/config'
import { notificationPlugin } from './plugins/notification'

// Apply saved theme on app initialization
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
    document.body.classList.add('bg-gray-900')
  } else if (savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
    document.body.classList.toggle('bg-gray-900', prefersDark)
  }
}

// Try to fetch and update the current ngrok URL
const initializeApiConfig = async () => {
  try {
    const url = await fetchNgrokUrl()
    if (url) {
      console.log('🚀 API URL updated to:', url)
    } else {
      console.log('⚠️ Could not fetch ngrok URL, using cached or default URL')
    }
  } catch (error) {
    console.error('❌ Error fetching ngrok URL:', error)
  }
}

// Initialize app settings
initializeTheme()
initializeApiConfig() // This runs asynchronously

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(notificationPlugin)

app.mount('#app')
