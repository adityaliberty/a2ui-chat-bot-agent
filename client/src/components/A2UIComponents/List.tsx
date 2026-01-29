import React from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UIRenderer } from "../A2UIRenderer";

interface ListProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const List: React.FC<ListProps> = ({ component, onAction, dataModel }) => {
  const { items = [] } = component.properties || {};
  const children = component.children || [];

  return (
    <div className="space-y-4">
      {/* Handle items property for simple text lists */}
      {items.length > 0 && (
        <ul className="list-disc list-inside space-y-2">
          {items.map((item: any, idx: number) => (
            <li key={idx} className="text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      )}
      
      {/* Handle children for complex component lists (like Cards) */}
      {children.map((childId: string) => (
        <A2UIRenderer
          key={childId}
          componentId={childId}
          onAction={onAction}
          dataModel={dataModel}
        />
      ))}
    </div>
  );
};
