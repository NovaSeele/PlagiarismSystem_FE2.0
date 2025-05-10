import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as plagiarism from '../plagiarism'
import { api } from '../config'

// Mock the API module
vi.mock('../config', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('plagiarism.js', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    // Mock console methods to prevent logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('comparePdfsByName', () => {
    it('calls API correctly and returns response data', async () => {
      const file1_name = 'document1'
      const file2_name = 'document2'
      const mockResponse = {
        data: {
          score: 75,
          matches: [{ page: 1, similarity: 0.8, text: 'Matched text' }],
        },
      }

      api.post.mockResolvedValueOnce(mockResponse)

      const result = await plagiarism.comparePdfsByName(file1_name, file2_name)

      expect(result).toEqual(mockResponse.data)
      expect(api.post).toHaveBeenCalledWith('/compare-pdfs-by-name', {
        file1_name,
        file2_name,
      })
    })

    it('throws error when API call fails', async () => {
      const file1_name = 'document1'
      const file2_name = 'document2'
      const error = new Error('API error')

      api.post.mockRejectedValueOnce(error)

      await expect(plagiarism.comparePdfsByName(file1_name, file2_name)).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('checkAllDocuments', () => {
    it('calls API correctly and returns response data', async () => {
      const mockResponse = {
        data: {
          results: [
            { doc1: 'file1', doc2: 'file2', score: 85 },
            { doc1: 'file1', doc2: 'file3', score: 35 },
          ],
        },
      }

      api.get.mockResolvedValueOnce(mockResponse)

      const result = await plagiarism.checkAllDocuments()

      expect(result).toEqual(mockResponse.data)
      expect(api.get).toHaveBeenCalledWith('/auto-layered-detection-debug')
    })

    it('throws error when API call fails', async () => {
      const error = new Error('API error')

      api.get.mockRejectedValueOnce(error)

      await expect(plagiarism.checkAllDocuments()).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('checkDocumentsByNames', () => {
    it('calls API correctly and returns response data', async () => {
      const filenames = ['document1', 'document2', 'document3']
      const mockResponse = {
        data: {
          results: [
            { doc1: 'document1', doc2: 'document2', score: 75 },
            { doc1: 'document1', doc2: 'document3', score: 35 },
          ],
        },
      }

      api.post.mockResolvedValueOnce(mockResponse)

      const result = await plagiarism.checkDocumentsByNames(filenames)

      expect(result).toEqual(mockResponse.data)
      expect(api.post).toHaveBeenCalledWith('/auto-layered-detection-by-names', {
        filenames,
      })
    })

    it('throws error when API call fails', async () => {
      const filenames = ['document1', 'document2', 'document3']
      const error = new Error('API error')

      api.post.mockRejectedValueOnce(error)

      await expect(plagiarism.checkDocumentsByNames(filenames)).rejects.toThrow(error)
      expect(console.error).toHaveBeenCalled()
    })
  })
})
