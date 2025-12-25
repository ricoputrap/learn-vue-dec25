import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatActions } from '../useChatActions'
import { useChatStore } from '../../stores/chat'
import {
  mockAskQuestionSuccess,
  mockAskQuestionError,
  mockFetchNetworkError,
  restoreFetch,
} from '../../tests/utils/mock-api'
import { flushPromises } from '../../tests/utils/test-helpers'

describe('composables/useChatActions.ts - useChatActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    restoreFetch()
  })

  describe('Initial state', () => {
    it('should return handleSend function', () => {
      const { handleSend } = useChatActions()

      expect(handleSend).toBeTypeOf('function')
    })

    it('should return isThinking ref', () => {
      const { isThinking } = useChatActions()

      expect(isThinking).toBeDefined()
      expect(isThinking.value).toBe(false)
    })

    it('should have isThinking false initially', () => {
      const { isThinking } = useChatActions()

      expect(isThinking.value).toBe(false)
    })
  })

  describe('handleSend - successful flow', () => {
    it('should add user message immediately', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('System response')

      await handleSend('User question')

      const messages = chatStore.messages
      expect(messages.length).toBeGreaterThan(0)
      expect(messages[0].sender).toBe('You')
      expect(messages[0].text).toBe('User question')
    })

    it('should call API with question text', async () => {
      const { handleSend } = useChatActions()
      const mockFetch = mockAskQuestionSuccess('Answer')

      await handleSend('Test question')

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should add system response after API call', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const expectedAnswer = 'This is the system response'
      mockAskQuestionSuccess(expectedAnswer)

      await handleSend('Question')
      await flushPromises()

      const messages = chatStore.messages
      const systemMessage = messages.find((m) => m.sender === 'System')
      expect(systemMessage).toBeDefined()
      expect(systemMessage?.text).toBe(expectedAnswer)
    })

    it('should add both user and system messages', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer')

      await handleSend('Question')

      expect(chatStore.messages.length).toBe(2)
      expect(chatStore.messages[0].sender).toBe('You')
      expect(chatStore.messages[1].sender).toBe('System')
    })

    it('should preserve message order', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer')

      await handleSend('Question')

      const orderedMessages = chatStore.orderedMessages
      expect(orderedMessages[0].sender).toBe('You')
      expect(orderedMessages[1].sender).toBe('System')
    })
  })

  describe('handleSend - isThinking state', () => {
    it('should set isThinking to true during API call', async () => {
      const { handleSend, isThinking } = useChatActions()
      let thinkingDuringCall = false

      const mockFetch = vi.fn().mockImplementation(async () => {
        thinkingDuringCall = isThinking.value
        return {
          ok: true,
          json: async () => ({ answer: 'Response' }),
        }
      })
      global.fetch = mockFetch

      await handleSend('Question')

      expect(thinkingDuringCall).toBe(true)
    })

    it('should set isThinking to false after successful API call', async () => {
      const { handleSend, isThinking } = useChatActions()
      mockAskQuestionSuccess('Answer')

      await handleSend('Question')

      expect(isThinking.value).toBe(false)
    })

    it('should set isThinking to false after API error', async () => {
      const { handleSend, isThinking } = useChatActions()
      mockAskQuestionError('Error')

      await handleSend('Question')

      expect(isThinking.value).toBe(false)
    })

    it('should set isThinking to false after network error', async () => {
      const { handleSend, isThinking } = useChatActions()
      mockFetchNetworkError('Network error')

      await handleSend('Question')

      expect(isThinking.value).toBe(false)
    })

    it('should transition isThinking from false to true to false', async () => {
      const { handleSend, isThinking } = useChatActions()
      const states: boolean[] = []

      states.push(isThinking.value) // Initial state

      const mockFetch = vi.fn().mockImplementation(async () => {
        states.push(isThinking.value) // During call
        return {
          ok: true,
          json: async () => ({ answer: 'Response' }),
        }
      })
      global.fetch = mockFetch

      await handleSend('Question')
      states.push(isThinking.value) // After call

      expect(states).toEqual([false, true, false])
    })
  })

  describe('handleSend - error handling', () => {
    it('should add error message on API error', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const errorMessage = 'Server error'
      mockAskQuestionError(errorMessage)

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages.find((m) => m.text.includes('something went wrong'))
      expect(errorMsg).toBeDefined()
      expect(errorMsg?.sender).toBe('System')
    })

    it('should include error message in system response', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const errorMessage = 'Specific error'
      mockAskQuestionError(errorMessage)

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages[messages.length - 1]
      expect(errorMsg.text).toContain(errorMessage)
    })

    it('should handle network errors', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockFetchNetworkError('Connection failed')

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages[messages.length - 1]
      expect(errorMsg.text).toContain('Connection failed')
    })

    it('should handle unknown error types', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()

      const mockFetch = vi.fn().mockRejectedValue('String error')
      global.fetch = mockFetch

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages[messages.length - 1]
      expect(errorMsg.text).toContain('Failed to get an answer')
    })

    it('should format error message correctly', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionError('Test error')

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages[messages.length - 1]
      expect(errorMsg.text).toMatch(
        /^Sorry, something went wrong talking to the server:/
      )
    })

    it('should still add user message even when API fails', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionError('Error')

      await handleSend('User question')

      const userMessage = chatStore.messages.find((m) => m.sender === 'You')
      expect(userMessage).toBeDefined()
      expect(userMessage?.text).toBe('User question')
    })

    it('should add error message after user message', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionError('Error')

      await handleSend('Question')

      expect(chatStore.messages.length).toBe(2)
      expect(chatStore.messages[0].sender).toBe('You')
      expect(chatStore.messages[1].sender).toBe('System')
    })
  })

  describe('handleSend - multiple calls', () => {
    it('should handle multiple sequential calls', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer 1')

      await handleSend('Question 1')

      mockAskQuestionSuccess('Answer 2')
      await handleSend('Question 2')

      expect(chatStore.messages.length).toBe(4) // 2 user + 2 system
    })

    it('should maintain correct isThinking state across multiple calls', async () => {
      const { handleSend, isThinking } = useChatActions()
      mockAskQuestionSuccess('Answer 1')

      await handleSend('Question 1')
      expect(isThinking.value).toBe(false)

      mockAskQuestionSuccess('Answer 2')
      await handleSend('Question 2')
      expect(isThinking.value).toBe(false)
    })

    it('should handle mix of success and error calls', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()

      mockAskQuestionSuccess('Success')
      await handleSend('Question 1')

      mockAskQuestionError('Error')
      await handleSend('Question 2')

      mockAskQuestionSuccess('Success again')
      await handleSend('Question 3')

      expect(chatStore.messages.length).toBe(6) // 3 user + 3 system
    })
  })

  describe('Integration with chat store', () => {
    it('should use the same chat store instance', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      const initialCount = chatStore.messages.length
      mockAskQuestionSuccess('Answer')

      await handleSend('Question')

      expect(chatStore.messages.length).toBe(initialCount + 2)
    })

    it('should respect chat store message validation', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer')

      await handleSend('   Valid question   ')

      const userMessage = chatStore.messages[0]
      expect(userMessage.text).toBe('Valid question') // Trimmed by store
    })

    it('should trigger orderedMessages computed', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer')

      await handleSend('Question')

      const ordered = chatStore.orderedMessages
      expect(ordered.length).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle very long question text', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const longQuestion = 'Question '.repeat(1000)
      mockAskQuestionSuccess('Answer')

      await handleSend(longQuestion)

      const userMessage = chatStore.messages[0]
      expect(userMessage.text).toBe(longQuestion)
    })

    it('should handle special characters in question', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const specialQuestion = '!@#$%^&*()_+-=[]{}|;:",.<>?/'
      mockAskQuestionSuccess('Answer')

      await handleSend(specialQuestion)

      const userMessage = chatStore.messages[0]
      expect(userMessage.text).toBe(specialQuestion)
    })

    it('should handle unicode in question', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      const unicodeQuestion = '你好 🌍 مرحبا'
      mockAskQuestionSuccess('Answer')

      await handleSend(unicodeQuestion)

      const userMessage = chatStore.messages[0]
      expect(userMessage.text).toBe(unicodeQuestion)
    })

    it('should handle empty answer from API', async () => {
      const { handleSend } = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ answer: '' }),
      })
      global.fetch = mockFetch

      await handleSend('Question')

      const messages = chatStore.messages
      const errorMsg = messages[messages.length - 1]
      expect(errorMsg.text).toContain('something went wrong')
    })
  })

  describe('Composable reusability', () => {
    it('should create independent instances', () => {
      const instance1 = useChatActions()
      const instance2 = useChatActions()

      expect(instance1.isThinking).not.toBe(instance2.isThinking)
    })

    it('should share the same store across instances', async () => {
      const instance1 = useChatActions()
      const instance2 = useChatActions()
      const chatStore = useChatStore()
      chatStore.clearMessages()
      mockAskQuestionSuccess('Answer')

      await instance1.handleSend('Question from instance 1')

      expect(chatStore.messages.length).toBeGreaterThan(0)

      // Instance 2 should see the same messages
      mockAskQuestionSuccess('Answer 2')
      await instance2.handleSend('Question from instance 2')

      expect(chatStore.messages.length).toBe(4)
    })

    it('should have independent isThinking state', async () => {
      const instance1 = useChatActions()
      const instance2 = useChatActions()

      expect(instance1.isThinking.value).toBe(false)
      expect(instance2.isThinking.value).toBe(false)

      instance1.isThinking.value = true
      expect(instance2.isThinking.value).toBe(false)
    })
  })
})
