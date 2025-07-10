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
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon, EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { useThemeStore } from '../stores/useThemeStore';
import { useAppStore } from '../stores/useAppStore';
import { StickerBoard } from '../components/common/StickerBoard';
import OrganizationPeoplePanel from '../components/organizations/OrganizationPeoplePanel';
import { format, parseISO } from 'date-fns';

// Component imports
import AccountManagerAssignmentModal from '../components/admin/AccountManagerAssignmentModal';
import { CustomFieldRenderer } from '../components/common/CustomFieldRenderer';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import type { CustomFieldEntityType, CustomFieldType } from '../generated/graphql/graphql';

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

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const toast = useToast();
  
  // Theme colors and styling
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  
  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      default:
        return 'transparent'; // No accent for modern themes
    }
  };

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

  const fetchOrganizationById = useOrganizationsStore((state) => state.fetchOrganizationById);
  const updateOrganization = useOrganizationsStore((state) => state.updateOrganization);
  const currentOrganization = useOrganizationsStore((state) => state.currentOrganization);
  const isLoadingOrganization = useOrganizationsStore((state) => state.isLoadingSingleOrganization);
  const organizationError = useOrganizationsStore((state) => state.errorSingleOrganization);
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Check if user can edit organizations - using memoization for performance
  const canEditOrganization = useMemo(() => {
    if (!userPermissions) return false;
    return userPermissions.includes('organization:update_any');
  }, [userPermissions]);

  useEffect(() => {
    if (organizationId && fetchOrganizationById) {
      fetchOrganizationById(organizationId);
    }
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

  // Loading state
  if (isLoadingOrganization) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="full">
          <Spinner size="xl" color={colors.interactive.default} />
        </Center>
      </Box>
    );
  }

  // Error state
  if (organizationError) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="100vh" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
          <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
          <Text color={colors.text.secondary} fontSize="lg">Error loading organization.</Text>
          <Text color={colors.text.muted} fontSize="sm" mb={4}>
            {typeof organizationError === 'string' ? organizationError : JSON.stringify(organizationError)}
          </Text>
          <Button as={RouterLink} to="/organizations" mt={6} {...styles.button.primary}>Back to Organizations</Button>
        </Center>
      </Box>
    );
  }

  // Organization not found
  if (!currentOrganization) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="100vh" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
          <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
          <Text color={colors.text.secondary} fontSize="lg">Organization not found.</Text>
          <Button as={RouterLink} to="/organizations" mt={6} {...styles.button.primary}>Back to Organizations</Button>
        </Center>
      </Box>
    );
  }

  return (
    <Box 
      bg={colors.bg.app}
      minH="100vh" 
      h="100vh" 
      overflow="hidden" 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box 
        bg={colors.bg.surface}
        maxW="90vw" 
        w="full" 
        h="full"  
        maxH="calc(100% - 0px)" 
        borderRadius="xl" 
        borderWidth="1px"
        borderColor={colors.border.default}
        overflow="hidden" 
      >
        <Flex h="full" direction={{base: "column", lg: "row"}} w="100%" maxW="100%">
          {/* Main Content (Left Column) */}
          <Box 
            flex="1"
            minW="0"
            w={{base: "100%", lg: "calc(100vw - 450px - 20rem)"}}
            maxW={{base: "100%", lg: "calc(100vw - 450px - 20rem)"}}
            p={{base: 4, md: 8}} 
        overflowY="auto"
            overflowX="hidden"
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}
          >
            <VStack spacing={6} align="stretch" maxW="100%" w="100%">
              {/* Header Section */}
              <Box>
              <Breadcrumb 
                spacing="8px" 
                  separator={<Text color={colors.text.muted}>/</Text>}
                  color={colors.text.muted}
                fontSize="sm"
                  mb={4}
              >
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={RouterLink} 
                    to="/organizations" 
                      color={colors.text.link}
                    _hover={{textDecoration: 'underline'}}
                  >
                    Organizations
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink 
                    href="#" 
                      color={colors.text.secondary}
                    _hover={{textDecoration: 'none', cursor: 'default'}}
                  >
                    {currentOrganization.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading 
                size="xl" 
                  color={colors.text.primary}
              >
                {currentOrganization.name}
              </Heading>
            </Box>

              {/* Tabs Section */}
            <Box 
                bg={colors.component.kanban.column} 
              borderRadius="xl" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder} 
                minH="400px" 
                w="100%" 
                maxW="100%"
                boxShadow="steelPlate"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              >
                <Tabs variant="line" colorScheme="blue" size="md" isFitted>
                  <TabList borderBottomColor={colors.border.default}>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      Organization Details
                    </Tab>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      <HStack spacing={2}>
                        <Text>People</Text>
                                                 <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="xs">
                           {currentOrganization.people?.length || 0}
                         </Badge>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      <HStack spacing={2}>
                        <Text>Custom Fields</Text>
                        <Badge colorScheme="purple" variant="solid" borderRadius="full" fontSize="xs">
                          {organizationCustomFieldDefinitions.length}
                        </Badge>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      <HStack spacing={2}>
                        <Text>Notes</Text>
                        <Badge colorScheme="yellow" variant="solid" borderRadius="full" fontSize="xs">
                          0
                        </Badge>
                      </HStack>
                    </Tab>
                  </TabList>
                  
                  <TabPanels p={{base: 3, md: 4}} minH="350px" w="100%" maxW="100%">
                    {/* Organization Details Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <VStack spacing={6} align="stretch">
              <Heading 
                size="md" 
                            color={colors.text.primary}
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
                        aria-label="Save Name" 
                        onClick={handleNameUpdate}
                      />
                      <IconButton 
                        icon={<SmallCloseIcon />} 
                        size="xs" 
                        variant="ghost" 
                                    aria-label="Cancel Edit" 
                        onClick={() => setIsEditingName(false)}
                                    color={colors.text.muted}
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
                        </VStack>
                      </Box>
                    </TabPanel>

                    {/* People Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <OrganizationPeoplePanel
                          organizationId={currentOrganization.id}
                          organizationName={currentOrganization.name}
                        />
            </Box>
                    </TabPanel>

                    {/* Custom Fields Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <VStack spacing={6} align="stretch">
                <Heading 
                  size="md" 
                  color={colors.text.primary}
                >
                  Custom Information
                </Heading>
                          {organizationCustomFieldDefinitions.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                  {organizationCustomFieldDefinitions.map((definition) => {
                    const customFieldValue = currentOrganization.customFieldValues?.find(
                      (cfv) => cfv.definition?.fieldName === definition.fieldName
                    );

                                         let displayValue = '-';
                     if (customFieldValue) {
                       if (definition.fieldType === 'TEXT' || definition.fieldType === 'TEXT_AREA') {
                         displayValue = customFieldValue.stringValue || '-';
                       } else if (definition.fieldType === 'NUMBER') {
                         displayValue = customFieldValue.numberValue?.toString() || '-';
                       } else if (definition.fieldType === 'BOOLEAN') {
                         displayValue = customFieldValue.booleanValue ? 'Yes' : 'No';
                       } else if (definition.fieldType === 'DATE') {
                         displayValue = customFieldValue.dateValue || '-';
                       } else if (definition.fieldType === 'DROPDOWN' || definition.fieldType === 'MULTI_SELECT') {
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
                                      maxW="300px"
                                      wordBreak="break-word"
                                      textAlign="right"
                        >
                          {displayValue}
                        </Text>
                      </HStack>
                    );
                  })}
                        </VStack>
                          ) : (
                            <Text color={colors.text.muted} textAlign="center" py={8}>
                              No custom fields defined for organizations.
                            </Text>
                          )}
                        </VStack>
            </Box>
                    </TabPanel>

                    {/* Notes/Stickers Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <VStack spacing={4} align="stretch">
              <Heading 
                size="md" 
                color={colors.text.primary}
              >
                            Notes & Stickers
              </Heading>
                          <Box>
              <StickerBoard 
                entityType="ORGANIZATION"
                entityId={currentOrganization.id}
              />
            </Box>
          </VStack>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Sidebar - Key Information */}
          <Box 
            bg={colors.component.kanban.column}
            p={{base: 4, md: 6}} 
            borderLeftWidth={{base: 0, lg: "1px"}} 
            borderTopWidth={{base: "1px", lg: 0}}
            borderColor={colors.component.kanban.cardBorder}
            overflowY="auto"
            w="450px"
            minW="450px"
            maxW="450px"
            flexShrink={0}
            boxShadow="steelPlate"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '2px',
              height: '100%',
              background: currentThemeName === 'industrialMetal' 
                ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)'
                : 'none',
              pointerEvents: 'none',
            }}
            sx={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}
          >
            <VStack spacing={6} align="stretch">
              {/* Key Information Section */}
              <Box 
                p={5} 
                bg={colors.component.kanban.card} 
                borderRadius="lg" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder}
                boxShadow="metallic"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              >
                <Heading size="sm" mb={4} color={colors.text.primary}>Organization Summary</Heading>
                <VStack spacing={4} align="stretch">
                  {/* Name */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Name</Text>
                    <Text fontSize="md" fontWeight="semibold" color={colors.text.primary}>
                      {currentOrganization.name}
                    </Text>
                  </HStack>

                  {/* Account Manager */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Account Manager</Text>
                    <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                      {currentOrganization.accountManager?.display_name || 'Not assigned'}
                    </Text>
                  </HStack>

                                     {/* People Count */}
                   <HStack justifyContent="space-between" alignItems="center">
                     <Text fontSize="sm" color={colors.text.secondary}>People</Text>
                     <Badge colorScheme="blue" variant="solid" borderRadius="full">
                       {currentOrganization.people?.length || 0}
                     </Badge>
                   </HStack>

                  {/* Custom Fields Count */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Custom Fields</Text>
                    <Badge colorScheme="purple" variant="solid" borderRadius="full">
                      {organizationCustomFieldDefinitions.length}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Timestamps Section */}
              <Box 
                p={5} 
                bg={colors.component.kanban.card} 
                borderRadius="lg" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder}
                boxShadow="metallic"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              >
                <Heading size="sm" mb={4} color={colors.text.primary}>Activity</Heading>
                <VStack spacing={4} align="stretch">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.muted}>Created</Text>
                    <Text 
                      fontSize="sm" 
                      color={colors.text.secondary}
                    >
                      {formatDate(currentOrganization.created_at)}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.muted}>Updated</Text>
                    <Text 
                      fontSize="sm" 
                      color={colors.text.secondary}
                    >
                      {formatDate(currentOrganization.updated_at)}
               </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Flex>
             </Box>

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
  );
};

export default OrganizationDetailPage; 