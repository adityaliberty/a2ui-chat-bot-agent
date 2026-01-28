import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface ButtonProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Button: React.FC<ButtonProps> = ({ component, onAction }) => {
  const { label = 'Button' } = component.properties || {};

  const handleClick = () => {
    onAction(component.id, 'click');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    >
      {label}
    </button>
  );
};
