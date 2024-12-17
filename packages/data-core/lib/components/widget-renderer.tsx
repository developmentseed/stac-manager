import React from 'react';

import { usePluginConfig } from '../context/plugin-config';
import { ErrorBox } from './error-box';
import { SchemaField } from '../schema/types';

interface WidgetProps {
  pointer: string;
  field: SchemaField;
  isRequired?: boolean;
}

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

    return Widget ? (
      <Widget pointer={pointer} field={field} isRequired={isRequired} />
    ) : (
      <ErrorBox>Widget &quot;{widget}&quot; not found</ErrorBox>
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
