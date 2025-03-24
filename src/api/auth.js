import axios from 'axios'

const API_URL = 'http://localhost:8888'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = async (usernameOrEmail, password) => {
  try {
    console.log('before axios', usernameOrEmail, password)

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
    } else {
      console.error('Error occurred during login:', error.message)
    }
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
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

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
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
