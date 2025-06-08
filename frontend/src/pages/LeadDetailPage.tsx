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
} from '@chakra-ui/icons';
import { useLeadsStore, Lead } from '../stores/useLeadsStore';
import { useThemeColors } from '../hooks/useThemeColors';
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

  const { deleteLead } = useLeadsStore();
  const leadTheme = useLeadTheme();

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
            <Text fontSize="sm" color={colors.text.secondary}>
              Estimated Value
            </Text>
            <Heading size="md" color={colors.text.success}>
              {formatCurrency(currentLead.estimated_value)}
            </Heading>
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
            <HStack spacing={2}>
              <TimeIcon color={colors.text.secondary} />
              <Text fontSize="sm" color={colors.text.secondary}>
                Est. Close Date
              </Text>
            </HStack>
            <Text fontWeight="medium" color={colors.text.primary}>
              {formatDate(currentLead.estimated_close_date)}
            </Text>
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
                  {currentLead.contact_name && (
                    <HStack spacing={3}>
                      <InfoOutlineIcon color={colors.text.secondary} />
                      <Box>
                        <Text fontSize="sm" color={colors.text.muted}>Contact Name</Text>
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_name}
                        </Text>
                      </Box>
                    </HStack>
                  )}

                  {currentLead.contact_email && (
                    <HStack spacing={3}>
                      <EmailIcon color={colors.text.secondary} />
                      <Box>
                        <Text fontSize="sm" color={colors.text.muted}>Email</Text>
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_email}
                        </Text>
                      </Box>
                    </HStack>
                  )}

                  {currentLead.contact_phone && (
                    <HStack spacing={3}>
                      <PhoneIcon color={colors.text.secondary} />
                      <Box>
                        <Text fontSize="sm" color={colors.text.muted}>Phone</Text>
                        <Text fontWeight="medium" color={colors.text.primary}>
                          {currentLead.contact_phone}
                        </Text>
                      </Box>
                    </HStack>
                  )}
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
                    <Text fontSize="sm" color={colors.text.muted}>Description</Text>
                    <Text color={colors.text.primary}>
                      {currentLead.description || 'No description provided'}
                    </Text>
                  </Box>

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