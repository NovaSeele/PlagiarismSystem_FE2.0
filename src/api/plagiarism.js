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

/**
 * Check plagiarism for all documents in database
 * Returns comparison results for all document pairs
 * @returns {Promise<Object>} - Results of plagiarism detection for all documents
 */
export const checkAllDocuments = async () => {
  try {
    const response = await api.get('/auto-layered-detection-debug')
    return response.data
  } catch (error) {
    console.error('Error checking all documents:', error)
    throw error
  }
}

/**
 * Check plagiarism for specific documents by their filenames
 * @param {Array<string>} filenames - Array of document filenames to check (without .pdf extension)
 * @returns {Promise<Object>} - Results of plagiarism detection for the specified documents
 */
export const checkDocumentsByNames = async (filenames) => {
  try {
    const response = await api.post('/auto-layered-detection-by-names', {
      filenames,
    })
    return response.data
  } catch (error) {
    console.error('Error checking documents by names:', error)
    throw error
  }
}
