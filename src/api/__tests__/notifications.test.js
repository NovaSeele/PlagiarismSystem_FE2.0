import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as notifications from '../notifications'
import axios from 'axios'
import { getApiUrl } from '../config'

// Mock axios and config
vi.mock('axios')
vi.mock('../config', () => ({
  getApiUrl: vi.fn(),
}))

describe('notifications.js', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value
      }),
      removeItem: vi.fn((key) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  global.localStorage = localStorageMock

  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()

    // Mock getApiUrl to return test API URL
    getApiUrl.mockReturnValue('http://test-api.com')

    // Mock console methods to prevent logs during tests
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('fetchNotifications', () => {
    it('returns data from API on successful call', async () => {
      const mockNotifications = [
        { id: 1, type: 'document_upload', message: 'User uploaded document', read: false },
        { id: 2, type: 'check_complete', message: 'Check completed', read: true },
      ]

      axios.get.mockResolvedValueOnce({ data: mockNotifications })
      localStorage.getItem.mockReturnValueOnce('test-token')

      const result = await notifications.fetchNotifications()

      expect(result).toEqual(mockNotifications)
      expect(axios.get).toHaveBeenCalledWith(
        'http://test-api.com/notifications',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })

    it('returns mock data when API call fails', async () => {
      const error = new Error('API error')
      axios.get.mockRejectedValueOnce(error)

      const result = await notifications.fetchNotifications()

      // Check that it returned mock data (not empty array)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('type')
      expect(result[0]).toHaveProperty('message')
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('markNotificationAsRead', () => {
    it('calls API correctly on successful call', async () => {
      const notificationId = 123
      const mockResponse = { data: { success: true } }

      axios.put.mockResolvedValueOnce(mockResponse)
      localStorage.getItem.mockReturnValueOnce('test-token')

      const result = await notifications.markNotificationAsRead(notificationId)

      expect(result).toEqual(mockResponse.data)
      expect(axios.put).toHaveBeenCalledWith(
        `http://test-api.com/notifications/${notificationId}/read`,
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })

    it('returns success object when API call fails', async () => {
      const notificationId = 123
      const error = new Error('API error')

      axios.put.mockRejectedValueOnce(error)

      const result = await notifications.markNotificationAsRead(notificationId)

      expect(result).toEqual({ success: true })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('markAllNotificationsAsRead', () => {
    it('calls API correctly on successful call', async () => {
      const mockResponse = { data: { success: true } }

      axios.put.mockResolvedValueOnce(mockResponse)
      localStorage.getItem.mockReturnValueOnce('test-token')

      const result = await notifications.markAllNotificationsAsRead()

      expect(result).toEqual(mockResponse.data)
      expect(axios.put).toHaveBeenCalledWith(
        'http://test-api.com/notifications/read-all',
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })

    it('returns success object when API call fails', async () => {
      const error = new Error('API error')

      axios.put.mockRejectedValueOnce(error)

      const result = await notifications.markAllNotificationsAsRead()

      expect(result).toEqual({ success: true })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('deleteNotification', () => {
    it('calls API correctly on successful call', async () => {
      const notificationId = 123
      const mockResponse = { data: { success: true } }

      axios.delete.mockResolvedValueOnce(mockResponse)
      localStorage.getItem.mockReturnValueOnce('test-token')

      const result = await notifications.deleteNotification(notificationId)

      expect(result).toEqual(mockResponse.data)
      expect(axios.delete).toHaveBeenCalledWith(
        `http://test-api.com/notifications/${notificationId}`,
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })

    it('returns success object when API call fails', async () => {
      const notificationId = 123
      const error = new Error('API error')

      axios.delete.mockRejectedValueOnce(error)

      const result = await notifications.deleteNotification(notificationId)

      expect(result).toEqual({ success: true })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('updateNotificationSettings', () => {
    it('calls API correctly on successful call', async () => {
      const settings = {
        email_notifications: true,
        push_notifications: false,
      }
      const mockResponse = { data: { success: true, settings } }

      axios.put.mockResolvedValueOnce(mockResponse)
      localStorage.getItem.mockReturnValueOnce('test-token')

      const result = await notifications.updateNotificationSettings(settings)

      expect(result).toEqual(mockResponse.data)
      expect(axios.put).toHaveBeenCalledWith(
        'http://test-api.com/user/notification-settings',
        settings,
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        }),
      )
    })

    it('returns success object with settings when API call fails', async () => {
      const settings = {
        email_notifications: true,
        push_notifications: false,
      }
      const error = new Error('API error')

      axios.put.mockRejectedValueOnce(error)

      const result = await notifications.updateNotificationSettings(settings)

      expect(result).toEqual({ success: true, settings })
      expect(console.warn).toHaveBeenCalled()
    })
  })
})
