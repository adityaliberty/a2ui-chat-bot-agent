import React from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UIRenderer } from '../A2UIRenderer';

interface RowProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Row: React.FC<RowProps> = ({ component, onAction, dataModel }) => {
  const children = component.children || [];
  return (
    <div className="flex gap-4">
      {children.map((childId: string) => (
        <div key={childId} className="flex-1">
          <A2UIRenderer componentId={childId} onAction={onAction} dataModel={dataModel} />
        </div>
      ))}
    </div>
  );
};
