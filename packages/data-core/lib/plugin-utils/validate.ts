import * as Yup from 'yup';
import { yupToFormErrors } from 'formik';

import {
  SchemaFieldArray,
  SchemaFieldJson,
  SchemaFieldNumber,
  SchemaFieldObject,
  SchemaFieldString
} from '../schema/types';
import { Plugin } from './plugin';

/**
 * Validates the data against the edit schemas defined by the plugins.
 * @param {Plugin[]} plugins - The list of plugins.
 * @param {any} data - The data to validate.
 * @returns {[any, any]} - Returns a tuple with the validated data or errors.
 */
export function validatePluginsFieldsData(plugins: Plugin[], data: any) {
  const validationSchema = plugins.reduce((acc, plugin) => {
    const editSchema = plugin.editSchema(data);
    if (!editSchema || editSchema === Plugin.HIDDEN) return acc;

    const schema = createObjectSchema({
      ...(editSchema as SchemaFieldObject),
      type: 'object'
    });

    return acc.concat(schema);
  }, Yup.object());

  try {
    const result = validationSchema.validateSync(data, { abortEarly: false });
    return [result, null];
  } catch (error: any) {
    const e = yupToFormErrors(error);
    return [null, e];
  }
}

/**
 * Creates a Yup object schema based on the provided data.
 * @param {SchemaFieldObject} data - The schema field object.
 * @param {boolean} [isRequired] - Whether the schema is required.
 * @returns {Yup.ObjectSchema<object>} - The Yup object schema.
 */
function createObjectSchema(
  data: SchemaFieldObject,
  isRequired?: boolean
): Yup.ObjectSchema<object, Yup.AnyObject, object, ''> {
  const required = data.required || [];
  const properties = data.properties || {};

  const mappedProperties = Object.keys(properties).reduce((acc, key) => {
    const field = properties[key];
    const type = field.type;
    const isFieldRequired = required.includes(key);

    let schema;
    if (type === 'object' || type === 'root') {
      schema = createObjectSchema(field, isFieldRequired);
    } else if (type === 'string') {
      schema = createStringSchema(field, isFieldRequired);
    } else if (type === 'number') {
      schema = createNumberSchema(field, isFieldRequired);
    } else if (type === 'json') {
      schema = createJsonSchema(field, isFieldRequired);
    } else if (type === 'array') {
      schema = createArraySchema(field, isFieldRequired);
    } else {
      throw new Error('Invalid item type');
    }

    return {
      ...acc,
      [key]: schema
    };
  }, {});

  if (isRequired) {
    return Yup.object(mappedProperties).required();
  } else {
    return Yup.object(mappedProperties);
  }
}

/**
 * Creates a Yup string schema based on the provided data.
 * @param {SchemaFieldString} data - The schema field string.
 * @param {boolean} [isRequired] - Whether the schema is required.
 * @returns {Yup.StringSchema} - The Yup string schema.
 */
function createStringSchema(data: SchemaFieldString, isRequired?: boolean) {
  let schema = Yup.string().label(
    typeof data.label === 'string' ? data.label : 'Value'
  );

  if (data.enum) {
    schema = schema.test('enum', '${path} value is invalid', (value) => {
      if (value === '' && !isRequired) return true;

      const inOption = data.enum.some(([v]) => v === value);
      if (inOption) {
        return true;
      }

      if (data.allowOther) {
        return typeof value === data.allowOther.type;
      }
      return false;
    });
  }
  return isRequired ? schema.required() : schema;
}

/**
 * Creates a Yup number schema based on the provided data.
 * @param {SchemaFieldNumber} data - The schema field number.
 * @param {boolean} [isRequired] - Whether the schema is required.
 * @returns {Yup.NumberSchema} - The Yup number schema.
 */
function createNumberSchema(data: SchemaFieldNumber, isRequired?: boolean) {
  const schema = Yup.number()
    .label(typeof data.label === 'string' ? data.label : 'Value')
    .typeError('Value must be a number');

  return isRequired ? schema.required() : schema;
}

/**
 * Creates a Yup JSON schema based on the provided data.
 * @param {SchemaFieldJson} data - The schema field JSON.
 * @param {boolean} [isRequired] - Whether the schema is required.
 * @returns {Yup.ObjectSchema} - The Yup JSON schema.
 */
function createJsonSchema(data: SchemaFieldJson, isRequired?: boolean) {
  const schema = Yup.object().label(
    typeof data.label === 'string' ? data.label : 'Value'
  );

  return isRequired ? schema.required() : schema;
}

/**
 * Creates a Yup array schema based on the provided data.
 * @param {SchemaFieldArray} data - The schema field array.
 * @param {boolean} [isRequired] - Whether the schema is required.
 * @returns {Yup.ArraySchema} - The Yup array schema.
 */
function createArraySchema(
  data: SchemaFieldArray,
  isRequired?: boolean
): Yup.ArraySchema<any[] | undefined, Yup.AnyObject, '', ''> {
  const field = data.items || {};
  const type = field.type;

  let itemSchema;
  if (type === 'object') {
    itemSchema = createObjectSchema(field);
  } else if (type === 'string') {
    itemSchema = createStringSchema(field);
  } else if (type === 'number') {
    itemSchema = createNumberSchema(field);
  } else if (type === 'json') {
    itemSchema = createJsonSchema(field);
  } else if (type === 'array') {
    itemSchema = createArraySchema(field);
  } else {
    throw new Error('Invalid item type');
  }

  const schema = Yup.array()
    .label(typeof data.label === 'string' ? data.label : 'Value')
    .of(itemSchema)
    .min(data.minItems || 0)
    .max(data.maxItems || Infinity);

  return isRequired ? schema.required() : schema;
}
