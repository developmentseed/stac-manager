import React from 'react';
import {
  WidgetRenderer,
  SchemaFieldObject,
  WidgetProps
} from '@stac-manager/data-core';
import { useFormikContext } from 'formik';
import { Button } from '@chakra-ui/react';
import { CollecticonPlusSmall } from '@devseed-ui/collecticons-chakra';
import get from 'lodash-es/get';

import { ObjectProperty } from '../components/object-property';

/**
 * Finds the next unique value by appending an incrementing number to the given
 * value.
 *
 * @param value - The base value to which the incrementing number will be
 * appended.
 * @param valueKeys - An array of existing values to check against for
 * uniqueness.
 * @returns The next unique value that is not present in the valueKeys array.
 */
const findNextValue = (value: string, valueKeys: string[]): string => {
  let i = 0;
  while (true) {
    const v = `${value}-${++i}`;
    if (!valueKeys.includes(v)) return v;
  }
};

/*****************************************************************************
 *                           C O M P O N E N T                               *
 *****************************************************************************/
export function WidgetObject(props: WidgetProps) {
  const { pointer } = props;
  const field = props.field as SchemaFieldObject;

  const ctx = useFormikContext();
  const values = pointer ? get(ctx.values, pointer) : ctx.values;

  const schemaKeys = Object.keys(field.properties);
  const valueKeys = Object.keys(values || {});
  const unlistedKeys = valueKeys.filter((key) => !schemaKeys.includes(key));

  return (
    <>
      {Object.entries(field.properties).map(([key, item]) => (
        <WidgetRenderer
          key={key}
          pointer={pointer ? `${pointer}.${key}` : key}
          field={item}
          isRequired={field.required?.includes(key)}
        />
      ))}
      {field.additionalProperties && (
        <>
          {unlistedKeys.map((key) => (
            <ObjectProperty
              key={key}
              property={key}
              existentProperties={valueKeys.filter((k) => k !== key)}
              pointer={pointer ? `${pointer}.${key}` : key}
            />
          ))}
          <Button
            colorScheme='base'
            size='sm'
            onClick={() => {
              const nextKey = findNextValue('property', valueKeys);
              ctx.setFieldValue(
                pointer ? `${pointer}.${nextKey}` : nextKey,
                ''
              );
            }}
            aria-label='Add property'
            leftIcon={<CollecticonPlusSmall />}
          >
            Add property
          </Button>
        </>
      )}
    </>
  );
}
