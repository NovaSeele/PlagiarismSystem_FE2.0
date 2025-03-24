import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentUser } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      user.value = null
      return
    }

    try {
      const userData = await getCurrentUser()
      user.value = userData
    } catch (error) {
      user.value = null
      localStorage.removeItem('token')
      console.error('Error fetching user:', error)
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    isAuthenticated,
    fetchUser,
    setUser,
    clearUser,
  }
})
