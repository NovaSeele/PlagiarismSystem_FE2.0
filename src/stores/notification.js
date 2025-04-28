import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)
  const userStore = useUserStore()
  const loading = ref(false)
  const error = ref(null)

  // Notification types
  const NOTIFICATION_TYPES = {
    DOCUMENT_UPLOAD: 'document_upload',
    QUEUE_ADD: 'queue_add',
    CHECK_START: 'check_start',
    CHECK_COMPLETE: 'check_complete',
  }

  // Fetch notifications from API
  const getNotifications = async () => {
    if (!userStore.isAuthenticated) return

    loading.value = true
    error.value = null

    try {
      const response = await fetchNotifications()
      notifications.value = response
    } catch (err) {
      console.error('Error fetching notifications:', err)
      error.value = 'Không thể tải thông báo. Vui lòng thử lại sau.'
    } finally {
      loading.value = false
    }
  }

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true

      try {
        await markNotificationAsRead(notificationId)
      } catch (err) {
        console.error('Error marking notification as read:', err)
        // Revert change on failure
        notification.read = false
      }
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.value.filter((n) => !n.read)
    if (unreadNotifications.length === 0) return

    // Optimistically update UI
    unreadNotifications.forEach((notification) => {
      notification.read = true
    })

    try {
      await markAllNotificationsAsRead()
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      // Revert changes on failure
      unreadNotifications.forEach((notification) => {
        notification.read = false
      })
    }
  }

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.DOCUMENT_UPLOAD:
        return 'Tài liệu mới'
      case NOTIFICATION_TYPES.QUEUE_ADD:
        return 'Thêm vào hàng đợi'
      case NOTIFICATION_TYPES.CHECK_START:
        return 'Bắt đầu kiểm tra'
      case NOTIFICATION_TYPES.CHECK_COMPLETE:
        return 'Kiểm tra hoàn tất'
      default:
        return 'Thông báo'
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    NOTIFICATION_TYPES,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationTitle,
  }
})
