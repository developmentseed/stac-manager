import { extendTheme } from '@chakra-ui/react';
import { createColorPalette } from './color-palette';

const theme = {
  colors: {
    primary: createColorPalette('#6A5ACD'),
    secondary: createColorPalette('#048A81'),
    base: createColorPalette('#331A33'),
    danger: createColorPalette('#FF5353'),
    warning: createColorPalette('#FFC849'),
    success: createColorPalette('#46D6CD'),
    info: createColorPalette('#1A5BDB'),
    surface: createColorPalette('#FFF')
  },
  fonts: {
    body: 'Inter',
    heading: 'Inter'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '1.75rem',
    '2xl': '2rem',
    '3xl': '2.25rem',
    '4xl': '2.5rem',
    '5xl': '2.75rem',
    '6xl': '3rem',
    '7xl': '3.25rem',
    '8xl': '3.5rem',
    '9xl': '3.75rem',
    '10xl': '4rem'
  },
  styles: {
    global: {
      body: {
        fontSize: 'sm',
        color: 'base.500',
        mW: '100vw',
        overflowX: 'hidden'
      },
      '*': {
        lineHeight: 'calc(0.5rem + 1em)'
      }
    }
  },
  textStyles: {
    lead: {
      sm: {
        fontSize: 'md'
      },
      lg: {
        fontSize: 'lg'
      }
    }
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: '700'
      }
    },
    Link: {
      baseStyle: {
        color: 'primary.500'
      }
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'sm'
      }
    },
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: '700',
        ':is(a):hover': {
          textDecoration: 'none'
        }
      },
      sizes: {
        xs: {
          fontSize: 'xs'
        },
        sm: {
          fontSize: 'xs'
        },
        md: {
          fontSize: 'sm'
        },
        lg: {
          fontSize: 'sm'
        }
      },
      variants: {
        outline: {
          border: '2px solid',
          '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
            { marginEnd: '-2px' },
          '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
            { marginBottom: '-2px' }
        },
        'soft-outline': (props: any) => {
          const { colorScheme: c } = props;
          return {
            border: '2px solid',
            borderColor: `${c}.200a`,
            '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
              { marginEnd: '-2px' },
            '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
              { marginBottom: '-2px' },
            _hover: {
              bg: `${c}.50a`
            },
            _active: {
              bg: `${c}.100a`
            }
          };
        }
      }
    }
  }
};

export default extendTheme(theme);
