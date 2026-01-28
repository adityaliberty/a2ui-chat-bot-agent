import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface DividerProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Divider: React.FC<DividerProps> = () => {
  return <hr className="my-4 border-gray-300" />;
};
