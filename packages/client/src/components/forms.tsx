/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useState, useCallback } from "react";
import { MdDelete } from "react-icons/md";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
  NumberInput as Number,
  NumberInputField,
  IconButton,
} from "@chakra-ui/react";

const FIELD_MARGIN = "4";

type InputProps = {
  label: string;
  value?: unknown;
  error?: {
    message: string;
  };
  helper?: string;
  min?: number;
  max?: number;
  [key: string]: any;  // eslint-disable-line @typescript-eslint/no-explicit-any
}

type FieldProps = InputProps & {
  children: React.ReactNode[];
  FieldComponent: typeof React.Component;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, helper, FieldComponent, children, ...fieldProps }: FieldProps, ref) => (
    <FormControl isInvalid={!!error} my={FIELD_MARGIN}>
      <FormLabel>{label}</FormLabel>
      <FieldComponent {...fieldProps} ref={ref as any}>{ children }</FieldComponent> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
      { !!helper && !error && (
        <FormHelperText>{ helper }</FormHelperText>
      ) }
      { !!error && (
        <FormErrorMessage>{ error.message }</FormErrorMessage>
      ) }
    </FormControl>
  )
);
Field.displayName = "Field";

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => (
    <Field {...props} FieldComponent={Input} ref={ref} />
  )
);
TextInput.displayName = "TextInput";

export const TextAreaInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => (
    <Field {...props} FieldComponent={Textarea} ref={ref} />
  )
);
TextAreaInput.displayName = "TextAreaInput";

type NumberFieldProps = Omit<InputProps, "value"> & {
  value?: string |  number;
}

const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ min, max, ...props }: NumberFieldProps, ref) => (
    <Number min={min} max={max}>
      <NumberInputField {...props} ref={ref} />
    </Number>
  )
);
NumberField.displayName = "NumberField";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => (
    <Field {...props} FieldComponent={NumberField} ref={ref} />
  )
);
NumberInput.displayName = "NumberInput";

type SelectProps = InputProps & {
  children: React.ReactNode[]
}

export const SelectInput = React.forwardRef<HTMLInputElement, SelectProps>(
  ({children, ...props}: InputProps, ref) => (
    <Field {...props} FieldComponent={Select} ref={ref}>{ children }</Field>
  )
);
SelectInput.displayName = "SelectInput";

type ArrayFieldProps = InputProps & {
  onChange: (values?: Array<string>) => void;
  value?: (string | number)[];
}

export const ArrayField = React.forwardRef<HTMLInputElement, ArrayFieldProps>(
  ({onChange, value, ...props}: ArrayFieldProps, ref) => {
    const [ val, setVal ] = useState(value?.join(",") || "");

    useEffect(() => setVal(value?.join(",") || ""), [value]);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      const { value } = event.target;
      setVal(value);

      if (value.length === 0) {
        onChange([]);
      } else {
        onChange(event.target.value?.split(",").map(val => val.trim()));
      }
    };

    return <Input {...props} value={val} onChange={handleChange} ref={ref} />;
  }
);
ArrayField.displayName = "ArrayField";

export const ArrayInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => {
    return <Field {...props} FieldComponent={ArrayField} ref={ref} />;
  }
);
ArrayInput.displayName = "ArrayInput";

export const DateTimeInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => (
    <Field {...props} FieldComponent={Input} type="datetime-local" ref={ref} />
  )
);
DateTimeInput.displayName = "DateTimeInput";

type DateRangeInputProps = InputProps & {
  dateRangeFrom?: string,
  setDateRangeFrom: (date: string) => void,
  dateRangeTo?: string,
  setDateRangeTo: (date: string) => void,
}

export function DateRangeInput({
  label,
  error,
  dateRangeFrom,
  setDateRangeFrom,
  dateRangeTo,
  setDateRangeTo,
}: DateRangeInputProps) {
  const handleRangeFromChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => setDateRangeFrom(e.target.value), [setDateRangeFrom]);
  const handleRangeToChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => setDateRangeTo(e.target.value), [setDateRangeTo]);

  return (
    <FormControl isInvalid={!!error} my={FIELD_MARGIN} as="fieldset" display="flex" gap={FIELD_MARGIN}>
      <Box as="legend" mb="1">{label}</Box>
      <Box>
        <FormControl>
          <FormLabel fontWeight="400">Date from</FormLabel>
          <Flex>
            <Input type="date" onChange={handleRangeFromChange} value={dateRangeFrom} />
            <IconButton variant="link" aria-label="Clear date-from field" icon={<MdDelete />} onClick={() => setDateRangeFrom("")} />
          </Flex>
        </FormControl>
      </Box>
      <Box>
        <FormControl>
          <FormLabel fontWeight="400">Date to</FormLabel>
          <Flex>
            <Input type="date" onChange={handleRangeToChange} value={dateRangeTo} />
            <IconButton variant="link" aria-label="Clear date-to field" icon={<MdDelete />} onClick={() => setDateRangeTo("")} />
          </Flex>
        </FormControl>
      </Box>
      { !!error && (
        <FormErrorMessage>{ error.message }</FormErrorMessage>
      ) }
    </FormControl>
  );
}

type CheckboxFieldProps = InputProps & {
  name: string;
  options: { value: string, label: string }[];
  onChange: (values: Array<(string | number)>) => void;
  value?: (string | number)[];
}

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ name, options, value, onChange }: CheckboxFieldProps, ref) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const handleChange = (v: Array<(string | number)>) => {
      onChange(v);
    };

    return <p>no</p>

    // return (
    //   <CheckboxGroup onChange={handleChange} value={value}>
    //     {options.map(({ value, label }) => (
    //       <Checkbox key={value} name={name} value={value} mb="2" mr="2">{label}</Checkbox>
    //     ))}
    //   </CheckboxGroup>
    // );
  }
);
CheckboxField.displayName = "CheckboxField";
