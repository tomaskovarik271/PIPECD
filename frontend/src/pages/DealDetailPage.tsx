import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  Input,
  Select,
  Tooltip,
  Stack,
  Divider,
  Center,
  Avatar,
  Link,
  Progress,
  Collapse,
  Icon,
  SimpleGrid
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  EditIcon, 
  ChevronRightIcon, 
  WarningIcon, 
  InfoIcon, 
  CalendarIcon, 
  EmailIcon, 
  CheckCircleIcon,
  ExternalLinkIcon,
  CloseIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SmallCloseIcon
} from '@chakra-ui/icons';
import { FaClipboardList, FaPhone } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import type { CustomFieldEntityType } from '../generated/graphql/graphql';

// Store imports
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
// Activities store removed - using Google Calendar integration instead
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { useUserListStore } from '../stores/useUserListStore';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { useThemeStore } from '../stores/useThemeStore';

// Component imports
// Activity components removed - using Google Calendar integration instead
import EditDealModal from '../components/EditDealModal';
import { DealHeader } from '../components/deals/DealHeader';
// DealActivitiesPanel removed - using Google Calendar integration instead
import { DealCustomFieldsPanel } from '../components/deals/DealCustomFieldsPanel';
import { DealHistoryPanel } from '../components/deals/DealHistoryPanel';
import { DealOrganizationContactsPanel } from '../components/deals/DealOrganizationContactsPanel';
import DealEmailsPanel from '../components/deals/DealEmailsPanel';
import { SharedDriveDocumentBrowser } from '../components/deals/SharedDriveDocumentBrowser';
import { DealNotesPanel } from '../components/dealDetail/DealNotesPanel';
import { DealTimelinePanel } from '../components/dealDetail/DealTimelinePanel';
import { DealTasksPanel } from '../components/deals/DealTasksPanel';
import { processCustomFieldsForSubmission } from '../lib/utils/customFieldProcessing';
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';
import { DirectCalendarScheduler } from '../lib/utils/directCalendarScheduler';
import { UpcomingMeetingsWidget } from '../components/calendar/UpcomingMeetingsWidget';
import { useQuickSchedule } from '../hooks/useQuickSchedule';
import { SmartEmailButton } from '../components/common/SmartEmailComposer';
import { EmbeddedCalendarModal } from '../components/calendar/EmbeddedCalendarModal';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

// Type imports

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
  } catch (_error) {
    return { isUrl: false, displayText: str };
  }
};

