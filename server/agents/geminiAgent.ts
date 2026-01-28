import { GoogleGenerativeAI } from "@google/generative-ai";
import { A2UIMessage } from "../../shared/types.js";
import { A2UIGenerator } from "../a2ui/generator.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyDJf9wNuf252fpn367lG3ihDCXZg8dtK1k");

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

    // Detect task type from user message with more specific keywords
    if (
      lowerMessage.includes("top 5") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("list") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("shushi") ||
      lowerMessage.includes("sushi") ||
      (lowerMessage.includes("restaurant") && lowerMessage.includes("bangalore"))
    ) {
      context.taskType = "restaurant_booking";
      const sushiRestaurants = [
        { id: '1', name: 'The Fatty Bao', location: 'Indiranagar, Bangalore', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60' },
        { id: '2', name: 'Edo Japanese Restaurant', location: 'ITC Gardenia, Bangalore', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&auto=format&fit=crop&q=60' },
        { id: '3', name: 'Harima', location: 'Residency Road, Bangalore', image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&auto=format&fit=crop&q=60' },
        { id: '4', name: 'Sushimen', location: 'Koramangala, Bangalore', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&auto=format&fit=crop&q=60' },
        { id: '5', name: 'Mikusu', location: 'Conrad Bangalore', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&auto=format&fit=crop&q=60' },
      ];
      context.taskData.restaurants = sushiRestaurants;
      return A2UIGenerator.restaurantList(surfaceId, sushiRestaurants);
    }

    if (
      lowerMessage.includes("book restaurant") ||
      lowerMessage.includes("book a restaurant") ||
      lowerMessage.includes("restaurant booking") ||
      (lowerMessage.includes("restaurant") && (lowerMessage.includes("book") || lowerMessage.includes("reserve")))
    ) {
      context.taskType = "restaurant_booking";
      return A2UIGenerator.restaurantBookingForm(surfaceId);
    }

    if (
      lowerMessage.includes("create project") ||
      lowerMessage.includes("new project") ||
      lowerMessage.includes("manage project") ||
      (lowerMessage.includes("project") && (lowerMessage.includes("create") || lowerMessage.includes("new")))
    ) {
      context.taskType = "project_management";
      return A2UIGenerator.projectCreationForm(surfaceId);
    }

    if (
      lowerMessage.includes("search flight") ||
      lowerMessage.includes("find flight") ||
      lowerMessage.includes("flight to") ||
      lowerMessage.includes("flight from")
    ) {
      context.taskType = "flight_booking";
      const flights = [
        { id: 'f1', airline: 'IndiGo', from: 'BLR', to: 'DEL', time: '06:00 - 08:45', price: '₹5,499', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/IndiGo_A320-232_VT-IFL_at_Indira_Gandhi_International_Airport.jpg/640px-IndiGo_A320-232_VT-IFL_at_Indira_Gandhi_International_Airport.jpg' },
        { id: 'f2', airline: 'Air India', from: 'BLR', to: 'DEL', time: '08:30 - 11:15', price: '₹6,200', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Air_India_Boeing_787-8_Dreamliner_VT-ANQ_at_London_Heathrow_Airport.jpg/640px-Air_India_Boeing_787-8_Dreamliner_VT-ANQ_at_London_Heathrow_Airport.jpg' },
        { id: 'f3', airline: 'Vistara', from: 'BLR', to: 'DEL', time: '10:15 - 13:00', price: '₹7,100', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Vistara_Airbus_A320-251N_VT-TNC_at_Indira_Gandhi_International_Airport.jpg/640px-Vistara_Airbus_A320-251N_VT-TNC_at_Indira_Gandhi_International_Airport.jpg' },
      ];
      context.taskData.flights = flights;
      return this.generateFlightList(surfaceId, flights);
    }

    if (
      lowerMessage.includes("book flight") ||
      lowerMessage.includes("flight booking") ||
      (lowerMessage.includes("flight") && lowerMessage.includes("book"))
    ) {
      context.taskType = "flight_booking";
      return this.generateFlightBookingForm(surfaceId);
    }

    if (
      lowerMessage.includes("plan event") ||
      lowerMessage.includes("event planning") ||
      (lowerMessage.includes("event") && lowerMessage.includes("plan"))
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
   * Generate flight list for selection
   */
  private generateFlightList(surfaceId: string, flights: any[]): A2UIMessage[] {
    const flightComponents: any[] = [];
    const cardIds: string[] = [];

    flights.forEach((f, i) => {
      const cardId = `flightCard-${i}`;
      const imgId = `flightImg-${i}`;
      const infoId = `flightInfo-${i}`;
      const priceId = `flightPrice-${i}`;
      const btnId = `flightBtn-${i}`;

      flightComponents.push(
        A2UIGenerator.card(cardId, '', [imgId, infoId, priceId, btnId]),
        A2UIGenerator.image(imgId, f.image, f.airline),
        A2UIGenerator.text(infoId, `**${f.airline}** | ${f.from} ➔ ${f.to}\n${f.time}`),
        A2UIGenerator.text(priceId, `Price: **${f.price}**`),
        A2UIGenerator.button(btnId, 'Select Flight', `select-flight-${f.id}`)
      );
      cardIds.push(cardId);
    });

    const rootId = 'flightListRoot';
    return [
      A2UIGenerator.surfaceUpdate(surfaceId, [
        A2UIGenerator.column(rootId, cardIds),
        ...flightComponents
      ]),
      A2UIGenerator.beginRendering(surfaceId, rootId),
    ];
  }

  /**
   * Generate flight booking form
   */
  private generateFlightBookingForm(surfaceId: string, flightInfo?: string): A2UIMessage[] {
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

    // Handle flight selection
    if (context.taskType === "flight_booking" && action.startsWith('select-flight-')) {
      const flightId = action.replace('select-flight-', '');
      const flight = context.taskData.flights?.find((f: any) => f.id === flightId);
      context.taskData.selectedFlight = flight;
      return {
        text: `Booking flight ${flight?.airline} from ${flight?.from} to ${flight?.to}.`,
        a2uiMessages: this.generateFlightBookingForm(surfaceId, `${flight?.airline} (${flight?.from}-${flight?.to})`),
      };
    }

    // Generate confirmation based on task type
    if (context.taskType === "restaurant_booking") {
      // Handle "Book Now" button click from the list
      if (action.startsWith('book-restaurant-')) {
        const restId = action.replace('book-restaurant-', '');
        const restaurant = context.taskData.restaurants?.find((r: any) => r.id === restId);
        context.taskData.selectedRestaurant = restaurant;
        return {
          text: `Booking a table at ${restaurant?.name || 'the restaurant'}.`,
          a2uiMessages: A2UIGenerator.restaurantBookingForm(surfaceId, restaurant?.name),
        };
      }

      // Handle form submission
      const restaurant = context.taskData.selectedRestaurant?.name || data.restaurantSelect || "Selected restaurant";
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

    if (context.taskType === "flight_booking") {
      const flight = context.taskData.selectedFlight?.airline || "Selected Flight";
      const from = context.taskData.selectedFlight?.from || data.fromInput || "Origin";
      const to = context.taskData.selectedFlight?.to || data.toInput || "Destination";
      const date = data.dateInput || "Date";
      return {
        text: `Success! Your flight ${flight} from ${from} to ${to} on ${date} is booked.`,
        a2uiMessages: A2UIGenerator.confirmationCard(
          surfaceId,
          "Flight Booked",
          {
            Flight: flight,
            Route: `${from} ➔ ${to}`,
            Date: date,
            "Booking ID": "FLT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
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
