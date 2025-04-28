import './assets/main.css'
import './assets/darkmode.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

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

initializeTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
