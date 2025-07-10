import { useBreakpointValue } from '@chakra-ui/react';
import { detailPageLayouts, responsiveSpacing, sidebarConfig } from '../theme/responsiveBreakpoints';

export interface ResponsiveLayoutConfig {
  hasRightSidebar?: boolean;
  hasTabs?: boolean;
  containerType?: 'full' | 'contained' | 'centered';
}

/**
 * Modern responsive layout hook that replaces fixed viewport calculations
 * with flexible, mobile-first design patterns
 */
export const useResponsiveLayout = (config: ResponsiveLayoutConfig = {}) => {
  const {
    hasRightSidebar = false,
    hasTabs = false,
    containerType = 'full'
  } = config;

  // Responsive container patterns
  const containerStyles = useBreakpointValue({
    base: {
      width: '100%',
      maxWidth: '100vw',
      padding: responsiveSpacing.containerPadding.base,
      margin: 0
    },
    md: {
      width: '100%',
      maxWidth: containerType === 'centered' ? '1200px' : '100vw',
      padding: responsiveSpacing.containerPadding.md,
      margin: containerType === 'centered' ? '0 auto' : 0
    },
    lg: {
      width: '100%',
      maxWidth: containerType === 'centered' ? '1400px' : '100vw',
      padding: responsiveSpacing.containerPadding.lg,
      margin: containerType === 'centered' ? '0 auto' : 0
    }
  });

  // Main content area (replaces the problematic calc() approach)
  const mainContentStyles = useBreakpointValue({
    base: {
      // Mobile: Full width stack
      width: '100%',
      minHeight: hasTabs ? 'calc(100vh - 180px)' : 'calc(100vh - 120px)'
    },
    md: {
      // Tablet: Still full width but with proper spacing
      width: '100%',
      minHeight: hasTabs ? 'calc(100vh - 200px)' : 'calc(100vh - 140px)'
    },
    lg: {
      // Desktop: Let grid control width
      width: '100%', // Removed calc() - let grid handle it
      minHeight: hasTabs ? 'calc(100vh - 220px)' : 'calc(100vh - 160px)',
      overflow: 'hidden' // Prevent overflow
    }
  });

  // Right sidebar responsive behavior
  const rightSidebarStyles = useBreakpointValue({
    base: {
      // Mobile: Hidden or overlay
      display: 'none'
    },
    md: {
      // Tablet: Collapsible or bottom section
      display: hasRightSidebar ? 'block' : 'none',
      width: '100%',
      position: 'relative' as const
    },
    lg: {
      // Desktop: Flexible width controlled by grid
      display: hasRightSidebar ? 'block' : 'none',
      width: '100%', // Let grid control the width
      position: 'relative' as const
    }
  });

  // Grid layout for detail pages (replaces manual calculations)
  const detailPageGridStyles = useBreakpointValue({
    base: {
      // Mobile: Single column stack
      display: 'flex',
      flexDirection: 'column' as const,
      gap: responsiveSpacing.sectionGap.base,
      width: '100%'
    },
    md: {
      // Tablet: Still stacked but with better spacing
      display: 'flex',
      flexDirection: 'column' as const,
      gap: responsiveSpacing.sectionGap.md,
      width: '100%'
    },
    lg: {
      // Desktop: Two-column grid when sidebar exists
      display: hasRightSidebar ? 'grid' : 'flex',
      gridTemplateColumns: hasRightSidebar ? '2fr 1fr' : undefined, // Changed from 1fr 450px
      flexDirection: hasRightSidebar ? undefined : 'column' as const,
      gap: responsiveSpacing.sectionGap.lg,
      width: '100%',
      alignItems: 'flex-start'
    },
    xl: {
      // Large screens: Better proportions
      display: hasRightSidebar ? 'grid' : 'flex',
      gridTemplateColumns: hasRightSidebar ? '3fr 1fr' : undefined, // Even more content space
      flexDirection: hasRightSidebar ? undefined : 'column' as const,
      gap: responsiveSpacing.sectionGap.lg,
      width: '100%',
      alignItems: 'flex-start'
    }
  });

  // Email panel grid (fixes the 1fr 2fr issue)
  const emailPanelGridStyles = useBreakpointValue({
    base: {
      // Mobile: Stack vertically
      display: 'flex',
      flexDirection: 'column' as const,
      height: '70vh',
      gap: 2
    },
    md: {
      // Tablet: Fixed thread list width
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      height: '75vh',
      gap: 4
    },
    lg: {
      // Desktop: Your beautiful 1:2 ratio
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      height: '80vh',
      gap: 6
    },
    xl: {
      // Large desktop: Even wider thread list
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      height: '80vh',
      gap: 6
    }
  });

  // Modal sizing based on screen size  
  const getModalSize = (baseSize: string) => {
    return useBreakpointValue({
      base: baseSize === '6xl' || baseSize === '5xl' || baseSize === '4xl' ? 'full' : 
            baseSize === '3xl' || baseSize === '2xl' ? 'xl' : baseSize,
      sm: baseSize === '6xl' || baseSize === '5xl' ? 'xl' : 
          baseSize === '4xl' ? 'lg' : baseSize,
      md: baseSize === '6xl' ? '4xl' : 
          baseSize === '5xl' ? '3xl' : baseSize,
      lg: baseSize,
      xl: baseSize,
      '2xl': baseSize
    });
  };

  // Navigation responsive behavior
  const navigationStyles = useBreakpointValue({
    base: {
      // Mobile: Overlay navigation
      sidebarBehavior: 'overlay',
      showMobileMenu: true,
      headerHeight: '60px'
    },
    md: {
      // Tablet: Collapsible sidebar
      sidebarBehavior: 'collapsible',
      showMobileMenu: false,
      headerHeight: '70px'
    },
    lg: {
      // Desktop: Fixed sidebar
      sidebarBehavior: 'fixed',
      showMobileMenu: false,
      headerHeight: '80px'
    }
  });

  return {
    // Layout styles
    containerStyles,
    mainContentStyles,
    rightSidebarStyles,
    detailPageGridStyles,
    emailPanelGridStyles,
    navigationStyles,
    
    // Utility functions
    getModalSize,
    
    // Responsive values for common patterns
    cardPadding: responsiveSpacing.cardPadding,
    sectionGap: responsiveSpacing.sectionGap,
    
    // Breakpoint utilities
    isMobile: useBreakpointValue({ base: true, md: false }),
    isTablet: useBreakpointValue({ base: false, md: true, lg: false }),
    isDesktop: useBreakpointValue({ base: false, lg: true }),
    
    // Layout patterns
    stackOnMobile: (desktopColumns: string) => useBreakpointValue({
      base: { display: 'flex', flexDirection: 'column', gap: 4 },
      lg: { display: 'grid', gridTemplateColumns: desktopColumns, gap: 6 }
    })
  };
}; 