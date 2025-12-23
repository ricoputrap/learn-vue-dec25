<script setup lang="ts">
import { computed, ref } from "vue";
import { useChatStore } from "./stores/chat";

const chat = useChatStore();
const messageText = ref("");

const canSend = computed(() => messageText.value.trim().length > 0);

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

function handleSend() {
  if (!canSend.value) return;
  chat.addMessage({ sender: "You", text: messageText.value });
  messageText.value = "";
}
</script>

<template>
  <div class="chat">
    <header class="chat__header">
      <h1>Local Chat</h1>
      <p class="chat__subhead">Messages live only in this tab.</p>
    </header>

    <main class="chat__messages" aria-live="polite">
      <p v-if="chat.orderedMessages.length === 0" class="chat__empty">
        No messages yet. Say hi!
      </p>
      <ul v-else>
        <li v-for="msg in chat.orderedMessages" :key="msg.id" class="chat__item">
          <div class="chat__meta">
            <span class="chat__sender">{{ msg.sender }}</span>
            <span class="chat__time">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <p class="chat__text">{{ msg.text }}</p>
        </li>
      </ul>
    </main>

    <form class="chat__composer" @submit.prevent="handleSend">
      <input
        v-model="messageText"
        class="chat__input"
        type="text"
        name="message"
        autocomplete="off"
        placeholder="Type a message"
        aria-label="Message"
      />
      <button type="submit" :disabled="!canSend">Send</button>
      <button
        type="button"
        class="chat__clear"
        :disabled="chat.messages.length === 0"
        @click="chat.clearMessages"
      >
        Clear
      </button>
    </form>
  </div>
</template>

<style scoped>
:global(body) {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f6f7fb;
  color: #1f2933;
  margin: 0;
}

.chat {
  max-width: 720px;
  margin: 32px auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat__header {
  border-bottom: 1px solid #eef1f6;
  padding-bottom: 12px;
}

.chat__header h1 {
  margin: 0;
  font-size: 20px;
}

.chat__subhead {
  margin: 4px 0 0;
  color: #52606d;
  font-size: 14px;
}

.chat__messages {
  min-height: 240px;
}

.chat__messages ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat__item {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}

.chat__meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
  gap: 8px;
}

.chat__sender {
  font-weight: 600;
}

.chat__time {
  color: #7b8794;
  font-size: 12px;
}

.chat__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat__empty {
  color: #7b8794;
  margin: 0;
}

.chat__composer {
  display: flex;
  gap: 8px;
}

.chat__input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d9dde3;
  border-radius: 8px;
  font-size: 14px;
}

button {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
}

.chat__clear {
  background: #eef2f7;
  color: #1f2933;
}
</style>
