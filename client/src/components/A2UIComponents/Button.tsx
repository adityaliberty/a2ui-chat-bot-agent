import React from "react";
import { A2UIComponent } from "@/types/a2ui";

interface ButtonProps {
  component: A2UIComponent;
  onAction: (
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => void;
  dataModel: Record<string, any>;
}

export const Button: React.FC<ButtonProps> = ({ component, onAction }) => {
  const { label = "Button" } = component.properties || {};

  const handleClick = () => {
    const action = component.properties?.action || "click";
    
    // Handle special actions like opening maps
    if (action === "open_maps") {
      const destination = component.properties?.destination || "";
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
      window.open(url, "_blank");
      return;
    }
    
    onAction(component.id, action);
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors truncate"
      title={label}
    >
      {label}
    </button>
  );
};
