import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  IconButton,
  Input,
  Progress,
} from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ArrowBackIcon, WarningIcon, InfoIcon, EmailIcon, CalendarIcon, EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { FaClipboardList, FaPhone } from 'react-icons/fa';

// Store imports
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore } from '../stores/useDealsStore';
import { useActivitiesStore, Activity, ActivityType as GQLActivityType, GeneratedActivityFilterInput, GeneratedUpdateActivityInput } from '../stores/useActivitiesStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { useUserListStore } from '../stores/useUserListStore';

// Component imports
import CreateActivityForm from '../components/activities/CreateActivityForm';
import EditActivityForm from '../components/activities/EditActivityForm';
import EditDealModal from '../components/EditDealModal';
import DealPricingSection from '../components/pricing/DealPricingSection';
import { DealHeader } from '../components/deals/DealHeader';
import { DealOverviewCard } from '../components/deals/DealOverviewCard';
import { DealActivitiesPanel } from '../components/deals/DealActivitiesPanel';
import { DealCustomFieldsPanel } from '../components/deals/DealCustomFieldsPanel';
import { DealRelatedPanel } from '../components/deals/DealRelatedPanel';
import { DealHistoryPanel } from '../components/deals/DealHistoryPanel';
import { DealOverviewPanel } from '../components/deals/DealOverviewPanel';

