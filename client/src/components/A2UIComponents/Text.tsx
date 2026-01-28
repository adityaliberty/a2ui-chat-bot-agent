import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface TextProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Text: React.FC<TextProps> = ({ component }) => {
  const { text = '' } = component.properties || {};
  return <p className="text-gray-700">{text}</p>;
};
