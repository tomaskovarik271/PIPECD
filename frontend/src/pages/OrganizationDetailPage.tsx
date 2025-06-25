import React, { useEffect, useState, useMemo } from 'react';
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
import { useAppStore } from '../stores/useAppStore';
import { StickerBoard } from '../components/common/StickerBoard';

// Component imports
import AccountManagerAssignmentModal from '../components/admin/AccountManagerAssignmentModal';
import { CustomFieldRenderer } from '../components/common/CustomFieldRenderer';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import type { CustomFieldEntityType, CustomFieldType } from '../generated/graphql/graphql';

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const toast = useToast();
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Inline editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Account manager assignment modal state
  const [isAccountManagerModalOpen, setIsAccountManagerModalOpen] = useState(false);
  
  // Custom fields hook - use stable entity types array
  const organizationEntityTypes = useMemo(() => ['ORGANIZATION' as CustomFieldEntityType], []);
  const { getDefinitionsForEntity } = useOptimizedCustomFields({ 
    entityTypes: organizationEntityTypes 
  });
  
  // Get active organization custom field definitions
  const organizationCustomFieldDefinitions = React.useMemo(() => {
    return getDefinitionsForEntity('ORGANIZATION' as CustomFieldEntityType)
      .filter(def => def.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [getDefinitionsForEntity]);

  const fetchOrganizationById = useOrganizationsStore((state) => state.fetchOrganizationById); // Assuming this exists or will be added
  const updateOrganization = useOrganizationsStore((state) => state.updateOrganization);
  const currentOrganization = useOrganizationsStore((state) => state.currentOrganization); // Assuming this exists or will be added
  const isLoadingOrganization = useOrganizationsStore((state) => state.isLoadingSingleOrganization); // Assuming this exists or will be added
  const organizationError = useOrganizationsStore((state) => state.errorSingleOrganization); // Assuming this exists or will be added
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Check if user can edit organizations
  const canEditOrganization = userPermissions?.includes('organization:update_any');

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
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to update this organization.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: 'Error Updating Name', description: errorMessage, status: 'error', duration: 3000, isClosable: true });
      }
      setIsEditingName(false);
    }
  };

  // Industry and website update handlers removed - industry is now a custom field

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
                        isDisabled={!canEditOrganization}
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

                {/* Account Manager Field */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={colors.text.muted}>Account Manager</Text>
                    <HStack spacing={2}>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium" 
                      color={colors.text.secondary}
                    >
                      {currentOrganization.accountManager?.display_name || 'Not assigned'}
                      </Text>
                      <IconButton 
                        icon={<EditIcon />} 
                        size="xs" 
                        variant="ghost" 
                      aria-label="Assign Account Manager" 
                      onClick={() => setIsAccountManagerModalOpen(true)}
                        color={colors.text.muted}
                        _hover={{color: colors.text.link}}
                        isDisabled={!canEditOrganization}
                      />
                    </HStack>
                </HStack>
              </VStack>
            </Box>

            {/* Custom Fields Panel */}
            {organizationCustomFieldDefinitions.length > 0 && (
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
                  Custom Information
                </Heading>
                        <VStack spacing={4} align="stretch">
                  {organizationCustomFieldDefinitions.map((definition) => {
                    const customFieldValue = currentOrganization.customFieldValues?.find(
                      (cfv) => cfv.definition?.fieldName === definition.fieldName
                    );

                                         let displayValue = '-';
                     if (customFieldValue) {
                       if (definition.fieldType === CustomFieldType.Text || definition.fieldType === CustomFieldType.TextArea) {
                         displayValue = customFieldValue.stringValue || '-';
                       } else if (definition.fieldType === CustomFieldType.Number) {
                         displayValue = customFieldValue.numberValue?.toString() || '-';
                       } else if (definition.fieldType === CustomFieldType.Boolean) {
                         displayValue = customFieldValue.booleanValue ? 'Yes' : 'No';
                       } else if (definition.fieldType === CustomFieldType.Date) {
                         displayValue = customFieldValue.dateValue || '-';
                       } else if (definition.fieldType === CustomFieldType.Dropdown || definition.fieldType === CustomFieldType.MultiSelect) {
                         displayValue = customFieldValue.selectedOptionValues?.join(', ') || '-';
                       }
                     }

                    return (
                      <HStack key={definition.id} justifyContent="space-between" alignItems="center">
                        <Text fontSize="sm" color={colors.text.muted}>
                          {definition.fieldLabel}
                          </Text>
                        <Text 
                          fontSize="md" 
                          fontWeight="medium" 
                          color={colors.text.secondary}
                        >
                          {displayValue}
                        </Text>
                      </HStack>
                    );
                  })}
                        </VStack>
                </Box>
            )}

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

        {/* Account Manager Assignment Modal */}
          <AccountManagerAssignmentModal
            isOpen={isAccountManagerModalOpen}
          onClose={() => setIsAccountManagerModalOpen(false)}
          organization={currentOrganization ? {
              id: currentOrganization.id,
              name: currentOrganization.name,
            accountManager: currentOrganization.accountManager ? {
              id: currentOrganization.accountManager.id,
              display_name: currentOrganization.accountManager.display_name || currentOrganization.accountManager.email,
              email: currentOrganization.accountManager.email,
              avatar_url: currentOrganization.accountManager.avatar_url || undefined
            } : null
          } : null}
            onAssignmentComplete={() => {
            if (organizationId) {
              fetchOrganizationById(organizationId);
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default OrganizationDetailPage; 