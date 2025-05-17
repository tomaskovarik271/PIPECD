import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { cdColors } from '../theme.colors'; // Import cdColors directly
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

export const creativeDockDarkTheme = extendTheme({
  config: { ...baseThemeConfig, initialColorMode: 'dark' } as ThemeConfig, // Use baseThemeConfig
  fonts: {
    heading: `'Roboto', sans-serif`,
    body: `'Roboto', sans-serif`,
  },
  colors: {
    brand: cdColors.brandYellow,
    primary: cdColors.brandYellow,
    blue: cdColors.brandBlue,
    orange: cdColors.brandOrange,
    green: cdColors.brandGreen,
    yellow: cdColors.brandYellow,

    gray: {
      50: cdColors.white, // For contrast elements on dark bg
      100: '#F0F0F0', // Lightest gray for dark theme (e.g., disabled text on dark)
      200: '#D6D6D6', // Lighter borders or dividers
      300: '#BCBCBC', // Light UI elements
      400: '#A1A1A1', // Secondary text
      500: '#878787', // Default interactive elements or borders
      600: '#6D6D6D', // Hover states for light elements, or subtle text
      700: '#3A3A3A', // Card backgrounds, input fields
      750: '#2F2F2F', // Slightly darker card hover
      800: '#242424', // Main component backgrounds (e.g. Modals, Popovers)
      850: '#1F1F1F', // Sidebar background
      900: cdColors.black, // Overall page background
    },
    error: cdColors.brandOrange,
    success: cdColors.brandGreen,
    info: cdColors.brandBlue,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'gray.900', 
        color: 'gray.50',
      },
      '*::placeholder': {
        color: 'gray.500',
      },
    }),
  },
  components: {
    Sidebar: { 
      baseStyle: {
        container: {
          bg: 'gray.850',
          borderColor: 'gray.700',
        },
        navLink: {
          color: 'gray.100',
          _hover: { bg: 'brand.700', color: cdColors.black },
        },
        activeNavLink: {
          bg: 'brand.500',
          color: cdColors.black,
          fontWeight: 'bold',
          _hover: { bg: 'brand.500' },
        },
        headerText: {
           color: 'brand.500'
        },
        userInfoText: {
            color: 'gray.200'
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
                        _hover: { bg: 'brand.400' }, // Lighter yellow for hover on dark
                        _active: { bg: 'brand.300' },
                    };
                }
                 if (props.colorScheme === 'blue') {
                     return {
                        bg: 'blue.500',
                        color: cdColors.white,
                        _hover: { bg: 'blue.400' },
                        _active: { bg: 'blue.300' },
                    };
                }
                if (props.colorScheme === 'red' || props.colorScheme === 'orange') {
                    return { bg: 'orange.500', color: cdColors.white, _hover: {bg: 'orange.400'} };
                }
                if (props.colorScheme === 'green') {
                    return { bg: 'green.500', color: cdColors.white, _hover: {bg: 'green.400'} };
                }
                return {};
            },
            outline: (props: StyleFunctionProps) => {
                // In dark theme, outlines should be lighter to be visible
                const schemeColor = props.colorScheme === 'blue' ? 'blue' :
                                    props.colorScheme === 'orange' ? 'orange' :
                                    props.colorScheme === 'green' ? 'green' : 'brand';
                const colorValue = schemeColor === 'brand' ? cdColors.brandYellow[300] : 
                                   schemeColor === 'blue' ? cdColors.brandBlue[300] :
                                   schemeColor === 'orange' ? cdColors.brandOrange[300] :
                                   cdColors.brandGreen[300];
                const hoverBg = schemeColor === 'brand' ? 'brand.700' : // Darker yellow bg for hover
                                schemeColor === 'blue' ? 'blue.700' :
                                schemeColor === 'orange' ? 'orange.700' :
                                'green.700';
                 const hoverColor = schemeColor === 'brand' ? cdColors.black : cdColors.white;


                return {
                    borderColor: colorValue,
                    color: colorValue,
                    _hover: {
                        bg: hoverBg, // Use a dark version of the color for background on hover
                        color: hoverColor, // Text color might need to change for contrast
                    }
                };
            }
        }
    },
    Input: { 
        variants: {
            outline: (props: StyleFunctionProps) => ({ // Added props
                field: {
                    borderColor: 'gray.700',
                    bg: 'gray.800', // Darker input background
                    color: 'gray.50', // Light text color
                    _hover: { 
                        borderColor: 'gray.600' 
                    },
                    _focus: {
                        borderColor: 'brand.500', // Yellow border on focus
                        boxShadow: `0 0 0 1px ${cdColors.brandYellow[500]}`,
                        bg: 'gray.800', // Keep bg same on focus
                    },
                     _placeholder: { // Explicitly define placeholder color for dark theme inputs
                        color: 'gray.500',
                    },
                }
            })
        }
    },
    Select: { // Ensuring Select matches Input style for dark theme
        variants: {
            outline: (props: StyleFunctionProps) => ({ // Added props
                field: {
                    borderColor: 'gray.700',
                    bg: 'gray.800',
                    color: 'gray.50',
                     _hover: { 
                        borderColor: 'gray.600' 
                    },
                    _focus: {
                        borderColor: 'brand.500',
                        boxShadow: `0 0 0 1px ${cdColors.brandYellow[500]}`,
                         bg: 'gray.800',
                    },
                },
                 icon: {
                    color: 'gray.400' // Make dropdown icon visible
                }
            })
        }
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({ // Added props
          th: {
            borderColor: 'gray.700',
            color: 'gray.100', // Lighter headers for dark theme
            bg: 'gray.800' // Header background
          },
          td: {
            borderColor: 'gray.700',
            color: 'gray.50', // Light text in cells
          },
          tbody: {
            tr: {
              bg: 'gray.850', // Slightly different from page bg for definition
              _hover: {
                bg: 'gray.750', // Hover for table rows
              },
            },
          },
        }),
      },
    },
    Modal: {
        baseStyle: (props: StyleFunctionProps) => ({ // Added props
            dialog: {
                bg: 'gray.800', // Dark modal dialog
                color: 'gray.50'
            },
            header: {
                borderColor: 'gray.700',
                 color: 'gray.50',
                 bg: 'gray.800', // Match dialog
            },
            body: {
                color: 'gray.100', // ensure body text is light
            },
            footer: {
                 borderColor: 'gray.700',
                 bg: 'gray.800', // Match dialog
            },
            closeButton: {
                color: 'gray.300',
                _hover: {
                    bg: 'gray.700'
                }
            }
        })
    },
    Card: { // Assuming a Card component might exist or be added
        baseStyle: (props: StyleFunctionProps) => ({ // Added props
            container: {
                bg: 'gray.800', // Card background for dark theme
                borderColor: 'gray.700',
                color: 'gray.50', // Default text color for content within card
            }
        }),
         variants: {
            outline: (props: StyleFunctionProps) => ({ // Added props
                container: {
                     borderColor: 'gray.700',
                }
            }),
            filled: (props: StyleFunctionProps) => ({ // Added props
                 container: {
                    bg: 'gray.750'
                }
            })
        }
    },
  }
}); 