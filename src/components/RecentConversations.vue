<template>
  <section class="recent-card" aria-label="Recent Conversations">
    <header class="recent-card__header">
      <div>
        <p class="eyebrow">Recent</p>
        <h3>Recent Conversations</h3>
      </div>

      <div class="actions">
        <button
          type="button"
          class="primary"
          @click="handleNewChat"
          :title="newChatTitle"
          aria-label="Start a new chat"
        >
          + New Chat
        </button>
      </div>
    </header>

    <div class="recent-card__body">
      <ul v-if="sessions.length" class="session-list" role="list">
        <li
          v-for="s in sessions"
          :key="s.session_id"
          class="session-item"
          :data-active="s.session_id === activeSessionId"
        >
          <button
            class="session-main"
            @click="selectSession(s.session_id)"
            :aria-pressed="s.session_id === activeSessionId"
          >
            <div class="session-meta">
              <p class="session-title">{{ s.file_name ?? 'Untitled.pdf' }}</p>
              <p class="session-sub">
                {{ snippet(s) }} • {{ relativeTime(s.updated_at) }}
              </p>
            </div>
          </button>

          <button
            class="session-delete"
            @click.stop="deleteSessionItem(s.session_id)"
            :aria-label="`Delete session ${s.file_name ?? s.session_id}`"
            title="Delete conversation"
          >
            ×
          </button>
        </li>
      </ul>

      <div v-else class="empty">
        <p>No recent conversations yet.</p>
        <p class="muted">Start a new chat after you upload a PDF or click + New Chat.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSessionStore } from "../stores/session";
import { usePdfStore } from "../stores/pdf";

const sessionStore = useSessionStore();
const pdfStore = usePdfStore();

const sessions = computed(() => sessionStore.orderedSessions);
const activeSessionId = computed(() => sessionStore.sessionId);

function selectSession(id: string) {
  sessionStore.selectSession(id);
}

function deleteSessionItem(id: string) {
  sessionStore.deleteSession(id);
}

function handleNewChat() {
  // Create a session associated with the active PDF if available,
  // otherwise create a blank session.
  const pdf = pdfStore.activePdf;
  sessionStore.createSession(pdf?.id ?? undefined, pdf?.name ?? undefined);
}

const newChatTitle = computed(() =>
  pdfStore.activePdf ? `Start new chat for ${pdfStore.activePdf.name}` : "Start a new chat",
);

function snippet(s: any) {
  if (!s?.messages?.length) return "No messages yet";
  const last = s.messages[s.messages.length - 1];
  // Prefer showing the last answer snippet, otherwise question
  const text = last.answer ?? last.question ?? "";
  return text.length > 60 ? text.slice(0, 57) + "..." : text;
}

function relativeTime(ms: number | undefined | null) {
  if (!ms) return "";
  const now = Date.now();
  const diff = Math.max(0, now - ms);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  const date = new Date(ms);
  return date.toLocaleDateString();
}
</script>

<style scoped>
.recent-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
  color: #52606d;
  margin: 0 0 2px;
}

.recent-card h3 {
  margin: 0;
  font-size: 15px;
}

.actions {
  display: flex;
  gap: 8px;
}

button.primary {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
}

button.primary:active {
  transform: translateY(0.5px);
}

.recent-card__body {
  min-height: 48px;
}

.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background 120ms ease, box-shadow 120ms ease;
}

.session-item[data-active="true"] {
  background: #f3f4f6;
  box-shadow: inset 0 1px 0 rgba(0,0,0,0.02);
}

.session-main {
  display: flex;
  gap: 8px;
  align-items: center;
  text-align: left;
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.session-meta {
  display: flex;
  flex-direction: column;
}

.session-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

.session-sub {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.session-delete {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 8px;
  line-height: 1;
  border-radius: 6px;
}

.session-delete:hover {
  background: rgba(0,0,0,0.03);
  color: #ef4444;
}

.empty {
  padding: 12px;
  color: #374151;
}

.empty .muted {
  color: #6b7280;
  margin-top: 6px;
  font-size: 13px;
}
</style>
