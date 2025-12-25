import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useChatStore } from "./chat";
import { usePdfStore } from "./pdf";
import type { UploadedPdf, ChatMessage } from "../types";

/**
 * Local session/store model used for the app until backend integration.
 * Sessions are persisted to localStorage under the key below.
 *
 * Session structure (kept small for the Recent Conversations UI):
 * - session_id: string
 * - file_id?: string
 * - file_name?: string
 * - created_at: number (ms since epoch)
 * - updated_at: number (ms since epoch)
 * - messages: Array<{ question: string; answer: string; timestamp: number }>
 */

const STORAGE_KEY_SESSIONS = "chatpdf:local_sessions";
const STORAGE_KEY_ACTIVE = "chatpdf:active_session_id";

type SessionMessage = {
    question: string;
    answer: string;
    timestamp: number;
};

export type SessionSummary = {
    session_id: string;
    file_id?: string;
    file_name?: string;
    created_at: number;
    updated_at: number;
    messages?: SessionMessage[];
};

function makeId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): SessionSummary[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as SessionSummary[];
        // Basic validation: ensure timestamps exist
        return parsed.map((s) => ({
            session_id: s.session_id,
            file_id: s.file_id,
            file_name: s.file_name,
            created_at: s.created_at ?? Date.now(),
            updated_at: s.updated_at ?? Date.now(),
            messages: s.messages ?? [],
        }));
    } catch {
        return [];
    }
}

function saveToStorage(sessions: SessionSummary[]) {
    try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch {
        // ignore storage errors for now
    }
}

function loadActiveFromStorage(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY_ACTIVE);
    } catch {
        return null;
    }
}

function saveActiveToStorage(id: string | null) {
    try {
        if (id === null) localStorage.removeItem(STORAGE_KEY_ACTIVE);
        else localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } catch {
        // ignore
    }
}

export const useSessionStore = defineStore("session", () => {
    const chat = useChatStore();
    const pdf = usePdfStore();

    const sessions = ref<SessionSummary[]>(loadFromStorage());
    const sessionId = ref<string | null>(loadActiveFromStorage());

    const orderedSessions = computed(() =>
        [...sessions.value].sort((a, b) => b.updated_at - a.updated_at),
    );

    function findSession(id: string) {
        return sessions.value.find((s) => s.session_id === id) ?? null;
    }

    function persist() {
        saveToStorage(sessions.value);
        saveActiveToStorage(sessionId.value);
    }

    // Create a new session locally; associate optional file metadata (from pdfStore if not provided)
    function createSession(fileId?: string, fileName?: string) {
        const id = makeId();
        let resolvedFileId = fileId;
        let resolvedFileName = fileName;

        if (!resolvedFileId && pdf.activePdf?.id) {
            resolvedFileId = pdf.activePdf.id;
            resolvedFileName = pdf.activePdf.name;
        } else if (!resolvedFileName && resolvedFileId && pdf.activePdf?.id === resolvedFileId) {
            resolvedFileName = pdf.activePdf.name;
        }

        const now = Date.now();
        const newSession: SessionSummary = {
            session_id: id,
            file_id: resolvedFileId,
            file_name: resolvedFileName,
            created_at: now,
            updated_at: now,
            messages: [],
        };

        sessions.value.unshift(newSession);
        sessionId.value = id;
        persist();
        // clear chat messages for new session
        chat.clearMessages();
        return id;
    }

    // Load session messages into the chat store (replacing current chat)
    function loadSession(id: string) {
        const s = findSession(id);
        if (!s) return false;
        // ensure active pdf is set if file_id exists
        if (s.file_id) {
            // try to set pdfStore.activePdf if file metadata is present (best-effort).
            // pdfStore may not provide a lookup API; we set only if the current active PDF matches.
            if (!pdf.activePdf || pdf.activePdf.id !== s.file_id) {
                // If the PDF metadata is available in local store (active), set it; otherwise leave it.
                // This is minimal local-only behavior until backend provides a files endpoint.
                // No network call here per the requested local-first approach.
            }
        }

        // Replace chat messages with session messages
        chat.clearMessages();
        const msgs = s.messages ?? [];
        for (const m of msgs) {
            // each session message contains question+answer; add both as chat messages
            // "You" message for question
            chat.addMessage({ sender: "You", text: m.question });
            // "System" message for answer
            chat.addMessage({ sender: "System", text: m.answer });
        }

        sessionId.value = id;
        persist();
        return true;
    }

    // Convenience: select session (alias for loadSession)
    function selectSession(id: string) {
        return loadSession(id);
    }

    // Delete a session locally
    function deleteSession(id: string) {
        const idx = sessions.value.findIndex((s) => s.session_id === id);
        if (idx === -1) return false;
        const wasActive = sessionId.value === id;
        sessions.value.splice(idx, 1);
        if (wasActive) {
            sessionId.value = null;
            chat.clearMessages();
        }
        persist();
        return true;
    }

    // Append a QA pair to the active session (or create one if none active)
    function appendMessageToActiveSession(question: string, answer: string) {
        let s = sessionId.value ? findSession(sessionId.value) : null;
        if (!s) {
            const newId = createSession(pdf.activePdf?.id, pdf.activePdf?.name);
            s = findSession(newId);
        }
        if (!s) return;

        const now = Date.now();
        s.messages = s.messages ?? [];
        s.messages.push({
            question,
            answer,
            timestamp: now,
        });
        s.updated_at = now;

        // also push to chat store for immediate UI consistency
        chat.addMessage({ sender: "You", text: question });
        chat.addMessage({ sender: "System", text: answer });

        // reorder sessions so most recent is first
        sessions.value = sessions.value
            .filter((x) => x.session_id !== s?.session_id)
            .concat([s])
            .sort((a, b) => b.updated_at - a.updated_at);

        persist();
    }

    // Replace entire sessions list (useful at startup or if importing)
    function setSessions(list: SessionSummary[]) {
        sessions.value = [...list];
        persist();
    }

    function clearAllSessions() {
        sessions.value = [];
        sessionId.value = null;
        chat.clearMessages();
        persist();
    }

    return {
        sessions,
        orderedSessions,
        sessionId,
        findSession,
        createSession,
        loadSession,
        selectSession,
        deleteSession,
        appendMessageToActiveSession,
        setSessions,
        clearAllSessions,
    };
});
