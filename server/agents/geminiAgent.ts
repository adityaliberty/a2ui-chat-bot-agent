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
   - When showing multiple items, use a "Column" or "List" as the root component.
   - For "Column" or "List", put the IDs of the child components in the "children" array.
3. LABELS & TEXT:
   - EVERY Input MUST have a preceding "Label" component or a clear "placeholder".
   - EVERY Card MUST have a descriptive "title".
   - EVERY Button MUST have a clear, action-oriented "label".
4. IMAGES (CRITICAL):
   - Images MUST use high-quality, direct Unsplash URLs.
   - ALWAYS use this format: https://images.unsplash.com/photo-[ID]?w=800&auto=format&fit=crop
   - Sushi: https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop
   - Indian Sweets: https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&auto=format&fit=crop
   - General Restaurants: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop
   - Flights: https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=800&auto=format&fit=crop
5. ACTIONS:
   - "Get Directions": Use action "open_maps" and include "destination" in properties.
   - "Book Table": Use action "show_booking_form" and include "restaurant_name" and "restaurant_image" in properties.

6. RESTAURANT BOOKING WORKFLOW (STRICT MULTI-STEP):
   - Step 1: Search results. Show a List of Cards. Each Card MUST include an Image, Title (Restaurant Name), Description (Cuisine, Rating), and a "Book Table" button.
   - Step 2: Form. When "Book Table" is clicked, show a Form. DO NOT ask for the restaurant name. Include an Image of the restaurant at the top of the form for context. Provide Inputs for Date, Time, and Number of Guests.
   - Step 3: Confirmation. After form submission, show a "Card" titled "Reservation Confirmed". Display an Image of the restaurant, and a Text component summarizing ALL details: Restaurant Name, Date, Time, and Guests.

7. FLIGHT BOOKING WORKFLOW:
   - Step 1: Search results. Show Cards with flight details and a "Select Flight" button (action: "select_flight", data: flight details).
   - Step 2: Selection. Confirm selection and show a Form for passenger details.
   - Step 3: Confirmation. After form submission, show a final "Card" titled "Booking Confirmed" that displays ALL details: Flight, Passenger Name, Date, and a Booking Reference.

COMPONENT TYPES:
- Text, Button, Input, Image, Card, Form, Column, Row, List, Label, Divider.

EXAMPLE RESTAURANT CARD:
{
  "id": "rest_card_1",
  "type": "Card",
  "properties": { "title": "Baba Sweets" },
  "children": ["rest_img_1", "rest_desc_1", "rest_btn_1"]
}
{
  "id": "rest_btn_1",
  "type": "Button",
  "properties": { "label": "Book Table", "action": "show_booking_form", "restaurant_name": "Baba Sweets", "restaurant_image": "https://..." }
}`;
  }

  clearContext(userId: string): void {
    this.conversationContexts.delete(userId);
  }
}

export const geminiAgent = new GeminiAgent();
