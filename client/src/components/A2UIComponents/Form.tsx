import React, { useState } from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UIRenderer } from '../A2UIRenderer';

interface FormProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Form: React.FC<FormProps> = ({ component, onAction, dataModel }) => {
  const children = component.children || [];
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(component.id, 'submit', formData);
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children.map((childId: string) => (
        <div key={childId}>
          <A2UIRenderer
            componentId={childId}
            onAction={(cId, action, data) => {
              if (action === 'change') {
                handleInputChange(cId, data?.value);
              } else if (action !== 'click' || cId !== component.id) {
                onAction(cId, action, data);
              }
            }}
            dataModel={dataModel}
          />
        </div>
      ))}
    </form>
  );
};
