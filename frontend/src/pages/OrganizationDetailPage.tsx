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
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore'; // Assuming Organization type is exported
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors'; // NEW: Use semantic tokens

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

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

  // NEW: Single unified layout that works with all themes
  return (
    <Box 
      h="calc(100vh - 40px)" 
      maxH="calc(100vh - 40px)"
      m={0} 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      bg={colors.bg.app} // NEW: Semantic token
    >
      <Box 
        bg={colors.bg.surface} // NEW: Semantic token
        maxW="90vw" 
        w="full" 
        h="full"  
        maxH="calc(100% - 0px)" 
        borderRadius="xl" 
        borderWidth="1px"
        borderColor={colors.border.default} // NEW: Semantic token
        overflowY="auto"
        p={{base: 4, md: 8}}
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: colors.border.subtle, borderRadius: '8px' }, // NEW: Semantic token
            '&::-webkit-scrollbar-track': { background: colors.bg.input }, // NEW: Semantic token
        }}
      >
        {isLoadingOrganization && (
          <Center h="full">
            <Spinner 
              size="xl" 
              color={colors.interactive.default} // NEW: Semantic token
            />
          </Center>
        )}
        
        {organizationError && (
          <Alert 
            status="error" 
            variant="subtle" 
            borderRadius="lg" 
            bg={colors.status.error} // NEW: Semantic token
            color={colors.text.onAccent} // NEW: Semantic token
            mt={4}
          >
            <AlertIcon color={colors.text.onAccent} /> {/* NEW: Semantic token */}
            <AlertTitle>Error Loading Organization!</AlertTitle>
            <AlertDescription>
              {typeof organizationError === 'string' ? organizationError : JSON.stringify(organizationError)}
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoadingOrganization && !organizationError && currentOrganization && (
          <VStack spacing={6} align="stretch">
            {/* Header: Breadcrumbs, Title */}
            <Box 
              pb={4} 
              borderBottomWidth="1px" 
              borderColor={colors.border.default} // NEW: Semantic token
              mb={2}
            >
              <Breadcrumb 
                spacing="8px" 
                separator={<Text color={colors.text.muted}>/</Text>} // NEW: Semantic token
                color={colors.text.muted} // NEW: Semantic token
                fontSize="sm"
              >
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={RouterLink} 
                    to="/organizations" 
                    color={colors.text.link} // NEW: Semantic token
                    _hover={{textDecoration: 'underline'}}
                  >
                    Organizations
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink 
                    href="#" 
                    color={colors.text.secondary} // NEW: Semantic token
                    _hover={{textDecoration: 'none', cursor: 'default'}}
                  >
                    {currentOrganization.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading 
                size="xl" 
                color={colors.text.primary} // NEW: Semantic token
                mt={2}
              >
                {currentOrganization.name}
              </Heading>
            </Box>

            {/* Organization Details Card */}
            <Box 
              bg={colors.bg.elevated} // NEW: Semantic token
              p={6} 
              borderRadius="xl" 
              borderWidth="1px" 
              borderColor={colors.border.default} // NEW: Semantic token
            >
              <Heading 
                size="md" 
                mb={5} 
                color={colors.text.primary} // NEW: Semantic token
              >
                Organization Information
              </Heading>
              <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Name</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary} // NEW: Semantic token
                  >
                    {currentOrganization.name}
                  </Text>
                </HStack>
                {/* Add more fields like address, website, industry etc. */}
                 <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Industry</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary} // NEW: Semantic token
                  >
                    {(currentOrganization as any).industry || '-'}
                  </Text> {/* Example, cast if not in type */}
                </HStack>
                 <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Website</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.link} // NEW: Semantic token
                  >
                    {(currentOrganization as any).website || '-'}
                  </Text> {/* Example */}
                </HStack>
              </VStack>
            </Box>
            {/* More cards for related deals, people, etc. can be added here */}
          </VStack>
        )}
        
        {!currentOrganization && !isLoadingOrganization && !organizationError && (
           <Center h="full" flexDirection="column">
             <Box 
               bg={colors.bg.elevated} // NEW: Semantic token
               borderRadius="xl" 
               p={8}
               borderWidth="1px"
               borderColor={colors.border.default} // NEW: Semantic token
               textAlign="center"
             >
               <Icon 
                 as={WarningIcon} 
                 w={8} 
                 h={8} 
                 color={colors.status.warning} // NEW: Semantic token
                 mb={4} 
               />
               <Text color={colors.text.secondary} fontSize="lg" mb={6}> {/* NEW: Semantic token */}
                 Organization not found.
               </Text>
               <IconButton 
                 as={RouterLink} 
                 to="/organizations" 
                 aria-label="Back to Organizations" 
                 icon={<ArrowBackIcon />} 
                 {...styles.button.primary} // NEW: Theme-aware button styles
               />
             </Box>
           </Center>
        )}
      </Box>
    </Box>
  );
};

export default OrganizationDetailPage; 