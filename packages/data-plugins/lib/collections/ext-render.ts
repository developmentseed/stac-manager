import { Plugin, PluginEditSchema } from '@stac-manager/data-core';
import {
  addStacExtensionOption,
  array2Object,
  hasStacExtension,
  object2Array,
  object2Tuple,
  tuple2Object
} from '../utils';

export class PluginRender extends Plugin {
  name = 'Render Extension';

  constructor() {
    super();

    addStacExtensionOption(
      this,
      'Render',
      'https://stac-extensions.github.io/render/v2.0.0/schema.json'
    );
  }

  editSchema(data: any): PluginEditSchema {
    if (!hasStacExtension(data, 'render')) {
      return Plugin.HIDDEN;
    }

    return {
      type: 'root',
      properties: {
        renders: {
          type: 'array',
          label: 'Renders',
          items: {
            type: 'object',
            required: ['id', 'assets'],
            additionalProperties: true,
            properties: {
              id: {
                label: 'Render ID',
                type: 'string'
              },
              assets: {
                type: 'array',
                label: 'Assets',
                minItems: 1,
                items: {
                  type: 'string'
                }
              },
              rescale: {
                type: 'array',
                label: 'Rescale',
                items: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: {
                    type: 'number',
                    label: ['Min', 'Max']
                  }
                }
              },
              nodata: {
                label: 'No Data Value',
                type: 'string'
              },
              colormap_name: {
                label: 'Colormap',
                type: 'string',
                'ui:widget': 'tagger',
                allowOther: {
                  type: 'string'
                },
                enum: colorMaps
              },
              colormap: {
                type: 'array',
                label: 'Colormap (Custom)',
                items: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: {
                    type: 'string',
                    label: ['Value', 'Color']
                  }
                }
              },
              resampling: {
                label: 'Resampling',
                type: 'string',
                'ui:widget': 'tagger',
                allowOther: {
                  type: 'string'
                },
                enum: [
                  ['near', 'Nearest neighbour'],
                  ['bilinear', 'Bilinear'],
                  ['cubic', 'Cubic'],
                  ['cubicspline', 'Cubic spline'],
                  ['lanczos', 'Lanczos windowed sinc'],
                  ['average', 'Average'],
                  ['rms', 'Root mean square'],
                  ['mode', 'Mode'],
                  ['max', 'Maximum'],
                  ['min', 'Minimum'],
                  ['med', 'Median'],
                  ['q1', 'First quartile'],
                  ['q3', 'Third quartile'],
                  ['sum', 'Weighted sum']
                ]
              },
              expression: {
                label: 'Expression',
                type: 'string'
              },
              minmax_zoom: {
                type: 'array',
                label: 'Min/Max Zoom',
                minItems: 2,
                maxItems: 2,
                items: {
                  type: 'number',
                  label: ['Min', 'Max']
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
      renders: object2Array<{ colormap: Record<string, string> }>(
        data.renders,
        'id',
        (v) => ({
          ...v,
          colormap: object2Tuple(v.colormap)
        })
      )
    };
  }

  exitData(data: any) {
    return {
      renders: array2Object(data.renders, 'id', (v) => ({
        ...v,
        colormap: tuple2Object(v.colormap)
      }))
    };
  }
}

const colorMaps = [
  'dense_r',
  'turbid',
  'rdbu',
  'ice',
  'purd_r',
  'bugn',
  'bone',
  'plasma_r',
  'gist_yarg',
  'rdpu_r',
  'afmhot_r',
  'plasma',
  'amp_r',
  'piyg_r',
  'ylorbr',
  'phase_r',
  'matter_r',
  'pastel1',
  'inferno_r',
  'purd',
  'paired',
  'thermal',
  'gist_heat_r',
  'greens_r',
  'summer',
  'terrain',
  'gist_earth_r',
  'gnbu',
  'topo_r',
  'algae_r',
  'gist_heat',
  'puor_r',
  'wistia_r',
  'speed',
  'gist_gray',
  'cubehelix_r',
  'brbg',
  'haline_r',
  'ylgnbu',
  'algae',
  'thermal_r',
  'rdgy_r',
  'winter',
  'rdylgn',
  'spring',
  'flag',
  'hot_r',
  'matter',
  'rdpu',
  'nipy_spectral_r',
  'prgn',
  'tab20b_r',
  'bupu_r',
  'coolwarm',
  'twilight_shifted',
  'hsv_r',
  'delta_r',
  'seismic',
  'amp',
  'oranges',
  'cmrmap',
  'diff_r',
  'tab20c',
  'paired_r',
  'ocean_r',
  'bwr',
  'topo',
  'seismic_r',
  'gist_stern_r',
  'tempo_r',
  'gnbu_r',
  'brg',
  'cividis',
  'gist_gray_r',
  'set2_r',
  'pubugn',
  'pastel2_r',
  'cool_r',
  'blues',
  'flag_r',
  'jet_r',
  'tab20',
  'curl',
  'winter_r',
  'nipy_spectral',
  'phase',
  'hot',
  'spectral_r',
  'summer_r',
  'hsv',
  'tarn',
  'twilight_shifted_r',
  'ylgnbu_r',
  'ylorbr_r',
  'ylgn_r',
  'pink_r',
  'puor',
  'viridis_r',
  'balance_r',
  'gist_earth',
  'magma',
  'pastel2',
  'rain_r',
  'brg_r',
  'solar',
  'binary_r',
  'reds',
  'tab10',
  'gray_r',
  'gist_yarg_r',
  'cubehelix',
  'accent_r',
  'delta',
  'gist_rainbow_r',
  'spectral',
  'pink',
  'set3',
  'gist_ncar',
  'balance',
  'greys',
  'rainbow',
  'diff',
  'bone_r',
  'speed_r',
  'bugn_r',
  'solar_r',
  'pubugn_r',
  'coolwarm_r',
  'cmrmap_r',
  'set1',
  'rain',
  'ylorrd',
  'set3_r',
  'twilight_r',
  'schwarzwald',
  'gnuplot2_r',
  'rdylgn_r',
  'greys_r',
  'set1_r',
  'cool',
  'pubu',
  'reds_r',
  'gray',
  'gnuplot_r',
  'spring_r',
  'pubu_r',
  'prism_r',
  'set2',
  'prgn_r',
  'tab20_r',
  'copper',
  'cividis_r',
  'bupu',
  'viridis',
  'rplumbo',
  'turbo_r',
  'dense',
  'accent',
  'gnuplot2',
  'prism',
  'orrd',
  'jet',
  'piyg',
  'brbg_r',
  'purples',
  'terrain_r',
  'deep_r',
  'rdbu_r',
  'turbo',
  'turbid_r',
  'deep',
  'rainbow_r',
  'tempo',
  'wistia',
  'dark2',
  'oranges_r',
  'cfastie',
  'twilight',
  'ylorrd_r',
  'autumn_r',
  'gist_rainbow',
  'tab20b',
  'rdylbu_r',
  'orrd_r',
  'rdgy',
  'gist_ncar_r',
  'binary',
  'magma_r',
  'gnuplot',
  'haline',
  'dark2_r',
  'tarn_r',
  'gist_stern',
  'inferno',
  'curl_r',
  'purples_r',
  'blues_r',
  'autumn',
  'rdylbu',
  'ocean',
  'afmhot',
  'tab20c_r',
  'oxy',
  'oxy_r',
  'ylgn',
  'pastel1_r',
  'greens',
  'ice_r',
  'copper_r',
  'tab10_r',
  'bwr_r'
].map<[string, string]>((v) => [v, v]);
