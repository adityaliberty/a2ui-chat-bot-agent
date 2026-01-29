import React from "react";
import { A2UIComponent } from "@/types/a2ui";
import { A2UIRenderer } from "../A2UIRenderer";

interface CardProps {
  component: A2UIComponent;
  onAction: (
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => void;
  dataModel: Record<string, any>;
}

export const Card: React.FC<CardProps> = ({
  component,
  onAction,
  dataModel,
}) => {
  const { title } = component.properties || {};
  const children = component.children || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4 space-y-4">
        {children.map((childId: string) => (
          <A2UIRenderer
            key={childId}
            componentId={childId}
            onAction={onAction}
            dataModel={dataModel}
          />
        ))}
      </div>
    </div>
  );
};
