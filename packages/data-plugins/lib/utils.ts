import { SchemaField } from '@stac-manager/data-core';

/**
 *
 * @param condition The condition to evaluate
 * @param id The id for the field
 * @param ifTrue Field schema to associate to id if condition is true
 * @param ifFalse Field schema to associate to id if condition is false
 * @returns
 */
export function fieldIf<I extends string>(
  condition: boolean,
  id: I,
  ifTrue: SchemaField,
  ifFalse?: SchemaField
) {
  return (
    condition
      ? {
          [id]: ifTrue
        }
      : ifFalse
        ? {
            [id]: ifTrue
          }
        : {}
  ) as Record<I, SchemaField>;
}

/**
 * Recursively converts empty strings in arrays to null.
 */
export function emptyString2Null(v: any): any {
  if (Array.isArray(v)) {
    return v.map(emptyString2Null);
  }

  return v === '' ? null : v;
}

/**
 * Recursively converts nulls in arrays to empty strings.
 */
export function null2EmptyString(v: any): any {
  if (Array.isArray(v)) {
    return v.map(null2EmptyString);
  }

  return v === null ? '' : v;
}

/**
 * Converts an object into an array of objects, where each object contains the
 * key from the original object under "keyName"
 *
 * @param {Record<string, T>} stack - The input object to be converted.
 * @param {string} keyName - The name of the key to be used in the resulting
 * objects.
 * @param {(v: T) => Record<string, any>} [each=(v) => v] - An optional function
 * to transform each value in the input object.
 *
 * @example
 * ```typescript
 * const input = {
 *   a: { name: 'Alice', age: 30 },
 *   b: { name: 'Bob', age: 25 }
 * };
 *
 * const result = object2Array(input, 'id', (v) => ({ ...v, age: v.age + 1 }));
 *
 * Output:
 * [
 *   { id: 'a', name: 'Alice', age: 31 },
 *   { id: 'b', name: 'Bob', age: 26 }
 * ]
 * ```
 */
export function object2Array<T extends Record<string, any>>(
  stack: Record<string, T>,
  keyName: string,
  each: (v: T) => Record<string, any> = (v) => v
) {
  return Object.entries(stack || {}).map(([key, value]) => {
    return { [keyName]: key, ...each(value) };
  });
}

/**
 * Converts an object into an array of tuples, where each tuple contains the key
 * and the corresponding value(s).
 *
 * @param stack - The object to be converted into tuples. Each key-value pair in
 * the object will be transformed into a tuple.
 * @returns An array of tuples, where each tuple consists of the key and the
 * corresponding value(s) from the object.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = object2Tuple(obj);
 * console.log(result); // [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export function object2Tuple(stack: Record<string, any>) {
  return Object.entries(stack || {}).map(([key, value]) => [key].concat(value));
}

/**
 * Converts an array of objects into an object, using a specified key from each
 * object as the new key.
 *
 * @param stack - The array of objects to be converted.
 * @param keyName - The key name to be used as the new key in the resulting
 * object.
 * @param each - An optional function to transform each object. Defaults to an
 * identity function.
 * @returns An object where each key is derived from the specified key in the
 * original objects, and the value is the transformed object.
 *
 * @example
 * ```typescript
 * const array = [
 *   { id: 'a', value: 1 },
 *   { id: 'b', value: 2 },
 *   { id: 'c', value: 3 }
 * ];
 *
 * const result = array2Object(array, 'id');
 * result: {
 *   a: { value: 1 },
 *   b: { value: 2 },
 *   c: { value: 3 }
 * }
 *
 * const resultWithTransform = array2Object(array, 'id', (item) => ({ ...item, value: item.value * 2 }));
 * resultWithTransform: {
 *   a: { value: 2 },
 *   b: { value: 4 },
 *   c: { value: 6 }
 * }
 * ```
 */
export function array2Object(
  stack: Record<string, any>[],
  keyName: string,
  each: (v: Record<string, any>) => any = (v) => v
) {
  return (stack || []).reduce((acc, item) => {
    const newItem = { ...item };
    delete newItem[keyName];
    return { ...acc, [item[keyName]]: each(newItem) };
  }, {});
}

/**
 * Converts a 2D array of key-value pairs into an object.
 *
 * @param stack - A 2D array where each sub-array contains a key-value pair.
 * @returns An object constructed from the key-value pairs.
 *
 * @example
 * ```typescript
 * const stack = [['a', 1], ['b', 2], ['c', 3]];
 * const result = tuple2Object(stack);
 * console.log(result); // { a: 1, b: 2, c: 3 }
 * ```
 */
export function tuple2Object(stack: string[][]) {
  return (stack || []).reduce((acc, [key, item]) => {
    return { ...acc, [key]: item };
  }, {});
}

/**
 * Checks if the given data has a specific STAC extension.
 *
 * @param data - The data object to check for the extension.
 * @param extension - The name of the extension to look for.
 * @param version - An optional function that takes a version string and returns
 * a boolean indicating whether the version matches.
 *
 * @returns A boolean indicating whether the specified extension (and version,
 * if provided) is present in the data.
 */
export function hasExtension(
  data: any,
  extension: string,
  version?: (v: string) => boolean
) {
  const regex = new RegExp(`/${extension}/v([0-9.]+)/schema.json`);
  return data?.stac_extensions?.some((ext: string) => {
    const match = ext.match(regex);
    return match && (!version || version(match[1]));
  });
}
