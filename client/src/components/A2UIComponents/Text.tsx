import React from "react";
import { A2UIComponent } from "@/types/a2ui";

interface TextProps {
  component: A2UIComponent;
  onAction: (
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => void;
  dataModel: Record<string, any>;
}

export const Text: React.FC<TextProps> = ({ component }) => {
  const { text = "" } = component.properties || {};

  // Simple markdown-like bolding
  const formattedText = text
    .split(/(\*\*.*?\*\*)/g)
    .map((part: string, i: number) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

  return (
    <p className="text-gray-700 text-sm leading-relaxed">{formattedText}</p>
  );
};
