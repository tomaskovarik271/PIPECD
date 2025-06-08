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
  }
}

// Semantic tokens that map to different values based on the theme
export const semanticTokens: ThemeSemanticTokens = {
  colors: {
    // Background colors
    background: {
      app: {
        modern: '#1A1D29',
        lightModern: '#f8fafc',  // NEW: Very light blue-gray background
        industrialMetal: 'neutral.900',
        _default: '#ffffff'
      },
      content: {
        modern: '#171923', 
        lightModern: '#ffffff',  // NEW: Pure white content areas
        industrialMetal: 'neutral.900',
        _default: '#fafbfc'
      },
      surface: {
        modern: '#1A202C',
        lightModern: '#ffffff',  // NEW: White surfaces with subtle shadows
        industrialMetal: 'neutral.800', 
        _default: '#ffffff'
      },
      elevated: {
        modern: '#2D3748',
        lightModern: '#f7fafc',  // NEW: Very subtle gray for elevated surfaces
        industrialMetal: 'neutral.700',
        _default: '#ffffff'
      },
      overlay: {
        modern: 'rgba(0,0,0,0.8)',
        lightModern: 'rgba(0,0,0,0.4)',  // NEW: Lighter overlay for better visibility
        industrialMetal: 'rgba(0,0,0,0.85)',
        _default: 'rgba(0,0,0,0.6)'
      },
      sidebar: {
        modern: '#1A1D29',
        lightModern: '#ffffff',  // NEW: Clean white sidebar
        industrialMetal: 'neutral.900',
        _default: '#ffffff'
      },
      card: {
        modern: '#1A202C',
        lightModern: '#ffffff',  // NEW: White cards with subtle borders
        industrialMetal: 'neutral.800',
        _default: '#ffffff'
      },
      input: {
        modern: '#2D3748',
        lightModern: '#f7fafc',  // NEW: Light gray input backgrounds
        industrialMetal: 'neutral.850',
        _default: '#ffffff'
      },
      kanbanColumn: {
        modern: '#1A202C',
        lightModern: '#f8fafc',  // NEW: Very light background for kanban columns
        industrialMetal: 'neutral.800',
        _default: '#f7fafc'
      }
    },
    
    // Text colors
    text: {
      primary: {
        modern: '#EDF2F7',
        lightModern: '#1a202c',  // NEW: Dark text for light backgrounds
        industrialMetal: 'neutral.100',
        _default: '#1a202c'
      },
      secondary: {
        modern: '#A0AEC0',
        lightModern: '#4a5568',  // NEW: Medium gray for secondary text
        industrialMetal: 'neutral.200',
        _default: '#4a5568'
      },
      muted: {
        modern: '#718096',
        lightModern: '#718096',  // NEW: Same muted gray works well in light theme
        industrialMetal: 'neutral.300',
        _default: '#718096'
      },
      onAccent: {
        modern: '#ffffff',
        lightModern: '#ffffff',  // NEW: White text on colored backgrounds
        industrialMetal: '#ffffff',
        _default: '#ffffff'
      },
      link: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Slightly darker blue for better contrast
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      error: {
        modern: '#fc8181',
        lightModern: '#e53e3e',  // NEW: Darker red for better visibility
        industrialMetal: 'semanticRed.400',
        _default: '#e53e3e'
      },
      success: {
        modern: '#68d391',
        lightModern: '#38a169',  // NEW: Darker green for better contrast
        industrialMetal: '#68d391',
        _default: '#38a169'
      },
      warning: {
        modern: '#fbb32f',
        lightModern: '#d69e2e',  // NEW: Darker orange for better visibility
        industrialMetal: 'accentHazard.400',
        _default: '#d69e2e'
      },
      accent: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Accent color with good contrast
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      inverse: {
        modern: '#1a202c',
        lightModern: '#ffffff',  // NEW: White text for inverse situations
        industrialMetal: 'neutral.900',
        _default: '#ffffff'
      }
    },
    
    // Border colors
    border: {
      default: {
        modern: '#2D3748',
        lightModern: '#e2e8f0',  // NEW: Light gray borders
        industrialMetal: 'neutral.700',
        _default: '#e2e8f0'
      },
      subtle: {
        modern: '#4A5568',
        lightModern: '#edf2f7',  // NEW: Very subtle borders
        industrialMetal: 'neutral.800',
        _default: '#edf2f7'
      },
      emphasis: {
        modern: '#4A5568',
        lightModern: '#cbd5e0',  // NEW: More prominent borders when needed
        industrialMetal: 'neutral.600',
        _default: '#cbd5e0'
      },
      accent: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Accent color borders
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      input: {
        modern: '#4A5568',
        lightModern: '#e2e8f0',  // NEW: Clean input borders
        industrialMetal: 'neutral.600',
        _default: '#e2e8f0'
      },
      focus: {
        modern: '#667eea',
        lightModern: '#5a67d8',  // NEW: Focus state borders
        industrialMetal: 'primary.400',
        _default: '#667eea'
      },
      error: {
        modern: '#fc8181',
        lightModern: '#e53e3e',  // NEW: Error state borders
        industrialMetal: 'semanticRed.400',
        _default: '#e53e3e'
      },
      divider: {
        modern: '#2A2D3A',
        lightModern: '#f1f5f9',  // NEW: Very subtle dividers
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
          lightModern: '#5a67d8',  // NEW: Primary button color
          industrialMetal: 'primary.500',
          _default: '#667eea'
        },
        primaryHover: {
          modern: '#5a6acc',
          lightModern: '#4c51bf',  // NEW: Primary button hover
          industrialMetal: 'primary.600',
          _default: '#5a6acc'
        },
        secondary: {
          modern: '#2A2D3A',
          lightModern: '#f7fafc',  // NEW: Light secondary buttons
          industrialMetal: 'neutral.700',
          _default: '#edf2f7'
        },
        secondaryHover: {
          modern: '#4A5568',
          lightModern: '#edf2f7',  // NEW: Secondary button hover
          industrialMetal: 'neutral.600',
          _default: '#e2e8f0'
        },
        ghost: {
          modern: 'transparent',
          lightModern: 'transparent',  // NEW: Transparent ghost buttons
          industrialMetal: 'transparent',
          _default: 'transparent'
        },
        ghostHover: {
          modern: '#2D3748',
          lightModern: '#f7fafc',  // NEW: Light ghost button hover
          industrialMetal: 'neutral.700',
          _default: '#f7fafc'
        }
      },
      table: {
        header: {
          modern: '#2A2D3A',
          lightModern: '#f8fafc',  // FIXED: Light background for table headers
          industrialMetal: 'neutral.800',
          _default: '#f7fafc'
        },
        row: {
          modern: '#1A202C',
          lightModern: '#ffffff',  // NEW: White table rows
          industrialMetal: 'neutral.850',
          _default: '#ffffff'
        },
        rowHover: {
          modern: '#2D3748',
          lightModern: '#f8fafc',  // NEW: Subtle row hover
          industrialMetal: 'neutral.700',
          _default: '#f7fafc'
        },
        border: {
          modern: '#2D3748',
          lightModern: '#e2e8f0',  // NEW: Light table borders
          industrialMetal: 'neutral.700',
          _default: '#e2e8f0'
        }
      },
      modal: {
        background: {
          modern: '#1A202C',
          lightModern: '#ffffff',  // NEW: White modal backgrounds
          industrialMetal: 'neutral.800',
          _default: '#ffffff'
        },
        header: {
          modern: '#2D3748',
          lightModern: '#f8fafc',  // NEW: Light modal headers
          industrialMetal: 'neutral.700',
          _default: '#f7fafc'
        },
        overlay: {
          modern: 'rgba(0,0,0,0.8)',
          lightModern: 'rgba(0,0,0,0.4)',  // NEW: Lighter modal overlay
          industrialMetal: 'rgba(0,0,0,0.85)',
          _default: 'rgba(0,0,0,0.6)'
        }
      },
      sidebar: {
        background: {
          modern: 'linear-gradient(180deg, #1A1D29 0%, #2D3748 100%)',
          lightModern: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',  // NEW: Light gradient sidebar
          industrialMetal: 'neutral.900',
          _default: '#ffffff'
        },
        item: {
          modern: 'transparent',
          lightModern: 'transparent',  // NEW: Transparent sidebar items
          industrialMetal: 'transparent',
          _default: 'transparent'
        },
        itemActive: {
          modern: '#667eea',
          lightModern: '#5a67d8',  // NEW: Active sidebar item color
          industrialMetal: 'primary.600',
          _default: '#667eea'
        },
        itemHover: {
          modern: '#2D3748',
          lightModern: '#f1f5f9',  // NEW: Light sidebar item hover
          industrialMetal: 'primary.700',
          _default: '#f7fafc'
        },
        text: {
          modern: '#A0AEC0',
          lightModern: '#64748b',  // NEW: Readable sidebar text
          industrialMetal: 'neutral.200',
          _default: '#4a5568'
        },
        textActive: {
          modern: '#ffffff',
          lightModern: '#ffffff',  // NEW: White text for active items
          industrialMetal: '#ffffff',
          _default: '#ffffff'
        }
      },
      kanban: {
        column: {
          modern: '#1A202C',
          lightModern: '#f8fafc',  // NEW: Light kanban columns
          industrialMetal: 'neutral.800',
          _default: '#f7fafc'
        },
        card: {
          modern: '#2D3748',
          lightModern: '#ffffff',  // NEW: White kanban cards
          industrialMetal: 'neutral.700',
          _default: '#ffffff'
        },
        cardHover: {
          modern: '#4A5568',
          lightModern: '#f1f5f9',  // NEW: Light card hover
          industrialMetal: 'neutral.600',
          _default: '#f7fafc'
        },
        cardBorder: {
          modern: '#4A5568',
          lightModern: '#e2e8f0',  // NEW: Light card borders
          industrialMetal: 'neutral.600',
          _default: '#e2e8f0'
        }
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