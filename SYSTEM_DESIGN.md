# ChatPDF System Design

## Overview

ChatPDF is a web application that allows users to upload PDF files and have conversational interactions with an AI chatbot about the content. The system consists of a Vue.js frontend and a FastAPI backend with RAG (Retrieval-Augmented Generation) capabilities.

## Architecture

```
┌──────────────────┐         HTTP/REST          ┌──────────────────┐
│                  │ ◄────────────────────────► │                  │
│  Vue.js Frontend │                            │  FastAPI Backend │
│  (Port 5173)     │                            │  (Port 8000)     │
│                  │                            │                  │
└──────────────────┘                            └──────────────────┘
                                                         │
                                                         │
                                       ┌─────────────────┼──────────────────┐
                                       │                 │                  │
                                       ▼                 ▼                  ▼
                                ┌──────────────┐  ┌──────────────┐  ┌────────────────┐
                                │   File       │  │   Vector     │  │   Session      │
                                │   Storage    │  │   Database   │  │   Storage      │
                                │   (uploads/) │  │   (RAG)      │  │   (DB/Memory)  │
                                └──────────────┘  └──────────────┘  └────────────────┘
```

## Core Functionalities

1. **PDF Upload**: Users can upload PDF files that are processed and stored
2. **Chat Interface**: Users can ask questions about the uploaded PDF content
3. **Session Memory**: The AI remembers conversation history within a session

## API Endpoints Design

### 1. Upload PDF File

**Endpoint**: `POST /files`

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response** (200 OK):
```json
{
  "filename": "example.pdf",
  "message": "File saved at uploads/9dc50dff_example.pdf",
  "file": {
    "id": "9dc50dff",
    "name": "example.pdf",
    "url": "uploads/9dc50dff_example.pdf"
  }
}
```

**Process Flow**:
1. Receive PDF file from frontend
2. Generate unique file ID (e.g., UUID)
3. Save file to `uploads/` directory
4. Process PDF: Extract text, chunk documents, generate embeddings
5. Store embeddings in vector database
6. Save file metadata to database
7. Return file ID and metadata

---

### 2. Ask Question (with Session Support)

**Endpoint**: `POST /ask`

**Request**:
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "file_id": "9dc50dff",
  "question": "Tell me core concepts in prompt engineering",
  "session_id": "abc123xyz"  // Optional: if not provided, create new session
}
```

**Response** (200 OK):
```json
{
  "question": "Tell me core concepts in prompt engineering",
  "file_id": "9dc50dff",
  "session_id": "abc123xyz",
  "message": "Answering your question...",
  "answer": {
    "answer": "Core concepts in prompt engineering include:\n* System prompting\n* Role prompting\n* ...",
    "input_tokens": 204,
    "output_tokens": 58,
    "total_tokens": 463
  }
}
```

**Process Flow**:
1. Receive question, file_id, and optional session_id
2. If no session_id provided, create new session and return session_id
3. Retrieve conversation history for the session
4. Retrieve relevant document chunks from vector database using RAG
5. Build prompt with:
   - System instructions
   - Retrieved context from PDF
   - Conversation history (last N messages)
   - Current question
6. Call LLM API (OpenAI, Anthropic, etc.)
7. Store question-answer pair in session history
8. Return answer with session_id

**Error Responses**:
- 400 Bad Request: Invalid file_id or missing question
- 404 Not Found: File not found
- 500 Internal Server Error: Processing failure

---

### 3. Create Session (Optional - Alternative Approach)

**Endpoint**: `POST /sessions`

**Request**:
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "file_id": "9dc50dff"
}
```

**Response** (200 OK):
```json
{
  "session_id": "abc123xyz",
  "file_id": "9dc50dff",
  "created_at": "2025-12-23T15:00:00Z"
}
```

**Note**: This endpoint is optional if you prefer explicit session creation. Alternatively, sessions can be auto-created on first `/ask` request.

---

### 4. Get Session History (Optional)

