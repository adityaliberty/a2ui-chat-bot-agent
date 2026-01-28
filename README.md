# A2UI AI Agent Chatbot Demo

An interactive AI agent chatbot powered by **Google Gemini** that showcases the **A2UI (Agent-to-User Interface) protocol**. The chatbot can perform real-world tasks like restaurant booking, project management, flight booking, and event planning by rendering dynamic forms, cards, and interactive elements directly in the chat interface.

## 🎯 Overview

This demo demonstrates how AI agents can generate rich, interactive user interfaces using the A2UI protocol. Instead of just returning text, the Gemini AI generates declarative JSON messages that describe UI components, which are then rendered in real-time in the chat interface.

### Key Features

- **A2UI Protocol Implementation**: Full support for A2UI message types (surfaceUpdate, dataModelUpdate, beginRendering)
- **Real-time Streaming**: Server-Sent Events (SSE) for progressive UI rendering
- **Interactive Components**: Forms, cards, buttons, inputs, selects, and more
- **Multiple Task Scenarios**:
  - 🍽️ Restaurant Booking
  - 📋 Project Management
  - ✈️ Flight Booking
  - 🎉 Event Planning
  - ✅ Task Scheduling
- **No Database Required**: Demo-only, all data is in-memory
- **Simple Setup**: Just add your Gemini API key

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Google Gemini API key (get it from [ai.google.dev](https://ai.google.dev))

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd a2ui-chatbot-demo
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   GOOGLE_GEMINI_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## 📝 Usage Examples

Try these prompts to see the A2UI protocol in action:

### Restaurant Booking
```
"Book me a restaurant"
"I want to reserve a table for 4 people"
"Find a restaurant for dinner"
```

### Project Management
```
"Create a new project"
"I need to manage a project"
"Start a new team project"
```

### Flight Booking
```
"Book a flight"
"Search for flights"
"I need to travel"
```

### Event Planning
```
"Plan an event"
"Organize a party"
"Help me plan an event"
```

### Task Scheduling
```
"Add a task"
"Create a task list"
"Schedule a task"
```

## 🏗️ Architecture

### Frontend (React)
- **ChatInterface**: Main chat component with message history
- **A2UIRenderer**: Renders A2UI components dynamically
- **A2UIComponents**: Individual component implementations (Card, Form, Input, Button, etc.)
- **A2UISurfaceContext**: React context for managing A2UI surfaces

### Backend (Node.js + Express)
- **Gemini Agent**: Processes user messages and generates A2UI responses
- **A2UI Generator**: Utility for creating A2UI messages
- **Chat Routes**: SSE endpoints for streaming responses
- **Action Handler**: Processes user interactions from A2UI components

### Communication Flow
```
User Input
    ↓
POST /api/chat (with SSE stream)
    ↓
Gemini generates A2UI JSON
    ↓
Backend streams A2UI messages
    ↓
Frontend renders components
    ↓
User interacts with UI
    ↓
POST /api/action
    ↓
Gemini processes action
    ↓
Loop back to step 3
```

## 📁 Project Structure

```
a2ui-chatbot-demo/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx          # Main chat component
│   │   │   ├── A2UIRenderer.tsx           # A2UI renderer
│   │   │   └── A2UIComponents/            # Individual components
│   │   │       ├── Card.tsx
│   │   │       ├── Form.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Text.tsx
│   │   │       ├── Row.tsx
│   │   │       ├── Column.tsx
│   │   │       ├── List.tsx
│   │   │       ├── Label.tsx
│   │   │       └── Divider.tsx
│   │   ├── contexts/
│   │   │   └── A2UISurfaceContext.tsx
│   │   ├── types/
│   │   │   └── a2ui.ts                   # A2UI type definitions
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts                          # Express server
│   ├── routes/
│   │   └── chat.ts                       # Chat API routes
│   ├── agents/
│   │   └── geminiAgent.ts                # Gemini integration
│   ├── a2ui/
│   │   └── generator.ts                  # A2UI message generator
│   └── utils/
├── shared/
│   └── types.ts                          # Shared type definitions
├── ARCHITECTURE.md                       # Detailed architecture
├── .env.example                          # Environment variables template
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Google Gemini API Key
GOOGLE_GEMINI_KEY=your_gemini_api_key_here

# Optional
NODE_ENV=development
PORT=3000
```

### Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into `.env.local`

## 🎨 A2UI Protocol Overview

The A2UI protocol is a declarative, JSON-based protocol for AI agents to generate UIs. Key concepts:

### Message Types

**Server → Client:**
- `surfaceUpdate`: Add/update components
- `dataModelUpdate`: Update data
- `beginRendering`: Signal to render
- `deleteSurface`: Remove surface

**Client → Server:**
- `userAction`: User interaction
- `error`: Error report

### Example A2UI Message

```json
{
  "type": "surfaceUpdate",
  "surfaceId": "main",
  "components": [
    {
      "id": "card1",
      "type": "Card",
      "properties": { "title": "Book Restaurant" },
      "children": ["form1"]
    },
    {
      "id": "form1",
      "type": "Form",
      "children": ["input1", "button1"]
    }
  ]
}
```

## 🚀 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm check

# Format code
pnpm format

# Preview production build
pnpm preview
```

### Adding New Task Types

1. Add task detection in `server/agents/geminiAgent.ts`
2. Create form generator in `server/a2ui/generator.ts`
3. Add action handler in `geminiAgent.handleUserAction()`

Example:
```typescript
if (lowerMessage.includes('your-task')) {
  context.taskType = 'your_task';
  return A2UIGenerator.yourTaskForm(surfaceId);
}
```

### Adding New A2UI Components

1. Create component file in `client/src/components/A2UIComponents/`
2. Add component type to `client/src/types/a2ui.ts`
3. Add case in `A2UIRenderer.tsx`

Example:
```typescript
// MyComponent.tsx
export const MyComponent: React.FC<MyComponentProps> = ({ component, onAction }) => {
  return <div>My Component</div>;
};
```

## 📚 Learning Resources

- [A2UI Protocol Specification](https://github.com/google/A2UI)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🔒 Security Notes

- **API Key**: Never commit `.env.local` to version control
- **No Authentication**: This is a demo - add authentication for production
- **No Database**: All data is in-memory - add persistence for production
- **Input Validation**: Add proper validation for production use

## 🐛 Troubleshooting

### "Cannot find module '@google/generative-ai'"
```bash
pnpm add @google/generative-ai
```

### "GOOGLE_GEMINI_KEY is not defined"
- Check that `.env.local` exists
- Verify the API key is correct
- Restart the development server

### "SSE connection fails"
- Check browser console for errors
- Verify backend is running on port 3000
- Check CORS settings if running on different domains

### "Components not rendering"
- Check browser DevTools console for errors
- Verify A2UI messages are being received
- Check that component types are supported

## 📝 Notes

- This is a **demo project** for showcasing the A2UI protocol
- No database is used - all data is in-memory and will be lost on restart
- No authentication is implemented - add for production use
- Gemini responses are not guaranteed to always generate valid A2UI JSON
- Some edge cases may not be handled

## 🎓 What You'll Learn

- How to implement the A2UI protocol
- Building real-time streaming UIs with React
- Integrating Google Gemini API
- Server-Sent Events (SSE) for progressive rendering
- Building interactive AI agent interfaces
- TypeScript with React and Express

## 📄 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to fork and extend it!

## 💡 Future Enhancements

- [ ] Add database persistence
- [ ] Implement user authentication
- [ ] Add more task scenarios
- [ ] Improve error handling
- [ ] Add image generation support
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Mobile app version

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the ARCHITECTURE.md file
3. Check the A2UI protocol documentation
4. Review console logs for errors

---

**Built with ❤️ to showcase the A2UI protocol**