// Type imports
import { CustomFieldEntityType } from '../generated/graphql/graphql';

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
  const fetchDealById = useAppStore((state) => state.fetchDealById);
  const currentDeal = useAppStore((state) => state.currentDeal);
  const isLoadingDeal = useAppStore((state) => state.currentDealLoading);
  const dealError = useAppStore((state) => state.currentDealError);
  const updateDealStoreAction = useDealsStore((state) => state.updateDeal);
  const toast = useToast();
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  const {
    activities,
    fetchActivities,
    createActivity,
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

  const { isOpen: isEditDealModalOpen, onOpen: onEditDealModalOpen, onClose: onEditDealModalClose } = useDisclosure();

  const [isEditingProbability, setIsEditingProbability] = useState(false);
  const [newProbability, setNewProbability] = useState<string>('');
  
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState<string>('');
  
  const [isEditingCloseDate, setIsEditingCloseDate] = useState(false);
  const [newCloseDateStr, setNewCloseDateStr] = useState<string>('');
  
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);

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

  const handleProbabilityUpdate = async () => {
    if (!dealId) return;
    let probabilityToSet: number | null = null;
    if (newProbability === '') {
      probabilityToSet = null;
    } else {
      const numericProbability = parseFloat(newProbability) / 100;
      if (isNaN(numericProbability) || numericProbability < 0 || numericProbability > 1) {
        toast({ title: 'Invalid Probability', description: 'Please enter a value between 0 and 100.', status: 'error', duration: 3000, isClosable: true });
        return;
      }
      probabilityToSet = numericProbability;
    }
    try {
      await updateDealStoreAction(dealId, { deal_specific_probability: probabilityToSet });
      toast({ title: 'Probability Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingProbability(false);
      fetchDealById(dealId); 
    } catch (e) {
      toast({ title: 'Error Updating Probability', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

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
         // No need to manually refetch, store update should trigger re-render of dealActivities
      } else {
        toast({ title: 'Failed to delete activity', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error deleting activity', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
    onDeleteConfirmClose();
    setActivityToDelete(null);
  };

  if (isModernTheme) {
    return (
      <Box 
        bg="gray.850" 
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
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
          overflow="hidden" 
        >
          <Grid templateColumns={{base: "1fr", lg: "1fr 400px"}} h="full" gap={0}>
            {/* Main Content (Left Column) */}
            <GridItem 
              p={{base: 4, md: 8}} 
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '8px' },
                '&::-webkit-scrollbar-track': { background: 'gray.750' },
              }}
            >
              {isLoadingDeal && (
                <Center h="full">
                  <Spinner size="xl" color="blue.400"/>
                </Center>
              )}
              
              {dealError && (
                <Alert status="error" variant="subtle" borderRadius="lg" bg="red.900" color="white">
                  <AlertIcon color="red.300"/>
                  <AlertTitle>Error Loading Deal!</AlertTitle>
                  <AlertDescription>{dealError}</AlertDescription>
                </Alert>
              )}
              
              {!isLoadingDeal && !dealError && currentDeal && (
                <VStack spacing={6} align="stretch">
                  {/* Header Section */}
                  <DealHeader deal={currentDeal} />

                  {/* Deal Overview Card */}
                  <DealOverviewCard 
                    deal={currentDeal}
                    onUpdate={updateDealStoreAction}
                    onRefresh={() => dealId && fetchDealById(dealId)}
                    userList={userList}
                    effectiveProbabilityDisplay={getEffectiveProbabilityDisplay}
                  />

                  {/* Tabs Section */}
                  <Box bg="gray.700" borderRadius="xl" border="1px solid" borderColor="gray.600">
                    <Tabs variant="line" colorScheme="blue" size="md" isFitted>
                      <TabList borderBottomColor="gray.600">
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          Overview
                        </Tab>
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          Activities ({dealActivities.length})
                        </Tab>
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          Pricing
                        </Tab>
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          Related
                        </Tab>
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          Custom Fields
                        </Tab>
                        <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">
                          History
                        </Tab>
                      </TabList>
                      
                      <TabPanels p={{base: 3, md: 4}}>
                        <TabPanel>
                          <DealOverviewPanel 
                            description={(currentDeal as any).description}
                            createdAt={currentDeal.created_at}
                            updatedAt={currentDeal.updated_at}
                          />
                        </TabPanel>
                        
                        <TabPanel>
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
                        </TabPanel>
                        
                        <TabPanel>
                          {dealId && <DealPricingSection dealId={dealId} />}
                        </TabPanel>
                        
                        <TabPanel>
                          <DealRelatedPanel 
                            person={currentDeal.person}
                            organization={currentDeal.organization}
                          />
                        </TabPanel>
                        
                        <TabPanel>
                          <DealCustomFieldsPanel
                            customFieldDefinitions={customFieldDefinitions}
                            customFieldValues={currentDeal.customFieldValues}
                            getLinkDisplayDetails={getLinkDisplayDetails}
                          />
                        </TabPanel>
                        
                        <TabPanel>
                          <DealHistoryPanel historyEntries={currentDeal.history} />
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </Box>
                </VStack>
              )}
              
              {!currentDeal && !isLoadingDeal && !dealError && (
                <Center h="full" flexDirection="column" bg="gray.750" borderRadius="xl" p={6}>
                  <Icon as={WarningIcon} w={8} h={8} color="yellow.400" mb={4} />
                  <Text color="gray.300" fontSize="lg">Deal not found.</Text>
                  <Button as={RouterLink} to="/deals" mt={6} colorScheme="blue">Back to Deals</Button>
                </Center>
              )}
            </GridItem>

            {/* Right Sidebar */}
            <GridItem 
              bg="gray.750" 
              p={{base: 4, md: 6}} 
              borderLeftWidth={{base: 0, lg: "1px"}} 
              borderTopWidth={{base: "1px", lg: 0}}
              borderColor="gray.600"
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '8px' },
                '&::-webkit-scrollbar-track': { background: 'gray.800' },
              }}
            >
              {!isLoadingDeal && currentDeal && (
                <VStack spacing={6} align="stretch">
                  {currentDeal.person && (
                    <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600">
                      <Heading size="sm" mb={3} color="white">Primary Contact</Heading>
                      <HStack spacing={3} alignItems="center">
                        <Avatar 
                          size="md" 
                          name={`${currentDeal.person.first_name} ${currentDeal.person.last_name}`}
                          bg="gray.500"
                        />
                        <VStack align="start" spacing={0}>
                          <Link as={RouterLink} to={`/people/${currentDeal.person.id}`} fontWeight="medium" color="blue.300" _hover={{textDecoration: 'underline'}}>
                            {currentDeal.person.first_name} {currentDeal.person.last_name}
                          </Link>
                          {currentDeal.person.email && (
                            <Link href={`mailto:${currentDeal.person.email}`} fontSize="sm" color="blue.400" _hover={{textDecoration: 'underline'}}>
                              {currentDeal.person.email}
                            </Link>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  {currentDeal.organization && (
                    <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600">
                      <Heading size="sm" mb={3} color="white">Organization</Heading>
                      <HStack spacing={3} alignItems="center">
                        <VStack align="start" spacing={0}>
                          <Link as={RouterLink} to={`/organizations/${currentDeal.organization.id}`} fontWeight="medium" color="blue.300" _hover={{textDecoration: 'underline'}}>
                            {currentDeal.organization.name}
                          </Link>
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  {/* Recent Activities */}
                  <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600">
                    <Heading size="sm" mb={3} color="white">Recent Activities</Heading>
                    {dealActivities.slice(0, 5).map((activity) => (
                      <Box key={activity.id} py={2} borderBottomWidth="1px" borderColor="gray.600" _last={{borderBottomWidth: 0}}>
                        <Text fontSize="sm" color={activity.is_done ? "gray.500" : "gray.100"} textDecoration={activity.is_done ? 'line-through' : 'none'}>
                          {activity.subject}
                        </Text>
                        {activity.due_date && (
                          <Text fontSize="xs" color="gray.400">
                            Due: {new Date(activity.due_date).toLocaleDateString()}
                          </Text>
                        )}
                      </Box>
                    ))}
                    {dealActivities.length > 5 && (
                      <Button variant="link" colorScheme="blue" size="sm" onClick={() => { /* TODO: Switch to activities tab */ }}>
                        View all ({dealActivities.length})
                      </Button>
                    )}
                  </Box>
                </VStack>
              )}
            </GridItem>
          </Grid>
        </Box>

        {/* Modals */}
        <Modal isOpen={isCreateActivityModalOpen} onClose={onCreateActivityModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Activity</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CreateActivityForm 
                onActivityCreated={handleActivityCreated} 
                onCancel={onCreateActivityModalClose} 
                initialDealId={dealId}
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
                  onActivityUpdated={handleActivityUpdated} 
                  onCancel={onEditActivityModalClose} 
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
                  deal={currentDeal} 
                  onDealUpdated={handleDealUpdated} 
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // Fallback for other themes (existing layout)
  if (isLoadingDeal) {
    return <Flex justify="center" align="center" minH="200px"><Spinner /></Flex>;
  }

  if (dealError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Deal!</AlertTitle>
        <AlertDescription>{dealError}</AlertDescription>
      </Alert>
    );
  }

  if (!currentDeal) {
     return (
      <Box p={5}>
        <Alert status="warning">
          <AlertIcon />
          Deal not found. It might have been deleted or an issue occurred.
        </Alert>
        <Button as={RouterLink} to="/deals" mt={4}>Back to Deals</Button>
      </Box>
    );
  }

  // Original non-modern theme layout below
  return (
    <Box p={5} maxW="xl" mx="auto">
      <Flex alignItems="center" mb={4}>
        <IconButton
          as={RouterLink}
          to="/deals"
          aria-label="Back to Deals"
          icon={<ArrowBackIcon />}
          mr={3}
        />
          <Heading size="lg">Deal: {currentDeal.name}</Heading>
        <Button ml="auto" onClick={onEditDealModalOpen} colorScheme="blue" variant="outline" size="sm">Edit Deal</Button>
      </Flex>
      
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
        <Heading size="sm" mb={2}>Details</Heading>
        <Text><strong>Amount:</strong> {currentDeal.amount ? `$${currentDeal.amount.toLocaleString()}` : 'N/A'}</Text>
        <Text><strong>Stage (Status):</strong> {currentDeal.currentWfmStatus?.name || 'N/A'}</Text>
        <HStack alignItems="center">
          <Text><strong>Probability:</strong> {getEffectiveProbabilityDisplay.display}</Text>
          {!isEditingProbability && (
            <IconButton 
              icon={<Icon as={EditIcon} />}
              size="xs"
              variant="ghost"
              aria-label="Edit Deal Probability"
              onClick={() => {
                setNewProbability(getEffectiveProbabilityDisplay.value !== null ? (getEffectiveProbabilityDisplay.value * 100).toString() : "");
                setIsEditingProbability(true);
              }}
            />
          )}
        </HStack>
        {isEditingProbability && (
          <HStack mt={1} mb={2}>
            <Input 
              type="number" 
              value={newProbability} 
              onChange={(e) => setNewProbability(e.target.value)} 
              placeholder="Enter % (e.g., 75)"
              size="sm"
              width="150px"
            />
            <Button size="sm" colorScheme="green" onClick={handleProbabilityUpdate}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditingProbability(false)}>Cancel</Button>
          </HStack>
        )}
        <Text><strong>Weighted Amount:</strong> {currentDeal.weighted_amount ? `$${currentDeal.weighted_amount.toLocaleString()}` : 'N/A'}</Text>
        <Text><strong>Expected Close Date:</strong> {currentDeal.expected_close_date ? new Date(currentDeal.expected_close_date).toLocaleDateString() : 'N/A'}</Text>
        <Text>
            <strong>Person:</strong> {currentDeal.person ? 
                <Link as={RouterLink} to={`/people/${currentDeal.person.id}`} color={{ base: 'blue.500', _dark: 'blue.300' }} _hover={{textDecoration: 'underline'}}>
                    {`${currentDeal.person.first_name} ${currentDeal.person.last_name}`}
                </Link> 
                : 'N/A'}
        </Text>
        <Text><strong>Organization:</strong> {currentDeal.organization ? 
            <Link as={RouterLink} to={`/organizations/${currentDeal.organization.id}`} color={{ base: 'blue.500', _dark: 'blue.300' }} _hover={{textDecoration: 'underline'}}>
                {currentDeal.organization.name}
            </Link> 
            : 'N/A'}
        </Text>
        <Text><strong>Assigned To:</strong> {currentDeal.assignedToUser ? currentDeal.assignedToUser.display_name || currentDeal.assignedToUser.email : 'Unassigned'}</Text>
      </Box>

      {customFieldDefinitions && currentDeal.customFieldValues && currentDeal.customFieldValues.length > 0 && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
          <Heading size="sm" mb={3}>Custom Information</Heading>
          {currentDeal.customFieldValues
            .filter(cfv => customFieldDefinitions.find(cfd => cfd.id === cfv.definition.id)?.isActive)
            .sort((a,b) => {
                const defA = customFieldDefinitions.find(def => def.id === a.definition.id);
                const defB = customFieldDefinitions.find(def => def.id === b.definition.id);
                return (defA?.displayOrder || 0) - (defB?.displayOrder || 0);
            })
            .map((cfValue) => {
            const definition = customFieldDefinitions.find(def => def.id === cfValue.definition.id);
            if (!definition) return null; 

            let displayValue: string | JSX.Element = 'N/A';
            const { fieldType, dropdownOptions } = definition;

            switch (fieldType) {
                case CustomFieldType.Text:
                    if (cfValue.stringValue) {
              const linkDetails = getLinkDisplayDetails(cfValue.stringValue);
              if (linkDetails.isUrl && linkDetails.fullUrl) {
                displayValue = (
                  <Link 
                    href={linkDetails.fullUrl} 
                    isExternal 
                    color={{ base: 'blue.500', _dark: 'blue.300' }}
                                _hover={{textDecoration: 'underline'}}
                    display="inline-flex"
                    alignItems="center"
                  >
                    {linkDetails.icon && <Icon as={linkDetails.icon} mr={1.5} />}
                    <Text
                      as="span"
                      style={!linkDetails.isKnownService ? {
                        display: 'inline-block',
                                    maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      } : {}}
                    >
                      {linkDetails.displayText}
                    </Text>
                  </Link>
                );
              } else {
                displayValue = cfValue.stringValue;
              }
                    } else {
                        displayValue = '-';
                    }
                    break;
                case CustomFieldType.Number:
                    displayValue = cfValue.numberValue?.toString() || '-';
                    break;
                case CustomFieldType.Boolean:
              displayValue = cfValue.booleanValue ? 'Yes' : 'No';
                    break;
                case CustomFieldType.Date:
                    displayValue = cfValue.dateValue ? new Date(cfValue.dateValue).toLocaleDateString() : '-';
                    break;
                case CustomFieldType.Dropdown:
                case CustomFieldType.MultiSelect:
                    if (cfValue.selectedOptionValues && cfValue.selectedOptionValues.length > 0) {
                        const selectedLabels = cfValue.selectedOptionValues.map(val => {
                            const opt = dropdownOptions?.find(o => o.value === val);
                            return opt ? opt.label : val;
                        });
                        displayValue = selectedLabels.join(', ');
                    } else {
                        displayValue = '-';
                    }
                    break;
                default:
                    displayValue = 'Invalid field type or value';
                    break;
            }

            if (displayValue !== 'N/A' || fieldType === CustomFieldType.Boolean) {
                return (
                    <Flex key={definition.id} justifyContent="space-between" my={1}>
                        <Text fontWeight="semibold">{definition.fieldLabel || definition.fieldName}:</Text>
                        <Text textAlign="right">{displayValue}</Text>
                    </Flex>
                );
            }
            return null;
          })}
        </Box>
      )}

      {dealId && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
          <Heading size="md" mb={3}>Pricing & Quotes</Heading>
          <DealPricingSection dealId={dealId} />
        </Box>
      )}

      <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="md">Activities</Heading>
          <Button onClick={onCreateActivityModalOpen} size="sm" colorScheme="blue" leftIcon={<AddIcon />}>Add Activity</Button>
        </Flex>
        {activitiesLoading && <Spinner />}
        {activitiesError && <Text color="red.500">Error loading activities: {activitiesError}</Text>}
        {!activitiesLoading && !activitiesError && dealActivities.length === 0 && (
          <Text>No activities for this deal yet.</Text>
        )}
        {!activitiesLoading && !activitiesError && dealActivities.map((activity) => (
          <Box key={activity.id} p={3} borderWidth="1px" borderRadius="md" mb={2} borderColor={{ base: 'gray.300', _dark: 'gray.500' }} bg={{ base: 'gray.50', _dark: 'gray.750' }}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={0.5}>
                <Text fontWeight="bold" color={{ base: activity.is_done ? 'gray.500' : 'gray.800', _dark: activity.is_done ? 'gray.500' : 'gray.100' }} textDecoration={activity.is_done ? 'line-through' : 'none'}>
                  <Icon as={getActivityTypeIcon(activity.type as GQLActivityType)} mr={2} color={activity.is_done ? 'green.500' : (activity.type === 'DEADLINE' ? 'orange.400' : 'blue.500')}/>
                  {activity.subject}
                </Text>
                {activity.notes && <Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.300' }}>{activity.notes}</Text>}
                {activity.due_date && <Text fontSize="xs" color={{ base: 'gray.500', _dark: 'gray.400' }}>Due: {new Date(activity.due_date).toLocaleString()}</Text>}
                {activity.assignedToUser && <Text fontSize="xs" color={{ base: 'gray.500', _dark: 'gray.400' }}>To: {activity.assignedToUser.display_name}</Text>}
              </VStack>
              <HStack spacing={1}>
                <Tooltip label={activity.is_done ? "Mark Incomplete" : "Mark Complete"}>
                  <IconButton 
                    icon={activity.is_done ? <CheckIcon /> : <SmallCloseIcon />} 
                    onClick={() => handleToggleActivityComplete(activity)}
                    size="sm"
                    variant="ghost"
                    colorScheme={activity.is_done ? 'green' : 'gray'}
                    aria-label={activity.is_done ? "Mark Incomplete" : "Mark Complete"}
                  />
                </Tooltip>
                <Tooltip label="Edit Activity">
                  <IconButton icon={<EditIcon />} size="sm" variant="ghost" aria-label="Edit Activity" onClick={() => handleEditActivityClick(activity)} />
                </Tooltip>
                <Tooltip label="Delete Activity">
                  <IconButton icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" aria-label="Delete Activity" onClick={() => handleDeleteActivityClick(activity)} />
                </Tooltip>
              </HStack>
            </Flex>
          </Box>
        ))}
      </Box>

      <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
        <Heading size="md" mb={3}>Deal History</Heading>
        {currentDeal && currentDeal.history && currentDeal.history.length > 0 ? (
          <DealHistoryList historyEntries={currentDeal.history} />
        ) : (
          <Text>No history found for this deal.</Text>
        )}
      </Box>

      {currentDeal && !isModernTheme && (
         <EditDealModal 
            isOpen={isEditDealModalOpen} 
            onClose={onEditDealModalClose} 
            deal={currentDeal} 
            onDealUpdated={handleDealUpdated} 
        />
      )}
    </Box>
  );
};

export default DealDetailPage; 