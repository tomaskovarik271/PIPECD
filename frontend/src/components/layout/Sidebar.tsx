import { VStack, Link as ChakraLink, Text, Box, Button, Flex, useStyleConfig, SystemStyleObject, Image, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { 
  InfoOutlineIcon,     // People (Represents contact info?)
  // BuildingIcon,      // Organizations (From chakra-icons-lib, need install? Let's use AtSignIcon for now)
  AtSignIcon,        // Organizations (Placeholder)
  CheckCircleIcon,   // Deals (Represents closing deal?)
  CalendarIcon,      // Activities (Represents scheduling?)
  ArrowRightIcon,    // Pipelines (Represents flow?)
  ViewIcon, // Added ViewIcon for Project Board
  // StarIcon, // Placeholder for People
  // LockIcon, // Placeholder for Organizations
  // CopyIcon, // Placeholder for Pipelines
  // TimeIcon, // Placeholder for Activities
  SettingsIcon, // Used for Profile and Admin items now
  HamburgerIcon, // For toggle
  ArrowBackIcon, // For toggle
  ArrowForwardIcon // For toggle
} from '@chakra-ui/icons'; // Use appropriate icons

// Comment out direct imports if moving logos to public directory
// import logoPositiveRoot from '../../assets/logos/logo-positive.svg'; 
// import logoNegativeRoot from '../../assets/logos/logo-negative.svg';

// Use string paths assuming logos are in `frontend/public/assets/logos/`
const logoPositive = '/assets/logos/logo-positive.svg';
const logoNegative = '/assets/logos/logo-negative.svg';

import { useThemeStore } from '../../stores/useThemeStore'; // To check current theme for logo
import { useMemo } from 'react'; // Added useMemo import

const NAV_ITEMS = [
  { path: '/deals', label: 'Deals', icon: <CheckCircleIcon /> },
  { path: '/people', label: 'People', icon: <InfoOutlineIcon /> },
  { path: '/organizations', label: 'Organizations', icon: <AtSignIcon /> },
  { path: '/activities', label: 'Activities', icon: <CalendarIcon /> },
  // { path: '/pipelines', label: 'Pipelines', icon: <ArrowRightIcon /> }, // Commented out as per existing code
];

// Added Admin Nav Items
const ADMIN_NAV_ITEMS = [
  { path: '/admin/custom-fields', label: 'Custom Fields', icon: <SettingsIcon /> },
  { path: '/admin/wfm', label: 'Workflow Management', icon: <SettingsIcon /> }, // Main WFM link
  { path: '/project-board', label: 'Project Board', icon: <ViewIcon /> }, // Added Project Board link
];

// User specific items (like profile) can be separate or at the end of NAV_ITEMS
const USER_NAV_ITEMS = [
    { path: '/profile', label: 'My Profile', icon: <SettingsIcon /> },
];

function Sidebar() {
  const handleSignOutAction = useAppStore((state) => state.handleSignOut);
  const userEmail = useAppStore((state) => state.session?.user?.email);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const styles = useStyleConfig("Sidebar", {}) as Record<string, SystemStyleObject>; 
  const currentThemeName = useThemeStore((state) => state.currentTheme);

  // Sidebar collapse state from store
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // Determine if modern theme is active
  const isModernTheme = currentThemeName === 'modern';

  const containerStyles = isModernTheme ? {
    bgGradient: 'linear(to-b, background.sidebar, background.sidebarEnd)',
    // color: 'rgba(255, 255, 255, 0.7)', // Base color for text, overridden below
    borderRightWidth: '0px', // No border in modern theme sidebar
  } : (styles?.container || {});

  const navLinkBaseStylesModern = {
    color: 'gray.300', // CHANGED from rgba(255, 255, 255, 0.7) for better contrast
    fontWeight: 'medium',
    transition: 'all 0.2s ease',
    borderRadius: '0', // No border radius on individual items for full-width effect
    pl: isSidebarCollapsed ? 0 : '32px',
    pr: isSidebarCollapsed ? 0 : '32px',
    py: isSidebarCollapsed ? '12px' : '16px',
    w: '100%',
    justifyContent: isSidebarCollapsed ? "center" : "flex-start",
    _hover: {
      color: 'text.light',
      bg: 'rgba(255, 255, 255, 0.1)',
      textDecoration: 'none',
    },
  };

  const activeNavLinkStylesModern = {
    ...navLinkBaseStylesModern,
    color: 'text.light', // Active link can be brighter
    bg: 'rgba(255, 255, 255, 0.15)',
    boxShadow: 'inset 4px 0 0 0 var(--chakra-colors-brand-primary)', // Using CSS var for brand.primary
  };
  
  const navLinkStyles = isModernTheme ? navLinkBaseStylesModern : (styles?.navLink || {});
  const activeNavLinkStyles = isModernTheme ? activeNavLinkStylesModern : (styles?.activeNavLink || {});

  // User Info text for modern theme
  const userEmailTextStylesModern = isModernTheme ? {
    color: 'gray.400', // CHANGED for email - better contrast
    _hover: { color: 'text.light' },
  } : (styles?.userInfoText || {});

  const signOutButtonStylesModern = isModernTheme ? {
    color: 'gray.300', // CHANGED for Sign Out - better contrast
    _hover: { color: 'text.light', textDecoration: 'underline' },
    justifyContent: "flex-start",
    fontWeight: "medium", // Match My Profile fontWeight
  } : (styles?.userInfoText || {});

  // Calculate the border color to apply, safely handling theme values
  const borderColorToApply = useMemo((): string | undefined => {
    if (isModernTheme) {
      return 'transparent';
    }
    // Handle non-modern theme case
    let colorFromTheme = containerStyles.borderColor;

    if (typeof colorFromTheme === 'number' || typeof colorFromTheme === 'boolean') {
      return 'gray.200';
    }

    if (colorFromTheme === 'transparent') {
      return 'gray.200';
    }

    // If colorFromTheme is an object (responsive styles) or a function, return undefined
    // to let Chakra handle it or fall back to defaults, as sx prop might have issues with complex types here.
    if (typeof colorFromTheme === 'object' || typeof colorFromTheme === 'function') {
        return undefined; 
    }

    // At this point, colorFromTheme should be a string (color name, hex) or undefined.
    return colorFromTheme as string | undefined;
  }, [isModernTheme, containerStyles.borderColor]);

  // For logo, modern theme uses a dark sidebar
  const isDarkBackgroundForLogo = isModernTheme || [
    'dark', 
    'bowie', 
    'industrialMetal', 
    'daliDark'
  ].includes(currentThemeName);
  
  const selectedLogo = isDarkBackgroundForLogo ? logoNegative : logoPositive;
  const selectedIconLogo = isDarkBackgroundForLogo ? '/assets/logos/logo-negative-icon.svg' : '/assets/logos/logo-positive-icon.svg';

  // Filter admin nav items based on permissions
  const visibleAdminNavItems = ADMIN_NAV_ITEMS.filter(item => {
    if (item.path === '/admin/custom-fields') {
      return userPermissions?.includes('custom_fields:manage_definitions');
    }
    return true; // Keep other admin items visible by default
  });

  const sidebarWidth = isSidebarCollapsed ? "70px" : "280px"; // Modern theme sidebar is wider when not collapsed

  return (
    <VStack 
      as="nav" 
      spacing={0} // Modern theme has no space between items
      align="stretch" 
      w={sidebarWidth}
      p={isModernTheme ? (isSidebarCollapsed ? '16px 0' : '32px 0') : (isSidebarCollapsed ? 2 : 4)} // Adjusted padding for modern
      height="100vh"
      className={`sidebar-container ${isModernTheme ? 'modern-sidebar' : ''}`}
      sx={containerStyles}
      transition="width 0.2s ease-in-out, padding 0.2s ease-in-out"
      position="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      overflowY="auto"
    >
      <Flex 
        direction="column" 
        alignItems={isSidebarCollapsed ? "center" : "stretch"}
        w="100%"
        flexGrow={1}
      >
        {/* Logo Section */}
        <Box 
          mb={isModernTheme ? '48px' : 4} 
          h={{base: isModernTheme ? "auto" : "30px"}} 
          display="flex" 
          alignItems="center" 
          justifyContent={isSidebarCollapsed ? "center" : "flex-start"} 
          w="100%"
          px={isModernTheme && !isSidebarCollapsed ? '32px' : (isSidebarCollapsed ? 0 : undefined)}
        >
          {isModernTheme && !isSidebarCollapsed && <Text color="white" fontSize="24px" fontWeight="extrabold">CreativeDock</Text>}
          {!isModernTheme && !isSidebarCollapsed && <Image src={selectedLogo} alt="Creative Dock Logo" maxH="30px" />}
          {isSidebarCollapsed && <Image src={selectedIconLogo} alt="CD" maxH="30px" />}
        </Box>
      
      {NAV_ITEMS.map((item) => (
        <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
          {({ isActive }) => (
              <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed || !isModernTheme }>
                <Flex
                  as="span"
                  display="flex"
                  alignItems="center"
                  p={isModernTheme ? undefined : (isSidebarCollapsed ? 2 : "8px 12px")}
                  borderRadius={isModernTheme ? '0' : "md"} // No border radius for modern items
                  sx={isActive ? activeNavLinkStyles : navLinkStyles} 
                  w="100%"
                >
                  <Box 
                    as="span" 
                    mr={isSidebarCollapsed ? 0 : (isModernTheme ? '16px' : 3)}
                  >
                    {item.icon}
                  </Box>
                  {!isSidebarCollapsed && item.label}
                </Flex>
              </Tooltip>
          )}
        </RouterNavLink>
      ))}

      {/* Admin Section */}
        <Box 
          mt={isModernTheme ? 4 : 4} 
          pt={isModernTheme ? 0 : 2} 
          borderTopWidth={isModernTheme ? '0' : '1px'} 
          sx={{ borderColor: borderColorToApply }} 
          w="100%"
        >
          {!isSidebarCollapsed && !isModernTheme && <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.500" sx={{ _dark: { color: "gray.400"} }}>ADMIN</Text>}
          {/* No ADMIN text title in modern theme mockup */}
          {visibleAdminNavItems.map((item) => (
            <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
            {({ isActive }) => (
                <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed || !isModernTheme }>
                <Flex
                  as="span"
                  display="flex"
                  alignItems="center"
                  p={isModernTheme ? undefined : (isSidebarCollapsed ? 2 : "8px 12px")}
                  borderRadius={isModernTheme ? '0' : "md"}
                  sx={isActive ? activeNavLinkStyles : navLinkStyles}
                  w="100%"
                >
                    <Box 
                      as="span" 
                      mr={isSidebarCollapsed ? 0 : (isModernTheme ? '16px' : 3)}
                    >
                      {item.icon}
                    </Box>
                    {!isSidebarCollapsed && item.label}
                </Flex>
                </Tooltip>
            )}
            </RouterNavLink>
        ))}
      </Box>

        {/* User Profile Link */}
      <Box mt={isModernTheme ? 'auto' : 0}> { /* Pushes to bottom in modern theme if it's the last group before toggle */}
      {USER_NAV_ITEMS.map((item) => (
        <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
          {({ isActive }) => (
            <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed || !isModernTheme }>
            <Flex
              as="span"
              display="flex"
              alignItems="center"
              p={isModernTheme ? undefined : (isSidebarCollapsed ? 2 : "8px 12px")}
              borderRadius={isModernTheme ? '0' : "md"}
              sx={isActive ? activeNavLinkStyles : navLinkStyles}
              w="100%"
            >
              <Box 
                as="span" 
                mr={isSidebarCollapsed ? 0 : (isModernTheme ? '16px' : 3)}
              >
                {item.icon}
              </Box>
              {!isSidebarCollapsed && item.label}
            </Flex>
            </Tooltip>
          )}
        </RouterNavLink>
      ))}
      </Box>

      {/* Toggle button and User Info / Sign Out */}
      <VStack 
        spacing={2} 
        align="stretch" 
        w="100%" 
        mt={isModernTheme ? 4 : 'auto'} // Modern theme: spacing before bottom items; Other themes: push to bottom
        pt={isModernTheme ? 0 : 2} 
        borderTopWidth={isModernTheme ? '0' : "1px"} 
        borderColor={borderColorToApply}
      >
        <Tooltip label={isSidebarCollapsed ? (isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar") : undefined} placement="right">
          <IconButton 
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            icon={isSidebarCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
            onClick={toggleSidebar}
            variant={isModernTheme ? "ghost" : "outline"}
            size="sm"
            alignSelf={isSidebarCollapsed ? "center" : "flex-end"}
            color={isModernTheme ? 'rgba(255,255,255,0.7)' : undefined}
            _hover={isModernTheme ? {color: 'white', bg:'rgba(255,255,255,0.1)'} : {}}
            mt={isModernTheme && isSidebarCollapsed ? 2 : 0}
            mb={isModernTheme && !isSidebarCollapsed ? '16px' : 0}
            mr={isModernTheme && !isSidebarCollapsed ? '16px' : 0} // align with padding
          />
        </Tooltip>

        {!isSidebarCollapsed && (
          <>
            <ThemeSwitcher />
            {userEmail && <Text fontSize="xs" sx={userEmailTextStylesModern} noOfLines={1} title={userEmail}>{userEmail}</Text>}
            <Button variant="link" size="sm" onClick={handleSignOutAction} sx={signOutButtonStylesModern}>
              Sign Out
            </Button>
          </>
        )}
        {isSidebarCollapsed && isModernTheme && <ThemeSwitcher />}
        {/* When collapsed & modern, sign out might be an icon button or omitted depending on design */} 
      </VStack>
      </Flex>
    </VStack>
  );
}

export default Sidebar; 