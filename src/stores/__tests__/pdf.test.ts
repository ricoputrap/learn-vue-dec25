import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePdfStore } from '../pdf'
import {
  mockUploadSuccess,
  mockUploadError,
  mockUploadMalformed,
  mockFetchNetworkError,
  restoreFetch,
} from '../../tests/utils/mock-api'
import { createMockFile } from '../../tests/utils/mock-data'
import { UPLOAD_ENDPOINT } from '../../config'

describe('stores/pdf.ts - usePdfStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance before each test
    setActivePinia(createPinia())
    restoreFetch()
  })

  describe('Initial state', () => {
    it('should have idle status initially', () => {
      const store = usePdfStore()

      expect(store.status).toBe('idle')
    })

    it('should have null error initially', () => {
      const store = usePdfStore()

      expect(store.error).toBeNull()
    })

    it('should have null activePdf initially', () => {
      const store = usePdfStore()

      expect(store.activePdf).toBeNull()
    })

    it('should have isUploading false initially', () => {
      const store = usePdfStore()

      expect(store.isUploading).toBe(false)
    })
  })

  describe('upload action - success', () => {
    it('should upload file successfully', async () => {
      const store = usePdfStore()
      const file = createMockFile('test.pdf', 1024)
      mockUploadSuccess('test.pdf', 'pdf-123')

      await store.upload(file)

      expect(store.status).toBe('success')
      expect(store.error).toBeNull()
      expect(store.activePdf).not.toBeNull()
    })

    it('should set activePdf with correct data', async () => {
      const store = usePdfStore()
      const file = createMockFile('document.pdf', 2048)
      mockUploadSuccess('document.pdf', 'pdf-456')

      await store.upload(file)

      expect(store.activePdf?.name).toBe('document.pdf')
      expect(store.activePdf?.size).toBe(2048)
      expect(store.activePdf?.id).toBe('pdf-456')
      expect(store.activePdf?.path).toBe('/uploads/document.pdf')
    })

    it('should set uploadedAt timestamp', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      const beforeTime = Date.now()
      mockUploadSuccess()

      await store.upload(file)

      const afterTime = Date.now()
      expect(store.activePdf?.uploadedAt).toBeGreaterThanOrEqual(beforeTime)
      expect(store.activePdf?.uploadedAt).toBeLessThanOrEqual(afterTime)
    })

    it('should call fetch with correct endpoint', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      const mockFetch = mockUploadSuccess()

      await store.upload(file)

      expect(mockFetch).toHaveBeenCalledWith(
        UPLOAD_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should send FormData with file', async () => {
      const store = usePdfStore()
      const file = createMockFile('my-doc.pdf')
      const mockFetch = mockUploadSuccess()

      await store.upload(file)

      expect(mockFetch).toHaveBeenCalled()
      const callArgs = mockFetch.mock.calls[0]
      const formData = callArgs[1].body
      expect(formData).toBeInstanceOf(FormData)
    })

    it('should use fallback filename from file when response missing name', async () => {
      const store = usePdfStore()
      const file = createMockFile('fallback.pdf', 1024)

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          file: {
            id: 'pdf-123',
            url: '/uploads/fallback.pdf',
            // name is missing
          },
        }),
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.activePdf?.name).toBe('fallback.pdf')
    })

    it('should preserve file size in activePdf', async () => {
      const store = usePdfStore()
      const fileSize = 5000
      const file = createMockFile('test.pdf', fileSize)
      mockUploadSuccess()

      await store.upload(file)

      expect(store.activePdf?.size).toBe(fileSize)
    })

    it('should extract message from response', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Upload completed successfully',
          file: {
            id: 'pdf-123',
            name: 'test.pdf',
            url: '/uploads/test.pdf',
          },
        }),
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.activePdf?.message).toBe('Upload completed successfully')
    })
  })

  describe('upload action - loading states', () => {
    it('should set status to uploading during upload', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      let statusDuringUpload = ''
      const mockFetch = vi.fn().mockImplementation(async () => {
        statusDuringUpload = store.status
        return {
          ok: true,
          json: async () => ({
            file: { id: 'pdf-123', name: 'test.pdf', url: '/uploads/test.pdf' },
          }),
        }
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(statusDuringUpload).toBe('uploading')
    })

    it('should set isUploading to true during upload', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      let isUploadingDuring = false
      const mockFetch = vi.fn().mockImplementation(async () => {
        isUploadingDuring = store.isUploading
        return {
          ok: true,
          json: async () => ({
            file: { id: 'pdf-123', name: 'test.pdf', url: '/uploads/test.pdf' },
          }),
        }
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(isUploadingDuring).toBe(true)
    })

    it('should set isUploading to false after success', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadSuccess()

      await store.upload(file)

      expect(store.isUploading).toBe(false)
    })

    it('should set isUploading to false after error', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadError('Upload failed')

      await store.upload(file)

      expect(store.isUploading).toBe(false)
    })

    it('should clear error before upload', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      // Set an error first
      store.error = 'Previous error'

      mockUploadSuccess()
      await store.upload(file)

      expect(store.error).toBeNull()
    })
  })

  describe('upload action - error handling', () => {
    it('should handle HTTP error response', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadError('Server error')

      await store.upload(file)

      expect(store.status).toBe('error')
      expect(store.error).toContain('Server error')
    })

    it('should handle network error', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockFetchNetworkError('Network failure')

      await store.upload(file)

      expect(store.status).toBe('error')
      expect(store.error).toBe('Network failure')
    })

    it('should handle malformed response', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadMalformed()

      await store.upload(file)

      // Should still succeed with fallback values
      expect(store.status).toBe('success')
      expect(store.activePdf).not.toBeNull()
    })

    it('should use default error message for unknown errors', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockRejectedValue('Not an Error object')
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.status).toBe('error')
      expect(store.error).toBe('Upload failed. Please try again.')
    })

    it('should extract error message from response text', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'File too large',
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.error).toBe('File too large')
    })

    it('should use statusText as fallback when text() fails', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('Cannot read text')
        },
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.error).toBe('Internal Server Error')
    })

    it('should use "Upload failed" when no error details available', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: '',
        text: async () => {
          throw new Error('Cannot read text')
        },
      })
      global.fetch = mockFetch

      await store.upload(file)

      expect(store.error).toBe('Upload failed')
    })
  })

  describe('upload action - edge cases', () => {
    it('should do nothing when file is null', async () => {
      const store = usePdfStore()

      await store.upload(null as any)

      expect(store.status).toBe('idle')
      expect(store.activePdf).toBeNull()
    })

    it('should do nothing when file is undefined', async () => {
      const store = usePdfStore()

      await store.upload(undefined as any)

      expect(store.status).toBe('idle')
      expect(store.activePdf).toBeNull()
    })

    it('should handle JSON parsing error gracefully', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })
      global.fetch = mockFetch

      await store.upload(file)

      // Should handle gracefully with empty object
      expect(store.status).toBe('success')
      expect(store.activePdf?.name).toBe('test.pdf') // Fallback to file name
    })

    it('should handle multiple uploads sequentially', async () => {
      const store = usePdfStore()
      const file1 = createMockFile('first.pdf')
      const file2 = createMockFile('second.pdf')

      mockUploadSuccess('first.pdf', 'pdf-1')
      await store.upload(file1)

      mockUploadSuccess('second.pdf', 'pdf-2')
      await store.upload(file2)

      expect(store.activePdf?.name).toBe('second.pdf')
      expect(store.activePdf?.id).toBe('pdf-2')
    })

    it('should replace previous PDF on new upload', async () => {
      const store = usePdfStore()
      const file1 = createMockFile('old.pdf')
      const file2 = createMockFile('new.pdf')

      mockUploadSuccess('old.pdf', 'pdf-old')
      await store.upload(file1)
      const firstPdfId = store.activePdf?.id

      mockUploadSuccess('new.pdf', 'pdf-new')
      await store.upload(file2)

      expect(store.activePdf?.id).toBe('pdf-new')
      expect(store.activePdf?.id).not.toBe(firstPdfId)
    })
  })

  describe('reset action', () => {
    it('should reset status to idle', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadSuccess()

      await store.upload(file)
      expect(store.status).toBe('success')

      store.reset()

      expect(store.status).toBe('idle')
    })

    it('should clear error', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadError('Some error')

      await store.upload(file)
      expect(store.error).not.toBeNull()

      store.reset()

      expect(store.error).toBeNull()
    })

    it('should clear activePdf', async () => {
      const store = usePdfStore()
      const file = createMockFile()
      mockUploadSuccess()

      await store.upload(file)
      expect(store.activePdf).not.toBeNull()

      store.reset()

      expect(store.activePdf).toBeNull()
    })

    it('should reset all state properties', () => {
      const store = usePdfStore()

      // Set some state
      store.status = 'success'
      store.error = 'Some error'
      store.activePdf = {
        name: 'test.pdf',
        size: 1024,
        uploadedAt: Date.now(),
      }

      store.reset()

      expect(store.status).toBe('idle')
      expect(store.error).toBeNull()
      expect(store.activePdf).toBeNull()
    })

    it('should be idempotent', () => {
      const store = usePdfStore()

      store.reset()
      store.reset()
      store.reset()

      expect(store.status).toBe('idle')
      expect(store.error).toBeNull()
      expect(store.activePdf).toBeNull()
    })

    it('should allow upload after reset', async () => {
      const store = usePdfStore()
      const file = createMockFile()

      mockUploadSuccess('first.pdf', 'pdf-1')
      await store.upload(file)

      store.reset()

      mockUploadSuccess('second.pdf', 'pdf-2')
      await store.upload(file)

      expect(store.status).toBe('success')
      expect(store.activePdf).not.toBeNull()
    })
  })

  describe('isUploading computed', () => {
    it('should return true when status is uploading', () => {
      const store = usePdfStore()
      store.status = 'uploading'

      expect(store.isUploading).toBe(true)
    })

    it('should return false when status is idle', () => {
      const store = usePdfStore()
      store.status = 'idle'

      expect(store.isUploading).toBe(false)
    })

    it('should return false when status is success', () => {
      const store = usePdfStore()
      store.status = 'success'

      expect(store.isUploading).toBe(false)
    })

    it('should return false when status is error', () => {
      const store = usePdfStore()
      store.status = 'error'

      expect(store.isUploading).toBe(false)
    })

    it('should be reactive to status changes', () => {
      const store = usePdfStore()

      expect(store.isUploading).toBe(false)

      store.status = 'uploading'
      expect(store.isUploading).toBe(true)

      store.status = 'success'
      expect(store.isUploading).toBe(false)
    })
  })

  describe('Type safety', () => {
    it('should have correct status type', () => {
      const store = usePdfStore()

      const validStatuses: Array<typeof store.status> = [
        'idle',
        'uploading',
        'success',
        'error',
      ]

      validStatuses.forEach((status) => {
        store.status = status
        expect(store.status).toBe(status)
      })
    })

    it('should have correct activePdf structure when set', async () => {
      const store = usePdfStore()
      const file = createMockFile('test.pdf', 1024)
      mockUploadSuccess()

      await store.upload(file)

      expect(store.activePdf).toMatchObject({
        name: expect.any(String),
        size: expect.any(Number),
        uploadedAt: expect.any(Number),
      })
    })
  })
})
