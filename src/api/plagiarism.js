import { api } from './config'

// Removed the hard-coded API_URL and direct axios.create since we're using the config now

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

/**
 * Add documents to the plagiarism check queue
 * @param {Array<string>} documentIds - Array of document IDs to add to the queue
 * @returns {Promise<Object>} - Response confirming documents were added to queue
 */
export const queueDocumentsForPlagiarismCheck = async (documentIds) => {
  try {
    const response = await api.post('/plagiarism/queue-documents', {
      ids: documentIds,
    })
    return response.data
  } catch (error) {
    console.error('Error adding documents to plagiarism queue:', error)
    throw error
  }
}
