<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out border-b bg-white dark:bg-gray-800 dark:border-gray-700 h-16"
    :class="[isScrolled ? 'shadow-sm' : '']"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center">
        <button
          class="btn-ghost btn-icon mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="$emit('toggleSidebar')"
        >
          <component :is="MenuIcon" :size="18" class="dark:text-gray-200" />
        </button>
        <router-link to="/" class="text-xl font-medium text-gray-900 dark:text-white">
          NovaSeele Plagiarism Check
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <!-- Not authenticated - show login/register buttons -->
        <template v-if="!userStore.isAuthenticated">
          <router-link
            to="/login"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
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
          <div class="relative">
            <button
              @click="toggleNotificationDropdown"
              class="btn-ghost btn-icon relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <BellIcon :size="20" class="dark:text-gray-200" />
              <span
                v-if="notificationStore.unreadCount > 0"
                class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              ></span>
            </button>

            <NotificationDropdown
              :is-open="isNotificationDropdownOpen"
              @close="isNotificationDropdownOpen = false"
              @clicked="handleNotificationClick"
            />
          </div>

          <div class="flex items-center space-x-3">
            <router-link to="/settings" class="flex items-center">
              <img
                v-if="userStore.user && userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.full_name"
                class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
              >
                <UserIcon :size="16" class="text-gray-600 dark:text-gray-300" />
              </div>
            </router-link>

            <button
              @click="handleLogout"
              class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { User as UserIcon, Bell as BellIcon, Menu as MenuIcon, LogIn } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { useRouter } from 'vue-router'
import NotificationDropdown from './NotificationDropdown.vue'

// Get user store and router
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// Reactive state
const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isNotificationDropdownOpen = ref(false)

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Toggle notification dropdown
const toggleNotificationDropdown = () => {
  isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value
}

// Handle notification click
const handleNotificationClick = (notification) => {
  // Navigate based on notification type
  switch (notification.type) {
    case notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE:
      router.push('/view-results')
      break
    case notificationStore.NOTIFICATION_TYPES.CHECK_START:
      router.push('/plagiarism-check')
      break
    case notificationStore.NOTIFICATION_TYPES.QUEUE_ADD:
      router.push('/plagiarism-check')
      break
    case notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
      router.push('/documents')
      break
    default:
      break
  }
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

// On component unmount, remove event listeners
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)

  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})

// Handle click outside for notification dropdown
const handleClickOutside = (event) => {
  const notificationDropdown = document.querySelector('.notification-dropdown')
  const notificationButton = document.querySelector('.notification-button')

  if (
    isNotificationDropdownOpen.value &&
    notificationDropdown &&
    notificationButton &&
    !notificationDropdown.contains(event.target) &&
    !notificationButton.contains(event.target)
  ) {
    isNotificationDropdownOpen.value = false
  }
}

// Setup scroll event listener and fetch notifications
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position

  // Fetch notifications if user is authenticated
  if (userStore.isAuthenticated) {
    notificationStore.getNotifications()
  }

  // Watch for user authentication changes to fetch notifications
  watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        notificationStore.getNotifications()
      }
    },
  )

  // Add click outside listener to close notification dropdown
  document.addEventListener('click', handleClickOutside)
})
</script>
