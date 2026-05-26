import React from 'react';
import { Box, Text } from '@chakra-ui/react';

import { usePluginConfig } from '../context/plugin-config';
import { ErrorBox } from './error-box';
import { SchemaField } from '../schema/types';
import { WidgetProps } from './types';

/**
 * Renders the widget for a field.
 * @param props.pointer The path to the field in the form data
 * @param props.field The field schema to render
 * @param props.isRequired Whether the field is required
 */
export function WidgetRenderer(props: WidgetProps) {
  const { pointer, field, isRequired } = props;

  const config = usePluginConfig();

  const renderWidget = (widget: string) => {
    const Widget = config['ui:widget'][widget];

    return (
      <WidgetErrorBoundary field={field} widgetName={widget} pointer={pointer}>
        {Widget ? (
          <Widget pointer={pointer} field={field} isRequired={isRequired} />
        ) : (
          <ErrorBox>Widget &quot;{widget}&quot; not found</ErrorBox>
        )}
      </WidgetErrorBoundary>
    );
  };

  // Explicitly defined widget
  if (field['ui:widget']) {
    return renderWidget(field['ui:widget']);
  }

  if (field.type === 'array') {
    if (field.items.type === 'string' && field.items.enum) {
      return renderWidget('checkbox');
    }

    if (['string', 'number'].includes(field.items.type)) {
      return renderWidget('array:string');
    }

    return renderWidget('array');
  }

  if (field.type === 'root' || field.type === 'object') {
    return renderWidget('object');
  }

  if (field.type === 'string' && field.enum) {
    return renderWidget('radio');
  }

  if (field.type === 'json') {
    return renderWidget('json');
  }

  if (field.type === 'number') {
    return renderWidget('number');
  }

  return renderWidget('text');
}

interface WidgetErrorBoundaryProps {
  children: React.ReactNode;
  field: SchemaField;
  widgetName: string;
  pointer: string;
}

interface WidgetErrorBoundaryState {
  error: Error | null;
}

class WidgetErrorBoundary extends React.Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorBox color='base.500' alignItems='left' p={4}>
          <Text textTransform='uppercase' color='red.500'>
            💔 Error rendering widget ({this.props.widgetName})
          </Text>
          <Text>
            {this.state.error.message || 'Something is wrong with this widget'}
          </Text>
          <Box
            as='pre'
            bg='base.100'
            borderRadius='md'
            p={2}
            fontSize='small'
            maxH={64}
            overflow='auto'
          >
            @.{this.props.pointer} <br />
            <code>{JSON.stringify(this.props.field, null, 2)}</code>
          </Box>
        </ErrorBox>
      );
    }

    return this.props.children;
  }
}
