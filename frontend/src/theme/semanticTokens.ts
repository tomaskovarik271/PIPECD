import { SemanticValue } from '@chakra-ui/react'

// Type definitions for our semantic token values
export interface SemanticTokenValue {
  modern?: string
  lightModern?: string  // NEW: Light modern theme
  industrialMetal?: string
  _default: string
}

// Type definitions for our semantic tokens
export interface ThemeSemanticTokens {
  colors: {
    // Background colors
    background: {
      app: SemanticTokenValue
      content: SemanticTokenValue 
      surface: SemanticTokenValue
      elevated: SemanticTokenValue
      overlay: SemanticTokenValue
      sidebar: SemanticTokenValue
      card: SemanticTokenValue
      input: SemanticTokenValue
      kanbanColumn: SemanticTokenValue
    }
    
    // Text colors
    text: {
      primary: SemanticTokenValue
      secondary: SemanticTokenValue
      muted: SemanticTokenValue
      onAccent: SemanticTokenValue
      link: SemanticTokenValue
      error: SemanticTokenValue
      success: SemanticTokenValue
      warning: SemanticTokenValue
      accent: SemanticTokenValue
      inverse: SemanticTokenValue
    }
    
    // Border colors
    border: {
      default: SemanticTokenValue
      subtle: SemanticTokenValue
      emphasis: SemanticTokenValue
      accent: SemanticTokenValue
      input: SemanticTokenValue
      focus: SemanticTokenValue
      error: SemanticTokenValue
      divider: SemanticTokenValue
    }
    
    // Interactive colors
    interactive: {
      default: SemanticTokenValue
      hover: SemanticTokenValue
      active: SemanticTokenValue
      disabled: SemanticTokenValue
      focus: SemanticTokenValue
    }
    
    // Status colors  
    status: {
      success: SemanticTokenValue
      warning: SemanticTokenValue
      error: SemanticTokenValue
      info: SemanticTokenValue
    }
    
    // Component-specific colors
    component: {
      button: {
        primary: SemanticTokenValue
        primaryHover: SemanticTokenValue
        secondary: SemanticTokenValue
        secondaryHover: SemanticTokenValue
        ghost: SemanticTokenValue
        ghostHover: SemanticTokenValue
      }
      table: {
        header: SemanticTokenValue
        row: SemanticTokenValue
        rowHover: SemanticTokenValue
        border: SemanticTokenValue
      }
      modal: {
        background: SemanticTokenValue
        header: SemanticTokenValue
        overlay: SemanticTokenValue
      }
      sidebar: {
        background: SemanticTokenValue
        item: SemanticTokenValue
        itemActive: SemanticTokenValue
        itemHover: SemanticTokenValue
        text: SemanticTokenValue
        textActive: SemanticTokenValue
      }
      kanban: {
        column: SemanticTokenValue
        card: SemanticTokenValue
        cardHover: SemanticTokenValue
        cardBorder: SemanticTokenValue
      }
    }
    
    // Shadow effects for 3D depth
    shadows: {
      sidebar: SemanticTokenValue
      kanbanColumn: SemanticTokenValue
      card: SemanticTokenValue
      cardHover: SemanticTokenValue
      button: SemanticTokenValue
      buttonHover: SemanticTokenValue
      modal: SemanticTokenValue
      input: SemanticTokenValue
      inputFocus: SemanticTokenValue
      table: SemanticTokenValue
    }
  }
}

