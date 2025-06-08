import { useColorModeValue } from '@chakra-ui/react';

export const useLeadTheme = () => {
  // Warm color palette for leads (nurturing, growth-focused)
  const colors = {
    // Primary warm colors
    primary: useColorModeValue('#F59E0B', '#FCD34D'), // Amber
    accent: useColorModeValue('#D97706', '#F59E0B'),   // Darker amber
    success: useColorModeValue('#10B981', '#34D399'),  // Emerald (for qualified leads)
    
    // Background colors with warm tint
    bg: {
      primary: useColorModeValue('#FFFBEB', '#2A1A0F'),     // Warm white / Rich warm dark
      elevated: useColorModeValue('#FEF3C7', '#3D2817'),    // Warm elevated / Amber-tinted dark
      card: useColorModeValue('#FFFFFF', '#352014'),        // Warm card background / Darker amber
      hover: useColorModeValue('#FEF9E7', '#4A2E1A'),       // Warm hover state / Deep amber
    },
    
    // Text colors (maintaining readability)
    text: {
      primary: useColorModeValue('#1F2937', '#F9FAFB'),
      secondary: useColorModeValue('#6B7280', '#D1D5DB'),
      muted: useColorModeValue('#9CA3AF', '#9CA3AF'),
      accent: useColorModeValue('#D97706', '#FCD34D'),
    },
    
    // Border colors with warm tint
    border: {
      default: useColorModeValue('#F3E8D0', '#92400E'),     // Warm border / Amber border
      hover: useColorModeValue('#E5D4B1', '#B45309'),       // Hover amber border
      accent: useColorModeValue('#F59E0B', '#FCD34D'),      // Bright amber accent
    },
    
    // Status colors for leads
    status: {
      new: useColorModeValue('#F59E0B', '#FCD34D'),         // Amber for new leads
      contact: useColorModeValue('#3B82F6', '#60A5FA'),     // Blue for initial contact
      followUp: useColorModeValue('#8B5CF6', '#A78BFA'),    // Purple for follow up
      qualifying: useColorModeValue('#F59E0B', '#FBBF24'),  // Warm amber for qualifying
      qualified: useColorModeValue('#10B981', '#34D399'),   // Green for qualified
      converted: useColorModeValue('#059669', '#10B981'),   // Dark green for converted
      disqualified: useColorModeValue('#DC2626', '#F87171'), // Red for disqualified
      nurturing: useColorModeValue('#6366F1', '#818CF8'),   // Indigo for nurturing
    },
    
    // Metric card colors
    metrics: {
      totalValue: useColorModeValue('#F59E0B', '#FCD34D'),
      avgScore: useColorModeValue('#10B981', '#34D399'),
      qualificationRate: useColorModeValue('#8B5CF6', '#A78BFA'),
      unqualified: useColorModeValue('#DC2626', '#F87171'),
    }
  };

  return { colors };
}; 