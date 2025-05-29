import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Theme Configuration
const config: ThemeConfig = {
  initialColorMode: 'dark', // CHANGED to dark, as this is a dark theme
  useSystemColorMode: false,   // We will manage themes explicitly
};

// Color Palette (extracted from mockups)
const colors = {
  brand: {
    primary: '#667eea', // Primary action, links
    primaryDarker: '#5a6acc', // For hover/active states if needed
    secondary: '#764ba2', // Secondary color in gradients
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
  },
  background: {
    app: '#1A1D29', // CHANGED: Was rgba(255, 255, 255, 0.95) - Using gray.850 directly
    content: '#171923', // CHANGED: Was '#fafbfc' - Using gray.900
    sidebar: '#1A1D29', // Sidebar gradient start (gray.850)
    sidebarEnd: '#2D3748', // Sidebar gradient end (gray.700)
    card: '#1A202C', // CHANGED: Was '#ffffff' - Using gray.800
    input: '#2D3748', // Default for inputs, changed to gray.700 to match variant
    inputFocusBorder: '#667eea',
    buttonSecondaryBg: '#2A2D3A', // Example: gray.750 for a dark secondary button
  },
  text: {
    default: '#EDF2F7', // CHANGED: Was '#1a202c' (dark text) - Using gray.100 (light text)
    light: '#ffffff',
    muted: '#A0AEC0', // CHANGED: Was '#64748b' (darkish muted) - Using gray.400 (lighter muted)
    onPrimary: '#ffffff',      // Text on primary button
    buttonSecondary: '#CBD5E0', // Example: gray.300 for text on dark secondary button
    link: '#667eea',
  },
  accent: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#dc2626',
    dangerLightBg: '#fee2e2',
    info: '#2563eb', // Example from a tag
  },
  border: {
    default: '#2D3748', // CHANGED: Was '#e2e8f0' - Using gray.700
    light: '#4A5568',    // CHANGED: Was '#f1f5f9' - Using gray.600
    divider: '#2A2D3A', // CHANGED: Was '#f8fafc' - Using gray.750
  },
  // Specific tag colors - can be expanded
  tag: {
    menaBg: '#f0fdf4',
    menaText: '#059669',
    urgentBg: '#fef2f2',
    urgentText: '#dc2626',
    enterpriseBg: '#faf5ff',
    enterpriseText: '#7c3aed',
    defaultBg: '#eff6ff',
    defaultText: '#2563eb',
  },
  gray: { // Added custom gray shades + standard ones for dark theme context
    50: '#F7FAFC',  // Very light gray, almost white
    100: '#EDF2F7', // Light gray
    200: '#E2E8F0', // Light gray
    300: '#CBD5E0', // Text color for sidebar (My Profile, Sign out)
    400: '#A0AEC0', // Dimmer text color for sidebar (email)
    500: '#718096', // Borders, placeholders
    600: '#4A5568', // Hover states, darker borders
    700: '#2D3748', // Input backgrounds, card backgrounds
    750: "#2A2D3A", // Existing custom
    800: '#1A202C', // Darker backgrounds
    850: "#1A1D29", // Existing custom - Sidebar bg gradient start
    900: '#171923', // Darkest background
  }
};

// Typography
const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`,
  body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`,
};

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

// Shadows
const shadows = {
  sm: '0 4px 12px rgba(0, 0, 0, 0.05)',          // Standard card shadow
  md: '0 8px 20px rgba(102, 126, 234, 0.4)', // Button hover
  lg: '0 25px 50px rgba(0, 0, 0, 0.15)',      // App container shadow
  outline: `0 0 0 3px rgba(102, 126, 234, 0.2)` // Focus ring for inputs etc.
};

// Border Radius
const radii = {
  sm: '8px',   // e.g. tags
  md: '12px',  // e.g. buttons, inputs, cards
  lg: '16px',  // e.g. pipeline columns
  xl: '24px',  // e.g. app container
  full: '9999px', // for pills, avatars
};

// Global Styles
const styles = {
  global: (props: any) => ({
    body: {
      fontFamily: 'body',
      color: colors.text.default, // Updated to use the new light default text
      bg: colors.gray[900], // CHANGED: Was linear-gradient - Matched to App.tsx modern root bg
      minHeight: '100vh',
      lineHeight: '1.5',
    },
    '*::placeholder': {
      color: colors.text.muted, // Updated to use the new lighter muted text
    },
    '*::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '*::-webkit-scrollbar-thumb': {
      background: colors.border.default, // Updated to use new darker border.default (gray.700)
      borderRadius: '8px',
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    // Style for the main app container with glassmorphism
    // This will be applied to a specific wrapper component, not body directly
    // For example, a div with className="app-container-modern"
    '.app-container-modern': {
        display: 'flex',
        minHeight: 'calc(100vh - 40px)', // Assuming 20px margin top/bottom
        background: colors.background.app, // Updated to use new dark background.app
        backdropFilter: 'blur(20px)', // Keep blur if desired with dark bg
        margin: '20px',
        borderRadius: 'xl',
        boxShadow: 'lg',
        overflow: 'hidden',
    },
    // Main content area within the app container
    '.main-content-modern': {
        flex: 1,
        background: 'background.content',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    }
  }),
};

