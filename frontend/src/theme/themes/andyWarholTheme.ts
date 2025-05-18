import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

const warholColors = {
  popPink: {
    50: '#FFE6F2',
    100: '#FFB3D9',
    200: '#FF80BF',
    300: '#FF4DA6',
    400: '#FF1A8C',
    500: '#FF007F', // Main Hot Pink
    600: '#E60073',
    700: '#CC0066',
    800: '#B30059',
    900: '#99004D',
  },
  popBlue: {
    50: '#E6F2FF',
    100: '#B3D9FF',
    200: '#80BFFF',
    300: '#4DA6FF',
    400: '#1A8CFF',
    500: '#007FFF', // Main Electric Blue
    600: '#0073E6',
    700: '#0066CC',
    800: '#0059B3',
    900: '#004D99',
  },
  popYellow: {
    50: '#FFFAED',
    100: '#FFF6DE',
    200: '#FFEEBF',
    300: '#FFDE8A',
    400: '#FFCD55',
    500: '#FFD700',
    600: '#E6BF00',
    700: '#CCA800',
    800: '#B39200',
    900: '#997C00',
  },
  popGreen: {
    50: '#F2FFF0',
    100: '#D9FFD6',
    200: '#BFFFAD',
    300: '#A6FF85',
    400: '#8CFF5C',
    500: '#7FFF00', // Main Lime Green
    600: '#73E600',
    700: '#66CC00',
    800: '#59B300',
    900: '#4D9900',
  },
  black: '#000000',
  white: '#FFFFFF',
  lightGray: '#F0F0F0',
  darkGray: '#2A2A2A',
};

export const andyWarholTheme = extendTheme({
  config: { ...baseThemeConfig, initialColorMode: 'dark' } as ThemeConfig,
  fonts: {
    heading: `'Bebas Neue', cursive`,
    body: `'Montserrat', sans-serif`,
  },
  colors: {
    primary: warholColors.popPink,
    secondary: warholColors.popBlue,
    accent1: warholColors.popYellow,
    accent2: warholColors.popGreen,
    pink: warholColors.popPink,
    blue: warholColors.popBlue,
    yellow: warholColors.popYellow,
    green: warholColors.popGreen,
    gray: {
      50: warholColors.white,
      100: warholColors.lightGray,
      200: '#E0E0E0',
      700: '#4A4A4A',
      800: warholColors.darkGray,
      900: warholColors.black,
    },
    error: warholColors.popPink,
    success: warholColors.popGreen,
    info: warholColors.popBlue,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'gray.900',
        color: 'gray.50',
      },
    }),
  },
  components: {
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'gray.900',
          borderColor: 'gray.800',
        },
        navLink: {
          color: 'gray.50',
          _hover: { bg: 'primary.500', color: 'gray.900' },
        },
        activeNavLink: {
          bg: 'primary.500',
          color: 'gray.900',
          fontWeight: 'bold',
           _hover: { bg: 'primary.600' },
        },
        headerText: {
          color: 'primary.500',
          fontFamily: `'Bebas Neue', cursive`,
        },
        userInfoText: {
            color: 'gray.100'
        }
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Montserrat', sans-serif`,
        borderRadius: '0',
        textTransform: 'uppercase',
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'primary' || props.colorScheme === 'yellow') {
            return {
              bg: 'yellow.500',
              color: 'gray.900',
              _hover: { bg: 'yellow.600' },
            };
          }
          if (props.colorScheme === 'pink') {
            return { bg: 'pink.500', color: 'gray.900', _hover: { bg: 'pink.600' } };
          }
          if (props.colorScheme === 'blue') {
            return { bg: 'blue.500', color: 'gray.900', _hover: { bg: 'blue.600' } };
          }
          return { 
            bg: 'gray.50',
            color: 'gray.900',
            _hover: { bg: 'gray.100'}
          };
        },
        outline: (props: StyleFunctionProps) => {
          const scheme = props.colorScheme || 'primary';
          let color = warholColors.popPink[500];
          if (scheme === 'blue') color = warholColors.popBlue[500];
          else if (scheme === 'yellow') color = warholColors.popYellow[500];
          else if (scheme === 'green') color = warholColors.popGreen[500];
          else if (scheme === 'gray' || scheme === 'black') color = warholColors.lightGray;

          return {
            borderColor: color,
            color: color,
            borderRadius: '0',
            textTransform: 'uppercase',
            _hover: { bg: color, color: warholColors.darkGray },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          let color = warholColors.popPink[500];
          if (props.colorScheme === 'blue') color = warholColors.popBlue[500];
          else if (props.colorScheme === 'yellow') color = warholColors.popYellow[500];
          else if (props.colorScheme === 'green') color = warholColors.popGreen[500];
          else if (props.colorScheme === 'gray' || !props.colorScheme) color = warholColors.lightGray;

          return {
            color: color,
            bg: 'transparent',
            _hover: {
              bg: warholColors.darkGray,
              color: warholColors.popYellow[500],
            },
            _active: {
              bg: warholColors.black,
              color: warholColors.popYellow[500],
            },
            _focus: {
              boxShadow: `0 0 0 2px ${warholColors.popPink[500]}`,
            }
          };
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: `'Bebas Neue', cursive`,
        textTransform: 'uppercase',
        color: 'gray.50',
      },
    },
    Card: {
        baseStyle: {
            bg: 'gray.800',
            borderWidth: '2px',
            borderColor: 'gray.50',
            borderRadius: '0',
            padding: 4,
            color: 'gray.50',
        }
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({
          th: {
            fontFamily: `'Bebas Neue', cursive`,
            textTransform: 'uppercase',
            color: 'gray.900',
            bg: 'yellow.500',
            border: '2px solid', 
            borderColor: 'gray.900',
          },
          td: {
            border: '2px solid', 
            borderColor: 'gray.700',
            color: 'gray.50',
            bg: 'gray.800',
          },
        }),
      },
    },
    Modal: {
      baseStyle: (props: StyleFunctionProps) => ({
        dialog: {
          bg: 'gray.800',
          border: '4px solid', 
          borderColor: 'yellow.500',
          borderRadius: '0',
          color: 'gray.50',
        },
        header: {
          fontFamily: `'Bebas Neue', cursive`,
          textTransform: 'uppercase',
          bg: 'yellow.500',
          color: 'black',
          padding: 4,
          borderBottom: '2px solid black',
        },
        body: {
          padding: 6,
          color: 'gray.50',
        },
        footer: {
            borderTop: '2px solid black',
            padding: 4,
        },
        closeButton: {
            color: 'black',
            bg: 'yellow.500',
            border: '2px solid black',
            borderRadius: '0',
            top: '10px',
            right: '10px',
            _hover: {
                bg: 'pink.500',
                color: 'black'
            }
        }
      })
    },
    Menu: {
      baseStyle: (props: StyleFunctionProps) => ({
        list: {
          bg: 'gray.800',
          border: '2px solid',
          borderColor: 'yellow.500',
          borderRadius: '0',
          color: 'gray.50',
          boxShadow: `5px 5px 0px ${warholColors.popPink[500]}`,
        },
        item: {
          bg: 'gray.800',
          color: 'gray.50',
          fontFamily: `'Montserrat', sans-serif`,
          textTransform: 'uppercase',
          borderRadius: '0',
          _hover: {
            bg: 'pink.500',
            color: 'black',
          },
          _focus: {
            bg: 'pink.600',
            color: 'black',
          },
          icon: {
            color: 'yellow.500',
            marginRight: '12px',
            fontSize: '1.2em',
          }
        },
      }),
    },
  }
}); 