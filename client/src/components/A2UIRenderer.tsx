import React, { useContext } from 'react';
import { A2UIComponent } from '@/types/a2ui';
import { A2UISurfaceContext } from '@/contexts/A2UISurfaceContext';
import { Card } from './A2UIComponents/Card';
import { Form } from './A2UIComponents/Form';
import { Input } from './A2UIComponents/Input';
import { Select } from './A2UIComponents/Select';
import { Button } from './A2UIComponents/Button';
import { Text } from './A2UIComponents/Text';
import { Row } from './A2UIComponents/Row';
import { Column } from './A2UIComponents/Column';
import { List } from './A2UIComponents/List';
import { Label } from './A2UIComponents/Label';
import { Divider } from './A2UIComponents/Divider';
import { Image } from './A2UIComponents/Image';

interface A2UIRendererProps {
  componentId: string;
  onAction: (componentId: string, action: string, data?: Record<string, any>) => void;
  dataModel: Record<string, any>;
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({ componentId, onAction, dataModel }) => {
  const surface = useContext(A2UISurfaceContext);

  if (!surface) {
    return <div>Error: Surface context not found</div>;
  }

  const component = surface.components.get(componentId);
  if (!component) {
    return <div>Component not found: {componentId}</div>;
  }

  const props = {
    component,
    onAction,
    dataModel,
  };

  switch (component.type) {
    case 'Card':
      return <Card {...props} />;
    case 'Form':
      return <Form {...props} />;
    case 'Input':
      return <Input {...props} />;
    case 'Select':
      return <Select {...props} />;
    case 'Button':
      return <Button {...props} />;
    case 'Text':
      return <Text {...props} />;
    case 'Row':
      return <Row {...props} />;
    case 'Column':
      return <Column {...props} />;
    case 'List':
      return <List {...props} />;
    case 'Label':
      return <Label {...props} />;
    case 'Divider':
      return <Divider {...props} />;
    case 'Image':
      return <Image {...props} />;
    default:
      return <div>Unknown component type: {component.type}</div>;
  }
};
