import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

// Mock the auth API
vi.mock('../../api/auth', () => {
  return {
    getCurrentUser: vi.fn(),
  }
})

// Import the mocked function
import { getCurrentUser } from '../../api/auth'

describe('User Store', () => {
  // Global localStorage mock
  let localStorageMock = {}

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())

    // Reset localStorage mock for each test
    localStorageMock = {}

    // Create a proper localStorage mock each time
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => localStorageMock[key] || null),
        setItem: vi.fn((key, value) => {
          localStorageMock[key] = value
        }),
        removeItem: vi.fn((key) => {
          delete localStorageMock[key]
        }),
      },
      writable: true,
    })

    // Reset all mocks
    vi.clearAllMocks()
  })

  it('initializes with null user when no token in localStorage', () => {
    // No need to override mock - our localStorage is empty by default

    const store = useUserStore()
    expect(store.user).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('initializes with user from localStorage when token exists', () => {
    // Set up localStorage with token and user data
    localStorageMock.token = 'fake-token'
    localStorageMock.user = JSON.stringify({ id: 1, full_name: 'Test User' })

    const store = useUserStore()

    // The store should initialize from localStorage
    expect(store.user).toEqual({ id: 1, full_name: 'Test User' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('clears user and removes token from localStorage on clearUser', () => {
    const store = useUserStore()
    store.user = { id: 1, full_name: 'Test User' }

    store.clearUser()

    expect(store.user).toBe(null)
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('sets user data with setUser method', () => {
    const store = useUserStore()
    const userData = { id: 2, full_name: 'New User' }

    store.setUser(userData)

    expect(store.user).toEqual(userData)
    expect(store.isAuthenticated).toBe(true)
  })

  it('fetches user successfully when token exists', async () => {
    // Mock the API response
    const userData = { id: 1, full_name: 'Fetched User' }
    getCurrentUser.mockResolvedValue(userData)

    // Setup localStorage with token
    localStorageMock.token = 'fake-token'

    const store = useUserStore()
    await store.fetchUser()

    expect(getCurrentUser).toHaveBeenCalled()
    expect(store.user).toEqual(userData)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('handles 401 error by clearing user data', async () => {
    // Mock an unauthorized error
    const error = new Error('Unauthorized')
    error.response = { status: 401 }
    getCurrentUser.mockRejectedValue(error)

    // Setup localStorage with token
    localStorageMock.token = 'fake-token'

    const store = useUserStore()
    store.user = { id: 1, full_name: 'Test User' }

    await store.fetchUser()

    expect(store.user).toBe(null)
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Session expired. Please login again.')
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('handles network errors without clearing user data', async () => {
    // Mock a network error
    const networkError = new Error('Network error')
    getCurrentUser.mockRejectedValue(networkError)

    // Setup localStorage with token
    localStorageMock.token = 'fake-token'

    const store = useUserStore()
    const userData = { id: 1, full_name: 'Test User' }
    store.user = userData

    await store.fetchUser()

    // User data should still be present
    expect(store.user).toEqual(userData)
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Could not connect to server. Using cached session.')
    expect(localStorage.removeItem).not.toHaveBeenCalledWith('token')
  })

  it('saves user data to localStorage', () => {
    const store = useUserStore()
    const userData = { id: 1, full_name: 'Test User' }
    store.user = userData

    store.saveToLocalStorage()

    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData))
  })

  it('removes user data from localStorage when user is null', () => {
    const store = useUserStore()
    store.user = null

    store.saveToLocalStorage()

    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
  })
})
