import React from 'react';
import { List, ListItem } from '@chakra-ui/react';
import {
  SchemaFieldArray,
  schemaToFormDataStructure,
  WidgetProps
} from '@stac-manager/data-core';
import { FieldArray, useFormikContext } from 'formik';
import { get } from 'lodash-es';

import { getArrayLabel } from '../utils';
import { ArrayFieldset } from '../components/elements';
import { WidgetInput } from './input';

export function WidgetArrayInput(props: WidgetProps) {
  const { pointer, isRequired } = props;
  const field = props.field as SchemaFieldArray;

  const { values } = useFormikContext();
  const fields: any[] = get(values, pointer) || [];

  const minItems = field.minItems || 0;
  const maxItems = field.maxItems || Infinity;
  const isFixed = minItems === maxItems;

  return (
    <FieldArray
      name={pointer}
      render={({ remove, push }) => (
        <ArrayFieldset
          isRequired={isRequired}
          label={field.label}
          onAdd={
            isFixed
              ? undefined
              : () => {
                  push(schemaToFormDataStructure(field.items));
                }
          }
          addDisabled={fields.length >= maxItems}
        >
          {fields.length ? (
            <List display='flex' gap={4} flexDir={isFixed ? 'row' : 'column'}>
              {fields.map((_, index) => (
                <ListItem
                  key={index /* eslint-disable-line react/no-array-index-key */}
                  display='flex'
                  width='100%'
                >
                  <WidgetInput
                    pointer={`${pointer}.${index}`}
                    type={field.items.type}
                    field={field.items}
                    label={getArrayLabel(field.items, index)?.formatted}
                    isDeletable={!isFixed}
                    onDeleteClick={() => {
                      remove(index);
                    }}
                    transformValue={(v) => {
                      if (field.items.type === 'number') {
                        const n = Number(v);
                        return isNaN(n) ? null : n;
                      }
                      return v;
                    }}
                    isDeleteDisabled={fields.length <= minItems}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <p>No items</p>
          )}
        </ArrayFieldset>
      )}
    />
  );
}
