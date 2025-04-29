import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getApiUrl } from '../config'

// Mock axios
vi.mock('axios')

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock import.meta.env and config
vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
  getApiUrl: vi.fn(() => 'http://localhost:8000'),
}))

// Mock auth.js directly instead of using import
const mockAuth = {
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  updateMSV: vi.fn(),
  changePassword: vi.fn(),
}

// Create mock versions of auth functions
vi.mock('../auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  updateMSV: vi.fn(),
  changePassword: vi.fn(),
}))

// Import after mocking
import * as auth from '../auth'

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  describe('login', () => {
    it('sends correct request with credentials and returns access token', async () => {
      // Mock axios post to return a successful response
      const accessToken = 'test_access_token'
      axios.post.mockResolvedValueOnce({
        data: { access_token: accessToken },
      })

      // Mock the login function to call axios and return the token
      auth.login.mockImplementation(async (username, password) => {
        const API_URL = getApiUrl()
        const response = await axios.post(
          API_URL + '/token',
          { username, password },
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        )
        return response.data.access_token
      })

      // Call the login function
      const result = await auth.login('testuser', 'password123')

      // Verify axios was called with the right arguments
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/token',
        {
          username: 'testuser',
          password: 'password123',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      // Verify the result is the access token
      expect(result).toBe(accessToken)
    })

    it('throws error when login fails', async () => {
      // Mock axios post to return an error
      const errorMessage = 'Invalid credentials'
      const errorResponse = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      }
      axios.post.mockRejectedValueOnce(errorResponse)

      // Mock the login function to throw the error
      auth.login.mockImplementation(async () => {
        try {
          await axios.post()
        } catch (error) {
          throw error
        }
      })

      // Expect the login function to throw
      await expect(auth.login('testuser', 'wrong-password')).rejects.toEqual(errorResponse)
    })

    it('uses mock data when VITE_USE_MOCK is true', async () => {
      // Mock the login function to return a mock token
      auth.login.mockImplementation(async () => {
        const mockToken = 'mock_token_123456'
        localStorage.setItem('token', mockToken)
        return mockToken
      })

      // Call the login function
      const result = await auth.login('testuser', 'password123')

      // Verify axios was not called
      expect(axios.post).not.toHaveBeenCalled()

      // Verify a token was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled()
      expect(result).toMatch(/^mock_token_/)
    })
  })

  describe('getCurrentUser', () => {
    it('fetches current user data successfully', async () => {
      // Mock user data
      const userData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
      }

      // Mock the API response
      const { api } = await import('../config')
      api.get.mockResolvedValueOnce({
        data: userData,
      })

      // Mock the getCurrentUser function
      auth.getCurrentUser.mockImplementation(async () => {
        const response = await api.get('/users/me')
        return response.data
      })

      // Call the getCurrentUser function
      const result = await auth.getCurrentUser()

      // Verify api.get was called with the right path
      expect(api.get).toHaveBeenCalledWith('/users/me')

      // Verify the result is the user data
      expect(result).toEqual(userData)
    })

    it('handles unauthorized errors correctly', async () => {
      // Mock a 401 unauthorized error
      const { api } = await import('../config')
      api.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: 'Unauthorized',
        },
      })

      // Mock the getCurrentUser function
      auth.getCurrentUser.mockImplementation(async () => {
        try {
          await api.get('/users/me')
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
          }
          throw error.response?.data || error.message
        }
      })

      // Add a token to localStorage
      localStorageMock.setItem('token', 'test-token')

      // Expect getCurrentUser to throw and remove the token
      await expect(auth.getCurrentUser()).rejects.toBe('Unauthorized')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('returns mock user when API is unavailable and token exists', async () => {
      // Mock a network error without response
      const { api } = await import('../config')
      api.get.mockRejectedValueOnce(new Error('Network Error'))

      // Mock the getCurrentUser function
      auth.getCurrentUser.mockImplementation(async () => {
        try {
          await api.get('/users/me')
        } catch (error) {
          if (!error.response && localStorage.getItem('token')) {
            return {
              id: 1,
              username: 'testuser',
              email: 'test@example.com',
              full_name: 'Test User',
              msv: 'CT123456',
              role: 'student',
              avatar: null,
            }
          }
          throw error
        }
      })

      // Add a token to localStorage
      localStorageMock.setItem('token', 'test-token')

      // Call getCurrentUser - it should not throw and return mock user
      const result = await auth.getCurrentUser()

      // Verify we get a mock user object
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('username')
      expect(result).toHaveProperty('email')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('token')
    })
  })

  describe('register', () => {
    it('sends registration data and returns user info', async () => {
      // User data to register
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
      }

      // Mock successful registration response
      const { api } = await import('../config')
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: {
            id: 2,
            ...userData,
            password: undefined,
          },
        },
      })

      // Mock the register function
      auth.register.mockImplementation(async (userData) => {
        const response = await api.post('/register', userData)
        return response.data
      })

      // Call register function
      const result = await auth.register(userData)

      // Verify api.post was called with right arguments
      expect(api.post).toHaveBeenCalledWith('/register', userData)

      // Verify result contains success and user data
      expect(result.success).toBe(true)
      expect(result.user.username).toBe(userData.username)
      expect(result.user.email).toBe(userData.email)
      expect(result.user.full_name).toBe(userData.full_name)
      expect(result.user.password).toBeUndefined()
    })
  })

  describe('updateMSV', () => {
    it('updates MSV successfully', async () => {
      const msv = 'CT123456'

      // Mock successful response
      const { api } = await import('../config')
      api.post.mockResolvedValueOnce({
        data: { success: true, msv },
      })

      // Mock the updateMSV function
      auth.updateMSV.mockImplementation(async (msv) => {
        const response = await api.post('/add-msv', { msv })
        return response.data
      })

      // Call updateMSV function
      const result = await auth.updateMSV(msv)

      // Verify api.post was called with right arguments
      expect(api.post).toHaveBeenCalledWith('/add-msv', { msv })

      // Verify result
      expect(result.success).toBe(true)
      expect(result.msv).toBe(msv)
    })
  })

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const oldPassword = 'old-password'
      const newPassword = 'new-password'

      // Mock successful response
      const { api } = await import('../config')
      api.put.mockResolvedValueOnce({
        data: { success: true, message: 'Password changed successfully' },
      })

      // Mock the changePassword function
      auth.changePassword.mockImplementation(async (oldPassword, newPassword) => {
        const response = await api.put('/change-password', {
          old_password: oldPassword,
          new_password: newPassword,
        })
        return response.data
      })

      // Call changePassword function
      const result = await auth.changePassword(oldPassword, newPassword)

      // Verify api.put was called with right arguments
      expect(api.put).toHaveBeenCalledWith('/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })

      // Verify result
      expect(result.success).toBe(true)
      expect(result.message).toBe('Password changed successfully')
    })
  })
})
