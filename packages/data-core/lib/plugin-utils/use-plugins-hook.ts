import { useCallback, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    async function load() {
      // if (!data) return;

      const resolvedPlugins = resolvePlugins(plugins, data);
      await Promise.all(resolvedPlugins.map((pl) => pl.init(data)));
      setReadyPlugins(resolvedPlugins);
    }
    load();
  }, [plugins, data]);

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
  }, [readyPlugins]);

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
