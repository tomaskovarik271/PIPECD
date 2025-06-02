import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config';

// Light Modern Theme Configuration
const lightModernConfig: ThemeConfig = {
  ...baseThemeConfig,
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const creativeDockLightModernTheme = extendTheme({
  config: lightModernConfig,
  
  // Global styles for light modern theme
  styles: {
    global: {
      body: {
        bg: '#f8fafc', // Very light blue-gray background
        color: '#1a202c', // Dark text for readability
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      '*': {
        borderColor: '#e2e8f0 !important', // Light borders globally
      },
    },
  },
  
  // Component overrides for light modern theme
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        _focus: {
          boxShadow: '0 0 0 3px rgba(90, 103, 216, 0.1)',
        },
      },
      variants: {
        solid: {
          bg: '#5a67d8',
          color: 'white',
          _hover: {
            bg: '#4c51bf',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: '#4338ca',
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: '#e2e8f0',
          color: '#4a5568',
          _hover: {
            bg: '#f7fafc',
            borderColor: '#cbd5e0',
          },
        },
        ghost: {
          _hover: {
            bg: '#f7fafc',
          },
        },
      },
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderWidth: '1px',
          borderColor: '#e2e8f0',
          _hover: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        overlay: {
          bg: 'rgba(0, 0, 0, 0.4)',
        },
      },
    },
    
    Table: {
      variants: {
        simple: {
          th: {
            color: '#4a5568',
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: 'xs',
            letterSpacing: 'wider',
            borderColor: '#e2e8f0',
          },
          td: {
            borderColor: '#e2e8f0',
          },
          tbody: {
            tr: {
              _hover: {
                bg: '#f8fafc',
              },
            },
          },
        },
      },
    },
    
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: '#e2e8f0',
            _hover: {
              borderColor: '#cbd5e0',
            },
            _focus: {
              borderColor: '#5a67d8',
              boxShadow: '0 0 0 1px #5a67d8',
            },
          },
        },
      },
    },
    
    Progress: {
      baseStyle: {
        track: {
          bg: '#f1f5f9',
        },
        filledTrack: {
          bg: '#5a67d8',
        },
      },
    },
  },
  
  // Color overrides for light modern theme
  colors: {
    brand: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#5a67d8',
      600: '#4c51bf',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
});

export default creativeDockLightModernTheme; 