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

  // Default to full width and some height if no className is provided
  const defaultClassName = "w-full h-48";
  const finalClassName =
    className && className !== "restaurant-image"
      ? className
      : defaultClassName;

  return (
    <div className="w-full overflow-hidden rounded-md bg-gray-100">
      <img
        src={src}
        alt={alt || ""}
        width={width}
        height={height}
        className={`object-cover w-full h-full ${finalClassName}`}
        style={{ minHeight: "150px" }}
        // onError={e => {
        //   (e.target as HTMLImageElement).src =
        //     "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60";
        // }}
      />
    </div>
  );
};
