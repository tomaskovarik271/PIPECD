import { VStack, Link as ChakraLink, Text, Box, Button } from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
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

  return (
    <VStack 
      as="nav" 
      spacing={2} 
      align="stretch" 
      w="200px" // Fixed width for now
      bg="gray.50" 
      p={4}
      borderRightWidth="1px"
      borderColor="gray.200"
      minH="100vh" // Make sidebar full height
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>PipeCD</Text>
      
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
              fontWeight={isActive ? 'bold' : 'normal'}
              bg={isActive ? 'teal.100' : 'transparent'}
              color={isActive ? 'teal.800' : 'gray.700'}
              _hover={{
                textDecoration: 'none',
                // Apply hover bg only if not active
                bg: isActive ? 'teal.100' : 'gray.100', 
              }}
              // Remove sx prop and className attempts
            >
              <Box as="span" mr={3}>{item.icon}</Box>
              {item.label}
            </ChakraLink>
          )}
        </RouterNavLink>
      ))}

      {/* Spacer to push sign out down? Or place it logically */}
      <Box flexGrow={1}></Box> 

      {/* Sign Out Button */}
      <Button 
          variant="ghost" // Use ghost to match link hover, but provide button padding/semantics
          colorScheme="gray" // Neutral color
          onClick={handleSignOutAction}
          width="100%" 
          justifyContent="flex-start" // Align text left
          mt={4} // Add some margin top
        >
         {/* TODO: Add sign out icon */}
          Sign Out
      </Button>
    </VStack>
  );
}

export default Sidebar; 