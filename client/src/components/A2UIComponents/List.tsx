import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface ListProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const List: React.FC<ListProps> = ({ component, dataModel }) => {
  const { items = [] } = component.properties || {};
  return (
    <ul className="list-disc list-inside space-y-2">
      {items.map((item: any, idx: number) => (
        <li key={idx} className="text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
      ))}
    </ul>
  );
};
