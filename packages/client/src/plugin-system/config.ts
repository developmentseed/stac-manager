import { extendPluginConfig } from '@stac-manager/data-core';
import { defaultPluginWidgetConfig } from '@stac-manager/data-widgets';
import {
  PluginCore,
  PluginItemAssets,
  // PluginKitchenSink,
  PluginRender
} from '@stac-manager/data-plugins';

export const config = extendPluginConfig(defaultPluginWidgetConfig, {
  collectionPlugins: [
    new PluginCore(),
    new PluginItemAssets(),
    new PluginRender()
  ],
  // collectionPlugins: [new PluginKitchenSink()],
  itemPlugins: [],

  'ui:widget': {}
});
