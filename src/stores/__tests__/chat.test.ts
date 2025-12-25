import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '../chat'
import type { ChatMessage } from '../../types'

describe('stores/chat.ts - useChatStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance before each test
    setActivePinia(createPinia())
  })

  describe('Initial state', () => {
    it('should have two welcome messages initially', () => {
      const store = useChatStore()

      expect(store.messages).toHaveLength(2)
      expect(store.messages[0].sender).toBe('System')
      expect(store.messages[0].text).toContain('Welcome')
      expect(store.messages[1].sender).toBe('System')
      expect(store.messages[1].text).toContain('Type a message')
    })

    it('should have welcome message with id "welcome"', () => {
      const store = useChatStore()

      const welcomeMessage = store.messages.find((m) => m.id === 'welcome')
      expect(welcomeMessage).toBeDefined()
      expect(welcomeMessage?.sender).toBe('System')
    })

    it('should have hint message with id "hint"', () => {
      const store = useChatStore()

      const hintMessage = store.messages.find((m) => m.id === 'hint')
      expect(hintMessage).toBeDefined()
      expect(hintMessage?.sender).toBe('System')
    })

    it('should have createdAt timestamps', () => {
      const store = useChatStore()

      store.messages.forEach((message) => {
        expect(message.createdAt).toBeTypeOf('number')
        expect(message.createdAt).toBeGreaterThan(0)
      })
    })
  })

  describe('addMessage action', () => {
    it('should add a new message to the store', () => {
      const store = useChatStore()
      const initialCount = store.messages.length

      store.addMessage({ sender: 'Test User', text: 'Hello world' })

      expect(store.messages).toHaveLength(initialCount + 1)
      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.sender).toBe('Test User')
      expect(lastMessage.text).toBe('Hello world')
    })

    it('should trim whitespace from message text', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: '  Hello  ' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.text).toBe('Hello')
    })

    it('should trim whitespace from sender name', () => {
      const store = useChatStore()

      store.addMessage({ sender: '  Test User  ', text: 'Message' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.sender).toBe('Test User')
    })

    it('should not add message with empty text', () => {
      const store = useChatStore()
      const initialCount = store.messages.length

      store.addMessage({ sender: 'User', text: '' })

      expect(store.messages).toHaveLength(initialCount)
    })

    it('should not add message with whitespace-only text', () => {
      const store = useChatStore()
      const initialCount = store.messages.length

      store.addMessage({ sender: 'User', text: '   ' })

      expect(store.messages).toHaveLength(initialCount)
    })

    it('should use "You" as default sender when empty', () => {
      const store = useChatStore()

      store.addMessage({ sender: '', text: 'Message' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.sender).toBe('You')
    })

    it('should use "You" as default sender when whitespace', () => {
      const store = useChatStore()

      store.addMessage({ sender: '   ', text: 'Message' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.sender).toBe('You')
    })

    it('should generate unique IDs for messages', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Message 1' })
      store.addMessage({ sender: 'User', text: 'Message 2' })

      const ids = store.messages.map((m) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should set createdAt timestamp when adding message', () => {
      const store = useChatStore()
      const beforeTime = Date.now()

      store.addMessage({ sender: 'User', text: 'Message' })

      const afterTime = Date.now()
      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.createdAt).toBeGreaterThanOrEqual(beforeTime)
      expect(lastMessage.createdAt).toBeLessThanOrEqual(afterTime)
    })

    it('should generate ID with timestamp and random part', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Message' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.id).toMatch(/^\d+-[a-f0-9]+$/)
    })

    it('should handle multiple messages in sequence', () => {
      const store = useChatStore()
      const initialCount = store.messages.length

      store.addMessage({ sender: 'User1', text: 'Message 1' })
      store.addMessage({ sender: 'User2', text: 'Message 2' })
      store.addMessage({ sender: 'User3', text: 'Message 3' })

      expect(store.messages).toHaveLength(initialCount + 3)
    })
  })

  describe('orderedMessages computed', () => {
    it('should return messages sorted by createdAt ascending', () => {
      const store = useChatStore()

      // Clear initial messages for cleaner test
      store.clearMessages()

      // Mock Date.now to control timestamps
      const timestamps = [1000, 3000, 2000]
      let callCount = 0
      const originalDateNow = Date.now
      vi.spyOn(Date, 'now').mockImplementation(() => {
        return timestamps[callCount++] || Date.now()
      })

      store.addMessage({ sender: 'User', text: 'First' })
      store.addMessage({ sender: 'User', text: 'Third' })
      store.addMessage({ sender: 'User', text: 'Second' })

      const ordered = store.orderedMessages

      expect(ordered[0].text).toBe('First')
      expect(ordered[1].text).toBe('Second')
      expect(ordered[2].text).toBe('Third')

      // Restore Date.now
      vi.spyOn(Date, 'now').mockRestore()
    })

    it('should not modify original messages array', () => {
      const store = useChatStore()
      const originalLength = store.messages.length

      const ordered = store.orderedMessages

      // Modifying ordered should not affect original
      expect(store.messages.length).toBe(originalLength)
      expect(ordered).not.toBe(store.messages)
    })

    it('should be reactive to new messages', () => {
      const store = useChatStore()
      const initialLength = store.orderedMessages.length

      store.addMessage({ sender: 'User', text: 'New message' })

      expect(store.orderedMessages.length).toBe(initialLength + 1)
    })

    it('should handle empty messages array', () => {
      const store = useChatStore()
      store.clearMessages()

      expect(store.orderedMessages).toEqual([])
    })

    it('should maintain correct order with identical timestamps', () => {
      const store = useChatStore()
      store.clearMessages()

      const fixedTimestamp = 1000
      vi.spyOn(Date, 'now').mockReturnValue(fixedTimestamp)

      store.addMessage({ sender: 'User', text: 'First' })
      store.addMessage({ sender: 'User', text: 'Second' })

      const ordered = store.orderedMessages

      // Both should have same timestamp, order should be stable
      expect(ordered[0].createdAt).toBe(fixedTimestamp)
      expect(ordered[1].createdAt).toBe(fixedTimestamp)

      vi.spyOn(Date, 'now').mockRestore()
    })
  })

  describe('clearMessages action', () => {
    it('should remove all messages', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Message 1' })
      store.addMessage({ sender: 'User', text: 'Message 2' })
      expect(store.messages.length).toBeGreaterThan(0)

      store.clearMessages()

      expect(store.messages).toEqual([])
      expect(store.messages.length).toBe(0)
    })

    it('should clear orderedMessages as well', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Message' })
      store.clearMessages()

      expect(store.orderedMessages).toEqual([])
    })

    it('should allow adding messages after clear', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Before clear' })
      store.clearMessages()
      store.addMessage({ sender: 'User', text: 'After clear' })

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].text).toBe('After clear')
    })

    it('should be idempotent (safe to call multiple times)', () => {
      const store = useChatStore()

      store.clearMessages()
      store.clearMessages()
      store.clearMessages()

      expect(store.messages).toEqual([])
    })
  })

  describe('Message structure', () => {
    it('should have all required ChatMessage properties', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Test' })

      const message = store.messages[store.messages.length - 1]
      expect(message).toHaveProperty('id')
      expect(message).toHaveProperty('sender')
      expect(message).toHaveProperty('text')
      expect(message).toHaveProperty('createdAt')
    })

    it('should have correct property types', () => {
      const store = useChatStore()

      store.addMessage({ sender: 'User', text: 'Test' })

      const message = store.messages[store.messages.length - 1]
      expect(typeof message.id).toBe('string')
      expect(typeof message.sender).toBe('string')
      expect(typeof message.text).toBe('string')
      expect(typeof message.createdAt).toBe('number')
    })
  })

  describe('Edge cases', () => {
    it('should handle very long message text', () => {
      const store = useChatStore()
      const longText = 'a'.repeat(10000)

      store.addMessage({ sender: 'User', text: longText })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.text).toBe(longText)
    })

    it('should handle special characters in text', () => {
      const store = useChatStore()
      const specialText = '!@#$%^&*()_+-=[]{}|;:",.<>?/\\'

      store.addMessage({ sender: 'User', text: specialText })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.text).toBe(specialText)
    })

    it('should handle unicode characters', () => {
      const store = useChatStore()
      const unicodeText = '你好世界 🌍 مرحبا'

      store.addMessage({ sender: 'User', text: unicodeText })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.text).toBe(unicodeText)
    })

    it('should handle newlines in text', () => {
      const store = useChatStore()
      const textWithNewlines = 'Line 1\nLine 2\nLine 3'

      store.addMessage({ sender: 'User', text: textWithNewlines })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.text).toBe(textWithNewlines)
    })

    it('should handle very long sender name', () => {
      const store = useChatStore()
      const longSender = 'User'.repeat(100)

      store.addMessage({ sender: longSender, text: 'Message' })

      const lastMessage = store.messages[store.messages.length - 1]
      expect(lastMessage.sender).toBe(longSender)
    })
  })
})
