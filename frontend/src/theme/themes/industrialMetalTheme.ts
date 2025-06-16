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
  
  // ENHANCED: Extended shadow system for industrial depth with 3D effects
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    outline: '0 0 0 3px rgba(255, 170, 0, 0.3)', // Hazard yellow focus outline
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    // ENHANCED: 3D Industrial shadows for stunning depth
    'metallic': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
    'forge': '0 0 20px rgba(255, 170, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 170, 0, 0.1)',
    'industrial3d': '0 12px 40px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)',
    'steelPlate': '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 4px 8px rgba(255, 255, 255, 0.08), inset 0 -4px 8px rgba(0, 0, 0, 0.5)',
    'forgeFire': '0 0 30px rgba(255, 170, 0, 0.5), 0 0 60px rgba(255, 170, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.8)',
    'metalRivets': '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.3), inset 2px 0 0 rgba(255, 255, 255, 0.05), inset -2px 0 0 rgba(0, 0, 0, 0.2)',
  },
  
  // ENHANCED: Industrial keyframes for forge effects
  keyframes: {
    forgeGlow: {
      '0%': { opacity: 0.3 },
      '100%': { opacity: 0.8 },
    },
    metalShine: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    rivetPulse: {
      '0%': { 
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
      },
      '50%': { 
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.8), inset 0 -2px 6px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.6)',
      },
      '100%': { 
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'linear-gradient(135deg, #1C1C1C 0%, #262626 50%, #1A1A1A 100%)', // ENHANCED: Industrial gradient background
        color: 'neutral.100',
        letterSpacing: '-0.01em', // ENHANCED: Tighter letter spacing for industrial feel
      },
      '*::placeholder': {
        color: 'neutral.300',
      },
      // ENHANCED: Industrial scrollbar styling
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        bg: 'neutral.800',
        borderRadius: 'md',
      },
      '*::-webkit-scrollbar-thumb': {
        bg: 'linear-gradient(180deg, #4A4A4A 0%, #3E3E3E 100%)',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'neutral.700',
        _hover: {
          bg: 'linear-gradient(180deg, #5F5F5F 0%, #4A4A4A 100%)',
        },
      },
      '*::-webkit-scrollbar-corner': {
        bg: 'neutral.800',
      },
    }),
  },
  
  components: {
    // ENHANCED: Sophisticated sidebar with 3D industrial aesthetics
    Sidebar: {
      baseStyle: {
        container: {
          bg: 'linear-gradient(180deg, #1A1A1A 0%, #262626 30%, #1C1C1C 70%, #141414 100%)',
          borderColor: 'neutral.800',
          borderRightWidth: '3px',
          borderRightStyle: 'solid',
          boxShadow: 'industrial3d',
          position: 'relative',
          // ENHANCED: 3D Metallic panel effect with rivets
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '2px',
            height: '100%',
            bg: 'linear-gradient(180deg, transparent 0%, rgba(255, 170, 0, 0.4) 30%, rgba(255, 170, 0, 0.6) 50%, rgba(255, 170, 0, 0.4) 70%, transparent 100%)',
            boxShadow: '0 0 8px rgba(255, 170, 0, 0.3)',
          },
          // ENHANCED: Rivet details on the side panel
          _after: {
            content: '""',
            position: 'absolute',
            top: '20px',
            right: '-6px',
            width: '12px',
            height: '12px',
            bg: 'radial-gradient(circle, #4A4A4A 30%, #2A2A2A 60%, #1A1A1A 100%)',
            borderRadius: '50%',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
            border: '1px solid #3A3A3A',
          },
        },
        navLink: {
          color: 'neutral.100',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'md',
          margin: '2px 8px',
          // ENHANCED: 3D Steel plate effect
          bg: 'linear-gradient(135deg, rgba(42, 42, 42, 0.3) 0%, rgba(26, 26, 26, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(58, 58, 58, 0.3)',
          _before: {
            content: '""',
            position: 'absolute',
            left: '-100%',
            top: 0,
            width: '100%',
            height: '100%',
            bg: 'linear-gradient(90deg, transparent, rgba(255, 170, 0, 0.1), transparent)',
            transition: 'left 0.6s ease',
          },
          _hover: { 
            bg: 'linear-gradient(135deg, rgba(74, 74, 74, 0.4) 0%, rgba(62, 62, 62, 0.6) 50%, rgba(42, 42, 42, 0.8) 100%)',
            transform: 'translateX(4px) translateY(-1px)',
            boxShadow: 'steelPlate',
            borderColor: 'rgba(255, 170, 0, 0.3)',
            color: 'neutral.50',
            _before: {
              left: '100%',
            },
          },
        },
        activeNavLink: {
          bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 50%, #323232 100%)',
          color: 'white',
          fontWeight: 'normal',
          borderLeft: '4px solid',
          borderColor: 'accentHazard.500',
          boxShadow: 'forgeFire',
          borderRadius: 'md',
          margin: '2px 8px',
          // ENHANCED: Active state with forge glow
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            left: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '8px',
            height: '50%',
            bg: 'linear-gradient(180deg, rgba(255, 170, 0, 0.8) 0%, rgba(255, 170, 0, 1) 50%, rgba(255, 170, 0, 0.8) 100%)',
            borderRadius: '0 4px 4px 0',
            boxShadow: '0 0 12px rgba(255, 170, 0, 0.6)',
          },
          _hover: { 
            bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 50%, #323232 100%)',
            transform: 'none',
            boxShadow: 'forgeFire',
          },
        },
        headerText: {
          color: 'accentHazard.400',
          fontFamily: `'Press Start 2P', cursive`,
          fontSize: 'xs',
          letterSpacing: '1.5px',
          textShadow: '0 0 15px rgba(255, 170, 0, 0.7), 0 0 30px rgba(255, 170, 0, 0.3), 0 2px 4px rgba(0,0,0,0.8)',
          // ENHANCED: Glowing forge text effect
          position: 'relative',
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 170, 0, 0.1) 50%, transparent 70%)',
            animation: 'forgeGlow 3s ease-in-out infinite alternate',
          },
        },
        userInfoText: {
          color: 'neutral.200',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
        }
      },
    },
    
    // ENHANCED: Industrial button styling with metallic effects
    Button: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontSize: 'sm',
        borderRadius: 'md',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        _focus: {
          boxShadow: 'outline',
          outline: 'none',
        },
        // ENHANCED: Metallic shine effect
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transition: 'left 0.6s ease',
        },
        _hover: {
          _before: {
            left: '100%',
          },
        },
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') {
            return {
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
              color: 'white',
              boxShadow: 'metallic',
              border: '1px solid',
              borderColor: 'neutral.600',
              _hover: { 
                bg: 'linear-gradient(135deg, #5F5F5F 0%, #4A4A4A 100%)',
                transform: 'translateY(-2px)',
                boxShadow: 'forge',
                borderColor: 'neutral.500',
              },
              _active: { 
                bg: 'linear-gradient(135deg, #3E3E3E 0%, #323232 100%)',
                transform: 'translateY(0)',
              },
            };
          }
          if (props.colorScheme === 'orange' || props.colorScheme === 'accentHazard' || props.colorScheme === 'yellow') {
            return {
              bg: 'linear-gradient(135deg, #FFAA00 0%, #E69900 100%)',
              color: 'neutral.900',
              boxShadow: 'forge',
              border: '1px solid',
              borderColor: 'accentHazard.600',
              fontWeight: '700',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              _hover: { 
                bg: 'linear-gradient(135deg, #FFC71A 0%, #FFAA00 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 0 25px rgba(255, 170, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.7)',
                borderColor: 'accentHazard.400',
              },
              _active: { 
                bg: 'linear-gradient(135deg, #E69900 0%, #CC8800 100%)',
                transform: 'translateY(0)',
              },
            };
          }
          if (props.colorScheme === 'red' || props.colorScheme === 'semanticRed') {
            return {
              bg: 'linear-gradient(135deg, #B00020 0%, #9D001C 100%)',
              color: 'white',
              boxShadow: '0 0 20px rgba(176, 0, 32, 0.3), 0 8px 32px rgba(0, 0, 0, 0.7)',
              border: '1px solid',
              borderColor: 'semanticRed.600',
              _hover: { 
                bg: 'linear-gradient(135deg, #DA324C 0%, #B00020 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 0 25px rgba(176, 0, 32, 0.5), 0 8px 32px rgba(0, 0, 0, 0.7)',
              },
            };
          }
          return {};
        },
        outline: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'accentHazard' || props.colorScheme === 'yellow') {
            return {
              borderColor: 'accentHazard.500',
              borderWidth: '2px',
              color: 'accentHazard.400',
              bg: 'linear-gradient(135deg, rgba(28, 28, 28, 0.8) 0%, rgba(38, 38, 38, 0.9) 100%)',
              _hover: { 
                bg: 'linear-gradient(135deg, #FFAA00 0%, #E69900 100%)',
                color: 'neutral.900',
                borderColor: 'accentHazard.400',
                transform: 'translateY(-2px)',
                boxShadow: 'forge',
              },
            };
          }
          return { 
            borderColor: 'primary.500',
            borderWidth: '2px',
            color: 'primary.300',
            bg: 'linear-gradient(135deg, rgba(28, 28, 28, 0.8) 0%, rgba(38, 38, 38, 0.9) 100%)',
            _hover: { 
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
              color: 'white',
              borderColor: 'primary.400',
              transform: 'translateY(-2px)',
              boxShadow: 'metallic',
            },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'red' || props.colorScheme === 'semanticRed') {
            return {
              color: 'semanticRed.400',
              bg: 'transparent',
              _hover: { 
                bg: 'linear-gradient(135deg, rgba(176, 0, 32, 0.2) 0%, rgba(157, 0, 28, 0.3) 100%)',
                color: 'semanticRed.300',
              },
            };
          }
          return { 
            color: 'primary.300',
            bg: 'transparent',
            _hover: { 
              bg: 'linear-gradient(135deg, rgba(74, 74, 74, 0.2) 0%, rgba(62, 62, 62, 0.3) 100%)',
              color: 'primary.200',
            },
          };
        },
      },
    },
    
    // ENHANCED: Industrial IconButton styling
    IconButton: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        fontWeight: '600',
        borderRadius: 'md',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        _focus: {
          boxShadow: 'outline',
          outline: 'none',
        },
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transition: 'left 0.6s ease',
        },
        _hover: {
          _before: {
            left: '100%',
          },
        },
      },
      variants: {
        solid: (props: StyleFunctionProps) => {
          if (props.colorScheme === 'primary' || props.colorScheme === 'blue') {
            return {
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
              color: 'white',
              boxShadow: 'metallic',
              border: '1px solid',
              borderColor: 'neutral.600',
              _hover: { 
                bg: 'linear-gradient(135deg, #5F5F5F 0%, #4A4A4A 100%)',
                transform: 'translateY(-2px)',
                boxShadow: 'forge',
              },
              _active: { 
                bg: 'linear-gradient(135deg, #3E3E3E 0%, #323232 100%)',
                transform: 'translateY(0)',
              },
            };
          }
          return {};
        },
        outline: (props: StyleFunctionProps) => {
          return {
            borderColor: 'primary.500',
            color: 'primary.300',
            borderWidth: '2px',
            bg: 'linear-gradient(135deg, rgba(28, 28, 28, 0.8) 0%, rgba(38, 38, 38, 0.9) 100%)',
            _hover: { 
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
              color: 'white',
              borderColor: 'primary.400',
              transform: 'translateY(-2px)',
              boxShadow: 'metallic',
            },
          };
        },
        ghost: (props: StyleFunctionProps) => {
          return {
            color: 'primary.300',
            bg: 'transparent',
            _hover: { 
              bg: 'linear-gradient(135deg, rgba(74, 74, 74, 0.2) 0%, rgba(62, 62, 62, 0.3) 100%)',
              color: 'primary.200',
            },
          };
        },
      },
    },
    
    // ENHANCED: Industrial card styling with metallic effects
    Card: { 
      baseStyle: {
        container: {
          bg: 'linear-gradient(135deg, #303030 0%, #262626 100%)',
          borderRadius: 'xl',
          boxShadow: 'metallic',
          borderWidth: '1px',
          borderColor: 'rgba(58, 58, 58, 0.8)',
          color: 'neutral.100',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 170, 0, 0.3) 50%, transparent 100%)',
          },
          _hover: {
            boxShadow: 'forge',
            borderColor: 'rgba(74, 74, 74, 0.9)',
            transform: 'translateY(-4px)',
            _before: {
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 170, 0, 0.6) 50%, transparent 100%)',
            },
          },
        },
        header: {
          bg: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
          borderTopRadius: 'xl',
          borderBottomWidth: '1px',
          borderColor: 'rgba(58, 58, 58, 0.8)',
          px: 6,
          py: 4,
          position: 'relative',
        },
        body: {
          px: 6,
          py: 5,
        },
        footer: {
          bg: 'linear-gradient(135deg, #262626 0%, #1C1C1C 100%)',
          borderBottomRadius: 'xl',
          borderTopWidth: '1px',
          borderColor: 'rgba(58, 58, 58, 0.8)',
          px: 6,
          py: 4,
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        fontWeight: '700',
        color: 'neutral.50',
        letterSpacing: '0.5px',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
      },
      variants: {
        industrial: {
          fontFamily: `'Bebas Neue', sans-serif`,
          fontWeight: '700',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'accentHazard.400',
          textShadow: '0 0 10px rgba(255, 170, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.8)',
        },
      },
    },
    Text: {
      baseStyle: {
        fontFamily: `'Lato', sans-serif`,
        color: 'neutral.200',
        lineHeight: '1.5',
        letterSpacing: '-0.01em',
      },
      variants: {
        numeric: {
          fontFamily: `'Courier New', monospace`,
          fontWeight: '600',
          color: 'accentHazard.300',
          letterSpacing: '0.5px',
          textShadow: '0 0 8px rgba(255, 170, 0, 0.2)',
        },
        industrial: {
          fontFamily: `'Bebas Neue', sans-serif`,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'neutral.100',
          fontWeight: '500',
        },
      },
    },
    Modal: {
      baseStyle: (props: StyleFunctionProps) => ({
        dialog: {
          bg: 'linear-gradient(135deg, #303030 0%, #262626 100%)',
          boxShadow: 'forge',
          borderRadius: 'xl',
          borderWidth: '2px',
          borderColor: 'rgba(58, 58, 58, 0.9)',
          color: 'neutral.100',
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 170, 0, 0.6) 50%, transparent 100%)',
          },
        },
        overlay: {
          bg: 'rgba(28, 28, 28, 0.8)',
          backdropFilter: 'blur(8px)',
        },
        header: {
          fontFamily: `'Bebas Neue', sans-serif`,
          fontWeight: '700',
          fontSize: 'lg',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'accentHazard.400',
          borderColor: 'rgba(58, 58, 58, 0.8)',
          bg: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
          borderTopRadius: 'xl',
          textShadow: '0 0 10px rgba(255, 170, 0, 0.3)',
        },
        body: {
          color: 'neutral.100',
          bg: 'linear-gradient(135deg, #303030 0%, #262626 100%)',
        },
        footer: {
          borderColor: 'rgba(58, 58, 58, 0.8)',
          bg: 'linear-gradient(135deg, #262626 0%, #1C1C1C 100%)',
          borderBottomRadius: 'xl',
        },
        closeButton: {
          color: 'neutral.300',
          transition: 'all 0.3s ease',
          _hover: {
            bg: 'linear-gradient(135deg, rgba(74, 74, 74, 0.3) 0%, rgba(62, 62, 62, 0.5) 100%)',
            color: 'accentHazard.400',
            transform: 'scale(1.1)',
          },
        },
      }),
    },
    Table: {
      variants: {
        simple: (props: StyleFunctionProps) => ({
          table: {
            fontFamily: `'Lato', 'Roboto Condensed', sans-serif`,
            bg: 'linear-gradient(135deg, #262626 0%, #1C1C1C 100%)',
            borderRadius: 'lg',
            overflow: 'hidden',
            boxShadow: 'metallic',
          },
          th: {
            fontFamily: `'Bebas Neue', 'Cinzel Decorative', sans-serif`,
            fontSize: 'sm',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'accentHazard.400',
            borderColor: 'neutral.600',
            bg: 'linear-gradient(135deg, #1C1C1C 0%, #262626 100%)',
            py: 4,
            px: 4,
            lineHeight: '1.2',
            borderBottomWidth: '2px',
            borderBottomColor: 'accentHazard.600',
            position: 'relative',
            textShadow: '0 0 8px rgba(255, 170, 0, 0.3)',
            transition: 'all 0.3s ease',
            _hover: {
              bg: 'linear-gradient(135deg, #303030 0%, #3A3A3A 100%)',
              color: 'accentHazard.300',
              cursor: 'pointer',
              transform: 'translateY(-1px)',
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
              transition: 'opacity 0.3s ease',
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
            transition: 'all 0.2s ease',
            _hover: {
              color: 'neutral.50',
            },
          },
          tbody: {
            tr: {
              bg: 'linear-gradient(135deg, #303030 0%, #262626 100%)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderBottomWidth: '1px',
              borderBottomColor: 'neutral.700',
              _hover: {
                bg: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255, 170, 0, 0.1)',
                borderBottomColor: 'accentHazard.500',
              },
              _odd: {
                bg: 'linear-gradient(135deg, #262626 0%, #303030 100%)',
                _hover: {
                  bg: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
                },
              },
            },
          },
        }),
        unstyled: (props: StyleFunctionProps) => ({
          table: {
            fontFamily: `'Lato', sans-serif`,
          },
          th: {
            fontFamily: `'Bebas Neue', sans-serif`,
            fontSize: 'sm',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'accentHazard.400',
            borderColor: 'neutral.600',
            bg: 'linear-gradient(135deg, #1C1C1C 0%, #262626 100%)',
            py: 4,
            px: 4,
            borderBottomWidth: '2px',
            borderBottomColor: 'accentHazard.600',
            textShadow: '0 0 8px rgba(255, 170, 0, 0.3)',
            _hover: {
              bg: 'linear-gradient(135deg, #303030 0%, #3A3A3A 100%)',
              color: 'accentHazard.300',
            },
          },
          td: {
            fontFamily: `'Lato', sans-serif`,
            fontSize: 'sm',
            color: 'neutral.100',
            py: 3,
            px: 4,
            borderColor: 'neutral.700',
          },
        }),
      },
    },
    
    // ENHANCED: Industrial input styling with metallic effects
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'linear-gradient(135deg, rgba(28, 28, 28, 0.9) 0%, rgba(38, 38, 38, 0.8) 100%)',
            borderColor: 'rgba(74, 74, 74, 0.8)',
            borderWidth: '2px',
            borderRadius: 'lg',
            color: 'neutral.100',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'inner',
            _placeholder: {
              color: 'neutral.400',
              fontStyle: 'italic',
            },
            _hover: {
              borderColor: 'rgba(95, 95, 95, 0.9)',
              bg: 'linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(48, 48, 48, 0.8) 100%)',
              transform: 'translateY(-1px)',
            },
            _focus: {
              borderColor: 'accentHazard.500',
              boxShadow: '0 0 0 3px rgba(255, 170, 0, 0.2), inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
              outline: 'none',
              bg: 'linear-gradient(135deg, rgba(38, 38, 38, 1) 0%, rgba(48, 48, 48, 0.9) 100%)',
              _hover: {
                borderColor: 'accentHazard.500',
              },
            },
            _invalid: {
              borderColor: 'semanticRed.500',
              boxShadow: '0 0 0 3px rgba(176, 0, 32, 0.2), inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
            },
          },
        },
        filled: {
          field: {
            bg: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
            borderColor: 'transparent',
            color: 'neutral.100',
            _hover: {
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3A3A3A 100%)',
            },
            _focus: {
              bg: 'linear-gradient(135deg, #4A4A4A 0%, #3A3A3A 100%)',
              borderColor: 'accentHazard.500',
              boxShadow: '0 0 0 2px rgba(255, 170, 0, 0.3)',
            },
          },
        },
      },
    },
    
    // ENHANCED: Industrial progress styling
    Progress: {
      baseStyle: {
        track: {
          bg: 'linear-gradient(90deg, #262626 0%, #303030 100%)',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: 'neutral.700',
        },
        filledTrack: {
          bg: 'linear-gradient(90deg, #FFAA00 0%, #E69900 100%)',
          boxShadow: '0 0 10px rgba(255, 170, 0, 0.4)',
          borderRadius: 'full',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

// Enhanced semantic tokens for industrial theme
export const industrialSemanticTokens = {
  colors: {
    // Enhanced component styling with industrial aesthetics
    component: {
      button: {
        primary: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
        primaryHover: 'linear-gradient(135deg, #5F5F5F 0%, #4A4A4A 100%)',
        secondary: 'linear-gradient(135deg, rgba(28, 28, 28, 0.8) 0%, rgba(38, 38, 38, 0.9) 100%)',
        secondaryHover: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 100%)',
        ghost: 'transparent',
        ghostHover: 'linear-gradient(135deg, rgba(74, 74, 74, 0.2) 0%, rgba(62, 62, 62, 0.3) 100%)',
      },
      kanban: {
        column: 'linear-gradient(180deg, #262626 0%, #1C1C1C 100%)',
        card: 'linear-gradient(135deg, #303030 0%, #262626 100%)',
        cardHover: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)',
        cardBorder: 'rgba(58, 58, 58, 0.8)',
      },
    },
  },
};