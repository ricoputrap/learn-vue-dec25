import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { ChatMessage } from "../types";

type NewMessagePayload = {
  sender: string;
  text: string;
};

export const useChatStore = defineStore("chat", () => {
  const messages = ref<ChatMessage[]>([
    {
      id: "welcome",
      sender: "System",
      text: "Welcome! Messages are kept locally via Pinia.",
      createdAt: Date.now(),
    },
    {
      id: "hint",
      sender: "System",
      text: "Type a message below and hit Send to add to the chat.",
      createdAt: Date.now() + 1,
    },
  ]);

  const orderedMessages = computed(() =>
    [...messages.value].sort((a, b) => a.createdAt - b.createdAt),
  );

  function addMessage({ sender, text }: NewMessagePayload) {
    const trimmed = text.trim();
    if (!trimmed) return;

    messages.value.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: sender.trim() || "You",
      text: trimmed,
      createdAt: Date.now(),
    });
  }

  function clearMessages() {
    messages.value = [];
  }

  function setMessages(list: ChatMessage[]) {
    // Replace the chat messages with provided messages (ensure createdAt is a number)
    if (!Array.isArray(list)) return;
    messages.value = list.map((m) => ({
      id: m.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: m.sender ?? "System",
      text: m.text ?? "",
      createdAt: typeof m.createdAt === "number" ? m.createdAt : Date.now(),
    }));
  }

  return {
    messages,
    orderedMessages,
    addMessage,
    clearMessages,
    setMessages,
  };
});
