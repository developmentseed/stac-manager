import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe
} from '@chakra-ui/react';
import {
  fieldAnatomy,
  menuAnatomy,
  selectAnatomy
} from '@chakra-ui/react/anatomy';
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
function toTokens(
  palette: Record<string, string>
): Record<string, { value: string }> {
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
    semanticTokens: {
      colors: Object.fromEntries(
        Object.keys(palettes).map((name) => {
          // Neutral palettes follow Chakra's gray pattern (border/solid use
          // lighter/darker shades than the chromatic palettes). Our `base`,
          // `gray`, and `surface` are neutrals; the rest are chromatic.
          const isNeutral =
            name === 'gray' || name === 'base' || name === 'surface';
          return [
            name,
            {
              contrast: { value: 'white' },
              fg: { value: `{colors.${name}.800}` },
              subtle: { value: `{colors.${name}.100}` },
              muted: { value: `{colors.${name}.200}` },
              emphasized: { value: `{colors.${name}.300}` },
              solid: {
                value: isNeutral
                  ? `{colors.${name}.900}`
                  : `{colors.${name}.500}`
              },
              focusRing: {
                value: isNeutral
                  ? `{colors.${name}.400}`
                  : `{colors.${name}.500}`
              },
              border: {
                value: isNeutral
                  ? `{colors.${name}.200}`
                  : `{colors.${name}.500}`
              }
            }
          ];
        })
      )
    },
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
        },
        // v2's Heading sizes were shifted vs v3's 1:1 mapping
        // (v2 size='sm' → fontSize='md', etc.). Re-map to preserve
        // visual hierarchy without touching call sites.
        variants: {
          size: {
            xs: { fontSize: 'sm' },
            sm: { fontSize: 'md' },
            md: { fontSize: 'lg' },
            lg: { fontSize: 'xl' },
            xl: { fontSize: '2xl' },
            '2xl': { fontSize: '3xl' },
            '3xl': { fontSize: '4xl' },
            '4xl': { fontSize: '5xl' }
          }
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
            // Use individual border-* properties (not the `border` shorthand)
            // so we override width only and Chakra v3's default
            // `borderColor: colorPalette.border` (mapped to colorPalette.500 in
            // our semantic tokens) is preserved.
            outline: {
              borderWidth: '2px',
              borderStyle: 'solid',
              // v3's ButtonGroup is implemented via <Group>, which exposes
              // `data-attached` + `data-orientation` on the parent (no more
              // `.chakra-button__group` class). Group's own attached rules use
              // `marginEnd: -1px` for 1px borders; override with -2px so our
              // 2px-bordered outline buttons overlap cleanly.
              '[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
                { marginEnd: '-2px' },
              '[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
                { marginBottom: '-2px' },
              // v3's outline recipe has no selected/active style. Components
              // that mark a persistent active state via `data-active` (e.g. the
              // Form/JSON view toggle) would otherwise be indistinguishable from
              // their inactive siblings.
              '&[data-active]': {
                bg: 'colorPalette.subtle'
              }
            },
            // v3 doesn't support function variants. Use `colorPalette.*` token
            // references so `colorPalette={...}` (the v3 replacement for
            // colorScheme) drives the palette lookup.
            'soft-outline': {
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'colorPalette.200',
              '[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
                { marginEnd: '-2px' },
              '[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
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
            // Use individual border-* properties so Chakra v3's default
            // `borderColor: 'border'` (resolves to our gray.200) is preserved.
            outline: {
              borderWidth: '2px',
              borderStyle: 'solid'
            }
          }
        }
      })
    },
    slotRecipes: {
      // Declare the full v3 anatomy slot list. Omitting slots silently strips
      // styling from the default recipe for any slot not listed (same trap
      // we hit with `card`); always pass the complete anatomy keys.
      menu: defineSlotRecipe({
        slots: menuAnatomy.keys(),
        base: {
          item: {
            _hover: { textDecoration: 'none !important' }
          }
        }
      }),
      card: defineSlotRecipe({
        slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
        // v2 used 20px (spacing.5) padding; v3 defaults to 24px (spacing.6).
        // v2's header/footer also had uniform padding on all sides — v3
        // omits paddingBottom on header / paddingTop on footer assuming a
        // body fills the gap. Restore symmetric padding so ItemCards
        // without a body slot still look correct.
        base: {
          header: { paddingBottom: 'var(--card-padding)' },
          footer: { paddingTop: 'var(--card-padding)' }
        },
        variants: {
          size: {
            md: { root: { '--card-padding': 'spacing.5' } }
          },
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
        slots: selectAnatomy.keys(),
        variants: {
          variant: {
            outline: {
              trigger: {
                borderWidth: '2px',
                borderStyle: 'solid'
              }
            }
          }
        }
      }),
      // v3 has no standalone FormLabel — labels live inside the `field` slot
      // recipe as the `label` slot.
      field: defineSlotRecipe({
        slots: fieldAnatomy.keys(),
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
