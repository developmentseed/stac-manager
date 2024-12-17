interface FieldBase<T> {
  type: T;
  'ui:widget'?: string;
  label?: string | string[];
}

export type SchemaFieldString =
  | (FieldBase<'string'> & { enum?: never; allowOther?: never })
  | (FieldBase<'string'> & {
      allowOther?: {
        type: 'string';
      };
      enum: [string, string][];
    });

export type SchemaFieldNumber = FieldBase<'number'>;

export type SchemaFieldJson = FieldBase<'json'>;

export interface SchemaFieldArray<I extends SchemaField = SchemaField>
  extends FieldBase<'array'> {
  minItems?: number;
  maxItems?: number;
  items: I;
}

export interface SchemaFieldObject extends FieldBase<'object' | 'root'> {
  properties: Record<string, SchemaField>;
  additionalProperties?: boolean;
  required?: string[];
}

export type SchemaField =
  | SchemaFieldString
  | SchemaFieldArray
  | SchemaFieldObject
  | SchemaFieldNumber
  | SchemaFieldJson;
