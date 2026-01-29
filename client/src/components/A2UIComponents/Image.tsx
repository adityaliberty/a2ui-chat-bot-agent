import React from "react";
import { A2UIComponent } from "@/types/a2ui";

interface ImageProps {
  component: A2UIComponent;
  onAction: (
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => void;
  dataModel: Record<string, any>;
}

export const Image: React.FC<ImageProps> = ({ component }) => {
  const { src, alt, width, height, className } = component.properties || {};

  // If no source is provided, don't render anything or show a placeholder
  if (!src) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
        <span className="text-gray-400">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md bg-gray-100">
      <img
        src={src}
        alt={alt || "A2UI Image"}
        width={width}
        height={height}
        className={`object-cover w-full h-auto min-h-[150px] ${className || ""}`}
        loading="lazy"
        onError={(e) => {
          // Fallback to a neutral placeholder if the specific image fails to load
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60";
        }}
      />
    </div>
  );
};
