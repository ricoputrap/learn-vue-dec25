<script setup lang="ts">
import ChatComposer from "./components/ChatComposer.vue";
import ChatHeader from "./components/ChatHeader.vue";
import ChatMessages from "./components/ChatMessages.vue";
import PdfUpload from "./components/PdfUpload.vue";
import { useChatStore } from "./stores/chat";
import { usePdfStore } from "./stores/pdf";
import { useChatActions } from "./composables/useChatActions";

const chat = useChatStore();
const pdf = usePdfStore();
const { handleSend, isThinking } = useChatActions();
</script>

<template>
    <main class="layout">
        <section class="panel">
            <PdfUpload />
        </section>

        <section class="panel chat">
            <ChatHeader
                :active-pdf-name="pdf.activePdf?.name"
                :upload-status="pdf.status"
            />
            <ChatMessages :messages="chat.orderedMessages" />
            <ChatComposer
                :is-busy="isThinking"
                :can-clear="chat.messages.length > 0"
                @send="handleSend"
                @clear="chat.clearMessages"
            />
        </section>
    </main>
</template>

<style scoped>
:global(body) {
    font-family:
        system-ui,
        -apple-system,
        sans-serif;
    background: #f6f7fb;
    color: #1f2933;
    margin: 0;
}

.layout {
    max-width: 1200px;
    margin: 32px auto;
    padding: 0 16px 24px;
    display: grid;
    gap: 16px;
}

@media (min-width: 960px) {
    .layout {
        grid-template-columns: 1fr 1.2fr;
        align-items: start;
    }
}

.panel {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.05);
    padding: 20px;
}

.chat {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
