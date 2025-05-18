import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from '../theme.config'; // Import baseThemeConfig

const daliDarkColorsPalette = { // Renamed to avoid direct self-reference issue initially
  primary: { // Deep Indigo/Prussian Blue
    50: '#E6E9ED',
    100: '#BCC6D5',
    200: '#93A3BD',
    300: '#697FA4',
    400: '#405B8C',
    500: '#0A2342', // Main Dark Prussian Blue
    600: '#09203B',
    700: '#081C33',
    800: '#06182C',
    900: '#051424',
  },
  accent1: { // Ochre/Muted Gold
    50: '#F9F3ED',
    100: '#EEDDCF',
    200: '#E2C7B1',
    300: '#D7B193',
    400: '#CCA075',
    500: '#C08A53', // Main Muted Gold/Ochre
    600: '#AD764A',
    700: '#9A6841',
    800: '#875A38',
    900: '#744C2F',
  },
  accent2: { // Burnt Sienna/Muted Red
    50: '#F5EDED',
    100: '#E5D0D0',
    200: '#D6B3B3',
    300: '#C69595',
    400: '#B57878',
    500: '#A45D5D', // Main Muted Burnt Sienna
    600: '#8E5151',
    700: '#7F4848',
    800: '#6F3F3F',
    900: '#5F3636',
  },
  surrealAccent: { // Cadmium Yellow highlight (like melting clocks)
    500: '#FFD700',
  },
  mutedTeal: {
    50: '#EAF2F0',
    100: '#CADBCD',
    200: '#AAC5AB',
    300: '#8BAE8A',
    400: '#6D9869',
    500: '#4A7C59', // Main Muted Teal
    600: '#416F50',
    700: '#386247',
    800: '#2F553E',
    900: '#264835',
  },
  neutral: { // Charcoals, Off-Blacks, Desaturated Beige
    50: '#D1C7B7',  // Desaturated Beige (for text on darkest bg)
    100: '#A39E93',
    200: '#7A756F',
    300: '#59544E',
    400: '#403C37',
    500: '#2C2824',
    600: '#211E1A',  // Dark Charcoal
    700: '#1A1714',  // Darker Charcoal (cards/components)
    800: '#12100E',  // Very Dark (sidebar/modal backgrounds)
    900: '#0C0B0A',  // Off-Black (main body background)
  },
  // Define semantic colors directly or using fully defined parts of the palette
  semanticRed: { 500: '#C53030' }, 
  semanticGreen: { 500: '#4A7C59' }, // Direct value from mutedTeal
};

// Now define the final daliDarkColors with aliases
const daliDarkColors = {
    ...daliDarkColorsPalette,
    success: { 500: daliDarkColorsPalette.mutedTeal[500] },
    warning: { 500: '#DD6B20' }, // Placeholder, can be mapped to accent1 or similar later
    error: { 500: daliDarkColorsPalette.semanticRed[500] },
    info: { 500: daliDarkColorsPalette.primary[500] },
};

