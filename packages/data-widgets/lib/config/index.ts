import { extendPluginConfig } from '@stac-manager/data-core';

import { WidgetText } from '../widgets/text';
import { WidgetNumber } from '../widgets/number';
import { WidgetRadio } from '../widgets/radio';
import { WidgetCheckbox } from '../widgets/checkbox';
import { WidgetObject } from '../widgets/object';
import { WidgetObjectFieldset } from '../widgets/object-fieldset';
import { WidgetArray } from '../widgets/array';
import { WidgetArrayInput } from '../widgets/array-input';
import { WidgetSelect } from '../widgets/select';
import { WidgetJSON } from '../widgets/json';
import { WidgetTagger } from '../widgets/tagger';

export const defaultPluginWidgetConfig = extendPluginConfig({
  'ui:widget': {
    object: WidgetObject,
    'object:fieldset': WidgetObjectFieldset,
    text: WidgetText,
    number: WidgetNumber,
    radio: WidgetRadio,
    checkbox: WidgetCheckbox,
    select: WidgetSelect,
    tagger: WidgetTagger,
    array: WidgetArray,
    'array:string': WidgetArrayInput,
    json: WidgetJSON
  }
});
