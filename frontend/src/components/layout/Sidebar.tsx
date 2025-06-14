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
  StarIcon, // Added for Leads
  // StarIcon, // Placeholder for People
  // LockIcon, // Placeholder for Organizations
  // CopyIcon, // Placeholder for Pipelines
  // TimeIcon, // Placeholder for Activities
  SettingsIcon, // Used for Profile and Admin items now
  HamburgerIcon, // For toggle
  ArrowBackIcon, // For toggle
  ArrowForwardIcon // For toggle
} from '@chakra-ui/icons'; // Use appropriate icons
import { FiCpu } from 'react-icons/fi'; // Import AI/robot icon
import { Network } from 'lucide-react'; // Import Network icon for Relationship Intelligence

// Comment out direct imports if moving logos to public directory
// import logoPositiveRoot from '../../assets/logos/logo-positive.svg'; 
// import logoNegativeRoot from '../../assets/logos/logo-negative.svg';

// Use string paths assuming logos are in `frontend/public/assets/logos/`
const logoPositive = '/assets/logos/logo-positive.svg';
const logoNegative = '/assets/logos/logo-negative.svg';

import { useThemeStore } from '../../stores/useThemeStore'; // To check current theme for logo
import { useMemo } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors'; // NEW: Use semantic tokens

const NAV_ITEMS = [
  { path: '/deals', label: 'Deals', icon: <CheckCircleIcon /> },
  { path: '/leads', label: 'Leads', icon: <StarIcon /> },
  { path: '/people', label: 'People', icon: <InfoOutlineIcon /> },
  { path: '/organizations', label: 'Organizations', icon: <AtSignIcon /> },
  { path: '/relationships', label: 'Relationship Intelligence', icon: <Network size={16} /> },
  { path: '/activities', label: 'Activities', icon: <CalendarIcon /> },
  { path: '/agent', label: 'AI Assistant', icon: <FiCpu size={16} /> },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin/custom-fields', label: 'Custom Fields', icon: <SettingsIcon />, permission: 'custom_fields:manage_definitions' },
  { path: '/admin/user-roles', label: 'User Roles', icon: <SettingsIcon />, permission: 'app_settings:manage' },
  // { path: '/admin/google-drive', label: 'Google Drive Settings', icon: <SettingsIcon />, permission: null }, // HIDDEN: Not using Google Drive yet
  { path: '/admin/wfm', label: 'Workflow Management', icon: <SettingsIcon />, permission: null }, // Allow any admin user to see WFM
];

const USER_NAV_ITEMS = [
    { path: '/profile', label: 'My Profile', icon: <SettingsIcon /> },
    { path: '/google-integration', label: 'Google Integration', icon: <SettingsIcon /> },
];

