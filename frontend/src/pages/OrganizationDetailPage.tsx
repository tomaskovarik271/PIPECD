import React, { useEffect, useState } from 'react';
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
  Icon,
  Input,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon, EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore'; // Assuming Organization type is exported
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors'; // NEW: Use semantic tokens
import { StickerBoard } from '../components/common/StickerBoard';

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const toast = useToast();
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Inline editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isEditingIndustry, setIsEditingIndustry] = useState(false);
  const [newIndustry, setNewIndustry] = useState('');
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');

  const fetchOrganizationById = useOrganizationsStore((state) => state.fetchOrganizationById); // Assuming this exists or will be added
  const updateOrganization = useOrganizationsStore((state) => state.updateOrganization);
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

  // Update handlers for inline editing
  const handleNameUpdate = async () => {
    if (!currentOrganization || !organizationId) return;
    try {
      await updateOrganization(organizationId, { name: newName });
      toast({ title: 'Name Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingName(false);
      fetchOrganizationById(organizationId);
    } catch (e) {
      toast({ title: 'Error Updating Name', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleIndustryUpdate = async () => {
    if (!currentOrganization || !organizationId) return;
    try {
      await updateOrganization(organizationId, { industry: newIndustry } as any);
      toast({ title: 'Industry Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingIndustry(false);
      fetchOrganizationById(organizationId);
    } catch (e) {
      toast({ title: 'Error Updating Industry', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleWebsiteUpdate = async () => {
    if (!currentOrganization || !organizationId) return;
    try {
      await updateOrganization(organizationId, { website: newWebsite } as any);
      toast({ title: 'Website Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingWebsite(false);
      fetchOrganizationById(organizationId);
    } catch (e) {
      toast({ title: 'Error Updating Website', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

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
                {/* Name Field */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={colors.text.muted}>Name</Text>
                  {!isEditingName ? (
                    <HStack spacing={2}>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium" 
                        color={colors.text.secondary}
                      >
                        {currentOrganization.name}
                      </Text>
                      <IconButton 
                        icon={<EditIcon />} 
                        size="xs" 
                        variant="ghost" 
                        aria-label="Edit Name" 
                        onClick={() => {
                          setIsEditingName(true);
                          setNewName(currentOrganization.name || '');
                        }}
                        color={colors.text.muted}
                        _hover={{color: colors.text.link}}
                      />
                    </HStack>
                  ) : (
                    <HStack spacing={2} flex={1} justifyContent="flex-end">
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="Enter organization name" 
                        size="sm" 
                        w="300px"
                        bg={colors.bg.input}
                        borderColor={colors.border.default}
                        _hover={{borderColor: colors.border.emphasis}}
                        _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                      />
                      <IconButton 
                        icon={<CheckIcon />} 
                        size="xs" 
                        colorScheme="green" 
                        aria-label="Save Name" 
                        onClick={handleNameUpdate}
                      />
                      <IconButton 
                        icon={<SmallCloseIcon />} 
                        size="xs" 
                        variant="ghost" 
                        colorScheme="red" 
                        aria-label="Cancel Edit Name" 
                        onClick={() => setIsEditingName(false)}
                      />
                    </HStack>
                  )}
                </HStack>

                {/* Industry Field */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={colors.text.muted}>Industry</Text>
                  {!isEditingIndustry ? (
                    <HStack spacing={2}>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium" 
                        color={colors.text.secondary}
                      >
                        {(currentOrganization as any).industry || '-'}
                      </Text>
                      <IconButton 
                        icon={<EditIcon />} 
                        size="xs" 
                        variant="ghost" 
                        aria-label="Edit Industry" 
                        onClick={() => {
                          setIsEditingIndustry(true);
                          setNewIndustry((currentOrganization as any).industry || '');
                        }}
                        color={colors.text.muted}
                        _hover={{color: colors.text.link}}
                      />
                    </HStack>
                  ) : (
                    <HStack spacing={2} flex={1} justifyContent="flex-end">
                      <Input 
                        value={newIndustry} 
                        onChange={(e) => setNewIndustry(e.target.value)} 
                        placeholder="Enter industry" 
                        size="sm" 
                        w="250px"
                        bg={colors.bg.input}
                        borderColor={colors.border.default}
                        _hover={{borderColor: colors.border.emphasis}}
                        _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                      />
                      <IconButton 
                        icon={<CheckIcon />} 
                        size="xs" 
                        colorScheme="green" 
                        aria-label="Save Industry" 
                        onClick={handleIndustryUpdate}
                      />
                      <IconButton 
                        icon={<SmallCloseIcon />} 
                        size="xs" 
                        variant="ghost" 
                        colorScheme="red" 
                        aria-label="Cancel Edit Industry" 
                        onClick={() => setIsEditingIndustry(false)}
                      />
                    </HStack>
                  )}
                </HStack>

                {/* Website Field */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={colors.text.muted}>Website</Text>
                  {!isEditingWebsite ? (
                    <HStack spacing={2}>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium" 
                        color={colors.text.link}
                      >
                        {(currentOrganization as any).website || '-'}
                      </Text>
                      <IconButton 
                        icon={<EditIcon />} 
                        size="xs" 
                        variant="ghost" 
                        aria-label="Edit Website" 
                        onClick={() => {
                          setIsEditingWebsite(true);
                          setNewWebsite((currentOrganization as any).website || '');
                        }}
                        color={colors.text.muted}
                        _hover={{color: colors.text.link}}
                      />
                    </HStack>
                  ) : (
                    <HStack spacing={2} flex={1} justifyContent="flex-end">
                      <Input 
                        type="url"
                        value={newWebsite} 
                        onChange={(e) => setNewWebsite(e.target.value)} 
                        placeholder="Enter website URL" 
                        size="sm" 
                        w="300px"
                        bg={colors.bg.input}
                        borderColor={colors.border.default}
                        _hover={{borderColor: colors.border.emphasis}}
                        _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                      />
                      <IconButton 
                        icon={<CheckIcon />} 
                        size="xs" 
                        colorScheme="green" 
                        aria-label="Save Website" 
                        onClick={handleWebsiteUpdate}
                      />
                      <IconButton 
                        icon={<SmallCloseIcon />} 
                        size="xs" 
                        variant="ghost" 
                        colorScheme="red" 
                        aria-label="Cancel Edit Website" 
                        onClick={() => setIsEditingWebsite(false)}
                      />
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Box>
            {/* More cards for related deals, people, etc. can be added here */}

            {/* Smart Stickers Section - Full Width */}
            <Box 
              bg={colors.bg.elevated}
              p={6} 
              borderRadius="xl" 
              borderWidth="1px" 
              borderColor={colors.border.default}
            >
              <Heading 
                size="md" 
                mb={5} 
                color={colors.text.primary}
              >
                📝 Smart Stickers
              </Heading>
              <StickerBoard 
                entityType="ORGANIZATION"
                entityId={currentOrganization.id}
              />
            </Box>
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