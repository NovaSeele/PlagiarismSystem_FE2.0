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

/**
 * Compare two PDF files by their filenames
 * Returns detailed plagiarism detection results
 * @param {string} file1_name - Name of the first PDF file
 * @param {string} file2_name - Name of the second PDF file
 * @returns {Promise<Object>} - Detailed plagiarism detection results
 */
export const comparePdfsByName = async (file1_name, file2_name) => {
  try {
    const response = await api.post('/compare-pdfs-by-name', {
      file1_name,
      file2_name,
    })
    return response.data
  } catch (error) {
    console.error('Error comparing PDFs:', error)
    throw error
  }
}
