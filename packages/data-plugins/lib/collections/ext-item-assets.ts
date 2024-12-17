import { Plugin, PluginEditSchema } from '@stac-manager/data-core';
import { array2Object, hasExtension, object2Array } from '../utils';

export class PluginItemAssets extends Plugin {
  name = 'Item Assets Extension';

  editSchema(data: any): PluginEditSchema {
    if (!hasExtension(data, 'item-assets')) {
      return Plugin.HIDDEN;
    }

    return {
      type: 'root',
      properties: {
        item_assets: {
          type: 'array',
          label: 'Item Assets',
          minItems: 1,
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                label: 'Item Asset ID',
                type: 'string'
              },
              type: {
                label: 'Type',
                type: 'string'
              },
              title: {
                label: 'Title',
                type: 'string'
              },
              description: {
                label: 'Description',
                type: 'string'
              },
              roles: {
                label: 'Roles',
                type: 'array',
                'ui:widget': 'tagger',
                items: {
                  label: 'Role',
                  type: 'string',
                  enum: [
                    ['thumbnail', 'Thumbnail'],
                    ['overview', 'Overview'],
                    ['data', 'Data'],
                    ['metadata', 'Metadata']
                  ]
                }
              }
            }
          }
        }
      }
    };
  }

  enterData(data: any = {}) {
    return {
      item_assets: object2Array(data.item_assets, 'id')
    };
  }

  exitData(data: any) {
    return {
      item_assets: array2Object(data.item_assets, 'id')
    };
  }
}
