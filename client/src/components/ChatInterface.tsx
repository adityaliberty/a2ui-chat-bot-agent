import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { A2UIMessage, Surface } from '@/types/a2ui';
import { A2UISurfaceProvider } from '@/contexts/A2UISurfaceContext';
import { A2UIRenderer } from './A2UIRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  surface?: Surface;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(() => nanoid());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, userId }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message | null = null;
      
      // Use a consistent surface ID for the conversation
      const surface: Surface = {
        id: `surface-${userId}`,
        rootComponentId: '',
        components: new Map(),
        dataModel: {},
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'text') {
                if (!assistantMessage) {
                  assistantMessage = {
                    id: nanoid(),
                    role: 'assistant',
                    content: data.content,
                    surface,
                  };
                  setMessages(prev => [...prev, assistantMessage!]);
                } else {
                  assistantMessage.content = data.content;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = assistantMessage!;
                    return updated;
                  });
                }
              } else if (data.type === 'a2ui') {
                const msg: A2UIMessage = data.content;
                if (msg.type === 'surfaceUpdate') {
                  msg.components.forEach(comp => {
                    surface.components.set(comp.id, comp);
                  });
                } else if (msg.type === 'dataModelUpdate') {
                  surface.dataModel = { ...surface.dataModel, ...msg.data };
                } else if (msg.type === 'beginRendering') {
                  surface.rootComponentId = msg.rootComponentId;
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: nanoid(),
          role: 'assistant',
          content: 'Error: Failed to process request',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    surfaceId: string,
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => {
    setLoading(true);

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, surfaceId, componentId, action, data }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message | null = null;
      
      // Keep using the same surface for the response
      const surface: Surface = {
        id: surfaceId,
        rootComponentId: '',
        components: new Map(),
        dataModel: {},
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const msg = JSON.parse(line.slice(6));

              if (msg.type === 'text') {
                if (!assistantMessage) {
                  assistantMessage = {
                    id: nanoid(),
                    role: 'assistant',
                    content: msg.content,
                    surface,
                  };
                  setMessages(prev => [...prev, assistantMessage!]);
                }
              } else if (msg.type === 'a2ui') {
                const a2uiMsg: A2UIMessage = msg.content;
                if (a2uiMsg.type === 'surfaceUpdate') {
                  a2uiMsg.components.forEach(comp => {
                    surface.components.set(comp.id, comp);
                  });
                } else if (a2uiMsg.type === 'dataModelUpdate') {
                  surface.dataModel = { ...surface.dataModel, ...a2uiMsg.data };
                } else if (a2uiMsg.type === 'beginRendering') {
                  surface.rootComponentId = a2uiMsg.rootComponentId;
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">A2UI Agent Chatbot Demo</h1>
        <p className="text-sm text-gray-600 mt-1">
          Try: "Book a restaurant", "Create a project", "Book a flight", "Plan an event"
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to A2UI Chatbot</h2>
              <p className="text-gray-600">Start by typing a message to interact with the AI agent.</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-lg p-3'
                  : 'bg-white text-gray-900 rounded-lg p-4 border border-gray-200'
              }`}
            >
              <p className="mb-2">{msg.content}</p>
              {msg.surface && msg.surface.rootComponentId && (
                <A2UISurfaceProvider surface={msg.surface}>
                  <A2UIRenderer
                    componentId={msg.surface.rootComponentId}
                    onAction={(cId, action, data) => handleAction(msg.surface!.id, cId, action, data)}
                    dataModel={msg.surface.dataModel}
                  />
                </A2UISurfaceProvider>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 rounded-lg p-4 border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
