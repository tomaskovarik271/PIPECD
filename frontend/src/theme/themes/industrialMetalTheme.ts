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
    body: `'Lato', 'Roboto Condensed', sans-serif`,
    mono: `'Courier New', monospace`,
    industrial: `'Bebas Neue', 'Cinzel Decorative', sans-serif`,
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
          color: 'accentHazard.400',
          fontFamily: `'Press Start 2P', cursive`,
          fontSize: 'xs',
          letterSpacing: '1px',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        },
        userInfoText: {
            color: 'neutral.200'
        }
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontSize: 'sm',
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
    IconButton: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        fontWeight: '600',
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
          return {};
        },
        outline: (props: StyleFunctionProps) => {
          return {
            borderColor: 'primary.500',
            color: 'primary.300',
            borderWidth: '2px',
            _hover: { 
              bg: 'primary.500', 
              color: 'white',
              borderColor: 'primary.500'
            },
            _active: { 
              bg: 'primary.600',
              borderColor: 'primary.600'
            },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          return {
            color: 'primary.300',
            _hover: { 
              bg: 'primary.600', 
              color: 'white' 
            },
            _active: { 
              bg: 'primary.700' 
            },
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
            fontFamily: `'Lato', sans-serif`,
            fontWeight: '700',
            color: 'neutral.50',
            letterSpacing: '0.5px',
        },
        variants: {
          industrial: {
            fontFamily: `'Bebas Neue', sans-serif`,
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'accentHazard.400',
          },
        },
    },
    Text: {
        baseStyle: {
            fontFamily: `'Lato', sans-serif`,
            color: 'neutral.200',
            lineHeight: '1.5',
        },
        variants: {
          numeric: {
            fontFamily: `'Courier New', monospace`,
            fontWeight: '600',
            color: 'accentHazard.300',
            letterSpacing: '0.5px',
          },
          industrial: {
            fontFamily: `'Bebas Neue', sans-serif`,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'neutral.100',
          },
        },
    },
    Modal: {
        baseStyle: (props: StyleFunctionProps) => ({ // Added props
            dialog: {
                bg: 'neutral.800',
                borderColor: 'neutral.700',
                color: 'neutral.100'
            },
            header: {
                fontFamily: `'Bebas Neue', sans-serif`,
                fontWeight: '700',
                fontSize: 'lg',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'accentHazard.400',
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
          table: {
            fontFamily: `'Lato', 'Roboto Condensed', sans-serif`,
          },
          th: {
            fontFamily: `'Bebas Neue', 'Cinzel Decorative', sans-serif`,
            fontSize: 'sm',
            fontWeight: '700',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: 'accentHazard.400',
            borderColor: 'neutral.600',
            bg: 'neutral.900',
            py: 4,
            px: 4,
            lineHeight: '1.2',
            borderBottomWidth: '2px',
            borderBottomColor: 'accentHazard.600',
            position: 'relative',
            _hover: {
              bg: 'neutral.800',
              color: 'accentHazard.300',
              cursor: 'pointer',
            },
            _after: {
              content: '""',
              position: 'absolute',
              bottom: '-2px',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,170,0,0.8) 50%, transparent 100%)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            },
            _hover_after: {
              opacity: 1,
            },
          },
          td: {
            fontFamily: `'Lato', sans-serif`,
            fontSize: 'sm',
            fontWeight: '400',
            letterSpacing: '0.3px',
            borderColor: 'neutral.700',
            color: 'neutral.100',
            py: 3,
            px: 4,
            lineHeight: '1.4',
            _hover: {
              color: 'neutral.50',
            },
          },
          tbody: {
            tr: {
              bg: 'neutral.850',
              transition: 'all 0.2s ease',
              borderBottomWidth: '1px',
              borderBottomColor: 'neutral.700',
              _hover: {
                bg: 'neutral.800',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                borderBottomColor: 'primary.500',
              },
            },
          },
        }),
        unstyled: (props: StyleFunctionProps) => ({ // Override for industrial
          table: {
            fontFamily: `'Lato', sans-serif`,
          },
          th: {
            fontFamily: `'Bebas Neue', sans-serif`,
            fontSize: 'sm',
            fontWeight: '700',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: 'accentHazard.400',
            borderColor: 'neutral.600',
            bg: 'neutral.900',
            py: 4,
            px: 4,
            borderBottomWidth: '2px',
            borderBottomColor: 'accentHazard.600',
            _hover: {
              bg: 'neutral.800',
              color: 'accentHazard.300',
            },
          },
          td: {
            fontFamily: `'Lato', sans-serif`,
            fontSize: 'sm',
            fontWeight: '400',
            letterSpacing: '0.3px',
            borderColor: 'neutral.700',
            color: 'neutral.100',
            py: 3,
            px: 4,
            _hover: {
              color: 'neutral.50',
            },
          },
          tbody: {
            tr: {
              bg: 'neutral.850',
              transition: 'all 0.2s ease',
              borderBottomWidth: '1px',
              borderBottomColor: 'neutral.700',
              _hover: {
                bg: 'neutral.800',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
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
                    fontFamily: `'Lato', sans-serif`,
                    fontSize: 'sm',
                    fontWeight: '400',
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
                    fontFamily: `'Lato', sans-serif`,
                    fontSize: 'sm',
                    fontWeight: '400',
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
    Stat: {
      baseStyle: {
        label: {
          fontFamily: `'Bebas Neue', sans-serif`,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontSize: 'sm',
          color: 'neutral.300',
          fontWeight: '600',
        },
        number: {
          fontFamily: `'Courier New', monospace`,
          fontWeight: '700',
          color: 'accentHazard.400',
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
      },
    },
    // Custom component for numeric table cells
    NumberCell: {
      baseStyle: {
        fontFamily: `'Courier New', monospace`,
        fontSize: 'sm',
        fontWeight: '600',
        color: 'accentHazard.300',
        letterSpacing: '0.5px',
        textAlign: 'right',
        tabularNums: true, // Use tabular numbers for better alignment
      },
    },
    // Custom component for currency values
    CurrencyCell: {
      baseStyle: {
        fontFamily: `'Courier New', monospace`,
        fontSize: 'sm',
        fontWeight: '700',
        color: 'accentHazard.400',
        letterSpacing: '0.5px',
        textAlign: 'right',
      },
    },
    // Custom component for table section headers
    TableSectionHeader: {
      baseStyle: {
        fontFamily: `'Bebas Neue', sans-serif`,
        fontSize: 'md',
        fontWeight: '700',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'accentHazard.500',
        py: 2,
        px: 3,
        bg: 'neutral.900',
        borderColor: 'accentHazard.600',
      },
    },
  }
}); 