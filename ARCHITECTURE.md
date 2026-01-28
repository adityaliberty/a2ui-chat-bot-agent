# A2UI Chatbot Demo - Architecture & Task Scenarios

## Project Overview

This demo showcases the **A2UI protocol** in action through an interactive AI agent chatbot powered by Gemini. The chatbot can perform real-world tasks by rendering dynamic forms, cards, and interactive elements directly in the chat interface.

## Task Scenarios

### 1. Restaurant Booking
**Goal**: Book a table at a restaurant

**Flow**:
- User: "I want to book a restaurant"
- Agent renders: Restaurant selection form
- User selects: Restaurant, date, time, party size
- Agent confirms: Booking details and shows confirmation card
- User can: Modify booking or start new task

**A2UI Components**:
- Card (booking container)
- Select (restaurant picker)
- Input (date/time)
- Button (submit)
- Text (confirmation message)

### 2. Project Management
**Goal**: Create and manage a project task

**Flow**:
- User: "Create a new project"
- Agent renders: Project creation form
- User fills: Project name, description, team members, deadline
- Agent creates: Project and shows task list
- User can: Add tasks, assign members, set priorities

**A2UI Components**:
- Card (project container)
- Input (text fields)
- Form (multi-field form)
- List (task list)
- Button (actions)

### 3. Flight Booking (Additional)
**Goal**: Search and book flights

**Flow**:
- User: "Book a flight"
- Agent renders: Flight search form
- User enters: From, to, dates, passengers
- Agent shows: Available flights with prices
- User selects: Flight and seat preferences
- Agent confirms: Booking

### 4. Event Planning (Additional)
**Goal**: Plan an event

**Flow**:
- User: "Plan an event"
- Agent renders: Event details form
- User fills: Event name, date, location, guest count, budget
- Agent suggests: Venues and catering options
- User confirms: Event plan

### 5. Task Scheduler (Additional)
**Goal**: Create and track tasks

**Flow**:
- User: "Add a task"
- Agent renders: Task creation form
- User fills: Task name, priority, deadline, assignee
- Agent shows: Task dashboard
- User can: Update status, add subtasks

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chat Interface                                      │   │
│  │  - Message display                                   │   │
│  │  - User input                                        │   │
│  │  - A2UI Renderer                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↑↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  A2UI Component Renderer                             │   │
│  │  - Parses A2UI JSON                                  │   │
│  │  - Renders components (Card, Form, Input, etc.)     │   │
│  │  - Handles user interactions                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↑                                    ↓
      SSE Stream                          userAction events
           ↑                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Server                                      │   │
│  │  - /api/chat (SSE endpoint)                          │   │
│  │  - /api/action (user action handler)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↑↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Gemini Agent                                        │   │
│  │  - Processes user messages                           │   │
│  │  - Generates A2UI JSON                               │   │
│  │  - Handles task logic                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↑                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  A2UI Message Generator                              │   │
│  │  - Creates surfaceUpdate messages                    │   │
│  │  - Creates dataModelUpdate messages                  │   │
│  │  - Creates beginRendering messages                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↑
    Gemini API (GOOGLE_GEMINI_KEY)
```

## Data Flow

### 1. User Sends Message
```
User Input → Frontend → POST /api/action → Backend
```

### 2. Backend Processes & Generates A2UI
```
Backend receives action
  ↓
Gemini generates response with A2UI JSON
  ↓
Backend streams A2UI messages via SSE
  ↓
Frontend receives and renders
```

### 3. Frontend Renders A2UI
```
A2UI JSON → A2UI Renderer → React Components → UI
```

### 4. User Interacts with Rendered UI
```
User clicks button/submits form
  ↓
Frontend captures interaction
  ↓
Creates userAction message
  ↓
Sends to backend via /api/action
  ↓
Loop back to step 2
```

## File Structure

```
a2ui-chatbot-demo/
├── client/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── A2UIRenderer.tsx
│   │   │   ├── A2UIComponents/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Form.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useA2UI.ts
│   │   ├── pages/
│   │   │   └── ChatPage.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts
│   ├── routes/
│   │   └── chat.ts
│   ├── agents/
│   │   └── geminiAgent.ts
│   ├── a2ui/
│   │   ├── generator.ts
│   │   └── types.ts
│   └── utils/
│       └── sse.ts
├── shared/
│   └── types.ts
├── .env.example
├── package.json
└── ARCHITECTURE.md
```

## Key Technologies

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **Protocol**: A2UI (Agent-to-User Interface)
- **Communication**: Server-Sent Events (SSE) + HTTP

## Environment Variables

```
GOOGLE_GEMINI_KEY=your_gemini_api_key
NODE_ENV=development
PORT=3000
```

## Implementation Phases

1. **Phase 1**: Research & Architecture ✓
2. **Phase 2**: Backend setup with Gemini integration
3. **Phase 3**: A2UI message generator
4. **Phase 4**: Frontend A2UI renderer
5. **Phase 5**: Chat interface & integration
6. **Phase 6**: Testing & refinement

## A2UI Component Mapping

| A2UI Type | React Component | Purpose |
|-----------|-----------------|---------|
| Card | Card.tsx | Container with styling |
| Form | Form.tsx | Form wrapper |
| Input | Input.tsx | Text input field |
| Select | Select.tsx | Dropdown |
| Button | Button.tsx | Clickable button |
| Text | Text.tsx | Display text |
| Row | Row.tsx | Horizontal layout |
| Column | Column.tsx | Vertical layout |
| List | List.tsx | Render list items |
| Image | Image.tsx | Display images |
| Dialog | Dialog.tsx | Modal dialog |
| Divider | Divider.tsx | Visual separator |

## Demo Workflow Example

```
User: "Book me a restaurant"
  ↓
Backend: Gemini generates A2UI surfaceUpdate with restaurant form
  ↓
Frontend: Renders form with restaurant selector, date, time, guests
  ↓
User: Selects "Italian Bistro", date "2026-02-15", 4 guests
  ↓
Frontend: Sends userAction to backend
  ↓
Backend: Gemini processes booking, generates confirmation card
  ↓
Frontend: Renders confirmation with booking details
  ↓
User: Sees "Booking confirmed for 4 guests at Italian Bistro"
```

## Notes

- No database: All data is in-memory for demo purposes
- No authentication: Open demo
- Gemini API key required in environment
- SSE for real-time streaming of A2UI messages
- A2UI protocol enables LLM to generate UI declaratively
