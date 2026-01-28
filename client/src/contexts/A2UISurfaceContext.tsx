import React from 'react';
import { Surface } from '@/types/a2ui';

export const A2UISurfaceContext = React.createContext<Surface | null>(null);

export const A2UISurfaceProvider: React.FC<{ surface: Surface; children: React.ReactNode }> = ({
  surface,
  children,
}) => {
  return (
    <A2UISurfaceContext.Provider value={surface}>
      {children}
    </A2UISurfaceContext.Provider>
  );
};
