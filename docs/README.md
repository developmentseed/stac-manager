# STAC-Manager 📡 📄 — Technical Documentation

- [STAC-Manager 📡 📄 — Technical Documentation](#stac-manager----technical-documentation)
  - [Configuration](#configuration)
    - [Example config](#example-config)
  - [Plugins \& Widgets](#plugins--widgets)
  - [Custom Client](#custom-client)

STAC-Manager is a react app designed for managing the values of a STAC (SpatioTemporal Asset Catalog) collection and its items.
The ecosystem is composed of a web app (the client) and a plugin system that powers it.
The different parts of the project are located in the `packages` directory structured as follows:

- [`@stac-manager/client`](../packages/client) - STAC-Manager web app.
- [`@stac-manager/data-core`](../packages/data-core) - Core functionality of the form builder plugin system.
- [`@stac-manager/data-widgets`](../packages/data-widgets) - Form components to be used by the form builder plugin system, when custom ones are not provided.
- [`@stac-manager/data-plugins`](../packages/data-plugins) - Data plugins for the forms. Each plugin defines how a section of the data structure is displayed and edited.

The `@stac-manager/data-*` packages contain the default implementation of the plugin system, the widgets used to render the forms and some core functions to allow the system to be extended.

The plugin system is responsible to dynamically generate forms based on a schema definition.  
Each plugin handles a specific part of the data and is responsible for defining the schema for the form, converting the data to the form format, and converting the form data back to the original data format.

## Configuration

### Client

See the client-specific instructions, such as configuring the server's STAC API, in the [README of the client package](../packages/client#client-specific-instructions).

### Plugins

STAC-Manager's [config file](/packages/client/src/plugin-system/config.ts) specifies the plugins that the app uses for Collections and Items while extending the `Default Plugin Widget Configuration` which defines the widgets for the basic field types.  
_See the [data-widgets/config](/packages/data-widgets/lib/config/index.ts) for a list of existent widgets._

When creating a new plugin or a new widget, the configuration should be updated with the new plugin/widget.

#### Example config

The config object should contain a list of plugins to use for the collections and items, as well as the widget configuration (which widgets to use for which field types).

```ts
import { extendPluginConfig } from '@stac-manager/data-core';
import { defaultPluginWidgetConfig } from '@stac-manager/data-widgets';
import {
  PluginOne,
  PluginTwo,
  PluginTwoB,
  CustomWidgetComponent
} from './somewhere';

export const config = extendPluginConfig(defaultPluginWidgetConfig, {
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
});
```

## Plugins & Widgets

Data plugins are the central part of STAC-Manager. Check the [plugin system documentation](./PLUGINS.md) to understand how they work and how to create a new plugin.

Widgets are the visual representation of the fields in the form. Check the [widget documentation](./WIDGETS.md) for more information on how to create a new widget.

## Custom Client

If you want to build your own app using the plugin system check the [custom client documentation](./docs/CUSTOM_CLIENT.md) for more information on how to set it up.
