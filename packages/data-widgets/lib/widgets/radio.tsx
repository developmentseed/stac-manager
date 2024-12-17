import React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup
} from '@chakra-ui/react';
import { SchemaFieldString, WidgetProps } from '@stac-manager/data-core';
import { FastField, FastFieldProps } from 'formik';

import { FieldLabel } from '../components/elements';

export function WidgetRadio(props: WidgetProps) {
  const { pointer, isRequired } = props;
  const field = props.field as SchemaFieldString;

  const options = field.enum;

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
        <FormControl
          isRequired={isRequired}
          isInvalid={!!(meta.touched && meta.error)}
        >
          {field.label && (
            <FormLabel>
              <FieldLabel size='xs'>{field.label}</FieldLabel>
            </FormLabel>
          )}
          <RadioGroup
            size='sm'
            gap={4}
            display='flex'
            value={value}
            onChange={(v) => {
              setFieldValue(pointer, v);
              setFieldTouched(pointer, true);
            }}
          >
            {options.map(([radioValue, label]) => (
              <Radio key={radioValue} size='sm' value={radioValue}>
                {label}
              </Radio>
            ))}
          </RadioGroup>
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
      )}
    </FastField>
  );
}
