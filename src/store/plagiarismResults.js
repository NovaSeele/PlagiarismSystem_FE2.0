/**
 * Store for managing plagiarism check results
 * Uses localStorage to persist data across page navigations
 */

const STORAGE_KEY = 'plagiarism_results'
const LATEST_RESULT_TYPE_KEY = 'latest_result_type' // 'queue' or 'all'

/**
 * Save plagiarism check results to localStorage
 * @param {Object} results - The plagiarism check results
 * @param {string} type - The type of check: 'queue' or 'all'
 */
export const saveResults = (results, type = 'queue') => {
  try {
    // Save the results
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))

    // Save the type of result (queue or all)
    localStorage.setItem(LATEST_RESULT_TYPE_KEY, type)
  } catch (error) {
    console.error('Error saving plagiarism results:', error)
  }
}

/**
 * Get plagiarism check results from localStorage
 * @returns {Object|null} The saved results or null if none exists
 */
export const getResults = () => {
  try {
    const results = localStorage.getItem(STORAGE_KEY)
    return results ? JSON.parse(results) : null
  } catch (error) {
    console.error('Error retrieving plagiarism results:', error)
    return null
  }
}

/**
 * Get the type of the latest result (queue or all)
 * @returns {string} 'queue', 'all', or '' if none
 */
export const getLatestResultType = () => {
  return localStorage.getItem(LATEST_RESULT_TYPE_KEY) || ''
}

/**
 * Clear saved plagiarism results
 */
export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LATEST_RESULT_TYPE_KEY)
}

export default {
  saveResults,
  getResults,
  getLatestResultType,
  clearResults,
}
