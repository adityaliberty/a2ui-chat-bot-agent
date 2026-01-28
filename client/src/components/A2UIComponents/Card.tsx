import React from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UIRenderer } from '../A2UIRenderer';

interface CardProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Card: React.FC<CardProps> = ({ component, onAction, dataModel }) => {
  const { title } = component.properties || {};
  const children = component.children || [];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="space-y-4">
        {children.map((childId: string) => (
          <A2UIRenderer
            key={childId}
            componentId={childId}
            onAction={onAction}
            dataModel={dataModel}
          />
        ))}
      </div>
    </div>
  );
};
