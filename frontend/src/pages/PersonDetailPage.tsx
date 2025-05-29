import React, { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
  Icon
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon } from '@chakra-ui/icons';
import { useThemeStore } from '../stores/useThemeStore';
import { usePeopleStore, Person } from '../stores/usePeopleStore'; // Assuming Person type is exported
import {
  EmailIcon,
  PhoneIcon,
  InfoOutlineIcon, // For Notes
  TimeIcon, // For created_at/updated_at
  LinkIcon // For related items
} from '@chakra-ui/icons';
// import { Organization } from '../stores/useOrganizationsStore'; // Type can be inferred or imported if specific props needed
import { Deal } from '../stores/useDealsStore'; 
import { Activity } from '../stores/useActivitiesStore'; 
import { format, parseISO } from 'date-fns';
// import { getLinkDisplayDetails } from '../utils/getLinkDisplayDetails'; // Removed for now

// Helper to format dates
const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'PPPppp');
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
};

const PersonDetailPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  const fetchPersonById = usePeopleStore((state) => state.fetchPersonById);
  const currentPerson = usePeopleStore((state) => state.currentPerson);
  const isLoadingPerson = usePeopleStore((state) => state.isLoadingSinglePerson); // Corrected state name
  const personError = usePeopleStore((state) => state.errorSinglePerson); // Corrected state name

  useEffect(() => {
    if (personId && fetchPersonById) {
      fetchPersonById(personId);
    }
    // Optional: Clear currentPerson on unmount if desired
    // return () => usePeopleStore.setState({ currentPerson: null, errorSinglePerson: null });
  }, [personId, fetchPersonById]);

  if (!isModernTheme) {
    // Basic non-modern theme fallback
    return (
      <Box p={5} maxW="lg" mx="auto">
        <HStack mb={4}>
          <IconButton as={RouterLink} to="/people" aria-label="Back to People" icon={<ArrowBackIcon />} />
          <Heading size="lg">Person Details</Heading>
        </HStack>
        {isLoadingPerson && <Center><Spinner /></Center>}
        {personError && <Alert status="error"><AlertIcon />{typeof personError === 'string' ? personError : JSON.stringify(personError)}</Alert>}
        {currentPerson && (
          <VStack align="start" spacing={3}>
            <Text><strong>Name:</strong> {currentPerson.first_name} {currentPerson.last_name}</Text>
            <Text><strong>Email:</strong> {currentPerson.email || 'N/A'}</Text>
            <Text><strong>Phone:</strong> {currentPerson.phone || 'N/A'}</Text>
            {/* Add more fields as needed */}
          </VStack>
        )}
        {!currentPerson && !isLoadingPerson && !personError && <Text>Person not found.</Text>}
      </Box>
    );
  }

  // Modern Theme Layout
  return (
    <Box 
      h="calc(100vh - 40px)" 
      maxH="calc(100vh - 40px)"
      m={0} 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4} 
    >
      <Box 
        bg="gray.800" 
        maxW="90vw" 
        w="full" 
        h="full"  
        maxH="calc(100% - 0px)" 
        borderRadius="xl" 
        overflowY="auto"
        p={{base: 4, md: 8}}
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '8px' },
            '&::-webkit-scrollbar-track': { background: 'gray.750' },
        }}
      >
        {isLoadingPerson && (
          <Center h="full"><Spinner size="xl" color="blue.400"/></Center>
        )}
        {personError && (
          <Alert status="error" variant="subtle" borderRadius="lg" bg="red.900" color="white" mt={4}>
            <AlertIcon color="red.300"/>
            <AlertTitle>Error Loading Person!</AlertTitle>
            <AlertDescription>{typeof personError === 'string' ? personError : JSON.stringify(personError)}</AlertDescription>
          </Alert>
        )}
        {!isLoadingPerson && !personError && currentPerson && (
          <VStack spacing={6} align="stretch">
            {/* Header: Breadcrumbs, Title */}
            <Box pb={4} borderBottomWidth="1px" borderColor="gray.700" mb={2}>
              <Breadcrumb spacing="8px" separator={<Text color="gray.400">/</Text>} color="gray.400" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink as={RouterLink} to="/people" color="blue.400" _hover={{textDecoration: 'underline'}}>
                    People
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href="#" color="gray.200" _hover={{textDecoration: 'none', cursor: 'default'}}>
                    {currentPerson.first_name} {currentPerson.last_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading size="xl" color="white" mt={2}>{currentPerson.first_name} {currentPerson.last_name}</Heading>
            </Box>

            {/* Person Details Card */}
            <Box bg="gray.700" p={6} borderRadius="xl" border="1px solid" borderColor="gray.600">
              <Heading size="md" mb={5} color="white">Contact Information</Heading>
              <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Full Name</Text>
                  <Text fontSize="md" fontWeight="medium" color="gray.200">{currentPerson.first_name} {currentPerson.last_name}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Email</Text>
                  <Text fontSize="md" fontWeight="medium" color="blue.300">{currentPerson.email || '-'}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Phone</Text>
                  <Text fontSize="md" fontWeight="medium" color="gray.200">{currentPerson.phone || '-'}</Text>
                </HStack>
                {/* Add more fields: Address, Company, etc. as available and needed */}
              </VStack>
            </Box>
            {/* We can add more cards here, e.g., for Related Deals, Activities, etc. */}
          </VStack>
        )}
        {!currentPerson && !isLoadingPerson && !personError && (
           <Center h="full" flexDirection="column" bg="gray.750" borderRadius="xl" p={6}>
             <Icon as={WarningIcon} w={8} h={8} color="yellow.400" mb={4} />
             <Text color="gray.300" fontSize="lg">Person not found.</Text>
             <IconButton as={RouterLink} to="/people" aria-label="Back to People" icon={<ArrowBackIcon />} mt={6} colorScheme="blue"/>
           </Center>
        )}
      </Box>
    </Box>
  );
};

export default PersonDetailPage; 