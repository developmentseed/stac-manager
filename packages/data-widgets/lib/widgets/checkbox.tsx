import React from 'react';
import { Checkbox, CheckboxGroup, Field, Flex } from '@chakra-ui/react';
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

  if (field.items.allowOther) {
    throw new Error(
      "WidgetCheckbox: allowOther is not supported. Use widget 'tagger' instead"
    );
  }

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
        <Field.Root
          required={isRequired}
          invalid={!!(meta.touched && meta.error)}
        >
          {field.label && (
            <Field.Label>
              <FieldLabel size='xs'>{field.label}</FieldLabel>
              <Field.RequiredIndicator />
            </Field.Label>
          )}
          <Flex gap={4}>
            <CheckboxGroup
              value={value}
              onValueChange={(v: string[]) => {
                setFieldValue(pointer, v);
                setFieldTouched(pointer, true);
              }}
            >
              {options.map(([checkboxVal, label]) => (
                <Checkbox.Root key={checkboxVal} size='sm' value={checkboxVal}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{label}</Checkbox.Label>
                </Checkbox.Root>
              ))}
            </CheckboxGroup>
          </Flex>
          <Field.ErrorText>{meta.error}</Field.ErrorText>
        </Field.Root>
      )}
    </FastField>
  );
}
