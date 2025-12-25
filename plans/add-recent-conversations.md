learn-vue-dec25/plans/add-recent-conversations.md#L1-300

# Plan: Add "Recent Conversations" section below "STEP 1: Upload a PDF" (aligned to Sessions model)

Author: Senior Software Architect (me)  
Date: 2025-12-25

## Goal

Update the previous plan so the "Recent Conversations" UI maps directly to the system-design sessions/messages model (as described in `SYSTEM_DESIGN.md`). The Recent Conversations list must reflect backend sessions (each session is tied to a `file_id` and holds messages). Selecting a recent item must set the current `session_id` and load session messages into the chat area. Creating a new conversation should create a new session (or clear session state) according to the system design.

1. Context Analysis (revised with system design)

---

Files and pieces involved:

- `src/App.vue` — root layout (left panel currently renders `PdfUpload`).
- `src/components/PdfUpload.vue` — upload flow uses `pdfStore.upload(file)` which calls `POST /files` and stores `file_id`.
- `src/stores/pdf` — holds `activePdf` and upload status.
- `src/stores/chat` — current chat messages array (used by chat UI).
- `src/stores/session` (recommended new store) — should hold `sessionId`, `sessions` list, and session-related actions. The system design explicitly introduces sessions associated with `file_id`.
- Backend endpoints to use:
  - `POST /sessions` — create a session for a `file_id` (optional flow).
  - `GET /sessions` — list sessions (if available) or an endpoint to list session metadata.
  - `GET /sessions/{session_id}` — fetch session history (messages).
  - `DELETE /sessions/{session_id}` — delete session (optional).
  - `POST /ask` — ask question (returns/creates `session_id` if not provided).

System design key points to align to:

- Sessions are primary units of "Recent Conversations" and are persisted on backend (DB).
- Each session has: `session_id`, `file_id`, `created_at`, `updated_at`, and `messages` (question-answer pairs).
- Frontend should persist `sessionId` in store and optionally localStorage for persistence across refreshes.
- When sending an ask request, the frontend must include `session_id` (or accept one returned by backend).
- Conversation history for context should be retrieved from backend sessions (GET /sessions/{id}) or implied from backend responses.

Problem (refined)

- Ensure the Recent Conversations UI reads from session metadata (not a generic chat list).
- Ensure interactions call appropriate session APIs and store session state in a `session` store.
- Keep changes additive and avoid breaking existing `pdf` and `chat` behavior.

2. Proposed Changes (detailed & aligned to sessions)

---

Files to create or modify

- Create: `src/components/RecentConversations.vue`
  - Purpose: display the list of session metadata (recent sessions), allow selecting a session (set active session), create new session, and delete a session.
  - Data source: `useSessionStore()` (new) which fetches sessions from the backend (`GET /sessions`).
  - Actions:
    - `selectSession(sessionId)` — sets `sessionStore.sessionId`, loads messages (`GET /sessions/{id}`) and instructs `chatStore` to populate messages.
    - `newConversation()` — either (A) create new session via `POST /sessions` with currently active `file_id`, or (B) clear current session and start blank (depending on chosen flow). Plan recommends using backend `POST /sessions` when a `file_id` exists; otherwise frontend can start a blank session (but prefer backend creation so server-side session_id is available).
    - `deleteConversation(sessionId)` — call `DELETE /sessions/{id}`, remove locally and update UI; if deleted session was active, clear chat/session state.
  - UI:
    - Header with "Recent Conversations" and a "+ New Chat" button.
    - List of sessions with: file name (from `pdfStore`), relative timestamp (from `updated_at`), optional snippet (last message), and a delete `(x)` control.
    - Visual highlight for active session.
  - Styling: scoped, reuse existing visual language.

- Add: `src/stores/session.ts` (new Pinia store)
  - State:
    - `sessionId: string | null`
    - `sessions: SessionSummary[]` where `SessionSummary = { session_id: string; file_id: string; file_name?: string; created_at: string; updated_at: string; snippet?: string }`
  - Actions:
    - `fetchSessions()` — call `GET /sessions` (or `GET /files/:id/sessions` if backend provides file-scoped list), populate `sessions`.
    - `createSession(fileId?: string)` — call `POST /sessions` { file_id } and return session id; set `sessionId`.
    - `selectSession(sessionId)` — set local `sessionId`, call `GET /sessions/{id}` to retrieve messages and forward them to `chatStore.setMessages(...)`; also set `pdfStore.activePdf` to the associated `file_id` if necessary.
    - `deleteSession(sessionId)` — call `DELETE /sessions/{id}`, remove from `sessions`, and if it was active clear chat/session state.
    - `persistSessionLocally(sessionId)` / `loadPersistedSession()` — optional helpers to save to localStorage for persistence.
  - Getters:
    - `orderedSessions` — sessions ordered by `updated_at` desc.
    - `activeSession` — find session matching `sessionId`.

