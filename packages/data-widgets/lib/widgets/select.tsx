import React, { useMemo } from 'react';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { FastField, FastFieldProps } from 'formik';
import ReactSelect from 'react-select';
import {
  SchemaFieldArray,
  SchemaFieldString,
  WidgetProps
} from '@stac-manager/data-core';

import { FieldLabel } from '../components/elements';
import { castArray } from '../utils';
import { useRenderKey } from '../utils/use-render-key';

interface Option {
  readonly label: string;
  readonly value: string;
}

export function WidgetSelect(props: WidgetProps) {
  const { pointer, isRequired, field } = props;

  const isMulti = field.type === 'array';

  if (
    isMulti
      ? !(field as SchemaFieldArray<SchemaFieldString>).items?.enum?.length
      : !(field as SchemaFieldString).enum?.length
  ) {
    throw new Error('WidgetSelect: enum is required');
  }

  const key = useRenderKey([pointer, isRequired, isMulti, field]);

  const options = useMemo(() => {
    const enums = isMulti
      ? (field as SchemaFieldArray<SchemaFieldString>).items?.enum
      : (field as SchemaFieldString).enum;

    return enums!.map<Option>(([value, label]) => ({
      value,
      label
    }));
  }, [field]);

  return (
    <FastField name={pointer} key={key}>
      {({
        field: { name, value },
        meta,
        form: { setFieldValue }
      }: FastFieldProps) => {
        const selectedOpts = options.filter((option) =>
          castArray(value).includes(option.value)
        );

        return (
          <FormControl
            isRequired={isRequired}
            isInvalid={!!(meta.touched && meta.error)}
          >
            {field.label && (
              <FormLabel>
                <FieldLabel size='xs'>{field.label}</FieldLabel>
              </FormLabel>
            )}
            <ReactSelect
              name={name}
              options={options}
              isMulti={isMulti}
              isClearable={!isRequired}
              onChange={(option) => {
                if (option) {
                  setFieldValue(
                    name,
                    isMulti
                      ? (option as Option[]).map((o) => o.value)
                      : (option as Option).value
                  );
                } else {
                  setFieldValue(name, isMulti ? [] : undefined);
                }
              }}
              value={selectedOpts}
            />
            <FormErrorMessage>{meta.error}</FormErrorMessage>
          </FormControl>
        );
      }}
    </FastField>
  );
}
