import { Box, Heading, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription, Flex, IconButton, VStack, Link, Icon, Button, HStack, Input, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Tag, Tooltip, Checkbox, Menu, MenuButton, MenuList, MenuItem, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Avatar, Progress, Tabs, TabList, Tab, TabPanels, TabPanel, Grid, GridItem, Center, AlertDialogCloseButton, Select } from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useActivitiesStore, Activity, ActivityType as GQLActivityType, GeneratedActivityFilterInput, GeneratedUpdateActivityInput } from '../stores/useActivitiesStore';
import DealHistoryList from '../components/deals/DealHistoryList';
import CreateActivityForm from '../components/activities/CreateActivityForm';
import EditActivityForm from '../components/activities/EditActivityForm';
import EditDealModal from '../components/EditDealModal';
import { ArrowBackIcon, LinkIcon, EditIcon, AddIcon, EmailIcon, CalendarIcon, WarningIcon, InfoIcon, DeleteIcon, CheckIcon, SmallCloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaClipboardList, FaPhone } from 'react-icons/fa';
import { useThemeStore } from '../stores/useThemeStore';
import { CustomFieldEntityType, CustomFieldType } from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { useUserListStore } from '../stores/useUserListStore';
import DealPricingSection from '../components/pricing/DealPricingSection';

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
      if (url.pathname.includes('/spreadsheets/')) return { isUrl: true, displayText: 'Google Sheet', fullUrl: str, isKnownService: true, icon: LinkIcon };
      if (url.pathname.includes('/document/')) return { isUrl: true, displayText: 'Google Doc', fullUrl: str, isKnownService: true, icon: LinkIcon };
      if (url.pathname.includes('/presentation/') || url.pathname.includes('/drawings/')) return { isUrl: true, displayText: 'Google Slides/Drawing', fullUrl: str, isKnownService: true, icon: LinkIcon };
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
      <>
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
                              {/* Header Section (Breadcrumbs, Title, Tags, Actions) */}
                              <Flex 
                                  direction={{base: "column", md: "row"}}
                                  justifyContent="space-between" 
                                  alignItems={{base: "flex-start", md: "center"}} 
                                  pb={4} 
                                  borderBottomWidth="1px" 
                                  borderColor="gray.700"
                                  mb={2}
                                  gap={2}
                              >
                                  <VStack align="start" spacing={1}>
                                      <HStack spacing={1} color="gray.400" fontSize="sm">
                                          <Link as={RouterLink} to="/deals" color="blue.400" _hover={{textDecoration: 'underline'}}>
                                              Deals
                                          </Link>
                                          <Text>&gt;</Text>
                                          <Text noOfLines={1} maxW={{base: "200px", md: "300px"}} title={currentDeal.name} color="gray.200">{currentDeal.name}</Text>
                                      </HStack>
                                      <Heading size="xl" color="white" noOfLines={1}>{currentDeal.name}</Heading>
                                      <HStack spacing={2} mt={1}>
                                          {currentDeal.currentWfmStep?.status?.name && (
                                              <Tag size="sm" variant="subtle" colorScheme={currentDeal.currentWfmStep.status.color?.toLowerCase() || 'gray'} borderRadius="full" px={3} py={1}>
                                                  {currentDeal.currentWfmStep.status.name}
                                              </Tag>
                                          )}
                                          <Tag size="sm" variant="outline" colorScheme="purple" borderRadius="full" px={3} py={1} borderColor="purple.500" color="purple.400">Enterprise</Tag>
                                          <Tag size="sm" variant="outline" colorScheme="orange" borderRadius="full" px={3} py={1} borderColor="orange.500" color="orange.400">Urgent</Tag>
                                      </HStack>
                                  </VStack>
                                  <HStack spacing={2} mt={{base: 3, md: 0}} flexShrink={0}>
                                      {/* "Edit Deal" IconButton Removed as per user request */}
                                      {/* "+ Log Activity" Button Removed from header as per user request (will keep the one in Activities Tab) */}
                                  </HStack>
                              </Flex>

                              {/* Deal Overview Card (Key Information) */}
                              <Box 
                                  bg="gray.700" 
                                  p={6} 
                                  borderRadius="xl"
                                  border="1px solid"
                                  borderColor="gray.600"
                              >
                                  <Heading size="md" mb={5} color="white">Key Information</Heading>
                                  <VStack spacing={4} align="stretch">
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color="gray.400">Value</Text>
                                          {!isEditingAmount ? (
                                              <HStack spacing={2}>
                                                  <Text fontSize="md" fontWeight="semibold" color="green.300">
                                                      {currentDeal.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(currentDeal.amount) : '-'}
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
                                                      color="gray.400"
                                                      _hover={{color: "blue.300"}}
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
                                                      bg="gray.800"
                                                      borderColor="gray.500"
                                                      _hover={{borderColor: "gray.400"}}
                                                      _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
                                                  />
                                                  <IconButton icon={<CheckIcon />} size="xs" colorScheme="green" aria-label="Save Amount" onClick={async () => {
                                                      if (!dealId) return;
                                                      const numericAmount = parseFloat(newAmount);
                                                      if (isNaN(numericAmount) || numericAmount < 0) {
                                                          toast({ title: 'Invalid Amount', description: 'Please enter a valid positive number.', status: 'error', duration: 3000, isClosable: true });
                                                          return;
                                                      }
                                                      try {
                                                          await updateDealStoreAction(dealId, { amount: numericAmount });
                                                          toast({ title: 'Amount Updated', status: 'success', duration: 2000, isClosable: true });
                                                          setIsEditingAmount(false);
                                                          fetchDealById(dealId); 
                                                      } catch (e) {
                                                          toast({ title: 'Error Updating Amount', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
                                                      }
                                                  }} />
                                                  <IconButton icon={<SmallCloseIcon />} size="xs" variant="ghost" colorScheme="red" aria-label="Cancel Edit Amount" onClick={() => setIsEditingAmount(false)} />
                                              </HStack>
                                          )}
                                      </HStack>
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color="gray.400">Probability</Text>
                                          <HStack flex={1} justifyContent="flex-end" spacing={2} maxW="60%">
                                              <Progress value={getEffectiveProbabilityDisplay.value ? getEffectiveProbabilityDisplay.value * 100 : 0} size="xs" colorScheme="blue" flex={1} borderRadius="full" bg="gray.600" />
                                              <Text fontSize="sm" fontWeight="medium" color="blue.300" minW="40px" textAlign="right">
                                                  {getEffectiveProbabilityDisplay.value != null ? `${(getEffectiveProbabilityDisplay.value * 100).toFixed(0)}%` : 'N/A'}
                                              </Text>
                                          </HStack>
                                      </HStack>
                                      <HStack justifyContent="space-between" alignItems="center">
                                          <Text fontSize="sm" color="gray.400">Expected Close Date</Text>
                                          {!isEditingCloseDate ? (
                                              <HStack spacing={2}>
                                                  <Text fontSize="md" fontWeight="medium" color="gray.200">
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
                                                      color="gray.400"
                                                      _hover={{color: "blue.300"}}
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
                                                      bg="gray.800"
                                                      borderColor="gray.500"
                                                      _hover={{borderColor: "gray.400"}}
                                                      _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
                                                  />
                                                  <IconButton icon={<CheckIcon />} size="xs" colorScheme="green" aria-label="Save Expected Close Date" onClick={async () => {
                                                      if (!dealId) return;
                                                      if (!newCloseDateStr) {
                                                          try {
                                                              await updateDealStoreAction(dealId, { expected_close_date: null });
                                                              toast({ title: 'Expected Close Date Cleared', status: 'success', duration: 2000, isClosable: true });
                                                              setIsEditingCloseDate(false);
                                                              fetchDealById(dealId); 
                                                          } catch (e) {
                                                              toast({ title: 'Error Clearing Date', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
                                                          }
                                                          return;
                                                      }
                                                      try {
                                                          await updateDealStoreAction(dealId, { expected_close_date: newCloseDateStr });
                                                          toast({ title: 'Expected Close Date Updated', status: 'success', duration: 2000, isClosable: true });
                                                          setIsEditingCloseDate(false);
                                                          fetchDealById(dealId); 
                                                      } catch (e) {
                                                          toast({ title: 'Error Updating Date', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
                                                      }
                                                  }} />
                                                  <IconButton icon={<SmallCloseIcon />} size="xs" variant="ghost" colorScheme="red" aria-label="Cancel Edit Date" onClick={() => setIsEditingCloseDate(false)} />
                                              </HStack>
                                          )}
                                      </HStack>
                                      <HStack justifyContent="space-between">
                                          <Text fontSize="sm" color="gray.400">Owner</Text>
                                          {!isEditingOwner ? (
                                              <HStack spacing={2}>
                                                  <Avatar 
                                                      size="xs" 
                                                      name={currentDeal.assignedToUser?.display_name || 'Unassigned'} 
                                                      src={currentDeal.assignedToUser?.avatar_url || undefined}
                                                      bg="gray.500"
                                                  />
                                                  <Text fontSize="md" fontWeight="medium" color="gray.200">
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
                                                      color="gray.400"
                                                      _hover={{color: "blue.300"}}
                                                  />
                                              </HStack>
                                          ) : (
                                              <HStack spacing={2} flex={1} justifyContent="flex-end">
                                                  <Select 
                                                      value={newOwnerId || ''}
                                                      onChange={(e) => setNewOwnerId(e.target.value || null)}
                                                      size="sm" 
                                                      w="180px"
                                                      bg="gray.800"
                                                      borderColor="gray.500"
                                                      _hover={{borderColor: "gray.400"}}
                                                      _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
                                                  >
                                                      <option value="">Unassigned</option>
                                                      {userList.map(user => (
                                                          <option key={user.id} value={user.id}>
                                                              {user.display_name || user.email}
                                                          </option>
                                                      ))}
                                                  </Select>
                                                  <IconButton icon={<CheckIcon />} size="xs" colorScheme="green" aria-label="Save Owner" onClick={async () => {
                                                      if (!dealId) return;
                                                      try {
                                                          await updateDealStoreAction(dealId, { assignedToUserId: newOwnerId });
                                                          toast({ title: 'Owner Updated', status: 'success', duration: 2000, isClosable: true });
                                                          setIsEditingOwner(false);
                                                          fetchDealById(dealId); 
                                                      } catch (e) {
                                                          toast({ title: 'Error Updating Owner', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
                                                      }
                                                  }} />
                                                  <IconButton icon={<SmallCloseIcon />} size="xs" variant="ghost" colorScheme="red" aria-label="Cancel Edit Owner" onClick={() => setIsEditingOwner(false)} />
                                              </HStack>
                                          )}
                                      </HStack>
                                  </VStack>
                              </Box>

                              {/* Tabs Section */}
                              <Box bg="gray.700" borderRadius="xl" border="1px solid" borderColor="gray.600" >
                                  <Tabs variant="line" colorScheme="blue" size="md" isFitted>
                                      <TabList borderBottomColor="gray.600">
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">Overview</Tab>
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">Activities ({dealActivities.length})</Tab>
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">Pricing</Tab>
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">Related</Tab>
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">Custom Fields</Tab>
                                          <Tab _selected={{ color: 'blue.300', borderColor: 'blue.300' }} color="gray.400" fontWeight="medium">History</Tab>
                                      </TabList>
                                      <TabPanels p={{base:3, md: 4}}>
                                          <TabPanel>
                                              <Heading size="sm" mb={4} color="white">Deal Overview</Heading>
                                              <VStack spacing={3} align="stretch">
                                                  {(currentDeal as any).description && (
                                                      <Box>
                                                          <Text fontSize="sm" fontWeight="semibold" color="gray.400">Description</Text>
                                                          <Text mt={1} fontSize="sm" color="gray.200" whiteSpace="pre-wrap">{(currentDeal as any).description}</Text>
                                                      </Box>
                                                  )}
                                                  <Flex justifyContent="space-between">
                                                      <Text fontSize="sm" color="gray.400">Created On</Text>
                                                      <Text fontSize="sm" color="gray.200">{new Date(currentDeal.created_at).toLocaleString()}</Text>
                                                  </Flex>
                                                  <Flex justifyContent="space-between">
                                                      <Text fontSize="sm" color="gray.400">Last Updated</Text>
                                                      <Text fontSize="sm" color="gray.200">{new Date(currentDeal.updated_at).toLocaleString()}</Text>
                                                  </Flex>
                                              </VStack>
                                          </TabPanel>
                                          <TabPanel>
                                              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                                  <Heading size="sm" color="white">Activities</Heading>
                                                  <Button leftIcon={<AddIcon />} size="sm" colorScheme="blue" onClick={onCreateActivityModalOpen} variant="solid">
                                                      Add Activity
                                                  </Button>
                                              </Flex>
                                              {activitiesLoading && <Center><Spinner color="blue.400"/></Center>}
                                              {activitiesError && <Text color="red.400">Error: {activitiesError}</Text>}
                                              {!activitiesLoading && !activitiesError && dealActivities.length === 0 && (
                                                  <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
                                                    <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
                                                    <Text color="gray.400" fontSize="sm">No activities for this deal yet.</Text>
                                                  </Center>
                                              )}
                                              {!activitiesLoading && !activitiesError && dealActivities.length > 0 && (
                                                  <VStack spacing={3} align="stretch">
                                                      {dealActivities.map((activity) => (
                                                          <Flex key={activity.id} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.600" justifyContent="space-between" alignItems="center" bg="gray.750" _hover={{borderColor: "blue.400"}}>
                                                              <HStack spacing={3} alignItems="center">
                                                                  <Tooltip label={activity.is_done ? "Mark Incomplete" : "Mark Complete"} bg="gray.600" color="white">
                                                                      <IconButton 
                                                                          icon={activity.is_done ? <CheckIcon /> : <SmallCloseIcon />} 
                                                                          onClick={() => handleToggleActivityComplete(activity)}
                                                                          size="sm"
                                                                          variant="ghost"
                                                                          colorScheme={activity.is_done ? 'green' : 'gray'}
                                                                          aria-label={activity.is_done ? "Mark Incomplete" : "Mark Complete"}
                                                                          color={activity.is_done ? "green.400" : "gray.300"}
                                                                          _hover={{bg: "gray.600"}}
                                                                      />
                                                                  </Tooltip>
                                                                  <Icon as={getActivityTypeIcon(activity.type as GQLActivityType)} color={activity.is_done ? "green.400" : "gray.300"} boxSize={4}/>
                                                                  <VStack align="start" spacing={0}>
                                                                      <Text fontWeight="medium" color={activity.is_done ? "gray.500" : "gray.100"} textDecoration={activity.is_done ? 'line-through' : 'none'} fontSize="sm">
                                                                          {activity.subject}
                                                                      </Text>
                                                                      {activity.due_date && (
                                                                          <Text fontSize="xs" color="gray.400">
                                                                              Due: {new Date(activity.due_date).toLocaleDateString()} {new Date(activity.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                          </Text>
                                                                      )}
                                                                      {activity.assignedToUser && <Text fontSize="xs" color="gray.400">To: {activity.assignedToUser.display_name}</Text>}
                                                                      {activity.is_system_activity && <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full">System</Tag>}
                                                                  </VStack>
                                                              </HStack>
                                                              <HStack spacing={1}>
                                                                  <Tooltip label="Edit Activity" bg="gray.600" color="white">
                                                                      <IconButton icon={<EditIcon />} size="xs" variant="ghost" aria-label="Edit Activity" onClick={() => handleEditActivityClick(activity)} color="gray.300" _hover={{color: "blue.300", bg:"gray.600"}}/>
                                                                  </Tooltip>
                                                                  <Tooltip label="Delete Activity" bg="gray.600" color="white">
                                                                      <IconButton icon={<DeleteIcon />} size="xs" variant="ghost" colorScheme="red" aria-label="Delete Activity" onClick={() => handleDeleteActivityClick(activity)} color="red.500" _hover={{color: "red.300", bg:"gray.600"}}/>
                                                                  </Tooltip>
                                                              </HStack>
                                                          </Flex>
                                                      ))}
                                                  </VStack>
                                              )}
                                          </TabPanel>
                                          <TabPanel>
                                            {dealId && <DealPricingSection dealId={dealId} />}
                                          </TabPanel>
                                          <TabPanel>
                                              <Heading size="sm" mb={4} color="white">Related People & Organizations</Heading>
                                              <VStack spacing={5} align="stretch">
                                                  {currentDeal.person && (
                                                      <Box p={4} bg="gray.750" borderRadius="lg" borderWidth="1px" borderColor="gray.600">
                                                          <Heading size="xs" mb={2} color="gray.200">Primary Contact</Heading>
                                                          <HStack spacing={3}>
                                                              <Avatar 
                                                                  size="sm"
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
                                                      <Box p={4} bg="gray.750" borderRadius="lg" borderWidth="1px" borderColor="gray.600">
                                                          <Heading size="xs" mb={2} color="gray.200">Primary Organization</Heading>
                                                          <HStack spacing={3}>
                                                              <VStack align="start" spacing={0}>
                                                                  <Link as={RouterLink} to={`/organizations/${currentDeal.organization.id}`} fontWeight="medium" color="blue.300" _hover={{textDecoration: 'underline'}}>
                                                                      {currentDeal.organization.name}
                                                                  </Link>
                                                              </VStack>
                                                          </HStack>
                                                      </Box>
                                                  )}
                                                  {!currentDeal.person && !currentDeal.organization && (
                                                      <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
                                                        <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
                                                        <Text color="gray.400" fontSize="sm">No primary contact or organization linked.</Text>
                                                      </Center>
                                                  )}
                                              </VStack>
                                          </TabPanel>
                                          <TabPanel>
                                              <Heading size="sm" mb={3} color="white">Custom Information</Heading>
                                              {customFieldDefinitions && currentDeal.customFieldValues && currentDeal.customFieldValues.length > 0 ? (
                                                  <VStack spacing={3} align="stretch" bg="gray.750" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.600">
                                                      {currentDeal.customFieldValues
                                                        .filter(cfv => customFieldDefinitions.find(cfd => cfd.id === cfv.definition.id)?.isActive)
                                                        .sort((a,b) => {
                                                          const defA = customFieldDefinitions.find(def => def.id === a.definition.id);
                                                          const defB = customFieldDefinitions.find(def => def.id === b.definition.id);
                                                          return (defA?.displayOrder || 0) - (defB?.displayOrder || 0);
                                                        })
                                                        .map(cfv => {
                                                          let displayValue: string | React.ReactNode = '-';
                                                          const definition = customFieldDefinitions.find(def => def.id === cfv.definition.id);
                                                          if (!definition) return null;

                                                          switch (definition.fieldType) {
                                                              case CustomFieldType.Text: 
                                                                  displayValue = cfv.stringValue || '-';
                                                                  if (cfv.stringValue && (cfv.stringValue.startsWith('http://') || cfv.stringValue.startsWith('https://'))) {
                                                                      const linkDetails = getLinkDisplayDetails(cfv.stringValue);
                                                                      if (linkDetails.isUrl) { 
                                                                          displayValue = <Link href={linkDetails.fullUrl} color="blue.400" isExternal _hover={{textDecoration: 'underline'}}>{linkDetails.displayText} <ExternalLinkIcon mx='2px' /></Link>;
                                                                      }
                                                                  }
                                                                  break;
                                                              case CustomFieldType.Number:
                                                                  displayValue = cfv.numberValue?.toString() || '-';
                                                                  break;
                                                              case CustomFieldType.Boolean:
                                                                  displayValue = cfv.booleanValue ? 'Yes' : 'No';
                                                                  break;
                                                              case CustomFieldType.Date:
                                                                  displayValue = cfv.dateValue ? new Date(cfv.dateValue).toLocaleDateString() : '-';
                                                                  break;
                                                              case CustomFieldType.Dropdown:
                                                              case CustomFieldType.MultiSelect:
                                                                  if (cfv.selectedOptionValues && cfv.selectedOptionValues.length > 0) {
                                                                      const selectedLabels = cfv.selectedOptionValues.map(val => {
                                                                          const opt = definition.dropdownOptions?.find(o => o.value === val);
                                                                          return opt ? opt.label : val;
                                                                      });
                                                                      displayValue = selectedLabels.join(', ');
                                                                  } else {
                                                                      displayValue = '-';
                                                                  }
                                                                  break;
                                                              default:
                                                                  if (cfv.stringValue) displayValue = cfv.stringValue;
                                                                  else if (cfv.numberValue !== null && cfv.numberValue !== undefined) displayValue = cfv.numberValue.toString();
                                                                  else if (cfv.booleanValue !== null && cfv.booleanValue !== undefined) displayValue = cfv.booleanValue ? 'Yes' : 'No';
                                                                  else if (cfv.dateValue) displayValue = new Date(cfv.dateValue).toLocaleDateString();
                                                                  else displayValue = 'N/A';
                                                                  break;
                                                          }
                                                          return (
                                                              <Flex key={definition.id} justifyContent="space-between" alignItems="center" py={1.5} borderBottomWidth="1px" borderColor="gray.650" _last={{borderBottomWidth: 0}}>
                                                                  <Text fontSize="sm" color="gray.400" casing="capitalize">
                                                                      {definition.fieldLabel || definition.fieldName}
                                                                  </Text>
                                                                  <Text fontSize="sm" color="gray.200" textAlign="right">{displayValue}</Text>
                                                              </Flex>
                                                          );
                                                        })}
                                                  </VStack>
                                              ) : (
                                                  <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
                                                    <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
                                                    <Text color="gray.400" fontSize="sm">No custom information available.</Text>
                                                  </Center>
                                              )}
                                          </TabPanel>
                                          <TabPanel>
                                              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                                  <Heading size="sm" color="white">Deal History</Heading>
                                              </Flex>
                                              {currentDeal && currentDeal.history && currentDeal.history.length > 0 ? (
                                                  <Box bg="gray.750" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.600">
                                                      <DealHistoryList historyEntries={currentDeal.history} />
                                                  </Box>
                                              ) : (
                                                  <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
                                                    <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
                                                    <Text color="gray.400" fontSize="sm">No history found for this deal.</Text>
                                                  </Center>
                                              )}
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
                                              {currentDeal.person.email && <Link href={`mailto:${currentDeal.person.email}`} fontSize="sm" color="blue.400" _hover={{textDecoration: 'underline'}}>{currentDeal.person.email}</Link>}
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
                              
                              <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600">
                                  <Heading size="sm" mb={3} color="white">Recent Activities</Heading>
                                  <VStack spacing={3} align="stretch">
                                      {dealActivities.length > 0 ? dealActivities.slice(0, 5).map(activity => (
                                          <HStack key={activity.id} spacing={2.5} fontSize="sm" p={2} bg="gray.750" borderRadius="md" border="1px solid" borderColor="gray.600">
                                              <Icon as={getActivityTypeIcon(activity.type as GQLActivityType)} color={activity.is_done ? "green.400" : "gray.400"} boxSize={4}/>
                                              <Text color={activity.is_done ? "gray.500" : "gray.200"} textDecoration={activity.is_done ? 'line-through' : 'none'} noOfLines={1} title={activity.subject}>{activity.subject}</Text>
                                          </HStack>
                                      )) : (
                                        <Center minH="80px" flexDirection="column" bg="gray.750" borderRadius="md" p={3} border="1px dashed" borderColor="gray.600">
                                          <Icon as={InfoIcon} w={5} h={5} color="gray.500" mb={2} />
                                          <Text fontSize="xs" color="gray.400">No recent activities.</Text>
                                        </Center>
                                      )}
                                      {dealActivities.length > 5 && <Button variant="link" colorScheme="blue" size="sm" onClick={() => { /* TODO: Scroll to activities tab or focus it */ }}>View all ({dealActivities.length})</Button>}
                                  </VStack>
                              </Box>
                          </VStack>
                      )}
                      {(isLoadingDeal || (!currentDeal && !dealError)) && (
                          <VStack spacing={6} align="stretch">
                            <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600"><Heading size="sm" mb={3} color="white">Primary Contact</Heading><Spinner size="sm" color="blue.300"/></Box>
                            <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600"><Heading size="sm" mb={3} color="white">Organization</Heading><Spinner size="sm" color="blue.300"/></Box>
                            <Box p={5} bg="gray.700" borderRadius="lg" border="1px solid" borderColor="gray.600"><Heading size="sm" mb={3} color="white">Recent Activities</Heading><Spinner size="sm" color="blue.300"/></Box>
                          </VStack>
                      )}
                  </GridItem>
              </Grid>
          </Box>
          {/* EditDealModal is not rendered in modern theme based on current logic (inline editing preferred) */}
      </Box>

        {/* Modals for Modern Theme - Copied from non-modern section and adapted for visibility */}
        {currentDeal && (
          <Modal isOpen={isCreateActivityModalOpen} onClose={onCreateActivityModalClose} size="xl" isCentered>
            <ModalOverlay bg={isModernTheme ? "blackAlpha.600" : "blackAlpha.300"} /> 
            <ModalContent 
              bg={isModernTheme ? "gray.800" : "white"} 
              color={isModernTheme ? "white" : "inherit"}
              borderColor={isModernTheme ? "gray.600" : "gray.200"} 
              borderWidth={isModernTheme ? "1px" : "0px"}
            >
              <ModalHeader color={isModernTheme ? "white" : "inherit"}>Add New Activity for Deal: {currentDeal.name}</ModalHeader>
              <ModalCloseButton _focus={{ boxShadow: isModernTheme ? "outlineBlue" : "outline" }} />
              <ModalBody pb={6}>
                <CreateActivityForm 
                  onClose={onCreateActivityModalClose} 
                  onSuccess={handleActivityCreated} 
                  initialDealId={currentDeal.id}
                  initialDealName={currentDeal.name}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {selectedActivity && currentDeal && (
          <Modal isOpen={isEditActivityModalOpen} onClose={onEditActivityModalClose} size="xl" isCentered>
            <ModalOverlay bg={isModernTheme ? "blackAlpha.600" : "blackAlpha.300"} />
            <ModalContent 
              bg={isModernTheme ? "gray.800" : "white"} 
              color={isModernTheme ? "white" : "inherit"}
              borderColor={isModernTheme ? "gray.600" : "gray.200"} 
              borderWidth={isModernTheme ? "1px" : "0px"}
            >
              <ModalHeader color={isModernTheme ? "white" : "inherit"}>Edit Activity for Deal: {currentDeal.name}</ModalHeader>
              <ModalCloseButton _focus={{ boxShadow: isModernTheme ? "outlineBlue" : "outline" }} />
              <ModalBody pb={6}>
                <EditActivityForm 
                  activity={selectedActivity} 
                  onClose={onEditActivityModalClose} 
                  onSuccess={handleActivityUpdated} 
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {activityToDelete && (
          <AlertDialog
            isOpen={isDeleteConfirmOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteConfirmClose}
            isCentered
          >
            <AlertDialogOverlay bg={isModernTheme ? "blackAlpha.800" : "blackAlpha.400"} >
              <AlertDialogContent bg={isModernTheme ? "gray.800" : "white"} color={isModernTheme ? "white" : "inherit"} borderColor={isModernTheme ? "gray.700" : "gray.200"} borderWidth={isModernTheme ? "1px" : "0"}>
                <AlertDialogHeader fontSize="lg" fontWeight="bold" color={isModernTheme ? "white" : "inherit"}>
                  Delete Activity
                </AlertDialogHeader>
                <AlertDialogCloseButton _focus={{ boxShadow: isModernTheme ? "outlineBlue" : "outline" }} />
                <AlertDialogBody color={isModernTheme ? "gray.200" : "inherit"}>
                  Are you sure you want to delete the activity "<strong>{activityToDelete.subject}</strong>"?
                  This action cannot be undone.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDeleteConfirmClose} variant={isModernTheme ? "outline" : "ghost"} borderColor={isModernTheme ? "gray.600" : "gray.200"} _hover={isModernTheme ? {bg: "gray.700"} : {}}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={confirmDeleteActivity} ml={3}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        )}
      </>
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