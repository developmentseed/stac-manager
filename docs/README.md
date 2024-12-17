# STAC-Manager :satellite: :page_facing_up: 

## Setup

Wrap the `PluginConfigProvider` around the `App` component to provide the plugins with the configuration.

```tsx
import { PluginConfigProvider } from '@stac-manager/data-core';

  <PluginConfigProvider config={config}>
      <App />
  </PluginConfigProvider>
```

## Config

The config object should contain a list of plugins to use for the collections and items, as well as the widget configuration (which widgets to use for which field types).

```js
{
  collectionPlugins: [
    new PluginOne(),
    new PluginTwo(),
    ],
  itemPlugins: [
    new PluginTwoB(),
  ],

  'ui:widget': {
    'customWidget': CustomWidgetComponent,
  }
}
```

It is possible to extend the default widget configuration with the `extendPluginConfig` function. The default configuration already defines the widgets for the basic field types.

```ts
import { extendPluginConfig } from '@stac-manager/data-core';
import { defaultPluginWidgetConfig } from '@stac-manager/data-widgets';
import { PluginMeta } from '@stac-manager/data-plugins';


export const config = extendPluginConfig(defaultPluginWidgetConfig, {
  collectionPlugins: [],
  itemPlugins: [],

  'ui:widget': {}
});

```