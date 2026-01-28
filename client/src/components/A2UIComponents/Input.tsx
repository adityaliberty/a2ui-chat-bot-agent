import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface InputProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Input: React.FC<InputProps> = ({ component, onAction }) => {
  const { placeholder, type = 'text' } = component.properties || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAction(component.id, 'change', { value: e.target.value });
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
