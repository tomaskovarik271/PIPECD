import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

const bowieColors = {
  primary: { // Electric Blue
    50: '#E0F3FF',
    100: '#B3E0FF',
    200: '#80CFFF',
    300: '#4DBEFF',
    400: '#1AADFF',
    500: '#007CF0', // Main Electric Blue
    600: '#0063DB',
    700: '#004EBC',
    800: '#003B9C',
    900: '#002C7A',
  },
  accentOrange: { // Fiery Orange/Red
    50: '#FFF0E6',
    100: '#FFD1B3',
    200: '#FFB380',
    300: '#FF944D',
    400: '#FF751A',
    500: '#FF4500', // Main OrangeRed
    600: '#E63E00',
    700: '#CC3600',
    800: '#B32F00',
    900: '#992800',
  },
  accentGold: { // Glam Gold
    50: '#FFF9E6',
    100: '#FFF0B3',
    200: '#FFE680',
    300: '#FFDC4D',
    400: '#FFD11A',
    500: '#FFD700', 
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39800',
    900: '#998300',
  },
  neutral: { // Dark Grays/Black & Off-Whites
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#C2C2C2',
    700: '#3C3C3C',
    800: '#2C2C2C',
    850: '#1F1F1F',
    900: '#121212',
  },
  red: { 
    500: '#F04A4A',
    600: '#D93B3B'
  },
};

export const bowieTheme = extendTheme({
  config: { ...baseThemeConfig, initialColorMode: 'dark' } as ThemeConfig,
  fonts: {
    heading: `'Bungee', cursive`,
    body: `'Roboto Condensed', sans-serif`,
  },
  colors: {
    ...bowieColors,
    gray: bowieColors.neutral,
    blue: bowieColors.primary,
    orange: bowieColors.accentOrange,
    yellow: bowieColors.accentGold,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'neutral.900',
        color: 'neutral.100',
      },
      '*::placeholder': {
        color: 'neutral.200',
      },
    }),
  },
  components: {
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'neutral.850',
          borderColor: 'neutral.700',
        },
        navLink: {
          color: 'neutral.100',
          _hover: { bg: 'primary.600', color: 'white' },
        },
        activeNavLink: {
          bg: 'primary.500',
          color: 'white',
          fontWeight: 'bold',
          _hover: { bg: 'primary.500' },
        },
        headerText: {
          color: 'accentGold.500',
          fontFamily: `'Bungee', cursive`,
        },
        userInfoText: {
            color: 'neutral.200' 
        }
      },
    },
    Button: {
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'blue' || props.colorScheme === 'primary') {
            return {
              bg: 'primary.500',
              color: 'white',
              _hover: { bg: 'primary.600' },
              _active: { bg: 'primary.700' },
            };
          }
          if (props.colorScheme === 'orange' || props.colorScheme === 'accentOrange') {
             return {
              bg: 'accentOrange.500',
              color: 'white',
              _hover: { bg: 'accentOrange.600' },
              _active: { bg: 'accentOrange.700' },
            };
          }
           if (props.colorScheme === 'red') { // Ensure red buttons are styled
            return {
              bg: 'red.500',
              color: 'white',
              _hover: { bg: 'red.600' },
            };
          }
          return {};
        },
        outline: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'accentGold' || props.colorScheme === 'yellow') {
            return {
              borderColor: 'accentGold.500',
              color: 'accentGold.500',
              _hover: { bg: 'accentGold.500', color: 'neutral.900' },
              _active: { 
                bg: 'accentGold.500',
                color: 'neutral.900',
              }
            };
          }
          return {
            borderColor: 'primary.500', 
            color: 'primary.400',
            _hover: {
              bg: 'primary.500',
              color: 'white',
            },
            _active: { 
              bg: 'primary.500',
              color: 'white',
              borderColor: 'primary.500',
            }
          };
        },
        ghost: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'red') {
            return {
              color: 'red.500',
              _hover: { bg: 'red.500', color: 'white' },
            };
          }
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') {
            return {
              color: 'primary.400',
              _hover: { bg: 'primary.500', color: 'white' },
            };
          }
          return {
            color: 'neutral.100',
            _hover: { bg: 'neutral.700' },
          };
        },
      },
    },
    Card: {
        baseStyle: {
            bg: 'neutral.800',
            borderColor: 'neutral.700',
            color: 'neutral.100'
        }
    },
    Heading: {
        baseStyle: {
            fontFamily: `'Bungee', cursive`,
        },
    },
    Text: {
        baseStyle: {
            fontFamily: `'Roboto Condensed', sans-serif`,
        }
    },
    Modal: {
        baseStyle: (props: StyleFunctionProps) => ({ // Added props for consistency
            dialog: {
                bg: 'neutral.800', 
                borderColor: 'neutral.700',
                color: 'neutral.100' // Ensure text in dialog is light
            },
            header: {
                fontFamily: `'Bungee', cursive`,
                color: 'primary.400',
                borderColor: 'neutral.700',
            },
            body: {
                 color: 'neutral.100', // ensure body text is light
            },
            footer: {
                 borderColor: 'neutral.700',
            },
            closeButton: {
                 color: 'neutral.300',
                _hover: {bg: 'neutral.700'}
            }
        })
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({ // Added props for consistency
          th: {
            borderColor: 'neutral.700',
            color: 'accentGold.500',
            fontFamily: `'Roboto Condensed', sans-serif`, 
            bg: 'neutral.850', // Darker header for Bowie table
          },
          td: {
            borderColor: 'neutral.700',
            color: 'neutral.100',
          },
          tbody: {
            tr: {
              bg: 'neutral.800',
              _hover: {
                bg: 'neutral.700',
              },
            },
          },
        }),
      },
    }
  }
}); 