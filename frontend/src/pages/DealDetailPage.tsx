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
  Icon
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
import { processCustomFieldsForSubmission } from '../lib/utils/customFieldProcessing';
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';
import { ScheduleMeetingModal } from '../components/calendar/ScheduleMeetingModal';
import { UpcomingMeetingsWidget } from '../components/calendar/UpcomingMeetingsWidget';

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
  
  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      default:
        return 'transparent'; // No accent for modern themes
    }
  };
  
  const fetchDealById = useAppStore((state) => state.fetchDealById);
  const currentDeal = useAppStore((state) => state.currentDeal);
  const isLoadingDeal = useAppStore((state) => state.currentDealLoading);
  const dealError = useAppStore((state) => state.currentDealError);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  const updateDealStoreAction = useDealsStore((state) => state.updateDeal);
  const toast = useToast();

  // Activities functionality removed - using Google Calendar integration instead
  
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
  
  // State for schedule meeting modal
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  
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

  useEffect(() => {
    if (dealId) {
      fetchDealById(dealId);
      // Activities fetch removed - using Google Calendar integration instead
      fetchCustomFieldDefinitions('DEAL');
      if (!usersHaveBeenFetched) {
        fetchUserList();
      }
    }
    return () => {
      // useAppStore.setState({ currentDeal: null, currentDealError: null });
    };
  }, [dealId, fetchDealById, fetchCustomFieldDefinitions, usersHaveBeenFetched, fetchUserList]);

  // Permission checks
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
    if (!currentDeal) return { value: null, display: 'N/A' };

    // Check for manual probability first (using deal_specific_probability)
    if ((currentDeal as any).deal_specific_probability !== null && (currentDeal as any).deal_specific_probability !== undefined) {
      return {
        value: (currentDeal as any).deal_specific_probability,
        display: `${((currentDeal as any).deal_specific_probability * 100).toFixed(0)}% (manual)`
      };
    }

    // Fall back to WFM step probability (check metadata)
    if (currentDeal.currentWfmStep && (currentDeal.currentWfmStep as any).metadata && typeof (currentDeal.currentWfmStep as any).metadata === 'object') {
      const stepProbability = ((currentDeal.currentWfmStep as any).metadata as { deal_probability?: number }).deal_probability;
      if (stepProbability != null) {
        return {
          value: stepProbability,
          display: `${(stepProbability * 100).toFixed(0)}% (step)`
        };
      }
    }

    return { value: null, display: 'N/A' };
  }, [currentDeal]);

  const handleDealUpdated = () => {
    if (dealId) {
      fetchDealById(dealId);
    }
  };

  const handleDealUpdate = async (dealId: string, updates: any): Promise<void> => {
    try {
      await updateDealStoreAction(dealId, updates);
      toast({
        title: "Deal updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      handleDealUpdated();
    } catch (error) {
      console.error('Error updating deal:', error);
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
    if (!currentDeal) return;
    
    try {
      const processedFields = await processCustomFieldsForSubmission([{
        custom_field_definition_id: fieldId,
        value: value
      }], false);
      
      await handleDealUpdate(currentDeal.id, {
        customFieldValues: processedFields
      });
    } catch (error) {
      console.error('Error updating custom field:', error);
    }
  };

  const handleAmountUpdate = async () => {
    if (!currentDeal || newAmount === '') return;
    
    try {
      await handleDealUpdate(currentDeal.id, {
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
    if (!currentDeal) return;
    
    try {
      await handleDealUpdate(currentDeal.id, {
        expected_close_date: newCloseDateStr || null
      });
      setIsEditingCloseDate(false);
      setNewCloseDateStr('');
    } catch (error) {
      console.error('Error updating close date:', error);
    }
  };

  const handleOwnerUpdate = async () => {
    if (!currentDeal) return;
    
    try {
      await handleDealUpdate(currentDeal.id, {
        assigned_to_user_id: newOwnerId
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

  if (!currentDeal) {
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
              <DealHeader 
                deal={currentDeal as Deal}
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
                        <Text>Timeline</Text>
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
                          dealId={currentDeal.id}
                          onNoteCountChange={handleStickyNotesCountChange}
                        />
                      </Box>
                    </TabPanel>
                    
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealTimelinePanel deal={currentDeal as Deal} />
                      </Box>
                    </TabPanel>
                  
                    {/* Activities panel removed - using Google Calendar integration instead */}
                    
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <DealEmailsPanel 
                          dealId={dealId!} 
                          primaryContactEmail={currentDeal.person?.email || undefined}
                          dealName={currentDeal.name}
                        />
                      </Box>
                    </TabPanel>

                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <SharedDriveDocumentBrowser 
                          dealId={dealId!} 
                          dealName={currentDeal.name}
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
          </Box>

          {/* Right Sidebar - Enhanced with Key Information */}
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
                <Heading size="sm" mb={4} color={colors.text.primary}>Key Information</Heading>
                <VStack spacing={4} align="stretch">
                  {/* Amount Field */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Value</Text>
                    {!isEditingAmount ? (
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="semibold" color={colors.status.success}>
                          {currentDeal.amount ? CurrencyFormatter.format(currentDeal.amount, currentDeal.currency || 'USD', { precision: 0 }) : '-'}
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

                  {/* Schedule Meeting Button */}
                  <Box pt={4}>
                    <Button
                      leftIcon={<CalendarIcon />}
                      colorScheme="blue"
                      size="md"
                      onClick={() => setIsScheduleMeetingModalOpen(true)}
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
                      <Link as={RouterLink} to={`/organizations/${currentDeal.organization.id}`} fontWeight="medium" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
                        {currentDeal.organization.name}
                      </Link>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>
        </Flex>
      </Box>

      {/* Edit Deal Modal */}
      {isEditDealModalOpen && (
        <EditDealModal
          isOpen={isEditDealModalOpen}
          onClose={onEditDealModalClose}
          deal={currentDeal}
          onDealUpdated={handleDealUpdated}
        />
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleMeetingModalOpen && (
        <ScheduleMeetingModal
          isOpen={isScheduleMeetingModalOpen}
          onClose={() => setIsScheduleMeetingModalOpen(false)}
          deal={currentDeal}
        />
      )}
    </Box>
  );
};

export default DealDetailPage; 