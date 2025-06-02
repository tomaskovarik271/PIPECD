import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

const industrialColors = {
  primary: { // Dark Steel Grey
    50: '#EAEAEA',
    100: '#C5C5C5',
    200: '#A0A0A0',
    300: '#7B7B7B',
    400: '#5F5F5F',
    500: '#4A4A4A', // Main Steel
    600: '#3E3E3E',
    700: '#323232',
    800: '#262626',
    900: '#1A1A1A',
  },
  neutral: { // Concrete & Ash
    50: '#E0E0E0',
    100: '#CCCCCC',
    200: '#A9A9A9',
    300: '#8C8C8C',
    400: '#6F6F6F',
    500: '#545454',
    600: '#404040',
    700: '#3A3A3A',
    800: '#303030',
    850: '#262626',
    900: '#1C1C1C',
  },
  accentRust: { // Rusted Orange/Brown
    50: '#F3EAE4',
    100: '#E2CABB',
    200: '#D1AA91',
    300: '#BF8968',
    400: '#AD6F45',
    500: '#7D4A23', // Main Rust
    600: '#6F4220',
    700: '#603A1C',
    800: '#523118',
    900: '#432814',
  },
  accentHazard: { // Hazard Yellow/Orange
    50: '#FFF9E6',
    100: '#FFEDB3',
    200: '#FFE080',
    300: '#FFD44D',
    400: '#FFC71A',
    500: '#FFAA00', // Main Hazard Yellow/Orange
    600: '#E69900',
    700: '#CC8800',
    800: '#B37700',
    900: '#996600',
  },
  semanticRed: { // For errors/delete
    50: '#FBE6E9',
    100: '#F3B9C2',
    200: '#EB8C9B',
    300: '#E25F73',
    400: '#DA324C',
    500: '#B00020', // Main Error Red
    600: '#9D001C',
    700: '#8A0019',
    800: '#770015',
    900: '#640011',
  },
};

export const industrialMetalTheme = extendTheme({
  config: { ...baseThemeConfig, initialColorMode: 'dark' } as ThemeConfig,
  fonts: {
    heading: `'Press Start 2P', cursive`,
    body: `'Roboto Condensed', sans-serif`,
  },
  colors: {
    ...industrialColors,
    gray: industrialColors.neutral,
    blue: industrialColors.primary, 
    red: industrialColors.semanticRed,
    orange: industrialColors.accentHazard, 
    yellow: industrialColors.accentHazard, 
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'neutral.900', 
        color: 'neutral.100', 
      },
      '*::placeholder': {
        color: 'neutral.300',
      },
    }),
  },
  components: {
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'neutral.900', 
          borderColor: 'neutral.800', 
        },
        navLink: {
          color: 'neutral.100',
          _hover: { bg: 'primary.700' },
        },
        activeNavLink: {
          bg: 'primary.600', 
          color: 'white',
          fontWeight: 'normal',
          borderLeft: '3px solid',
          borderColor: 'primary.400', 
           _hover: { bg: 'primary.600' },
        },
        headerText: {
          color: 'neutral.100',
          fontFamily: `'Press Start 2P', cursive`,
        },
        userInfoText: {
            color: 'neutral.200'
        }
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Roboto Condensed', sans-serif`,
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') {
            return {
              bg: 'primary.500',
              color: 'white',
              _hover: { bg: 'primary.600' },
              _active: { bg: 'primary.700' },
            };
          }
          if (props.colorScheme === 'orange' || props.colorScheme === 'accentHazard' || props.colorScheme === 'yellow') {
            return {
              bg: 'accentHazard.500',
              color: 'neutral.900', 
              _hover: { bg: 'accentHazard.600' },
              _active: { bg: 'accentHazard.700' },
            };
          }
          if (props.colorScheme === 'red' || props.colorScheme === 'semanticRed') {
            return {
                bg: 'semanticRed.500',
                color: 'white',
                _hover: { bg: 'semanticRed.600'}
            }
          }
          return {};
        },
        outline: (props: StyleFunctionProps) => {
           if (props.colorScheme === 'accentHazard' || props.colorScheme === 'yellow') {
            return {
              borderColor: 'accentHazard.500',
              color: 'accentHazard.500',
              _hover: { bg: 'accentHazard.500', color: 'neutral.900' },
            };
          }
          return { 
            borderColor: 'primary.500',
            color: 'primary.300',
            _hover: { bg: 'primary.500', color: 'white' },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'red' || props.colorScheme === 'semanticRed') {
            return {
              color: 'semanticRed.400',
              _hover: { bg: 'semanticRed.500', color: 'white' },
            };
          }
          return { 
            color: 'primary.300',
            _hover: { bg: 'primary.600', color: 'white' },
          };
        },
      },
    },
    Card: { 
        baseStyle: {
            bg: 'neutral.800',
            borderColor: 'neutral.700',
            color: 'neutral.100', // Ensure card text is light
        }
    },
    Heading: {
        baseStyle: {
            fontFamily: `'Roboto Condensed', sans-serif`,
            fontWeight: '700',
            color: 'neutral.50',
        },
    },
    Text: {
        baseStyle: {
            fontFamily: `'Roboto Condensed', sans-serif`,
            color: 'neutral.200',
        }
    },
    Modal: {
        baseStyle: (props: StyleFunctionProps) => ({ // Added props
            dialog: {
                bg: 'neutral.800',
                borderColor: 'neutral.700',
                color: 'neutral.100'
            },
            header: {
                fontFamily: `'Roboto Condensed', sans-serif`,
                fontWeight: '700',
                color: 'neutral.100',
                borderColor: 'neutral.700',
            },
            body: {
                color: 'neutral.100',
            },
            footer: {
                borderColor: 'neutral.700',
            },
            closeButton:{
                color: 'neutral.300',
                _hover: {bg: 'neutral.700'}
            }
        })
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({ // Added props
          th: {
            fontFamily: `'Roboto Condensed', sans-serif`,
            color: 'neutral.200',
            borderColor: 'neutral.800',
            bg: 'neutral.850', // Darker header
          },
          td: {
            borderColor: 'neutral.700',
            color: 'neutral.100',
          },
          tbody: {
            tr: {
              bg: 'neutral.850',
              _hover: {
                bg: 'neutral.800',
              },
            },
          },
        }),
      },
    },
    Input: {
        variants: {
            outline: (props: StyleFunctionProps) => ({ // Added props
                field: {
                    bg: 'neutral.850',
                    borderColor: 'neutral.600',
                    color: 'neutral.100',
                    _hover: { borderColor: 'neutral.500' },
                    _focus: {
                        borderColor: 'primary.400',
                        boxShadow: `0 0 0 1px ${industrialColors.primary[400]}`,
                        bg: 'neutral.850', // Keep background same on focus
                    },
                     _placeholder: { color: 'neutral.400' },
                }
            })
        }
    },
    Select: {
        variants: {
            outline: (props: StyleFunctionProps) => ({ // Added props
                field: {
                    bg: 'neutral.850',
                    borderColor: 'neutral.600',
                    color: 'neutral.100',
                    _hover: { borderColor: 'neutral.500' },
                     _focus: {
                        borderColor: 'primary.400',
                        boxShadow: `0 0 0 1px ${industrialColors.primary[400]}`,
                        bg: 'neutral.850',
                    },
                },
                icon: {
                    color: 'neutral.400' // Ensure icon is visible
                }
            })
        }
    },
  }
}); 