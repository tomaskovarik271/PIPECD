/**
 * Utility functions for managing page headers and content positioning
 */

import { useThemeColors } from '../hooks/useThemeColors';

interface HeaderDimensions {
  height: string;
  paddingTop: string;
  paddingX: string;
}

export const getHeaderDimensions = (hasStatistics: boolean = false): HeaderDimensions => {
  const baseHeight = hasStatistics ? '200px' : '80px'; // Further increased height for statistics
  return {
    height: baseHeight,
    paddingTop: `calc(${baseHeight} + 40px)`, // Add even more spacing
    paddingX: '32px'
  };
};

export const usePageLayoutStyles = (hasStatistics: boolean = false) => {
  const colors = useThemeColors();
  const dimensions = getHeaderDimensions(hasStatistics);
  
  return {
    container: {
      pt: dimensions.paddingTop,
      px: dimensions.paddingX,
      pb: 6,
      bg: colors.bg.app,
      color: colors.text.primary,
      minH: '100vh',
    },
    content: {
      bg: colors.bg.surface,
      borderRadius: 'xl',
      borderWidth: '1px',
      borderColor: colors.border.default,
      p: 6,
    }
  };
}; 