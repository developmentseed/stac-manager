# STAC-Manager :satellite: :page_facing_up: 

## Plugins

Each plugin should handle a specific part of the data.

```ts
import { Plugin, SchemaFieldObject } from '@stac-manager/data-core';

export class PluginName extends Plugin {
  name = 'Plugin Name';

  async init(data) {
    // Once the data to edit is ready the init method of the plugin is called.
    // This method should perform any necessary setup to get data needed to
    // build the edit schema, lie for example the options for a select field.
  }

  editSchema(): SchemaFieldObject {
    // Return the schema for the data to edit in a JSON Schema -like format.
    // From this schema a form will be created.

    // If the plugin is to remain hidden from the user return Plugin.HIDDEN
  }

  enterData({ title, description, id, extent }: any = {}) {
    // The structure of the original data and the structure of the data the form
    // needs may not match.
    // This method receives the original data and should return the data in the
    // format the form needs.
  }

  exitData(data: any) {
    // The data entered in the form may not match the structure of the original
    // data.
    // This method receives the data entered in the form and should return the
    // data in the format of the original data, ready to send to the server.
  }
}

```

### Plugin editing schema format

Each plugin should star with an object of type `root`. Each property of this object is a field of the schema.

```js
{
  type: 'root',
  properties: {
    // Fields
  }
}
```

Simple text field should be of type `string`:

```js
{
  type: 'root',
  properties: {
    title: {
      label: 'Title',
      type: 'string'
    }
  }
}
```

Options fields:

A field of type `string` with an `enum` property will be rendered as radio buttons.  
Meaning that the final result is a single string, but from a restricted list.

The `enum` options are defined as an array of tuple arrays, where the first element is the value to send to the server and the second is the label to show in the form.

```js
{
  type: 'root',
  properties: {
    colormap: {
      label: 'Colormap Name',
      type: 'string',
      enum: [
        ['viridis', 'Viridis'],
        ['plasma', 'Plasma'],
        ['inferno', 'Inferno']
      ]
    }
  }
}
```

Array fields:

Array fields are used when the user needs to enter multiple values for a single field and are defined with the `array` type.

```js
{
  type: 'root',
  properties: {
    temporal: {
      label: 'Temporal Extent',
      type: 'array',
      items: {
        // Structure of the items in the array
      }
    }
  }
}
```

Array of strings:

Used to enter a list of strings, which by default will be rendered as a list of text fields.

```js
{
  type: 'root',
  properties: {
    temporal: {
      label: 'Temporal Extent',
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
}
```

Array of options:

If we add an `enum` property to the items of an array, the array will be rendered as a list of checkboxes. The final result will be an array of strings from a restricted list.

```js
{
  type: 'root',
  properties: {
    provider: {
      label: 'Providers',
      type: 'array',
      items: {
        type: 'string',
        enum: [
          ['nasa', 'NASA'],
          ['esa', 'ESA'],
          ['jaxa', 'JAXA']
        ]
      }
    }
  }
}
```

Array of objects:

The most complex option is when an array of objects is needed. This is done by defining the `items` property as an object with its own properties.

```js
{
  type: 'root',
  properties: {
    bands: {
      label: 'Bands',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            label: 'Name',
            type: 'string'
          },
          wavelength: {
            label: 'Wavelength',
            type: 'number'
          }
        }
      }
    }
  }
}
```

### Plugin widgets

Each plugin uses a default widget for each field type, but this can be changed by adding a `ui:widget` property to the field.

For example, the `radio` widget can be changed to a `select` widget, since they have the same result.

```js
{
  type: 'root',
  properties: {
    colormap: {
      'ui:widget': 'select'
      label: 'Colormap Name',
      type: 'string',
      enum: [
        ['viridis', 'Viridis'],
        ['plasma', 'Plasma'],
        ['inferno', 'Inferno']
      ],
    }
  }
}
```

The default widgets are:

- Simple string: `text`
- Options field: `radio`
- Array of simple strings: `array:string`
- Array of options: `checkbox`
