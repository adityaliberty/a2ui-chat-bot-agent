import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface LabelProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Label: React.FC<LabelProps> = ({ component }) => {
  const { text = '' } = component.properties || {};
  return <label className="block text-sm font-medium text-gray-700 mb-2">{text}</label>;
};
