import React, {
  KeyboardEvent,
  KeyboardEventHandler,
  useMemo,
  useState
} from 'react';
import {
  Kbd,
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/react';
import { FastField, FastFieldProps } from 'formik';
import CreatableSelect from 'react-select/creatable';
import {
  SchemaFieldArray,
  SchemaFieldString,
  WidgetProps
} from '@stac-manager/data-core';

import { FieldLabel } from '../components/elements';
import { useRenderKey } from '../utils/use-render-key';

const createOption = (label: string): Option => ({
  label,
  value: label
});

const onTabOrEnter =
  (cb: (e: KeyboardEvent) => void): KeyboardEventHandler =>
  (event) => {
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        cb(event);
    }
  };

interface Option {
  readonly label: string;
  readonly value: string;
}

/******************************************************************************/
/*                                                                            */
/*                      W I D G E T   C O M P O N E N T                       */
/*                                                                            */
/*  Main widget entry point. This component merely distinguishes between      */
/*  tagger with and without options.                                          */
/******************************************************************************/
export function WidgetTagger(props: WidgetProps) {
  const { field } = props;

  if (field.type === 'string') {
    if (!field.enum) {
      throw new Error("WidgetTagger: 'enum' is required for string fields");
    }

    return <WidgetTaggerWithOptions {...props} />;
  }

  if (field.type === 'array' && field.items.type === 'string') {
    return field.items.enum ? (
      <WidgetTaggerWithOptions {...props} isMulti />
    ) : (
      <WidgetTaggerNoOptions {...props} />
    );
  }

  throw new Error(
    `WidgetTagger: Field type must be 'string' or 'array'. Got: ${field.type}`
  );
}

/******************************************************************************/
/*                                                                            */
/*                  N O   O P T I O N S   C O M P O N E N T                   */
/*    with CreatableSelect is in a separate component because of FastField    */
/*                                                                            */
/*  Tagger with no options to choose from. The user can only create new ones  */
/*                                                                            */
/******************************************************************************/
function WidgetTaggerNoOptions(props: WidgetProps) {
  const { pointer, isRequired, field } = props;

  const key = useRenderKey([pointer, isRequired, field]);

  return (
    <FastField name={pointer} key={key}>
      {({
        field: { value, name },
        meta,
        form: { setFieldValue }
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
          <WidgetTaggerNoOptionsSelect
            pointer={pointer}
            value={value}
            onChange={(v: string | string[]) => setFieldValue(name, v)}
          />
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
      )}
    </FastField>
  );
}

const components = {
  DropdownIndicator: null
};

interface WidgetTaggerNoOptionsSelectProps {
  pointer: string;
  value: string[];
  onChange: (value: string[]) => void;
}

function WidgetTaggerNoOptionsSelect(props: WidgetTaggerNoOptionsSelectProps) {
  const { value, onChange, pointer } = props;

  const [inputValue, setInputValue] = useState('');
  const selectedValues = Array.isArray(value) ? value.map(createOption) : [];

  const handleKeyDown = onTabOrEnter((event) => {
    if (!inputValue) return;
    if (!value.includes(inputValue)) {
      onChange([...value, inputValue]);
    }
    setInputValue('');
    event.preventDefault();
  });

  return (
    <CreatableSelect
      name={pointer}
      components={components}
      inputValue={inputValue}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={(newValue) => {
        onChange(newValue.map((option) => option.value));
      }}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder={
        <React.Fragment>
          Type & <Kbd>enter</Kbd> to add options
        </React.Fragment>
      }
      value={selectedValues}
    />
  );
}

/******************************************************************************/
/*                                                                            */
/*                     O P T I O N S   C O M P O N E N T                      */
/*    with CreatableSelect is in a separate component because of FastField    */
/*                                                                            */
/*  Tagger with options to choose from as well as the option to create        */
/*  new ones.                                                                 */
/*                                                                            */
/******************************************************************************/
function WidgetTaggerWithOptions(props: WidgetProps & { isMulti?: boolean }) {
  const { pointer, isRequired, isMulti, field } = props;

  const key = useRenderKey([pointer, isRequired, isMulti, field]);

  const options = useMemo(() => {
    const enums = isMulti
      ? (field as SchemaFieldArray<SchemaFieldString>).items.enum
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

          <WidgetTaggerWithOptionsSelect
            pointer={pointer}
            isMulti={!!isMulti}
            value={value}
            onChange={(v: string | string[]) => setFieldValue(name, v)}
            options={options}
          />
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
      )}
    </FastField>
  );
}

interface WidgetTaggerWithOptionsSelectProps {
  pointer: string;
  isMulti: boolean;
  onChange: (value: string | string[]) => void;
  value: string | string[];
  options: Option[];
}

function WidgetTaggerWithOptionsSelect(
  props: WidgetTaggerWithOptionsSelectProps
) {
  const { isMulti, onChange, value, options, pointer } = props;
  const [inputValue, setInputValue] = useState('');

  const selectedValues = value
    ? isMulti
      ? (value as string[]).map(createOption)
      : createOption(value as string)
    : isMulti
      ? []
      : undefined;

  const handleKeyDown = onTabOrEnter((event) => {
    if (!inputValue) return;
    if (value.includes(inputValue)) {
      setInputValue('');
      event.preventDefault();
    }
  });

  return (
    <CreatableSelect
      name={pointer}
      inputValue={inputValue}
      isClearable
      isMulti={isMulti}
      onChange={(newValue) => {
        if (isMulti) {
          onChange(
            ((newValue as Option[]) || []).map((option) => option.value)
          );
        } else {
          onChange((newValue as Option)?.value);
        }
      }}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      options={options}
      placeholder='Select or type to add'
      value={selectedValues}
    />
  );
}
