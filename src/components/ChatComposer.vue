<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  canClear: boolean;
}>();

const emit = defineEmits<{
  (e: "send", text: string): void;
  (e: "clear"): void;
}>();

const text = ref("");
const canSend = computed(() => text.value.trim().length > 0);

function handleSend() {
  if (!canSend.value) return;
  emit("send", text.value);
  text.value = "";
}
</script>

<template>
  <form class="chat__composer" @submit.prevent="handleSend">
    <input
      v-model="text"
      class="chat__input"
      type="text"
      autocomplete="off"
      placeholder="Type a message"
      aria-label="Message"
    />
    <button type="submit" :disabled="!canSend">Send</button>
    <button
      type="button"
      class="chat__clear"
      :disabled="!props.canClear"
      @click="emit('clear')"
    >
      Clear
    </button>
  </form>
</template>

<style scoped>
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

