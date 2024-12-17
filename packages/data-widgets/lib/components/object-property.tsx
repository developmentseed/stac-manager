import React, { useCallback, useMemo, useState } from 'react';
import {
  WidgetRenderer,
  SchemaField,
  schemaToFormDataStructure
} from '@stac-manager/data-core';
import {
  Fieldset,
  FieldsetBody,
  FieldsetDeleteBtn,
  FieldsetHeader
} from './elements';
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import { CollecticonTag } from '@devseed-ui/collecticons-chakra';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import set from 'lodash-es/set';
import unset from 'lodash-es/unset';
import mapKeys from 'lodash-es/mapKeys';
import toPath from 'lodash-es/toPath';
import cloneDeep from 'lodash-es/cloneDeep';

const fieldTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'string[]', label: 'List of String' },
  { value: 'number[]', label: 'List of Number' },
  { value: 'json', label: 'JSON' }
] as const;

type FieldTypes = (typeof fieldTypes)[number]['value'];

/**
 * Infers the type of a given value and returns a corresponding FieldTypes
 * string.
 *
 * @param value - The value whose type is to be inferred.
 * @returns The inferred type as a FieldTypes string. Possible return values
 * are:
 * - 'number' for numeric values.
 * - 'number[]' for arrays where all elements are numbers.
 * - 'string[]' for arrays where all elements are strings.
 * - 'json' for arrays with mixed types or objects.
 * - 'string' for all other types.
 */
const inferFieldType = (value: any): FieldTypes => {
  if (typeof value === 'number') {
    return 'number';
  }

  // if (typeof value === 'boolean') {
  //   return 'boolean';
  // }

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'number')) {
      return 'number[]';
    }
    // if (value.every((v) => typeof v === 'boolean')) {
    //   return 'boolean[]';
    // }
    if (value.every((v) => typeof v === 'string')) {
      return 'string[]';
    }
    return 'json';
  }

  if (typeof value === 'object') {
    return 'json';
  }

  return 'string';
};

/**
 * Generates a schema field based on the provided field type.
 *
 * @param type - The type of the field. Can be 'string', 'number', 'string[]',
 * 'number[]', or 'json'.
 * @returns A SchemaField object if the type is recognized, otherwise null.
 */
const getFieldSchema = (type: FieldTypes): SchemaField | null => {
  if (type === 'string') {
    return {
      type: 'string',
      label: 'Value'
    };
  }

  if (type === 'number') {
    return {
      type: 'number',
      label: 'Value'
    };
  }

  if (['string[]', 'number[]'].includes(type)) {
    return {
      type: 'array',
      label: 'Value',
      minItems: 1,
      items: {
        type: type.replace('[]', '')
      }
    } as SchemaField;
  }

  if (type === 'json') {
    return {
      type: 'json',
      label: 'Value'
    };
  }

  return null;
};

/**
 * Replaces a key in an object at a specified path with a new key.
 * The order of the keys in the object is preserved.
 * The original object is not mutated.
 *
 * @param obj - The object in which the key replacement will occur.
 * @param path - The path to the key that needs to be replaced.
 * @param newKey - The new key that will replace the old key.
 * @returns A new object with the key replaced at the specified path.
 */
const replaceObjectKeyAt = (obj: any, path: string, newKey: string) => {
  const parts = toPath(path);
  const last = parts.pop()!;
  const isRoot = !parts.length;
  const valuesAtPath = isRoot ? obj : get(obj, parts);

  const valuesWithNewKey = mapKeys(valuesAtPath, (_, key) => {
    return key === last ? newKey : key;
  });

  valuesWithNewKey[newKey] = valuesAtPath[last];

  return isRoot
    ? valuesWithNewKey
    : set(cloneDeep(obj), parts, valuesWithNewKey);
};

/*****************************************************************************
 *                           C O M P O N E N T                               *
 *****************************************************************************/

interface ObjectPropertyProps {
  pointer: string;
  property: string;
  existentProperties: string[];
}

export function ObjectProperty(props: ObjectPropertyProps) {
  const { pointer, property, existentProperties } = props;

  const ctx = useFormikContext();
  const value = pointer ? get(ctx.values, pointer) : ctx.values;

  const [fieldType, setFieldType] = useState<FieldTypes>(inferFieldType(value));
  const [keyFieldValue, setKeyFieldValue] = useState(property);
  const [keyError, setKeyError] = useState<string>();

  const onFieldKeyBlur = useCallback(
    (e: any) => {
      const newProp = e.target.value;
      const keyExists = existentProperties.includes(newProp);

      // Revert to original value in case of error.
      setKeyError(undefined);
      if (keyExists || newProp === '') {
        setKeyFieldValue(property);
        return;
      }

      // Update the form values with the new property name.
      if (newProp === property) return;

      ctx.setValues(replaceObjectKeyAt(ctx.values, pointer, newProp));

      const newPointer = pointer.replace(
        new RegExp(`${property}$`, 'g'),
        newProp
      );
      ctx.unregisterField(pointer);
      ctx.registerField(newPointer, {});
    },
    [pointer, property, value, ctx]
  );

  const removeProperty = useCallback(
    (pointer: string) => {
      ctx.unregisterField(pointer);
      const valuesCopy = { ...ctx.values! };
      unset(valuesCopy, pointer);
      ctx.setValues(valuesCopy);
    },
    [ctx]
  );

  const field = useMemo(() => getFieldSchema(fieldType), [fieldType]);

  return (
    <Fieldset>
      <FieldsetHeader>
        <Box>
          <FormControl isInvalid={!!keyError}>
            <InputGroup size='sm' bg='surface.500' borderColor='base.200'>
              <InputLeftElement pointerEvents='none'>
                <CollecticonTag title='Value for the object property' />
              </InputLeftElement>
              <Input
                type='text'
                placeholder='Property name'
                value={keyFieldValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setKeyFieldValue(value);
                  if (existentProperties.includes(value)) {
                    setKeyError('Property already exists');
                  } else if (value === '') {
                    setKeyError('Property name cannot be empty');
                  }
                }}
                onBlur={onFieldKeyBlur}
              />
            </InputGroup>
            <FormErrorMessage>{keyError}</FormErrorMessage>
          </FormControl>
        </Box>
        <Flex gap={4}>
          <Select
            size='sm'
            bg='surface.500'
            borderColor='base.200'
            borderRadius='md'
            value={fieldType}
            onChange={(e) => {
              const type = e.target.value as FieldTypes;
              setFieldType(type);

              const schema = getFieldSchema(type);
              if (schema) {
                const valuesForSchema = schemaToFormDataStructure(schema);
                ctx.setFieldValue(pointer, valuesForSchema);
              }
            }}
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <FieldsetDeleteBtn
            aria-label='Remove item'
            onClick={() => removeProperty(pointer)}
          />
        </Flex>
      </FieldsetHeader>
      <FieldsetBody>
        {field && <WidgetRenderer field={field} pointer={pointer} />}
      </FieldsetBody>
    </Fieldset>
  );
}
