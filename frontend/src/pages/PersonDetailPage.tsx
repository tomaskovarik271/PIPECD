import React, { useEffect, useState } from 'react';
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
  Button,
  useToast,
  Badge,
  Tag,
  Divider,
  Grid,
  GridItem,
  SimpleGrid,
  Input,
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon, EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useAppStore } from '../stores/useAppStore';
import {
  EmailIcon,
  PhoneIcon,
  InfoOutlineIcon,
  TimeIcon,
  LinkIcon
} from '@chakra-ui/icons';
import { format, parseISO } from 'date-fns';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { gql, useQuery, useMutation } from '@apollo/client';
import type {
  CreateStakeholderAnalysisInput,
} from '../generated/graphql/graphql';
import {
  SeniorityLevel,
  DecisionAuthority,
  EngagementLevel,
} from '../generated/graphql/graphql';
import { StickerBoard } from '../components/common/StickerBoard';

const GET_PERSON_ORGANIZATIONAL_ROLES_QUERY = gql`
  query GetPersonOrganizationalRoles($personId: ID!) {
    personOrganizationalRoles(personId: $personId) {
      id
      roleTitle
      department
      seniorityLevel
      budgetAuthorityUsd
      teamSize
      startDate
      endDate
      isPrimaryRole
      notes
      organization {
        id
        name
      }
    }
  }
`;

const GET_STAKEHOLDER_ANALYSES_QUERY = gql`
  query GetStakeholderAnalyses($organizationId: ID!) {
    stakeholderAnalyses(organizationId: $organizationId) {
      id
      influenceScore
      decisionAuthority
      engagementLevel
      approachStrategy
      nextBestAction
      createdAt
      updatedAt
      person {
        id
        first_name
        last_name
      }
      organization {
        id
        name
      }
    }
  }
`;

const CREATE_STAKEHOLDER_ANALYSIS_MUTATION = gql`
  mutation CreateStakeholderAnalysis($input: CreateStakeholderAnalysisInput!) {
    createStakeholderAnalysis(input: $input) {
      id
      influenceScore
      decisionAuthority
      engagementLevel
      approachStrategy
      nextBestAction
    }
  }
`;

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

const PersonDetailPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const [aiLoading, setAiLoading] = useState(false);
  const toast = useToast();
  
  // Inline editing states
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [newLastName, setNewLastName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  
  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const fetchPersonById = usePeopleStore((state) => state.fetchPersonById);
  const updatePerson = usePeopleStore((state) => state.updatePerson);
  const currentPerson = usePeopleStore((state) => state.currentPerson);
  const isLoadingPerson = usePeopleStore((state) => state.isLoadingSinglePerson);
  const personError = usePeopleStore((state) => state.errorSinglePerson);
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Check if user can edit persons
  const canEditPerson = userPermissions?.includes('person:update_any');

  // GraphQL queries for additional data
  const { data: rolesData, loading: rolesLoading } = useQuery(
    GET_PERSON_ORGANIZATIONAL_ROLES_QUERY,
    { 
      variables: { personId: personId! },
      skip: !personId
    }
  );

  const { data: analysesData, loading: analysesLoading, refetch: refetchAnalyses } = useQuery(
    GET_STAKEHOLDER_ANALYSES_QUERY,
    { 
      variables: { organizationId: currentPerson?.organization_id! },
      skip: !currentPerson?.organization_id
    }
  );

  const [createStakeholderAnalysis] = useMutation(CREATE_STAKEHOLDER_ANALYSIS_MUTATION);

  const seniorityLevels: { value: SeniorityLevel; label: string }[] = [
    { value: SeniorityLevel.Entry, label: 'Entry Level' },
    { value: SeniorityLevel.Mid, label: 'Mid Level' },
    { value: SeniorityLevel.Senior, label: 'Senior' },
    { value: SeniorityLevel.Lead, label: 'Lead' },
    { value: SeniorityLevel.Manager, label: 'Manager' },
    { value: SeniorityLevel.Director, label: 'Director' },
    { value: SeniorityLevel.Vp, label: 'VP' },
    { value: SeniorityLevel.CLevel, label: 'C-Level' },
    { value: SeniorityLevel.Founder, label: 'Founder' },
  ];

  useEffect(() => {
    if (personId && fetchPersonById) {
      fetchPersonById(personId);
    }
  }, [personId, fetchPersonById]);

  // Update handlers for inline editing
  const handleFirstNameUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { first_name: newFirstName });
      toast({ title: 'First Name Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingFirstName(false);
      fetchPersonById(personId); // Refresh data
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to update this person.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: 'Error Updating First Name', description: errorMessage, status: 'error', duration: 3000, isClosable: true });
      }
      setIsEditingFirstName(false);
    }
  };

  const handleLastNameUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { last_name: newLastName });
      toast({ title: 'Last Name Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingLastName(false);
      fetchPersonById(personId);
    } catch (e) {
      toast({ title: 'Error Updating Last Name', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEmailUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { email: newEmail });
      toast({ title: 'Email Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingEmail(false);
      fetchPersonById(personId);
    } catch (e) {
      toast({ title: 'Error Updating Email', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handlePhoneUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { phone: newPhone });
      toast({ title: 'Phone Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingPhone(false);
      fetchPersonById(personId);
    } catch (e) {
      toast({ title: 'Error Updating Phone', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };



  // Generate AI analysis for a specific role
  const generateAIAnalysisForRole = async (role: any) => {
    if (!currentPerson?.organization_id) return;

    setAiLoading(true);
    try {
      let influenceScore = 5;
      let decisionAuthority: DecisionAuthority = DecisionAuthority.Influencer;
      let engagementLevel: EngagementLevel = EngagementLevel.Neutral;
      let approachStrategy = '';
      let nextBestAction = '';

      // AI logic based on seniority and role
      switch (role.seniorityLevel) {
        case SeniorityLevel.CLevel:
        case SeniorityLevel.Founder:
          influenceScore = 9;
          decisionAuthority = DecisionAuthority.FinalDecision;
          engagementLevel = EngagementLevel.Supporter;
          approachStrategy = 'Strategic executive briefing focusing on business transformation and ROI';
          nextBestAction = 'Schedule C-level presentation with board metrics and competitive analysis';
          break;
        case SeniorityLevel.Vp:
          influenceScore = 8;
          decisionAuthority = DecisionAuthority.StrongInfluence;
          engagementLevel = EngagementLevel.Supporter;
          approachStrategy = 'Executive-level discussion with strategic value proposition';
          nextBestAction = 'Arrange strategic partnership discussion';
          break;
        case SeniorityLevel.Director:
          influenceScore = 7;
          decisionAuthority = DecisionAuthority.StrongInfluence;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'Department-focused presentation with operational benefits';
          nextBestAction = 'Schedule departmental needs assessment';
          break;
        case SeniorityLevel.Manager:
        case SeniorityLevel.Lead:
          influenceScore = 6;
          decisionAuthority = DecisionAuthority.Recommender;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'Team-focused benefits and workflow improvement discussion';
          nextBestAction = 'Conduct team productivity analysis';
          break;
        default:
          influenceScore = 4;
          decisionAuthority = DecisionAuthority.Influencer;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'User-focused demonstration and training approach';
          nextBestAction = 'Schedule hands-on product demonstration';
      }

      if (role.budgetAuthorityUsd && role.budgetAuthorityUsd > 5000000) {
        influenceScore = Math.min(10, influenceScore + 1);
        if (decisionAuthority === DecisionAuthority.Recommender) decisionAuthority = DecisionAuthority.StrongInfluence;
      }

      if (role.teamSize && role.teamSize > 50) {
        influenceScore = Math.min(10, influenceScore + 1);
      }

      const analysisInput: CreateStakeholderAnalysisInput = {
        personId: currentPerson.id,
        organizationId: currentPerson.organization_id,
        influenceScore,
        decisionAuthority,
        engagementLevel,
        approachStrategy,
        nextBestAction,
      };

      await createStakeholderAnalysis({ variables: { input: analysisInput } });
      await refetchAnalyses();
      
      toast({
        title: 'AI Analysis Generated',
        description: `Stakeholder analysis has been created for ${role.roleTitle}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate stakeholder analysis.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const organizationalRoles = rolesData?.personOrganizationalRoles || [];
  const stakeholderAnalyses = analysesData?.stakeholderAnalyses || [];

  const getAuthorityColor = (authority: string) => {
    switch (authority) {
      case 'FINAL_DECISION': return 'red';
      case 'STRONG_INFLUENCE': return 'orange';
      case 'RECOMMENDER': return 'yellow';
      case 'INFLUENCER': return 'blue';
      case 'GATEKEEPER': return 'purple';
      case 'END_USER': return 'green';
      case 'BLOCKER': return 'gray';
      default: return 'gray';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'CHAMPION': return 'green';
      case 'SUPPORTER': return 'blue';
      case 'NEUTRAL': return 'gray';
      case 'SKEPTIC': return 'yellow';
      case 'BLOCKER': return 'red';
      default: return 'gray';
    }
  };

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
      bg={colors.bg.app}
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
        overflowY="auto"
        p={{base: 4, md: 8}}
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: colors.border.subtle, borderRadius: '8px' },
            '&::-webkit-scrollbar-track': { background: colors.bg.input },
        }}
      >
        {isLoadingPerson && (
          <Center h="full">
            <Spinner 
              size="xl" 
              color={colors.interactive.default}
            />
          </Center>
        )}
        
        {personError && (
          <Alert 
            status="error" 
            variant="subtle" 
            borderRadius="lg" 
            bg={colors.status.error}
            color={colors.text.onAccent}
            mt={4}
          >
            <AlertIcon color={colors.text.onAccent} />
            <AlertTitle>Error Loading Person!</AlertTitle>
            <AlertDescription>
              {typeof personError === 'string' ? personError : JSON.stringify(personError)}
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoadingPerson && !personError && currentPerson && (
          <VStack spacing={6} align="stretch">
            {/* Header: Breadcrumbs, Title */}
            <Box 
              pb={4} 
              borderBottomWidth="1px" 
              borderColor={colors.border.default}
              mb={2}
            >
              <Breadcrumb 
                spacing="8px" 
                separator={<Text color={colors.text.muted}>/</Text>}
                color={colors.text.muted}
                fontSize="sm"
              >
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={RouterLink} 
                    to="/people" 
                    color={colors.text.link}
                    _hover={{textDecoration: 'underline'}}
                  >
                    People
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink 
                    href="#" 
                    color={colors.text.secondary}
                    _hover={{textDecoration: 'none', cursor: 'default'}}
                  >
                    {currentPerson.first_name} {currentPerson.last_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading 
                size="xl" 
                color={colors.text.primary}
                mt={2}
              >
                {currentPerson.first_name} {currentPerson.last_name}
              </Heading>
            </Box>

            <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
              {/* Person Details Card */}
              <GridItem>
                <Box 
                  bg={colors.bg.elevated}
                  p={6} 
                  borderRadius="xl" 
                  borderWidth="1px" 
                  borderColor={colors.border.default}
                  h="fit-content"
                >
                  <Heading 
                    size="md" 
                    mb={5} 
                    color={colors.text.primary}
                  >
                    Contact Information
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    {/* First Name Field */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color={colors.text.muted}>First Name</Text>
                      {!isEditingFirstName ? (
                        <HStack spacing={2}>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium" 
                            color={colors.text.secondary}
                          >
                            {currentPerson.first_name || '-'}
                          </Text>
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit First Name" 
                            onClick={() => {
                              setIsEditingFirstName(true);
                              setNewFirstName(currentPerson.first_name || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditPerson}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={2} flex={1} justifyContent="flex-end">
                          <Input 
                            value={newFirstName} 
                            onChange={(e) => setNewFirstName(e.target.value)} 
                            placeholder="Enter first name" 
                            size="sm" 
                            w="160px"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save First Name" 
                            onClick={handleFirstNameUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit First Name" 
                            onClick={() => setIsEditingFirstName(false)}
                          />
                        </HStack>
                      )}
                    </HStack>

                    {/* Last Name Field */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color={colors.text.muted}>Last Name</Text>
                      {!isEditingLastName ? (
                        <HStack spacing={2}>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium" 
                            color={colors.text.secondary}
                          >
                            {currentPerson.last_name || '-'}
                          </Text>
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Last Name" 
                            onClick={() => {
                              setIsEditingLastName(true);
                              setNewLastName(currentPerson.last_name || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditPerson}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={2} flex={1} justifyContent="flex-end">
                          <Input 
                            value={newLastName} 
                            onChange={(e) => setNewLastName(e.target.value)} 
                            placeholder="Enter last name" 
                            size="sm" 
                            w="160px"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Last Name" 
                            onClick={handleLastNameUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Last Name" 
                            onClick={() => setIsEditingLastName(false)}
                          />
                        </HStack>
                      )}
                    </HStack>

                    {/* Email Field */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color={colors.text.muted}>Email</Text>
                      {!isEditingEmail ? (
                        <HStack spacing={2}>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium" 
                            color={colors.text.link}
                          >
                            {currentPerson.email || '-'}
                          </Text>
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Email" 
                            onClick={() => {
                              setIsEditingEmail(true);
                              setNewEmail(currentPerson.email || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditPerson}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={2} flex={1} justifyContent="flex-end">
                          <Input 
                            type="email"
                            value={newEmail} 
                            onChange={(e) => setNewEmail(e.target.value)} 
                            placeholder="Enter email" 
                            size="sm" 
                            w="200px"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Email" 
                            onClick={handleEmailUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Email" 
                            onClick={() => setIsEditingEmail(false)}
                          />
                        </HStack>
                      )}
                    </HStack>

                    {/* Phone Field */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" color={colors.text.muted}>Phone</Text>
                      {!isEditingPhone ? (
                        <HStack spacing={2}>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium" 
                            color={colors.text.secondary}
                          >
                            {currentPerson.phone || '-'}
                          </Text>
                          <IconButton 
                            icon={<EditIcon />} 
                            size="xs" 
                            variant="ghost" 
                            aria-label="Edit Phone" 
                            onClick={() => {
                              setIsEditingPhone(true);
                              setNewPhone(currentPerson.phone || '');
                            }}
                            color={colors.text.muted}
                            _hover={{color: colors.text.link}}
                            isDisabled={!canEditPerson}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={2} flex={1} justifyContent="flex-end">
                          <Input 
                            type="tel"
                            value={newPhone} 
                            onChange={(e) => setNewPhone(e.target.value)} 
                            placeholder="Enter phone number" 
                            size="sm" 
                            w="180px"
                            bg={colors.bg.input}
                            borderColor={colors.border.default}
                            _hover={{borderColor: colors.border.emphasis}}
                            _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                          />
                          <IconButton 
                            icon={<CheckIcon />} 
                            size="xs" 
                            colorScheme="green" 
                            aria-label="Save Phone" 
                            onClick={handlePhoneUpdate}
                          />
                          <IconButton 
                            icon={<SmallCloseIcon />} 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="red" 
                            aria-label="Cancel Edit Phone" 
                            onClick={() => setIsEditingPhone(false)}
                          />
                        </HStack>
                      )}
                    </HStack>

                    {/* Organization Field - Read Only for now */}
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={colors.text.muted}>Organization</Text>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium" 
                        color={colors.text.secondary}
                      >
                        {currentPerson.organization?.name || '-'}
                      </Text>
                    </HStack>


                  </VStack>
                </Box>
              </GridItem>

              {/* Organizational Roles Card */}
              <GridItem>
                <Box 
                  bg={colors.bg.elevated}
                  p={6} 
                  borderRadius="xl" 
                  borderWidth="1px" 
                  borderColor={colors.border.default}
                  h="fit-content"
                >
                  <Heading 
                    size="md" 
                    mb={5} 
                    color={colors.text.primary}
                  >
                    Organizational Roles
                  </Heading>
                  
                  {rolesLoading && <Spinner size="sm" />}
                  
                  {organizationalRoles.length === 0 && !rolesLoading && (
                    <Text color={colors.text.muted} fontSize="sm" fontStyle="italic">
                      No organizational roles found
                    </Text>
                  )}

                  <VStack spacing={4} align="stretch">
                    {organizationalRoles.map((role: any) => (
                      <Box
                        key={role.id}
                        p={4}
                        borderRadius="md"
                        bg={colors.bg.input}
                        border="1px"
                        borderColor={colors.border.subtle}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack spacing={2} wrap="wrap">
                            <Text fontWeight="semibold" fontSize="md" color={colors.text.primary}>
                              {role.roleTitle}
                            </Text>
                            {role.isPrimaryRole && (
                              <Badge colorScheme="blue" size="sm">Primary</Badge>
                            )}
                            {role.seniorityLevel && (
                              <Tag size="sm" colorScheme="purple">
                                {seniorityLevels.find(l => l.value === role.seniorityLevel)?.label || role.seniorityLevel}
                              </Tag>
                            )}
                          </HStack>
                          
                          <Text fontSize="sm" color={colors.text.muted}>
                            {role.organization.name}
                            {role.department && ` • ${role.department}`}
                          </Text>
                          
                          <SimpleGrid columns={2} spacing={2} fontSize="xs" color={colors.text.muted} w="full">
                            {role.budgetAuthorityUsd && (
                              <Text>Budget: ${role.budgetAuthorityUsd.toLocaleString()}</Text>
                            )}
                            {role.teamSize && (
                              <Text>Team: {role.teamSize} people</Text>
                            )}
                            {role.startDate && (
                              <Text>Since: {new Date(role.startDate).toLocaleDateString()}</Text>
                            )}
                            {role.endDate && (
                              <Text>Until: {new Date(role.endDate).toLocaleDateString()}</Text>
                            )}
                          </SimpleGrid>
                          
                          {role.notes && (
                            <Text fontSize="xs" color={colors.text.muted} fontStyle="italic">
                              {role.notes}
                            </Text>
                          )}

                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => generateAIAnalysisForRole(role)}
                            isLoading={aiLoading}
                            loadingText="Analyzing..."
                            alignSelf="flex-end"
                          >
                            🤖 Generate AI Analysis
                          </Button>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </GridItem>
            </Grid>

            {/* Stakeholder Analysis Section - Full Width */}
            {stakeholderAnalyses.length > 0 && (
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
                  🤖 AI Stakeholder Analysis
                </Heading>
                
                {analysesLoading && <Spinner size="sm" />}

                <VStack spacing={4} align="stretch">
                  {stakeholderAnalyses.map((analysis: any) => (
                    <Box
                      key={analysis.id}
                      p={5}
                      borderRadius="lg"
                      bg={colors.bg.input}
                      border="1px"
                      borderColor={colors.border.subtle}
                    >
                      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={4}>
                        <Box>
                          <Text fontSize="sm" color={colors.text.muted} mb={1}>Influence Score</Text>
                          <HStack>
                            <Text fontSize="2xl" fontWeight="bold" color={colors.text.primary}>
                              {analysis.influenceScore}
                            </Text>
                            <Text fontSize="sm" color={colors.text.muted}>/10</Text>
                          </HStack>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color={colors.text.muted} mb={1}>Decision Authority</Text>
                          <Tag 
                            size="sm" 
                            colorScheme={getAuthorityColor(analysis.decisionAuthority)}
                          >
                            {analysis.decisionAuthority.replace('_', ' ')}
                          </Tag>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color={colors.text.muted} mb={1}>Engagement Level</Text>
                          <Tag 
                            size="sm" 
                            colorScheme={getEngagementColor(analysis.engagementLevel)}
                          >
                            {analysis.engagementLevel}
                          </Tag>
                        </Box>

                        <Box>
                          <Text fontSize="sm" color={colors.text.muted} mb={1}>Organization</Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {analysis.organization?.name || 'N/A'}
                          </Text>
                        </Box>
                      </Grid>

                      <Divider mb={4} />

                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color={colors.text.primary} mb={2}>
                            🎯 Approach Strategy
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {analysis.approachStrategy}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color={colors.text.primary} mb={2}>
                            ⚡ Next Best Action
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {analysis.nextBestAction}
                          </Text>
                        </Box>

                        <HStack justify="space-between" fontSize="xs" color={colors.text.muted}>
                          <Text>
                            Created: {new Date(analysis.createdAt).toLocaleString()}
                          </Text>
                          <Text>
                            Updated: {new Date(analysis.updatedAt).toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
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
                entityType="PERSON"
                entityId={currentPerson.id}
              />
            </Box>
          </VStack>
        )}
        
        {!currentPerson && !isLoadingPerson && !personError && (
           <Center h="full" flexDirection="column">
             <Box 
               bg={colors.bg.elevated}
               borderRadius="xl" 
               p={8}
               borderWidth="1px"
               borderColor={colors.border.default}
               textAlign="center"
             >
               <Icon 
                 as={WarningIcon} 
                 w={8} 
                 h={8} 
                 color={colors.status.warning}
                 mb={4} 
               />
               <Text color={colors.text.secondary} fontSize="lg" mb={6}>
                 Person not found.
               </Text>
               <IconButton 
                 as={RouterLink} 
                 to="/people" 
                 aria-label="Back to People" 
                 icon={<ArrowBackIcon />} 
                 {...styles.button.primary}
               />
             </Box>
           </Center>
        )}
      </Box>
    </Box>
  );
};

export default PersonDetailPage; 