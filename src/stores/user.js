import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentUser, isLecturer as checkIsLecturer, isGuest as checkIsGuest } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties for role-based access
  const isStudent = computed(() => isAuthenticated.value && user.value?.role === 'student')
  const isLecturer = computed(() => isAuthenticated.value && user.value?.role === 'lecturer')
  const isGuest = computed(() => isAuthenticated.value && user.value?.role === 'guest')

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
        localStorage.removeItem('userRole')
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

    // Save role in localStorage if available
    if (userData?.role) {
      localStorage.setItem('userRole', userData.role)
    }
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
  }

  // Initialize user from local storage if possible
  const initFromLocalStorage = () => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser && localStorage.getItem('token')) {
      try {
        user.value = JSON.parse(cachedUser)

        // If role not in cached user but in localStorage, add it
        if (!user.value.role && localStorage.getItem('userRole')) {
          user.value.role = localStorage.getItem('userRole')
        }
      } catch (e) {
        console.error('Failed to parse cached user:', e)
      }
    }
  }

  // Save user to local storage for persistence
  const saveToLocalStorage = () => {
    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
      if (user.value.role) {
        localStorage.setItem('userRole', user.value.role)
      }
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
    }
  }

  // Check if user can perform a specific action based on role
  const hasPermission = (requiredRole) => {
    if (!isAuthenticated.value) return false

    // Lecturer has access to everything
    if (isLecturer.value) return true

    // Guest users have access to most features
    if (isGuest.value) {
      // If specifically requiring a lecturer, guests don't have access
      if (requiredRole === 'lecturer') return false

      // Otherwise, guests have access to everything else
      return true
    }

    // If specifically requiring a lecturer, student doesn't have access
    if (requiredRole === 'lecturer') return false

    // For student-level permissions, all roles have access
    return true
  }

  // Initialize from localStorage on store creation
  initFromLocalStorage()

  return {
    user,
    isAuthenticated,
    isStudent,
    isLecturer,
    isGuest,
    loading,
    error,
    fetchUser,
    setUser,
    clearUser,
    saveToLocalStorage,
    hasPermission,
  }
})
