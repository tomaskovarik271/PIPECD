import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  Select,
  Stack,
  Textarea,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Divider,
  Text,
  HStack,
  VStack,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Flex,
  Tag,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldEntityType,
  CreatePersonOrganizationalRoleInput,
  CreateStakeholderAnalysisInput,
} from '../generated/graphql/graphql';
import {
  SeniorityLevel,
  DecisionAuthority,
  EngagementLevel,
} from '../generated/graphql/graphql';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValuesFromEntity,
  processCustomFieldsForSubmission
} from '../lib/utils/customFieldProcessing';
import { gql, useQuery, useMutation } from '@apollo/client';

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

const CREATE_PERSON_ORG_ROLE_EDIT = gql`
  mutation CreatePersonOrgRoleEdit($input: CreatePersonOrganizationalRoleInput!) {
    createPersonOrganizationalRole(input: $input) {
      id
      roleTitle
      department
      seniorityLevel
      isPrimaryRole
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

const UPDATE_PERSON_ORG_ROLE = gql`
  mutation UpdatePersonOrgRole($id: ID!, $input: CreatePersonOrganizationalRoleInput!) {
    updatePersonOrganizationalRole(id: $id, input: $input) {
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

const DELETE_PERSON_ORGANIZATIONAL_ROLE_MUTATION = gql`
  mutation DeletePersonOrganizationalRole($id: ID!) {
    deletePersonOrganizationalRole(id: $id)
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

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrganizationalRoleData {
  roleTitle: string;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  budgetAuthorityUsd: number | '';
  teamSize: number | '';
  startDate: string;
  endDate: string;
  isPrimaryRole: boolean;
  notes: string;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<PersonInput>({
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    organization_id: person.organization_id,
    customFields: [],
  });
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [newRoleData, setNewRoleData] = useState<OrganizationalRoleData>({
    roleTitle: '',
    department: '',
    seniorityLevel: '',
    budgetAuthorityUsd: '',
    teamSize: '',
    startDate: '',
    endDate: '',
    isPrimaryRole: false,
    notes: '',
  });
  const toast = useToast();

  const { 
    organizations, 
    organizationsLoading: orgLoading, 
    organizationsError: orgError,
    fetchOrganizations 
  } = useOrganizationsStore();

  const { updatePerson: updatePersonAction, peopleError } = usePeopleStore();
  
  const [localError, setLocalError] = useState<string | null>(null);

  // GraphQL operations
  const { data: rolesData, loading: rolesLoading, refetch: refetchRoles } = useQuery(
    GET_PERSON_ORGANIZATIONAL_ROLES_QUERY,
    { variables: { personId: person.id } }
  );
  
  const [createRole] = useMutation(CREATE_PERSON_ORG_ROLE_EDIT);
  const [updateRole] = useMutation(UPDATE_PERSON_ORG_ROLE);
  const [deleteRole] = useMutation(DELETE_PERSON_ORGANIZATIONAL_ROLE_MUTATION);
  const [createStakeholderAnalysis] = useMutation(CREATE_STAKEHOLDER_ANALYSIS_MUTATION);

  // Use optimized custom fields hook
  const { 
    definitions, 
    loading: definitionsLoading, 
    error: definitionsError,
    getDefinitionsForEntity
  } = useOptimizedCustomFields({ entityTypes: useMemo(() => ['PERSON' as CustomFieldEntityType], []) });

  const personCustomFieldDefinitions = getDefinitionsForEntity('PERSON' as CustomFieldEntityType);

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
    if (Array.isArray(organizations) && !organizations.length && !orgLoading) {
      fetchOrganizations();
    }
  }, [organizations, orgLoading, fetchOrganizations]);

  useEffect(() => {
    setFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      notes: person.notes,
      organization_id: person.organization_id,
      customFields: [],
    });
    setLocalError(null);

    // Initialize custom field data using shared utility
    if (person && person.customFieldValues && personCustomFieldDefinitions.length > 0 && !definitionsLoading) {
      const initialCustomData = initializeCustomFieldValuesFromEntity(
        personCustomFieldDefinitions,
        person.customFieldValues
      );
      setCustomFieldData(initialCustomData);
    } else {
      setCustomFieldData({});
    }
  }, [person, person.customFieldValues, personCustomFieldDefinitions, definitionsLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === '') {
        setFormData(prev => ({ ...prev, [name]: null }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleNewRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewRoleData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const resetNewRoleData = () => {
    setNewRoleData({
      roleTitle: '',
      department: '',
      seniorityLevel: '',
      budgetAuthorityUsd: '',
      teamSize: '',
      startDate: '',
      endDate: '',
      isPrimaryRole: false,
      notes: '',
    });
  };

  const handleAddRole = async () => {
    if (!newRoleData.roleTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Role title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.organization_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select an organization for this person first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const roleInput: CreatePersonOrganizationalRoleInput = {
        personId: person.id,
        organizationId: formData.organization_id,
        roleTitle: newRoleData.roleTitle,
        department: newRoleData.department || undefined,
        seniorityLevel: newRoleData.seniorityLevel || undefined,
        budgetAuthorityUsd: typeof newRoleData.budgetAuthorityUsd === 'number' ? newRoleData.budgetAuthorityUsd : undefined,
        teamSize: typeof newRoleData.teamSize === 'number' ? newRoleData.teamSize : undefined,
        startDate: newRoleData.startDate || undefined,
        endDate: newRoleData.endDate || undefined,
        isPrimaryRole: newRoleData.isPrimaryRole,
        notes: newRoleData.notes || undefined,
      };

      await createRole({ variables: { input: roleInput } });
      await refetchRoles();
      
      toast({
        title: 'Role Added',
        description: 'Organizational role has been added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      resetNewRoleData();
      setShowAddRole(false);
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add organizational role',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole({ variables: { id: roleId } });
      await refetchRoles();
      
      toast({
        title: 'Role Deleted',
        description: 'Organizational role has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete organizational role',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Generate AI analysis for a specific role
  const generateAIAnalysisForRole = async (role: any) => {
    if (!person.organization_id) return;

    setAiLoading(true);
    try {
      // AI-powered analysis based on role data
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

      // Adjust based on budget authority
      if (role.budgetAuthorityUsd && role.budgetAuthorityUsd > 5000000) {
        influenceScore = Math.min(10, influenceScore + 1);
        if (decisionAuthority === DecisionAuthority.Recommender) decisionAuthority = DecisionAuthority.StrongInfluence;
      }

      // Adjust based on team size
      if (role.teamSize && role.teamSize > 50) {
        influenceScore = Math.min(10, influenceScore + 1);
      }

      const analysisInput: CreateStakeholderAnalysisInput = {
        personId: person.id,
        organizationId: person.organization_id,
        influenceScore,
        decisionAuthority,
        engagementLevel,
        approachStrategy,
        nextBestAction,
      };

      await createStakeholderAnalysis({ variables: { input: analysisInput } });
      
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
        description: 'Could not generate stakeholder analysis. You can create one manually later.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!formData.first_name && !formData.last_name && !formData.email) {
      setLocalError('Must have first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    // Process custom fields using shared utility
    try {
      const processedCustomFields = processCustomFieldsForSubmission(
        personCustomFieldDefinitions,
        customFieldData
      );

      const mutationInput: PersonInput = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        organization_id: formData.organization_id || null,
        customFields: processedCustomFields,
      };

      const updatedPerson = await updatePersonAction(person.id, mutationInput);

      if (updatedPerson) {
        toast({
          title: 'Person Updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
      } else {
        setLocalError(peopleError || 'Failed to update person. Please try again.');
        toast({ 
          title: 'Error', 
          description: peopleError || 'Failed to update person.', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
      }
    } catch (error: unknown) {
      console.error(`Failed to update person ${person.id}:`, error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      setLocalError(message);
      toast({ 
        title: 'Error', 
        description: message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const organizationalRoles = rolesData?.personOrganizationalRoles || [];

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody maxH="80vh" overflowY="auto">
        {(localError || peopleError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {localError || peopleError}
            </Alert>
          )}
        <Stack spacing={4}>
          {/* Basic Person Information */}
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">Person Information</Text>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>First Name</FormLabel>
            <Input name="first_name" value={formData.first_name || ''} onChange={handleChange} />
          </FormControl>
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Last Name</FormLabel>
            <Input name="last_name" value={formData.last_name || ''} onChange={handleChange} />
          </FormControl>
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            {!!localError && (!formData.first_name && !formData.last_name && !formData.email) && <FormErrorMessage>{localError}</FormErrorMessage>}
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Organization</FormLabel>
            {orgLoading && <Spinner size="sm" />}
            {orgError && (
                <Alert status="error" size="sm">
                    <AlertIcon />
                    {orgError}
                </Alert>
            )}
            {!orgLoading && !orgError && (
                <Select 
                    name="organization_id" 
                    value={formData.organization_id || ''} 
                    onChange={handleChange}
                    placeholder="Select organization (optional)"
                    isDisabled={!Array.isArray(organizations) || organizations.length === 0}
                >
                    {Array.isArray(organizations) && organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            )}
            {Array.isArray(organizations) && organizations.length === 0 && !orgLoading && <FormErrorMessage>No organizations found. Create one first.</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

          {/* Custom Fields Section */}
          {definitionsLoading && <Spinner />}
          {definitionsError && (
            <Alert status="error">
              <AlertIcon />
              Error loading custom fields: {definitionsError}
            </Alert>
          )}
          
          {!definitionsLoading && !definitionsError && personCustomFieldDefinitions.length > 0 && (
            <>
              {personCustomFieldDefinitions.map((def) => (
                <CustomFieldRenderer
                  key={def.id}
                  definition={def}
                  value={customFieldData[def.fieldName]}
                  onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
                  isRequired={def.isRequired}
                />
              ))}
            </>
          )}

          {/* Organizational Roles Section */}
          <Divider />
          
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Organizational Roles
              </Text>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={() => setShowAddRole(true)}
                isDisabled={!formData.organization_id}
              >
                Add Role
              </Button>
            </Flex>

            {!formData.organization_id && (
              <Alert status="info" size="sm" mb={4}>
                <AlertIcon />
                Select an organization to manage organizational roles
              </Alert>
            )}

            {rolesLoading && <Spinner size="sm" />}

            {organizationalRoles.length > 0 && (
              <VStack spacing={3} align="stretch" mb={4}>
                {organizationalRoles.map((role: any) => (
                  <Box
                    key={role.id}
                    p={4}
                    borderRadius="md"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="semibold" fontSize="md">
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
                        
                        <Text fontSize="sm" color="gray.600">
                          {role.organization.name}
                          {role.department && ` • ${role.department}`}
                        </Text>
                        
                        <HStack spacing={4} fontSize="sm" color="gray.600">
                          {role.budgetAuthorityUsd && (
                            <Text>Budget: ${role.budgetAuthorityUsd.toLocaleString()}</Text>
                          )}
                          {role.teamSize && (
                            <Text>Team: {role.teamSize}</Text>
                          )}
                          {role.startDate && (
                            <Text>Since: {new Date(role.startDate).toLocaleDateString()}</Text>
                          )}
                        </HStack>
                        
                        {role.notes && (
                          <Text fontSize="sm" color="gray.600" fontStyle="italic">
                            {role.notes}
                          </Text>
                        )}
                      </VStack>
                      
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => generateAIAnalysisForRole(role)}
                          isLoading={aiLoading}
                          loadingText="Analyzing..."
                        >
                          🤖 AI Analysis
                        </Button>
                        <IconButton
                          size="xs"
                          aria-label="Delete role"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role.id)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Add New Role Form */}
            {showAddRole && (
              <Box p={4} borderRadius="md" bg="blue.50" border="1px" borderColor="blue.200" mb={4}>
                <Stack spacing={4}>
                  <Text fontSize="md" fontWeight="semibold" color="blue.700">Add New Role</Text>
                  
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">Role Title</FormLabel>
                    <Input 
                      name="roleTitle" 
                      value={newRoleData.roleTitle} 
                      onChange={handleNewRoleChange}
                      placeholder="e.g., Chief Marketing Officer, Software Engineer"
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Department</FormLabel>
                      <Input 
                        name="department" 
                        value={newRoleData.department} 
                        onChange={handleNewRoleChange}
                        placeholder="e.g., Engineering, Sales, Marketing"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Seniority Level</FormLabel>
                      <Select
                        name="seniorityLevel"
                        value={newRoleData.seniorityLevel}
                        onChange={handleNewRoleChange}
                        placeholder="Select seniority"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      >
                        {seniorityLevels.map((level) => (
                          <option key={level.value} value={level.value} style={{ color: 'black' }}>
                            {level.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Budget Authority (USD)</FormLabel>
                      <NumberInput
                        value={newRoleData.budgetAuthorityUsd}
                        onChange={(value) => setNewRoleData(prev => ({ 
                          ...prev, 
                          budgetAuthorityUsd: value === '' ? '' : Number(value)
                        }))}
                      >
                        <NumberInputField 
                          placeholder="e.g., 1000000" 
                          bg="white"
                          color="gray.800"
                          borderColor="gray.300"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                        />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Team Size</FormLabel>
                      <NumberInput
                        value={newRoleData.teamSize}
                        onChange={(value) => setNewRoleData(prev => ({ 
                          ...prev, 
                          teamSize: value === '' ? '' : Number(value)
                        }))}
                      >
                        <NumberInputField 
                          placeholder="e.g., 12" 
                          bg="white"
                          color="gray.800"
                          borderColor="gray.300"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                        />
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Start Date</FormLabel>
                      <Input 
                        type="date"
                        name="startDate" 
                        value={newRoleData.startDate} 
                        onChange={handleNewRoleChange}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">End Date</FormLabel>
                      <Input 
                        type="date"
                        name="endDate" 
                        value={newRoleData.endDate} 
                        onChange={handleNewRoleChange}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Role Notes</FormLabel>
                    <Textarea 
                      name="notes" 
                      value={newRoleData.notes} 
                      onChange={handleNewRoleChange}
                      placeholder="Additional notes about this role..."
                      size="sm"
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />
                  </FormControl>

                  <Checkbox
                    isChecked={newRoleData.isPrimaryRole}
                    onChange={(e) => setNewRoleData(prev => ({ 
                      ...prev, 
                      isPrimaryRole: e.target.checked 
                    }))}
                    color="gray.700"
                    fontWeight="medium"
                  >
                    Primary Role
                  </Checkbox>

                  <HStack spacing={3}>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={handleAddRole}
                    >
                      Add Role
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddRole(false);
                        resetNewRoleData();
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button colorScheme="blue" type="submit" isLoading={isLoading}>
          Update Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default EditPersonForm; 