**Endpoint**: `GET /sessions/{session_id}`

**Response** (200 OK):
```json
{
  "session_id": "abc123xyz",
  "file_id": "9dc50dff",
  "messages": [
    {
      "question": "What is prompt engineering?",
      "answer": "Prompt engineering is...",
      "timestamp": "2025-12-23T15:01:00Z"
    },
    {
      "question": "Tell me core concepts",
      "answer": "Core concepts include...",
      "timestamp": "2025-12-23T15:02:00Z"
    }
  ]
}
```

---

## Data Flow

### PDF Upload Flow

```
User → Frontend → POST /files → Backend
                                    │
                                    ├─→ Save file to disk
                                    ├─→ Extract text from PDF
                                    ├─→ Chunk documents
                                    ├─→ Generate embeddings
                                    ├─→ Store in vector DB
                                    └─→ Save metadata to DB
                                    │
Backend ← Return file_id ←──────────┘
Frontend ← Store file_id in Pinia store
```

**Frontend Actions**:
1. User selects PDF file
2. `PdfUpload` component calls `pdfStore.upload(file)`
3. Store sends POST request to `/files` with FormData
4. On success, store saves `file_id` and metadata
5. UI updates to show "Uploaded" status

---

### Chat Question Flow

```
User types question → Frontend
                        │
                        ├─→ Add "You" message to chat immediately
                        ├─→ Call askQuestion(question, file_id, session_id)
                        │
                        └─→ POST /ask
                              │
Backend ←─────────────────────┘
  │
  ├─→ Validate file_id exists
  ├─→ Get or create session
  ├─→ Retrieve conversation history
  ├─→ RAG: Query vector DB for relevant chunks
  ├─→ Build prompt with context + history
  ├─→ Call LLM API
  ├─→ Store Q&A in session
  └─→ Return answer + session_id
                    │
Frontend ←──────────┘
  │
  ├─→ Add "System" message with answer
  └─→ Update session_id in store
```

**Frontend Actions**:
1. User submits question in `ChatComposer`
2. `App.vue` `handleSend()` adds user message immediately
3. Calls `askQuestion(question, fileId, sessionId)` from `api.ts`
4. Shows "Thinking..." state (disables input)
5. On success, adds System message with answer
6. On error, shows error message
7. Updates session_id for subsequent requests

---

## Session Management

### Session Lifecycle

1. **Session Creation**:
   - Option A: Auto-create on first `/ask` request (simpler)
   - Option B: Explicit creation via `POST /sessions` (more control)
   - Generate unique session_id (UUID)
   - Associate with file_id

2. **Session Storage**:
   - Store in database (SQLite/PostgreSQL) or in-memory cache (Redis)
   - Schema:
     ```sql
     sessions (
       session_id TEXT PRIMARY KEY,
       file_id TEXT,
       created_at TIMESTAMP,
       updated_at TIMESTAMP
     )
     
     messages (
       id INTEGER PRIMARY KEY,
       session_id TEXT,
       question TEXT,
       answer TEXT,
       timestamp TIMESTAMP,
       FOREIGN KEY (session_id) REFERENCES sessions(session_id)
     )
     ```

3. **Session Persistence**:
   - Frontend: Store `session_id` in Pinia store (or localStorage for persistence across page refreshes)
   - Backend: Persist in database
   - Session expires after inactivity (optional: e.g., 24 hours)

4. **Conversation History**:
   - Retrieve last N messages (e.g., 10-20) for context
   - Include in LLM prompt for continuity
   - Format: `[{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]`

---

## Frontend State Management

### Pinia Stores

**PDF Store** (`stores/pdf.ts`):
- `activePdf`: Current uploaded PDF metadata
- `status`: Upload status (idle, uploading, success, error)
- `upload(file)`: Upload PDF to backend
- `reset()`: Clear current PDF

**Chat Store** (`stores/chat.ts`):
- `messages`: Array of chat messages
- `addMessage({ sender, text })`: Add message to chat
- `clearMessages()`: Reset chat

