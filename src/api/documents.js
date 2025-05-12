import { api } from './config'

// Get all documents
export const getAllDocuments = async () => {
  try {
    const response = await api.get('/get_all_pdf_contents')
    return response.data
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

// Get single document by ID
export const getDocumentById = async (id) => {
  try {
    const response = await api.get('/get_all_pdf_contents')
    const document = response.data.find((doc) => doc._id === id)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  } catch (error) {
    console.error('Error fetching document:', error)
    throw error
  }
}

// Upload document
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/delete_pdf/${documentId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}

// Delete multiple documents
export const deleteMultipleDocuments = async (documentIds) => {
  try {
    const results = await Promise.all(documentIds.map(id => deleteDocument(id)))
    return results
  } catch (error) {
    console.error('Error deleting multiple documents:', error)
    throw error
  }
}
