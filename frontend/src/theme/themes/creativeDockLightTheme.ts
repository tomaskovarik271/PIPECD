import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { cdColors } from '../theme.colors'; // Import cdColors directly
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

// Creative Dock Specific Colors based on Visual Identity Guidelines
// const cdColors = { ... }; - REMOVED

// const config: ThemeConfig = { ... }; - REMOVED

export const creativeDockLightTheme = extendTheme({
  config: baseThemeConfig, // Use baseThemeConfig directly
  fonts: {
    heading: `'Roboto', sans-serif`,
    body: `'Roboto', sans-serif`,
  },
  colors: {
    brand: cdColors.brandYellow, // Now uses imported cdColors
    primary: cdColors.brandYellow,
    blue: cdColors.brandBlue,
    orange: cdColors.brandOrange,
    green: cdColors.brandGreen,
    yellow: cdColors.brandYellow,
    gray: {
      50: cdColors.white,
      100: cdColors.beige,
      200: '#EAEAEA',
      300: '#D1D1D1',
      400: '#B8B8B8',
      500: '#9F9F9F',
      600: '#7F7F7F',
      700: '#4A4A4A',
      900: cdColors.black,
    },
    error: cdColors.brandOrange,
    success: cdColors.brandGreen,
    info: cdColors.brandBlue,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'gray.50',
        color: 'gray.900',
      },
    }),
  },
  components: {
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'gray.100',
          borderColor: 'gray.200',
        },
        navLink: {
          color: 'gray.900',
          _hover: { bg: 'brand.100' },
        },
        activeNavLink: {
          bg: 'brand.500',
          color: cdColors.black,
          fontWeight: 'bold',
          _hover: { bg: 'brand.500' },
        },
        headerText: {
          color: 'brand.500',
        },
        userInfoText: {
          color: '#4A4A4A', // Directly using a darker gray if gray.800 is not in the scale
        }
      },
    },
    Button: {
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'brand' || props.colorScheme === 'primary' || props.colorScheme === 'yellow') {
            return {
              bg: 'brand.500',
              color: cdColors.black,
              _hover: { bg: 'brand.600' },
              _active: { bg: 'brand.700' },
            };
          }
          if (props.colorScheme === 'blue') {
            return {
              bg: 'blue.500',
              color: cdColors.white,
              _hover: { bg: 'blue.600' },
              _active: { bg: 'blue.700' },
            };
          }
          if (props.colorScheme === 'red' || props.colorScheme === 'orange') {
            return { bg: 'orange.500', color: cdColors.white, _hover: { bg: 'orange.600' } };
          }
          if (props.colorScheme === 'green') {
            return { bg: 'green.500', color: cdColors.white, _hover: { bg: 'green.600' } };
          }
          return {};
        },
        outline: (props: StyleFunctionProps) => {
          const schemeColor = props.colorScheme === 'blue' ? 'blue' :
            props.colorScheme === 'orange' ? 'orange' :
            props.colorScheme === 'green' ? 'green' : 'brand';
          return {
            borderColor: `${schemeColor}.500`,
            color: `${schemeColor}.500`,
            _hover: {
              bg: `${schemeColor}.50`,
            }
          };
        }
      }
    },
  }
}); 