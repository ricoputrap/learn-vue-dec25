<script setup lang="ts">
import type { ChatMessage } from "../types";
import { marked } from "marked";

const props = defineProps<{
    messages: ChatMessage[];
}>();

// Configure marked for safe rendering
marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // GitHub Flavored Markdown
    headerIds: false, // Disable header IDs
    mangle: false, // Disable email mangling
});

function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString();
}

function formatMessage(text: string): string {
    return marked.parse(text) as string;
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
                    <span class="chat__time">{{
                        formatTime(msg.createdAt)
                    }}</span>
                </div>
                <div class="chat__text" v-html="formatMessage(msg.text)"></div>
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
    word-break: break-word;
    line-height: 1.6;
}

/* Markdown formatting styles */
.chat__text :deep(p) {
    margin: 0 0 12px 0;
}

.chat__text :deep(p:last-child) {
    margin-bottom: 0;
}

.chat__text :deep(ul),
.chat__text :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
}

.chat__text :deep(li) {
    margin: 4px 0;
}

.chat__text :deep(strong) {
    font-weight: 700;
}

.chat__text :deep(em) {
    font-style: italic;
}

.chat__text :deep(code) {
    background: rgba(0, 0, 0, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Monaco", "Menlo", "Courier New", monospace;
    font-size: 0.9em;
}

.chat__text :deep(pre) {
    background: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
}

.chat__text :deep(pre code) {
    background: none;
    padding: 0;
    font-size: 0.875em;
}

.chat__text :deep(blockquote) {
    border-left: 3px solid #d1d5db;
    padding-left: 12px;
    margin: 12px 0;
    color: #6b7280;
}

.chat__text :deep(h1),
.chat__text :deep(h2),
.chat__text :deep(h3) {
    margin: 16px 0 8px 0;
    font-weight: 600;
}

.chat__text :deep(h1) {
    font-size: 1.5em;
}

.chat__text :deep(h2) {
    font-size: 1.3em;
}

.chat__text :deep(h3) {
    font-size: 1.1em;
}

/* Adjust styles for 'You' messages with dark background */
.chat__item[data-sender="you"] .chat__text :deep(code) {
    background: rgba(255, 255, 255, 0.2);
    color: #f8fbff;
}

.chat__item[data-sender="you"] .chat__text :deep(pre) {
    background: rgba(255, 255, 255, 0.1);
}

.chat__item[data-sender="you"] .chat__text :deep(blockquote) {
    border-left-color: rgba(255, 255, 255, 0.3);
    color: #e0e7ff;
}

.chat__item[data-sender="you"] .chat__text :deep(a) {
    color: #bfdbfe;
    text-decoration: underline;
}

.chat__empty {
    color: #7b8794;
    margin: 0;
}
</style>
