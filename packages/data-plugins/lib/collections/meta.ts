import { Plugin, PluginEditSchema } from '@stac-manager/data-core';

export class PluginMeta extends Plugin {
  name = 'CollectionsMeta';

  // async init(data) {
  //   await new Promise((resolve) => setTimeout(resolve, 100));
  // }

  editSchema(): PluginEditSchema {
    return {
      type: 'root',
      properties: {
        id: {
          label: 'Collection ID',
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
        license: {
          label: 'license',
          type: 'string'
        },
        spatial: {
          label: 'Spatial Extent',
          type: 'array',
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
        temporal: {
          label: 'Temporal Extent',
          type: 'array',
          items: {
            label: 'Item',
            type: 'string'
          }
        }
      }
    };
  }

  enterData({ title, description, id, extent }: any = {}) {
    return {
      title,
      description,
      id,
      spatial: extent?.spatial.bbox || [],
      temporal: extent?.temporal.bbox || []
    };
  }

  exitData(data: any) {
    return {
      type: 'Collection',
      links: [
        {
          rel: 'self',
          type: 'application/json',
          href: 'http://localhost:8081/'
        }
      ],
      id: data.id,
      title: data.title,
      description: data.description,
      license: data.license,
      extent: {
        spatial: {
          bbox: [data.spatial?.map(({ value }: any) => Number(value))]
        },
        temporal: {
          interval: [data.temporal?.map(({ value }: any) => value)]
        }
      }
    };
  }
}
