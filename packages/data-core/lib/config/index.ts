import { WidgetComponent } from '../components/types';
import { PluginConfigItem } from '../plugin-utils/plugin';

export interface PluginConfig {
  collectionPlugins: PluginConfigItem[];
  itemPlugins: PluginConfigItem[];
  'ui:widget': Record<string, WidgetComponent>;
}

const configStructure: PluginConfig = {
  collectionPlugins: [],
  itemPlugins: [],
  'ui:widget': {}
};

/**
 * Successively merges multiple configurations into one.
 * The last configuration will override the previous ones.
 * The resulting configuration is to be used by the PluginConfigProvider.
 * 
 * @param ...config - The configurations to merge
 * @returns The configuration object
 */
export function extendPluginConfig(...config: Partial<PluginConfig>[]) {
  return config.reduce<PluginConfig>((acc, c) => {
    const {
      collectionPlugins = [],
      itemPlugins = [],
      'ui:widget': uiWidget = {}
    } = c;

    return {
      collectionPlugins: [...acc.collectionPlugins, ...collectionPlugins],
      itemPlugins: [...acc.itemPlugins, ...itemPlugins],
      'ui:widget': {
        ...acc['ui:widget'],
        ...uiWidget
      }
    };
  }, configStructure);
}