- Modify: `src/stores/chat.ts`
  - Behavior change: `chatStore` should accept a full list of messages for the active session via a new action `setMessages(messages)` or `loadSessionMessages(sessionId)` which can be called from `sessionStore.selectSession`.
  - Keep existing `addMessage({ sender, text })`, `clearMessages()` as helpers for UI optimistic updates while `/ask` is in flight.

- Modify: `src/App.vue`
  - Import `RecentConversations` and render it below `<PdfUpload />` inside the left `.panel`.
  - On mount, call `sessionStore.fetchSessions()` so RecentConversations can show the list.
  - Wire any events emitted from `RecentConversations` if it chooses to emit rather than directly interacting with store (component can call store action directly; both are acceptable but prefer store direct calls for simplicity).
  - Ensure `handleSend()` (chat ask flow) continues to call `askQuestion(question, fileId, sessionId)` from `api.ts` and that the returned `session_id` is persisted in `sessionStore.sessionId` (the system design notes backend may create/return session_id on `/ask`).

- Modify/create: `src/api.ts` or wherever API helpers are centralized
  - Add convenience functions:
    - `fetchSessions()` → GET /sessions
    - `createSession(fileId)` → POST /sessions
    - `fetchSession(sessionId)` → GET /sessions/{id}
    - `deleteSession(sessionId)` → DELETE /sessions/{id}
    - Ensure `askQuestion(question, fileId, sessionId?)` already returns `session_id` which should be captured by `sessionStore`.

- Tests:
  - `src/components/__tests__/RecentConversations.test.ts`
    - Test rendering when `sessions` is empty.
    - Test rendering list of sessions (mock `sessionStore`).
    - Test clicking a session calls `sessionStore.selectSession(sessionId)` and `chatStore.setMessages(...)`.
    - Test new conversation triggers `sessionStore.createSession(fileId)` (use mock).
    - Test delete conversation triggers `sessionStore.deleteSession(sessionId)` and UI updates accordingly.
  - `src/stores/__tests__/session.test.ts`
    - Unit tests for `fetchSessions`, `createSession`, `selectSession`, `deleteSession` (use mocked API responses).
  - Integration test for `App.vue` that ensures `PdfUpload` and `RecentConversations` render, and session selection updates chat UI.

Potential breaking changes and side effects

- Store additions are additive — prefer to add `sessionStore` and new actions without mutating existing store types (to avoid test breakage).
- `askQuestion()` must update `sessionStore.sessionId` with returned `session_id`. If code path currently ignores that, you must wire it so subsequent requests reuse the same session.
- `sessionStore.selectSession` must set `pdfStore.activePdf` before `chatStore.setMessages` so the UI shows the correct header and messages in proper context.
- UI layout changes are limited to the left `.panel` — ensure component sizing doesn't overflow or change grid behavior.

3. Verification Strategy (aligned to sessions)

---

Automated checks:

- Unit tests:
  - New `RecentConversations` tests covering render and interactions (selection, new, delete).
  - `sessionStore` tests for API integration behavior and local persistence.
  - `chatStore` test to ensure `setMessages()` behaves as expected and doesn't break optimistic updates.
- Integration tests:
  - `App.vue` renders `PdfUpload` and `RecentConversations`. Selecting a session triggers session fetch and chat messages render.

Manual checks / smoke flow:

1. Start dev server.
2. On page load, left panel shows `Upload a PDF` and, below it, `Recent Conversations` (empty or loaded).
3. Upload PDF (POST /files) — confirm file metadata appears in `pdfStore.activePdf`.
4. Click "+ New Chat" (with uploaded PDF context): confirm `POST /sessions` is called and server returns `session_id`; UI sets `sessionId`, chat clears or initializes; RecentConversations updates with a new session entry.
5. Ask a question in `ChatComposer`: `POST /ask` called with `session_id` and `file_id`. On success, chat shows the answer and `sessionStore.sessionId` remains set to returned `session_id`.
6. Navigate away / refresh: `sessionStore` should attempt to persist `sessionId`/recent list to localStorage (optional), and RecentConversations should still list sessions after `fetchSessions()`.
7. Select an older recent conversation: `GET /sessions/{id}` returns messages; UI shows those messages in chat; header shows associated PDF name; session becomes active.
8. Delete a conversation: `DELETE /sessions/{id}` removes it from list; if it was active, chat clears session state.

