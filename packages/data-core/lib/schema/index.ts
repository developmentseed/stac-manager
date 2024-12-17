import { SchemaField, SchemaFieldObject } from './types';

export type FormDataStructure =
  | string
  | { [key: string]: FormDataStructure }
  | FormDataStructure[]
  | string[];

export function schemaToFormDataStructure(
  field: SchemaField
): FormDataStructure {
  if (['root', 'object'].includes(field.type)) {
    return Object.entries((field as SchemaFieldObject).properties).reduce<{
      [key: string]: FormDataStructure;
    }>((acc, [key, value]) => {
      return {
        ...acc,
        [key]: schemaToFormDataStructure(value)
      };
    }, {});
  }

  if (field.type === 'array') {
    if ((field.minItems || 0) > 0) {
      return Array.from({ length: field.minItems as number }).map(() =>
        schemaToFormDataStructure(field.items)
      );
    }
    return [];
  }

  if (field.type === 'json') {
    return {};
  }

  return '';
}
