import { Plugin, PluginConfigItem } from './plugin';

export const resolvePlugins = (plugins: PluginConfigItem[], data: any) => {
  return plugins
    .flatMap((pl) => {
      if (pl instanceof Plugin) {
        return pl;
      } else if (typeof pl === 'function') {
        return pl(data);
      }
      return;
    })
    .filter((p) => p instanceof Plugin);
};
