import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
  Button,
  useToast,
  Badge,
  Tag,
  Flex,
  Divider,
  Grid,
  GridItem,
  SimpleGrid,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  EmailIcon,
  PhoneIcon,
  InfoOutlineIcon,
  TimeIcon,
  StarIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import { useLeadsStore, Lead } from '../stores/useLeadsStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppStore } from '../stores/useAppStore';
import { useLeadTheme } from '../hooks/useLeadTheme';
import { StickerBoard } from '../components/common/StickerBoard';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { EntityType } from '../generated/graphql/graphql';
import EditLeadModal from '../components/EditLeadModal';

// GraphQL query for lead details
const GET_LEAD_DETAILS_QUERY = gql`
  query GetLeadDetails($id: ID!) {
    lead(id: $id) {
      id
      name
      source
      description
      contact_name
      contact_email
      contact_phone
      company_name
      estimated_value
      estimated_close_date
      lead_score
      isQualified
      assigned_to_user_id
      assigned_at
      converted_at
      converted_to_deal_id
      last_activity_at
      created_at
      updated_at
      assignedToUser {
        id
        email
        display_name
        avatar_url
      }
      currentWfmStatus {
        id
        name
        color
      }
    }
  }
`;

const GET_STICKER_CATEGORIES_FOR_LEAD_QUERY = gql`
  query GetStickerCategoriesForLead {
    getStickerCategories {
      id
      name
      color
      icon
      isSystem
      displayOrder
    }
  }
`;

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount?: number | null) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const LeadDetailPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();
  
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stickerCategories, setStickerCategories] = useState<any[]>([]);

  // Inline editing states
  const [isEditingContactName, setIsEditingContactName] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [isEditingContactEmail, setIsEditingContactEmail] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isEditingContactPhone, setIsEditingContactPhone] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');

  const [isEditingEstimatedValue, setIsEditingEstimatedValue] = useState(false);
  const [newEstimatedValue, setNewEstimatedValue] = useState('');
  const [isEditingEstimatedCloseDate, setIsEditingEstimatedCloseDate] = useState(false);
  const [newEstimatedCloseDate, setNewEstimatedCloseDate] = useState('');

  const { deleteLead, updateLead } = useLeadsStore();
  const leadTheme = useLeadTheme();
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  
  // Check if user can edit leads (update_any OR update_own for leads they own/are assigned to)
  const canEditLead = currentLead && (
    userPermissions?.includes('lead:update_any') || 
    (userPermissions?.includes('lead:update_own') && 
     (currentLead.user_id === currentUserId || currentLead.assigned_to_user_id === currentUserId))
  );

  // Fetch lead details
  useEffect(() => {
    if (!leadId) return;

    const fetchLeadDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await gqlClient.request<{ lead: Lead }>(GET_LEAD_DETAILS_QUERY, { id: leadId });
        if (response.lead) {
          setCurrentLead(response.lead);
        } else {
          setError('Lead not found');
        }
      } catch (err) {
        console.error('Error fetching lead details:', err);
        setError('Failed to load lead details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

  // Fetch sticker categories
  useEffect(() => {
    const fetchStickerCategories = async () => {
      try {
        const response = await gqlClient.request<{ getStickerCategories: any[] }>(GET_STICKER_CATEGORIES_FOR_LEAD_QUERY);
        setStickerCategories(response.getStickerCategories || []);
      } catch (err) {
        console.error('Error fetching sticker categories:', err);
      }
    };

    fetchStickerCategories();
  }, []);

  // Update handlers for inline editing
  const handleContactNameUpdate = async () => {
    if (!currentLead || !leadId) return;
    try {
      const result = await updateLead(leadId, { contactName: newContactName });
      if (result.lead) {
        setCurrentLead(result.lead);
        toast({ title: 'Contact Name Updated', status: 'success', duration: 2000, isClosable: true });
        setIsEditingContactName(false);
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to update this lead.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: 'Error Updating Contact Name', description: errorMessage, status: 'error', duration: 3000, isClosable: true });
      }
      setIsEditingContactName(false);
    }
  };

  const handleContactEmailUpdate = async () => {
    if (!currentLead || !leadId) return;
    try {
      const result = await updateLead(leadId, { contactEmail: newContactEmail });
      if (result.lead) {
        setCurrentLead(result.lead);
        toast({ title: 'Contact Email Updated', status: 'success', duration: 2000, isClosable: true });
        setIsEditingContactEmail(false);
      }
    } catch (e) {
      toast({ title: 'Error Updating Contact Email', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleContactPhoneUpdate = async () => {
    if (!currentLead || !leadId) return;
    try {
      const result = await updateLead(leadId, { contactPhone: newContactPhone });
      if (result.lead) {
        setCurrentLead(result.lead);
        toast({ title: 'Contact Phone Updated', status: 'success', duration: 2000, isClosable: true });
        setIsEditingContactPhone(false);
      }
    } catch (e) {
      toast({ title: 'Error Updating Contact Phone', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };



  const handleEstimatedValueUpdate = async () => {
    if (!currentLead || !leadId) return;
    try {
      const result = await updateLead(leadId, { estimatedValue: parseFloat(newEstimatedValue) || 0 });
      if (result.lead) {
        setCurrentLead(result.lead);
        toast({ title: 'Estimated Value Updated', status: 'success', duration: 2000, isClosable: true });
        setIsEditingEstimatedValue(false);
      }
    } catch (e) {
      toast({ title: 'Error Updating Estimated Value', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEstimatedCloseDateUpdate = async () => {
    if (!currentLead || !leadId) return;
    try {
      const result = await updateLead(leadId, { estimatedCloseDate: newEstimatedCloseDate });
      if (result.lead) {
        setCurrentLead(result.lead);
        toast({ title: 'Est. Close Date Updated', status: 'success', duration: 2000, isClosable: true });
        setIsEditingEstimatedCloseDate(false);
      }
    } catch (e) {
      toast({ title: 'Error Updating Est. Close Date', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!currentLead || !window.confirm('Are you sure you want to delete this lead?')) return;

    setIsDeleting(true);
    try {
      const success = await deleteLead(currentLead.id);
      if (success) {
        toast({
          title: 'Lead deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/leads');
      } else {
        throw new Error('Failed to delete lead');
      }
    } catch (err) {
      toast({
        title: 'Error deleting lead',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getLeadScoreColor = (score?: number | null) => {
    if (!score) return colors.text.muted;
    if (score >= 75) return colors.text.success;
    if (score >= 50) return colors.text.warning;
    return colors.text.error;
  };

  const getLeadScoreLabel = (score?: number | null) => {
    if (!score) return 'No Score';
    if (score >= 75) return 'Hot Lead';
    if (score >= 50) return 'Warm Lead';
    return 'Cold Lead';
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color={leadTheme.colors.primary} />
          <Text color={colors.text.secondary}>Loading lead details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error || !currentLead) {
    return (
      <Center h="50vh">
        <Alert status="error" maxW="md" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Error Loading Lead</Text>
            <Text>{error || 'Lead not found'}</Text>
            <Button
              as={RouterLink}
              to="/leads"
              leftIcon={<ArrowBackIcon />}
              size="sm"
              mt={2}
            >
              Back to Leads
            </Button>
          </VStack>
        </Alert>
      </Center>
    );
  }

  const leadScore = currentLead.lead_score || 0;

  return (
    <Box 
      p={6} 
      maxW="7xl" 
      mx="auto"
      bg={leadTheme.colors.bg.primary}
      minH="100vh"
    >
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm" color={leadTheme.colors.text.secondary}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/leads">
            Leads
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{currentLead.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <Flex justify="space-between" align="start" mb={6}>
        <VStack align="start" spacing={2}>
          <HStack spacing={3}>
            <Heading size="lg" color={leadTheme.colors.text.primary}>
              {currentLead.name}
            </Heading>
            {currentLead.isQualified && (
              <Badge
                colorScheme="green"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                Qualified
              </Badge>
            )}
            {currentLead.converted_at && (
              <Badge
                bg={leadTheme.colors.status.converted}
                color="white"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                Converted
              </Badge>
            )}
          </HStack>

          {currentLead.company_name && (
            <Text fontSize="md" color={colors.text.secondary}>
              {currentLead.company_name}
            </Text>
          )}

          {currentLead.source && (
            <HStack spacing={2}>
              <Text fontSize="sm" color={colors.text.muted}>Source:</Text>
              <Tag 
                size="sm" 
                bg={leadTheme.colors.bg.elevated}
                color={leadTheme.colors.text.accent}
                borderColor={leadTheme.colors.border.accent}
                variant="outline"
              >
                {currentLead.source}
              </Tag>
            </HStack>
          )}
        </VStack>

        {/* Action Buttons */}
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit lead"
            icon={<EditIcon />}
            onClick={handleEdit}
            bg={leadTheme.colors.bg.card}
            color={leadTheme.colors.text.accent}
            borderColor={leadTheme.colors.border.accent}
            _hover={{
              bg: leadTheme.colors.bg.hover,
              borderColor: leadTheme.colors.border.hover
            }}
            variant="outline"
          />
          <IconButton
            aria-label="Delete lead"
            icon={<DeleteIcon />}
            onClick={handleDelete}
            colorScheme="red"
            variant="outline"
            isLoading={isDeleting}
          />
        </HStack>
      </Flex>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        {/* Lead Score */}
        <Box
          p={4}
          bg={leadTheme.colors.bg.elevated}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={leadTheme.colors.border.default}
        >
          <VStack align="start" spacing={2}>
            <HStack spacing={2}>
              <StarIcon color={getLeadScoreColor(leadScore)} />
              <Text fontSize="sm" color={colors.text.secondary}>
                Lead Score
              </Text>
            </HStack>
            <Heading size="md" color={getLeadScoreColor(leadScore)}>
              {leadScore}
            </Heading>
            <Progress
              value={leadScore}
              size="sm"
              colorScheme={leadScore >= 75 ? "green" : leadScore >= 50 ? "orange" : "gray"}
              bg={colors.bg.input}
              borderRadius="full"
              w="full"
            />
            <Text fontSize="xs" color={colors.text.muted}>
              {getLeadScoreLabel(leadScore)}
            </Text>
          </VStack>
        </Box>

        {/* Estimated Value */}
        <Box
          p={4}
          bg={colors.bg.elevated}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.border.default}
        >
          <VStack align="start" spacing={2}>
            <HStack justifyContent="space-between" alignItems="center" w="full">
              <Text fontSize="sm" color={colors.text.secondary}>
                Estimated Value
              </Text>
              {!isEditingEstimatedValue && (
                <IconButton 
                  icon={<EditIcon />} 
                  size="xs" 
                  variant="ghost" 
                  aria-label="Edit Estimated Value" 
                  onClick={() => {
                    setIsEditingEstimatedValue(true);
                    setNewEstimatedValue(currentLead.estimated_value?.toString() || '');
                  }}
                  color={colors.text.muted}
                  _hover={{color: colors.text.link}}
                  isDisabled={!canEditLead}
                />
              )}
            </HStack>
            {!isEditingEstimatedValue ? (
              <Heading size="md" color={colors.text.success}>
                {formatCurrency(currentLead.estimated_value)}
              </Heading>
            ) : (
              <VStack spacing={2} align="stretch" w="full">
                <Input 
                  type="number"
                  value={newEstimatedValue} 
                  onChange={(e) => setNewEstimatedValue(e.target.value)} 
                  placeholder="Enter value" 
                  size="sm"
                  bg={colors.bg.input}
                  borderColor={colors.border.default}
                  _hover={{borderColor: colors.border.emphasis}}
                  _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                />
                <HStack spacing={2} justifyContent="flex-end">
                  <IconButton 
                    icon={<CheckIcon />} 
                    size="xs" 
                    colorScheme="green" 
                    aria-label="Save Estimated Value" 
                    onClick={handleEstimatedValueUpdate}
                  />
                  <IconButton 
                    icon={<SmallCloseIcon />} 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    aria-label="Cancel Edit Estimated Value" 
                    onClick={() => setIsEditingEstimatedValue(false)}
                  />
                </HStack>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Status */}
        <Box
          p={4}
          bg={colors.bg.elevated}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.border.default}
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color={colors.text.secondary}>
              Status
            </Text>
            <Badge
              size="lg"
              bg={currentLead.currentWfmStatus?.color || colors.bg.input}
              color={colors.text.primary}
              px={3}
              py={1}
              borderRadius="full"
            >
              {currentLead.currentWfmStatus?.name || 'Unknown'}
            </Badge>
          </VStack>
        </Box>

        {/* Close Date */}
        <Box
          p={4}
          bg={colors.bg.elevated}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.border.default}
        >
          <VStack align="start" spacing={2}>
            <HStack spacing={2} justifyContent="space-between" w="full">
              <HStack spacing={2}>
                <TimeIcon color={colors.text.secondary} />
                <Text fontSize="sm" color={colors.text.secondary}>
                  Est. Close Date
                </Text>
              </HStack>
              {!isEditingEstimatedCloseDate && (
                <IconButton 
                  icon={<EditIcon />} 
                  size="xs" 
                  variant="ghost" 
                  aria-label="Edit Est. Close Date" 
                  onClick={() => {
                    setIsEditingEstimatedCloseDate(true);
                    setNewEstimatedCloseDate(currentLead.estimated_close_date ? new Date(currentLead.estimated_close_date).toISOString().split('T')[0] : '');
                  }}
                  color={colors.text.muted}
                  _hover={{color: colors.text.link}}
                  isDisabled={!canEditLead}
                />
              )}
            </HStack>
            {!isEditingEstimatedCloseDate ? (
              <Text fontWeight="medium" color={colors.text.primary}>
                {formatDate(currentLead.estimated_close_date)}
              </Text>
            ) : (
              <VStack spacing={2} align="stretch" w="full">
                <Input 
                  type="date"
                  value={newEstimatedCloseDate} 
                  onChange={(e) => setNewEstimatedCloseDate(e.target.value)} 
                  size="sm"
                  bg={colors.bg.input}
                  borderColor={colors.border.default}
                  _hover={{borderColor: colors.border.emphasis}}
                  _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                />
                <HStack spacing={2} justifyContent="flex-end">
                  <IconButton 
                    icon={<CheckIcon />} 
                    size="xs" 
                    colorScheme="green" 
                    aria-label="Save Est. Close Date" 
                    onClick={handleEstimatedCloseDateUpdate}
                  />
                  <IconButton 
                    icon={<SmallCloseIcon />} 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    aria-label="Cancel Edit Est. Close Date" 
                    onClick={() => setIsEditingEstimatedCloseDate(false)}
                  />
                </HStack>
              </VStack>
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Main Content */}
      <Tabs variant="enclosed" colorScheme="orange">
        <TabList>
          <Tab>Details</Tab>
          <Tab>Smart Stickers</Tab>
        </TabList>

        <TabPanels>
          {/* Details Tab */}
          <TabPanel px={0} py={6}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Contact Information */}
              <Box
                p={6}
                bg={colors.bg.elevated}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={colors.border.default}
              >
                <Heading size="md" mb={4} color={colors.text.primary}>
                  Contact Information
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {/* Contact Name Field */}
                  <HStack spacing={3} alignItems="flex-start">
                    <InfoOutlineIcon color={colors.text.secondary} mt={1} />
                    <Box flex={1}>
                      <HStack justifyContent="space-between" alignItems="center" mb={1}>
                        <Text fontSize="sm" color={colors.text.muted}>Contact Name</Text>
                        {!isEditingContactName && (
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Contact Name" 
                            onClick={() => {
                              setIsEditingContactName(true);
                              setNewContactName(currentLead.contact_name || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditLead}
                          />
                        )}
                      </HStack>
                      {!isEditingContactName ? (
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_name || 'No name provided'}
                        </Text>
                      ) : (
                        <HStack spacing={2}>
                          <Input 
                            value={newContactName} 
                            onChange={(e) => setNewContactName(e.target.value)} 
                            placeholder="Enter contact name" 
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Contact Name" 
                            onClick={handleContactNameUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Contact Name" 
                            onClick={() => setIsEditingContactName(false)}
                          />
                        </HStack>
                      )}
                    </Box>
                  </HStack>

                  {/* Contact Email Field */}
                  <HStack spacing={3} alignItems="flex-start">
                    <EmailIcon color={colors.text.secondary} mt={1} />
                    <Box flex={1}>
                      <HStack justifyContent="space-between" alignItems="center" mb={1}>
                        <Text fontSize="sm" color={colors.text.muted}>Email</Text>
                        {!isEditingContactEmail && (
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Contact Email" 
                            onClick={() => {
                              setIsEditingContactEmail(true);
                              setNewContactEmail(currentLead.contact_email || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditLead}
                          />
                        )}
                      </HStack>
                      {!isEditingContactEmail ? (
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_email || 'No email provided'}
                        </Text>
                      ) : (
                        <HStack spacing={2}>
                          <Input 
                            type="email"
                            value={newContactEmail} 
                            onChange={(e) => setNewContactEmail(e.target.value)} 
                            placeholder="Enter contact email" 
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Contact Email" 
                            onClick={handleContactEmailUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Contact Email" 
                            onClick={() => setIsEditingContactEmail(false)}
                          />
                        </HStack>
                      )}
                    </Box>
                  </HStack>

                  {/* Contact Phone Field */}
                  <HStack spacing={3} alignItems="flex-start">
                    <PhoneIcon color={colors.text.secondary} mt={1} />
                    <Box flex={1}>
                      <HStack justifyContent="space-between" alignItems="center" mb={1}>
                        <Text fontSize="sm" color={colors.text.muted}>Phone</Text>
                        {!isEditingContactPhone && (
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Contact Phone" 
                            onClick={() => {
                              setIsEditingContactPhone(true);
                              setNewContactPhone(currentLead.contact_phone || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditLead}
                          />
                        )}
                      </HStack>
                      {!isEditingContactPhone ? (
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_phone || 'No phone provided'}
                        </Text>
                      ) : (
                        <HStack spacing={2}>
                          <Input 
                            type="tel"
                            value={newContactPhone} 
                            onChange={(e) => setNewContactPhone(e.target.value)} 
                            placeholder="Enter contact phone" 
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Contact Phone" 
                            onClick={handleContactPhoneUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Contact Phone" 
                            onClick={() => setIsEditingContactPhone(false)}
                          />
                        </HStack>
                      )}
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              {/* Lead Information */}
              <Box
                p={6}
                bg={colors.bg.elevated}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={colors.border.default}
              >
                <Heading size="md" mb={4} color={colors.text.primary}>
                  Lead Information
                </Heading>
                <VStack align="stretch" spacing={3}>


                  <Box>
                    <Text fontSize="sm" color={colors.text.muted}>Created</Text>
                    <Text fontWeight="medium" color={colors.text.primary}>
                      {formatDate(currentLead.created_at)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color={colors.text.muted}>Last Updated</Text>
                    <Text fontWeight="medium" color={colors.text.primary}>
                      {formatDate(currentLead.updated_at)}
                    </Text>
                  </Box>

                  {currentLead.assigned_at && (
                    <Box>
                      <Text fontSize="sm" color={colors.text.muted}>Assigned</Text>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        {formatDate(currentLead.assigned_at)}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            </Grid>
          </TabPanel>

          {/* Smart Stickers Tab */}
          <TabPanel px={0} py={6}>
            <Box
              w="full"
              bg={colors.bg.elevated}
              borderRadius="xl"
              p={6}
              borderWidth="1px"
              borderColor={colors.border.default}
            >
              <Heading size="md" mb={4} color={colors.text.primary}>
                📝 Smart Stickers
              </Heading>
              <StickerBoard 
                entityType="LEAD" 
                entityId={currentLead.id}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Edit Modal */}
      {isEditModalOpen && currentLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lead={currentLead}
        />
      )}
    </Box>
  );
};

export default LeadDetailPage;