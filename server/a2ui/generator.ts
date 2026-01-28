import { A2UIComponent, SurfaceUpdate, DataModelUpdate, BeginRendering } from '../../shared/types.js';

/**
 * A2UI Message Generator
 * Utilities for creating A2UI protocol messages
 */

export class A2UIGenerator {
  /**
   * Create a surfaceUpdate message with components
   */
  static surfaceUpdate(surfaceId: string, components: A2UIComponent[]): SurfaceUpdate {
    return {
      type: 'surfaceUpdate',
      surfaceId,
      components,
    };
  }

  /**
   * Create a dataModelUpdate message
   */
  static dataModelUpdate(surfaceId: string, data: Record<string, any>): DataModelUpdate {
    return {
      type: 'dataModelUpdate',
      surfaceId,
      data,
    };
  }

  /**
   * Create a beginRendering message
   */
  static beginRendering(surfaceId: string, rootComponentId: string, catalog = 'default'): BeginRendering {
    return {
      type: 'beginRendering',
      surfaceId,
      rootComponentId,
      catalog,
    };
  }

  /**
   * Create a simple text component
   */
  static text(id: string, text: string): A2UIComponent {
    return {
      id,
      type: 'Text',
      properties: { text },
    };
  }

  /**
   * Create a button component
   */
  static button(id: string, label: string, action?: string): A2UIComponent {
    return {
      id,
      type: 'Button',
      properties: { label, action: action || 'click' },
    };
  }

  /**
   * Create an input component
   */
  static input(id: string, placeholder: string, type = 'text'): A2UIComponent {
    return {
      id,
      type: 'Input',
      properties: { placeholder, type },
    };
  }

  /**
   * Create a select component
   */
  static select(id: string, options: Array<{ label: string; value: string }>): A2UIComponent {
    return {
      id,
      type: 'Select',
      properties: { options },
    };
  }

  /**
   * Create a card component
   */
  static card(id: string, title: string, children: string[]): A2UIComponent {
    return {
      id,
      type: 'Card',
      properties: { title },
      children,
    };
  }

  /**
   * Create a form component
   */
  static form(id: string, children: string[]): A2UIComponent {
    return {
      id,
      type: 'Form',
      properties: { onSubmit: 'submitForm' },
      children,
    };
  }

  /**
   * Create a row (horizontal layout) component
   */
  static row(id: string, children: string[]): A2UIComponent {
    return {
      id,
      type: 'Row',
      children,
    };
  }

  /**
   * Create a column (vertical layout) component
   */
  static column(id: string, children: string[]): A2UIComponent {
    return {
      id,
      type: 'Column',
      children,
    };
  }

  /**
   * Create a list component
   */
  static list(id: string, items: string[]): A2UIComponent {
    return {
      id,
      type: 'List',
      properties: { items },
    };
  }

  /**
   * Create a label component
   */
  static label(id: string, text: string): A2UIComponent {
    return {
      id,
      type: 'Label',
      properties: { text },
    };
  }

  /**
   * Create a divider component
   */
  static divider(id: string): A2UIComponent {
    return {
      id,
      type: 'Divider',
    };
  }

  /**
   * Create an image component
   */
  static image(id: string, src: string, alt?: string): A2UIComponent {
    return {
      id,
      type: 'Image',
      properties: { src, alt, className: 'w-full h-32' },
    };
  }

  /**
   * Generate restaurant list for selection
   */
  static restaurantList(surfaceId: string, restaurants: any[]): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const restaurantComponents: A2UIComponent[] = [];
    const cardIds: string[] = [];

    restaurants.forEach((r, i) => {
      const cardId = `restCard-${i}`;
      const imgId = `restImg-${i}`;
      const nameId = `restName-${i}`;
      const locId = `restLoc-${i}`;
      const btnId = `restBtn-${i}`;

      restaurantComponents.push(
        this.card(cardId, '', [imgId, nameId, locId, btnId]),
        this.image(imgId, r.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60', r.name),
        this.text(nameId, `**${r.name}**`),
        this.text(locId, `📍 ${r.location || 'Bangalore'}`),
        this.button(btnId, 'Book Now', `book-restaurant-${r.id}`)
      );
      cardIds.push(cardId);
    });

    const rootId = 'restaurantListRoot';
    const components = [
      this.column(rootId, cardIds),
      ...restaurantComponents
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.dataModelUpdate(surfaceId, { restaurants }),
      this.beginRendering(surfaceId, rootId),
    ];
  }

