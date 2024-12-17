import React from 'react';
import { List, ListItem } from '@chakra-ui/react';
import {
  WidgetRenderer,
  SchemaFieldArray,
  WidgetProps,
  schemaToFormDataStructure
} from '@stac-manager/data-core';
import { FieldArray, useFormikContext } from 'formik';
import { get } from 'lodash-es';
import { getArrayLabel } from '../utils';
import { ArrayFieldset } from '../components/elements';

export function WidgetArray(props: WidgetProps) {
  const { pointer, isRequired } = props;
  const field = props.field as SchemaFieldArray;

  return (
    <ArrayItem
      label={field.label}
      pointer={pointer}
      field={field}
      isRequired={isRequired}
    />
  );
}

interface ArrayItemProps {
  label: React.ReactNode;
  field: SchemaFieldArray;
  pointer: string;
  isRequired?: boolean;
  onRemove?: () => void;
  removeDisabled?: boolean;
}

function ArrayItem(props: ArrayItemProps) {
  const { label, field, pointer, onRemove, removeDisabled, isRequired } = props;

  const { values } = useFormikContext();
  const fields: any[] = get(values, pointer) || [];

  const items = field.items;
  const minItems = field.minItems || 0;
  const maxItems = field.maxItems || Infinity;
  const isFixedCount = minItems === maxItems;

  // Check if the nested array is special like an array of strings (Checkboxes)
  // for example. Same logic as widget renderer.
  const isRegularNestedArray =
    items.type === 'array' && !['string', 'number'].includes(items.items.type);

  return (
    <FieldArray
      name={pointer}
      render={({ remove, push }) => (
        <ArrayFieldset
          label={label}
          isRequired={isRequired}
          onRemove={onRemove}
          onAdd={
            isFixedCount
              ? undefined
              : () => {
                  push(schemaToFormDataStructure(items));
                }
          }
          addDisabled={fields.length >= maxItems}
          removeDisabled={removeDisabled}
        >
          {fields.length ? (
            <List display='flex' flexDirection='column' gap={4}>
              {fields.map((_, index) => (
                <ListItem
                  key={index /* eslint-disable-line react/no-array-index-key */}
                >
                  {isRegularNestedArray ? (
                    <ArrayItem
                      label={getArrayLabel(items, index)?.formatted}
                      pointer={`${pointer}.${index}`}
                      field={items as SchemaFieldArray}
                      onRemove={
                        isFixedCount
                          ? undefined
                          : () => {
                              remove(index);
                            }
                      }
                      removeDisabled={fields.length <= minItems}
                    />
                  ) : (
                    <ArrayFieldset
                      label={getArrayLabel(items, index)?.formatted}
                      onRemove={
                        isFixedCount
                          ? undefined
                          : () => {
                              remove(index);
                            }
                      }
                      removeDisabled={fields.length <= minItems}
                    >
                      <WidgetRenderer
                        pointer={`${pointer}.${index}`}
                        field={items}
                        isRequired={false}
                      />
                    </ArrayFieldset>
                  )}
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
