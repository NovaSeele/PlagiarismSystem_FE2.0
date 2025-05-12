<template>
  <div class="flex-1 p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

    <!-- User Not Logged In Message -->
    <div v-if="!userStore.isAuthenticated" class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex items-center space-x-4 text-gray-700">
        <component :is="AlertCircle" class="text-amber-500" :size="24" />
        <div>
          <h3 class="font-medium">Bạn cần đăng nhập để xem và chỉnh sửa cài đặt cá nhân</h3>
          <p class="mt-1 text-gray-500">
            Vui lòng
            <router-link to="/login" class="text-blue-600 hover:underline">đăng nhập</router-link>
            hoặc
            <router-link to="/register" class="text-blue-600 hover:underline">đăng ký</router-link>
            để tiếp tục
          </p>
        </div>
      </div>
    </div>

    <!-- User Profile Section (Only shown when logged in) -->
    <div v-if="userStore.isAuthenticated" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h2>

      <div class="flex items-start space-x-6">
        <div class="relative group">
          <img
            v-if="userStore.user && userStore.user.avatar"
            :src="userStore.user.avatar"
            :alt="userStore.user.full_name"
            class="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
          <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon :size="32" class="text-gray-600" />
          </div>

          <label
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            :class="{ 'cursor-wait': uploadingAvatar }"
          >
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarChange"
              :disabled="uploadingAvatar"
            />
            <Camera class="w-6 h-6 text-white" />
          </label>
        </div>

        <div>
          <div class="text-lg font-medium">
            {{ userStore.user ? userStore.user.full_name : 'User' }}
          </div>
          <div class="text-sm text-gray-500 mb-2">
            {{ userStore.user ? userStore.user.email : 'user@example.com' }}
          </div>
          <div v-if="userStore.user && userStore.user.msv" class="text-sm text-gray-500">
            Mã sinh viên: {{ userStore.user.msv }}
          </div>
          <!-- Display user role -->
          <div class="text-sm mt-2 inline-flex items-center">
            <span class="mr-2 text-gray-500">Vai trò:</span>
            <span
              class="px-2 py-1 text-xs rounded-full font-medium"
              :class="{
                'bg-blue-100 text-blue-800': userStore.isLecturer,
                'bg-green-100 text-green-800': userStore.isStudent,
                'bg-purple-100 text-purple-800': userStore.isGuest,
              }"
            >
              {{ getUserRoleDisplay() }}
            </span>
          </div>
          <div class="mt-2 text-xs text-gray-500">Hover vào ảnh đại diện để thay đổi</div>
        </div>
      </div>
    </div>

    <!-- Other Settings Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Cài đặt khác</h2>

      <!-- If not logged in, show simplified settings -->
      <div v-if="!userStore.isAuthenticated" class="text-gray-600 mb-4">
        <p>Vui lòng đăng nhập để quản lý cài đặt hệ thống của bạn.</p>
      </div>

      <!-- If logged in, show all settings -->
      <div v-else>
        <!-- Theme Settings -->
        <div class="mb-6">
          <h3 class="text-md font-medium text-gray-800 mb-2">Giao diện</h3>
          <div class="flex items-center space-x-4">
            <button
              @click="setTheme('light')"
              class="px-4 py-2 border rounded-md"
              :class="
                theme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200'
              "
            >
              <Sun class="inline-block w-4 h-4 mr-1" />
              Sáng
            </button>
            <button
              @click="setTheme('dark')"
              class="px-4 py-2 border rounded-md"
              :class="
                theme === 'dark' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200'
              "
            >
              <Moon class="inline-block w-4 h-4 mr-1" />
              Tối
            </button>
            <button
              @click="setTheme('system')"
              class="px-4 py-2 border rounded-md"
              :class="
                theme === 'system' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200'
              "
            >
              <Laptop class="inline-block w-4 h-4 mr-1" />
              Hệ thống
            </button>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="mb-6">
          <h3 class="text-md font-medium text-gray-800 mb-2">Ngôn ngữ</h3>
          <select
            class="block w-full max-w-xs px-4 py-2 border border-gray-200 rounded-md"
            v-model="language"
            @change="changeLanguage"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">Tiếng Anh</option>
          </select>
        </div>

        <!-- Notification Settings -->
        <div class="mb-6">
          <h3 class="text-md font-medium text-gray-800 mb-2">Thông báo</h3>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="form-checkbox h-5 w-5 text-blue-600"
                v-model="notifications.completionNotification"
                @change="saveNotificationSettings"
              />
              <span class="ml-2 text-gray-700">Thông báo khi hoàn thành kiểm tra</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                class="form-checkbox h-5 w-5 text-blue-600"
                v-model="notifications.plagiarismDetected"
                @change="saveNotificationSettings"
              />
              <span class="ml-2 text-gray-700">Thông báo khi phát hiện đạo văn</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                class="form-checkbox h-5 w-5 text-blue-600"
                v-model="notifications.newDocument"
                @change="saveNotificationSettings"
              />
              <span class="ml-2 text-gray-700">Thông báo khi có tài liệu mới</span>
            </label>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="mb-6">
          <h3 class="text-md font-medium text-gray-800 mb-2">Bảo mật</h3>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { User as UserIcon, Camera, AlertCircle, Sun, Moon, Laptop } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { uploadAvatar } from '../api/auth'
