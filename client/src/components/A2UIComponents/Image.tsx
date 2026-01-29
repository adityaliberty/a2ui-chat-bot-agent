import React, { useState } from "react";
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
  const { src, alt, className } = component.properties || {};
  const [hasError, setHasError] = useState(false);

  // Fallback image if source is missing or fails
  const fallbackSrc = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60";
  const displaySrc = !src || hasError ? fallbackSrc : src;

  return (
    <div className="w-full overflow-hidden rounded-md bg-gray-100 mb-2">
      <img
        src={displaySrc}
        alt={alt || "A2UI Image"}
        className={`object-cover w-full h-48 sm:h-64 ${className || ""}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
