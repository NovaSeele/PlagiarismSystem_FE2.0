<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Thông báo</h1>

    <!-- Notifications filters -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeFilter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
        @click="setFilter('all')"
      >
        Tất cả
      </button>
      <button
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeFilter === 'unread'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
        @click="setFilter('unread')"
      >
        Chưa đọc
      </button>
      <button
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeFilter === notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
        @click="setFilter(notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD)"
      >
        Tải lên tài liệu
      </button>
      <button
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeFilter === notificationStore.NOTIFICATION_TYPES.QUEUE_ADD
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
        @click="setFilter(notificationStore.NOTIFICATION_TYPES.QUEUE_ADD)"
      >
        Thêm vào hàng đợi
      </button>
      <button
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeFilter === notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
        ]"
        @click="setFilter(notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE)"
      >
        Hoàn thành kiểm tra
      </button>
    </div>

    <!-- Action buttons -->
    <div class="mb-6 flex justify-between">
      <button
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Đánh dấu tất cả đã đọc
      </button>
      <span v-else></span>

      <button
        v-if="filteredNotifications.length > 0"
        @click="clearAllNotifications"
        class="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
      >
        Xóa tất cả thông báo
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredNotifications.length === 0"
      class="py-16 text-center border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <BellOffIcon :size="48" class="mx-auto text-gray-400 dark:text-gray-500" />
      <h3 class="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        Không có thông báo nào
      </h3>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ getEmptyStateMessage() }}
      </p>
    </div>

    <!-- Notification list -->
    <div v-else class="space-y-4">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-lg border transition-colors',
          notification.read
            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20',
        ]"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0 mr-4">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                getIconBgClass(notification.type),
              ]"
            >
              <component :is="getIconComponent(notification.type)" :size="20" class="text-white" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex justify-between">
              <h3
                :class="[
                  'text-md font-medium',
                  notification.read
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ notificationStore.getNotificationTitle(notification.type) }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(notification.timestamp) }}
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {{ notification.message }}
            </p>

            <!-- Actions -->
            <div class="mt-3 flex space-x-3">
              <button
                @click="handleActionClick(notification)"
                class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {{ getActionText(notification.type) }}
              </button>

              <button
                v-if="!notification.read"
                @click="notificationStore.markAsRead(notification.id)"
                class="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Đánh dấu đã đọc
              </button>

              <button
                @click="deleteNotification(notification.id)"
                class="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="notificationStore.loading" class="py-16 text-center">
      <div
        class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"
      ></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Đang tải thông báo...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="notificationStore.error"
      class="py-16 text-center border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <AlertTriangleIcon :size="48" class="mx-auto text-red-500" />
      <h3 class="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Đã xảy ra lỗi</h3>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ notificationStore.error }}
      </p>
      <button
        @click="notificationStore.getNotifications"
        class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { deleteNotification as apiDeleteNotification } from '../api/notifications'
import {
  Bell as BellIcon,
  BellOff as BellOffIcon,
  FileCheck as FileCheckIcon,
  AlertTriangle as AlertTriangleIcon,
  FileText as FileTextIcon,
  Play as PlayIcon,
  List as ListIcon,
} from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()
const activeFilter = ref('all')

// Fetch notifications when component mounts
onMounted(() => {
  notificationStore.getNotifications()
})

// Filtered notifications based on active filter
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notificationStore.notifications
  } else if (activeFilter.value === 'unread') {
    return notificationStore.notifications.filter((n) => !n.read)
  } else {
    return notificationStore.notifications.filter((n) => n.type === activeFilter.value)
  }
})

// Format timestamp to relative time
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`
  }

  // If older than a week, show date and time
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

// Set active filter
const setFilter = (filter) => {
  activeFilter.value = filter
}

// Get appropriate icon component based on notification type
const getIconComponent = (type) => {
  switch (type) {
    case notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE:
      return FileCheckIcon
    case notificationStore.NOTIFICATION_TYPES.CHECK_START:
      return PlayIcon
    case notificationStore.NOTIFICATION_TYPES.QUEUE_ADD:
      return ListIcon
    case notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
      return FileTextIcon
    default:
      return BellIcon
  }
}

// Get appropriate background color for icon based on notification type
const getIconBgClass = (type) => {
  switch (type) {
    case notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE:
      return 'bg-green-500'
    case notificationStore.NOTIFICATION_TYPES.CHECK_START:
      return 'bg-blue-500'
    case notificationStore.NOTIFICATION_TYPES.QUEUE_ADD:
      return 'bg-purple-500'
    case notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
      return 'bg-indigo-500'
    default:
      return 'bg-gray-500'
  }
}

// Get action text based on notification type
const getActionText = (type) => {
  switch (type) {
    case notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE:
      return 'Xem kết quả'
    case notificationStore.NOTIFICATION_TYPES.CHECK_START:
      return 'Xem trạng thái'
    case notificationStore.NOTIFICATION_TYPES.QUEUE_ADD:
      return 'Xem hàng đợi'
    case notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
      return 'Xem tài liệu'
    default:
      return 'Xem'
  }
}

// Handle action button click
const handleActionClick = (notification) => {
  // Mark as read
  notificationStore.markAsRead(notification.id)

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

// Delete a notification
const deleteNotification = async (notificationId) => {
  try {
    await apiDeleteNotification(notificationId)
    // Remove from store
    const index = notificationStore.notifications.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notificationStore.notifications.splice(index, 1)
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

// Clear all notifications
const clearAllNotifications = () => {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) {
    notificationStore.notifications.splice(0, notificationStore.notifications.length)
    // In a real app, would need to call API to delete all notifications
  }
}

// Get empty state message based on active filter
const getEmptyStateMessage = () => {
  switch (activeFilter.value) {
    case 'all':
      return 'Bạn không có thông báo nào'
    case 'unread':
      return 'Bạn không có thông báo chưa đọc nào'
    case notificationStore.NOTIFICATION_TYPES.CHECK_COMPLETE:
      return 'Bạn không có thông báo về hoàn thành kiểm tra'
    case notificationStore.NOTIFICATION_TYPES.CHECK_START:
      return 'Bạn không có thông báo về bắt đầu kiểm tra'
    case notificationStore.NOTIFICATION_TYPES.QUEUE_ADD:
      return 'Bạn không có thông báo về việc thêm tài liệu vào hàng đợi'
    case notificationStore.NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
      return 'Bạn không có thông báo về tải lên tài liệu'
    default:
      return 'Không có thông báo nào'
  }
}
</script>
