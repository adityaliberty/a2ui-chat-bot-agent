// A2UI Protocol Types for Frontend

export type A2UIMessageType = 'surfaceUpdate' | 'dataModelUpdate' | 'beginRendering' | 'deleteSurface';
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

export interface A2UIComponent {
  id: string;
  type: ComponentType;
  properties?: Record<string, any>;
  children?: string[];
}

export interface SurfaceUpdate {
  type: 'surfaceUpdate';
  surfaceId: string;
  components: A2UIComponent[];
}

export interface DataModelUpdate {
  type: 'dataModelUpdate';
  surfaceId: string;
  data: Record<string, any>;
}

export interface BeginRendering {
  type: 'beginRendering';
  surfaceId: string;
  rootComponentId: string;
  catalog?: string;
}

export interface DeleteSurface {
  type: 'deleteSurface';
  surfaceId: string;
}

export type A2UIMessage = SurfaceUpdate | DataModelUpdate | BeginRendering | DeleteSurface;

export interface Surface {
  id: string;
  rootComponentId: string;
  components: Map<string, A2UIComponent>;
  dataModel: Record<string, any>;
}