// Component Overrides (Initial Pass - will be expanded)
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md', 
      transition: 'all 0.2s ease',
    },
    variants: {
      solid: (props: any) => { 
        if (props.colorScheme === 'brand') { 
          return {
            bgGradient: `linear(to-r, brand.gradientStart, brand.gradientEnd)`,
            color: 'text.onPrimary', // This is 'white' from the palette
            _hover: {
              transform: 'translateY(-2px)',
              boxShadow: 'md',
            }
          }
        }
        // For other solid buttons, including colorScheme='blue' in modern theme
        if (props.theme.name === 'Creative Dock Modern' && props.colorScheme === 'blue') {
          return {
            bg: 'blue.500', // Standard blue
            color: 'white', // Ensure white text
            _hover: {
              bg: 'blue.600' // Darken on hover
            }
          };
        }
        return {}; 
      },
      outline: (props: any) => { // For modern theme outline buttons
        if (props.theme.name === 'Creative Dock Modern') {
          return {
            borderColor: 'gray.500', // Visible border
            color: 'white', // White text
            _hover: {
              bg: 'gray.600',
              borderColor: 'gray.400'
            }
          };
        }
        return {}; // Fallback to default Chakra outline variant for other themes
      },
      secondary: { 
        bg: 'background.buttonSecondaryBg',
        color: 'text.buttonSecondary',
        _hover: {
          bg: '#e2e8f0', // Slightly darker than f1f5f9
        },
      },
      danger: { // For btn-danger
        bg: 'accent.dangerLightBg',
        color: 'accent.danger',
        _hover: {
          bg: '#fecaca',
        },
      },
    },
    defaultProps: {
        // size: 'md', // Default size from mockups seems around md
    }
  },
  Input: {
    defaultProps: {
        focusBorderColor: 'brand.primary' // Kept from previous, but focus style below will be more specific
    },
    sizes: {
        md: {
            field: {
                borderRadius: 'md'
            }
        }
    },
    variants: {
        outline: (props: any) => { // For modern theme input fields
            if (props.theme.name === 'Creative Dock Modern') {
                return {
                    field: {
                        bg: 'gray.700',
                        color: 'white',
                        borderColor: 'gray.500',
                        _placeholder: {
                            color: 'gray.400'
                        },
                        _hover: {
                            borderColor: 'gray.400' // Slightly lighter border on hover
                        },
                        _focus: {
                            borderColor: 'blue.400',
                            boxShadow: `0 0 0 1px ${props.theme.colors.blue[400] || '#3182ce'}`,
                            bg: 'gray.700' // Keep bg on focus
                        }
                    }
                };
            }
            // Fallback for other themes (original logic)
            return {
                field: {
                    borderColor: 'border.default',
                    borderRadius: 'md',
                    _hover: {
                        borderColor: 'brand.primary'
                    },
                    _focus: {
                        borderColor: 'brand.primary',
                        boxShadow: `0 0 0 1px ${(props.theme.colors.brand as any)?.primary || props.theme.colors.blue[500]}` 
                    }
                }
            }
        }
    }
  },
  Select: {
    defaultProps: {
        focusBorderColor: 'brand.primary'
    },
    sizes: {
        md: {
            field: {
                borderRadius: 'md'
            }
        }
    },
    variants: {
        outline: (props: any) => { // For modern theme select fields
            if (props.theme.name === 'Creative Dock Modern') {
                return {
                    field: {
                        bg: 'gray.700',
                        color: 'white',
                        borderColor: 'gray.500',
                        iconColor: 'gray.400', // For the dropdown arrow
                        _hover: {
                            borderColor: 'gray.400'
                        },
                        _focus: {
                            borderColor: 'blue.400',
                            boxShadow: `0 0 0 1px ${props.theme.colors.blue[400] || '#3182ce'}`,
                            bg: 'gray.700'
                        }
                    }
                };
            }
            // Fallback for other themes (original logic)
            return {
                field: {
                    borderColor: 'border.default',
                    borderRadius: 'md',
                    _hover: {
                        borderColor: 'brand.primary'
                    }
                }
            }
        }
    }
  },
  Textarea: {
    defaultProps: {
        focusBorderColor: 'brand.primary'
    },
    variants: {
        outline: (props: any) => { // For modern theme textarea fields
            if (props.theme.name === 'Creative Dock Modern') {
                return {
                    bg: 'gray.700',
                    color: 'white',
                    borderColor: 'gray.500',
                    _placeholder: {
                        color: 'gray.400'
                    },
                    _hover: {
                        borderColor: 'gray.400'
                    },
                    _focus: {
                        borderColor: 'blue.400',
                        boxShadow: `0 0 0 1px ${props.theme.colors.blue[400] || '#3182ce'}`,
                        bg: 'gray.700'
                    }
                };
            }
             // Fallback for other themes (original logic)
            return {
                borderColor: 'border.default',
                borderRadius: 'md',
                _hover: {
                    borderColor: 'brand.primary'
                }
            }
        }
    }
  },
  Card: { // A custom Card component or style override for Box
    baseStyle: {
      bg: 'background.card',
      borderRadius: 'lg', // 16px
      p: '24px',
      boxShadow: 'sm',
      borderWidth: '1px',
      borderColor: 'border.light',
    },
  },
  Modal: {
    baseStyle: {
        dialog: {
            borderRadius: 'lg', // Match card radius
            bg: 'background.card'
        }
    }
  }
  // ... other component styles (Heading, Text, etc.) can be added as needed
};

export const creativeDockModernTheme = extendTheme({
  name: 'Creative Dock Modern', // Add a name to the theme for easier identification in component styles
  config,
  colors,
  fonts,
  fontWeights,
  radii,
  shadows,
  styles,
  components,
}); 