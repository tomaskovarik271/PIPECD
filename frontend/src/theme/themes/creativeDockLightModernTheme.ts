import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config';

// Light Modern Theme Configuration
const lightModernConfig: ThemeConfig = {
  ...baseThemeConfig,
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Enhanced shadows for better depth and visual hierarchy
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  focus: '0 0 0 3px rgba(99, 102, 241, 0.2)',
};

export const creativeDockLightModernTheme = extendTheme({
  config: lightModernConfig,
  
  shadows,
  
  // Global styles for light modern theme
  styles: {
    global: {
      body: {
        bg: '#fcfcfd', // Ultra-light background with subtle warmth
        color: '#0f172a', // Very dark text for excellent readability
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        lineHeight: '1.6',
      },
      '*': {
        borderColor: '#e2e8f0 !important', // Consistent light borders
      },
      // Enhanced scrollbar styling
      '*::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: '#cbd5e0',
        borderRadius: '3px',
        '&:hover': {
          background: '#94a3b8',
        },
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
    },
  },
  
  // Component overrides for light modern theme
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        _focus: {
          boxShadow: 'focus',
          outline: 'none',
        },
      },
      variants: {
        solid: {
          bg: '#6366f1',
          color: 'white',
          _hover: {
            bg: '#5b21b6',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
            _disabled: {
              bg: '#6366f1',
              transform: 'none',
              boxShadow: 'none',
            },
          },
          _active: {
            bg: '#4338ca',
            transform: 'translateY(0)',
          },
          _disabled: {
            bg: '#cbd5e0',
            color: '#9ca3af',
            cursor: 'not-allowed',
          },
        },
        outline: {
          borderColor: '#d1d5db',
          borderWidth: '1px',
          color: '#374151',
          bg: 'white',
          _hover: {
            bg: '#f9fafb',
            borderColor: '#9ca3af',
            transform: 'translateY(-1px)',
            boxShadow: 'sm',
          },
          _active: {
            bg: '#f3f4f6',
            transform: 'translateY(0)',
          },
        },
        ghost: {
          color: '#6b7280',
          _hover: {
            bg: '#f1f5f9',
            color: '#374151',
          },
          _active: {
            bg: '#e2e8f0',
          },
        },
      },
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: '#f1f5f9',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          _hover: {
            boxShadow: 'md',
            borderColor: '#e2e8f0',
            transform: 'translateY(-2px)',
          },
        },
        header: {
          bg: '#f8fafc',
          borderTopRadius: 'xl',
          borderBottomWidth: '1px',
          borderColor: '#f1f5f9',
          px: 6,
          py: 4,
        },
        body: {
          px: 6,
          py: 5,
        },
        footer: {
          bg: '#fcfcfd',
          borderBottomRadius: 'xl',
          borderTopWidth: '1px',
          borderColor: '#f1f5f9',
          px: 6,
          py: 4,
        },
      },
    },
    
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'white',
          boxShadow: '2xl',
          borderRadius: 'xl',
          borderWidth: '1px',
          borderColor: '#f1f5f9',
        },
        overlay: {
          bg: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
        },
        header: {
          bg: '#f8fafc',
          borderTopRadius: 'xl',
          borderBottomWidth: '1px',
          borderColor: '#f1f5f9',
          fontSize: 'lg',
          fontWeight: '600',
          color: '#0f172a',
        },
        closeButton: {
          color: '#6b7280',
          _hover: {
            color: '#374151',
            bg: '#f1f5f9',
          },
        },
      },
    },
    
    Table: {
      variants: {
        simple: {
          th: {
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: 'xs',
            letterSpacing: '0.05em',
            borderColor: '#e2e8f0',
            bg: '#f8fafc',
            px: 6,
            py: 3,
          },
          td: {
            borderColor: '#e2e8f0',
            px: 6,
            py: 4,
            color: '#374151',
          },
          tbody: {
            tr: {
              bg: 'white',
              _hover: {
                bg: '#fcfcfd',
              },
              _odd: {
                bg: '#fcfcfd',
                _hover: {
                  bg: '#f8fafc',
                },
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
            borderColor: '#d1d5db',
            borderWidth: '1px',
            borderRadius: 'lg',
            color: '#0f172a',
            _placeholder: {
              color: '#9ca3af',
            },
            _hover: {
              borderColor: '#9ca3af',
            },
            _focus: {
              borderColor: '#6366f1',
              boxShadow: 'focus',
              outline: 'none',
            },
            _invalid: {
              borderColor: '#dc2626',
              boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
            },
          },
        },
      },
    },
    
    Progress: {
      baseStyle: {
        track: {
          bg: '#f1f5f9',
          borderRadius: 'full',
        },
        filledTrack: {
          bg: '#6366f1',
          borderRadius: 'full',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  
  // Enhanced color overrides for light modern theme
  colors: {
    brand: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#5b21b6',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    
    gray: {
      25: '#fcfcfd',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
});

export default creativeDockLightModernTheme; 