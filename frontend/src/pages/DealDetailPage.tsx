import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Spinner, 
  Text, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  Flex,
  VStack, 
  Icon, 
  Button, 
  useToast, 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody,
  AlertDialog, 
  AlertDialogBody, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogOverlay,
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel, 
  Center,
  Avatar,
  HStack,
  Link,
  Heading,
  Tag,
  Badge,
  IconButton,
  Input,
  Progress,
  Select,
  Collapse,
} from '@chakra-ui/react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon, WarningIcon, InfoIcon, EmailIcon, CalendarIcon, EditIcon, CheckIcon, SmallCloseIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaClipboardList, FaPhone } from 'react-icons/fa';

// Store imports
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useActivitiesStore, Activity, ActivityType as GQLActivityType, GeneratedActivityFilterInput, GeneratedUpdateActivityInput } from '../stores/useActivitiesStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { useUserListStore } from '../stores/useUserListStore';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';

// Component imports
import CreateActivityForm from '../components/activities/CreateActivityForm';
import EditActivityForm from '../components/activities/EditActivityForm';
import EditDealModal from '../components/EditDealModal';
import { DealHeader } from '../components/deals/DealHeader';
import { DealOverviewCard } from '../components/deals/DealOverviewCard';
import { DealActivitiesPanel } from '../components/deals/DealActivitiesPanel';
import { DealCustomFieldsPanel } from '../components/deals/DealCustomFieldsPanel';
import { DealHistoryPanel } from '../components/deals/DealHistoryPanel';
import { DealOverviewPanel } from '../components/deals/DealOverviewPanel';
import { DealOrganizationContactsPanel } from '../components/deals/DealOrganizationContactsPanel';
import DealEmailsPanel from '../components/deals/DealEmailsPanel';
import DealDocumentsPanel from '../components/deals/DealDocumentsPanel';
import { SharedDriveDocumentBrowser } from '../components/deals/SharedDriveDocumentBrowser';
import { DealNotesPanel } from '../components/dealDetail/DealNotesPanel';
import { processCustomFieldsForSubmission } from '../lib/utils/customFieldProcessing';

// Type imports
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { 
  initializeCustomFieldValuesFromEntity, 
} from '../lib/utils/customFieldProcessing';

interface LinkDisplayDetails {
  isUrl: boolean;
  displayText: string;
  fullUrl?: string;
  isKnownService?: boolean;
  icon?: React.ElementType;
}

const getLinkDisplayDetails = (str: string | null | undefined): LinkDisplayDetails => {
  if (!str) return { isUrl: false, displayText: '-' };
  try {
    const url = new URL(str);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return { isUrl: false, displayText: str };
    }
    if (url.hostname.includes('docs.google.com')) {
      if (url.pathname.includes('/spreadsheets/')) return { isUrl: true, displayText: 'Google Sheet', fullUrl: str, isKnownService: true };
      if (url.pathname.includes('/document/')) return { isUrl: true, displayText: 'Google Doc', fullUrl: str, isKnownService: true };
      if (url.pathname.includes('/presentation/') || url.pathname.includes('/drawings/')) return { isUrl: true, displayText: 'Google Slides/Drawing', fullUrl: str, isKnownService: true };
    }
    return { isUrl: true, displayText: str, fullUrl: str, isKnownService: false };
  } catch (_) {
    return { isUrl: false, displayText: str };
  }
};

const getActivityTypeIcon = (type?: GQLActivityType | null) => {
  switch (type) {
    case 'TASK': return FaClipboardList;
    case 'MEETING': return CalendarIcon;
    case 'CALL': return FaPhone;
    case 'EMAIL': return EmailIcon;
    case 'DEADLINE': return WarningIcon;
    default: return InfoIcon;
  }
};