import { updateNotificationSettings } from '../api/notifications'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const uploadingAvatar = ref(false)
const theme = ref('light') // Default theme
const language = ref('vi') // Default language
const notifications = ref({
  completionNotification: true,
  plagiarismDetected: true,
  newDocument: false,
})

// Function to get user role display text
const getUserRoleDisplay = () => {
  if (userStore.isLecturer) return 'Giảng viên'
  if (userStore.isStudent) return 'Học sinh'
  if (userStore.isGuest) return 'Khách'
  return 'Không xác định'
}

// Load saved settings on component mount
onMounted(() => {
  // Load theme setting
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
    applyTheme(savedTheme)
  } else {
    // Default to system preference if no saved setting
    theme.value = 'system'
    applyTheme('system')
  }

  // Load language setting
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    language.value = savedLanguage
  }

  // Load notification settings
  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) {
    try {
      notifications.value = JSON.parse(savedNotifications)
    } catch (e) {
      console.error('Error parsing saved notifications:', e)
    }
  }

  // Set up system theme preference listener if using system theme
  if (theme.value === 'system') {
    setupSystemThemeListener()
  }
})

// Watch for theme changes to apply them
watch(theme, (newTheme) => {
  applyTheme(newTheme)
})

// Handle avatar change
const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  console.log('Uploading file:', {
    name: file.name,
    type: file.type,
    size: file.size,
  })

  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)

    // Log formData contents for debugging
    console.log('FormData created with file:', file.name)

    const response = await uploadAvatar(formData)
    console.log('Avatar upload response:', response)

    // Check for avatar URL in the response
    if (response && response.avatar) {
      userStore.setUser({ ...userStore.user, avatar: response.avatar })
      notificationStore.show({
        type: 'success',
        message: 'Ảnh đại diện đã được cập nhật thành công',
      })
    } else {
      console.warn('Avatar URL not found in response:', response)
      notificationStore.show({
        type: 'warning',
        message: 'Cập nhật ảnh đại diện thành công nhưng không thể hiển thị.',
      })
    }
  } catch (error) {
    console.error('Avatar upload failed:', error)
    notificationStore.show({
      type: 'error',
      message: 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.',
    })
  } finally {
    uploadingAvatar.value = false
  }
}

// Function to apply theme to the document
const applyTheme = (selectedTheme) => {
  const html = document.documentElement

  if (selectedTheme === 'system') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.toggle('dark', prefersDark)

    // Toggle body background class
    if (prefersDark) {
      document.body.classList.add('bg-gray-900')
      // Remove light-specific classes that might be causing issues
      document.body.classList.remove('bg-gray-50', 'bg-white')
    } else {
      document.body.classList.remove('bg-gray-900')
    }
  } else if (selectedTheme === 'dark') {
    html.classList.add('dark')
    document.body.classList.add('bg-gray-900')
    // Remove light-specific classes that might be causing issues
    document.body.classList.remove('bg-gray-50', 'bg-white')
  } else {
    // Light theme
    html.classList.remove('dark')
    document.body.classList.remove('bg-gray-900')
  }

  // Add data attribute for additional CSS targeting if needed
  html.setAttribute('data-theme', selectedTheme)
}

// Set up a listener for system theme changes
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // Initial check
  applyTheme('system')

  // Add listener for changes
  const handleChange = (e) => {
    if (theme.value === 'system') {
      applyTheme('system')
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Older browsers
    mediaQuery.addListener(handleChange)
  }
}

// Theme setting function
const setTheme = (newTheme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)

  // If switching to system, set up the listener
  if (newTheme === 'system') {
    setupSystemThemeListener()
  }
}

// Language setting function
const changeLanguage = () => {
  localStorage.setItem('language', language.value)
  // In a real app, you would use i18n to change the language here
}

// Save notification settings
const saveNotificationSettings = async () => {
  // Save to localStorage
  localStorage.setItem('notifications', JSON.stringify(notifications.value))

  // Update notification store settings
  try {
    await updateNotificationSettings(notifications.value)
    console.log('Notification settings updated successfully')
  } catch (error) {
    console.error('Failed to update notification settings:', error)
  }
}
</script>
