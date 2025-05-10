import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mocking modules trước khi import
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      get: vi.fn(),
    },
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    get: vi.fn(),
  }
})

// Import modules sau khi mock
import * as config from '../config'
import axios from 'axios'

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

describe('config.js', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()

    // Reset any environment variables
    vi.stubEnv('VITE_API_URL', '')

    // Mock console methods to prevent logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getApiUrl', () => {
    it('returns environment variable URL when available', () => {
      const testUrl = 'http://test-env-api.com'
      vi.stubEnv('VITE_API_URL', testUrl)

      expect(config.getApiUrl()).toBe(testUrl)
    })

    it('returns stored ngrok URL when no env variable but localStorage has URL', () => {
      const storedUrl = 'http://stored-ngrok-url.com'
      localStorage.getItem.mockReturnValueOnce(storedUrl)

      expect(config.getApiUrl()).toBe(storedUrl)
      expect(localStorage.getItem).toHaveBeenCalledWith('ngrok_api_url')
    })

    it('returns default localhost URL when neither env nor localStorage has URL', () => {
      localStorage.getItem.mockReturnValueOnce(null)

      expect(config.getApiUrl()).toBe('http://localhost:8888')
    })
  })

  describe('setApiUrl', () => {
    it('stores URL in localStorage', () => {
      const testUrl = 'http://new-ngrok-url.com'
      config.setApiUrl(testUrl)

      expect(localStorage.setItem).toHaveBeenCalledWith('ngrok_api_url', testUrl)
    })
  })

  describe('fetchNgrokUrl', () => {
    it('successfully fetches and stores ngrok URL', async () => {
      const mockUrl = 'http://new-ngrok-12345.io'
      axios.get.mockResolvedValueOnce({ data: { url: mockUrl } })

      const result = await config.fetchNgrokUrl()

      expect(result).toBe(mockUrl)
      expect(localStorage.setItem).toHaveBeenCalledWith('ngrok_api_url', mockUrl)
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/ngrok-url'))
    })

    it('returns null when API response does not contain URL', async () => {
      axios.get.mockResolvedValueOnce({ data: {} })

      const result = await config.fetchNgrokUrl()

      expect(result).toBeNull()
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('returns null and handles errors when fetch fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await config.fetchNgrokUrl()

      expect(result).toBeNull()
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('createApiInstance', () => {
    it('creates an axios instance with the correct base URL', () => {
      vi.stubEnv('VITE_API_URL', 'http://test-api.com')

      const instance = config.createApiInstance()

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://test-api.com',
          withCredentials: true,
        }),
      )
      expect(instance).toBeDefined()
    })

    it('adds authorization token to requests when available', () => {
      // Mock the interceptor
      const requestUse = vi.fn()
      const responseUse = vi.fn()

      // Mock axios create to return our mock interceptors
      axios.create.mockReturnValue({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })

      // Create the API instance
      config.createApiInstance()

      // Get the request interceptor function
      const requestInterceptor = requestUse.mock.calls[0][0]

      // Test with token
      localStorage.getItem.mockReturnValueOnce('test-token')
      const configWithToken = { headers: {} }
      const result = requestInterceptor(configWithToken)

      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('does not add authorization token when not available', () => {
      // Mock the interceptor
      const requestUse = vi.fn()
      const responseUse = vi.fn()

      // Mock axios create
      axios.create.mockReturnValue({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })

      // Create the API instance
      config.createApiInstance()

      // Get the request interceptor function
      const requestInterceptor = requestUse.mock.calls[0][0]

      // Test without token
      localStorage.getItem.mockReturnValueOnce(null)
      const configWithoutToken = { headers: {}, url: '/test' }
      const result = requestInterceptor(configWithoutToken)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('handles 401 errors appropriately in response interceptor', () => {
      // Mock the interceptor
      const requestUse = vi.fn()
      const responseUse = vi.fn()

      // Mock axios create
      axios.create.mockReturnValue({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })

      // Create the API instance
      config.createApiInstance()

      // Get the response error handler
      const responseErrorHandler = responseUse.mock.calls[0][1]

      // Create a 401 error
      const error = {
        response: { status: 401 },
        config: { url: '/test-url' },
      }

      // Expect the error to be rejected
      expect(() => responseErrorHandler(error)).rejects.toEqual(error)
      expect(console.error).toHaveBeenCalled()
    })

    it('handles 422 validation errors appropriately', () => {
      // Mock the interceptor
      const requestUse = vi.fn()
      const responseUse = vi.fn()

      // Mock axios create
      axios.create.mockReturnValue({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })

      // Create the API instance
      config.createApiInstance()

      // Get the response error handler
      const responseErrorHandler = responseUse.mock.calls[0][1]

      // Create a 422 error
      const error = {
        response: {
          status: 422,
          data: { detail: 'Validation failed' },
        },
        config: { url: '/test-url' },
      }

      // Expect the error to be rejected
      expect(() => responseErrorHandler(error)).rejects.toEqual(error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('api instance', () => {
    it('exports a configured axios instance', () => {
      // Đảm bảo rằng api đã được export
      expect(config.api).toBeDefined()
    })
  })
})
