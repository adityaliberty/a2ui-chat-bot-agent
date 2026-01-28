import React from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UIRenderer } from '../A2UIRenderer';

interface ColumnProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Column: React.FC<ColumnProps> = ({ component, onAction, dataModel }) => {
  const children = component.children || [];
  return (
    <div className="flex flex-col gap-4">
      {children.map((childId: string) => (
        <A2UIRenderer key={childId} componentId={childId} onAction={onAction} dataModel={dataModel} />
      ))}
    </div>
  );
};
