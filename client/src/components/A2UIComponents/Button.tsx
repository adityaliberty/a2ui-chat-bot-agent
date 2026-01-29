import React, { useState } from "react";
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
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const action = component.properties?.action || "click";
    
    // If it's a submit button in a form, the form's onSubmit will handle it.
    // However, we still want to prevent multiple clicks.
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    // Handle special actions like opening maps
    if (action === "open_maps") {
      const destination = component.properties?.destination || "";
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
      window.open(url, "_blank");
      return;
    }
    
    setIsDisabled(true);
    onAction(component.id, action, component.properties);
    
    // Re-enable after a delay
    setTimeout(() => setIsDisabled(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-3 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors truncate ${
        isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
      }`}
      title={label}
    >
      {label}
    </button>
  );
};
