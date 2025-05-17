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
  config: { ...baseThemeConfig, initialColorMode: 'light' } as ThemeConfig,
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
        bg: 'gray.50',
        color: 'gray.800',
      },
    }),
  },
  components: {
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'gray.900',
          borderColor: 'gray.900',
        },
        navLink: {
          color: 'gray.50',
          _hover: { bg: 'primary.500', color: 'gray.900' },
        },
        activeNavLink: {
          bg: 'primary.500',
          color: 'gray.900',
          fontWeight: 'bold',
           _hover: { bg: 'primary.500' },
        },
        headerText: {
          color: 'primary.500',
          fontFamily: `'Bebas Neue', cursive`,
        },
        userInfoText: {
            color: 'gray.200'
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
            return { bg: 'pink.500', color: 'white', _hover: { bg: 'pink.600' } };
          }
          if (props.colorScheme === 'blue') {
            return { bg: 'blue.500', color: 'white', _hover: { bg: 'blue.600' } };
          }
          return { 
            bg: 'gray.900',
            color: 'gray.50',
            _hover: { bg: 'gray.800'}
          };
        },
        outline: (props: StyleFunctionProps) => {
          const scheme = props.colorScheme || 'primary';
          let color = warholColors.popPink[500];
          if (scheme === 'blue') color = warholColors.popBlue[500];
          else if (scheme === 'yellow') color = warholColors.popYellow[500];
          else if (scheme === 'green') color = warholColors.popGreen[500];
          else if (scheme === 'gray' || scheme === 'black') color = warholColors.black;

          return {
            borderColor: color,
            color: color,
            borderRadius: '0',
            textTransform: 'uppercase',
            _hover: { bg: color, color: warholColors.white },
          };
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: `'Bebas Neue', cursive`,
        textTransform: 'uppercase',
        color: 'gray.900',
      },
    },
    Card: {
        baseStyle: {
            bg: 'gray.100',
            borderWidth: '2px',
            borderColor: 'gray.900',
            borderRadius: '0',
            padding: 4,
            color: 'gray.900', // Ensure text in card is dark
        }
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({ // Added props
          th: {
            fontFamily: `'Bebas Neue', cursive`,
            textTransform: 'uppercase',
            color: 'gray.50',
            bg: 'gray.900',
            border: '2px solid', 
            borderColor: 'gray.900',
          },
          td: {
            border: '2px solid', 
            borderColor: 'gray.900',
            color: 'gray.900',
          },
        }),
      },
    },
    Modal: {
      baseStyle: (props: StyleFunctionProps) => ({ // Added props
        dialog: {
          bg: 'white',
          border: '4px solid', 
          borderColor: 'black',
          borderRadius: '0',
          color: 'black',
        },
        header: {
          fontFamily: `'Bebas Neue', cursive`,
          textTransform: 'uppercase',
          bg: 'yellow.500',
          color: 'black',
          padding: 4,
          borderBottom: '2px solid black', // Add border to header
        },
        body: {
          padding: 6,
          color: 'black',
        },
        footer: {
            borderTop: '2px solid black', // Add border to footer
            padding: 4,
        },
        closeButton: {
            color: 'black',
            border: '2px solid black',
            borderRadius: '0',
            top: 2, // Adjust position slightly
            right: 2,
            _hover: {
                bg: 'yellow.500'
            }
        }
      })
    },
  }
}); 