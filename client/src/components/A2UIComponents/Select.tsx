import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface SelectProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Select: React.FC<SelectProps> = ({ component, onAction }) => {
  const { options = [] } = component.properties || {};

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAction(component.id, 'change', { value: e.target.value });
  };

  return (
    <select
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select an option</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
