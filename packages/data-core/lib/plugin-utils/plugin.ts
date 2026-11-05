/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { SchemaField, SchemaFieldObject } from '../schema/types';

export type PluginEditSchema =
  (SchemaFieldObject & { type: 'root' }) | undefined | symbol;

export interface PluginHook {
  // Name of the target plugin.
  name: string;

  //  The `onAfterInit` hook is executed after the target plugin's `init`
  //  function.
  onAfterInit?: (pluginInstance: Plugin, data: any) => void;

  // The `onAfterEditSchema` hook is composed with the target plugin's
  // `editSchema` function.
  onAfterEditSchema?: (
    pluginInstance: Plugin,
    formData: any,
    schema: PluginEditSchema
  ) => PluginEditSchema;
}

const HIDDEN: unique symbol = Symbol('hidden');
const HOOKS: unique symbol = Symbol('hooks');

export abstract class Plugin {
  static readonly HIDDEN: typeof HIDDEN = HIDDEN;
  static readonly HOOKS: typeof HOOKS = HOOKS;

  [HOOKS]: PluginHook[] = [];

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

  /**
   * Registers a hook to be applied on a given plugin.
   *
   * @param targetName - The name of the target plugin to which the hook will be
   * applied.
   * @param hookName - The name of the hook.
   * @param hook - The hook function.
   */
  registerHook<K extends keyof Omit<PluginHook, 'name'>>(
    targetName: string,
    hookName: K,
    hook: PluginHook[K]
  ) {
    const hookEntry = this[Plugin.HOOKS].find((h) => h.name === targetName);

    if (hookEntry) {
      hookEntry[hookName] = hook;
    } else {
      this[Plugin.HOOKS].push({ name: targetName, [hookName]: hook });
    }
  }
}

export type PluginConfigResolved = Plugin | Plugin[] | undefined | null;

export type PluginConfigResolver = (data: any) => PluginConfigResolved;

export type PluginConfigItem = PluginConfigResolved | PluginConfigResolver;
