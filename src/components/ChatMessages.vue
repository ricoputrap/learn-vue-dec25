<script setup lang="ts">
import type { ChatMessage } from "../types";

const props = defineProps<{
  messages: ChatMessage[];
}>();

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}
</script>

<template>
  <main class="chat__messages" aria-live="polite">
    <p v-if="props.messages.length === 0" class="chat__empty">
      No messages yet. Say hi!
    </p>
    <ul v-else>
      <li
        v-for="msg in props.messages"
        :key="msg.id"
        class="chat__item"
        :data-sender="msg.sender === 'You' ? 'you' : 'system'"
      >
        <div class="chat__meta">
          <span class="chat__sender">{{ msg.sender }}</span>
          <span class="chat__time">{{ formatTime(msg.createdAt) }}</span>
        </div>
        <p class="chat__text">{{ msg.text }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
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
  border-radius: 12px;
  background: #f9fafb;
  max-width: 80%;
}

.chat__item[data-sender="system"] {
  margin-right: auto;
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.chat__item[data-sender="you"] {
  margin-left: auto;
  background: #2563eb;
  border-color: #1d4ed8;
  color: #f8fbff;
}

.chat__item[data-sender="you"] .chat__time {
  color: #e0e7ff;
}

.chat__item[data-sender="you"] .chat__sender {
  color: #e0e7ff;
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
</style>

