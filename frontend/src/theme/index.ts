import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// 1. Define color mode config
const config: ThemeConfig = {
  initialColorMode: 'light', // Default to light
  useSystemColorMode: false, // We will manage this manually via Zustand + localStorage for now
};

// Define explicit color values to avoid circular dependency
const darkThemeBlue400 = '#4299E1'; // This is themes.dark.colors.blue[400]

// 2. Define the light theme (can be extended with specific overrides later)
const lightTheme = extendTheme({
  config,
  colors: {
    // Example: Keep Chakra defaults or specify our own
    // brand: {
    //   900: '#1a365d',
    //   800: '#153e75',
    //   700: '#2a69ac',
    // },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    }),
  },
  components: {
    Sidebar: { // Light theme for Sidebar
      baseStyle: {
        container: {
          bg: 'gray.50',
          borderColor: 'gray.200',
        },
        navLink: {
          color: 'gray.700',
          _hover: { bg: 'gray.100' },
        },
        activeNavLink: {
          bg: 'teal.100',
          color: 'teal.800',
          fontWeight: 'bold',
           _hover: { bg: 'teal.100' },
        },
        headerText: {
          // Default body color is fine
        },
        userInfoText: {
            color: 'gray.600' // For "Signed in as:"
        }
      },
    },
    // Light theme specific component styles can go here if needed
    // For now, let's assume default Chakra light styles are fine.
  }
});

// 3. Define the dark theme
const darkTheme = extendTheme({
  config: { ...config, initialColorMode: 'dark' },
  colors: {
    gray: {
      50: '#F7FAFC',  // Lightest for backgrounds if needed on dark elements
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0', // Primary text on dark backgrounds
      400: '#A0AEC0', // Secondary text
      500: '#718096', // Borders, subtle elements
      600: '#4A5568', // Hovered/active darker elements
      700: '#2D3748', // Component backgrounds (cards, modals, table rows)
      750: '#252B3B', // Custom shade for dark sidebar hover
      800: '#1A202C', // Slightly lighter than main bg, for elevation or sidebars
      850: '#14171F', // Custom shade for dark sidebar background
      900: '#171923', // Main body background
    },
    // Define dark theme-appropriate accent colors
    // Example: Blues might be lighter for readability on dark backgrounds
    blue: {
        50: '#EBF8FF', // Lightest blue for subtle backgrounds
        100: '#BEE3F8',
        200: '#90CDF4', // Good for text/icons
        300: '#63B3ED',
        400: darkThemeBlue400, // Use the predefined constant
        500: '#3182CE',
        600: '#2B6CB0', // Darker variant for hover/active on buttons
        700: '#2C5282',
        800: '#2A4365',
        900: '#1A365D', // Darkest for borders or very subtle elements
    },
    // Define other color scales (teal, green, red, orange, purple) for Tags
    // These should be chosen for good contrast on gray.700/gray.800 backgrounds
    teal: { // Example for active sidebar link
        50: '#E6FFFA',
        100: '#B2F5EA',
        200: '#81E6D9',
        300: '#4FD1C5',
        400: '#38B2AC',
        500: '#319795',
        600: '#2C7A7B', // Potentially for active sidebar bg
        700: '#285E61',
        800: '#234E52',
        900: '#1D4044',
    },
    // Add other colors for tags (purple, green, orange, red) ensuring good contrast
    // for their use as Tag colorSchemes. For instance, the 500 or 600 variant for text,
    // and a much darker variant (800/900) or lighter (100/200) for background for dark mode tags.
    // Chakra usually uses a light text on a dark bg for dark mode tags.
    // Example: purple.200 text on purple.800 bg.
    purple: { 200: '#D6BCFA', 800: '#553C9A' },
    green: { 200: '#9AE6B4', 800: '#2F855A' },
    orange: { 200: '#FBD38D', 800: '#C05621' }, 
    red: { 200: '#FEB2B2', 800: '#9B2C2C' },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: 'gray.900', 
        color: 'gray.300',
      },
      '*::placeholder': {
        color: 'gray.500',
      },
    }),
  },
  components: {
    Sidebar: { // Dark theme for Sidebar
      baseStyle: {
        container: {
          bg: 'gray.850', // A custom dark shade, slightly off from body
          borderColor: 'gray.700',
        },
        navLink: {
          color: 'gray.200',
          _hover: { bg: 'gray.750' }, // Custom hover shade
        },
        activeNavLink: {
          bg: 'teal.600', // Using a darker teal from our defined scale
          color: 'white',
          fontWeight: 'bold',
          _hover: { bg: 'teal.600' },
        },
        headerText: {
           color: 'whiteAlpha.900' // Ensure PipeCD header is bright
        },
        userInfoText: {
            color: 'gray.400' // For "Signed in as:" in dark mode
        }
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: 'gray.600',
            color: 'gray.400', // Header text
          },
          td: {
            borderColor: 'gray.600',
            // Text color will inherit from body or can be set explicitly
          },
          tbody: {
            tr: {
              bg: 'gray.800', // Row background
              _hover: {
                bg: 'gray.700', // Hovered row background
              },
            },
          },
        },
      },
    },
    Modal: {
        baseStyle: {
            dialog: {
                bg: 'gray.800', // Match table rows or slightly different dark shade
            },
            header: {
                borderColor: 'gray.700', // Add border if design needs it
            },
            footer: {
                 borderColor: 'gray.700', // Add border if design needs it
            }
        }
    },
    Button: {
        variants: {
            ghost: {
                // Ensure ghost buttons are visible on dark backgrounds
                _hover: { bg: 'whiteAlpha.200' },
                _active: { bg: 'whiteAlpha.300' },
            },
            solid: (props: any) => {
                if (props.colorScheme === 'blue') {
                    return {
                        bg: 'blue.400', // Use our dark-theme blue
                        _hover: { bg: 'blue.500' },
                        _active: { bg: 'blue.600' },
                    };
                }
                return {};
            },
        }
    },
    Input: {
        variants: {
            outline: {
                field: {
                    borderColor: 'gray.600',
                    _hover: { borderColor: 'gray.500' },
                    _focus: {
                        borderColor: 'blue.400', // This will use the darkTheme blue.400
                        boxShadow: `0 0 0 1px ${darkThemeBlue400}` // Use the constant
                    }
                }
            }
        }
    },
    Select: { // Similar to Input
        variants: {
            outline: {
                field: {
                    borderColor: 'gray.600',
                    _hover: { borderColor: 'gray.500' },
                     _focus: {
                        borderColor: 'blue.400',
                        boxShadow: `0 0 0 1px ${darkThemeBlue400}` // Use the constant
                    }
                }
            }
        }
    },
    Checkbox: {
        baseStyle: {
            control: {
                borderColor: 'gray.500', // Checkbox border
                _checked: {
                    bg: 'blue.400',
                    borderColor: 'blue.400',
                    _hover: {
                         bg: 'blue.500',
                         borderColor: 'blue.500',
                    }
                }
            }
        }
    },
    // Sidebar specific overrides (if not handled by direct props)
    // Could define a custom component style for "Sidebar" or "Nav"
  }
});

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Export one theme initially for ChakraProvider, will be dynamic later
export default lightTheme; 