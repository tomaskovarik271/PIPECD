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
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore'; // Assuming Organization type is exported

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  const fetchOrganizationById = useOrganizationsStore((state) => state.fetchOrganizationById); // Assuming this exists or will be added
  const currentOrganization = useOrganizationsStore((state) => state.currentOrganization); // Assuming this exists or will be added
  const isLoadingOrganization = useOrganizationsStore((state) => state.isLoadingSingleOrganization); // Assuming this exists or will be added
  const organizationError = useOrganizationsStore((state) => state.errorSingleOrganization); // Assuming this exists or will be added

  useEffect(() => {
    if (organizationId && fetchOrganizationById) {
      fetchOrganizationById(organizationId);
    }
    // Optional: Clear currentOrganization on unmount
    // return () => useOrganizationsStore.setState({ currentOrganization: null, errorSingleOrganization: null });
  }, [organizationId, fetchOrganizationById]);

  if (!isModernTheme) {
    // Basic non-modern theme fallback
    return (
      <Box p={5} maxW="lg" mx="auto">
        <HStack mb={4}>
          <IconButton as={RouterLink} to="/organizations" aria-label="Back to Organizations" icon={<ArrowBackIcon />} />
          <Heading size="lg">Organization Details</Heading>
        </HStack>
        {isLoadingOrganization && <Center><Spinner /></Center>}
        {organizationError && <Alert status="error"><AlertIcon />{typeof organizationError === 'string' ? organizationError : JSON.stringify(organizationError)}</Alert>}
        {currentOrganization && (
          <VStack align="start" spacing={3}>
            <Text><strong>Name:</strong> {currentOrganization.name}</Text>
            {/* Add more fields like address, website, etc. as needed */}
          </VStack>
        )}
        {!currentOrganization && !isLoadingOrganization && !organizationError && <Text>Organization not found.</Text>}
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
        {isLoadingOrganization && (
          <Center h="full"><Spinner size="xl" color="blue.400"/></Center>
        )}
        {organizationError && (
          <Alert status="error" variant="subtle" borderRadius="lg" bg="red.900" color="white" mt={4}>
            <AlertIcon color="red.300"/>
            <AlertTitle>Error Loading Organization!</AlertTitle>
            <AlertDescription>{typeof organizationError === 'string' ? organizationError : JSON.stringify(organizationError)}</AlertDescription>
          </Alert>
        )}
        {!isLoadingOrganization && !organizationError && currentOrganization && (
          <VStack spacing={6} align="stretch">
            {/* Header: Breadcrumbs, Title */}
            <Box pb={4} borderBottomWidth="1px" borderColor="gray.700" mb={2}>
              <Breadcrumb spacing="8px" separator={<Text color="gray.400">/</Text>} color="gray.400" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink as={RouterLink} to="/organizations" color="blue.400" _hover={{textDecoration: 'underline'}}>
                    Organizations
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href="#" color="gray.200" _hover={{textDecoration: 'none', cursor: 'default'}}>
                    {currentOrganization.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading size="xl" color="white" mt={2}>{currentOrganization.name}</Heading>
            </Box>

            {/* Organization Details Card */}
            <Box bg="gray.700" p={6} borderRadius="xl" border="1px solid" borderColor="gray.600">
              <Heading size="md" mb={5} color="white">Organization Information</Heading>
              <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Name</Text>
                  <Text fontSize="md" fontWeight="medium" color="gray.200">{currentOrganization.name}</Text>
                </HStack>
                {/* Add more fields like address, website, industry etc. */}
                 <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Industry</Text>
                  <Text fontSize="md" fontWeight="medium" color="gray.200">{(currentOrganization as any).industry || '-'}</Text> {/* Example, cast if not in type */}
                </HStack>
                 <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.400">Website</Text>
                  <Text fontSize="md" fontWeight="medium" color="blue.300">{(currentOrganization as any).website || '-'}</Text> {/* Example */}
                </HStack>
              </VStack>
            </Box>
            {/* More cards for related deals, people, etc. can be added here */}
          </VStack>
        )}
        {!currentOrganization && !isLoadingOrganization && !organizationError && (
           <Center h="full" flexDirection="column" bg="gray.750" borderRadius="xl" p={6}>
             <Icon as={WarningIcon} w={8} h={8} color="yellow.400" mb={4} />
             <Text color="gray.300" fontSize="lg">Organization not found.</Text>
             <IconButton as={RouterLink} to="/organizations" aria-label="Back to Organizations" icon={<ArrowBackIcon />} mt={6} colorScheme="blue"/>
           </Center>
        )}
      </Box>
    </Box>
  );
};

export default OrganizationDetailPage; 