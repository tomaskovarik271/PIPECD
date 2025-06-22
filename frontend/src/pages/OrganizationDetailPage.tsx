import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Avatar,
  Tag,
  Flex,
  Progress,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon, EditIcon, CheckIcon, SmallCloseIcon, CalendarIcon, EmailIcon, AddIcon } from '@chakra-ui/icons';
import { FaClipboardList, FaPhone, FaBuilding, FaUsers, FaHandshake } from 'react-icons/fa';

// Store imports
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { useAppStore } from '../stores/useAppStore';
import { useActivitiesStore, Activity, ActivityType as GQLActivityType } from '../stores/useActivitiesStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useThemeStore } from '../stores/useThemeStore';

// Component imports
import AccountManagerAssignmentModal from '../components/admin/AccountManagerAssignmentModal';
import CreateActivityForm from '../components/activities/CreateActivityForm';
import EditActivityForm from '../components/activities/EditActivityForm';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';

const getActivityTypeIcon = (type?: GQLActivityType | null) => {
  switch (type) {
    case 'TASK': return FaClipboardList;
    case 'MEETING': return CalendarIcon;
    case 'CALL': return FaPhone;
    case 'EMAIL': return EmailIcon;
    case 'DEADLINE': return WarningIcon;
    default: return CalendarIcon;
  }
};

const getDealStatusColor = (currentWfmStep?: any) => {
  if (!currentWfmStep) return 'gray';
  if (currentWfmStep.isFinalStep) return 'green';
  return 'blue';
};