function Sidebar() {
  const handleSignOutAction = useAppStore((state) => state.handleSignOut);
  const userEmail = useAppStore((state) => state.session?.user?.email);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const currentThemeName = useThemeStore((state) => state.currentTheme);

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();

  // Sidebar collapse state from store
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // NEW: Simplified navigation link styles using semantic tokens
  const navLinkBaseStyles = {
    color: colors.component.sidebar.text,
    fontWeight: 'medium',
    transition: 'all 0.2s ease',
    borderRadius: '0',
    pl: isSidebarCollapsed ? 0 : '32px',
    pr: isSidebarCollapsed ? 0 : '32px',
    py: isSidebarCollapsed ? '12px' : '16px',
    w: '100%',
    justifyContent: isSidebarCollapsed ? "center" : "flex-start",
    _hover: {
      color: colors.component.sidebar.textActive,
      bg: colors.component.sidebar.itemHover,
      textDecoration: 'none',
    },
  };

  const activeNavLinkStyles = {
    ...navLinkBaseStyles,
    color: colors.component.sidebar.textActive,
    bg: colors.component.sidebar.itemActive,
    borderLeft: '3px solid',
    borderColor: colors.border.accent,
    _hover: {
      color: colors.component.sidebar.textActive,
      bg: colors.component.sidebar.itemActive,
      textDecoration: 'none',
    },
  };

  // For logo selection, determine if we need light or dark logo
  const isDarkBackgroundForLogo = ['modern', 'industrialMetal'].includes(currentThemeName);
  const selectedLogo = isDarkBackgroundForLogo ? logoNegative : logoPositive;

  // Check if user has any admin permissions
  const hasAdminPermissions = userPermissions?.some(permission => 
    permission.includes('admin') || 
    permission.includes('manage') || 
    permission.includes('custom_fields') ||
    permission.includes('wfm') ||
    permission.endsWith(':update_any') ||
    permission.endsWith(':delete_any') ||
    permission.endsWith(':create_any')
  ) || false;

  // Filter admin nav items based on permissions
  const visibleAdminNavItems = ADMIN_NAV_ITEMS.filter(item => {
    // Check if user has the required permission for this item
    if (item.permission) {
      return userPermissions?.includes(item.permission);
    }
    // For items without specific permissions, require general admin access
    return hasAdminPermissions;
  });

  const sidebarWidth = isSidebarCollapsed ? "70px" : "280px";

  return (
    <VStack 
      as="nav" 
      spacing={0}
      align="stretch" 
      w={sidebarWidth}
      p={0}
      height="100vh"
      bg={colors.component.sidebar.background} // NEW: Semantic token
      borderRightWidth="1px"
      borderColor={colors.border.default} // NEW: Semantic token
      transition="width 0.2s ease-in-out"
      position="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      overflowY="auto"
    >
      <Flex 
        direction="column" 
        alignItems="stretch"
        w="100%"
        h="100%"
      >
        {/* Logo Section */}
        <Box 
          py="32px"
          px={isSidebarCollapsed ? 0 : '32px'}
          borderBottomWidth="1px"
          borderColor={colors.border.default} // NEW: Semantic token
          display="flex" 
          alignItems="center" 
          justifyContent={isSidebarCollapsed ? "center" : "flex-start"} 
          w="100%"
        >
          {!isSidebarCollapsed && (
            <Image 
              src={selectedLogo} 
              alt="CreativeDock"
              maxH="40px"
              maxW="200px"
              objectFit="contain"
            />
          )}
          {isSidebarCollapsed && (
            <Image 
              src={selectedLogo} 
              alt="CD"
              maxH="30px"
              maxW="50px"
              objectFit="contain"
            />
          )}
        </Box>
      
        {/* Navigation Items */}
        <Box flex="1" py={4}>
          {NAV_ITEMS.map((item) => (
            <RouterNavLink key={item.path} to={item.path} end={true}> 
              {({ isActive }) => (
                  <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed}>
                    <Flex
                      as="span"
                      display="flex"
                      alignItems="center"
                      sx={isActive ? activeNavLinkStyles : navLinkBaseStyles} 
                      w="100%"
                    >
                      <Box 
                        as="span" 
                        mr={isSidebarCollapsed ? 0 : '16px'}
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
          {visibleAdminNavItems.length > 0 && (
            <Box 
              mt={6} 
              pt={6} 
              borderTopWidth="1px" 
              borderColor={colors.border.default} // NEW: Semantic token
            >
              {visibleAdminNavItems.map((item) => (
                <RouterNavLink key={item.path} to={item.path} end={true}> 
                {({ isActive }) => (
                    <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed}>
                    <Flex
                      as="span"
                      display="flex"
                      alignItems="center"
                      sx={isActive ? activeNavLinkStyles : navLinkBaseStyles}
                      w="100%"
                    >
                        <Box 
                          as="span" 
                          mr={isSidebarCollapsed ? 0 : '16px'}
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
          )}

          {/* User Profile Link */}
          {USER_NAV_ITEMS.map((item) => (
            <RouterNavLink key={item.path} to={item.path} end={true}> 
              {({ isActive }) => (
                <Tooltip label={isSidebarCollapsed ? item.label : undefined} placement="right" isDisabled={!isSidebarCollapsed}>
                <Flex
                  as="span"
                  display="flex"
                  alignItems="center"
                  sx={isActive ? activeNavLinkStyles : navLinkBaseStyles}
                  w="100%"
                >
                  <Box 
                    as="span" 
                    mr={isSidebarCollapsed ? 0 : '16px'}
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

        {/* Bottom Section - Toggle, Theme, User Info, Sign Out */}
        <Box 
          borderTopWidth="1px" 
          borderColor={colors.border.default} // NEW: Semantic token
          p={4}
        >
          {/* Toggle button */}
          <Flex justify={isSidebarCollapsed ? "center" : "flex-end"} mb={isSidebarCollapsed ? 0 : 4}>
            <Tooltip label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} placement="right" isDisabled={!isSidebarCollapsed}>
              <IconButton 
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                icon={isSidebarCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                onClick={toggleSidebar}
                variant="ghost"
                size="sm"
                color={colors.component.sidebar.text} // NEW: Semantic token
                _hover={{
                  color: colors.component.sidebar.textActive, // NEW: Semantic token
                  bg: colors.component.sidebar.itemHover // NEW: Semantic token
                }}
              />
            </Tooltip>
          </Flex>

          {!isSidebarCollapsed && (
            <VStack spacing={3} align="stretch">
              <ThemeSwitcher />
              {userEmail && (
                <Text 
                  color={colors.component.sidebar.text} // NEW: Semantic token
                  fontSize="sm"
                  textAlign="left"
                  px="32px"
                  py="8px"
                  _hover={{ color: colors.component.sidebar.textActive }} // NEW: Semantic token
                  noOfLines={1} 
                  title={userEmail}
                >
                  {userEmail}
                </Text>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOutAction}
                color={colors.component.sidebar.text} // NEW: Semantic token
                fontSize="sm"
                textAlign="left"
                px="32px"
                py="8px"
                w="100%"
                _hover={{ 
                  color: colors.component.sidebar.textActive, // NEW: Semantic token
                  bg: colors.component.sidebar.itemHover // NEW: Semantic token
                }}
                justifyContent="flex-start"
                fontWeight="medium"
                height="auto"
                minH="40px"
              >
                Sign Out
              </Button>
            </VStack>
          )}
          
          {isSidebarCollapsed && (
            <Flex justify="center">
              <ThemeSwitcher />
            </Flex>
          )}
        </Box>
      </Flex>
    </VStack>
  );
}

export default Sidebar; 