/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { SchemaField, SchemaFieldObject } from '../schema/types';

export type PluginEditSchema =
  | (SchemaFieldObject & { type: 'root' })
  | undefined
  | symbol;

export abstract class Plugin {
  static HIDDEN = Symbol('hidden');

  name: string = 'Plugin';

  init(data: any) {}

  editSchema(formData?: any): PluginEditSchema {
    return undefined;
  }

  enterData(data: any): Record<string, any> {
    throw new Error(`Plugin [${this.name}] must implement enterData`);
  }

  exitData(data: any): Record<string, any> {
    throw new Error(`Plugin [${this.name}] must implement exitData`);
  }
}

export type PluginConfigResolved = Plugin | Plugin[] | undefined | null;

export type PluginConfigResolver = (data: any) => PluginConfigResolved;

export type PluginConfigItem = PluginConfigResolved | PluginConfigResolver;