const formatDealAmount = (amount?: number | null, currency?: string | null) => {
  if (!amount) return 'No amount';
  return CurrencyFormatter.format(amount, currency || 'USD');
};

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Theme and styling
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)';
      default:
        return 'transparent';
    }
  };

  // Store state
  const fetchOrganizationById = useOrganizationsStore((state) => state.fetchOrganizationById);
  const updateOrganization = useOrganizationsStore((state) => state.updateOrganization);
  const currentOrganization = useOrganizationsStore((state) => state.currentOrganization);
  const isLoadingOrganization = useOrganizationsStore((state) => state.isLoadingSingleOrganization);
  const organizationError = useOrganizationsStore((state) => state.errorSingleOrganization);
  
  // User permissions
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  
  // Activity store
  const {
    activities,
    fetchActivities,
    updateActivity,
    deleteActivity,
    activitiesLoading,
    activitiesError,
  } = useActivitiesStore();

  // Deals store
  const {
    deals,
    fetchDeals,
    deleteDeal,
    dealsLoading,
    dealsError,
  } = useDealsStore();

  // Organization activities
  const organizationActivities = useMemo(() => {
    if (!organizationId || !activities) return [];
    return activities.filter(activity => activity.organization_id === organizationId);
  }, [activities, organizationId]);

  // Organization deals
  const organizationDeals = useMemo(() => {
    if (!organizationId || !deals) return [];
    return deals.filter(deal => deal.organization_id === organizationId);
  }, [deals, organizationId]);

  // Permission checks
  const canEditOrganization = userPermissions?.includes('organization:update_any');
  const canAssignAccountManager = userPermissions?.includes('app_settings:manage'); // Only admins can assign account managers

  // Modal states
  const { isOpen: isAccountManagerModalOpen, onOpen: onAccountManagerModalOpen, onClose: onAccountManagerModalClose } = useDisclosure();
  const { isOpen: isCreateActivityModalOpen, onOpen: onCreateActivityModalOpen, onClose: onCreateActivityModalClose } = useDisclosure();
  const { isOpen: isEditActivityModalOpen, onOpen: onEditActivityModalOpen, onClose: onEditActivityModalClose } = useDisclosure();
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
  
  // Deal modal states
  const { isOpen: isCreateDealModalOpen, onOpen: onCreateDealModalOpen, onClose: onCreateDealModalClose } = useDisclosure();
  const { isOpen: isEditDealModalOpen, onOpen: onEditDealModalOpen, onClose: onEditDealModalClose } = useDisclosure();
  const { isOpen: isDealDeleteConfirmOpen, onOpen: onDealDeleteConfirmOpen, onClose: onDealDeleteConfirmClose } = useDisclosure();

  // Activity states
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Deal states
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const cancelDealRef = useRef<HTMLButtonElement>(null);

  // Inline editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isEditingIndustry, setIsEditingIndustry] = useState(false);
  const [newIndustry, setNewIndustry] = useState('');
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');

  // Fetch data
  useEffect(() => {
    if (organizationId) {
      fetchOrganizationById(organizationId);
      fetchActivities(); // Fetch all activities to filter by organization
      fetchDeals(); // Fetch all deals to filter by organization
    }
  }, [organizationId, fetchOrganizationById, fetchActivities, fetchDeals]);

  // Debug logging for account manager data
  useEffect(() => {
    if (currentOrganization) {
      console.log('Organization data after service fix:', {
        organization: currentOrganization,
        accountManager: currentOrganization?.accountManager,
        account_manager_id: currentOrganization?.account_manager_id,
        fullOrganizationObject: JSON.stringify(currentOrganization, null, 2)
      });
    }
  }, [currentOrganization]);



  // Activity handlers
  const handleActivityCreated = () => {
    fetchActivities();
    onCreateActivityModalClose();
  };

  const handleActivityUpdated = () => {
    fetchActivities();
    onEditActivityModalClose();
  };

  const handleEditActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    onEditActivityModalOpen();
  };

  const handleDeleteActivityClick = (activity: Activity) => {
    setActivityToDelete(activity);
    onDeleteConfirmOpen();
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    try {
      await deleteActivity(activityToDelete.id);
      toast({ title: 'Activity deleted.', status: 'success', duration: 3000, isClosable: true });
      fetchActivities();
    } catch (error) {
      toast({ title: 'Error deleting activity', description: (error as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
    
    setActivityToDelete(null);
    onDeleteConfirmClose();
  };

  const handleToggleActivityComplete = async (activity: Activity) => {
    try {
      await updateActivity(activity.id, { is_done: !activity.is_done });
      fetchActivities();
    } catch (error) {
      toast({ title: 'Error updating activity', description: (error as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  // Deal handlers
  const handleDealCreated = () => {
    fetchDeals();
    onCreateDealModalClose();
  };

  const handleDealUpdated = () => {
    fetchDeals();
    onEditDealModalClose();
  };

  const handleEditDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    onEditDealModalOpen();
  };

  const handleDeleteDealClick = (deal: Deal) => {
    setDealToDelete(deal);
    onDealDeleteConfirmOpen();
  };

  const confirmDeleteDeal = async () => {
    if (!dealToDelete) return;
    
    try {
      await deleteDeal(dealToDelete.id);
      toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
      fetchDeals();
    } catch (error) {
      toast({ title: 'Error deleting deal', description: (error as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
    
    setDealToDelete(null);
    onDealDeleteConfirmClose();
  };

  const handleDealClick = (deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  };

  // Inline editing handlers
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

  return (
    <Box 
      h="calc(100vh - 40px)" 
      maxH="calc(100vh - 40px)"
      m={0} 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      bg={colors.bg.app}
    >
      <Grid 
        templateColumns="1fr 450px" 
        templateRows="1fr" 
        gap={0} 
        h="full" 
        w="full" 
        maxW="100%" 
        bg={colors.bg.surface}
        borderRadius="xl" 
        borderWidth="1px"
        borderColor={colors.border.default}
        overflow="hidden"
      >
        {/* Left Content Area */}
        <GridItem colSpan={1} overflow="hidden">
          <Box h="full" display="flex" flexDirection="column">
        {isLoadingOrganization && (
          <Center h="full">
                <Spinner size="xl" color={colors.interactive.default} />
          </Center>
        )}
        
        {organizationError && (
              <Center h="full" p={6}>
                <Alert status="error" variant="subtle" borderRadius="lg">
                  <AlertIcon />
            <AlertTitle>Error Loading Organization!</AlertTitle>
            <AlertDescription>
              {typeof organizationError === 'string' ? organizationError : JSON.stringify(organizationError)}
            </AlertDescription>
          </Alert>
              </Center>
        )}
        
        {!isLoadingOrganization && !organizationError && currentOrganization && (
              <VStack spacing={0} align="stretch" h="full">
                {/* Header */}
            <Box 
                  p={6} 
              borderBottomWidth="1px" 
                  borderColor={colors.border.default}
                  bg={colors.bg.elevated}
            >
              <Breadcrumb 
                spacing="8px" 
                    separator={<Text color={colors.text.muted}>/</Text>}
                    color={colors.text.muted}
                fontSize="sm"
                    mb={3}
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
                  
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={FaBuilding} w={8} h={8} color={colors.text.primary} />
                      <Heading size="xl" color={colors.text.primary}>
                {currentOrganization.name}
              </Heading>
                    </HStack>

                  </HStack>
            </Box>

                {/* Tabs Content */}
                <Box flex="1" overflow="hidden">
                  <Tabs h="full" display="flex" flexDirection="column" variant="line">
                    <TabList 
                      px={6} 
                      borderBottomColor={colors.border.default}
                      bg={colors.bg.elevated}
                    >
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Activities</Text>
                          <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="xs">
                            {organizationActivities.length}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Deals</Text>
                          <Badge colorScheme="green" variant="solid" borderRadius="full" fontSize="xs">
                            {(currentOrganization as any).activeDealCount || 0}
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>Contacts</Text>
                          <Badge colorScheme="purple" variant="solid" borderRadius="full" fontSize="xs">
                            0
                          </Badge>
                        </HStack>
                      </Tab>
                      <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                        Information
                      </Tab>
                    </TabList>
                    
                    <TabPanels flex="1" overflow="hidden">
                      {/* Activities Tab */}
                      <TabPanel h="full" p={6} overflow="auto">
                        <VStack spacing={4} align="stretch">
                          {/* Header with Add Activity Button */}
                          <HStack justify="space-between" align="center">
                            <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                              Organization Activities
                            </Text>
                            <Button
                              leftIcon={<AddIcon />}
                              colorScheme="green"
                              size="sm"
                              onClick={onCreateActivityModalOpen}
                            >
                              Add Activity
                            </Button>
                          </HStack>
                          {activitiesLoading && (
                            <Center h="200px">
                              <Spinner size="lg" color={colors.interactive.default} />
                            </Center>
                          )}
                          
                          {activitiesError && (
                            <Alert status="error">
                              <AlertIcon />
                              Error loading activities: {activitiesError}
                            </Alert>
                          )}
                          
                          {!activitiesLoading && !activitiesError && organizationActivities.length === 0 && (
                            <Center h="200px" flexDirection="column">
                              <Icon as={CalendarIcon} w={12} h={12} color={colors.text.muted} mb={4} />
                              <Text color={colors.text.muted} fontSize="lg" mb={4}>No activities yet</Text>
                              <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={onCreateActivityModalOpen}
                              >
                                Create First Activity
                              </Button>
                            </Center>
                          )}
                          
                          {organizationActivities.map((activity) => (
                            <Box
                              key={activity.id}
                              p={4}
                              bg={colors.bg.elevated}
                              borderRadius="lg"
              borderWidth="1px" 
                              borderColor={colors.border.default}
                              _hover={{ borderColor: colors.border.emphasis }}
                            >
                              <HStack justify="space-between" align="start">
                                <HStack spacing={3} flex="1">
                                  <Icon 
                                    as={getActivityTypeIcon(activity.type)} 
                                    w={5} 
                                    h={5} 
                                    color={activity.is_done ? colors.status.success : colors.text.primary} 
                                  />
                                  <VStack align="start" spacing={1} flex="1">
                                    <Text 
                                      fontSize="md" 
                                      fontWeight="medium" 
                                      color={activity.is_done ? colors.text.muted : colors.text.primary}
                                      textDecoration={activity.is_done ? 'line-through' : 'none'}
                                    >
                                      {activity.subject}
                                    </Text>
                                    {activity.due_date && (
                                      <Text fontSize="sm" color={colors.text.muted}>
                                        Due: {new Date(activity.due_date).toLocaleDateString()}
                                      </Text>
                                    )}
                                    {activity.notes && (
                                      <Text fontSize="sm" color={colors.text.secondary} noOfLines={2}>
                                        {activity.notes}
                                      </Text>
                                    )}
                                  </VStack>
                                </HStack>
                                <HStack spacing={1}>
                                  <IconButton
                                    icon={<CheckIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme={activity.is_done ? "gray" : "green"}
                                    aria-label="Toggle Complete"
                                    onClick={() => handleToggleActivityComplete(activity)}
                                  />
                                  <IconButton
                                    icon={<EditIcon />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Edit Activity"
                                    onClick={() => handleEditActivityClick(activity)}
                                  />
                                  <IconButton
                                    icon={<SmallCloseIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    aria-label="Delete Activity"
                                    onClick={() => handleDeleteActivityClick(activity)}
                                  />
                                </HStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      </TabPanel>
                      
                      {/* Deals Tab */}
                      <TabPanel h="full" p={6} overflow="auto">
                        <VStack spacing={4} align="stretch">
                          {/* Header with Add Deal Button */}
                          <HStack justify="space-between" align="center">
                            <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                              Organization Deals
                            </Text>
                            <Button
                              leftIcon={<AddIcon />}
                              colorScheme="green"
                              size="sm"
                              onClick={onCreateDealModalOpen}
                            >
                              Add Deal
                            </Button>
                          </HStack>

                          {dealsLoading && (
                            <Center h="200px">
                              <Spinner size="lg" color={colors.interactive.default} />
                            </Center>
                          )}
                          
                          {dealsError && (
                            <Alert status="error">
                              <AlertIcon />
                              Error loading deals: {dealsError}
                            </Alert>
                          )}
                          
                          {!dealsLoading && !dealsError && organizationDeals.length === 0 && (
                            <Center h="200px" flexDirection="column">
                              <Icon as={FaHandshake} w={12} h={12} color={colors.text.muted} mb={4} />
                              <Text color={colors.text.muted} fontSize="lg" mb={4}>No deals yet</Text>
                              <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={onCreateDealModalOpen}
                              >
                                Create First Deal
                              </Button>
                            </Center>
                          )}
                          
                                                     {organizationDeals.map((deal) => (
                             <Box
                               key={deal.id}
                               p={5}
                               bg={colors.bg.elevated}
                               borderRadius="lg"
                               borderWidth="1px" 
                               borderColor={colors.border.default}
                               _hover={{ borderColor: colors.border.emphasis, cursor: 'pointer' }}
                               onClick={() => handleDealClick(deal)}
                             >
                              <VStack align="stretch" spacing={4}>
                                {/* Deal Header */}
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={2} flex="1">
                                    <HStack spacing={3}>
                                      <Icon as={FaHandshake} w={5} h={5} color={colors.text.primary} />
                                                                             <Text 
                                         fontSize="lg" 
                                         fontWeight="semibold" 
                                         color={colors.text.primary}
                                       >
                                         {deal.name}
                                       </Text>
                                       <Badge 
                                         colorScheme={getDealStatusColor(deal.currentWfmStep)} 
                                         variant="solid" 
                                         borderRadius="full"
                                       >
                                         {deal.currentWfmStep?.status?.name || 'No Stage'}
                                       </Badge>
                                    </HStack>
                                    
                                    <HStack spacing={4}>
                                      <Text fontSize="xl" fontWeight="bold" color={colors.status.success}>
                                        {formatDealAmount(deal.amount, deal.currency)}
                                      </Text>
                                                                             {deal.expected_close_date && (
                                         <Text fontSize="sm" color={colors.text.muted}>
                                           Expected close: {new Date(deal.expected_close_date).toLocaleDateString()}
                                         </Text>
                                       )}
                                    </HStack>
                                  </VStack>
                                  
                                  <HStack spacing={1}>
                                    <IconButton
                                      icon={<EditIcon />}
                                      size="sm"
                                      variant="ghost"
                                      aria-label="Edit Deal"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditDealClick(deal);
                                      }}
                                    />
                                    <IconButton
                                      icon={<SmallCloseIcon />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      aria-label="Delete Deal"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDealClick(deal);
                                      }}
                                    />
                                  </HStack>
                                </HStack>

                                {/* Deal Progress */}
                                {deal.currentWfmStep && (
                                  <Box>
                                    <HStack justify="space-between" mb={2}>
                                      <Text fontSize="xs" color={colors.text.muted}>
                                        Progress
                                      </Text>
                                      <Text fontSize="xs" color={colors.text.muted}>
                                        {deal.currentWfmStep.isFinalStep ? '100%' : '50%'}
                                      </Text>
                                    </HStack>
                                    <Progress 
                                      value={deal.currentWfmStep.isFinalStep ? 100 : 50} 
                                      size="sm" 
                                      colorScheme={getDealStatusColor(deal.currentWfmStep)}
                                      borderRadius="full"
                                    />
                                  </Box>
                                )}
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </TabPanel>
                      
                      {/* Contacts Tab */}
                      <TabPanel h="full" p={6} overflow="auto">
                        <VStack spacing={4} align="stretch">
                          {/* Header with Add Contact Button */}
                          <HStack justify="space-between" align="center">
                            <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                              Organization Contacts
                            </Text>
                            <Button
                              leftIcon={<AddIcon />}
                              colorScheme="blue"
                              size="sm"
                              onClick={() => {
                                // Navigate to create contact page with organization pre-selected
                                navigate(`/people/create?organizationId=${organizationId}&organizationName=${encodeURIComponent(currentOrganization?.name || '')}`);
                              }}
                            >
                              Add Contact
                            </Button>
                          </HStack>

                          {/* Contacts List */}
                          {!currentOrganization?.people || currentOrganization.people.length === 0 ? (
                            <Center minH="200px" flexDirection="column" bg={colors.bg.elevated} borderRadius="lg" p={8}>
                              <Icon as={FaUsers} w={12} h={12} color={colors.text.muted} mb={4} />
                              <Text color={colors.text.primary} fontSize="lg" fontWeight="semibold" mb={2}>
                                No contacts yet
                              </Text>
                              <Text color={colors.text.muted} fontSize="sm" textAlign="center" mb={4}>
                                Add contacts to this organization to keep track of key people and their information.
                              </Text>
                              <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                size="sm"
                                onClick={() => {
                                  navigate(`/people/create?organizationId=${organizationId}&organizationName=${encodeURIComponent(currentOrganization?.name || '')}`);
                                }}
                              >
                                Add First Contact
                              </Button>
                            </Center>
                          ) : (
                            <VStack spacing={3} align="stretch">
                              {currentOrganization.people.map((person) => (
                                <Box
                                  key={person.id}
                                  p={5}
                                  bg={colors.bg.elevated}
                                  borderRadius="lg"
                                  borderWidth="1px"
                                  borderColor={colors.border.default}
                                  _hover={{ borderColor: colors.border.emphasis, cursor: 'pointer' }}
                                  onClick={() => navigate(`/people/${person.id}`)}
                                >
                                  <HStack justify="space-between" align="flex-start">
                                    <VStack align="stretch" spacing={3} flex={1}>
                                      {/* Contact Name and Email */}
                                      <HStack justify="space-between" align="center">
                                        <VStack align="flex-start" spacing={1}>
                                          <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                                            {[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed Contact'}
                                          </Text>
                                          {person.email && (
                                            <Text fontSize="sm" color={colors.text.link}>
                                              {person.email}
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>

                                      {/* Contact Details */}
                                      <HStack spacing={6}>
                                        {person.phone && (
                                          <HStack spacing={2}>
                                            <Icon as={FaPhone} w={3} h={3} color={colors.text.muted} />
                                            <Text fontSize="sm" color={colors.text.secondary}>
                                              {person.phone}
                                            </Text>
                                          </HStack>
                                        )}
                                        <HStack spacing={2}>
                                          <Text fontSize="xs" color={colors.text.muted}>
                                            Added: {new Date(person.created_at).toLocaleDateString()}
                                          </Text>
                                        </HStack>
                                      </HStack>

                                      {/* Notes Preview */}
                                      {person.notes && (
                                        <Text fontSize="sm" color={colors.text.muted} noOfLines={2}>
                                          {person.notes}
                                        </Text>
                                      )}
                                    </VStack>

                                    <HStack spacing={1}>
                                      <IconButton
                                        icon={<EditIcon />}
                                        size="sm"
                                        variant="ghost"
                                        aria-label="Edit Contact"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/people/${person.id}/edit`);
                                        }}
                                      />
                                    </HStack>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      </TabPanel>
                      
                      {/* Information Tab */}
                      <TabPanel h="full" p={6} overflow="auto">
                        <VStack spacing={6} align="stretch">
                          {/* Basic Information */}
                          <Box 
                            p={5} 
                            bg={colors.bg.elevated} 
                            borderRadius="lg" 
                            borderWidth="1px" 
                            borderColor={colors.border.default}
                          >
                            <Heading size="sm" mb={4} color={colors.text.primary}>
                              Basic Information
              </Heading>
              <VStack spacing={4} align="stretch">
                {/* Name Field */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={colors.text.muted}>Name</Text>
                  {!isEditingName ? (
                    <HStack spacing={2}>
                                    <Text fontSize="md" fontWeight="medium" color={colors.text.secondary}>
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
                                    <Text fontSize="md" fontWeight="medium" color={colors.text.secondary}>
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
                        isDisabled={!canEditOrganization}
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
                                      as="a"
                                      href={(currentOrganization as any).website || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      _hover={{textDecoration: 'underline'}}
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
                        isDisabled={!canEditOrganization}
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
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </VStack>
            )}
          </Box>
        </GridItem>

        {/* Right Sidebar */}
        <GridItem colSpan={1}>
          <Box 
            bg={colors.component.kanban.column}
              p={6} 
            borderLeftWidth="1px"
            borderColor={colors.component.kanban.cardBorder}
            h="full"
            overflowY="auto"
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
          >
            {!isLoadingOrganization && currentOrganization && (
              <VStack spacing={6} align="stretch">
                                {/* Account Manager Section */}
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
                  <HStack justify="space-between" align="center" mb={4}>
                    <Heading size="sm" color={colors.text.primary}>
                      Account Manager
              </Heading>
                    {canAssignAccountManager && (
                      <IconButton
                        aria-label="Edit Account Manager"
                        icon={<EditIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={onAccountManagerModalOpen}
                        color={colors.text.muted}
                        _hover={{color: colors.text.link}}
                        title="Edit Account Manager"
                      />
                    )}
                  </HStack>
                  {(currentOrganization as any).accountManager ? (
                    <HStack spacing={3}>
                      <Avatar 
                        size="sm" 
                        name={(currentOrganization as any).accountManager.display_name}
                        src={(currentOrganization as any).accountManager.avatar_url}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="semibold" color={colors.text.primary}>
                          {(currentOrganization as any).accountManager.display_name}
                        </Text>
                        <Text fontSize="sm" color={colors.text.muted}>
                          {(currentOrganization as any).accountManager.email}
                        </Text>
                      </VStack>
                    </HStack>
                  ) : (
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color={colors.text.muted}>
                        No account manager assigned
                      </Text>
                      {canAssignAccountManager && (
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={onAccountManagerModalOpen}
                        >
                          Assign Manager
                        </Button>
                      )}
                    </VStack>
                  )}
                </Box>

                {/* Statistics Section */}
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
                  <Heading size="sm" mb={4} color={colors.text.primary}>
                    Statistics
                  </Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={colors.text.muted}>Pipeline Value</Text>
                      <Text fontSize="lg" fontWeight="semibold" color={colors.status.success}>
                        €{((currentOrganization as any).totalDealValue || 0).toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={colors.text.muted}>Active Deals</Text>
                      <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                        {(currentOrganization as any).activeDealCount || 0}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={colors.text.muted}>Activities</Text>
                      <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                        {organizationActivities.length}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={colors.text.muted}>Last Activity</Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        {(currentOrganization as any).lastActivity 
                          ? new Date((currentOrganization as any).lastActivity.created_at).toLocaleDateString()
                          : 'No recent activity'
                        }
                      </Text>
                    </HStack>
                  </VStack>
                </Box>


          </VStack>
        )}
          </Box>
        </GridItem>
      </Grid>

      {/* Modals */}
      {currentOrganization && (
        <>
          <AccountManagerAssignmentModal
            isOpen={isAccountManagerModalOpen}
            onClose={onAccountManagerModalClose}
            organization={{
              id: currentOrganization.id,
              name: currentOrganization.name,
              accountManager: (currentOrganization as any).accountManager
            }}
            onAssignmentComplete={() => {
              fetchOrganizationById(organizationId!);
              onAccountManagerModalClose();
            }}
          />

          <Modal isOpen={isCreateActivityModalOpen} onClose={onCreateActivityModalClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create Activity for {currentOrganization.name}</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <CreateActivityForm
                  onClose={onCreateActivityModalClose}
                  onSuccess={handleActivityCreated}
                  initialOrganizationId={currentOrganization.id}
                  initialOrganizationName={currentOrganization.name}
                />
              </ModalBody>
            </ModalContent>
          </Modal>

          {selectedActivity && (
            <Modal isOpen={isEditActivityModalOpen} onClose={onEditActivityModalClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Edit Activity</ModalHeader>
                <ModalCloseButton />
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

          <AlertDialog
            isOpen={isDeleteConfirmOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteConfirmClose}
          >
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

          {/* Deal Modals */}
          <CreateDealModal
            isOpen={isCreateDealModalOpen}
            onClose={onCreateDealModalClose}
            onDealCreated={handleDealCreated}
          />

          {selectedDeal && (
            <EditDealModal
              isOpen={isEditDealModalOpen}
              onClose={onEditDealModalClose}
              deal={selectedDeal}
              onDealUpdated={handleDealUpdated}
            />
          )}

          <AlertDialog
            isOpen={isDealDeleteConfirmOpen}
            leastDestructiveRef={cancelDealRef}
            onClose={onDealDeleteConfirmClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Deal
                </AlertDialogHeader>
                <AlertDialogBody>
                  Are you sure you want to delete this deal? This action cannot be undone.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelDealRef} onClick={onDealDeleteConfirmClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={confirmDeleteDeal} ml={3}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}
    </Box>
  );
};

export default OrganizationDetailPage; 