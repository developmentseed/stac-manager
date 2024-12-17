import React from 'react';
import { WidgetProps } from '@stac-manager/data-core';

import { WidgetInput } from './input';
import { toNumber } from '../utils';

export function WidgetNumber(props: WidgetProps) {
  return <WidgetInput {...props} type='number' transformValue={toNumber} />;
}
