import type { ChatMessage, UploadedPdf, UploadStatus } from '../../types'

/**
 * Generate a mock chat message
 */
export function createMockMessage(
  overrides: Partial<ChatMessage> = {}
): ChatMessage {
  return {
    id: 'mock-id-123',
    sender: 'Test User',
    text: 'This is a test message',
    createdAt: Date.now(),
    ...overrides,
  }
}

/**
 * Generate multiple mock chat messages
 */
export function createMockMessages(count: number = 3): ChatMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `mock-id-${index}`,
    sender: index % 2 === 0 ? 'You' : 'System',
    text: `Test message ${index + 1}`,
    createdAt: Date.now() + index * 1000,
  }))
}

/**
 * Generate a mock uploaded PDF
 */
export function createMockPdf(
  overrides: Partial<UploadedPdf> = {}
): UploadedPdf {
  return {
    name: 'test-document.pdf',
    size: 1024 * 500, // 500KB
    uploadedAt: Date.now(),
    path: '/uploads/test-document.pdf',
    id: 'pdf-123',
    message: 'Upload successful',
    ...overrides,
  }
}

/**
 * Generate mock API response for askQuestion
 */
export function createMockAskResponse(
  overrides: Partial<{
    question: string
    file_id: string
    message: string
    answer: string | { answer: string }
  }> = {}
) {
  return {
    question: 'What is this document about?',
    file_id: '9dc50dff',
    message: 'Success',
    answer: 'This document is about testing Vue applications.',
    ...overrides,
  }
}

/**
 * Generate mock API error response
 */
export function createMockErrorResponse(message: string = 'Server error') {
  return {
    error: message,
    status: 500,
  }
}

/**
 * Generate mock upload response
 */
export function createMockUploadResponse(
  overrides: Partial<{
    filename: string
    message: string
    file: { id: string; name: string; url: string }
  }> = {}
) {
  return {
    filename: 'test-document.pdf',
    message: 'File uploaded successfully',
    file: {
      id: 'pdf-123',
      name: 'test-document.pdf',
      url: '/uploads/test-document.pdf',
    },
    ...overrides,
  }
}

/**
 * Mock upload status values
 */
export const MOCK_UPLOAD_STATUSES: Record<string, UploadStatus> = {
  idle: 'idle',
  uploading: 'uploading',
  success: 'success',
  error: 'error',
}

/**
 * Generate mock FormData for testing
 */
export function createMockFormData(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

/**
 * Mock file for testing uploads
 */
export function createMockFile(
  name: string = 'test.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File {
  const blob = new Blob(['mock PDF content'], { type })
  return new File([blob], name, { type })
}

/**
 * Generate mock fetch Response object
 */
export function createMockResponse(
  body: any,
  options: {
    ok?: boolean
    status?: number
    statusText?: string
  } = {}
): Response {
  const { ok = true, status = 200, statusText = 'OK' } = options

  return {
    ok,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body),
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
