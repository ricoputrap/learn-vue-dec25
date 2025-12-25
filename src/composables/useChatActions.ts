import { ref } from "vue";
import { useChatStore } from "../stores/chat";
import { askQuestion } from "../api";

export function useChatActions() {
  const chat = useChatStore();
  const isThinking = ref(false);

  async function handleSend(text: string) {
    // Add the user's message immediately
    chat.addMessage({ sender: "You", text });

    try {
      isThinking.value = true;
      const { answer } = await askQuestion(text);
      chat.addMessage({
        sender: "System",
        text: answer,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get an answer.";
      chat.addMessage({
        sender: "System",
        text: `Sorry, something went wrong talking to the server: ${message}`,
      });
    } finally {
      isThinking.value = false;
    }
  }

  return {
    handleSend,
    isThinking,
  };
}
