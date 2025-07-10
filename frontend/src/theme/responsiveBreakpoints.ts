// PipeCD Responsive Breakpoint System
// Modern responsive design utilities for consistent layouts across all screen sizes

export const breakpoints = {
  // Mobile-first breakpoint system
  sm: '480px',   // Small phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};

// Responsive container system
export const containerSizes = {
  sm: '100%',
  md: '768px',
  lg: '1024px', 
  xl: '1200px',
  '2xl': '1400px'
};

// Detail page layout patterns
export const detailPageLayouts = {
  // Single column on mobile/tablet, two-column on desktop
  responsive: {
    base: '1fr',
    lg: '1fr 450px'  // Content + sidebar
  },
  
  // Adaptive email panel grid
  emailPanel: {
    base: '1fr',           // Stack on mobile
    md: '300px 1fr',       // Fixed thread list on tablet
    lg: '1fr 2fr',         // Your beautiful 1:2 ratio on desktop
    xl: '400px 1fr'        // Wider thread list on large screens
  },
  
  // Flexible modal sizing
  modalSizes: {
    xs: { base: 'full', md: 'sm' },
    sm: { base: 'full', md: 'md' },
    md: { base: 'full', md: 'lg' },
    lg: { base: 'full', md: 'xl', lg: '2xl' },
    xl: { base: 'full', md: '2xl', lg: '4xl' },
    '2xl': { base: 'full', md: '4xl', lg: '6xl' }
  }
};

// Responsive spacing system
export const responsiveSpacing = {
  containerPadding: {
    base: 4,
    md: 6,
    lg: 8
  },
  
  sectionGap: {
    base: 4,
    md: 6,
    lg: 8
  },
  
  cardPadding: {
    base: 4,
    md: 5,
    lg: 6
  }
};

// Sidebar responsive behavior
export const sidebarConfig = {
  widths: {
    collapsed: '70px',
    expanded: {
      base: '100%',      // Full width overlay on mobile
      md: '280px',       // Fixed width on tablet+
      lg: '320px'        // Wider on desktop
    }
  },
  
  breakBehavior: {
    mobile: 'overlay',     // Overlay on mobile
    tablet: 'push',       // Push content on tablet
    desktop: 'fixed'      // Fixed sidebar on desktop
  }
};

// Typography scaling
export const responsiveTypography = {
  heading: {
    base: { fontSize: 'lg', lineHeight: '1.2' },
    md: { fontSize: 'xl', lineHeight: '1.3' },
    lg: { fontSize: '2xl', lineHeight: '1.4' }
  },
  
  body: {
    base: { fontSize: 'sm', lineHeight: '1.5' },
    md: { fontSize: 'md', lineHeight: '1.6' },
    lg: { fontSize: 'md', lineHeight: '1.6' }
  },
  
  caption: {
    base: { fontSize: 'xs', lineHeight: '1.4' },
    md: { fontSize: 'sm', lineHeight: '1.5' }
  }
};

// Modern CSS Grid utilities
export const gridPatterns = {
  // Auto-fit columns with minimum width
  autoFitCards: (minWidth = '280px') => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
    gap: { base: 4, md: 6 }
  }),
  
  // Responsive table grid
  responsiveTable: {
    base: { gridTemplateColumns: '1fr' },
    md: { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }
  },
  
  // Detail page main layout
  detailPageGrid: {
    display: 'grid',
    gridTemplateColumns: detailPageLayouts.responsive,
    gap: { base: 4, lg: 6 },
    minHeight: '100vh'
  }
};

// Responsive utilities hook
export const useResponsiveValue = () => {
  return {
    containerPadding: responsiveSpacing.containerPadding,
    sectionGap: responsiveSpacing.sectionGap,
    cardPadding: responsiveSpacing.cardPadding,
    
    // Helper for responsive props
    responsive: (mobileValue: any, tabletValue: any, desktopValue: any) => ({
      base: mobileValue,
      md: tabletValue, 
      lg: desktopValue
    })
  };
}; 