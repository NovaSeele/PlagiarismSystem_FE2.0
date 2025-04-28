// Notification API service
import axios from 'axios'
import { getApiUrl } from './config'

// Get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Sample data for when API is not available
const getMockNotifications = () => {
  return [
    {
      id: 1,
      type: 'document_upload',
      message: 'Người dùng "{username}" đã tải lên tài liệu "{filename}"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      read: false,
    },
    {
      id: 2,
      type: 'queue_add',
      message: 'Tài liệu "{tên tài liệu.pdf}" đã được thêm vào hàng đợi kiểm tra',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
    },
    {
      id: 3,
      type: 'check_start',
      message: 'Bắt đầu kiểm tra đạo văn cho tài liệu "{tên tài liệu.pdf}"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      read: false,
    },
    {
      id: 4,
      type: 'check_complete',
      message: 'Kiểm tra đạo văn cho tài liệu "{tên tài liệu.pdf}" đã hoàn thành',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: false,
    },
  ]
}

/**
 * Fetch notifications for the current user
 * @returns {Promise<Array>} - Array of notification objects
 */
export const fetchNotifications = async () => {
  try {
    // Get current API URL
    const API_URL = getApiUrl()
    // Try to fetch from API
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader(),
    })
    return response.data
  } catch (error) {
    console.warn('API not available, using mock data for notifications:', error)
    // Return mock data when API fails
    return getMockNotifications()
  }
}

/**
 * Mark a notification as read
 * @param {number} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} - Response object
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: getAuthHeader() },
    )
    return response.data
  } catch (error) {
    console.warn('API not available, simulating mark as read:', error)
    // Just succeed silently when API is not available
    return { success: true }
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} - Response object
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: getAuthHeader() },
    )
    return response.data
  } catch (error) {
    console.warn('API not available, simulating mark all as read:', error)
    // Just succeed silently when API is not available
    return { success: true }
  }
}

/**
 * Delete a notification
 * @param {number} notificationId - ID of the notification to delete
 * @returns {Promise<Object>} - Response object
 */
export const deleteNotification = async (notificationId) => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: getAuthHeader(),
    })
    return response.data
  } catch (error) {
    console.warn('API not available, simulating delete notification:', error)
    // Just succeed silently when API is not available
    return { success: true }
  }
}

/**
 * Update user notification settings
 * @param {Object} settings - Notification settings object
 * @returns {Promise<Object>} - Response object with updated settings
 */
export const updateNotificationSettings = async (settings) => {
  try {
    const API_URL = getApiUrl()
    const response = await axios.put(`${API_URL}/user/notification-settings`, settings, {
      headers: getAuthHeader(),
    })
    return response.data
  } catch (error) {
    console.warn('API not available, simulating settings update:', error)
    // Just succeed silently when API is not available
    return { success: true, settings }
  }
}
