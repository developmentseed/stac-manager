import React from 'react';
import {
  Checkbox,
  CheckboxGroup,
  Fieldset,
  Flex,
  Span
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
        // Fieldset (not Field.Root) on purpose: Ark checkboxes consume the
        // surrounding Field context, so a group under one Field.Root would
        // share the Field's ids (duplicate DOM ids, every label toggling the
        // first input) and inherit its `required` onto every hidden input.
        <Fieldset.Root invalid={!!(meta.touched && meta.error)}>
          {field.label && (
            <Fieldset.Legend>
              <FieldLabel size='xs'>{field.label}</FieldLabel>
              {isRequired && (
                <Span color='fg.error' lineHeight='1' ms='1' aria-hidden='true'>
                  *
                </Span>
              )}
            </Fieldset.Legend>
          )}
          <Flex gap={4}>
            <CheckboxGroup
              // Formik leaves an untouched field undefined; coerce to [] so the
              // group mounts controlled and doesn't warn/flip on first change.
              value={value ?? []}
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
          <Fieldset.ErrorText>{meta.error}</Fieldset.ErrorText>
        </Fieldset.Root>
      )}
    </FastField>
  );
}
