import { Plugin, PluginEditSchema } from '@stac-manager/data-core';
import { emptyString2Null, fieldIf, null2EmptyString } from '../utils';

export class PluginCore extends Plugin {
  name = 'CollectionsCore';

  isNew: boolean = false;

  async init(data: any) {
    this.isNew = !data?.id;
  }

  editSchema(): PluginEditSchema {
    return {
      type: 'root',
      required: [
        'id',
        'description',
        'license',
        'spatial',
        'temporal',
        'links'
      ],
      properties: {
        ...fieldIf(this.isNew, 'id', {
          label: 'Collection ID',
          type: 'string'
        }),
        title: {
          label: 'Title',
          type: 'string'
        },
        description: {
          label: 'Description',
          type: 'string'
        },
        keywords: {
          type: 'array',
          label: 'Keywords',
          'ui:widget': 'tagger',
          items: {
            label: 'Keyword',
            type: 'string'
          }
        },
        license: {
          label: 'License',
          type: 'string',
          'ui:widget': 'tagger',
          allowOther: {
            type: 'string'
          },
          enum: [
            ['Apache-2.0', 'Apache License 2.0'],
            ['MIT', 'MIT License'],
            ['GPL-3.0', 'GNU General Public License v3.0'],
            ['BSD-3-Clause', 'BSD 3-Clause License'],
            ['MPL-2.0', 'Mozilla Public License 2.0']
          ]
        },
        providers: {
          type: 'array',
          label: 'Providers',
          items: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                label: 'Name',
                type: 'string'
              },
              roles: {
                label: 'Roles',
                type: 'array',
                items: {
                  label: 'Role',
                  type: 'string',
                  enum: [
                    ['licensor', 'Licensor'],
                    ['producer', 'Producer'],
                    ['processor', 'Processor'],
                    ['host', 'Host']
                  ]
                }
              },
              url: {
                label: 'URL',
                type: 'string'
              }
            }
          }
        },
        stac_extensions: {
          type: 'array',
          label: 'STAC Extensions',
          items: {
            label: 'Extension',
            type: 'string'
          }
        },
        spatial: {
          label: 'Spatial Extent',
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
              type: 'number'
            }
          }
        },
        temporal: {
          label: 'Temporal Extent',
          type: 'array',
          minItems: 1,
          items: {
            type: 'array',
            label: 'Extent',
            minItems: 2,
            maxItems: 2,
            items: {
              label: ['Start', 'End'],
              type: 'string'
            }
          }
        },
        links: {
          type: 'array',
          label: 'Links',
          minItems: 1,
          items: {
            type: 'object',
            required: ['rel', 'href', 'type'],
            properties: {
              href: {
                label: 'URL',
                type: 'string'
              },
              rel: {
                label: 'Relation',
                type: 'string'
              },
              type: {
                label: 'Type',
                type: 'string',
                'ui:widget': 'select',
                enum: [
                  ['application/geo+json', 'geo+json'],
                  ['application/geopackage+sqlite3', 'geopackage+sqlite3'],
                  ['application/json', 'json'],
                  ['application/schema+json', 'schema+json'],
                  [
                    'application/vnd.google-earth.kml+xml',
                    'vnd.google-earth.kml+xml'
                  ],
                  ['application/vnd.google-earth.kmz', 'vnd.google-earth.kmz'],
                  [
                    'application/vnd.oai.openapi+json;version=3.0',
                    'vnd.oai.openapi+json;version=3.0'
                  ],
                  ['application/x-hdf', 'x-hdf'],
                  ['application/x-hdf5', 'x-hdf5'],
                  ['application/xml', 'xml'],
                  ['image/jp2', 'jp2'],
                  ['image/jpeg', 'jpeg'],
                  ['image/png', 'png'],
                  [
                    'image/tiff; application=geotiff; profile=cloud-optimized',
                    'COG'
                  ],
                  ['image/tiff; application=geotiff', 'Geotiff'],
                  ['text/html', 'HTML'],
                  ['text/plain', 'Text']
                ]
              },
              title: {
                label: 'Title',
                type: 'string'
              }
            }
          }
        },
        assets: {
          type: 'array',
          label: 'Assets',
          items: {
            type: 'object',
            required: ['id', 'href'],
            properties: {
              id: {
                label: 'Id',
                type: 'string'
              },
              href: {
                label: 'Href',
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
              type: {
                label: 'Type',
                type: 'string'
              },
              roles: {
                label: 'Roles',
                type: 'array',
                items: {
                  label: 'Role',
                  type: 'string'
                }
              }
            }
          }
        },
        summaries: {
          type: 'json',
          label: 'Summaries'
        }
      }
    };
  }

  enterData(data: any = {}) {
    return {
      id: data?.id,
      title: data?.title,
      description: data?.description,
      keywords: data?.keywords || [],
      license: data?.license,
      providers: data?.providers || [],
      stac_extensions: data?.stac_extensions,
      spatial: data?.extent?.spatial.bbox || [],
      temporal: data?.extent?.temporal.interval.map(null2EmptyString) || [],
      links: data?.links || [],
      assets: Object.entries<Record<string, any>>(data?.assets || {}).map(
        ([key, value]) => ({
          id: key,
          ...value
        })
      ),
      summaries: data?.summaries || {}
    };
  }

  exitData(data: any) {
    return {
      type: 'Collection',
      stac_version: '1.0.0',
      id: data.id,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      license: data.license,
      providers: data.providers,
      stac_extensions: data.stac_extensions,

      extent: {
        spatial: {
          bbox: data.spatial
        },
        temporal: {
          interval: data.temporal.map(emptyString2Null)
        }
      },

      links: data.links,
      assets: (data.assets as Record<string, any>[]).reduce(
        (acc, asset: Record<string, any>) => {
          return {
            ...acc,
            [asset.id]: asset
          };
        },
        {}
      ),
      summaries: data.summaries
    };
  }
}
