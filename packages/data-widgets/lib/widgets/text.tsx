import React from 'react';
import { WidgetProps } from '@stac-manager/data-core';

import { WidgetInput } from './input';

export function WidgetText(props: WidgetProps) {
  return <WidgetInput {...props} />;
}
