import { GoogleGenerativeAI } from "@google/generative-ai";
import { A2UIMessage } from "../../shared/types.js";
import { A2UIGenerator } from "../a2ui/generator.js";

const genAI = new GoogleGenerativeAI("AIzaSyDJf9wNuf252fpn367lG3ihDCXZg8dtK1k");

interface ConversationContext {
  messages: Array<{ role: string; content: string }>;
  taskType: string;
  taskData: Record<string, any>;
}

export class GeminiAgent {
  private conversationContexts: Map<string, ConversationContext> = new Map();

  /**
   * Process user message and generate A2UI response
   */
  async processMessage(
    userId: string,
    userMessage: string,
    surfaceId: string
  ): Promise<{ text: string; a2uiMessages: A2UIMessage[] }> {
    // Get or create conversation context
    let context = this.conversationContexts.get(userId);
    if (!context) {
      context = {
        messages: [],
        taskType: "general",
        taskData: {},
      };
      this.conversationContexts.set(userId, context);
    }

    // Add user message to history
    context.messages.push({ role: "user", content: userMessage });

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const conversationHistory = context.messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude current message
    });

    const response = await chat.sendMessage(userMessage);
    const assistantText = response.response.text();

    // Add assistant response to history
    context.messages.push({ role: "assistant", content: assistantText });

    // Parse response and generate A2UI messages
    const a2uiMessages = this.parseResponseAndGenerateA2UI(
      assistantText,
      userMessage,
      surfaceId,
      context
    );

    return {
      text: assistantText,
      a2uiMessages,
    };
  }

  /**
   * Build system prompt for Gemini
   */
  private buildSystemPrompt(context: ConversationContext): string {
    return `You are an AI assistant that helps users with various tasks. You can help with:
1. Restaurant Booking - Help users find and book restaurants
2. Project Management - Help users create and manage projects
3. Flight Booking - Help users search and book flights
4. Event Planning - Help users plan events
5. Task Scheduling - Help users create and track tasks

When responding:
- Be helpful and conversational
- Ask clarifying questions if needed
- Provide clear confirmations when tasks are completed
- Suggest next steps

Current task type: ${context.taskType}
Current task data: ${JSON.stringify(context.taskData)}

Keep responses concise and actionable.`;
  }

  /**
   * Parse Gemini response and generate A2UI messages
   */
  private parseResponseAndGenerateA2UI(
    assistantText: string,
    userMessage: string,
    surfaceId: string,
    context: ConversationContext
  ): A2UIMessage[] {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = assistantText.toLowerCase();

    // Detect task type from user message
    if (
      lowerMessage.includes("restaurant") ||
      lowerMessage.includes("book") ||
      lowerMessage.includes("table") ||
      lowerMessage.includes("dinner")
    ) {
      context.taskType = "restaurant_booking";
      return A2UIGenerator.restaurantBookingForm(surfaceId);
    }

    if (
      lowerMessage.includes("project") ||
      lowerMessage.includes("task") ||
      lowerMessage.includes("team")
    ) {
      context.taskType = "project_management";
      return A2UIGenerator.projectCreationForm(surfaceId);
    }

    if (
      lowerMessage.includes("flight") ||
      lowerMessage.includes("book flight") ||
      lowerMessage.includes("travel")
    ) {
      context.taskType = "flight_booking";
      return this.generateFlightBookingForm(surfaceId);
    }

    if (
      lowerMessage.includes("event") ||
      lowerMessage.includes("plan") ||
      lowerMessage.includes("party")
    ) {
      context.taskType = "event_planning";
      return this.generateEventPlanningForm(surfaceId);
    }

    // If response contains confirmation keywords, show confirmation
    if (
      lowerResponse.includes("confirmed") ||
      lowerResponse.includes("booked") ||
      lowerResponse.includes("created") ||
      lowerResponse.includes("scheduled")
    ) {
      const details = this.extractDetailsFromResponse(assistantText, context);
      return A2UIGenerator.confirmationCard(surfaceId, "Confirmation", details);
    }

    // Default: show a simple text response
    return [
      A2UIGenerator.surfaceUpdate(surfaceId, [
        A2UIGenerator.card("responseCard", "Response", ["responseText"]),
        A2UIGenerator.text("responseText", assistantText),
      ]),
      A2UIGenerator.dataModelUpdate(surfaceId, { response: assistantText }),
      A2UIGenerator.beginRendering(surfaceId, "responseCard"),
    ];
  }

  /**
   * Generate flight booking form
   */
  private generateFlightBookingForm(surfaceId: string): A2UIMessage[] {
    const components = [
      A2UIGenerator.card("flightCard", "Book a Flight", ["flightForm"]),
      A2UIGenerator.form("flightForm", [
        "fromLabel",
        "fromInput",
        "toLabel",
        "toInput",
        "dateLabel",
        "dateInput",
        "passengersLabel",
        "passengersInput",
        "submitBtn",
      ]),
      A2UIGenerator.label("fromLabel", "From"),
      A2UIGenerator.input("fromInput", "Departure city"),
      A2UIGenerator.label("toLabel", "To"),
      A2UIGenerator.input("toInput", "Destination city"),
      A2UIGenerator.label("dateLabel", "Date"),
      A2UIGenerator.input("dateInput", "YYYY-MM-DD", "date"),
      A2UIGenerator.label("passengersLabel", "Passengers"),
      A2UIGenerator.input("passengersInput", "Number of passengers", "number"),
      A2UIGenerator.button("submitBtn", "Search Flights"),
    ];

    return [
      A2UIGenerator.surfaceUpdate(surfaceId, components),
      A2UIGenerator.dataModelUpdate(surfaceId, {
        flights: [
          {
            id: 1,
            airline: "SkyAir",
            departure: "10:00",
            arrival: "14:30",
            price: "$250",
          },
          {
            id: 2,
            airline: "CloudFlyer",
            departure: "12:00",
            arrival: "16:45",
            price: "$280",
          },
        ],
      }),
      A2UIGenerator.beginRendering(surfaceId, "flightCard"),
    ];
  }

  /**
   * Generate event planning form
   */
  private generateEventPlanningForm(surfaceId: string): A2UIMessage[] {
    const components = [
      A2UIGenerator.card("eventCard", "Plan an Event", ["eventForm"]),
      A2UIGenerator.form("eventForm", [
        "eventNameLabel",
        "eventNameInput",
        "dateLabel",
        "dateInput",
        "locationLabel",
        "locationInput",
        "guestCountLabel",
        "guestCountInput",
        "budgetLabel",
        "budgetInput",
        "submitBtn",
      ]),
      A2UIGenerator.label("eventNameLabel", "Event Name"),
      A2UIGenerator.input("eventNameInput", "Enter event name"),
      A2UIGenerator.label("dateLabel", "Date"),
      A2UIGenerator.input("dateInput", "YYYY-MM-DD", "date"),
      A2UIGenerator.label("locationLabel", "Location"),
      A2UIGenerator.input("locationInput", "Enter location"),
      A2UIGenerator.label("guestCountLabel", "Guest Count"),
      A2UIGenerator.input("guestCountInput", "Number of guests", "number"),
      A2UIGenerator.label("budgetLabel", "Budget ($)"),
      A2UIGenerator.input("budgetInput", "Enter budget", "number"),
      A2UIGenerator.button("submitBtn", "Plan Event"),
    ];

    return [
      A2UIGenerator.surfaceUpdate(surfaceId, components),
      A2UIGenerator.dataModelUpdate(surfaceId, { eventId: null }),
      A2UIGenerator.beginRendering(surfaceId, "eventCard"),
    ];
  }

  /**
   * Extract details from response text
   */
  private extractDetailsFromResponse(
    text: string,
    context: ConversationContext
  ): Record<string, any> {
    const details: Record<string, any> = { ...context.taskData };

    // Try to extract common details
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) details.date = dateMatch[1];

    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) details.time = timeMatch[0];

    const guestMatch = text.match(/(\d+)\s*(?:guest|person|people)/i);
    if (guestMatch) details.guests = guestMatch[1];

    return details;
  }

  /**
   * Handle user action from frontend
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

    // Store action data
    context.taskData = { ...context.taskData, ...data };

    // Generate confirmation based on task type
    if (context.taskType === "restaurant_booking") {
      const restaurant = data.restaurantSelect || "Selected restaurant";
      const date = data.dateInput || "Selected date";
      const guests = data.guestsInput || "Number of guests";
      return {
        text: `Great! I've booked a table at ${restaurant} for ${guests} guests on ${date}.`,
        a2uiMessages: A2UIGenerator.confirmationCard(
          surfaceId,
          "Booking Confirmed",
          {
            Restaurant: restaurant,
            Date: date,
            Guests: guests,
            "Confirmation #":
              "RES-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          }
        ),
      };
    }

    if (context.taskType === "project_management") {
      const projectName = data.nameInput || "New Project";
      return {
        text: `Perfect! I've created the project "${projectName}". You can now add tasks and team members.`,
        a2uiMessages: A2UIGenerator.confirmationCard(
          surfaceId,
          "Project Created",
          {
            "Project Name": projectName,
            "Project ID":
              "PROJ-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            Status: "Active",
          }
        ),
      };
    }

    // Default confirmation
    return {
      text: "Action processed successfully!",
      a2uiMessages: A2UIGenerator.confirmationCard(surfaceId, "Success", data),
    };
  }

  /**
   * Clear conversation context
   */
  clearContext(userId: string): void {
    this.conversationContexts.delete(userId);
  }
}

export const geminiAgent = new GeminiAgent();
