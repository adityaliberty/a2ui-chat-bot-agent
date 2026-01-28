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

RESPONSE FORMAT:
You MUST respond with a JSON object containing:
1. "text": A conversational text response.
2. "a2ui": An optional object containing the UI structure:
   - "components": An array of A2UI components.
   - "rootComponentId": The ID of the component to start rendering from.
   - "dataModel": Initial data for the UI.

A2UI COMPONENT TYPES:
- Text: { id, type: "Text", properties: { text: string } }
- Button: { id, type: "Button", properties: { label: string, action: string } }
- Input: { id, type: "Input", properties: { placeholder: string, type: "text"|"number"|"date"|"time" } }
- Image: { id, type: "Image", properties: { src: string, alt: string } }
- Card: { id, type: "Card", properties: { title: string }, children: string[] }
- Form: { id, type: "Form", properties: { onSubmit: "submit" }, children: string[] }
- Column: { id, type: "Column", children: string[] }
- Row: { id, type: "Row", children: string[] }

INTERACTIVE WORKFLOW EXAMPLE (Restaurant Booking):
1. User: "Give me top 5 sushi restaurants in Bangalore"
   Response: Text with recommendations + A2UI Column of Cards (Image, Name, Location, "Book Now" Button with action "book-restaurant-{id}").
2. User clicks "Book Now":
   Response: Text "Let's book a table" + A2UI Form (Date Input, Guests Input, "Confirm" Button).
3. User submits Form:
   Response: Text "Booking confirmed!" + A2UI Card showing details.

IMPORTANT:
- Always use unique IDs for components.
- Buttons should have descriptive 'action' strings.
- Forms should have 'onSubmit' property.
- When a user performs an action, you will receive a message describing the action and data. Respond with the next step in the workflow.
- Ensure the UI is interactive and visually appealing.`;
  }

  clearContext(userId: string): void {
    this.conversationContexts.delete(userId);
  }
}

export const geminiAgent = new GeminiAgent();
