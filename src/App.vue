<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Global notification container -->
    <NotificationContainer />

    <!-- Only show sidebar and header if not on login or register pages -->
    <template v-if="!isAuthPage">
      <!-- Sidebar -->
      <Sidebar :isOpen="isSidebarOpen" />

      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <Header @toggleSidebar="isSidebarOpen = !isSidebarOpen" />

        <!-- Content -->
        <main
          :class="[
            'flex-1 p-4 transition-all duration-300 mt-16 overflow-y-auto dark:bg-gray-900', // mt-16 ensures content is below header
            isSidebarOpen ? 'ml-64' : 'ml-0',
          ]"
        >
          <router-view />
        </main>
      </div>
    </template>

    <!-- Full-screen content for auth pages -->
    <main v-else class="w-full h-full dark:bg-gray-900">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()
const userStore = useUserStore()
const isSidebarOpen = ref(true)

// Check if current route is an authentication page
const isAuthPage = computed(() => {
  return ['/login', '/register'].includes(route.path)
})

// On app mount, check authentication status and apply theme
onMounted(async () => {
  // Check authentication status
  await userStore.fetchUser()

  // Apply theme settings
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
})
</script>