Acceptance criteria:

- Recent conversations map 1:1 to backend sessions.
- Selecting a conversation loads the exact session messages (no mismatch between pdf header and messages).
- Creating a conversation uses the `POST /sessions` (preferred) and returns a `session_id` used in subsequent `/ask` calls.
- Deleting a conversation removes it from backend and UI.

4. Step-by-step Implementation Plan (concrete)

---

Implementation approach: small additive changes, test-driven where possible.

1. Add `src/stores/session.ts` (Pinia)
   - Implement state, getters, and actions described above.
   - Use centralized `api` helper functions (see step 3) to call backend endpoints.
   - Persist `sessionId` optionally in localStorage on set.

2. Add API helpers
   - Update `src/api.ts` (or create it if missing) with: `fetchSessions`, `createSession`, `fetchSession`, `deleteSession`, and ensure `askQuestion` is available or updated to surface `session_id` from server.

3. Create component `src/components/RecentConversations.vue`
   - Template:
     - Header with "Recent Conversations" + `+ New Chat` button.
     - Render `sessionStore.orderedSessions`, show filename (resolve via `pdfStore` when necessary), relative `updated_at` label, snippet, and delete button.
     - Clicking an item calls `sessionStore.selectSession(session_id)`.
   - Behavior:
     - On mount, call `sessionStore.fetchSessions()`.
     - When `+ New Chat` clicked:
       - If `pdfStore.activePdf?.id` exists — call `sessionStore.createSession(pdfId)` (preferred).
       - Otherwise call `sessionStore.createSession()` without fileId (server may still create session).
   - Visual:
     - Keep styling compact; clearly indicate active session.

4. Update `src/stores/chat.ts`
   - Add new action `setMessages(messages: Message[])` to populate messages for active session.
   - Ensure existing optimistic `addMessage` continues to work by appending messages and sending `/ask` with `sessionStore.sessionId`.

5. Update `src/App.vue`
   - Import `RecentConversations` and place it under `<PdfUpload />` in the left `.panel`.
   - On mount, ensure `sessionStore.fetchSessions()` is invoked (could also be inside RecentConversations).
   - Confirm grid/layout unaffected.

6. Update ask flow
   - Ensure `askQuestion(question, fileId, sessionId?)` (the caller in your `useChatActions`) sends `sessionStore.sessionId` if set.
   - When `/ask` returns a `session_id`, update `sessionStore.sessionId` (persist locally).
   - For optimistic UX: add user message immediately via `chatStore.addMessage({ sender: 'You', text })`, disable input until response; on response, call `chatStore.addMessage({ sender: 'System', text: answer})`.

7. Add tests
   - Create unit tests per section above. Mock API calls using existing test utils.
   - Run component / store tests and fix issues.

8. Manual QA and polish
   - Verify visual spacing and responsive layout.
   - Add accessible labels to controls (aria-labels for delete and new).
   - Tweak relative time formatting and snippet generation.

Estimated effort

- Implement session store and API helpers: 1.0–1.5 hours
- Create `RecentConversations.vue`: 1.0–1.5 hours
- Wire chat/session interactions and adjust `ask` flow: 1.0–1.5 hours
- Tests and polish: 1.0–2.0 hours
- Total: ~4–6.5 hours depending on test coverage and backend APIs availability

Notes/Assumptions (explicit)

- Backend exposes `POST /sessions` and `GET /sessions` (or equivalent endpoints). If the backend lacks a sessions listing endpoint, the UI can instead rely on a local record of sessions (less ideal). Plan assumes the endpoints exist as per `SYSTEM_DESIGN.md`.
- The backend returns `session_id` from `/ask` if the client did not provide one. `ask` responses must be handled to persist `session_id`.
- The `pdfStore` should be able to map `file_id` → file name in session summaries. If session metadata returns `file_name`, prefer that to avoid an extra lookup.
- If your project already has a `session` store or session-like behaviour in `chatStore`, adapt the plan to reuse it; the plan assumes no dedicated session store exists yet.
- Keep changes additive to avoid breaking existing tests or functionality.

## Next step

If you approve this updated plan (which aligns Recent Conversations to the sessions/messages model defined in `SYSTEM_DESIGN.md`), I will implement the changes in this order:

1. Add `session` store and API helpers.
2. Create `RecentConversations.vue`.
3. Wire selection/create/delete to backend and to `chatStore`.
4. Add unit tests and run the suite, then do manual QA.

Do you approve? If yes, I will proceed to implement. If you prefer a different session creation flow (auto-create session on first `/ask` vs explicit `POST /sessions` via "+ New Chat"), tell me which approach you prefer before I start.
