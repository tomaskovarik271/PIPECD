import { VStack, Link as ChakraLink, Text, Box, Button, Flex, useStyleConfig, SystemStyleObject } from '@chakra-ui/react';
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
  // ViewIcon, // Placeholder for Deals
  // StarIcon, // Placeholder for People
  // LockIcon, // Placeholder for Organizations
  // CopyIcon, // Placeholder for Pipelines
  // TimeIcon, // Placeholder for Activities
  // SettingsIcon, // Example
  // RepeatIcon // Example
} from '@chakra-ui/icons'; // Use appropriate icons

const NAV_ITEMS = [
  { path: '/deals', label: 'Deals', icon: <CheckCircleIcon /> },
  { path: '/people', label: 'People', icon: <InfoOutlineIcon /> },
  { path: '/organizations', label: 'Organizations', icon: <AtSignIcon /> },
  { path: '/pipelines', label: 'Pipelines', icon: <ArrowRightIcon /> },
  { path: '/activities', label: 'Activities', icon: <CalendarIcon /> },
  // Add other items like Settings if needed
];

function Sidebar() {
  const handleSignOutAction = useAppStore((state) => state.handleSignOut);
  const userEmail = useAppStore((state) => state.session?.user?.email);

  // Get styles from the theme. 
  // useStyleConfig returns SystemStyleObject | Record<string, SystemStyleObject>
  // We defined parts, so it should be Record<string, SystemStyleObject>
  const styles = useStyleConfig("Sidebar", {}) as Record<string, SystemStyleObject>; 

  // Safely access style parts
  const containerStyles = styles?.container || {};
  const headerTextStyles = styles?.headerText || {};
  const navLinkStyles = styles?.navLink || {};
  const activeNavLinkStyles = styles?.activeNavLink || {};
  const userInfoTextStyles = styles?.userInfoText || {};

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
      <Text fontSize="xl" fontWeight="bold" mb={4} sx={headerTextStyles}>PipeCD</Text>
      
      {NAV_ITEMS.map((item) => (
        // Use NavLink for active state detection, pass function as children
        <RouterNavLink key={item.path} to={item.path} end={item.path === '/'}> 
          {({ isActive }) => (
            // Use ChakraLink for styling, apply styles conditionally
            <ChakraLink
              display="flex"
              alignItems="center"
              p="8px 12px"
              borderRadius="md"
              // REMOVED direct bg/color props
              // Rely solely on sx prop to apply the entire style object
              sx={isActive ? activeNavLinkStyles : navLinkStyles} 
            >
              <Box as="span" mr={3}>{item.icon}</Box>
              {item.label}
            </ChakraLink>
          )}
        </RouterNavLink>
      ))}

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