import React from 'react';
import { Field, RadioGroup } from '@chakra-ui/react';
import { SchemaFieldString, WidgetProps } from '@stac-manager/data-core';
import { FastField, FastFieldProps } from 'formik';

import { FieldLabel } from '../components/elements';

export function WidgetRadio(props: WidgetProps) {
  const { pointer, isRequired } = props;
  const field = props.field as SchemaFieldString;

  const options = field.enum;

  if (field.allowOther) {
    throw new Error(
      "WidgetRadio: allowOther is not supported. Use widget 'tagger' instead"
    );
  }

  if (!options?.length) {
    throw new Error('WidgetRadio: enum is required');
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
          <RadioGroup.Root
            size='sm'
            gap={4}
            display='flex'
            value={value}
            onValueChange={(details: { value: string | null }) => {
              setFieldValue(pointer, details.value);
              setFieldTouched(pointer, true);
            }}
          >
            {options.map(([radioValue, label]) => (
              <RadioGroup.Item key={radioValue} value={radioValue}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>{label}</RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
          <Field.ErrorText>{meta.error}</Field.ErrorText>
        </Field.Root>
      )}
    </FastField>
  );
}
