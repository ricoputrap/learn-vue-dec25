import { vi } from 'vitest'
import { createMockResponse, createMockAskResponse, createMockUploadResponse } from './mock-data'

/**
 * Mock fetch to return a successful response
 */
export function mockFetchSuccess(responseData: any) {
  const mockFetch = vi.fn().mockResolvedValue(createMockResponse(responseData))
  global.fetch = mockFetch
  return mockFetch
}

/**
 * Mock fetch to return an error response
 */
export function mockFetchError(
  errorMessage: string = 'Network error',
  status: number = 500
) {
  const mockFetch = vi.fn().mockResolvedValue(
    createMockResponse(
      { error: errorMessage },
      { ok: false, status, statusText: errorMessage }
    )
  )
  global.fetch = mockFetch
  return mockFetch
}

/**
 * Mock fetch to throw a network error
 */
export function mockFetchNetworkError(errorMessage: string = 'Network error') {
  const mockFetch = vi.fn().mockRejectedValue(new Error(errorMessage))
  global.fetch = mockFetch
  return mockFetch
}

/**
 * Mock fetch for askQuestion API success
 */
export function mockAskQuestionSuccess(answer: string = 'Mock answer') {
  return mockFetchSuccess(
    createMockAskResponse({
      answer,
    })
  )
}

/**
 * Mock fetch for askQuestion API with nested answer object
 */
export function mockAskQuestionSuccessNested(answer: string = 'Mock answer') {
  return mockFetchSuccess(
    createMockAskResponse({
      answer: { answer },
    })
  )
}

/**
 * Mock fetch for askQuestion API error
 */
export function mockAskQuestionError(errorMessage: string = 'Failed to get answer') {
  return mockFetchError(errorMessage, 500)
}

/**
 * Mock fetch for askQuestion API with empty answer
 */
export function mockAskQuestionEmptyAnswer() {
  return mockFetchSuccess(
    createMockAskResponse({
      answer: '',
    })
  )
}

/**
 * Mock fetch for PDF upload success
 */
export function mockUploadSuccess(
  filename: string = 'test.pdf',
  fileId: string = 'pdf-123'
) {
  return mockFetchSuccess(
    createMockUploadResponse({
      filename,
      file: {
        id: fileId,
        name: filename,
        url: `/uploads/${filename}`,
      },
    })
  )
}

/**
 * Mock fetch for PDF upload error
 */
export function mockUploadError(errorMessage: string = 'Upload failed') {
  return mockFetchError(errorMessage, 500)
}

/**
 * Mock fetch for PDF upload with malformed response
 */
export function mockUploadMalformed() {
  return mockFetchSuccess({
    // Missing expected fields
    unexpected: 'data',
  })
}

/**
 * Create a spy on fetch without mocking the implementation
 */
export function spyOnFetch() {
  const spy = vi.spyOn(global, 'fetch')
  return spy
}

/**
 * Restore fetch to its original implementation
 */
export function restoreFetch() {
  if (vi.isMockFunction(global.fetch)) {
    vi.restoreAllMocks()
  }
}

/**
 * Mock fetch with custom implementation
 */
export function mockFetchWith(implementation: (...args: any[]) => any) {
  const mockFetch = vi.fn(implementation)
  global.fetch = mockFetch
  return mockFetch
}

/**
 * Mock fetch to resolve after a delay (for testing loading states)
 */
export function mockFetchWithDelay(responseData: any, delayMs: number = 100) {
  const mockFetch = vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(createMockResponse(responseData))
        }, delayMs)
      })
  )
  global.fetch = mockFetch
  return mockFetch
}

/**
 * Assert that fetch was called with specific parameters
 */
export function expectFetchCalledWith(
  mockFetch: ReturnType<typeof vi.fn>,
  url: string,
  options?: {
    method?: string
    headers?: Record<string, string>
    body?: any
  }
) {
  expect(mockFetch).toHaveBeenCalledWith(
    url,
    expect.objectContaining({
      method: options?.method,
      headers: options?.headers ? expect.objectContaining(options.headers) : undefined,
      body: options?.body,
    })
  )
}

/**
 * Create a mock Response that rejects JSON parsing
 */
export function createMalformedJsonResponse(): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => {
      throw new Error('Invalid JSON')
    },
    text: async () => 'Not valid JSON',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: function () {
      return this
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response
}