const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const currentThemeName = useThemeStore((state) => state.currentTheme);

  // Store hooks
  const fetchDealById = useAppStore((state) => state.fetchDealById);
  const deal = useAppStore((state) => state.currentDeal);
  const isLoadingDeal = useAppStore((state) => state.currentDealLoading);
  const dealError = useAppStore((state) => state.currentDealError);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const userId = session?.user.id;
  const updateDealStoreAction = useDealsStore((state) => state.updateDeal);
  
  // User list and custom fields for dropdowns
  const { users: userList, fetchUsers: fetchUserList, hasFetched: usersHaveBeenFetched } = useUserListStore();
  const { definitions: customFieldDefinitions, fetchCustomFieldDefinitions } = useCustomFieldDefinitionStore();
  
  // State variables
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState<string>('');
  const [isEditingCloseDate, setIsEditingCloseDate] = useState(false);
  const [newCloseDateStr, setNewCloseDateStr] = useState<string>('');
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [isCustomFieldsExpanded, setIsCustomFieldsExpanded] = useState(true);
  const [emailRefreshTrigger, setEmailRefreshTrigger] = useState(0);
  
  // Count states for tab badges
  const [documentCount, setDocumentCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [stickyNotesCount, setStickyNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);

  const toast = useToast();
  const { isOpen: isEditDealModalOpen, onOpen: onEditDealModalOpen, onClose: onEditDealModalClose } = useDisclosure();

  // NEW: Quick schedule functionality
  const { quickSchedule, embeddedModal } = useQuickSchedule();

  // Memoized callback functions to prevent re-renders
  const handleStickyNotesCountChange = useCallback((count: number) => {
    setStickyNotesCount(count);
  }, []);

  const handleDocumentCountChange = useCallback((count: number) => {
    setDocumentCount(count);
  }, []);

  const handleContactsCountChange = useCallback((count: number) => {
    setContactsCount(count);
  }, []);

  const handleTasksCountChange = useCallback((count: number) => {
    setTasksCount(count);
  }, []);

  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      default:
        return 'transparent'; // No accent for modern themes
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (dealId) {
      fetchDealById(dealId);
      fetchCustomFieldDefinitions('DEAL');
      if (!usersHaveBeenFetched) {
        fetchUserList();
      }
    }
    return () => {
      // Cleanup if needed
    };
  }, [dealId, fetchDealById, fetchCustomFieldDefinitions, usersHaveBeenFetched, fetchUserList]);

  // Deal CRUD permissions
  const canEditDeal = useMemo(() => {
    if (!userPermissions) return false;
    
    // Full collaboration model: any member can edit any deal
    return userPermissions.includes('deal:update_any');
  }, [userPermissions]);

  // Format user list for dropdowns
  const formattedUserList = useMemo(() => {
    return userList.filter(user => user.id !== 'system');
  }, [userList]);

  // Calculate effective probability for display
  const getEffectiveProbabilityDisplay = useMemo(() => {
    if (!deal) return { value: null, display: 'N/A' };

    // Check for manual probability first (using deal_specific_probability)
    if ((deal as any).deal_specific_probability !== null && (deal as any).deal_specific_probability !== undefined) {
      return {
        value: (deal as any).deal_specific_probability,
        display: `${((deal as any).deal_specific_probability * 100).toFixed(0)}% (manual)`
      };
    }

    // Fall back to WFM step probability (check metadata)
    if (deal.currentWfmStep && (deal.currentWfmStep as any).metadata && typeof (deal.currentWfmStep as any).metadata === 'object') {
      const stepProbability = ((deal.currentWfmStep as any).metadata as { deal_probability?: number }).deal_probability;
      if (stepProbability != null) {
        return {
          value: stepProbability,
          display: `${(stepProbability * 100).toFixed(0)}% (step)`
        };
      }
    }

    return { value: null, display: 'N/A' };
  }, [deal]);

  const handleDealUpdated = () => {
    if (dealId) {
      fetchDealById(dealId);
    }
  };

  const handleDealUpdate = async (dealId: string, updates: any): Promise<void> => {
    try {
      const result = await updateDealStoreAction(dealId, updates);
      
      if (result.error) {
        // Handle error from the store
        console.error('Error updating deal:', result.error);
        toast({
          title: "Error updating deal",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (result.deal) {
        // Success - the store has already updated with the new data
        // No need to re-fetch since the store's updateDeal already returns the updated deal
        toast({
          title: "Deal updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Removed: handleDealUpdated(); // This was causing the 2-second delay by re-fetching
      } else {
        // Unexpected case where no error but no deal either
        console.error('Unexpected result: no deal and no error');
        toast({
          title: "Error updating deal",
          description: "An unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Unexpected error updating deal:', error);
      toast({
        title: "Error updating deal",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCustomFieldUpdate = async (fieldId: string, value: any) => {
    if (!deal) return;
    
    try {
      // Create a single CustomFieldValueInput object for this field
      const customFieldInput = {
        definitionId: fieldId,
        stringValue: value ? String(value) : undefined,
        // Add other field types as needed based on the field type
        // For now, assuming most custom fields are text/string fields
      };
      
      await handleDealUpdate(deal.id, {
        customFields: [customFieldInput]
      });
    } catch (error) {
      console.error('Error updating custom field:', error);
      toast({
        title: "Error updating custom field",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAmountUpdate = async () => {
    if (!deal || newAmount === '') return;
    
    try {
      await handleDealUpdate(deal.id, {
        amount: parseFloat(newAmount)
      });
      setIsEditingAmount(false);
      setNewAmount('');
    } catch (error) {
      console.error('Error updating amount:', error);
      toast({
        title: "Error updating amount",
        description: "Please check the amount format",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseDateUpdate = async () => {
    if (!deal) return;
    
    try {
      await handleDealUpdate(deal.id, {
        expected_close_date: newCloseDateStr || null
      });
      setIsEditingCloseDate(false);
      setNewCloseDateStr('');
    } catch (error) {
      console.error('Error updating close date:', error);
    }
  };

  const handleOwnerUpdate = async () => {
    if (!deal) return;
    
    try {
      await handleDealUpdate(deal.id, {
        assignedToUserId: newOwnerId
      });
      setIsEditingOwner(false);
      setNewOwnerId(null);
    } catch (error) {
      console.error('Error updating owner:', error);
    }
  };

  if (isLoadingDeal) {
    return (
      <Center h="100vh" bg={colors.bg.app}>
        <Spinner size="xl" color={colors.interactive.default} />
      </Center>
    );
  }

  if (dealError) {
    return (
      <Center h="100vh" flexDirection="column" bg={colors.bg.app} p={6}>
        <Alert status="error" variant="subtle" borderRadius="lg" bg={colors.status.error} color={colors.text.onAccent} maxW="md">
          <AlertIcon color={colors.text.onAccent} />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Error Loading Deal!</Text>
            <Text>{dealError}</Text>
          </VStack>
        </Alert>
        <Button 
          as={RouterLink} 
          to="/deals" 
          mt={6} 
          variant="outline"
          colorScheme="blue"
        >
          Back to Deals
        </Button>
      </Center>
    );
  }

  if (!deal) {
    return (
      <Center h="100vh" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
        <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
        <Text color={colors.text.secondary} fontSize="lg">Deal not found.</Text>
        <Button as={RouterLink} to="/deals" mt={6} {...styles.button.primary}>Back to Deals</Button>
      </Center>
    );
  }

  const probabilityDisplay = getEffectiveProbabilityDisplay;

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
        w="full" 
        h="full"  
        maxH="calc(100% - 0px)" 
        borderRadius={{base: "none", md: "xl"}}
        borderWidth={{base: "0", md: "1px"}}
        borderColor={colors.border.default}
        overflow="hidden" 
        mx={{base: 0, md: 4}}
        my={{base: 0, md: 4}}
      >
        {/* NEW: Responsive grid layout (replaces Flex with calc() problems) */}
        <SimpleGrid columns={{base: 1, lg: 12}} gap={{base: 4, md: 6}}>
          {/* Main Content (Left Column) */}
          <Box gridColumn={{base: "1", lg: "1 / 9"}} p={{base: 4, md: 6, lg: 8}} overflowY="auto" overflowX="hidden" sx={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}>
            <VStack spacing={6} align="stretch" maxW="100%" w="100%">
              {/* Header Section */}
              <DealHeader 
                deal={deal as Deal}
                isEditing={false}
                setIsEditing={() => {}}
                dealActivities={[]} // Activities removed - using Google Calendar integration instead
              />

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
                      <HStack spacing={2}>
                        <Text>Notes</Text>
                        <Badge colorScheme="yellow" variant="solid" borderRadius="full" fontSize="xs">
                          {stickyNotesCount}
                        </Badge>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiClock} />
                        <Text>Meetings</Text>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FaClipboardList} />
                        <Text>Tasks</Text>
                        <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="xs">
                          {tasksCount}
                        </Badge>
                      </HStack>
                    </Tab>
                    {/* Activities tab removed - using Google Calendar integration instead */}
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
                          dealId={deal.id}
                          onNoteCountChange={handleStickyNotesCountChange}
                        />
                      </Box>
                    </TabPanel>
                    
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealTimelinePanel deal={deal as Deal} />
                      </Box>
                    </TabPanel>
                    
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealTasksPanel 
                          dealId={deal.id}
                          dealName={deal.name}
                          onTaskCountChange={handleTasksCountChange}
                        />
                      </Box>
                    </TabPanel>
                  
                    {/* Activities panel removed - using Google Calendar integration instead */}
                    
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealEmailsPanel 
                          dealId={dealId!} 
                          primaryContactEmail={deal.person?.email || undefined}
                          dealName={deal.name}
                          refreshTrigger={emailRefreshTrigger}
                        />
                      </Box>
                    </TabPanel>

                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <SharedDriveDocumentBrowser 
                          dealId={dealId!} 
                          dealName={deal.name}
                          onDocumentCountChange={handleDocumentCountChange}
                        />
                      </Box>
                    </TabPanel>

                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealOrganizationContactsPanel 
                          organization={deal.organization ? {
                            id: deal.organization.id,
                            name: deal.organization.name
                          } : null} 
                          onContactCountChange={handleContactsCountChange}
                          dealId={deal.id}
                          dealName={deal.name}
                        />
                      </Box>
                    </TabPanel>

                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealHistoryPanel historyEntries={deal.history} />
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Sidebar - Enhanced with Key Information */}
          <Box gridColumn={{base: "1", lg: "9 / 13"}} bg={colors.component.kanban.column} p={{base: 4, md: 6}} borderLeftWidth={{base: 0, lg: "1px"}} borderTopWidth={{base: "1px", lg: 0}} borderColor={colors.component.kanban.cardBorder} overflowY="auto" flexShrink={0} boxShadow="steelPlate" position="relative" _before={{
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
            }} sx={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}>
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
                <Heading size="sm" mb={4} color={colors.text.primary}>Key Information</Heading>
                <VStack spacing={4} align="stretch">
                  {/* Amount Field */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Value</Text>
                    {!isEditingAmount ? (
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="semibold" color={colors.status.success}>
                          {deal.amount ? CurrencyFormatter.format(deal.amount, deal.currency || 'USD', { precision: 0 }) : '-'}
                        </Text>
                        <IconButton 
                          icon={<EditIcon />} 
                          size="xs" 
                          variant="ghost" 
                          aria-label="Edit Amount" 
                          onClick={() => {
                            setIsEditingAmount(true);
                            setNewAmount(deal.amount ? String(deal.amount) : '');
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
                          {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
                        </Text>
                        <IconButton 
                          icon={<EditIcon />} 
                          size="xs" 
                          variant="ghost" 
                          aria-label="Edit Expected Close Date" 
                          onClick={() => {
                            setIsEditingCloseDate(true);
                            if (deal.expected_close_date) {
                              const date = new Date(deal.expected_close_date);
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
                          name={deal.assignedToUser?.display_name || 'Unassigned'}
                          src={deal.assignedToUser?.avatar_url || undefined}
                          bg={colors.interactive.default}
                        />
                        <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                          {deal.assignedToUser?.display_name || 'Unassigned'}
                        </Text>
                        <IconButton 
                          icon={<EditIcon />} 
                          size="xs" 
                          variant="ghost" 
                          aria-label="Edit Owner" 
                          onClick={() => {
                            setIsEditingOwner(true);
                            setNewOwnerId(deal.assigned_to_user_id || null);
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
                      #{(deal as any).project_id || '-'}
                    </Text>
                  </HStack>

                  {/* Direct Schedule Meeting Button */}
                  <Box pt={4}>
                    <Button
                      leftIcon={<CalendarIcon />}
                      colorScheme="blue"
                      size="md"
                      onClick={() => quickSchedule({ deal: deal, useEmbeddedModal: true })}
                      width="100%"
                      variant="solid"
                    >
                      Schedule Meeting
                    </Button>
                  </Box>
                </VStack>
              </Box>

              {/* Custom Fields Section */}
              {customFieldDefinitions && customFieldDefinitions.length > 0 && (
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
                      customFieldValues={deal.customFieldValues || []}
                      dealId={deal.id}
                      onUpdate={canEditDeal ? handleCustomFieldUpdate : undefined}
                      getLinkDisplayDetails={getLinkDisplayDetails}
                    />
                  </Collapse>
                </Box>
              )}

              {/* Primary Contact Section */}
              {deal.person && (
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
                  <Heading size="sm" mb={3} color={colors.text.primary}>Primary Contact</Heading>
                  <HStack spacing={3} alignItems="center">
                    <Avatar 
                      size="md" 
                      name={`${deal.person?.first_name || ''} ${deal.person?.last_name || ''}`}
                      bg={colors.interactive.default}
                      color={colors.text.onAccent}
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <Link as={RouterLink} to={`/people/${deal.person?.id}`} fontWeight="medium" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
                        {deal.person?.first_name} {deal.person?.last_name}
                      </Link>
                      {deal.person?.email && (
                        <Text fontSize="sm" color={colors.text.secondary}>
                          {deal.person?.email}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  {deal.person?.email && (
                    <Box mt={3}>
                      <SmartEmailButton
                        to={deal.person.email}
                        size="xs"
                        variant="outline"
                        width="full"
                        context={{
                          dealId: deal.id,
                          dealName: deal.name,
                          personId: deal.person.id,
                          personName: `${deal.person.first_name || ''} ${deal.person.last_name || ''}`.trim(),
                          organizationId: deal.organization?.id,
                          organizationName: deal.organization?.name,
                        }}
                      >
                        Email
                      </SmartEmailButton>
                    </Box>
                  )}
                </Box>
              )}

              {/* Organization Section */}
              {deal.organization && (
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
                  <Heading size="sm" mb={3} color={colors.text.primary}>Organization</Heading>
                  <HStack spacing={3} alignItems="center">
                    <VStack align="start" spacing={0}>
                      <Link as={RouterLink} to={`/organizations/${deal.organization.id}`} fontWeight="medium" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
                        {deal.organization.name}
                      </Link>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Edit Deal Modal */}
      {isEditDealModalOpen && (
        <EditDealModal
          isOpen={isEditDealModalOpen}
          onClose={onEditDealModalClose}
          deal={deal}
          onDealUpdated={handleDealUpdated}
        />
      )}

      {/* Embedded Calendar Modal */}
      {embeddedModal.deal && (
        <EmbeddedCalendarModal
          isOpen={embeddedModal.isOpen}
          onClose={embeddedModal.onClose}
          deal={embeddedModal.deal}
          onMeetingCreated={embeddedModal.onMeetingCreated}
          onEmailRefresh={() => setEmailRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* Direct calendar scheduling - now with embedded modal! */}
    </Box>
  );
};

export default DealDetailPage; 