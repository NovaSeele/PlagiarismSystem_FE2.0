<template>
  <div class="flex h-screen overflow-hidden">
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
            'flex-1 p-4 transition-all duration-300 mt-16 overflow-y-auto', // mt-16 ensures content is below header
            isSidebarOpen ? 'ml-64' : 'ml-0',
          ]"
        >
          <router-view />
        </main>
      </div>
    </template>

    <!-- Full-screen content for auth pages -->
    <main v-else class="w-full h-full">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()
const isSidebarOpen = ref(true)

// Check if current route is an authentication page
const isAuthPage = computed(() => {
  return ['/login', '/register'].includes(route.path)
})
</script>