const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();
  
  const fetchDealById = useAppStore((state) => state.fetchDealById);
  const currentDeal = useAppStore((state) => state.currentDeal);
  const isLoadingDeal = useAppStore((state) => state.currentDealLoading);
  const dealError = useAppStore((state) => state.currentDealError);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  const updateDealStoreAction = useDealsStore((state) => state.updateDeal);
  const toast = useToast();

  const {
    activities,
    fetchActivities,
    updateActivity,
    deleteActivity,
    activitiesLoading,
    activitiesError,
  } = useActivitiesStore();

  const dealActivities = useMemo(() => {
    if (!dealId || !activities) return [];
    return activities.filter(activity => activity.deal_id === dealId);
  }, [activities, dealId]);

  const { isOpen: isCreateActivityModalOpen, onOpen: onCreateActivityModalOpen, onClose: onCreateActivityModalClose } = useDisclosure();
  const { isOpen: isEditActivityModalOpen, onOpen: onEditActivityModalOpen, onClose: onEditActivityModalClose } = useDisclosure();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // Document count state for tab display
  const [documentCount, setDocumentCount] = useState(0);
  
  // Organization contacts count state for tab display
  const [contactsCount, setContactsCount] = useState(0);
  
  // Sticky notes count state for tab display
  const [stickyNotesCount, setStickyNotesCount] = useState(0);
  
  // State for inline editing in right sidebar
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState<string>('');
  const [isEditingCloseDate, setIsEditingCloseDate] = useState(false);
  const [newCloseDateStr, setNewCloseDateStr] = useState<string>('');
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  
  // State for collapsible custom fields
  const [isCustomFieldsExpanded, setIsCustomFieldsExpanded] = useState(true);
  
  // Memoize callbacks to prevent infinite re-renders
  const handleStickyNotesCountChange = useCallback((count: number) => {
    setStickyNotesCount(count);
  }, []);
  
  const handleDocumentCountChange = useCallback((count: number) => {
    setDocumentCount(count);
  }, []);
  
  const handleContactsCountChange = useCallback((count: number) => {
    setContactsCount(count);
  }, []);

  const { isOpen: isEditDealModalOpen, onOpen: onEditDealModalOpen, onClose: onEditDealModalClose } = useDisclosure();

  const { definitions: customFieldDefinitions, fetchCustomFieldDefinitions } = useCustomFieldDefinitionStore();
  const { users: userList, fetchUsers: fetchUserList, hasFetched: usersHaveBeenFetched } = useUserListStore();

  // DEBUG: Log when isCreateActivityModalOpen changes
  useEffect(() => {
    console.log('[DealDetailPage] isCreateActivityModalOpen changed to:', isCreateActivityModalOpen);
  }, [isCreateActivityModalOpen]);

  useEffect(() => {
    if (dealId) {
      fetchDealById(dealId);
      const filter: GeneratedActivityFilterInput = { dealId: dealId };
      fetchActivities(filter);
      fetchCustomFieldDefinitions(CustomFieldEntityType.Deal);
      if (!usersHaveBeenFetched) {
        fetchUserList();
      }
    }
    return () => {
      // useAppStore.setState({ currentDeal: null, currentDealError: null });
    };
  }, [dealId, fetchDealById, fetchActivities, fetchCustomFieldDefinitions, usersHaveBeenFetched, fetchUserList]);

  const getEffectiveProbabilityDisplay = useMemo(() => {
    if (!currentDeal) return { display: 'N/A', value: null, source: '' };
    let probability = currentDeal.deal_specific_probability;
    let source = 'manual';
    if (probability == null) {
      if (currentDeal.currentWfmStep && currentDeal.currentWfmStep.metadata && typeof currentDeal.currentWfmStep.metadata === 'object' && 'deal_probability' in currentDeal.currentWfmStep.metadata) {
        const stepProbability = (currentDeal.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
        if (stepProbability != null) {
          probability = stepProbability;
          source = 'step';
        }
      }
    }
    if (probability == null) return { display: 'N/A', value: null, source: '' };
    return {
      display: `${Math.round(probability * 100)}% (${source})`,
      value: probability,
      source
    };
  }, [currentDeal]);

  const handleDealUpdated = () => {
    if (dealId) {
      fetchDealById(dealId);
    }
    onEditDealModalClose();
  };

  const handleActivityCreated = () => {
    if(dealId) {
      const filter: GeneratedActivityFilterInput = { dealId: dealId };
      fetchActivities(filter);
    }
    onCreateActivityModalClose();
  }

  const handleActivityUpdated = () => {
    if(dealId) {
      const filter: GeneratedActivityFilterInput = { dealId: dealId };
      fetchActivities(filter);
    }
    onEditActivityModalClose();
    setSelectedActivity(null);
  }

  const handleEditActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    onEditActivityModalOpen();
  };

  const handleToggleActivityComplete = async (activity: Activity) => {
    if (!dealId) return;
    const input: GeneratedUpdateActivityInput = { is_done: !activity.is_done };
    try {
      const updated = await updateActivity(activity.id, input);
      if (updated) {
        toast({ title: `Activity '${updated.subject}' marked as ${updated.is_done ? 'complete' : 'incomplete'}.`, status: 'success', duration: 2000, isClosable: true });
        // No need to manually refetch, store update should trigger re-render of dealActivities
      } else {
        toast({ title: 'Failed to update activity status', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error updating activity', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleDeleteActivityClick = (activity: Activity) => {
    setActivityToDelete(activity);
    onDeleteConfirmOpen();
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete || !dealId) return;
    try {
      const success = await deleteActivity(activityToDelete.id);
      if (success) {
        toast({ title: `Activity '${activityToDelete.subject}' deleted.`, status: 'info', duration: 2000, isClosable: true });
      } else {
        toast({ title: 'Failed to delete activity', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error deleting activity', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
    onDeleteConfirmClose();
    setActivityToDelete(null);
  };

  // Helper function to convert updateDealStoreAction to expected interface
  const handleDealUpdate = async (dealId: string, updates: any): Promise<void> => {
    try {
      await updateDealStoreAction(dealId, updates);
      if (dealId) {
        fetchDealById(dealId);
      }
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  };

  // Helper function to convert userList to expected interface
  const formattedUserList = userList.map(user => ({
    id: user.id,
    display_name: user.display_name || undefined,
    email: user.email,
    avatar_url: user.avatar_url || undefined
  }));

  // Check if user can edit this deal (same logic as in useDealsTableColumns)
  const canEditDeal = currentDeal && (
    userPermissions?.includes('deal:update_any') || 
    (userPermissions?.includes('deal:update_own') && 
     (currentDeal.user_id === currentUserId || currentDeal.assigned_to_user_id === currentUserId))
  );

  // Handle custom field updates
  const handleCustomFieldUpdate = async (fieldId: string, value: any) => {
    if (!currentDeal?.id) return;
    
    try {
      // Find the field definition to get the field name
      const fieldDefinition = customFieldDefinitions?.find(def => def.id === fieldId);
      if (!fieldDefinition) {
        throw new Error('Field definition not found');
      }

      // Create a temporary form values object with just this field
      const tempFormValues = { [fieldDefinition.fieldName]: value };
      
      // Process custom fields using the same utility as EditDealModal
      const processedCustomFields = processCustomFieldsForSubmission(
        [fieldDefinition], // Only process this one field
        tempFormValues
      );

      if (processedCustomFields.length === 0) {
        throw new Error('Failed to process custom field value');
      }

      // Update the deal with the processed custom field
      await updateDealStoreAction(currentDeal.id, {
        customFields: processedCustomFields
      });

      // Refresh the deal data
      await fetchDealById(currentDeal.id);
      
    } catch (error) {
      console.error('Failed to update custom field:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        throw new Error('You do not have permission to update this deal.');
      }
      throw error; // Re-throw to be handled by the component
    }
  };

  // Handler functions for inline editing in right sidebar
  const handleAmountUpdate = async () => {
    const numericAmount = parseFloat(newAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      toast({ 
        title: 'Invalid Amount', 
        description: 'Please enter a valid positive number.', 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }
    try {
      await handleDealUpdate(currentDeal!.id, { amount: numericAmount });
      toast({ title: 'Amount Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingAmount(false);
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ 
          title: 'Permission Denied', 
          description: 'You do not have permission to update this deal.', 
          status: 'error', 
          duration: 4000, 
          isClosable: true 
        });
      } else {
        toast({ 
          title: 'Error Updating Amount', 
          description: errorMessage, 
          status: 'error', 
          duration: 3000, 
          isClosable: true 
        });
      }
      setIsEditingAmount(false);
    }
  };

  const handleCloseDateUpdate = async () => {
    try {
      const dateValue = newCloseDateStr ? newCloseDateStr : null;
      await handleDealUpdate(currentDeal!.id, { expected_close_date: dateValue });
      toast({ 
        title: dateValue ? 'Expected Close Date Updated' : 'Expected Close Date Cleared', 
        status: 'success', 
        duration: 2000, 
        isClosable: true 
      });
      setIsEditingCloseDate(false);
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ 
          title: 'Permission Denied', 
          description: 'You do not have permission to update this deal.', 
          status: 'error', 
          duration: 4000, 
          isClosable: true 
        });
      } else {
        toast({ 
          title: 'Error Updating Date', 
          description: errorMessage, 
          status: 'error', 
          duration: 3000, 
          isClosable: true 
        });
      }
      setIsEditingCloseDate(false);
    }
  };

  const handleOwnerUpdate = async () => {
    try {
      // Validate user selection
      if (newOwnerId && !formattedUserList.find(user => user.id === newOwnerId)) {
        toast({ 
          title: 'Invalid User Selection', 
          description: 'The selected user is no longer available. Please refresh the page and try again.', 
          status: 'warning', 
          duration: 4000, 
          isClosable: true 
        });
        setIsEditingOwner(false);
        return;
      }

      await handleDealUpdate(currentDeal!.id, { assignedToUserId: newOwnerId });
      toast({ title: 'Owner Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingOwner(false);
    } catch (e) {
      const errorMessage = (e as Error).message;
      
      // Handle specific foreign key constraint error
      if (errorMessage.includes('violates foreign key constraint') || errorMessage.includes('not present in table')) {
        toast({ 
          title: 'User Not Found', 
          description: 'The selected user no longer exists. Please refresh the page to update the user list.', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ 
          title: 'Permission Denied', 
          description: 'You do not have permission to update this deal.', 
          status: 'error', 
          duration: 4000, 
          isClosable: true 
        });
      } else {
        toast({ 
          title: 'Error Updating Owner', 
          description: errorMessage, 
          status: 'error', 
          duration: 3000, 
          isClosable: true 
        });
      }
      setIsEditingOwner(false);
    }
  };

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
                      {isLoadingDeal && (
                          <Center h="full">
                              <Spinner size="xl" color={colors.interactive.default}/>
                          </Center>
                      )}
            
                      {dealError && (
                          <Alert status="error" variant="subtle" borderRadius="lg" bg={colors.status.error} color={colors.text.onAccent}>
                              <AlertIcon color={colors.text.onAccent}/>
                              <AlertTitle>Error Loading Deal!</AlertTitle>
                              <AlertDescription>{dealError}</AlertDescription>
                          </Alert>
                      )}
            
                      {!isLoadingDeal && !dealError && currentDeal && (
                          <VStack spacing={6} align="stretch" maxW="100%" w="100%">
                {/* Header Section */}
                <DealHeader 
                  deal={currentDeal as Deal}
                  isEditing={false}
                  setIsEditing={() => {}}
                  onCreateActivity={onCreateActivityModalOpen}
                  dealActivities={dealActivities}
                />

                              {/* Tabs Section - No more Deal Overview Card here */}
                <Box bg={colors.bg.elevated} borderRadius="xl" border="1px solid" borderColor={colors.border.default} minH="400px" w="100%" maxW="100%">
                                  <Tabs variant="line" colorScheme="blue" size="md" isFitted>
                                      <TabList borderBottomColor={colors.border.default}>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Notes</Text>
                          <Badge colorScheme="yellow" variant="solid" borderRadius="full" fontSize="xs">
                            {stickyNotesCount}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Activities</Text>
                          <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="xs">
                            {dealActivities.length}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        Emails
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Documents</Text>
                          <Badge colorScheme="green" variant="solid" borderRadius="full" fontSize="xs">
                            {documentCount}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Contacts</Text>
                          <Badge colorScheme="purple" variant="solid" borderRadius="full" fontSize="xs">
                            {contactsCount}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        History
                      </Tab>
                                      </TabList>
                    
                    <TabPanels p={{base: 3, md: 4}} minH="350px" w="100%" maxW="100%">
                                          <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <DealNotesPanel 
                            dealId={currentDeal.id}
                            onNoteCountChange={handleStickyNotesCountChange}
                          />
                        </Box>
                                          </TabPanel>
                      
                                          <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <DealActivitiesPanel
                            activities={dealActivities}
                            loading={activitiesLoading}
                            error={activitiesError}
                            onCreateActivity={onCreateActivityModalOpen}
                            onEditActivity={handleEditActivityClick}
                            onToggleComplete={handleToggleActivityComplete}
                            onDeleteActivity={handleDeleteActivityClick}
                            getActivityTypeIcon={getActivityTypeIcon}
                          />
                        </Box>
                                          </TabPanel>

                      <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <DealEmailsPanel
                            dealId={currentDeal.id}
                            dealName={currentDeal.name || ''}
                            primaryContactEmail={currentDeal.person?.email || undefined}
                          />
                        </Box>
                                                                </TabPanel>

                      <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <SharedDriveDocumentBrowser
                            dealId={currentDeal.id}
                            dealName={currentDeal.name || undefined}
                            onDocumentCountChange={handleDocumentCountChange}
                          />
                        </Box>
                      </TabPanel>

                      <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <DealOrganizationContactsPanel
                            organization={currentDeal.organization ? {
                              id: currentDeal.organization.id,
                              name: currentDeal.organization.name
                            } : null}
                            onContactCountChange={handleContactsCountChange}
                          />
                        </Box>
                      </TabPanel>
                      
                                          <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                        <Box w="100%" maxW="100%">
                          <DealHistoryPanel historyEntries={currentDeal.history} />
                        </Box>
                                          </TabPanel>
                                      </TabPanels>
                                  </Tabs>
                              </Box>
                          </VStack>
                      )}
            
                      {!currentDeal && !isLoadingDeal && !dealError && (
                           <Center h="full" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
                             <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
                             <Text color={colors.text.secondary} fontSize="lg">Deal not found.</Text>
                             <Button as={RouterLink} to="/deals" mt={6} {...styles.button.primary}>Back to Deals</Button>
                           </Center>
                      )}
                  </Box>

                  {/* Right Sidebar - Enhanced with Key Information */}
                  <Box 
                      bg={colors.bg.elevated}
                      p={{base: 4, md: 6}} 
                      borderLeftWidth={{base: 0, lg: "1px"}} 
                      borderTopWidth={{base: "1px", lg: 0}}
                      borderColor={colors.border.default}
                      overflowY="auto"
                      w="450px"
                      minW="450px"
                      maxW="450px"
                      flexShrink={0}
                      sx={{
                          '&::-webkit-scrollbar': { width: '8px' },
                          '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
                          '&::-webkit-scrollbar-track': { background: colors.bg.surface },
                      }}
                  >
                      {!isLoadingDeal && currentDeal && (
                          <VStack spacing={6} align="stretch">
                              {/* Key Information Section */}
                              <Box p={5} bg={colors.bg.surface} borderRadius="lg" border="1px solid" borderColor={colors.border.default}>
                                  <Heading size="sm" mb={4} color={colors.text.primary}>Key Information</Heading>
                                  <VStack spacing={4} align="stretch">
                                      {/* Amount Field */}
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color={colors.text.secondary}>Value</Text>
                                          {!isEditingAmount ? (
                                              <HStack spacing={2}>
                                                  <Text fontSize="md" fontWeight="semibold" color={colors.status.success}>
                                                      {currentDeal.amount ? new Intl.NumberFormat('en-US', { 
                                                          style: 'currency', 
                                                          currency: 'USD', 
                                                          minimumFractionDigits: 0, 
                                                          maximumFractionDigits: 0 
                                                      }).format(currentDeal.amount) : '-'}
                                                  </Text>
                                                  <IconButton 
                                                      icon={<EditIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      aria-label="Edit Amount" 
                                                      onClick={() => {
                                                          setIsEditingAmount(true);
                                                          setNewAmount(currentDeal.amount ? String(currentDeal.amount) : '');
                                                      }}
                                                      color={colors.text.secondary}
                                                      _hover={{color: colors.text.link}}
                                                      isDisabled={!canEditDeal}
                                                  />
                                              </HStack>
                                          ) : (
                                              <HStack spacing={2} flex={1} justifyContent="flex-end">
                                                  <Input 
                                                      type="number" 
                                                      value={newAmount} 
                                                      onChange={(e) => setNewAmount(e.target.value)} 
                                                      placeholder="Enter amount" 
                                                      size="sm" 
                                                      w="120px"
                                                      textAlign="right"
                                                      bg={colors.bg.elevated}
                                                      borderColor={colors.border.default}
                                                      _hover={{borderColor: colors.border.default}}
                                                      _focus={{borderColor: colors.text.link, boxShadow: `0 0 0 1px ${colors.text.link}`}}
                                                  />
                                                  <IconButton 
                                                      icon={<CheckIcon />} 
                                                      size="xs" 
                                                      colorScheme="green" 
                                                      aria-label="Save Amount" 
                                                      onClick={handleAmountUpdate}
                                                  />
                                                  <IconButton 
                                                      icon={<SmallCloseIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      colorScheme="red" 
                                                      aria-label="Cancel Edit Amount" 
                                                      onClick={() => setIsEditingAmount(false)}
                                                  />
                                              </HStack>
                                          )}
                                      </HStack>

                                      {/* Probability Field */}
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color={colors.text.secondary}>Probability</Text>
                                          <HStack flex={1} justifyContent="flex-end" spacing={2} maxW="60%">
                                              <Progress 
                                                  value={getEffectiveProbabilityDisplay.value ? getEffectiveProbabilityDisplay.value * 100 : 0} 
                                                  size="xs" 
                                                  colorScheme="blue" 
                                                  flex={1} 
                                                  borderRadius="full" 
                                                  bg={colors.bg.elevated} 
                                              />
                                              <Text fontSize="sm" fontWeight="medium" color={colors.text.link} minW="40px" textAlign="right">
                                                  {getEffectiveProbabilityDisplay.value != null ? 
                                                      `${(getEffectiveProbabilityDisplay.value * 100).toFixed(0)}%` : 'N/A'}
                                              </Text>
                                          </HStack>
                                      </HStack>

                                      {/* Expected Close Date Field */}
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color={colors.text.secondary}>Expected Close Date</Text>
                                          {!isEditingCloseDate ? (
                                              <HStack spacing={2}>
                                                  <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                                                      {currentDeal.expected_close_date ? new Date(currentDeal.expected_close_date).toLocaleDateString() : '-'}
                                                  </Text>
                                                  <IconButton 
                                                      icon={<EditIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      aria-label="Edit Expected Close Date" 
                                                      onClick={() => {
                                                          setIsEditingCloseDate(true);
                                                          if (currentDeal.expected_close_date) {
                                                              const date = new Date(currentDeal.expected_close_date);
                                                              setNewCloseDateStr(date.toISOString().split('T')[0]);
                                                          } else {
                                                              setNewCloseDateStr('');
                                                          }
                                                      }}
                                                      color={colors.text.secondary}
                                                      _hover={{color: colors.text.link}}
                                                      isDisabled={!canEditDeal}
                                                  />
                                              </HStack>
                                          ) : (
                                              <HStack spacing={2} flex={1} justifyContent="flex-end">
                                                  <Input 
                                                      type="date" 
                                                      value={newCloseDateStr} 
                                                      onChange={(e) => setNewCloseDateStr(e.target.value)} 
                                                      size="sm" 
                                                      w="160px"
                                                      bg={colors.bg.elevated}
                                                      borderColor={colors.border.default}
                                                      _hover={{borderColor: colors.border.default}}
                                                      _focus={{borderColor: colors.text.link, boxShadow: `0 0 0 1px ${colors.text.link}`}}
                                                  />
                                                  <IconButton 
                                                      icon={<CheckIcon />} 
                                                      size="xs" 
                                                      colorScheme="green" 
                                                      aria-label="Save Expected Close Date" 
                                                      onClick={handleCloseDateUpdate}
                                                  />
                                                  <IconButton 
                                                      icon={<SmallCloseIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      colorScheme="red" 
                                                      aria-label="Cancel Edit Date" 
                                                      onClick={() => setIsEditingCloseDate(false)}
                                                  />
                                              </HStack>
                                          )}
                                      </HStack>

                                      {/* Owner Field */}
                                      <HStack justifyContent="space-between">
                                          <Text fontSize="sm" color={colors.text.secondary}>Owner</Text>
                                          {!isEditingOwner ? (
                                              <HStack spacing={2}>
                                                  <Avatar 
                                                      size="xs" 
                                                      name={currentDeal.assignedToUser?.display_name || 'Unassigned'} 
                                                      src={currentDeal.assignedToUser?.avatar_url || undefined}
                                                      bg={colors.interactive.default}
                                                  />
                                                  <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                                                      {currentDeal.assignedToUser?.display_name || 'Unassigned'}
                                                  </Text>
                                                  <IconButton 
                                                      icon={<EditIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      aria-label="Edit Owner" 
                                                      onClick={() => {
                                                          setIsEditingOwner(true);
                                                          setNewOwnerId(currentDeal.assigned_to_user_id || null);
                                                      }}
                                                      color={colors.text.secondary}
                                                      _hover={{color: colors.text.link}}
                                                      isDisabled={!canEditDeal}
                                                  />
                                              </HStack>
                                          ) : (
                                              <HStack spacing={2} flex={1} justifyContent="flex-end">
                                                  <Select 
                                                      value={newOwnerId || ''}
                                                      onChange={(e) => setNewOwnerId(e.target.value || null)}
                                                      size="sm" 
                                                      w="180px"
                                                      bg={colors.bg.elevated}
                                                      borderColor={colors.border.default}
                                                      _hover={{borderColor: colors.border.default}}
                                                      _focus={{borderColor: colors.text.link, boxShadow: `0 0 0 1px ${colors.text.link}`}}
                                                  >
                                                      <option value="">Unassigned</option>
                                                      {formattedUserList.map(user => (
                                                          <option key={user.id} value={user.id}>
                                                              {user.display_name || user.email}
                                                          </option>
                                                      ))}
                                                  </Select>
                                                  <IconButton 
                                                      icon={<CheckIcon />} 
                                                      size="xs" 
                                                      colorScheme="green" 
                                                      aria-label="Save Owner" 
                                                      onClick={handleOwnerUpdate}
                                                  />
                                                  <IconButton 
                                                      icon={<SmallCloseIcon />} 
                                                      size="xs" 
                                                      variant="ghost" 
                                                      colorScheme="red" 
                                                      aria-label="Cancel Edit Owner" 
                                                      onClick={() => setIsEditingOwner(false)}
                                                  />
                                              </HStack>
                                          )}
                                      </HStack>

                                      {/* Project ID Field */}
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color={colors.text.secondary}>Project ID</Text>
                                          <Text 
                                              fontSize="md" 
                                              fontWeight="bold" 
                                              color={colors.text.link}
                                              fontFamily="mono"
                                              bg={colors.bg.elevated}
                                              px={3}
                                              py={1}
                                              borderRadius="md"
                                              border="1px solid"
                                              borderColor={colors.border.default}
                                          >
                                              #{(currentDeal as any).project_id || '-'}
                                          </Text>
                                      </HStack>
                                  </VStack>
                              </Box>

                                            {/* Custom Fields Section */}
              {customFieldDefinitions && customFieldDefinitions.length > 0 && (
                  <Box p={5} bg={colors.bg.surface} borderRadius="lg" border="1px solid" borderColor={colors.border.default}>
                      <HStack justifyContent="space-between" alignItems="center" mb={isCustomFieldsExpanded ? 4 : 0}>
                          <Heading size="sm" color={colors.text.primary}>Custom Information</Heading>
                          <IconButton
                              icon={isCustomFieldsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                              size="xs"
                              variant="ghost"
                              aria-label={isCustomFieldsExpanded ? "Collapse Custom Fields" : "Expand Custom Fields"}
                              onClick={() => setIsCustomFieldsExpanded(!isCustomFieldsExpanded)}
                              color={colors.text.secondary}
                              _hover={{color: colors.text.link}}
                          />
                      </HStack>
                      <Collapse in={isCustomFieldsExpanded} animateOpacity>
                          <DealCustomFieldsPanel
                              customFieldDefinitions={customFieldDefinitions || []}
                              customFieldValues={currentDeal.customFieldValues || []}
                              dealId={currentDeal.id}
                              onUpdate={canEditDeal ? handleCustomFieldUpdate : undefined}
                              getLinkDisplayDetails={getLinkDisplayDetails}
                          />
                      </Collapse>
                  </Box>
              )}

                              {/* Primary Contact Section */}
                              {currentDeal.person && (
                                  <Box p={5} bg={colors.bg.surface} borderRadius="lg" border="1px solid" borderColor={colors.border.default}>
                                      <Heading size="sm" mb={3} color={colors.text.primary}>Primary Contact</Heading>
                                      <HStack spacing={3} alignItems="center">
                                          <Avatar 
                                              size="md" 
                                              name={`${currentDeal.person?.first_name || ''} ${currentDeal.person?.last_name || ''}`}
                                              bg={colors.interactive.default}
                                              color={colors.text.onAccent}
                                          />
                                          <VStack align="start" spacing={0} flex={1}>
                                              <Link as={RouterLink} to={`/people/${currentDeal.person?.id}`} fontWeight="medium" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
                                                  {currentDeal.person?.first_name} {currentDeal.person?.last_name}
                                              </Link>
                                                  {currentDeal.person?.email && (
                                                      <Text fontSize="sm" color={colors.text.secondary}>
                                                          {currentDeal.person?.email}
                                                      </Text>
                                                  )}
                                          </VStack>
                                      </HStack>
                                      {currentDeal.person?.email && (
                                          <Button 
                                              size="xs" 
                                              variant="outline" 
                                              leftIcon={<EmailIcon />}
                                              onClick={() => window.open(`mailto:${currentDeal.person?.email}`)}
                                              width="full"
                                              mt={3}
                                          >
                                              Email
                                          </Button>
                                      )}
                                  </Box>
                              )}

                              {/* Organization Section */}
                              {currentDeal.organization && (
                                  <Box p={5} bg={colors.bg.surface} borderRadius="lg" border="1px solid" borderColor={colors.border.default}>
                                      <Heading size="sm" mb={3} color={colors.text.primary}>Organization</Heading>
                                      <HStack spacing={3} alignItems="center">
                                          <VStack align="start" spacing={0}>
                                              <Link as={RouterLink} to={`/organizations/${currentDeal.organization.id}`} fontWeight="medium" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
                                                  {currentDeal.organization.name}
                                              </Link>
                                          </VStack>
                                      </HStack>
                                  </Box>
                              )}
                              
                          </VStack>
                      )}
                  </Box>
              </Flex>
      </Box>

      {/* Modals */}
      <Modal isOpen={isCreateActivityModalOpen} onClose={onCreateActivityModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Activity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
                <CreateActivityForm 
                  onSuccess={handleActivityCreated} 
              onClose={onCreateActivityModalClose} 
              initialDealId={dealId}
              initialDealName={currentDeal?.name}
                />
              </ModalBody>
            </ModalContent>
          </Modal>

      <Modal isOpen={isEditActivityModalOpen} onClose={onEditActivityModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Activity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedActivity && (
                <EditActivityForm 
                  activity={selectedActivity} 
                  onSuccess={handleActivityUpdated} 
                onClose={onEditActivityModalClose} 
                />
            )}
              </ModalBody>
            </ModalContent>
          </Modal>

      <AlertDialog isOpen={isDeleteConfirmOpen} leastDestructiveRef={cancelRef} onClose={onDeleteConfirmClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Activity
                </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this activity? This action cannot be undone.
                </AlertDialogBody>
                <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteConfirmClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={confirmDeleteActivity} ml={3}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

      <Modal isOpen={isEditDealModalOpen} onClose={onEditDealModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Deal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentDeal && (
         <EditDealModal 
            isOpen={isEditDealModalOpen} 
            onClose={onEditDealModalClose} 
            deal={currentDeal as Deal} 
            onDealUpdated={handleDealUpdated} 
        />
      )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DealDetailPage; 