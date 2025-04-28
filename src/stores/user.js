import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentUser } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)
  const error = ref(null)

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      user.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      const userData = await getCurrentUser()
      user.value = userData
    } catch (err) {
      console.error('Error fetching user:', err)
      // Only clear user data if the error is authentication related
      if (err.message === 'Unauthorized' || (err.response && err.response.status === 401)) {
        user.value = null
        localStorage.removeItem('token')
        error.value = 'Session expired. Please login again.'
      } else {
        // For network errors, keep the user logged in if we have a token
        error.value = 'Could not connect to server. Using cached session.'
      }
    } finally {
      loading.value = false
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('token')
  }

  // Initialize user from local storage if possible
  const initFromLocalStorage = () => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser && localStorage.getItem('token')) {
      try {
        user.value = JSON.parse(cachedUser)
      } catch (e) {
        console.error('Failed to parse cached user:', e)
      }
    }
  }

  // Save user to local storage for persistence
  const saveToLocalStorage = () => {
    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Initialize from localStorage on store creation
  initFromLocalStorage()

  return {
    user,
    isAuthenticated,
    loading,
    error,
    fetchUser,
    setUser,
    clearUser,
    saveToLocalStorage,
  }
})
