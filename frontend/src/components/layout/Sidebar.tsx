import { VStack, Link as ChakraLink, Text, Box, Button, Flex, useStyleConfig, SystemStyleObject, Image, useColorModeValue } from '@chakra-ui/react';
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
  // RepeatIcon // Example
} from '@chakra-ui/icons'; // Use appropriate icons

// Comment out direct imports if moving logos to public directory
// import logoPositiveRoot from '../../assets/logos/logo-positive.svg'; 
// import logoNegativeRoot from '../../assets/logos/logo-negative.svg';

// Use string paths assuming logos are in `frontend/public/assets/logos/`
const logoPositive = '/assets/logos/logo-positive.svg';
const logoNegative = '/assets/logos/logo-negative.svg';

import { useThemeStore } from '../../stores/useThemeStore'; // To check current theme for logo

const NAV_ITEMS = [
  { path: '/deals', label: 'Deals', icon: <CheckCircleIcon /> },
  { path: '/people', label: 'People', icon: <InfoOutlineIcon /> },
  { path: '/organizations', label: 'Organizations', icon: <AtSignIcon /> },
  { path: '/activities', label: 'Activities', icon: <CalendarIcon /> },
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

  const containerStyles = styles?.container || {};
  const headerTextStyles = styles?.headerText || {};
  const navLinkStyles = styles?.navLink || {};
  const activeNavLinkStyles = styles?.activeNavLink || {};
  const userInfoTextStyles = styles?.userInfoText || {};

  const isDarkTheme = [
    'dark', 
    'bowie', 
    'industrialMetal', 
    'creativeDockDarkTheme', // Ensure this matches your dark CD theme name if distinct in store
    'andyWarhol',
    'daliDark' // Add daliDark to this check if its sidebar is also dark for logo selection
  ].includes(currentThemeName);
  
  const selectedLogo = isDarkTheme ? logoNegative : logoPositive;

  // Filter admin nav items based on permissions
  const visibleAdminNavItems = ADMIN_NAV_ITEMS.filter(item => {
    if (item.path === '/admin/custom-fields') {
      return userPermissions?.includes('custom_fields:manage_definitions');
    }
    return true; // Keep other admin items visible by default
  });

  return (
    <VStack 
      as="nav" 
      spacing={2} 
      align="stretch" 
      w="200px" // Fixed width for now
      // bg="gray.50" // Removed hardcoded background, will be themed by global body or specific component style
      p={4}
      borderRightWidth="1px"
      // borderColor="gray.200" // Removed, will be themed
      minH="100vh" // Make sidebar full height
      className="sidebar-container" // Add a class for potential theme targeting
      // Apply themed styles to the container safely
      sx={containerStyles}
    >
      {/* Logo Section */}
      <Box mb={4} sx={headerTextStyles} h={{base: "30px"}} display="flex" alignItems="center"> 
        <Image src={selectedLogo} alt="Creative Dock Logo" maxH="30px" />
      </Box>
      
      {NAV_ITEMS.map((item) => (
        // Use NavLink for active state detection, pass function as children
        <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
          {({ isActive }) => (
            // Use Flex for styling, apply styles conditionally, avoid nesting <a>
            <Flex // CHANGED from ChakraLink
              as="span" // Render as span or div, not another <a>
              display="flex"
              alignItems="center"
              p="8px 12px"
              borderRadius="md"
              // REMOVED direct bg/color props
              // Rely solely on sx prop to apply the entire style object
              sx={isActive ? activeNavLinkStyles : navLinkStyles} 
              // Ensure navLinkStyles includes cursor: pointer if not already present
            >
              <Box as="span" mr={3}>{item.icon}</Box>
              {item.label}
            </Flex> // CHANGED from ChakraLink
          )}
        </RouterNavLink>
      ))}

      {/* Admin Section */}
      <Box mt={4} pt={2} borderTopWidth="1px" sx={{ borderColor: containerStyles.borderColor === "transparent" ? "gray.200" : containerStyles.borderColor }}>
        <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.500" sx={{ _dark: { color: "gray.400"} }}>ADMIN</Text>
        {visibleAdminNavItems.map((item) => (
            <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
            {({ isActive }) => (
                <Flex
                as="span"
                display="flex"
                alignItems="center"
                p="8px 12px"
                borderRadius="md"
                sx={isActive ? activeNavLinkStyles : navLinkStyles}
                >
                <Box as="span" mr={3}>{item.icon}</Box>
                {item.label}
                </Flex>
            )}
            </RouterNavLink>
        ))}
      </Box>

      {/* User Profile Link - moved here for better separation before user info block */}
      {USER_NAV_ITEMS.map((item) => (
        <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
          {({ isActive }) => (
            <Flex
              as="span"
              display="flex"
              alignItems="center"
              p="8px 12px"
              borderRadius="md"
              sx={isActive ? activeNavLinkStyles : navLinkStyles}
            >
              <Box as="span" mr={3}>{item.icon}</Box>
              {item.label}
            </Flex>
          )}
        </RouterNavLink>
      ))}

      {/* Conditionally render Dali inspiration image */}
      {currentThemeName === 'daliDark' && (
        <Box my={4} px={2} display="flex" justifyContent="center">
          <Image 
            src="/assets/images/dali-inspiration.png" 
            alt="Dali Inspiration" 
            borderRadius="md" 
            boxShadow="lg" // Add a subtle shadow, can be themed later
            maxW="150px" // Limit width
            objectFit="contain"
          />
        </Box>
      )}

      {/* Spacer to push sign out down? Or place it logically */}
      <Box flexGrow={1}></Box> 

      {/* Display Logged In User */}
      <Box borderTopWidth="1px" sx={{ borderColor: containerStyles.borderColor }} pt={4} mt={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Text fontSize="xs" sx={userInfoTextStyles}>Signed in as:</Text>
            <Text fontSize="sm" fontWeight="medium" noOfLines={1} title={userEmail}>
                {userEmail ?? 'Unknown User'}
            </Text>
          </Box>
          <ThemeSwitcher />
        </Flex>
      </Box>

      {/* Sign Out Button */}
      <Button 
          variant="ghost" // Use ghost to match link hover, but provide button padding/semantics
          // colorScheme="gray" // Let theme dictate ghost button colors
          onClick={handleSignOutAction}
          width="100%" 
          justifyContent="flex-start" // Align text left
          // mt={4} // Adjust margin as needed, maybe remove if Box provides enough spacing
        >
         {/* TODO: Add sign out icon */}
          Sign Out
      </Button>
    </VStack>
  );
}

export default Sidebar; 