// Semantic tokens that map to different values based on the theme
export const semanticTokens: ThemeSemanticTokens = {
  colors: {
    // Background colors
    background: {
      app: {
        modern: '#1A1D29',
        lightModern: 'linear-gradient(135deg, #fcfcfd 0%, #f8fafc 100%)',  // ENHANCED: Subtle gradient for depth
        industrialMetal: 'neutral.900',
        _default: '#ffffff'
      },
      content: {
        modern: '#171923', 
        lightModern: '#ffffff',  // Pure white content areas
        industrialMetal: 'neutral.900',
        _default: '#fafbfc'
      },
      surface: {
        modern: '#1A202C',
        lightModern: '#ffffff',  // White surfaces with enhanced shadows
        industrialMetal: 'neutral.800', 
        _default: '#ffffff'
      },
      elevated: {
        modern: '#2D3748',
        lightModern: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',  // ENHANCED: Subtle gradient for elevated surfaces
        industrialMetal: 'neutral.700',
        _default: '#ffffff'
      },
      overlay: {
        modern: 'rgba(0,0,0,0.8)',
        lightModern: 'rgba(15,23,42,0.5)',  // ENHANCED: Slightly darker for better focus
        industrialMetal: 'rgba(0,0,0,0.85)',
        _default: 'rgba(0,0,0,0.6)'
      },
      sidebar: {
        modern: '#1A1D29',
        lightModern: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',  // ENHANCED: Subtle vertical gradient
        industrialMetal: 'linear-gradient(180deg, #1A1A1A 0%, #262626 30%, #1C1C1C 70%, #141414 100%)', // ENHANCED: 3D industrial panel gradient
        _default: '#ffffff'
      },
      card: {
        modern: '#1A202C',
        lightModern: 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%)',  // ENHANCED: Subtle card gradient
        industrialMetal: 'linear-gradient(135deg, #303030 0%, #262626 50%, #1C1C1C 100%)', // ENHANCED: 3D metallic card gradient
        _default: '#ffffff'
      },
      input: {
        modern: '#2D3748',
        lightModern: '#ffffff',  // ENHANCED: White input backgrounds for better contrast
        industrialMetal: 'linear-gradient(135deg, rgba(28, 28, 28, 0.9) 0%, rgba(38, 38, 38, 0.8) 100%)', // ENHANCED: Metallic input gradient
        _default: '#ffffff'
      },
      kanbanColumn: {
        modern: '#1A202C',
        lightModern: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',  // ENHANCED: Gradient columns for better depth
        industrialMetal: 'linear-gradient(180deg, #262626 0%, #1C1C1C 50%, #181818 100%)', // ENHANCED: 3D forge column gradient
        _default: '#f7fafc'
      }
    },
    
    // Text colors
    text: {
      primary: {
        modern: '#EDF2F7',
        lightModern: '#0f172a',  // ENHANCED: Much darker for excellent readability
        industrialMetal: 'neutral.100',
        _default: '#1a202c'
      },
      secondary: {
        modern: '#A0AEC0',
        lightModern: '#475569',  // ENHANCED: Better contrast secondary text
        industrialMetal: 'neutral.200',
        _default: '#4a5568'
      },
      muted: {
        modern: '#718096',
        lightModern: '#64748b',  // ENHANCED: Improved muted text contrast
        industrialMetal: 'neutral.300',
        _default: '#718096'
      },
      onAccent: {
        modern: '#ffffff',
        lightModern: '#ffffff',  // White text on colored backgrounds
        industrialMetal: '#ffffff',
        _default: '#ffffff'
      },
      link: {
        modern: '#667eea',
        lightModern: '#6366f1',  // ENHANCED: Better brand color for links
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      error: {
        modern: '#fc8181',
        lightModern: '#dc2626',  // ENHANCED: Stronger error color for visibility
        industrialMetal: 'semanticRed.400',
        _default: '#e53e3e'
      },
      success: {
        modern: '#68d391',
        lightModern: '#059669',  // ENHANCED: Stronger success color
        industrialMetal: '#68d391',
        _default: '#38a169'
      },
      warning: {
        modern: '#fbb32f',
        lightModern: '#d97706',  // ENHANCED: Better warning visibility
        industrialMetal: 'accentHazard.400',
        _default: '#d69e2e'
      },
      accent: {
        modern: '#667eea',
        lightModern: '#6366f1',  // ENHANCED: Modern accent color
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      inverse: {
        modern: '#1a202c',
        lightModern: '#ffffff',  // White text for inverse situations
        industrialMetal: 'neutral.900',
        _default: '#ffffff'
      }
    },
    
    // Border colors
    border: {
      default: {
        modern: '#2D3748',
        lightModern: '#e2e8f0',  // ENHANCED: Softer default borders
        industrialMetal: 'neutral.700',
        _default: '#e2e8f0'
      },
      subtle: {
        modern: '#4A5568',
        lightModern: '#f1f5f9',  // ENHANCED: Ultra-subtle borders
        industrialMetal: 'neutral.800',
        _default: '#edf2f7'
      },
      emphasis: {
        modern: '#4A5568',
        lightModern: '#cbd5e0',  // ENHANCED: More prominent borders when needed
        industrialMetal: 'neutral.600',
        _default: '#cbd5e0'
      },
      accent: {
        modern: '#667eea',
        lightModern: '#6366f1',  // ENHANCED: Modern accent borders
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      input: {
        modern: '#4A5568',
        lightModern: '#d1d5db',  // ENHANCED: Better input border visibility
        industrialMetal: 'neutral.600',
        _default: '#e2e8f0'
      },
      focus: {
        modern: '#667eea',
        lightModern: '#6366f1',  // ENHANCED: Modern focus borders
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      error: {
        modern: '#fc8181',
        lightModern: '#dc2626',  // ENHANCED: Strong error borders
        industrialMetal: 'semanticRed.400',
        _default: '#e53e3e'
      },
      divider: {
        modern: '#2A2D3A',
        lightModern: '#f1f5f9',  // ENHANCED: Very subtle dividers
        industrialMetal: 'neutral.700',
        _default: '#f8fafc'
      }
    },
    
    // Interactive colors
    interactive: {
      default: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Slightly darker for better contrast
        industrialMetal: 'primary.500',
        _default: '#667eea'
      },
      hover: {
        modern: '#5a6acc',
        lightModern: '#4c51bf',  // NEW: Darker hover state
        industrialMetal: 'primary.600',
        _default: '#5a6acc'
      },
      active: {
        modern: '#4c51bf',
        lightModern: '#4338ca',  // NEW: Even darker for active state
        industrialMetal: 'primary.700',
        _default: '#4c51bf'
      },
      disabled: {
        modern: '#4A5568',
        lightModern: '#a0aec0',  // NEW: Light gray for disabled state
        industrialMetal: 'neutral.600',
        _default: '#a0aec0'
      },
      focus: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Focus color with good contrast
        industrialMetal: 'primary.400',
        _default: '#667eea'
      }
    },
    
    // Status colors
    status: {
      success: {
        modern: '#68d391',
        lightModern: '#38a169',  // NEW: Darker green for better visibility
        industrialMetal: '#68d391',
        _default: '#38a169'
      },
      warning: {
        modern: '#fbb32f',
        lightModern: '#d69e2e',  // NEW: Darker orange for better contrast
        industrialMetal: 'accentHazard.500',
        _default: '#d69e2e'
      },
      error: {
        modern: '#fc8181',
        lightModern: '#e53e3e',  // NEW: Darker red for better visibility
        industrialMetal: 'semanticRed.500',
        _default: '#e53e3e'
      },
      info: {
        modern: '#63b3ed',
        lightModern: '#3182ce',  // NEW: Darker blue for better contrast
        industrialMetal: 'primary.400',
        _default: '#3182ce'
      }
    },
    
    // Component-specific colors
    component: {
      button: {
        primary: {
          modern: '#667eea',
          lightModern: '#6366f1',  // ENHANCED: Modern primary button color
          industrialMetal: 'accentHazard.500',
          _default: '#667eea'
        },
        primaryHover: {
          modern: '#5a6acc',
          lightModern: '#5b21b6',  // ENHANCED: Deeper hover state
          industrialMetal: 'accentHazard.600',
          _default: '#5a6acc'
        },
        secondary: {
          modern: '#2A2D3A',
          lightModern: '#ffffff',  // ENHANCED: Clean white secondary buttons
          industrialMetal: 'neutral.800',
          _default: '#edf2f7'
        },
        secondaryHover: {
          modern: '#4A5568',
          lightModern: '#f8fafc',  // ENHANCED: Subtle secondary button hover
          industrialMetal: 'neutral.700',
          _default: '#e2e8f0'
        },
        ghost: {
          modern: 'transparent',
          lightModern: 'transparent',  // Transparent ghost buttons
          industrialMetal: 'transparent',
          _default: 'transparent'
        },
        ghostHover: {
          modern: '#2D3748',
          lightModern: '#f1f5f9',  // ENHANCED: Very subtle ghost button hover
          industrialMetal: 'neutral.700',
          _default: '#f7fafc'
        }
      },
      table: {
        header: {
          modern: '#2A2D3A',
          lightModern: '#f8fafc',  // ENHANCED: Light table headers with better contrast
          industrialMetal: 'linear-gradient(135deg, #1C1C1C 0%, #262626 100%)', // ENHANCED: 3D metallic header gradient
          _default: '#f7fafc'
        },
        row: {
          modern: '#1A202C',
          lightModern: '#ffffff',  // White table rows
          industrialMetal: 'linear-gradient(135deg, #303030 0%, #262626 100%)', // ENHANCED: 3D metallic row gradient
          _default: '#ffffff'
        },
        rowHover: {
          modern: '#2D3748',
          lightModern: '#f8fafc',  // ENHANCED: Subtle row hover with better contrast
          industrialMetal: 'linear-gradient(135deg, #3A3A3A 0%, #303030 100%)', // ENHANCED: 3D metallic hover gradient
          _default: '#f7fafc'
        },
        border: {
          modern: '#2D3748',
          lightModern: '#e2e8f0',  // Light table borders
          industrialMetal: 'rgba(255, 170, 0, 0.3)', // ENHANCED: Hazard yellow accent borders
          _default: '#e2e8f0'
        }
      },
      modal: {
        background: {
          modern: '#1A202C',
          lightModern: '#ffffff',  // White modal backgrounds
          industrialMetal: 'neutral.800',
          _default: '#ffffff'
        },
        header: {
          modern: '#2D3748',
          lightModern: '#f8fafc',  // ENHANCED: Light modal headers with subtle background
          industrialMetal: 'neutral.700',
          _default: '#f7fafc'
        },
        overlay: {
          modern: 'rgba(0,0,0,0.8)',
          lightModern: 'rgba(15,23,42,0.4)',  // ENHANCED: Modern overlay with backdrop blur support
          industrialMetal: 'rgba(0,0,0,0.85)',
          _default: 'rgba(0,0,0,0.6)'
        }
      },
      sidebar: {
        background: {
          modern: 'linear-gradient(180deg, #1A1D29 0%, #2D3748 100%)',
          lightModern: '#ffffff',  // ENHANCED: Pure white sidebar with shadow-based elevation
          industrialMetal: 'linear-gradient(180deg, #1A1A1A 0%, #262626 30%, #1C1C1C 70%, #141414 100%)', // ENHANCED: 3D industrial sidebar gradient
          _default: '#ffffff'
        },
        item: {
          modern: 'transparent',
          lightModern: 'transparent',  // Transparent sidebar items
          industrialMetal: 'linear-gradient(135deg, rgba(42, 42, 42, 0.3) 0%, rgba(26, 26, 26, 0.5) 50%, rgba(20, 20, 20, 0.7) 100%)', // ENHANCED: 3D steel plate effect
          _default: 'transparent'
        },
        itemActive: {
          modern: '#667eea',
          lightModern: '#6366f1',  // ENHANCED: Modern active sidebar item color
          industrialMetal: 'linear-gradient(135deg, #4A4A4A 0%, #3E3E3E 50%, #323232 100%)', // ENHANCED: 3D active forge effect
          _default: '#667eea'
        },
        itemHover: {
          modern: '#2D3748',
          lightModern: '#f1f5f9',  // ENHANCED: Very subtle sidebar item hover
          industrialMetal: 'linear-gradient(135deg, rgba(74, 74, 74, 0.4) 0%, rgba(62, 62, 62, 0.6) 50%, rgba(42, 42, 42, 0.8) 100%)', // ENHANCED: 3D steel hover effect
          _default: '#f7fafc'
        },
        text: {
          modern: '#A0AEC0',
          lightModern: '#64748b',  // ENHANCED: Better contrast sidebar text
          industrialMetal: 'neutral.100',
          _default: '#4a5568'
        },
        textActive: {
          modern: '#ffffff',
          lightModern: '#ffffff',  // White text for active items
          industrialMetal: '#ffffff',
          _default: '#ffffff'
        }
      },
      kanban: {
        column: {
          modern: '#1A202C',
          lightModern: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',  // ENHANCED: Gradient columns for better depth
          industrialMetal: 'linear-gradient(180deg, #262626 0%, #1C1C1C 50%, #181818 100%)', // ENHANCED: 3D forge column gradient
          _default: '#f7fafc'
        },
        card: {
          modern: '#2D3748',
          lightModern: 'linear-gradient(135deg, #ffffff 0%, #fcfcfd 100%)',  // ENHANCED: Subtle card gradient
          industrialMetal: 'linear-gradient(135deg, #303030 0%, #262626 50%, #1C1C1C 100%)', // ENHANCED: 3D metallic card gradient
          _default: '#ffffff'
        },
        cardHover: {
          modern: '#4A5568',
          lightModern: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',  // ENHANCED: Gradient hover for depth
          industrialMetal: 'linear-gradient(135deg, #3A3A3A 0%, #303030 50%, #242424 100%)', // ENHANCED: 3D metallic hover effect
          _default: '#f7fafc'
        },
        cardBorder: {
          modern: '#4A5568',
          lightModern: 'rgba(226, 232, 240, 0.6)',  // ENHANCED: More subtle card borders
          industrialMetal: 'rgba(255, 170, 0, 0.3)', // ENHANCED: Hazard yellow accent border
          _default: '#e2e8f0'
        }
      }
    },
    
    // Shadow effects for 3D depth
    shadows: {
      sidebar: {
        modern: '0 2px 8px rgba(0,0,0,0.2)',
        lightModern: '0 1px 3px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.05)',
        industrialMetal: '0 2px 8px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,170,0,0.1)',
        _default: '0 2px 8px rgba(0,0,0,0.1)'
      },
      kanbanColumn: {
        modern: '0 2px 4px rgba(0,0,0,0.1)',
        lightModern: '0 1px 3px rgba(15,23,42,0.05)',
        industrialMetal: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,170,0,0.1)',
        _default: '0 2px 4px rgba(0,0,0,0.1)'
      },
      card: {
        modern: '0 2px 4px rgba(0,0,0,0.1)',
        lightModern: '0 1px 3px rgba(15,23,42,0.08)',
        industrialMetal: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        _default: '0 1px 3px rgba(0,0,0,0.1)'
      },
      cardHover: {
        modern: '0 4px 8px rgba(0,0,0,0.15)',
        lightModern: '0 4px 6px rgba(15,23,42,0.1), 0 1px 3px rgba(15,23,42,0.08)',
        industrialMetal: '0 4px 12px rgba(0,0,0,0.35), 0 0 20px rgba(255,170,0,0.2)',
        _default: '0 2px 6px rgba(0,0,0,0.1)'
      },
      button: {
        modern: '0 1px 3px rgba(0,0,0,0.12)',
        lightModern: '0 1px 2px rgba(15,23,42,0.05)',
        industrialMetal: '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        _default: '0 1px 3px rgba(0,0,0,0.12)'
      },
      buttonHover: {
        modern: '0 2px 6px rgba(0,0,0,0.15)',
        lightModern: '0 2px 4px rgba(15,23,42,0.08)',
        industrialMetal: '0 3px 8px rgba(0,0,0,0.3), 0 0 15px rgba(255,170,0,0.15)',
        _default: '0 2px 6px rgba(0,0,0,0.15)'
      },
      modal: {
        modern: '0 20px 25px rgba(0,0,0,0.25)',
        lightModern: '0 20px 25px rgba(15,23,42,0.15)',
        industrialMetal: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,170,0,0.1)',
        _default: '0 20px 25px rgba(0,0,0,0.25)'
      },
      input: {
        modern: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        lightModern: 'inset 0 1px 2px rgba(15,23,42,0.05)',
        industrialMetal: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,170,0,0.1)',
        _default: 'inset 0 1px 3px rgba(0,0,0,0.1)'
      },
      inputFocus: {
        modern: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(102,126,234,0.1)',
        lightModern: 'inset 0 1px 2px rgba(15,23,42,0.05), 0 0 0 3px rgba(99,102,241,0.1)',
        industrialMetal: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,170,0,0.3)',
        _default: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(102,126,234,0.1)'
      },
      table: {
        modern: '0 1px 3px rgba(0,0,0,0.08)',
        lightModern: '0 1px 3px rgba(15,23,42,0.05)',
        industrialMetal: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,170,0,0.05)',
        _default: '0 1px 3px rgba(0,0,0,0.08)'
      }
    }
  }
}

// Type guard to check if a theme key exists
export const isThemeKey = (key: string): key is keyof typeof semanticTokens.colors.background.app => {
  return ['modern', 'lightModern', 'industrialMetal', '_default'].includes(key)
}

// Helper function to get semantic token value for current theme
export const getSemanticTokenValue = (
  tokenPath: string,
  currentTheme: string = 'modern'
): string => {
  const pathArray = tokenPath.split('.')
  let current: any = semanticTokens.colors
  
  for (const segment of pathArray) {
    current = current?.[segment]
  }
  
  if (typeof current === 'object' && current !== null) {
    return current[currentTheme] || current._default || '#000000'
  }
  
  return current || '#000000'
} 