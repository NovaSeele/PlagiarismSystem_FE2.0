import axios from 'axios'

// URL storage in localStorage for persistence
const NGROK_URL_KEY = 'ngrok_api_url'
const DEFAULT_API_URL = 'http://localhost:8888'

/**
 * Get the current API URL, with priority:
 * 1. Environment variable VITE_API_URL if set
 * 2. Stored ngrok URL in localStorage if available
 * 3. Default localhost URL as fallback
 */
export const getApiUrl = () => {
  // First priority: Environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Second priority: Stored ngrok URL from localStorage
  const storedUrl = localStorage.getItem(NGROK_URL_KEY)
  if (storedUrl) {
    return storedUrl
  }

  // Fallback to default localhost URL
  return DEFAULT_API_URL
}

/**
 * Set the ngrok API URL in localStorage
 */
export const setApiUrl = (url) => {
  localStorage.setItem(NGROK_URL_KEY, url)
}

/**
 * Try to fetch the latest ngrok URL from the backend
 * This should be called when the app starts
 * @returns {Promise<string>} - The fetched ngrok URL or null if fetch failed
 */
export const fetchNgrokUrl = async () => {
  try {
    // We need to use the current API URL for this initial fetch
    const currentApiUrl = getApiUrl()
    const response = await axios.get(`${currentApiUrl}/api/ngrok-url`)

    if (response.data && response.data.url) {
      // Store the new URL in localStorage
      setApiUrl(response.data.url)
      console.log(`Updated API URL to: ${response.data.url}`)
      return response.data.url
    }
    return null
  } catch (error) {
    console.error('Failed to fetch ngrok URL:', error)
    return null
  }
}

/**
 * Create an axios instance with the current API URL
 * @returns {AxiosInstance} Configured axios instance
 */
export const createApiInstance = () => {
  const apiUrl = getApiUrl()

  // Log for debugging
  console.log('Creating API instance with URL:', apiUrl)

  const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  })

  // Add request interceptor to add token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Log for debugging
      console.log('Added auth token to request:', config.url)
    } else {
      console.warn('No auth token found for request:', config.url)
    }
    return config
  })

  // Add response interceptor for logging errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error('Authentication failed for request:', error.config.url)
        // You might want to redirect to login page or refresh token
      } else if (error.response && error.response.status === 422) {
        console.error('Validation error for request:', error.config.url, error.response.data)
      }
      return Promise.reject(error)
    },
  )

  return api
}

// Export default API instance for use in other modules
export const api = createApiInstance()
