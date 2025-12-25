import { describe, it, expect, beforeEach, vi } from 'vitest'
import { askQuestion } from './api'
import {
  mockAskQuestionSuccess,
  mockAskQuestionSuccessNested,
  mockAskQuestionError,
  mockAskQuestionEmptyAnswer,
  mockFetchNetworkError,
  restoreFetch,
} from './tests/utils/mock-api'
import { ASK_ENDPOINT } from './config'

describe('api.ts - askQuestion', () => {
  beforeEach(() => {
    restoreFetch()
  })

  describe('Successful requests', () => {
    it('should return answer for valid question', async () => {
      const mockAnswer = 'This is a test answer'
      mockAskQuestionSuccess(mockAnswer)

      const result = await askQuestion('What is this about?')

      expect(result.answer).toBe(mockAnswer)
      expect(result.question).toBeDefined()
    })

    it('should handle nested answer object', async () => {
      const mockAnswer = 'Nested answer'
      mockAskQuestionSuccessNested(mockAnswer)

      const result = await askQuestion('Test question')

      expect(result.answer).toBe(mockAnswer)
    })

    it('should use default file ID when not provided', async () => {
      mockAskQuestionSuccess('Answer')

      const result = await askQuestion('Question')

      expect(result.fileId).toBe('9dc50dff')
    })

    it('should use custom file ID when provided', async () => {
      const customFileId = 'custom-file-123'
      mockAskQuestionSuccess('Answer')

      const result = await askQuestion('Question', customFileId)

      expect(result.fileId).toBe(customFileId)
    })

    it('should call fetch with correct parameters', async () => {
      const mockFetch = mockAskQuestionSuccess('Answer')
      const question = 'Test question'
      const fileId = 'test-file-id'

      await askQuestion(question, fileId)

      expect(mockFetch).toHaveBeenCalledWith(
        ASK_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            file_id: fileId,
            question,
          }),
        })
      )
    })

    it('should trim whitespace from question', async () => {
      const mockFetch = mockAskQuestionSuccess('Answer')
      const question = '  Question with spaces  '

      await askQuestion(question)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.question).toBe('Question with spaces')
    })
  })

  describe('Error handling', () => {
    it('should throw error for empty question', async () => {
      await expect(askQuestion('')).rejects.toThrow('Question is empty')
    })

    it('should throw error for whitespace-only question', async () => {
      await expect(askQuestion('   ')).rejects.toThrow('Question is empty')
    })

    it('should throw error when response is not ok', async () => {
      const errorMessage = 'Server error occurred'
      mockAskQuestionError(errorMessage)

      await expect(askQuestion('Question')).rejects.toThrow(errorMessage)
    })

    it('should throw error when answer is empty', async () => {
      mockAskQuestionEmptyAnswer()

      await expect(askQuestion('Question')).rejects.toThrow(
        'No answer returned from server'
      )
    })

    it('should throw error when answer is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      await expect(askQuestion('Question')).rejects.toThrow(
        'No answer returned from server'
      )
    })

    it('should handle network errors', async () => {
      mockFetchNetworkError('Network failure')

      await expect(askQuestion('Question')).rejects.toThrow('Network failure')
    })

    it('should handle malformed JSON response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })
      global.fetch = mockFetch

      // Should handle gracefully by returning empty object
      await expect(askQuestion('Question')).rejects.toThrow(
        'No answer returned from server'
      )
    })

    it('should use status text when response text fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('Cannot read text')
        },
      })
      global.fetch = mockFetch

      await expect(askQuestion('Question')).rejects.toThrow(
        'Request failed with status 500'
      )
    })
  })

  describe('Response handling', () => {
    it('should extract question from response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          question: 'Returned question',
          answer: 'Answer',
          file_id: 'file-123',
        }),
      })
      global.fetch = mockFetch

      const result = await askQuestion('Original question')

      expect(result.question).toBe('Returned question')
    })

    it('should use original question if not in response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: 'Answer',
        }),
      })
      global.fetch = mockFetch

      const originalQuestion = 'My question'
      const result = await askQuestion(originalQuestion)

      expect(result.question).toBe(originalQuestion)
    })

    it('should extract message from response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: 'Answer',
          message: 'Success message',
        }),
      })
      global.fetch = mockFetch

      const result = await askQuestion('Question')

      expect(result.message).toBe('Success message')
    })

    it('should handle missing optional fields', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: 'Just the answer',
        }),
      })
      global.fetch = mockFetch

      const result = await askQuestion('Question', 'custom-file')

      expect(result.answer).toBe('Just the answer')
      expect(result.fileId).toBe('custom-file')
      expect(result.message).toBeUndefined()
    })
  })
})
