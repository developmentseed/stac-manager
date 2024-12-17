import { Plugin, PluginEditSchema } from '@stac-manager/data-core';

export class PluginKitchenSink extends Plugin {
  name = 'Kitchen Sink';

  editSchema(): PluginEditSchema {
    return {
      type: 'root',
      properties: {
        title: {
          type: 'string',
          label: 'Simple text'
        },
        arr_strings: {
          label: 'Array of Strings (default)',
          type: 'array',
          items: {
            label: 'String',
            type: 'string'
          }
        },
        arr_strings_tags: {
          label: 'Array of Strings (Tagger widget)',
          type: 'array',
          'ui:widget': 'tagger',
          items: {
            type: 'string'
          }
        },
        arr_strings_tags_opts: {
          label: 'Array of Strings (Tagger widget with options)',
          type: 'array',
          'ui:widget': 'tagger',
          items: {
            type: 'string',
            enum: [
              ['viridis', 'Viridis'],
              ['plasma', 'Plasma'],
              ['inferno', 'Inferno']
            ]
          }
        },
        select_tag: {
          label: 'Select one string (Tagger widget with options)',
          type: 'string',
          'ui:widget': 'tagger',
          enum: [
            ['viridis', 'viridis'],
            ['plasma', 'plasma'],
            ['inferno', 'inferno']
          ]
        },
        arr_obj: {
          label: 'Array of Objects (with limits 1-3)',
          type: 'array',
          minItems: 1,
          maxItems: 3,
          items: {
            type: 'object',
            properties: {
              name: {
                label: 'Name',
                type: 'string'
              },
              nick: {
                label: 'Nickname',
                type: 'string'
              }
            },
            additionalProperties: true
          }
        },
        spatial: {
          label: 'Array of array of 4 fields',
          type: 'array',
          minItems: 1,
          items: {
            type: 'array',
            label: 'Extent',
            minItems: 4,
            maxItems: 4,
            items: {
              label: [
                'Min Longitude',
                'Min Latitude',
                'Max Longitude',
                'Max Latitude'
              ],
              type: 'string'
            }
          }
        },
        checkbox: {
          label: 'Select multiple strings (default)',
          type: 'array',
          items: {
            type: 'string',
            enum: [
              ['viridis', 'viridis'],
              ['plasma', 'plasma'],
              ['inferno', 'inferno']
            ]
          }
        },
        checkbox_as_select: {
          label: 'Select multiple strings (Select widget)',
          type: 'array',
          'ui:widget': 'select',
          items: {
            type: 'string',
            enum: [
              ['viridis', 'viridis'],
              ['plasma', 'plasma'],
              ['inferno', 'inferno']
            ]
          }
        },
        radio: {
          label: 'Select one string (default)',
          type: 'string',
          enum: [
            ['viridis', 'viridis'],
            ['plasma', 'plasma'],
            ['inferno', 'inferno']
          ]
        },
        select: {
          label: 'Select one string (Select widget)',
          type: 'string',
          'ui:widget': 'select',
          enum: [
            ['viridis', 'viridis'],
            ['plasma', 'plasma'],
            ['inferno', 'inferno']
          ]
        },
        array_checkboxes: {
          label: 'Array of array of strings (default) ',
          type: 'array',
          items: {
            label: 'Group',
            type: 'array',
            items: {
              label: 'Checkbox option',
              type: 'string',
              enum: [
                ['viridis', 'viridis'],
                ['plasma', 'plasma'],
                ['inferno', 'inferno']
              ]
            }
          }
        },
        array_checkboxes_as_select: {
          label: 'Array of array of strings (Select widget) ',
          type: 'array',
          items: {
            label: 'Group',
            type: 'array',
            'ui:widget': 'select',
            items: {
              label: 'Checkbox option',
              type: 'string',
              enum: [
                ['viridis', 'viridis'],
                ['plasma', 'plasma'],
                ['inferno', 'inferno']
              ]
            }
          }
        },
        json: {
          label: 'Json field',
          type: 'json'
        }
      }
    };
  }

  enterData({ arr, extent, json, ...rest }: any = {}) {
    return {
      ...rest,
      arr_obj: arr,
      spatial: extent?.spatial,
      json: json || {
        key: 'value',
        arr: [1, 2, 3, 4],
        obj: { key: 'value' }
      }
    };
  }

  exitData({ arr_obj, spatial, ...rest }: any = {}) {
    return {
      arr: arr_obj,
      extent: {
        spatial: spatial?.map((inner: string[]) => inner.map((v: string) => v))
      },
      ...rest
    };
  }
}
