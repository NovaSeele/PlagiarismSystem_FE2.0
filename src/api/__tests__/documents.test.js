import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as documents from '../documents'
import { api } from '../config'

// Mock the API module
vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('documents.js', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    // Mock console methods to prevent logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getAllDocuments', () => {
    it('returns documents data on successful API call', async () => {
      const mockDocuments = [
        { _id: '1', title: 'Document 1' },
        { _id: '2', title: 'Document 2' },
      ]

      api.get.mockResolvedValueOnce({ data: mockDocuments })

      const result = await documents.getAllDocuments()

      expect(result).toEqual(mockDocuments)
      expect(api.get).toHaveBeenCalledWith('/get_all_pdf_contents')
    })

    it('throws error when API call fails', async () => {
      const error = new Error('API error')
      api.get.mockRejectedValueOnce(error)

      await expect(documents.getAllDocuments()).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getDocumentById', () => {
    it('returns specific document when found', async () => {
      const documentId = '2'
      const mockDocuments = [
        { _id: '1', title: 'Document 1' },
        { _id: '2', title: 'Document 2' },
      ]

      api.get.mockResolvedValueOnce({ data: mockDocuments })

      const result = await documents.getDocumentById(documentId)

      expect(result).toEqual(mockDocuments[1])
      expect(api.get).toHaveBeenCalledWith('/get_all_pdf_contents')
    })

    it('throws error when document not found', async () => {
      const documentId = '3'
      const mockDocuments = [
        { _id: '1', title: 'Document 1' },
        { _id: '2', title: 'Document 2' },
      ]

      api.get.mockResolvedValueOnce({ data: mockDocuments })

      await expect(documents.getDocumentById(documentId)).rejects.toThrow('Document not found')
    })

    it('throws error when API call fails', async () => {
      const documentId = '1'
      const error = new Error('API error')

      api.get.mockRejectedValueOnce(error)

      await expect(documents.getDocumentById(documentId)).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('uploadDocument', () => {
    it('uploads file and returns response data', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const mockResponse = { data: { id: '123', filename: 'test.pdf' } }

      api.post.mockResolvedValueOnce(mockResponse)

      const result = await documents.uploadDocument(mockFile)

      expect(result).toEqual(mockResponse.data)
      expect(api.post).toHaveBeenCalledWith(
        '/upload_file',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      )

      // Verify FormData was created correctly
      const formDataArg = api.post.mock.calls[0][1]
      expect(formDataArg instanceof FormData).toBe(true)
    })

    it('throws error when upload fails', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const error = new Error('Upload failed')

      api.post.mockRejectedValueOnce(error)

      await expect(documents.uploadDocument(mockFile)).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })
})
