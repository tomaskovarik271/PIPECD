import { useTheme } from '@chakra-ui/react'
import { useThemeStore } from '../stores/useThemeStore'
import { getSemanticTokenValue } from '../theme/semanticTokens'

/**
 * Hook that provides semantic color tokens for the current theme
 * Eliminates the need for manual theme checking and hardcoded colors
 * 
 * @example
 * const colors = useThemeColors()
 * 
 * // Instead of:
 * const isModernTheme = currentTheme === 'modern'
 * bg={isModernTheme ? "gray.800" : "white"}
 * 
 * // Use:
 * bg={colors.bg.surface}
 */
export const useThemeColors = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme)
  const theme = useTheme()
  
  // Helper function to get semantic token value for current theme
  const getColor = (tokenPath: string): string => {
    return getSemanticTokenValue(tokenPath, currentTheme)
  }
  
  return {
    // Background colors
    bg: {
      app: getColor('background.app'),
      content: getColor('background.content'),
      surface: getColor('background.surface'),
      elevated: getColor('background.elevated'),
      overlay: getColor('background.overlay'),
      sidebar: getColor('background.sidebar'),
      card: getColor('background.card'),
      input: getColor('background.input'),
      kanbanColumn: getColor('background.kanbanColumn'),
    },
    
    // Text colors
    text: {
      primary: getColor('text.primary'),
      secondary: getColor('text.secondary'),
      muted: getColor('text.muted'),
      onAccent: getColor('text.onAccent'),
      link: getColor('text.link'),
      error: getColor('text.error'),
      success: getColor('text.success'),
      warning: getColor('text.warning'),
      accent: getColor('text.accent'),
      inverse: getColor('text.inverse'),
    },
    
    // Border colors
    border: {
      default: getColor('border.default'),
      subtle: getColor('border.subtle'),
      emphasis: getColor('border.emphasis'),
      accent: getColor('border.accent'),
      input: getColor('border.input'),
      focus: getColor('border.focus'),
      error: getColor('border.error'),
      divider: getColor('border.divider'),
    },
    
    // Interactive colors
    interactive: {
      default: getColor('interactive.default'),
      hover: getColor('interactive.hover'),
      active: getColor('interactive.active'),
      disabled: getColor('interactive.disabled'),
      focus: getColor('interactive.focus'),
    },
    
    // Status colors
    status: {
      success: getColor('status.success'),
      warning: getColor('status.warning'),
      error: getColor('status.error'),
      info: getColor('status.info'),
    },
    
    // Component-specific colors
    component: {
      button: {
        primary: getColor('component.button.primary'),
        primaryHover: getColor('component.button.primaryHover'),
        secondary: getColor('component.button.secondary'),
        secondaryHover: getColor('component.button.secondaryHover'),
        ghost: getColor('component.button.ghost'),
        ghostHover: getColor('component.button.ghostHover'),
      },
      table: {
        header: getColor('component.table.header'),
        row: getColor('component.table.row'),
        rowHover: getColor('component.table.rowHover'),
        border: getColor('component.table.border'),
      },
      modal: {
        background: getColor('component.modal.background'),
        header: getColor('component.modal.header'),
        overlay: getColor('component.modal.overlay'),
      },
      sidebar: {
        background: getColor('component.sidebar.background'),
        item: getColor('component.sidebar.item'),
        itemActive: getColor('component.sidebar.itemActive'),
        itemHover: getColor('component.sidebar.itemHover'),
        text: getColor('component.sidebar.text'),
        textActive: getColor('component.sidebar.textActive'),
      },
      kanban: {
        column: getColor('component.kanban.column'),
        card: getColor('component.kanban.card'),
        cardHover: getColor('component.kanban.cardHover'),
        cardBorder: getColor('component.kanban.cardBorder'),
      },
    },
  }
}

/**
 * Simplified hook for just getting a semantic color value
 * 
 * @example
 * const getColor = useSemanticColor()
 * const bgColor = getColor('background.surface')
 * const textColor = getColor('text.primary')
 */
export const useSemanticColor = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme)
  
  return (tokenPath: string): string => {
    return getSemanticTokenValue(tokenPath, currentTheme)
  }
}

/**
 * Hook that provides theme-aware styles for common patterns
 * 
 * @example
 * const styles = useThemeStyles()
 * 
 * <Box {...styles.card}>
 * <Input {...styles.input}>
 * <Button {...styles.button.primary}>
 */
export const useThemeStyles = () => {
  const colors = useThemeColors()
  
  return {
    // Common card styling
    card: {
      bg: colors.bg.surface,
      borderColor: colors.border.default,
      borderWidth: '1px',
      borderRadius: 'md',
      color: colors.text.primary,
    },
    
    // Common input styling
    input: {
      bg: colors.bg.input,
      borderColor: colors.border.input,
      color: colors.text.primary,
      _placeholder: {
        color: colors.text.muted,
      },
      _focus: {
        borderColor: colors.border.focus,
        boxShadow: `0 0 0 1px ${colors.border.focus}`,
      },
    },
    
    // Common modal styling
    modal: {
      content: {
        bg: colors.component.modal.background,
        color: colors.text.primary,
        borderColor: colors.border.default,
      },
      overlay: {
        bg: colors.component.modal.overlay,
      },
    },
    
    // Common table styling
    table: {
      header: {
        bg: colors.component.table.header,
        color: colors.text.secondary,
        borderColor: colors.component.table.border,
      },
      row: {
        bg: colors.component.table.row,
        color: colors.text.primary,
        borderColor: colors.component.table.border,
        _hover: {
          bg: colors.component.table.rowHover,
        },
      },
    },
    
    // Common button styling
    button: {
      primary: {
        bg: colors.component.button.primary,
        color: colors.text.onAccent,
        _hover: {
          bg: colors.component.button.primaryHover,
        },
      },
      secondary: {
        bg: colors.component.button.secondary,
        color: colors.text.primary,
        borderColor: colors.border.default,
        _hover: {
          bg: colors.component.button.secondaryHover,
        },
      },
      ghost: {
        bg: colors.component.button.ghost,
        color: colors.text.primary,
        _hover: {
          bg: colors.component.button.ghostHover,
        },
      },
    },
  }
} 