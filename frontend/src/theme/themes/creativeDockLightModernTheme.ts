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
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
  outline: '0 0 0 3px rgba(99, 102, 241, 0.12)',
  focus: '0 0 0 3px rgba(99, 102, 241, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(99, 102, 241, 0.15)',
};

export const creativeDockLightModernTheme = extendTheme({
  config: lightModernConfig,
  
  shadows,
  
  // Global styles for light modern theme
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #fcfcfd 0%, #f8fafc 100%)', // Subtle gradient background
        color: '#0f172a', // Very dark text for excellent readability
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        lineHeight: '1.6',
        letterSpacing: '-0.01em', // Slightly tighter letter spacing for polish
      },
      '*': {
        borderColor: '#e2e8f0 !important', // Consistent light borders
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth transitions globally
      },
      // Enhanced scrollbar styling
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(135deg, #cbd5e0 0%, #94a3b8 100%)',
        borderRadius: '6px',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        '&:hover': {
          background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
        },
      },
      '*::-webkit-scrollbar-track': {
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: '6px',
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
        position: 'relative',
        overflow: 'hidden',
        _focus: {
          boxShadow: 'focus',
          outline: 'none',
        },
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s ease',
        },
        _hover: {
          _before: {
            left: '100%',
          },
        },
      },
      variants: {
        solid: {
          bg: 'linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, #5b21b6 0%, #4338ca 100%)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            _disabled: {
              bg: 'linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)',
              transform: 'none',
              boxShadow: 'none',
            },
          },
          _active: {
            bg: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
            transform: 'translateY(0)',
          },
          _disabled: {
            bg: 'linear-gradient(135deg, #cbd5e0 0%, #9ca3af 100%)',
            color: '#6b7280',
            cursor: 'not-allowed',
          },
        },
        outline: {
          borderColor: '#d1d5db',
          borderWidth: '1px',
          color: '#374151',
          bg: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          _hover: {
            bg: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            borderColor: '#9ca3af',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            transform: 'translateY(0)',
          },
        },
        ghost: {
          color: '#6b7280',
          bg: 'transparent',
          _hover: {
            bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            color: '#374151',
          },
          _active: {
            bg: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
          },
        },
      },
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%)',
          borderRadius: 'xl',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: 'rgba(241, 245, 249, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
          },
          _hover: {
            boxShadow: 'lg',
            borderColor: 'rgba(226, 232, 240, 0.9)',
            transform: 'translateY(-3px)',
            _before: {
              background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%)',
            },
          },
        },
        header: {
          bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderTopRadius: 'xl',
          borderBottomWidth: '1px',
          borderColor: 'rgba(241, 245, 249, 0.8)',
          px: 6,
          py: 4,
          position: 'relative',
        },
        body: {
          px: 6,
          py: 5,
        },
        footer: {
          bg: 'linear-gradient(135deg, #fcfcfd 0%, #f8fafc 100%)',
          borderBottomRadius: 'xl',
          borderTopWidth: '1px',
          borderColor: 'rgba(241, 245, 249, 0.8)',
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
            bg: 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%)',
            borderColor: 'rgba(209, 213, 219, 0.8)',
            borderWidth: '1px',
            borderRadius: 'lg',
            color: '#0f172a',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            _placeholder: {
              color: '#9ca3af',
            },
            _hover: {
              borderColor: 'rgba(156, 163, 175, 0.9)',
              bg: 'linear-gradient(135deg, #fcfcfd 0%, #f8fafc 100%)',
            },
            _focus: {
              borderColor: '#6366f1',
              boxShadow: 'focus',
              outline: 'none',
              bg: '#ffffff',
              _hover: {
                borderColor: '#6366f1',
              },
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