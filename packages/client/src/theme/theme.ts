import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe
} from '@chakra-ui/react';
import { adjustHue, setLightness, setSaturation } from 'polished';

import { createColorPalette } from './color-palette';

const primary = process.env.REACT_APP_THEME_PRIMARY_COLOR || '#6A5ACD';
const secondary = process.env.REACT_APP_THEME_SECONDARY_COLOR || '#048A81';
const base = setSaturation(0.32, setLightness(0.16, adjustHue(48, primary)));

/**
 * Wrap a flat `{ 50: '#hex', 100: '#hex', ... }` palette into the Chakra v3
 * token shape `{ 50: { value: '#hex' }, ... }` without modifying the
 * `createColorPalette` helper (which is also consumed standalone).
 */
function toTokens(palette: Record<string, string>): Record<string, { value: string }> {
  return Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [k, { value: v }])
  );
}

const palettes = {
  primary: toTokens(createColorPalette(primary) as Record<string, string>),
  secondary: toTokens(createColorPalette(secondary) as Record<string, string>),
  base: toTokens(createColorPalette(base) as Record<string, string>),
  danger: toTokens(createColorPalette('#FF5353') as Record<string, string>),
  warning: toTokens(createColorPalette('#FFC849') as Record<string, string>),
  success: toTokens(createColorPalette('#46D6CD') as Record<string, string>),
  info: toTokens(createColorPalette('#1A5BDB') as Record<string, string>),
  surface: toTokens(createColorPalette('#FFF') as Record<string, string>),
  gray: toTokens(createColorPalette(base) as Record<string, string>)
};

const config = defineConfig({
  globalCss: {
    body: {
      fontSize: 'sm',
      color: 'base.500',
      maxWidth: '100vw',
      overflowX: 'hidden'
    },
    '*': {
      lineHeight: 'calc(0.5rem + 1em)'
    }
  },
  theme: {
    tokens: {
      colors: palettes,
      fonts: {
        body: { value: 'Inter' },
        heading: { value: 'Inter' }
      },
      fontSizes: {
        xs: { value: '0.75rem' },
        sm: { value: '1rem' },
        md: { value: '1.25rem' },
        lg: { value: '1.5rem' },
        xl: { value: '1.75rem' },
        '2xl': { value: '2rem' },
        '3xl': { value: '2.25rem' },
        '4xl': { value: '2.5rem' },
        '5xl': { value: '2.75rem' },
        '6xl': { value: '3rem' },
        '7xl': { value: '3.25rem' },
        '8xl': { value: '3.5rem' },
        '9xl': { value: '3.75rem' },
        '10xl': { value: '4rem' }
      }
    },
    textStyles: {
      'lead.sm': { value: { fontSize: 'md' } },
      'lead.lg': { value: { fontSize: 'lg' } }
    },
    recipes: {
      heading: defineRecipe({
        base: {
          fontWeight: '700'
        }
      }),
      link: defineRecipe({
        base: {
          color: 'primary.500'
        }
      }),
      button: defineRecipe({
        base: {
          borderRadius: 'md',
          fontWeight: '700',
          // Avoid removing underline on non-anchor buttons.
          '&:is(a):hover': {
            textDecoration: 'none'
          }
        },
        variants: {
          size: {
            xs: { fontSize: 'xs' },
            sm: { fontSize: 'xs' },
            md: { fontSize: 'sm' },
            lg: { fontSize: 'sm' }
          },
          variant: {
            outline: {
              border: '2px solid',
              '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
                { marginEnd: '-2px' },
              '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
                { marginBottom: '-2px' }
            },
            // v3 doesn't support function variants. Use `colorPalette.*` token
            // references so `colorPalette={...}` (the v3 replacement for
            // colorScheme) drives the palette lookup.
            'soft-outline': {
              border: '2px solid',
              borderColor: 'colorPalette.200',
              '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
                { marginEnd: '-2px' },
              '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
                { marginBottom: '-2px' },
              _hover: {
                bg: 'colorPalette.50a'
              },
              _active: {
                bg: 'colorPalette.100a'
              }
            }
          }
        }
      }),
      input: defineRecipe({
        variants: {
          variant: {
            outline: {
              border: '2px solid'
            }
          }
        }
      })
    },
    slotRecipes: {
      menu: defineSlotRecipe({
        slots: ['item'],
        base: {
          item: {
            _hover: { textDecoration: 'none !important' }
          }
        }
      }),
      card: defineSlotRecipe({
        slots: ['root'],
        variants: {
          variant: {
            filled: {
              root: {
                background: 'base.50'
              }
            }
          }
        }
      }),
      select: defineSlotRecipe({
        slots: ['trigger'],
        variants: {
          variant: {
            outline: {
              trigger: {
                border: '2px solid'
              }
            }
          }
        }
      }),
      // v3 has no standalone FormLabel — labels live inside the `field` slot
      // recipe as the `label` slot.
      field: defineSlotRecipe({
        slots: ['label'],
        base: {
          label: {
            fontSize: 'sm'
          }
        }
      })
    }
  }
});

export const system = createSystem(defaultConfig, config);
export default system;
