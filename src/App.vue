<script setup lang="ts">
import ChatComposer from "./components/ChatComposer.vue";
import ChatHeader from "./components/ChatHeader.vue";
import ChatMessages from "./components/ChatMessages.vue";
import { useChatStore } from "./stores/chat";

const chat = useChatStore();

function handleSend(text: string) {
  chat.addMessage({ sender: "You", text });
}
</script>

<template>
  <div class="chat">
    <ChatHeader />
    <ChatMessages :messages="chat.orderedMessages" />
    <ChatComposer
      :can-clear="chat.messages.length > 0"
      @send="handleSend"
      @clear="chat.clearMessages"
    />
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
</style>
