import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Configure Vue Test Utils
config.global.mocks = {
  // Add global mocks here if needed
}

// Mock fetch globally
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})
