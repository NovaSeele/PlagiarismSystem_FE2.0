import axios from 'axios'
import { api, getApiUrl } from './config'

// Check if we should use mock data (helpful for development without backend)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false

// Mock user data
const MOCK_USER = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
  msv: 'CT123456',
  role: 'student',
  avatar: null,
}

export const login = async (usernameOrEmail, password) => {
  if (USE_MOCK) {
    console.log('Using mock login')

    // Kiểm tra username và password không được để trống
    if (!usernameOrEmail || !password) {
      const error = new Error('Validation error')
      error.response = {
        status: 422,
        data: {
          detail: !usernameOrEmail ? 'Tên đăng nhập là bắt buộc' : 'Mật khẩu là bắt buộc',
        },
      }
      throw error
    }

    // Kiểm tra thông tin đăng nhập
    if (usernameOrEmail !== 'test_user' && password !== 'password123') {
      const error = new Error('Invalid credentials')
      error.response = {
        status: 401,
        data: {
          detail: 'Tên đăng nhập hoặc mật khẩu không đúng',
        },
      }
      throw error
    }

    const mockToken = 'mock_token_' + Math.random().toString(36).substring(2)
    localStorage.setItem('token', mockToken)
    return mockToken
  }

  try {
    const API_URL = getApiUrl()
    const response = await axios.post(
      API_URL + '/token',
      {
        username: usernameOrEmail,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    const { access_token } = response.data
    return access_token
  } catch (error) {
    if (error.response) {
      console.error('Login failed:', error.response.data.detail)

      // Đảm bảo format lỗi đúng với kỳ vọng của test
      if (error.response.status === 422) {
        // Validation error
        const fieldErrors = error.response.data.detail || []

        // Tìm lỗi liên quan đến username hoặc password
        const usernameError = fieldErrors.find((e) => e.loc.includes('username'))
        const passwordError = fieldErrors.find((e) => e.loc.includes('password'))

        if (usernameError) {
          error.message = 'Tên đăng nhập là bắt buộc'
        } else if (passwordError) {
          error.message = 'Mật khẩu là bắt buộc'
        }
      } else if (error.response.status === 401) {
        error.message = 'Tên đăng nhập hoặc mật khẩu không đúng'
      }
    } else {
      console.error('Error occurred during login:', error.message)
    }
    throw error
  }
}

export const register = async (userData) => {
  if (USE_MOCK) {
    console.log('Using mock register')
    return { success: true, user: { ...MOCK_USER, ...userData } }
  }

  try {
    const response = await api.post('/register', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const getCurrentUser = async () => {
  if (USE_MOCK) {
    console.log('Using mock user data')
    // Check if token exists to simulate authentication
    const token = localStorage.getItem('token')
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error('Unauthorized')
    }
    return MOCK_USER
  }

  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    // For network errors, check if token exists and return mock user
    // to prevent logging out on API unavailability
    if (!error.response && localStorage.getItem('token')) {
      console.warn('API unavailable, using cached authentication')
      return MOCK_USER
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    throw error.response?.data || error.message
  }
}

export const updateMSV = async (msv) => {
  try {
    const response = await api.post('/add-msv', { msv })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const uploadAvatar = async (formData) => {
  try {
    const response = await api.post('/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Upload avatar error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error.response?.data || error.message
  }
}

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.put('/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}
