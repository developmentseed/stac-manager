import React, { useMemo } from 'react';
import { Field } from '@chakra-ui/react';
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
  const { field } = props;
  const isMulti = field.type === 'array';

  if (
    isMulti
      ? !(field as SchemaFieldArray<SchemaFieldString>).items?.enum?.length
      : !(field as SchemaFieldString).enum?.length
  ) {
    throw new Error('WidgetSelect: enum is required');
  }

  if (
    isMulti
      ? (field as SchemaFieldArray<SchemaFieldString>).items.allowOther
      : (field as SchemaFieldString).allowOther
  ) {
    throw new Error(
      "WidgetSelect: allowOther is not supported. Use widget 'tagger' instead"
    );
  }

  return <WidgetSelectInner {...props} />;
}

function WidgetSelectInner(props: WidgetProps) {
  const { pointer, isRequired, field } = props;

  const isMulti = field.type === 'array';

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
            <Field.ErrorText>{meta.error}</Field.ErrorText>
          </Field.Root>
        );
      }}
    </FastField>
  );
}
