import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defaultsDeep } from 'lodash-es';

import { Plugin, PluginConfigItem } from './plugin';
import { resolvePlugins } from './resolve';
import { usePluginConfig } from '../context/plugin-config';
import { schemaToFormDataStructure, FormDataStructure } from '../schema';

type UsePluginsHook =
  | {
      isLoading: true;
      plugins: undefined;
      formData: undefined;
      toOutData: (formData: any) => undefined;
    }
  | {
      isLoading: false;
      plugins: Plugin[];
      formData: any;
      toOutData: (formData: any) => any;
    };

type FormDataStructureObject = {
  [key: string]: FormDataStructure;
};

const usePlugins = (plugins: PluginConfigItem[], data: any): UsePluginsHook => {
  const [readyPlugins, setReadyPlugins] = useState<Plugin[]>();

  // `resolvePlugins` deep-clones each plugin (so hook composition doesn't
  // mutate the originals), which means any state a plugin sets in `init` only
  // lives on that one clone. If we re-resolve on every data change, a plugin
  // like PluginCore that derives `isNew` from data on `init` flips back and
  // forth as the user toggles between the Form and JSON views (the form's
  // `id` field then disappears mid-session). Pin init to the data captured at
  // mount; subsequent data updates flow through `enterData` -> `formData`.
  const initialDataRef = useRef(data);

  useEffect(() => {
    // Guard against out-of-order resolution: if `plugins` changes (or the
    // component unmounts, including StrictMode's double-invoke) while a
    // previous `load()` is still awaiting `init`, the stale resolve must not
    // overwrite the newer plugins or set state after unmount.
    let cancelled = false;
    async function load() {
      const resolvedPlugins = resolvePlugins(plugins, initialDataRef.current);
      await Promise.all(
        resolvedPlugins.map((pl) => pl.init(initialDataRef.current))
      );
      if (cancelled) return;
      setReadyPlugins(resolvedPlugins);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [plugins]);

  const formData = useMemo(() => {
    if (!readyPlugins) return;

    const emptyStructure = readyPlugins.reduce<FormDataStructureObject>(
      (acc, pl: Plugin) => {
        const schema = pl.editSchema();
        if (!schema || typeof schema === 'symbol') return acc;

        return defaultsDeep(
          schemaToFormDataStructure(schema) as FormDataStructureObject,
          acc
        );
      },
      {}
    );

    return readyPlugins.reduce(
      (acc: any, pl: Plugin) => defaultsDeep(pl.enterData(data), acc),
      emptyStructure
    );
  }, [readyPlugins, data]);

  const toOutData = useCallback(
    (formData: any) =>
      readyPlugins &&
      readyPlugins.reduce(
        (acc: any, pl: Plugin) => ({
          ...acc,
          ...pl.exitData(formData)
        }),
        {}
      ),
    [readyPlugins]
  );

  if (!readyPlugins) {
    return {
      isLoading: true,
      plugins: undefined,
      formData: undefined,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      toOutData: (formData: any) => undefined
    };
  }

  return {
    isLoading: false,
    plugins: readyPlugins,
    formData,
    toOutData
  };
};

export function useCollectionPlugins(data: any) {
  const config = usePluginConfig();

  return usePlugins(config.collectionPlugins, data);
}

export function useItemPlugins(data: any) {
  const config = usePluginConfig();

  return usePlugins(config.itemPlugins, data);
}
