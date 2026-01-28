import React from 'react';
import { A2UIComponent } from '@/types/a2ui';

interface ImageProps {
  component: A2UIComponent;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const Image: React.FC<ImageProps> = ({ component }) => {
  const { src, alt, width, height, className } = component.properties || {};

  return (
    <img
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      className={`rounded-md object-cover ${className || ''}`}
      style={{ maxWidth: '100%' }}
    />
  );
};