  /**
   * Generate restaurant booking form
   */
  static restaurantBookingForm(surfaceId: string, restaurantName?: string): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const title = restaurantName ? `Book at ${restaurantName}` : 'Book a Restaurant';
    const components: A2UIComponent[] = [
      this.card('bookingCard', title, ['bookingForm']),
      this.form('bookingForm', ['dateLabel', 'dateInput', 'timeLabel', 'timeInput', 'guestsLabel', 'guestsInput', 'submitBtn']),
      this.label('dateLabel', 'Date'),
      this.input('dateInput', 'YYYY-MM-DD', 'date'),
      this.label('timeLabel', 'Time'),
      this.input('timeInput', 'HH:MM', 'time'),
      this.label('guestsLabel', 'Number of Guests'),
      this.input('guestsInput', 'Enter number', 'number'),
      this.button('submitBtn', 'Confirm Booking'),
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.beginRendering(surfaceId, 'bookingCard'),
    ];
  }

  /**
   * Generate project creation form
   */
  static projectCreationForm(surfaceId: string): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const components: A2UIComponent[] = [
      this.card('projectCard', 'Create a Project', ['projectForm']),
      this.form('projectForm', ['nameLabel', 'nameInput', 'descLabel', 'descInput', 'teamLabel', 'teamInput', 'deadlineLabel', 'deadlineInput', 'submitBtn']),
      this.label('nameLabel', 'Project Name'),
      this.input('nameInput', 'Enter project name'),
      this.label('descLabel', 'Description'),
      this.input('descInput', 'Enter project description'),
      this.label('teamLabel', 'Team Members'),
      this.input('teamInput', 'Enter team member names (comma separated)'),
      this.label('deadlineLabel', 'Deadline'),
      this.input('deadlineInput', 'YYYY-MM-DD', 'date'),
      this.button('submitBtn', 'Create Project'),
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.dataModelUpdate(surfaceId, { projectId: null, status: 'creating' }),
      this.beginRendering(surfaceId, 'projectCard'),
    ];
  }

  /**
   * Generate confirmation card
   */
  static confirmationCard(surfaceId: string, title: string, details: Record<string, any>): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const components: A2UIComponent[] = [
      this.card('confirmCard', title, ['confirmText', 'detailsText', 'newTaskBtn']),
      this.text('confirmText', '✓ Successfully completed!'),
      this.text('detailsText', detailsText),
      this.button('newTaskBtn', 'Start New Task'),
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.dataModelUpdate(surfaceId, { confirmed: true, details }),
      this.beginRendering(surfaceId, 'confirmCard'),
    ];
  }

  /**
   * Generate error card
   */
  static errorCard(surfaceId: string, message: string): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const components: A2UIComponent[] = [
      this.card('errorCard', 'Error', ['errorText', 'retryBtn']),
      this.text('errorText', `❌ ${message}`),
      this.button('retryBtn', 'Try Again'),
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.dataModelUpdate(surfaceId, { error: message }),
      this.beginRendering(surfaceId, 'errorCard'),
    ];
  }

  /**
   * Generate task list
   */
  static taskList(surfaceId: string, tasks: Array<{ id: string; title: string; status: string }>): Array<SurfaceUpdate | DataModelUpdate | BeginRendering> {
    const taskComponents = tasks.map((task, idx) =>
      this.text(`task-${idx}`, `• ${task.title} [${task.status}]`)
    );

    const components: A2UIComponent[] = [
      this.card('taskCard', 'Tasks', ['taskListContainer', 'addTaskBtn']),
      this.column('taskListContainer', taskComponents.map(c => c.id)),
      this.button('addTaskBtn', 'Add New Task'),
      ...taskComponents,
    ];

    return [
      this.surfaceUpdate(surfaceId, components),
      this.dataModelUpdate(surfaceId, { tasks }),
      this.beginRendering(surfaceId, 'taskCard'),
    ];
  }
}
