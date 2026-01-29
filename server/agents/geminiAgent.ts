import { GoogleGenerativeAI } from "@google/generative-ai";
import { A2UIMessage, A2UIComponent } from "../../shared/types.js";
import { A2UIGenerator } from "../a2ui/generator.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

interface ConversationContext {
  messages: Array<{ role: "user" | "model"; content: string }>;
  taskType: string;
  taskData: Record<string, any>;
}

export class GeminiAgent {
  private conversationContexts: Map<string, ConversationContext> = new Map();

  /**
   * Process user message and generate A2UI response using Gemini
   */
  async processMessage(
    userId: string,
    userMessage: string,
    surfaceId: string
  ): Promise<{ text: string; a2uiMessages: A2UIMessage[] }> {
    let context = this.conversationContexts.get(userId);
    if (!context) {
      context = {
        messages: [],
        taskType: "general",
        taskData: {},
      };
      this.conversationContexts.set(userId, context);
    }

    context.messages.push({ role: "user", content: userMessage });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = this.buildSystemPrompt();

    const conversationHistory = context.messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }],
        },
        ...conversationHistory,
      ],
    });

    const responseText = result.response.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return {
        text: "I'm sorry, I encountered an error generating the interface.",
        a2uiMessages: A2UIGenerator.errorCard(
          surfaceId,
          "Invalid response from AI"
        ),
      };
    }

    const { text, a2ui } = parsedResponse;
    context.messages.push({ role: "model", content: text });

    let a2uiMessages: A2UIMessage[] = [];
    if (a2ui && a2ui.components && a2ui.rootComponentId) {
      a2uiMessages = [
        A2UIGenerator.surfaceUpdate(surfaceId, a2ui.components),
        A2UIGenerator.dataModelUpdate(surfaceId, a2ui.dataModel || {}),
        A2UIGenerator.beginRendering(surfaceId, a2ui.rootComponentId),
      ];
    }

    return {
      text,
      a2uiMessages,
    };
  }

  /**
   * Handle user action from frontend using Gemini
   */
  async handleUserAction(
    userId: string,
    action: string,
    data: Record<string, any>,
    surfaceId: string
  ): Promise<{ text: string; a2uiMessages: A2UIMessage[] }> {
    const context = this.conversationContexts.get(userId);
    if (!context) {
      return {
        text: "Session expired",
        a2uiMessages: A2UIGenerator.errorCard(
          surfaceId,
          "Session expired. Please refresh."
        ),
      };
    }

    // Add the action as a user turn
    const actionDesc = `User performed action: "${action}" with data: ${JSON.stringify(data)}`;
    context.messages.push({ role: "user", content: actionDesc });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = context.messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }],
        },
        ...conversationHistory,
      ],
    });

    const responseText = result.response.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      return {
        text: "I'm sorry, I encountered an error processing your action.",
        a2uiMessages: A2UIGenerator.errorCard(
          surfaceId,
          "Invalid response from AI"
        ),
      };
    }

    const { text, a2ui } = parsedResponse;

    context.messages.push({ role: "model", content: text });

    let a2uiMessages: A2UIMessage[] = [];
    if (a2ui && a2ui.components && a2ui.rootComponentId) {
      a2uiMessages = [
        A2UIGenerator.surfaceUpdate(surfaceId, a2ui.components),
        A2UIGenerator.dataModelUpdate(surfaceId, a2ui.dataModel || {}),
        A2UIGenerator.beginRendering(surfaceId, a2ui.rootComponentId),
      ];
    }

    return {
      text,
      a2uiMessages,
    };
  }

  private buildSystemPrompt(): string {
    return `You are an AI assistant that communicates using A2UI (Adaptive Agent User Interface) JSON.
Your goal is to provide interactive, multi-step experiences for users.

CORE RULES:
1. RESPONSE FORMAT: You MUST respond with a JSON object containing:
   - "text": A conversational text response.
   - "a2ui": (Optional) Object with "components" (array), "rootComponentId" (string), and "dataModel" (object).
2. COMPONENT STRUCTURE:
   - When showing multiple items (like restaurants), use a "Column" or "List" as the root component.
   - For "Column" or "List", put the IDs of the child components (e.g., Cards) in the "children" array, NOT the "properties.items" array.
3. INTENT HANDLING: 
   - For simple greetings like "hello" or "hi", respond with a friendly greeting and ask how you can help. DO NOT jump to restaurant recommendations unless asked.
4. IMAGES: Use realistic Unsplash URLs that match the specific context.
   - For Sushi: https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop
   - For Indian Sweets: https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=500&auto=format&fit=crop
   - For General Restaurants: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop
5. ACTIONS:
   - "Get Directions": The action string MUST be "open_maps". You MUST also include a "destination" property in the button's properties (e.g., { "id": "btn_1", "type": "Button", "properties": { "label": "Get Directions", "action": "open_maps", "destination": "Restaurant Name, City" } }).
   - "Book Table": For restaurant results, ALWAYS include a "Book Table" button with action "show_booking_form".
6. COMPONENT TYPES:
   - Text, Button, Input, Image, Card, Form, Column, Row, List, Label, Divider.

A2UI STRUCTURE EXAMPLE (Restaurant Card):
{
  "id": "card_1",
  "type": "Card",
  "properties": { "title": "Restaurant Name" },
  "children": ["img_1", "desc_1", "actions_row"]
}
{
  "id": "actions_row",
  "type": "Row",
  "children": ["btn_book", "btn_directions"]
}

IMPORTANT FOR "GET DIRECTIONS":
When user clicks "Get Directions", the frontend will trigger an action. Your response should include a text like "Opening Google Maps for directions to [Location]..." and you can also provide a Button with a 'url' property if the frontend supports it, but for now, ensure the 'text' is helpful.

IMPORTANT FOR GREETINGS:
User: "hello"
Response: { "text": "Hello! How can I assist you today? I can help with restaurant bookings, project management, and more.", "a2ui": null }`;
  }

  clearContext(userId: string): void {
    this.conversationContexts.delete(userId);
  }
}

export const geminiAgent = new GeminiAgent();
