import React from 'react';
import {
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react';
import { FastField, FastFieldProps } from 'formik';
import {
  SchemaFieldArray,
  SchemaFieldString,
  WidgetProps
} from '@stac-manager/data-core';

import { FieldLabel } from '../components/elements';

export function WidgetCheckbox(props: WidgetProps) {
  const { pointer, isRequired } = props;
  const field = props.field as SchemaFieldArray<SchemaFieldString>;

  const options = field.items.enum;

  if (!options?.length) {
    throw new Error('WidgetCheckbox: items.enum is required');
  }

  return (
    <FastField name={pointer}>
      {({
        field: { value },
        meta,
        form: { setFieldValue, setFieldTouched }
      }: FastFieldProps) => (
        <FormControl
          isRequired={isRequired}
          isInvalid={!!(meta.touched && meta.error)}
        >
          {field.label && (
            <FormLabel>
              <FieldLabel size='xs'>{field.label}</FieldLabel>
            </FormLabel>
          )}
          <Flex gap={4}>
            <CheckboxGroup
              value={value}
              onChange={(v) => {
                setFieldValue(pointer, v);
                setFieldTouched(pointer, true);
              }}
            >
              {options.map(([checkboxVal, label]) => (
                <Checkbox key={checkboxVal} size='sm' value={checkboxVal}>
                  {label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Flex>
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
      )}
    </FastField>
  );
}
