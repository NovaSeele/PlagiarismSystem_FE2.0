<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out border-b bg-white h-16"
    :class="[isScrolled ? 'shadow-sm' : '']"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center">
        <button
          class="btn-ghost btn-icon mr-4 p-2 rounded-lg hover:bg-gray-100"
          @click="$emit('toggleSidebar')"
        >
          <component :is="MenuIcon" :size="18" />
        </button>
        <router-link to="/" class="text-xl font-medium text-gray-900">
          PlagiarismCheck
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <!-- Not authenticated - show login/register buttons -->
        <template v-if="!userStore.isAuthenticated">
          <router-link
            to="/login"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg border border-gray-300 transition-colors"
          >
            <LogIn class="w-4 h-4 mr-2" />
            <span>Đăng nhập</span>
          </router-link>
          <router-link
            to="/register"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg shadow-sm transition-colors"
          >
            <span>Đăng ký</span>
          </router-link>
        </template>

        <!-- Authenticated - show notification bell and avatar -->
        <div v-else class="flex items-center space-x-4">
          <button class="btn-ghost btn-icon relative p-2 rounded-lg hover:bg-gray-100">
            <BellIcon :size="20" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div class="flex items-center space-x-3">
            <router-link to="/settings" class="flex items-center">
              <img
                v-if="userStore.user && userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.full_name"
                class="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon :size="16" class="text-gray-600" />
              </div>
            </router-link>

            <button @click="handleLogout" class="text-sm text-gray-700 hover:text-blue-600">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User as UserIcon, Bell as BellIcon, Menu as MenuIcon, LogIn } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

// Get user store and router
const userStore = useUserStore()
const router = useRouter()

// Reactive state
const isMenuOpen = ref(false)
const isScrolled = ref(false)

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Handle logout
const handleLogout = async () => {
  try {
    userStore.clearUser()
    // Don't redirect to login page, just stay on the current page
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Setup scroll event listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position
})
</script>