export const daliDarkTheme = extendTheme({
  config: { ...baseThemeConfig, initialColorMode: 'dark' } as ThemeConfig,
  fonts: {
    heading: `'Cinzel Decorative', serif`,
    body: `'Lato', sans-serif`,
  },
  colors: {
    ...daliDarkColors,
    gray: daliDarkColors.neutral, // Map Chakra's gray to our neutral palette
    // Map other Chakra colors if needed, or use specific Dali colors directly
    blue: daliDarkColors.primary,
    red: daliDarkColors.semanticRed,
    green: daliDarkColors.semanticGreen, // Will use the new mutedTeal
    orange: daliDarkColors.accent2, // Example mapping: orange to Burnt Sienna
    yellow: daliDarkColors.surrealAccent, // Example mapping: yellow to Surreal Accent
    teal: daliDarkColors.mutedTeal, // Make mutedTeal available as 'teal' color scheme
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'neutral.900',
        color: 'neutral.50',
      },
      '*::placeholder': {
        color: 'neutral.200',
      },
    }),
  },
  components: {
    // TODO: Rework all component styles for Dali theme
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'neutral.800', // Very dark sidebar
          borderColor: 'neutral.700',
        },
        navLink: {
          color: 'neutral.100',
          _hover: { bg: 'primary.600', color: 'accent1.400' },
        },
        activeNavLink: {
          bg: 'primary.500',
          color: 'accent1.500', // Ochre/Gold active link text
          fontWeight: 'bold',
          borderLeft: '3px solid',
          borderColor: 'accent1.500',
          _hover: { bg: 'primary.500' },
        },
        headerText: {
          color: 'accent1.400',
          fontFamily: `'Cinzel Decorative', serif`,
        },
        userInfoText: {
          color: 'neutral.200',
        },
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') {
            return {
              bg: 'primary.500',
              color: 'neutral.50',
              _hover: { bg: 'primary.600' },
              _active: { bg: 'primary.700' },
            };
          }
          // surrealAccent is mapped to yellow
          if (props.colorScheme === 'accent1' || props.colorScheme === 'yellow') { 
            return {
              bg: daliDarkColors.surrealAccent[500], // Use 500 directly for yellow
              color: daliDarkColors.neutral[900], // Dark text for yellow button
              _hover: { bg: daliDarkColors.accent1[500] }, // Hover with Ochre/Gold 500
            };
          }
          if (props.colorScheme === 'red' || props.colorScheme === 'error') {
            return {
              bg: daliDarkColors.semanticRed[500],
              color: 'neutral.50',
              _hover: {bg: '#B22222'}, // Hardcoded darker red for hover
            }
          }
          // Default solid button
          return {
            bg: 'neutral.700',
            color: 'neutral.100',
            _hover: {bg: 'neutral.600'}
          };
        },
        outline: (props: StyleFunctionProps) => {
          let currentSchemeKey: keyof typeof colorValues = 'default';
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') currentSchemeKey = 'primary';
          else if (props.colorScheme === 'accent1') currentSchemeKey = 'accent1';
          else if (props.colorScheme === 'accent2') currentSchemeKey = 'accent2';
          else if (props.colorScheme === 'yellow') currentSchemeKey = 'surrealAccent'; // map yellow to surrealAccent
          else if (props.colorScheme === 'red' || props.colorScheme === 'error') currentSchemeKey = 'red';
          
          const colorValues = {
            primary: daliDarkColors.primary[300],
            accent1: daliDarkColors.accent1[400],
            accent2: daliDarkColors.accent2[400],
            surrealAccent: daliDarkColors.surrealAccent[500],
            red: daliDarkColors.semanticRed[500],
            default: daliDarkColors.neutral[300],
          };

          const hoverBgValues = {
            primary: daliDarkColors.primary[700],
            accent1: daliDarkColors.accent1[700],
            accent2: daliDarkColors.accent2[700],
            surrealAccent: daliDarkColors.accent1[500], // Use Ochre 500 for yellow hover fill
            red: daliDarkColors.semanticRed[500], 
            default: daliDarkColors.neutral[700],
          };
          
          const borderColor = colorValues[currentSchemeKey];
          const hoverBg = hoverBgValues[currentSchemeKey];
          const hoverColor = currentSchemeKey === 'surrealAccent' ? daliDarkColors.neutral[900] : daliDarkColors.neutral[50];

          return {
            borderColor: borderColor,
            color: borderColor,
            _hover: { 
              bg: hoverBg,
              color: hoverColor
            },
          };
        },
        ghost: (props: StyleFunctionProps) => {
            let currentSchemeKey: keyof typeof colorValues = 'default';
            if (props.colorScheme === 'primary' || props.colorScheme === 'blue') currentSchemeKey = 'primary';
            else if (props.colorScheme === 'accent1') currentSchemeKey = 'accent1';
            else if (props.colorScheme === 'accent2') currentSchemeKey = 'accent2';
            else if (props.colorScheme === 'yellow') currentSchemeKey = 'surrealAccent'; // map yellow to surrealAccent
            else if (props.colorScheme === 'red' || props.colorScheme === 'error') currentSchemeKey = 'red';

            const colorValues = {
                primary: daliDarkColors.primary[300],
                accent1: daliDarkColors.accent1[400],
                accent2: daliDarkColors.accent2[400],
                surrealAccent: daliDarkColors.surrealAccent[500],
                red: daliDarkColors.semanticRed[500],
                default: daliDarkColors.neutral[200],
            };

            const hoverBgValues = {
                primary: daliDarkColors.primary[800],
                accent1: daliDarkColors.accent1[800],
                accent2: daliDarkColors.accent2[800],
                surrealAccent: daliDarkColors.accent1[800], // Use Ochre 800 for yellow hover fill
                red: daliDarkColors.semanticRed[500],
                default: daliDarkColors.neutral[700],
            }

            const color = colorValues[currentSchemeKey];
            const hoverBg = hoverBgValues[currentSchemeKey];
            const hoverColor = currentSchemeKey === 'surrealAccent' ? daliDarkColors.neutral[900] : daliDarkColors.neutral[50];

            return {
                color: color,
                _hover: { 
                    bg: hoverBg,
                    color: hoverColor
                },
            };
        }
      },
    },
    // Other components (Card, Modal, Table, Input, Select) will need similar rework
    Card: {
        baseStyle: {
            bg: 'neutral.800',
            borderColor: 'neutral.700',
            color: 'neutral.100',
        }
    },
    Heading: {
        baseStyle: {
            fontFamily: `'Cinzel Decorative', serif`,
            color: 'neutral.100',
        },
    },
    Text: {
        baseStyle: {
            fontFamily: `'Lato', sans-serif`,
            color: 'neutral.100',
        }
    },
    Modal: {
        baseStyle: {
            dialog: {
                bg: 'neutral.800',
                borderColor: 'neutral.700',
                color: 'neutral.100'
            },
            header: {
                fontFamily: `'Cinzel Decorative', serif`,
                color: 'accent1.400',
                borderColor: 'neutral.600',
            },
            footer: {
                 borderColor: 'neutral.600',
            },
            closeButton:{
                _hover: {bg: 'neutral.700'}
            }
        }
    },
    Table: {
      variants: {
        simple: {
          th: {
            fontFamily: `'Lato', sans-serif`,
            color: 'neutral.100',
            borderColor: 'neutral.600',
            bg: 'neutral.700'
          },
          td: {
            borderColor: 'neutral.700',
            color: 'neutral.50',
          },
          tbody: {
            tr: {
              bg: 'neutral.800',
              _hover: {
                bg: 'neutral.700',
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
                    bg: 'neutral.700',
                    borderColor: 'neutral.600',
                    _hover: { borderColor: 'neutral.500' },
                    _focus: {
                        borderColor: 'accent1.500',
                        boxShadow: `0 0 0 1px ${daliDarkColors.accent1[500]}`
                    }
                }
            }
        }
    },
    Select: {
        variants: {
            outline: {
                field: {
                    bg: 'neutral.700',
                    borderColor: 'neutral.600',
                    _hover: { borderColor: 'neutral.500' },
                    _focus: {
                        borderColor: 'accent1.500',
                        boxShadow: `0 0 0 1px ${daliDarkColors.accent1[500]}`
                    }
                }
            }
        }
    }
  },
}); 