import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as store from '../plagiarismResults'

describe('plagiarismResults.js', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value
      }),
      removeItem: vi.fn((key) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()

  global.localStorage = localStorageMock

  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()

    // Mock console methods to prevent logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('saveResults', () => {
    it('saves results to localStorage with default type', () => {
      const mockResults = {
        documentId: '123',
        score: 85,
        matches: [{ source: 'doc1', similarity: 0.85 }],
      }

      store.saveResults(mockResults)

      expect(localStorage.setItem).toHaveBeenCalledTimes(2)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'plagiarism_results',
        JSON.stringify(mockResults),
      )
      expect(localStorage.setItem).toHaveBeenCalledWith('latest_result_type', 'queue')
    })

    it('saves results to localStorage with specified type', () => {
      const mockResults = {
        documentId: '123',
        score: 85,
        matches: [{ source: 'doc1', similarity: 0.85 }],
      }

      store.saveResults(mockResults, 'all')

      expect(localStorage.setItem).toHaveBeenCalledTimes(2)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'plagiarism_results',
        JSON.stringify(mockResults),
      )
      expect(localStorage.setItem).toHaveBeenCalledWith('latest_result_type', 'all')
    })

    it('handles error when localStorage throws', () => {
      const mockResults = { documentId: '123' }

      // Simulate error when setting item
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })

      store.saveResults(mockResults)

      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getResults', () => {
    it('returns null when no results exist', () => {
      localStorage.getItem.mockReturnValueOnce(null)

      const results = store.getResults()

      expect(results).toBeNull()
      expect(localStorage.getItem).toHaveBeenCalledWith('plagiarism_results')
    })

    it('returns parsed results when they exist', () => {
      const mockResults = {
        documentId: '123',
        score: 85,
        matches: [{ source: 'doc1', similarity: 0.85 }],
      }

      localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockResults))

      const results = store.getResults()

      expect(results).toEqual(mockResults)
      expect(localStorage.getItem).toHaveBeenCalledWith('plagiarism_results')
    })

    it('handles parsing error and returns null', () => {
      // Invalid JSON
      localStorage.getItem.mockReturnValueOnce('{invalid-json')

      const results = store.getResults()

      expect(results).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('getLatestResultType', () => {
    it('returns the stored result type', () => {
      localStorage.getItem.mockReturnValueOnce('queue')

      const type = store.getLatestResultType()

      expect(type).toBe('queue')
      expect(localStorage.getItem).toHaveBeenCalledWith('latest_result_type')
    })

    it('returns "all" as default when no type stored', () => {
      localStorage.getItem.mockReturnValueOnce(null)

      const type = store.getLatestResultType()

      expect(type).toBe('all')
    })
  })

  describe('clearResults', () => {
    it('removes both items from localStorage', () => {
      store.clearResults()

      expect(localStorage.removeItem).toHaveBeenCalledTimes(2)
      expect(localStorage.removeItem).toHaveBeenCalledWith('plagiarism_results')
      expect(localStorage.removeItem).toHaveBeenCalledWith('latest_result_type')
    })
  })

  describe('default export', () => {
    it('exports all functions', () => {
      expect(store.default).toEqual({
        saveResults: store.saveResults,
        getResults: store.getResults,
        getLatestResultType: store.getLatestResultType,
        clearResults: store.clearResults,
      })
    })
  })
})
