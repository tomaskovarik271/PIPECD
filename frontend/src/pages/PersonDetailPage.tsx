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
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors'; // NEW: Use semantic tokens
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
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

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
        {isLoadingPerson && (
          <Center h="full">
            <Spinner 
              size="xl" 
              color={colors.interactive.default} // NEW: Semantic token
            />
          </Center>
        )}
        
        {personError && (
          <Alert 
            status="error" 
            variant="subtle" 
            borderRadius="lg" 
            bg={colors.status.error} // NEW: Semantic token
            color={colors.text.onAccent} // NEW: Semantic token
            mt={4}
          >
            <AlertIcon color={colors.text.onAccent} /> {/* NEW: Semantic token */}
            <AlertTitle>Error Loading Person!</AlertTitle>
            <AlertDescription>
              {typeof personError === 'string' ? personError : JSON.stringify(personError)}
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoadingPerson && !personError && currentPerson && (
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
                    to="/people" 
                    color={colors.text.link} // NEW: Semantic token
                    _hover={{textDecoration: 'underline'}}
                  >
                    People
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink 
                    href="#" 
                    color={colors.text.secondary} // NEW: Semantic token
                    _hover={{textDecoration: 'none', cursor: 'default'}}
                  >
                    {currentPerson.first_name} {currentPerson.last_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading 
                size="xl" 
                color={colors.text.primary} // NEW: Semantic token
                mt={2}
              >
                {currentPerson.first_name} {currentPerson.last_name}
              </Heading>
            </Box>

            {/* Person Details Card */}
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
                Contact Information
              </Heading>
              <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Full Name</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary} // NEW: Semantic token
                  >
                    {currentPerson.first_name} {currentPerson.last_name}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Email</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.link} // NEW: Semantic token
                  >
                    {currentPerson.email || '-'}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Phone</Text> {/* NEW: Semantic token */}
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary} // NEW: Semantic token
                  >
                    {currentPerson.phone || '-'}
                  </Text>
                </HStack>
                {/* Add more fields: Address, Company, etc. as available and needed */}
              </VStack>
            </Box>
            {/* We can add more cards here, e.g., for Related Deals, Activities, etc. */}
          </VStack>
        )}
        
        {!currentPerson && !isLoadingPerson && !personError && (
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
                 Person not found.
               </Text>
               <IconButton 
                 as={RouterLink} 
                 to="/people" 
                 aria-label="Back to People" 
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

export default PersonDetailPage; 