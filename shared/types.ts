// A2UI Protocol Types

export type A2UIMessageType = 'surfaceUpdate' | 'dataModelUpdate' | 'beginRendering' | 'deleteSurface';
export type ClientMessageType = 'userAction' | 'error';

// Component types
export type ComponentType = 
  | 'Card' 
  | 'Form' 
  | 'Input' 
  | 'Select' 
  | 'Button' 
  | 'Text' 
  | 'Row' 
  | 'Column' 
  | 'List' 
  | 'Image' 
  | 'Dialog' 
  | 'Divider'
  | 'Label'
  | 'Textarea';

// Server to Client Messages
export interface A2UIMessage {
  type: A2UIMessageType;
  surfaceId: string;
}

export interface SurfaceUpdate extends A2UIMessage {
  type: 'surfaceUpdate';
  components: A2UIComponent[];
}

export interface DataModelUpdate extends A2UIMessage {
  type: 'dataModelUpdate';
  data: Record<string, any>;
}

export interface BeginRendering extends A2UIMessage {
  type: 'beginRendering';
  rootComponentId: string;
  catalog?: string;
}

export interface DeleteSurface extends A2UIMessage {
  type: 'deleteSurface';
}

export interface A2UIComponent {
  id: string;
  type: ComponentType;
  properties?: Record<string, any>;
  children?: string[];
}

// Client to Server Messages
export interface ClientMessage {
  type: ClientMessageType;
  surfaceId: string;
}

export interface UserAction extends ClientMessage {
  type: 'userAction';
  componentId: string;
  action: string;
  data?: Record<string, any>;
}

export interface ErrorMessage extends ClientMessage {
  type: 'error';
  message: string;
  componentId?: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  a2uiSurfaceId?: string;
}

// Task Context for Gemini
export interface TaskContext {
  taskType: 'restaurant_booking' | 'project_management' | 'flight_booking' | 'event_planning' | 'task_scheduler' | 'general';
  currentStep: string;
  data: Record<string, any>;
  history: ChatMessage[];
}

// Gemini Response
export interface GeminiResponse {
  text: string;
  a2uiMessages: A2UIMessage[];
  taskContext?: TaskContext;
}
