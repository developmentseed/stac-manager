import React from 'react';
import { Fieldset, RadioGroup, Span } from '@chakra-ui/react';
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
        // Fieldset (not Field.Root): a radio group is a set of controls, so a
        // single <label> has nothing valid to point at — Field.Label's
        // htmlFor would dangle. A legend labels the group as a whole.
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
          <RadioGroup.Root
            size='sm'
            gap={4}
            display='flex'
            // Formik leaves an untouched field undefined; coerce to null so the
            // group mounts controlled and doesn't warn/flip on first change.
            value={value ?? null}
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
          <Fieldset.ErrorText>{meta.error}</Fieldset.ErrorText>
        </Fieldset.Root>
      )}
    </FastField>
  );
}
