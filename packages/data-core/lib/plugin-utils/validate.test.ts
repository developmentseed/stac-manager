import { Plugin, PluginEditSchema } from './plugin';
import { validatePluginsFieldsData } from './validate';

describe('validatePluginsFieldsData', () => {
  test('No data', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            required: ['description', 'license'],
            properties: {
              description: {
                label: 'Description',
                type: 'string'
              },
              license: {
                label: 'License',
                type: 'string',
                enum: [
                  ['one', 'License One'],
                  ['two', 'License Two'],
                  ['three', 'License Three']
                ]
              }
            }
          };
        }
      }
    ] as Plugin[];
    const [, errors] = validatePluginsFieldsData(plugins, {});
    expect(errors).toEqual({
      description: 'Description is a required field',
      license: 'License is a required field'
    });
  });

  test('Invalid enum', () => {
    const plugins = [
      {
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            required: ['license'],
            properties: {
              license: {
                label: 'License',
                type: 'string',
                enum: [
                  ['one', 'License One'],
                  ['two', 'License Two'],
                  ['three', 'License Three']
                ]
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      license: 'invalid'
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual({
      license: 'License value is invalid'
    });
  });

  test('Invalid enum empty', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            required: ['license'],
            properties: {
              license: {
                label: 'License',
                type: 'string',
                enum: [
                  ['one', 'License One'],
                  ['two', 'License Two'],
                  ['three', 'License Three']
                ]
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      license: ''
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual({
      license: 'License value is invalid'
    });
  });

  test('Allowed empty enum', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            properties: {
              type: {
                label: 'Type',
                type: 'string',
                enum: [
                  ['one', 'Type One'],
                  ['two', 'Type Two'],
                  ['three', 'Type Three']
                ]
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      type: ''
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual(null);
  });

  test('Allowed other enum', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            properties: {
              type: {
                label: 'Type',
                type: 'string',
                allowOther: {
                  type: 'string'
                },
                enum: [
                  ['one', 'Type One'],
                  ['two', 'Type Two'],
                  ['three', 'Type Three']
                ]
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      type: 'special'
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual(null);
  });

  test('Missing nested', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            properties: {
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
                    }
                  }
                }
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      providers: [
        {
          url: 'http://example.com'
        }
      ]
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual({
      providers: [{ name: 'Name is a required field' }]
    });
  });

  test('Wrong array count', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            properties: {
              spatial: {
                label: 'Spatial Extent',
                type: 'array',
                minItems: 2,
                items: {
                  type: 'number'
                }
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      spatial: [1]
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual({
      spatial: 'Spatial Extent field must have at least 2 items'
    });
  });

  test('Wrong field type', () => {
    const plugins = [
      {
        name: 'Render Extension',
        editSchema(): PluginEditSchema {
          return {
            type: 'root',
            required: ['description', 'license'],
            properties: {
              spatial: {
                label: 'Spatial Extent',
                type: 'array',
                minItems: 2,
                items: {
                  type: 'number'
                }
              }
            }
          };
        }
      }
    ] as Plugin[];
    const data = {
      spatial: ['one', 'two']
    };
    const [, errors] = validatePluginsFieldsData(plugins, data);
    expect(errors).toEqual({
      spatial: ['Value must be a number', 'Value must be a number']
    });
  });
});
