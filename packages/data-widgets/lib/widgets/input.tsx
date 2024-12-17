import React from 'react';
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react';
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
        <FormControl
          isRequired={isRequired}
          isInvalid={meta.touched && meta.error ? true : false}
        >
          <Flex gap={4}>
            {fieldLabel && (
              <FormLabel>
                <FieldLabel size='xs'>{fieldLabel}</FieldLabel>
              </FormLabel>
            )}
            <Flex ml='auto' gap={2}>
              {isDeletable && (
                <FieldIconBtn
                  aria-label='Remove item'
                  onClick={onDeleteClick}
                  icon={<CollecticonTrashBin size={3} />}
                  isDisabled={isDeleteDisabled}
                />
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
            value={value === null ? '' : value}
            onBlur={onBlur}
            onChange={(e) => {
              setFieldValue(pointer, transformValue(e.target.value));
            }}
          />
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
      )}
    </FastField>
  );
}
