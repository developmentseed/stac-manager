import React from 'react';
import { Field, Flex, Input } from '@chakra-ui/react';
import { FastField, FastFieldProps } from 'formik';
import { SchemaFieldString, WidgetProps } from '@stac-manager/data-core';
import { CollecticonTrashBin } from '@devseed-ui/collecticons-chakra';

import { FieldIconBtn, FieldLabel } from '../components/elements';

interface WidgetInputProps extends WidgetProps {
  label?: React.ReactNode;
  isDeletable?: boolean;
  type?: string;
  transformValue?: (value: any) => any;
  onDeleteClick?: () => void;
  isDeleteDisabled?: boolean;
}

const identity = (v: any) => v;

export function WidgetInput(props: WidgetInputProps) {
  const {
    label,
    isDeletable,
    onDeleteClick,
    isDeleteDisabled,
    pointer,
    isRequired,
    type,
    transformValue = identity
  } = props;
  const field = props.field as SchemaFieldString;

  const fieldLabel = label || field.label;

  return (
    <FastField name={pointer}>
      {({
        field: { value, onBlur },
        meta,
        form: { setFieldValue }
      }: FastFieldProps) => (
        <Field.Root
          required={isRequired}
          invalid={meta.touched && meta.error ? true : false}
        >
          <Flex gap={4}>
            {fieldLabel && (
              <Field.Label>
                <FieldLabel size='xs'>{fieldLabel}</FieldLabel>
              </Field.Label>
            )}
            <Flex ml='auto' gap={2}>
              {isDeletable && (
                <FieldIconBtn
                  aria-label='Remove item'
                  onClick={onDeleteClick}
                  disabled={isDeleteDisabled}
                >
                  <CollecticonTrashBin boxSize={3} />
                </FieldIconBtn>
              )}
            </Flex>
          </Flex>
          <Input
            type={type}
            size='sm'
            name={pointer}
            bg='surface.500'
            borderColor='base.200'
            borderRadius='md'
            value={value ?? ''}
            onBlur={onBlur}
            onChange={(e) => {
              setFieldValue(pointer, transformValue(e.target.value));
            }}
          />
          <Field.ErrorText>{meta.error}</Field.ErrorText>
        </Field.Root>
      )}
    </FastField>
  );
}