**Session Store** (New - Recommended):
- `sessionId`: Current session ID
- `fileId`: Current file ID (from PDF store)
- `initializeSession(fileId)`: Create new session
- `resetSession()`: Clear session

---

## Backend Components

### 1. File Processing Pipeline

```
PDF File
  ↓
Text Extraction (PyPDF2, pdfplumber)
  ↓
Document Chunking (LangChain, custom)
  ↓
Embedding Generation (OpenAI, Sentence Transformers)
  ↓
Vector Database Storage (Chroma, Pinecone, FAISS)
```

### 2. RAG Retrieval

- Query: User question (embedded)
- Retrieve: Top K relevant chunks (e.g., K=5)
- Context: Combine chunks with conversation history
- Prompt: System instructions + context + history + question

### 3. LLM Integration

- Provider: OpenAI GPT-4, Anthropic Claude, or local model
- Prompt Template:
  ```
  System: You are a helpful assistant answering questions about a PDF document.
  
  Context from PDF:
  {retrieved_chunks}
  
  Conversation History:
  {conversation_history}
  
  User: {current_question}
  Assistant:
  ```

---

## Database Schema

### Files Table
```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
```

---

## Error Handling

### Frontend
- Network errors: Show user-friendly message, retry option
- Validation errors: Disable submit, show inline errors
- Backend errors: Display error message in chat as System message

### Backend
- File validation: Check file type, size limits
- Session errors: Return 404 if session not found
- LLM errors: Graceful fallback, log errors
- Rate limiting: Prevent abuse (optional)

---

## Security Considerations

1. **File Upload**:
   - Validate file type (only PDF)
   - Limit file size (e.g., 10MB max)
   - Sanitize filenames
   - Store files outside web root

2. **API Security**:
   - CORS configuration for frontend origin
   - Input validation and sanitization
   - Rate limiting per IP/session
   - Authentication (future: user accounts)

3. **Session Security**:
   - Use secure, random session IDs
   - Validate session ownership
   - Expire old sessions

---

## Future Enhancements

1. **User Authentication**: Multi-user support with user accounts
2. **Multiple Files**: Support multiple PDFs per session
3. **File Management**: List, delete uploaded files
4. **Export Chat**: Download conversation history
5. **Streaming Responses**: Real-time answer streaming
6. **File Preview**: Show PDF preview in UI
7. **Search**: Full-text search across uploaded PDFs

---

## Implementation Checklist

### Backend (FastAPI)
- [ ] Update `POST /files` to process PDF and store embeddings
- [ ] Implement `POST /ask` with session support
- [ ] Add session management (create, retrieve, store history)
- [ ] Integrate RAG pipeline (vector DB, retrieval)
- [ ] Add conversation history to LLM prompts
- [ ] Implement database schema for files, sessions, messages
- [ ] Add error handling and validation
- [ ] Configure CORS for frontend origin

### Frontend (Vue.js)
- [ ] Create session store (or extend existing stores)
- [ ] Update `askQuestion()` to include session_id
- [ ] Store session_id in Pinia/localStorage
- [ ] Handle session creation on first question
- [ ] Update UI to show session state
- [ ] Add error handling for session-related errors

---

## API Summary

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/files` | POST | Upload PDF | `file` (multipart) | File metadata + ID |
| `/ask` | POST | Ask question | `{file_id, question, session_id?}` | Answer + session_id |
| `/sessions` | POST | Create session | `{file_id}` | Session metadata |
| `/sessions/{id}` | GET | Get history | - | Conversation history |

---

## Notes

- **Session ID**: Can be generated by frontend (UUID) or backend. Frontend should send it with each `/ask` request.
- **File ID**: Retrieved from `/files` response, stored in frontend, sent with each question.
- **Conversation Context**: Backend retrieves last N messages from session to maintain context.
- **Vector DB**: Choose based on scale (Chroma for local, Pinecone for production, FAISS for performance).

