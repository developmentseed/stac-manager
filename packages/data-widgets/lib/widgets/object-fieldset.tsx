import React from 'react';
import { WidgetProps } from '@stac-manager/data-core';

import { WidgetObject } from './object';
import { ArrayFieldset } from '../components/elements';

export function WidgetObjectFieldset(props: WidgetProps) {
  return (
    <ArrayFieldset label={props.field.label}>
      <WidgetObject {...props} />
    </ArrayFieldset>
  );
}
