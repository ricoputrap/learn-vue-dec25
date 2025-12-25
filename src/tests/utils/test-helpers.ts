import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { ComponentPublicInstance } from 'vue'

/**
 * Creates and activates a fresh Pinia instance for testing
 * Call this in beforeEach to ensure isolated store state between tests
 */
export function createTestingPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Mount a Vue component with Pinia store support
 * Automatically creates a fresh Pinia instance for each mount
 */
export function mountWithPinia<T extends ComponentPublicInstance>(
  component: any,
  options: any = {}
) {
  const pinia = createTestingPinia()

  return mount(component, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    ...options,
  }) as VueWrapper<T>
}

/**
 * Wait for Vue's next tick and all pending promises
 * Useful for waiting for async operations and DOM updates
 */
export async function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Wait for a condition to be true with timeout
 * Useful for waiting for async state changes
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout exceeded')
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Simulate a delay (useful for testing loading states)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(
  name: string = 'test.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File {
  const blob = new Blob(['mock file content'], { type })
  return new File([blob], name, { type })
}

/**
 * Mock Date.now() to return a consistent timestamp
 * Returns a function to restore the original Date.now()
 */
export function mockDateNow(timestamp: number = 1640000000000): () => void {
  const original = Date.now
  Date.now = () => timestamp

  return () => {
    Date.now = original
  }
}

/**
 * Extract text content from a wrapper element
 */
export function getTextContent(wrapper: VueWrapper, selector: string): string {
  const element = wrapper.find(selector)
  return element.exists() ? element.text() : ''
}

/**
 * Check if an element is disabled
 */
export function isDisabled(wrapper: VueWrapper, selector: string): boolean {
  const element = wrapper.find(selector)
  return element.exists() ? element.element.hasAttribute('disabled') : false
}
