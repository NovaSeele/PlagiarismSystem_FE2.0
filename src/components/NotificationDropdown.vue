<template>
  <div class="relative">
    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
    >
      <div
        class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-200">Thông báo</h3>
        <div class="flex space-x-2">
          <button
            v-if="notificationStore.unreadCount > 0"
            @click="notificationStore.markAllAsRead"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="notificationStore.notifications.length === 0" class="py-6 text-center">
          <BellOffIcon :size="24" class="mx-auto text-gray-400 dark:text-gray-500" />
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Không có thông báo nào</p>
        </div>

        <div v-else>
          <!-- Notification items -->
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
            :class="[
              'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
              { 'bg-blue-50 dark:bg-blue-900/20': !notification.read },
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start">
              <!-- Notification icon based on type -->
              <div class="flex-shrink-0 mr-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    getIconBgClass(notification.type),
                  ]"
                >
                  <component
                    :is="getIconComponent(notification.type)"
                    :size="16"
                    class="text-white"
                  />
                </div>
              </div>

              <!-- Notification content -->
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-sm font-medium',
                    notification.read
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-900 dark:text-white',
                  ]"
                >
                  {{ notificationStore.getNotificationTitle(notification.type) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ formatTime(notification.timestamp) }}
                </p>
              </div>

              <!-- Unread indicator -->
              <div v-if="!notification.read" class="ml-2 flex-shrink-0">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <router-link
          to="/notifications"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline block text-center"
        >
          Xem tất cả thông báo
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useNotificationStore } from '../stores/notification'
import {
  Bell as BellIcon,
  BellOff as BellOffIcon,
  FileCheck as FileCheckIcon,
  AlertTriangle as AlertTriangleIcon,
  FileText as FileTextIcon,
  Play as PlayIcon,
  List as ListIcon,
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'clicked'])

const notificationStore = useNotificationStore()

// Format timestamp to relative time (e.g. "5 minutes ago")
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
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }

  // If older than 30 days, show the date
  return date.toLocaleDateString('vi-VN')
}

// Get the appropriate icon component based on notification type
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

// Get the background color class for the icon based on notification type
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

// Handle notification click
const handleNotificationClick = (notification) => {
  // Mark as read
  notificationStore.markAsRead(notification.id)

  // Close dropdown
  emit('close')

  // Emit clicked event with notification data
  emit('clicked', notification)
}
</script>
